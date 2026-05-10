// danger.js — aggression meter, danger tiers, rest, jump scares, death
"use strict";

// --- Intertitle card system ---
// Shows a full-screen Gothic card for ~4s. Non-blocking but pauses narration visually.
const _shownIntertitles = new Set();
function showIntertitle(prefix, body, opts) {
  opts = opts || {};
  // Don't repeat one-shot cards unless forced
  if (opts.once) {
    if (_shownIntertitles.has(opts.once)) return;
    _shownIntertitles.add(opts.once);
  }
  const el = document.getElementById("intertitle");
  if (!el) return;
  document.getElementById("intertitle-prefix").textContent = prefix || "";
  document.getElementById("intertitle-body").innerHTML = body || "";
  el.classList.remove("hidden");
  // Kick the animation by re-triggering
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
  if (typeof audio !== "undefined" && audio.sfx) audio.sfx("chime");
  if (typeof tts !== "undefined") tts.speak((prefix ? prefix + ". " : "") + (body || ""));
  // Scale duration by content length so long cards are readable.
  // ~50ms/char, clamped 4000-9000.
  const textLen = (prefix || "").length + (body || "").replace(/<[^>]+>/g, "").length;
  const hold = Math.max(4000, Math.min(9000, 3000 + textLen * 35));
  setTimeout(() => el.classList.add("hidden"), hold);
}

// Chapter cards: fire as time crosses key thresholds.
const CHAPTERS = [
  { atMinutes: 24 * 60 + 0,   prefix: "THE FIRST HOUR AFTER MIDNIGHT",
    body: "<em>in which the investigator hears a sound that ought not to be a sound.</em>" },
  { atMinutes: 24 * 60 + 120, prefix: "THE SECOND HOUR",
    body: "<em>in which the house begins to decide.</em>" },
  { atMinutes: 24 * 60 + 180, prefix: "THE HOUR OF THE WOLF",
    body: "<em>in which provocation may prove unwise.</em>" },
  { atMinutes: 24 * 60 + 240, prefix: "THE FOURTH HOUR",
    body: "<em>in which the investigator, if still breathing, reflects upon the morning to come.</em>" }
];
function checkChapterCard() {
  for (const c of CHAPTERS) {
    if (state.timeMinutes >= c.atMinutes && !_shownIntertitles.has("chapter:" + c.atMinutes)) {
      showIntertitle(c.prefix, c.body, { once: "chapter:" + c.atMinutes });
      return;
    }
  }
}

// Tier thresholds
const DANGER_TIERS = [
  { max: 3, label: "— QUIET —",            cls: "tier-1", intro: "The house is still." },
  { max: 6, label: "— WATCHING —",         cls: "tier-2", intro: "You feel eyes on you." },
  { max: 8, label: "— CLOSE —",            cls: "tier-3", intro: "Something moved. Near. You didn't imagine it." },
  { max: 99, label: "— IN THE ROOM —",     cls: "tier-4", intro: "Whatever it is, it is here." }
];

function getTier() {
  const a = state.aggression || 0;
  for (const t of DANGER_TIERS) if (a <= t.max) return t;
  return DANGER_TIERS[DANGER_TIERS.length - 1];
}

let lastTierIndex = 0;
function renderDanger() {
  const el = document.getElementById("hud-danger");
  if (!el) return;
  const t = getTier();
  const labelEl = document.getElementById("hud-danger-label");
  const meterEl = document.getElementById("hud-danger-meter");
  if (labelEl) labelEl.textContent = t.label;
  el.className = "";
  el.classList.add(t.cls);
  const a = state.aggression || 0;
  el.title = `Aggression: ${a} / 10 — each notch is 1 point. Tier: ${t.label.replace(/—/g, "").trim()}`;
  // Meter: 10 notches, lit to current aggression value (clamped to 10).
  if (meterEl) {
    const lit = Math.max(0, Math.min(10, a));
    let html = "";
    for (let i = 1; i <= 10; i++) {
      html += `<span class="notch${i <= lit ? " on" : ""}"></span>`;
    }
    meterEl.innerHTML = html;
  }
  const idx = DANGER_TIERS.indexOf(t);
  if (idx > lastTierIndex && state.calderLeft) {
    narrate("[" + t.intro + "]");
  }
  // First-time-tier intertitles
  if (idx > lastTierIndex && state.calderLeft) {
    if (idx === 2) {
      showIntertitle("A QUESTION OF PROXIMITY",
        "<em>The house has formed, one regrets to note, an opinion. And the opinion concerns you.</em>",
        { once: "tier_close" });
    } else if (idx === 3) {
      showIntertitle("IN THE ROOM WITH YOU",
        "<em>Matters have progressed. Further provocation is, with all respect, not advised.</em>",
        { once: "tier_in_room" });
    }
  }
  lastTierIndex = idx;
  const hv = document.getElementById("heartbeat-vignette");
  if (hv) {
    hv.className = "";
    if (idx >= 1) hv.classList.add(t.cls);
  }
}

// --- Ambient disturbance ticker ---
// Fires a random eerie sound every 20-40s once Calder is gone.
// Frequency and type depend on truth + aggression.
let ambientTickerId = null;
let heartbeatTickerId = null;

const DISTURBANCES = {
  haunted: [
    { sfx: "distant_bang", text: "<em>Somewhere above, a door declares itself — and then, reconsidering, is silent again.</em>" },
    { sfx: "whisper",      text: "<em>A whisper moves, unhurried, through the plaster beside you.</em>" },
    { sfx: "music_box",    text: "<em>A music-box, somewhere above, begins a phrase it does not finish.</em>" },
    { sfx: "knock",        text: "<em>Three knocks, from a room which ought to be empty, and which is.</em>" },
    { sfx: "breath",       text: "<em>The floorboards, beneath your feet, draw a breath.</em>" },
    { sfx: "chime",        text: "<em>A clear, single chime — though no clock in this house has struck since 1974.</em>" }
  ],
  partial: [
    { sfx: "distant_bang", text: "<em>Something falls in a further room. A book, you tell yourself, firmly.</em>" },
    { sfx: "breath",       text: "<em>The pipes in the walls groan, as pipes do, mostly.</em>" },
    { sfx: "music_box",    text: "<em>You believe you heard music. It is very possible that you did not.</em>" }
  ],
  debunked: [
    { sfx: "distant_bang", text: "<em>The house settles — old wood accommodating, as it always has, the passage of an hour.</em>" },
    { sfx: "breath",       text: "<em>A draft. Nothing more theatrical than a draft.</em>" },
    { sfx: "chime",        text: "<em>Glass shifts in its leaded frame — a common sound in a house of this age.</em>" }
  ]
};

function startAmbientTicker() {
  stopAmbientTicker();
  function scheduleNext() {
    if (!state.calderLeft || state.endDialog) return;
    const tier = DANGER_TIERS.indexOf(getTier());
    const postMidnight = state.timeMinutes >= 24 * 60;
    const post2AM  = state.timeMinutes >= 24 * 60 + 120;
    const post3AM  = state.timeMinutes >= 24 * 60 + 180;
    const post4AM  = state.timeMinutes >= 24 * 60 + 240;
    // Accelerating arc: each threshold ~halves the interval
    let base = 30000 - tier * 5000 + Math.random() * 15000;
    if (post2AM)  base *= 0.55;  // 2 AM: ~roughly doubled frequency
    if (post3AM)  base *= 0.7;   // 3 AM: another 30% tighter
    if (post4AM && state._elizaChoice !== "yes") base *= 0.6;
    ambientTickerId = setTimeout(() => {
      fireDisturbance();
      scheduleNext();
    }, Math.max(5000, base));
  }
  scheduleNext();
}

// Late-night ambient effect ticker — cursor drift + lights-out flashes
// on Haunted/Partial runs. Dormant until 3 AM.
let _lateEffectsId = null;
function startLateEffectsTicker() {
  stopLateEffectsTicker();
  function tick() {
    if (!state.calderLeft || state.endDialog) { _lateEffectsId = setTimeout(tick, 8000); return; }
    const post3AM = state.timeMinutes >= 24 * 60 + 180;
    const post4AM = state.timeMinutes >= 24 * 60 + 240;
    if (!post3AM || state.truth === "debunked" || state._elizaProtected) {
      _lateEffectsId = setTimeout(tick, 10000);
      return;
    }
    const chance = post4AM ? 0.35 : 0.18;
    if (Math.random() < chance && !document.body.classList.contains("reduce-motion")) {
      // Random effect: lights-out flicker OR cursor jitter OR double-flash
      const roll = Math.random();
      if (roll < 0.45) {
        // Brief lights-out — quick black flash over the game area
        const flash = document.createElement("div");
        flash.className = "lights-out";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 280);
        audio.sfx("distant_bang");
      } else if (roll < 0.75) {
        // Double vignette pulse (no narration, just sensory)
        document.body.classList.add("vig-pulse");
        setTimeout(() => document.body.classList.remove("vig-pulse"), 900);
      } else {
        // Brief screen shake + breath
        document.body.classList.add("screen-shake");
        setTimeout(() => document.body.classList.remove("screen-shake"), 400);
        audio.sfx("breath");
      }
    }
    _lateEffectsId = setTimeout(tick, 12000 + Math.random() * 8000);
  }
  tick();
}
function stopLateEffectsTicker() { if (_lateEffectsId) clearTimeout(_lateEffectsId); _lateEffectsId = null; }

// --- Max-aggression lethal ticker ---
// Tier 4 (IN THE ROOM) now has real consequences beyond a red vignette.
// Every 15-25s at 9+ aggression on Haunted runs, fire an escalating event.
// After 3 such events without the player fleeing / resting, kill them.
let _maxAggId = null;
let _maxAggTicks = 0;
function startMaxAggTicker() {
  stopMaxAggTicker();
  function tick() {
    if (!state.calderLeft || state.endDialog) { _maxAggId = setTimeout(tick, 10000); return; }
    const tier = DANGER_TIERS.indexOf(getTier());
    if (tier < 3) {
      _maxAggTicks = 0;
      _maxAggId = setTimeout(tick, 8000);
      return;
    }
    _maxAggTicks++;
    const roomName = ROOMS[state.currentRoom]?.name || state.currentRoom;
    // Escalation:
    //   tick 1: forced figure-sighting narration + screen shake + whisper
    //   tick 2: chair/door moves + full lights-out flash
    //   tick 3: hard shake + loud bang + last warning
    //   tick 4+: KILL on haunted, near-miss on partial, nothing on debunked
    if (_maxAggTicks === 1) {
      narrate("<em>Something is standing behind you in the " + roomName + ". You know this without turning.</em>");
      if (!document.body.classList.contains("reduce-motion")) {
        document.body.classList.add("screen-shake");
        setTimeout(() => document.body.classList.remove("screen-shake"), 500);
      }
      audio.sfx("whisper");
    } else if (_maxAggTicks === 2) {
      narrate("<em>The temperature collapses. Your breath is a cloud. A door, somewhere close, slams and is still.</em>");
      audio.sfx("jolt");
      if (!document.body.classList.contains("reduce-motion")) {
        const flash = document.createElement("div");
        flash.className = "lights-out";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
      }
    } else if (_maxAggTicks === 3) {
      narrate("<em>[Last warning]: Leave this room. Rest. Or it will finish what it began.</em>");
      audio.sfx("kii_alarm");
      if (!document.body.classList.contains("reduce-motion")) {
        document.body.classList.add("hard-shake");
        setTimeout(() => document.body.classList.remove("hard-shake"), 900);
      }
    } else if (_maxAggTicks >= 4) {
      if (state.truth === "haunted") {
        killPlayer("You stood still at maximum aggression for too long. The house finished what it began.");
        return;
      } else if (state.truth === "partial") {
        narrate("<em>Your vision greys. Your knees buckle. When you stand again, the meter has dropped. You do not know why you are still here.</em>");
        state.aggression = 5; renderDanger(); _maxAggTicks = 0;
      } else {
        narrate("<em>A panic attack. Nothing more. You sit until it passes. The meter settles.</em>");
        state.aggression = 2; renderDanger(); _maxAggTicks = 0;
      }
    }
    _maxAggId = setTimeout(tick, 15000 + Math.random() * 10000);
  }
  tick();
}
function stopMaxAggTicker() { if (_maxAggId) clearTimeout(_maxAggId); _maxAggId = null; _maxAggTicks = 0; }

// --- Ambient tremor ticker ---
// Random screen shakes + audio startles that build low-level anxiety.
// Intensity scales with aggression and truth state. Debunked gets rare
// micro-shakes only (drafts, the house settling).
let _tremorId = null;
function startTremorTicker() {
  stopTremorTicker();
  function tick() {
    if (!state.calderLeft || state.endDialog) { _tremorId = setTimeout(tick, 20000); return; }
    if (document.body.classList.contains("reduce-motion")) { _tremorId = setTimeout(tick, 40000); return; }
    const tier = DANGER_TIERS.indexOf(getTier());
    const haunted = state.truth === "haunted";
    const partial = state.truth === "partial";
    // Roll the nature of the tremor
    const roll = Math.random();
    if (haunted && tier >= 3 && roll < 0.35) {
      // Hard shake — actual danger beat
      document.body.classList.add("hard-shake");
      setTimeout(() => document.body.classList.remove("hard-shake"), 900);
      audio.sfx("distant_bang");
    } else if (haunted && tier >= 2 && roll < 0.5) {
      // Full screen shake
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 500);
      if (Math.random() < 0.5) audio.sfx("breath");
    } else if ((haunted || partial) && roll < 0.55) {
      // Subtle tremor — barely-there, the house "breathing"
      document.body.classList.add("micro-shake");
      setTimeout(() => document.body.classList.remove("micro-shake"), 420);
    } else {
      // No visible tremor this tick. But sometimes: an unprompted audio startle.
      if (roll < 0.75 && state.truth !== "debunked") {
        // Higher tiers get the harsher jolt; lower tiers still use subtler sfx.
        const tier2 = DANGER_TIERS.indexOf(getTier());
        const startles = tier2 >= 2
          ? ["jolt", "jolt", "whisper", "knock", "distant_bang"]
          : ["distant_bang", "whisper", "breath", "knock"];
        audio.sfx(startles[Math.floor(Math.random() * startles.length)]);
      } else if (state.truth === "debunked" && roll < 0.3) {
        // Debunked still gets a rare settling sound
        audio.sfx("distant_bang");
      }
    }
    // Interval scales with tier: tighter window as danger rises
    const base = tier >= 3 ? 18000 : tier >= 2 ? 28000 : tier >= 1 ? 38000 : 55000;
    _tremorId = setTimeout(tick, base + Math.random() * 12000);
  }
  // First tick fires fairly soon so the player feels it early
  _tremorId = setTimeout(tick, 15000 + Math.random() * 20000);
}
function stopTremorTicker() { if (_tremorId) clearTimeout(_tremorId); _tremorId = null; }
function stopAmbientTicker() { if (ambientTickerId) clearTimeout(ambientTickerId); ambientTickerId = null; }

function fireDisturbance() {
  if (!state.calderLeft || state.endDialog) return;
  const pool = DISTURBANCES[state.truth] || DISTURBANCES.debunked;
  const d = pool[Math.floor(Math.random() * pool.length)];
  audio.sfx(d.sfx);
  narrate("[" + d.text + "]");
}

function startHeartbeatTicker() {
  stopHeartbeatTicker();
  function tick() {
    if (!state.calderLeft || state.endDialog) return;
    const tier = DANGER_TIERS.indexOf(getTier());
    if (tier >= 2) audio.sfx("heartbeat");
    const interval = tier >= 3 ? 900 : tier >= 2 ? 1400 : 0;
    if (interval > 0) heartbeatTickerId = setTimeout(tick, interval);
    else heartbeatTickerId = setTimeout(tick, 2500);
  }
  tick();
}
function stopHeartbeatTicker() { if (heartbeatTickerId) clearTimeout(heartbeatTickerId); heartbeatTickerId = null; }

function bumpAggression(n, reason) {
  if (!state.calderLeft) return;
  state.aggression = Math.max(0, (state.aggression || 0) + n);
  if (state.aggression >= 9) state._everMaxAgg = true;
  renderDanger();
  if (reason && n >= 2) narrate(`[Aggression rises: ${reason}]`);
  maybeFireScare();
}

function relaxAggression(n) {
  state.aggression = Math.max(0, (state.aggression || 0) - n);
  renderDanger();
  // If we've dropped out of tier 4, reset the lethal escalation counter.
  if ((state.aggression || 0) < 9 && typeof _maxAggTicks !== "undefined") {
    _maxAggTicks = 0;
  }
}

// Per-room time tracking — staying too long raises aggression
state._roomTimeStart = 0;
state._lastRestAt = 19 * 60;
function onRoomEnter() {
  state._roomTimeStart = state.timeMinutes;
}
function checkStaleRoom() {
  if (!state.calderLeft) return;
  const stayed = state.timeMinutes - state._roomTimeStart;
  if (stayed >= 40) {
    bumpAggression(1, "you lingered here too long");
    state._roomTimeStart = state.timeMinutes;
  }
  const sinceRest = state.timeMinutes - state._lastRestAt;
  if (sinceRest >= 120) {
    bumpAggression(1, "you haven't rested in hours");
    state._lastRestAt = state.timeMinutes;
  }
}

// Sit-in-silence action — 10 in-game minutes of solo-time dread.
// Four narration beats escalate, then a resolution roll: scare / whisper / nothing.
// Nothing-happening is the most unsettling outcome and is deliberately common.
let _silenceInProgress = false;
function doSitInSilence() {
  if (_silenceInProgress) return;
  if (!state.calderLeft) return;
  _silenceInProgress = true;
  const room = state.currentRoom;
  const roomName = ROOMS[room]?.name || room;
  narrate("<em>You sit. You do not turn on any instrument. You let the room be what it is.</em>");
  advanceTime(2);
  // Mild sanity-tier aggression nudge: the house notices you watching it watch you
  bumpAggression(1, "you refused to look away");

  const beats = [
    { delay: 2800, text: "<em>A minute passes. Then another. The silence becomes, somehow, a <em>texture</em> — heavy, attentive.</em>", sfx: null },
    { delay: 6000, text: "<em>The air shifts slightly. You cannot say from where.</em>", sfx: "breath" },
    { delay: 9000, text: "<em>You are quite certain, now, that you are not alone. You do not, however, move.</em>", sfx: "heartbeat" },
    { delay: 12500, text: "<em>The ten minutes, somehow, have been both very long and over before they began.</em>", sfx: null }
  ];
  let beatIdx = 0;
  function tick() {
    if (beatIdx >= beats.length) { finish(); return; }
    const b = beats[beatIdx++];
    setTimeout(() => {
      narrate(b.text);
      if (b.sfx) audio.sfx(b.sfx);
      if (state.currentRoom !== room) { _silenceInProgress = false; return; }
      tick();
    }, b.delay - (beatIdx > 0 ? beats[beatIdx - 2].delay || 0 : 0));
  }
  function finish() {
    advanceTime(10);
    // Resolution roll depends on truth + whether an entity is in this room
    const entitiesHere = Object.values(ENTITIES).filter(e =>
      e.realInStates.includes(state.truth) && e.room === room
    );
    const present = entitiesHere.length > 0;
    let roll = Math.random();
    setTimeout(() => {
      // Lethal roll: Sitting in silence at high aggression, on a haunted
      // run, with an entity present, can end fatally. You invited it.
      const agg = state.aggression || 0;
      const lethalChance = state.truth === "haunted" && present && agg >= 7 ? 0.25 + (agg - 7) * 0.1 : 0;
      if (lethalChance > 0 && Math.random() < lethalChance) {
        narrate("<em>You sat. You invited it. It came.</em>");
        audio.sfx("screech");
        _silenceInProgress = false;
        killPlayer("You sat in silence at maximum aggression. The house interpreted that as an invitation.");
        return;
      }
      if (state.truth === "haunted" && present && roll < 0.45) {
        // Scripted intimate scare — the solo-time reward
        const nudges = [
          "<em>You feel, very briefly, the pressure of a hand on your shoulder. Then nothing.</em>",
          "<em>A voice, directly beside your ear, says your last name. You did not tell anyone your last name.</em>",
          "<em>Your own breath, for one full inhalation, is not your own. Then it is again.</em>",
          "<em>Something sits down next to you — not in the chair, but in the air beside it — and then, apparently satisfied, leaves.</em>",
          "<em>Fingers, very cold, briefly lace with yours. You do not look. When you do, your hand is alone.</em>",
          "<em>A weight settles on your chest for three seconds. Your pulse, in those seconds, is not entirely your own.</em>",
          "<em>The room is full. You cannot see anyone. But the room is full — and when you stand to leave, it empties politely, as if making way.</em>"
        ];
        const line = nudges[Math.floor(Math.random() * nudges.length)];
        narrate(line);
        audio.sfx("whisper");
        logEvidence("Solo Session", `Ten minutes alone in ${roomName}. Direct contact.`);
        entitiesHere.forEach(e => {
          const id = Object.keys(ENTITIES).find(k => ENTITIES[k] === e);
          if (id) state.entitiesSeen.add(id);
        });
        bumpAggression(2, "the house answered your patience");
      } else if (present && roll < 0.75) {
        // Near-miss
        narrate("<em>The silence deepens. You think — you are nearly certain — you heard a word spoken. You do not recognise it afterward.</em>");
        audio.sfx("chime");
        logEvidence("Solo Session", `Ten minutes alone in ${roomName}. Something almost spoken.`);
      } else if (state.truth === "debunked") {
        narrate("<em>Nothing happens. You sit. The house settles. You stand.</em>");
        logEvidence("Solo Session", `Ten minutes alone in ${roomName}. No phenomena observed.`);
      } else {
        // Nothing — scariest option. No audio sting, no evidence.
        narrate("<em>Nothing happens. You sit, and then — without knowing why — you stand up and leave the room.</em>");
      }
      _silenceInProgress = false;
    }, 1200);
  }
  tick();
}

// Call-out action — speak a name or question. The house may answer.
const CALLOUT_OPTIONS = [
  { label: "\"Is anyone here with me?\"", kind: "general" },
  { label: "\"Can you tell me your name?\"", kind: "name" },
  { label: "\"Evelyn? Are you here?\"", kind: "evelyn" },
  { label: "\"Henry? Clara?\"", kind: "twins" },
  { label: "\"Eliza.\"", kind: "eliza" },
  { label: "\"Margaret?\"", kind: "margaret" },
  { label: "\"If you want me to leave, make a sound.\"", kind: "challenge" },
  { label: "\"COME AT ME, BRO!\"", kind: "bagans" }
];
function doCallOut() {
  if (!state.calderLeft) return;
  const roomId = state.currentRoom;
  const roomName = ROOMS[roomId]?.name || roomId;
  // Build a mini-overlay (reuse scare overlay structure) so the player picks a line.
  const body = document.getElementById("scare-body");
  body.innerHTML = `
    <h2>Call out.</h2>
    <p class="scare-prompt-subtext">What do you say into the ${roomName}?</p>
    <div class="scare-choices" id="callout-choices"></div>
  `;
  const choicesEl = body.querySelector("#callout-choices");
  CALLOUT_OPTIONS.forEach(opt => {
    const b = document.createElement("button");
    b.className = "scare-choice";
    b.textContent = opt.label;
    b.onclick = () => {
      closeOverlay("overlay-scare");
      resolveCallout(opt, roomId, roomName);
    };
    choicesEl.appendChild(b);
  });
  openOverlay("overlay-scare");
}
function resolveCallout(opt, roomId, roomName) {
  // Easter egg: mocking the bro-scream school of paranormal investigation.
  if (opt.kind === "bagans") {
    narrate("<em>You plant your feet, crack your neck, and bellow into the Gothic silence: \"COME AT ME, BRO!\"</em>");
    if (typeof tts !== "undefined" && tts.speak) {
      setTimeout(() => tts.speak("Come at me, bro!", { preempt: false }), 400);
    }
    setTimeout(() => {
      narrate("<em>The house answers, drily, in a voice distinctly your grandmother's: <strong>\"Don't be that guy.\"</strong></em>");
      if (typeof tts !== "undefined" && tts.speak) {
        setTimeout(() => tts.speak("Don't be that guy.", { preempt: false }), 200);
      }
      audio.sfx("whisper");
      logEvidence("Direct Callout", `You called "COME AT ME, BRO!" in ${roomName}. The house was not impressed.`);
      showMilestone("A FIRM DISAPPROVAL", "<em>Somewhere, Zak Bagans lowered his microphone.</em>");
      if (typeof unlockAchievement === "function") unlockAchievement("bagans");
    }, 1800);
    advanceTime(3);
    bumpAggression(2, "you were extremely rude to a haunted house");
    return;
  }
  narrate("<em>You speak the words aloud. Your voice, in the room, is smaller than you expected.</em>");
  if (typeof tts !== "undefined" && tts.speakDevice) {
    // Use the chosen narrator voice (Price/Steele) — this is the investigator speaking,
    // not the house.
    setTimeout(() => {
      if (tts.speak) tts.speak(opt.label.replace(/["]/g, ""), { preempt: false });
    }, 400);
  }
  advanceTime(3);
  bumpAggression(1, "you called out to the house");
  // Resolution depends on truth + whether the named entity is actually here
  setTimeout(() => {
    const entitiesHere = Object.values(ENTITIES).filter(e =>
      e.realInStates.includes(state.truth) && (e.room === roomId || e.room === "any")
    );
    const entityNames = Object.entries(ENTITIES).filter(([k, e]) =>
      e.realInStates.includes(state.truth) && (e.room === roomId || e.room === "any")
    ).map(([k]) => k);
    const nameMatch = (() => {
      if (opt.kind === "evelyn" && roomId === "nursery") return "cold_mother";
      if (opt.kind === "twins" && (roomId === "governess" || roomId === "nursery")) return entityNames.find(n => n === "listening_twin" || n === "quiet_twin");
      if (opt.kind === "eliza" && state.truth === "haunted") return "hands";
      if (opt.kind === "margaret" && roomId === "parlor") return "portrait";
      return null;
    })();
    if (state.truth === "haunted" && nameMatch && entitiesHere.length) {
      narrate(`<em>[From just behind you, in a voice exactly the volume of your own]: "yes."</em>`);
      audio.sfx("whisper");
      logEvidence("Direct Callout", `You called "${opt.label}" in ${roomName} — it answered.`);
      state.entitiesSeen.add(nameMatch);
      bumpAggression(2, "it answered by name");
    } else if (state.truth === "haunted" && entitiesHere.length && Math.random() < 0.4) {
      narrate("<em>A single word — you cannot make it out — arrives from somewhere in the room. Not a direction you can point to.</em>");
      audio.sfx("whisper");
      logEvidence("Direct Callout", `You called "${opt.label}" in ${roomName} — a reply, indistinct.`);
    } else if (state.truth === "partial" && Math.random() < 0.3) {
      narrate("<em>The pipes clank. A floorboard adjusts. You cannot swear either was an answer, and you will not, later, say they were.</em>");
    } else {
      narrate("<em>Nothing. The room holds your words, considers them, and gives them back to you unchanged.</em>");
    }
  }, 1600);
}

// Resolver for the late-game Eliza confrontation (scares.js invokes it).
function resolveEliza(choice) {
  const body = document.getElementById("scare-body");
  let title, text, consequence;
  switch (choice) {
    case "yes":
      title = "You answered yes.";
      text = "<em>The air, for a measured instant, becomes kind. A woman's voice — much younger than the one that asked — says, very quietly, \"thank you.\" The lights come back, one at a time, in the order of their switches. Your pulse slows.</em>";
      state._elizaChoice = "yes";
      consequence = () => {
        logEvidence("Confrontation", "Eliza asked. You said yes. The pact continues. The trust expects the answer it was written for.");
        state.aggression = Math.min(state.aggression, 3);
        state._elizaProtected = true;
        if (typeof unlockAchievement === "function") unlockAchievement("eliza_pact_yes");
      };
      break;
    case "no":
      title = "You refused.";
      text = "<em>Silence. A long one. Then she says, \"We were children. We were a teacher. We were, for one afternoon, in a meeting-house. Very well. Tell the executor.\" The air does NOT become kind. You will finish the night on your own recognisance.</em>";
      state._elizaChoice = "no";
      consequence = () => {
        logEvidence("Confrontation", "Eliza asked. You said no. The refusal was heard. The rest of the night will not be easy.");
        bumpAggression(3, "you refused the house");
        if (typeof unlockAchievement === "function") unlockAchievement("eliza_pact_no");
      };
      break;
    case "refuse":
      title = "You refused to speak.";
      text = "<em>She laughs, once, at your caution. \"That is wisdom, at last. We will wait and see.\" The voice does not return. The lights come back, but only three of them.</em>";
      state._elizaChoice = "refuse";
      consequence = () => {
        logEvidence("Confrontation", "Eliza asked. You declined to answer. She laughed.");
        bumpAggression(1, "you would not commit");
      };
      break;
    case "name":
      title = "You asked for a name.";
      text = "<em>A pause. Then a chorus — many voices, nineteen at least — in perfect unison: \"ELIZA.\" You now know, for certain, what you were only told. This is worth something. It will cost something else.</em>";
      state._elizaChoice = "name";
      consequence = () => {
        logEvidence("Confrontation", "Eliza asked. You demanded a name — she gave it. Nineteen voices.");
        state.entitiesSeen.add("hands");
        state.docsRead.add("tape_transcript");
        bumpAggression(2, "you asked a thing to identify itself");
      };
      break;
  }
  body.innerHTML = `
    <h2 style="color:#e8a848">${title}</h2>
    <div class="scare-prompt-text">${text}</div>
    <button id="eliza-continue">Continue</button>
  `;
  document.getElementById("eliza-continue").onclick = () => {
    closeOverlay("overlay-scare");
    if (consequence) consequence();
  };
}

// Rest action — added to every room's hotspot list at render time
function doRest() {
  if (!state.calderLeft) return;
  // Rest cooldown: 45 in-game minutes. Otherwise Rest becomes a free
  // aggression-flush button you can spam whenever the house gets angry.
  const lastRest = state._lastRestAt || 0;
  const sinceRest = state.timeMinutes - lastRest;
  if (lastRest > 0 && sinceRest < 45) {
    const waitMin = 45 - sinceRest;
    narrate(`<em>[You are not tired enough to rest again. Give it ${waitMin} minute${waitMin === 1 ? "" : "s"}.]</em>`);
    return;
  }
  narrate("You sit. Close your eyes for a count. Listen to the house.");
  advanceTime(15);
  relaxAggression(2);
  state._lastRestAt = state.timeMinutes;
  state._everRested = true;
  if (Math.random() < 0.25 && state.truth !== "debunked") {
    narrate("When you open them, something in the room is different. You can't say what.");
  } else {
    narrate("Your pulse slows. You feel more in control.");
  }
}

// --- Jump scares ---
// Tier 2 (WATCHING): flavor scares. No damage. Just narration + flash.
// Tier 3 (CLOSE): dodge-or-die prompt. Wrong choice -> tier 4.
// Tier 4 (IN THE ROOM): the next heavy action or the next scare roll will kill in a haunted run.

const FLAVOR_SCARES = [
  "A door slams somewhere upstairs. When you check, all doors are open.",
  "The lights dim, then return. The bulbs are not flickering — you can see the filaments are steady.",
  "You hear a child laugh. Once. Very close.",
  "A floorboard creaks behind you. You do not turn.",
  "The temperature drops, visibly — your breath becomes a cloud and then vanishes.",
  "Your own footsteps keep going for half a second after you stop.",
  "You catch your reflection in a window and it blinks a beat late.",
  "A whisper, directly beside your ear, says a word you can't quite hear.",
  "Something drags across the floor above you. It takes its time.",
  "The pipes groan, long and low. No tap is running.",
  "A clock ticks in a room that doesn't contain one.",
  "The chandelier chimes faintly. Nothing is touching it.",
  "A curtain moves. There is no window open behind it.",
  "A chair in the next room scrapes back, as if someone stood up from it.",
  "You hear a match struck — clearly — in a room you were alone in.",
  "The wallpaper bubbles, once, and settles.",
  "A child's voice, in the wall beside you, counts to three and stops.",
  "The shadow of the banister moves across the floor before the banister does.",
  "Something taps, three times, on the opposite side of the door you're standing at.",
  "A picture frame, somewhere, falls flat.",
  "Your breath fogs in one particular corner of the room. Only that corner.",
  "A phonograph you have not seen begins, briefly, to play.",
  "The floor above you creaks in a pattern that sounds like pacing.",
  "You smell cigar smoke. The house has been sealed since 1974.",
  "Every clock in the house ticks once, together, then stops.",
  "A door closes itself, slowly, so that the latch catches without sound.",
  "An object you were not holding lands at your feet.",
  "A woman's voice in the room above you says, very clearly, <em>no</em>."
];

// Random ambient sfx list — fired by the scheduler. Each entry pairs a
// sound name with an optional narration line. Narration is suppressed
// most of the time so the sound plays alone (more unnerving).
const AMBIENT_RANDOM_SFX = [
  { sfx: "floor_creak",       text: null },
  { sfx: "pipe_groan",        text: null },
  { sfx: "wood_settle",       text: null },
  { sfx: "dist_door",         text: null },
  { sfx: "window_rattle",     text: null },
  { sfx: "chain_drag",        text: "Something is dragging, above you." },
  { sfx: "faint_laugh",       text: null },
  { sfx: "dist_piano",        text: "A few notes of a piano. Somewhere distant." },
  { sfx: "scratch_wall",      text: null },
  { sfx: "distant_footsteps", text: null },
  { sfx: "clock_tick",        text: null },
  { sfx: "breath",            text: null },
  { sfx: "whisper",           text: null },
  { sfx: "distant_bang",      text: null }
];

let _ambientSfxTimer = null;
function startAmbientSfxLoop() {
  stopAmbientSfxLoop();
  function tick() {
    // Don't fire during Calder walkthrough, on the drive, or during overlays
    const ok = state && state.calderLeft
      && state.currentRoom !== "drive"
      && !state.endDialog
      && document.querySelectorAll(".overlay:not(.hidden)").length === 0;
    if (ok) {
      const pick = AMBIENT_RANDOM_SFX[Math.floor(Math.random() * AMBIENT_RANDOM_SFX.length)];
      try { audio.sfx(pick.sfx); } catch (e) {}
      // ~20% of the time, surface a narration line
      if (pick.text && Math.random() < 0.2) narrate("<em>[" + pick.text + "]</em>");
    }
    // Spacing scales with aggression tier: quieter early, more frequent late
    const tier = typeof getTier === "function" ? DANGER_TIERS.indexOf(getTier()) : 0;
    const base = [55000, 40000, 28000, 18000][tier] || 45000;
    const jitter = base * 0.6;
    _ambientSfxTimer = setTimeout(tick, base + Math.random() * jitter);
  }
  _ambientSfxTimer = setTimeout(tick, 18000 + Math.random() * 18000);
}
function stopAmbientSfxLoop() {
  if (_ambientSfxTimer) clearTimeout(_ambientSfxTimer);
  _ambientSfxTimer = null;
}

function flavorScare() {
  const line = FLAVOR_SCARES[Math.floor(Math.random() * FLAVOR_SCARES.length)];
  narrate("[" + line + "]");
  flashScreen();
  audio.sfx("breath");
}

function flashScreen() {
  if (document.body.classList.contains("reduce-motion")) return;
  const f = document.createElement("div");
  f.className = "scare-flash fire";
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 400);
}

// --- Dodge-or-die prompts ---
// Each is a small decision the player must make under threat.
// Correct answer resolves safely; wrong answer pushes aggression to lethal level.

// Which scare (if any) fires after an aggression bump
function maybeFireScare() {
  if (!state.calderLeft) return;
  if (state.endDialog) return;
  const tier = DANGER_TIERS.indexOf(getTier());
  if (tier === 0) return;
  if (tier === 1) {
    if (Math.random() < 0.35) flavorScare();
    return;
  }
  if (tier === 2) {
    const prompt = pickThreatForRoom(state.currentRoom);
    if (prompt && Math.random() < 0.5) {
      fireThreatPrompt(prompt);
    } else if (Math.random() < 0.4) {
      flavorScare();
    }
    return;
  }
  if (tier === 3) {
    if (state.truth === "haunted") {
      killPlayer("The house has been waiting. It is done waiting.");
    } else if (state.truth === "partial") {
      const prompt = pickThreatForRoom(state.currentRoom);
      if (prompt) fireThreatPrompt(prompt);
      else relaxAggression(3);
    } else {
      // debunked never kills — resolves to near-miss
      narrate("Your heart slams. You are suddenly dizzy. You grip the wall until the feeling passes.");
      relaxAggression(4);
      logEvidence("Environmental", `Panic response in ${ROOMS[state.currentRoom].name} — no supernatural event observed.`);
    }
  }
}

function pickThreatForRoom(roomId) {
  const candidates = Object.entries(THREAT_PROMPTS).filter(([id, t]) => t.rooms.includes(roomId));
  if (candidates.length === 0) return null;
  const [id, t] = candidates[Math.floor(Math.random() * candidates.length)];
  return { id, ...t };
}

function fireThreatPrompt(prompt) {
  audio.sfx("breath");
  const body = document.getElementById("scare-body");
  body.innerHTML = `
    <h2>Something is happening.</h2>
    <div class="scare-prompt-text">${prompt.text}</div>
    <div class="scare-prompt-subtext">${prompt.subtext}</div>
    <div class="scare-choices"></div>
  `;
  const choicesEl = body.querySelector(".scare-choices");
  // Shuffle choices so the safe one isn't always in the same slot
  const order = [...prompt.choices].map((c,i) => ({c, i})).sort(() => Math.random() - 0.5);
  for (const {c} of order) {
    const b = document.createElement("button");
    b.className = "scare-choice";
    b.textContent = c.text;
    b.onclick = () => resolveThreatChoice(c);
    choicesEl.appendChild(b);
  }
  openOverlay("overlay-scare");
}

// Brief jump-scare used when the player picks an unsafe threat choice on
// a non-lethal run. Shows the B&W horror face for ~0.6s with the screech
// + screen shake, then resolves normally. Gives a real consequence on
// partial/debunked runs where the player would otherwise feel nothing.
function miniJumpScare() {
  if (document.body.classList.contains("reduce-motion")) return;
  const js = document.getElementById("jumpscare");
  const faceEl = document.getElementById("jumpscare-face");
  if (!js || !faceEl) return;
  if (typeof randomJumpscareFace === "function") {
    faceEl.innerHTML = randomJumpscareFace();
  }
  js.classList.remove("hidden");
  document.body.classList.add("screen-shake");
  audio.sfx("screech");
  setTimeout(() => {
    js.classList.add("hidden");
    document.body.classList.remove("screen-shake");
  }, 700);
}

function resolveThreatChoice(choice) {
  const body = document.getElementById("scare-body");
  body.innerHTML = `<h2>${choice.safe ? "You survive." : "It finds you."}</h2>
    <p class="scare-prompt-text">${choice.result}</p>
    <button id="scare-continue">Continue</button>`;
  document.getElementById("scare-continue").onclick = () => {
    closeOverlay("overlay-scare");
    // Debug tell: if debug mode is on, surface the resolver reasoning so the
    // player can verify why they did or didn't die.
    const debugOn = (typeof settings !== "undefined" && settings.debugUnlocked);
    if (choice.safe) {
      if (debugOn) narrate(`[DEBUG] Threat resolver: you picked the SAFE choice. -3 aggression, no death possible.`);
      relaxAggression(3);
    } else {
      if (state.truth === "haunted") {
        if (debugOn) narrate(`[DEBUG] Threat resolver: truth=HAUNTED + unsafe choice → death.`);
        killPlayer(choice.result);
      } else if (state.truth === "partial") {
        // Mini jump scare + narration + kept aggression. No death.
        if (debugOn) narrate(`[DEBUG] Threat resolver: truth=PARTIAL + unsafe choice → near-miss with jump scare (no death).`);
        miniJumpScare();
        setTimeout(() => {
          narrate("<em>Something rushes past you — cold, heavy, and gone before you see it. You are still here. Somehow.</em>");
          bumpAggression(2, "you almost didn't make it");
        }, 750);
      } else {
        // Debunked: panic-attack with scare still triggers, but it's your brain.
        if (debugOn) narrate(`[DEBUG] Threat resolver: truth=DEBUNKED + unsafe choice → panic attack with jump scare (no death).`);
        miniJumpScare();
        setTimeout(() => {
          narrate("<em>Your pulse hammers. For half a second you were certain something was on you. Then the feeling passes.</em>");
          bumpAggression(1, "adrenaline");
          logEvidence("Environmental", "Panic response — brain filled in a threat that wasn't there.");
        }, 750);
      }
    }
  };
}

function killPlayer(cause) {
  state.endDialog = "dead";
  closeOverlay("overlay-scare");
  audio.stopAmbient();
  if (audio.stopRoomBed) audio.stopRoomBed();
  if (audio.stopRainBed) audio.stopRainBed();
  if (typeof statsOnDeath === "function") statsOnDeath();
  if (typeof unlockAchievement === "function") unlockAchievement("died");
  // JUMP SCARE: inject a random B&W face into the jumpscare container.
  const js = document.getElementById("jumpscare");
  const faceEl = document.getElementById("jumpscare-face");
  if (faceEl && typeof randomJumpscareFace === "function") {
    faceEl.innerHTML = randomJumpscareFace();
  }
  js.classList.remove("hidden");
  document.body.classList.add("screen-shake");
  audio.sfx("screech");
  setTimeout(() => audio.sfx("distant_bang"), 200);
  setTimeout(() => {
    js.classList.add("hidden");
    document.body.classList.remove("screen-shake");
    // Gothic epitaph card between the scare and the death summary
    showIntertitle("HERE ENDS THE INVESTIGATION",
      "<span class='big'>A CAUTIONARY TALE</span><em>The Society assumes no liability. It did, however, forewarn you — upon the steps, and in the letter, and upon the threshold, and again now.</em>",
      { once: "death_card_" + Date.now() });
    setTimeout(() => {
      document.getElementById("death-cause").textContent = cause;
      document.getElementById("death-flavor").textContent = deathFlavor();
      const recent = (state.evidence || []).slice(-3);
      let trailEl = document.getElementById("death-trail");
      if (!trailEl) {
        trailEl = document.createElement("div");
        trailEl.id = "death-trail";
        trailEl.className = "death-stage";
        const flavorEl = document.getElementById("death-flavor");
        flavorEl.parentNode.insertBefore(trailEl, flavorEl.nextSibling);
      }
      if (recent.length > 0) {
        trailEl.innerHTML = `
          <div style="margin-top:18px;padding-top:16px;border-top:1px solid #2a1410">
            <div style="font-family:var(--serif-display);font-size:10px;letter-spacing:3px;color:#8a6048;text-transform:uppercase;margin-bottom:8px">Your final acts</div>
            ${recent.map(e => `<div style="font-size:13px;color:#a08078;margin-bottom:4px"><span style="color:#6a4838">${e.when} — ${ROOMS[e.room]?.name || ""}</span>: ${e.type} · ${e.detail}</div>`).join("")}
            ${state.aggression >= 7 ? `<div style="margin-top:8px;font-size:12px;color:#c06048;font-style:italic">The house's aggression reached ${state.aggression} / 10 before it took you.</div>` : ""}
          </div>`;
      } else {
        trailEl.innerHTML = "";
      }
      // Staged fade-in: reset all stages to hidden, then reveal one at a time.
      const stages = document.querySelectorAll("#overlay-death .death-stage");
      stages.forEach(el => el.classList.remove("visible"));
      openOverlay("overlay-death");
      // Title 0.1s, cause 1.8s, flavor 3.4s, trail 5.0s, button 6.8s
      const schedule = [
        { el: document.getElementById("death-title"),  at: 100 },
        { el: document.getElementById("death-cause"),  at: 1800 },
        { el: document.getElementById("death-flavor"), at: 3400 },
        { el: document.getElementById("death-trail"),  at: 5000 },
        { el: document.getElementById("death-restart"), at: 6800 }
      ];
      schedule.forEach(s => {
        if (s.el) setTimeout(() => s.el.classList.add("visible"), s.at);
      });
    }, 4200);
  }, 1500);
}
function deathFlavor() {
  if (state.truth === "haunted") return "Ashgrove House has claimed another. The trust renews. The executor is satisfied.";
  if (state.truth === "partial") return "Bad luck. Or something.";
  return "They found you at dawn. Cause of death: acute cardiac event. The executor pays the estate. The house stays closed.";
}

(function bindDeathRestart() {
  const r = document.getElementById("death-restart");
  if (r) r.addEventListener("click", () => location.reload());
})();

const THREAT_PROMPTS = {
  nursery_rocking: {
    text: "The rocking chair in the corner has started moving. Faster. Faster. The door behind you is inching shut.",
    subtext: "What do you do?",
    choices: [
      { text: "Bolt for the door.", safe: true, result: "You make it through just before it slams. The bolt throws itself. From inside." },
      { text: "Confront the chair.", safe: false, result: "You take a step toward it. A cold hand closes on the back of your neck." },
      { text: "Raise the EM pump to push back.", safe: false, result: "The pump whines, then dies. Whatever is here is stronger than it." }
    ],
    rooms: ["nursery"]
  },
  library_knocker: {
    text: "The knocking from the cellar door has been answering yours. Now it is louder. And it is behind you.",
    subtext: "What do you do?",
    choices: [
      { text: "Turn slowly.", safe: false, result: "Nothing is there — until there is. A hand on your shoulder." },
      { text: "Walk out without looking back.", safe: true, result: "You make it to the hall. The knocking stops." },
      { text: "Knock back three times.", safe: false, result: "The room answers in voices. Many voices." }
    ],
    rooms: ["library", "wine_cellar"]
  },
  master_breath: {
    text: "The east wall is no longer breathing shallow. It is inhaling deeply. Every exhale pulls the air toward it — and you with it.",
    subtext: "What do you do?",
    choices: [
      { text: "Grab the bedpost and hold on.", safe: true, result: "You brace. The inhalation passes. The wall exhales once, quietly, and is still." },
      { text: "Try to reach the doorway.", safe: false, result: "You are halfway there when the wall inhales fully. Something goes past you, toward it." },
      { text: "Use the thermal camera to 'see' what's there.", safe: false, result: "The viewfinder reveals a shape in the wall. It turns to face you." }
    ],
    rooms: ["master"]
  },
  hallway_figure: {
    text: "The figure at the end of the upstairs hallway is closer now. You blinked and it is closer.",
    subtext: "What do you do?",
    choices: [
      { text: "Back away without breaking eye contact.", safe: true, result: "You retreat to the stairs. It does not follow. Yet." },
      { text: "Walk toward it.", safe: false, result: "You take four steps. On the fifth it is directly in front of you." },
      { text: "Shine the flashlight at it.", safe: false, result: "The flashlight dies. So does the hallway sconce. So does the one behind you." }
    ],
    rooms: ["upstairs_hall"]
  },
  cellar_hands: {
    text: "The locked cellar door is rattling in its frame. Hinges first. Then the bolt. Then the frame itself.",
    subtext: "What do you do?",
    choices: [
      { text: "Get upstairs. Now.", safe: true, result: "You take the steps two at a time. Behind you the door splinters. You are not below when it opens." },
      { text: "Brace against the door to hold it.", safe: false, result: "You press your shoulder against it. On the other side something presses back. Harder." },
      { text: "Leave the EM pump behind as bait.", safe: false, result: "You set the pump down. It dies instantly. The door is no longer rattling — it is opening." }
    ],
    rooms: ["wine_cellar"]
  }
};


