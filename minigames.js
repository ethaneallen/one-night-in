// minigames.js — séance planchette, combo locks, time-of-night events
"use strict";

// --- Séance planchette ---
// Margaret's table. A planchette drifts over a letter wheel; you click
// "release" to lock in each letter. Truth-weighted: on Haunted runs it
// tends to spell real words (ELIZA, WALLS, FIRE, NINETEEN). On Partial
// it spells fragments. On Debunked it spells noise.
// Real Ouija board layout: letters arranged in two arcs, numbers on a
// straight row below, with YES/NO corners and GOODBYE at the bottom.
// Each cell gets an (x, y) position in percentage — the planchette is
// a positioned SVG that slides between cell centers via CSS transforms.

const OUIJA_LAYOUT = (() => {
  const cells = [];
  // Top arc: A-M, 13 letters, curving upward
  const top = "ABCDEFGHIJKLM".split("");
  top.forEach((ch, i) => {
    const t = i / (top.length - 1);         // 0..1
    const x = 14 + t * 72;                   // span left-to-right
    const y = 32 - Math.sin(Math.PI * t) * 14; // dip from 32 up to 18
    cells.push({ id: ch, label: ch, x, y });
  });
  // Bottom arc: N-Z, 13 letters, curving downward
  const bot = "NOPQRSTUVWXYZ".split("");
  bot.forEach((ch, i) => {
    const t = i / (bot.length - 1);
    const x = 14 + t * 72;
    const y = 52 + Math.sin(Math.PI * t) * 14;
    cells.push({ id: ch, label: ch, x, y });
  });
  // Numbers 0-9 in a straight row at the bottom
  "0123456789".split("").forEach((ch, i) => {
    const t = i / 9;
    const x = 20 + t * 60;
    const y = 78;
    cells.push({ id: ch, label: ch, x, y });
  });
  // YES / NO in corners, GOODBYE at bottom
  cells.push({ id: "YES",     label: "YES",     x: 14, y: 12 });
  cells.push({ id: "NO",      label: "NO",      x: 86, y: 12 });
  cells.push({ id: "GOODBYE", label: "GOODBYE", x: 50, y: 92 });
  return cells;
})();

function openSeance() {
  if (!state.calderLeft) { narrate("You will not touch her table with Calder watching."); return; }
  if (state._seanceCooldown && state.timeMinutes < state._seanceCooldown) {
    narrate("<em>The table has just been sat at. It needs a moment.</em>");
    return;
  }
  advanceTime(3);
  bumpAggression(1, "you sat at the séance table");

  const word = pickSeanceWord();
  const body = document.getElementById("scare-body");
  body.innerHTML = ouijaMarkup();
  openOverlay("overlay-scare");
  runOuija(word);
}

function ouijaMarkup() {
  const cellsHtml = OUIJA_LAYOUT.map((c, i) =>
    `<div class="ouija-cell ${c.id.length > 1 ? "ouija-word" : ""}" data-i="${i}"
          style="left:${c.x}%;top:${c.y}%">${c.label}</div>`
  ).join("");
  return `
    <h2>At Margaret's Table</h2>
    <p class="scare-prompt-subtext">Your fingertips rest on the planchette. It begins to move on its own. When it <em>pauses</em> over a letter, that letter will lock itself into the word.</p>
    <div class="ouija-board" id="ouija-board">
      <div class="ouija-sun">☀</div>
      <div class="ouija-moon">☾</div>
      ${cellsHtml}
      <div class="ouija-planchette" id="ouija-planchette">
        <svg viewBox="0 0 100 120" width="70" height="84">
          <defs>
            <radialGradient id="p-wood" cx="50%" cy="45%" r="55%">
              <stop offset="0%"  stop-color="#d4b088"/>
              <stop offset="60%" stop-color="#8a6a48"/>
              <stop offset="100%" stop-color="#3a2818"/>
            </radialGradient>
          </defs>
          <path d="M 50 5 L 92 95 L 8 95 Z" fill="url(#p-wood)" stroke="#1a0e06" stroke-width="2"/>
          <circle cx="50" cy="60" r="14" fill="none" stroke="#1a0e06" stroke-width="2"/>
          <circle cx="50" cy="60" r="9"  fill="rgba(255,240,200,0.15)" stroke="#6a4828" stroke-width="1"/>
        </svg>
      </div>
    </div>
    <div class="seance-word" id="seance-word"></div>
    <div class="scare-choices">
      <button id="seance-end">Lift your hands from the planchette</button>
    </div>
  `;
}

// --- Speak to the house ---
// Limited to 3 uses per run. Each use costs 15 in-game minutes and raises
// aggression. Requires AI to be enabled. Without AI, the player gets a
// fallback cryptic line from a small pool.

const SPEAK_HOUSE_FALLBACK = [
  "You speak. The house does not answer. Not tonight. Not like this.",
  "Silence. The air in the room goes still, as though it listened, and chose not to reply.",
  "A board creaks, somewhere. Perhaps a reply. Perhaps a board.",
  "The walls keep their counsel. You will have to earn it.",
];

function openSpeakToHouse() {
  if (!state.calderLeft) { narrate("You are not alone enough to do this yet."); return; }
  const remaining = 3 - (state._speakHouseUses || 0);
  if (remaining <= 0) {
    narrate("<em>You have already spoken to the house three times tonight. It will not hear you again before dawn.</em>");
    return;
  }
  const aiOn = typeof aiIsEnabled === "function" && aiIsEnabled();
  const body = document.getElementById("scare-body");
  body.innerHTML = `
    <h2>Speak to the House</h2>
    <p class="scare-prompt-subtext">
      You address the walls, or whatever is behind them, aloud.
      ${remaining} utterance${remaining === 1 ? "" : "s"} left before dawn.
    </p>
    ${aiOn ? "" : `<p style="font-size:12px;color:#a08060;font-style:italic;text-align:center;">
      (To hear the house reply with a live voice, enable AI in <strong>Settings → Speak with the House</strong> and provide a free API key.)
    </p>`}
    <input type="text" id="speak-house-input" maxlength="220"
      placeholder="Ask your question, or address them by name."
      style="width:100%;padding:10px;background:#0a0604;border:1px solid #3a2818;color:#e8d0a8;font-family:'Cormorant Garamond',serif;font-size:15px;font-style:italic">
    <div id="speak-house-reply" class="speak-reply"></div>
    <div class="scare-choices">
      <button id="speak-house-submit">Speak</button>
      <button id="speak-house-close">Close your mouth</button>
    </div>
  `;
  openOverlay("overlay-scare");
  const input = document.getElementById("speak-house-input");
  if (input) input.focus();

  async function submit() {
    const text = (input.value || "").trim();
    if (!text) return;
    input.disabled = true;
    const btn = document.getElementById("speak-house-submit");
    if (btn) btn.disabled = true;
    const replyEl = document.getElementById("speak-house-reply");
    replyEl.innerHTML = `<em style="color:#60a070">...</em>`;
    state._speakHouseUses = (state._speakHouseUses || 0) + 1;
    advanceTime(15);
    bumpAggression(2, "you addressed the house directly");

    let reply = null;
    if (aiOn && typeof aiHouseResponse === "function") {
      const tier = typeof getTier === "function" ? getTier() : "QUIET";
      const ctx = {
        roomName: ROOMS[state.currentRoom]?.name || state.currentRoom,
        docsRead: (state.docsRead && state.docsRead.size) || 0,
        evidenceCount: (state.evidence || []).length,
        tier,
        when: typeof formatTime === "function" ? formatTime() : ""
      };
      reply = await aiHouseResponse(text, ctx);
    }
    if (!reply) {
      reply = SPEAK_HOUSE_FALLBACK[Math.floor(Math.random() * SPEAK_HOUSE_FALLBACK.length)];
    }
    // Log evidence
    logEvidence("Speak to the House", `You asked: "${text.slice(0, 80)}" — the house answered.`);
    replyEl.innerHTML = `<div class="speak-reply-line">${escapeHtml(reply)}</div>`;
    // Narrate + TTS
    try { audio.sfx("whisper"); } catch (e) {}
    if (typeof tts !== "undefined" && tts.speak) {
      setTimeout(() => tts.speak(reply, { preempt: false }), 300);
    }
    // First-time achievement unlock for reaching this feature
    if (typeof unlockAchievement === "function") unlockAchievement("spoke_to_house");
  }

  document.getElementById("speak-house-submit").onclick = submit;
  document.getElementById("speak-house-close").onclick = () => closeOverlay("overlay-scare");
  input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Ouija driver: planchette slides between cells, pauses on target letters,
// auto-locks after a visible dwell. Player doesn't have to click-time.
function runOuija(word) {
  const planchette = document.getElementById("ouija-planchette");
  const wordEl = document.getElementById("seance-word");
  const board = document.getElementById("ouija-board");
  if (!planchette || !board) return;

  let collected = "";
  let curIdx = Math.floor(Math.random() * 26);    // start on a random letter
  moveTo(curIdx, true);

  const pullStrength = state.truth === "haunted" ? 1.0 : state.truth === "partial" ? 0.55 : 0;
  let ended = false;

  function moveTo(i, instant) {
    const cell = OUIJA_LAYOUT[i];
    // Planchette tip points up — position so tip centers on cell
    planchette.style.left = cell.x + "%";
    planchette.style.top  = cell.y + "%";
    if (instant) {
      planchette.style.transition = "none";
      // Force reflow then restore transition
      void planchette.offsetHeight;
      planchette.style.transition = "";
    }
    highlight(i);
  }
  function highlight(i) {
    document.querySelectorAll(".ouija-cell").forEach(el => el.classList.remove("on", "pausing"));
    const el = board.querySelector(`[data-i="${i}"]`);
    if (el) el.classList.add("on");
  }
  function pulse(i) {
    const el = board.querySelector(`[data-i="${i}"]`);
    if (el) el.classList.add("pausing");
  }

  async function step() {
    if (ended) return;

    // Pick next letter. If a target letter is needed AND pull is on,
    // bias toward drifting near it; otherwise random neighbour-hops so
    // the motion feels organic rather than random-teleporty.
    const needed = word[collected.length];
    const neededIdx = needed ? OUIJA_LAYOUT.findIndex(c => c.id === needed) : -1;
    let nextIdx;
    if (neededIdx >= 0 && pullStrength > 0 && Math.random() < 0.35 + pullStrength * 0.25) {
      // Drift toward the target — pick a neighbour that reduces distance
      nextIdx = biasedNeighbour(curIdx, neededIdx);
    } else {
      // Pick a random other cell within reach
      nextIdx = (curIdx + 3 + Math.floor(Math.random() * 5)) % OUIJA_LAYOUT.length;
    }

    curIdx = nextIdx;
    moveTo(curIdx, false);

    // Wait for slide to complete
    await sleep(900 + Math.random() * 400);

    // Are we on the needed letter? Pause and auto-lock.
    if (OUIJA_LAYOUT[curIdx].id === needed && pullStrength > 0) {
      pulse(curIdx);
      try { audio.sfx("wood_settle"); } catch (e) {}
      await sleep(900);
      // Lock it in
      collected += needed;
      if (wordEl) wordEl.textContent = collected;
      try { audio.sfx("ovilus"); } catch (e) {}
      await sleep(450);
      if (collected.length >= word.length) {
        endSeanceSession(collected, word);
        return;
      }
    } else {
      // Normal dwell
      await sleep(350);
    }

    if (!ended) step();
  }

  step();

  document.getElementById("seance-end").onclick = () => {
    ended = true;
    endSeanceSession(collected, word);
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Pick a cell index that reduces 2D distance to target — produces
// natural-looking planchette drift rather than snapping across the board.
function biasedNeighbour(fromIdx, targetIdx) {
  const from = OUIJA_LAYOUT[fromIdx];
  const target = OUIJA_LAYOUT[targetIdx];
  // Score every other cell by distance reduction + some noise
  const scored = OUIJA_LAYOUT.map((c, i) => {
    if (i === fromIdx) return { i, score: -Infinity };
    const dCurrent = Math.hypot(from.x - target.x, from.y - target.y);
    const dNew     = Math.hypot(c.x    - target.x, c.y    - target.y);
    return { i, score: (dCurrent - dNew) + Math.random() * 4 };
  });
  scored.sort((a, b) => b.score - a.score);
  // Pick from top 3 for variety
  return scored[Math.floor(Math.random() * 3)].i;
}

function endSeanceSession(got, target) {
  closeOverlay("overlay-scare");
  state._seanceCooldown = state.timeMinutes + 30;
  if (!got) {
    narrate("<em>You lift your hands. The planchette slows, and stops, and is merely a piece of wood again.</em>");
    return;
  }
  const matches = got === target;
  const partial = !matches && got.length >= 3 && target.includes(got.substring(0, 3));
  if (matches) {
    narrate(`<em>The planchette spells, letter by deliberate letter: <strong>${got}</strong>.</em>`);
    logEvidence("Séance", `Planchette spelled "${got}" at Margaret's table.`);
    if (got === "ELIZA" && state.truth !== "debunked") {
      state._elizaFromSeance = true;
      showMilestone("A NAME AT THE TABLE", "<em>The planchette, which you did not push, has written her name.</em>");
      if (typeof unlockAchievement === "function") unlockAchievement("seance_eliza");
    }
    if (state.truth === "haunted") bumpAggression(2, "the table answered you by name");
  } else if (partial) {
    narrate(`<em>You lift your hands. The word you have — <strong>${got}</strong> — is nothing you can swear to, but it is not nothing.</em>`);
    logEvidence("Séance", `Planchette drifted through letters: "${got}".`);
  } else {
    narrate(`<em>You lift your hands. The letters on the page — <strong>${got}</strong> — read as nothing. Perhaps that is the answer.</em>`);
    if (state.truth === "debunked") logEvidence("Séance — Debunked", `Planchette drift spelled "${got}" — meaningless.`);
  }
}

function ringSeanceBell() {
  narrate("<em>You lift the small silver bell. Its clapper is still. You ring it once. The note is older than the bell.</em>");
  try { audio.sfx("chime"); } catch (e) {}
  bumpAggression(1, "you rang the bell");
  if (state.truth === "haunted" && Math.random() < 0.5) {
    setTimeout(() => {
      narrate("<em>Somewhere above you, a second bell answers. Faintly. As though from under cloth.</em>");
      try { audio.sfx("ovilus"); } catch (e) {}
      logEvidence("Séance Bell", "Rang Margaret's bell; a second note answered from upstairs.");
    }, 1400);
  }
  if (typeof unlockAchievement === "function") unlockAchievement("bell_rung");
}

// --- Combination lock ---
// A 3-digit brass dial on a locked drawer. The combination is "1-8-5-1"
// (compressed to 185 here for 3 digits) — the year of the Meeting-House
// fire. Clue is in the fire_clipping document. Opening it reveals a
// short extra document with further plot info + a small cash bonus.
const COMBO_LOCKS = {
  parlor_drawer: {
    combo: "185",
    room: "parlor",
    title: "A small locked drawer under the séance table",
    hint: "Brass dial. Three digits. The dial is inscribed on its face: 'IN MEMORIAM · 18__'.",
    rewardId: "combo_parlor_drawer",
    rewardTitle: "A bundle of letters, bound with twine",
    rewardBody: "Nine letters, in a child's hand, all addressed to 'Miss Halliwell.' None sent. The last reads, simply: 'Please come back. We are afraid in the dark.' Dated 1850, the year before the fire.",
    payout: 1500
  }
};

function openComboLock(lockId) {
  const lock = COMBO_LOCKS[lockId];
  if (!lock) return;
  if (state._comboOpened && state._comboOpened[lockId]) {
    narrate("<em>The drawer is already open. You take the letters with you.</em>");
    return;
  }
  const body = document.getElementById("scare-body");
  body.innerHTML = `
    <h2>${lock.title}</h2>
    <p class="scare-prompt-subtext">${lock.hint}</p>
    <div class="combo-dial">
      ${[0,1,2].map(i => `
        <div class="combo-col">
          <button class="combo-up" data-i="${i}">▲</button>
          <div class="combo-digit" id="combo-d${i}">0</div>
          <button class="combo-dn" data-i="${i}">▼</button>
        </div>`).join("")}
    </div>
    <div class="scare-choices">
      <button id="combo-try">Try the combination</button>
      <button id="combo-close">Step away</button>
    </div>
    <div id="combo-msg" class="combo-msg"></div>
  `;
  openOverlay("overlay-scare");

  const digits = [0, 0, 0];
  function paint() {
    for (let i = 0; i < 3; i++) document.getElementById("combo-d" + i).textContent = digits[i];
  }
  document.querySelectorAll(".combo-up").forEach(b => {
    b.onclick = () => { const i = +b.dataset.i; digits[i] = (digits[i] + 1) % 10; paint(); try { audio.sfx("click"); } catch (e) {} };
  });
  document.querySelectorAll(".combo-dn").forEach(b => {
    b.onclick = () => { const i = +b.dataset.i; digits[i] = (digits[i] + 9) % 10; paint(); try { audio.sfx("click"); } catch (e) {} };
  });
  document.getElementById("combo-close").onclick = () => closeOverlay("overlay-scare");
  document.getElementById("combo-try").onclick = () => {
    const entered = digits.join("");
    const msg = document.getElementById("combo-msg");
    if (entered === lock.combo) {
      try { audio.sfx("lock"); } catch (e) {}
      msg.innerHTML = `<span style="color:#80c090">The dial gives. The drawer slides open.</span>`;
      if (!state._comboOpened) state._comboOpened = {};
      state._comboOpened[lockId] = true;
      state._comboPayout = (state._comboPayout || 0) + lock.payout;
      logEvidence("Puzzle", `Unlocked ${lock.title} — ${lock.rewardTitle}. (+$${lock.payout})`);
      showMilestone("A DIAL GIVES", `<em>${lock.rewardTitle}.</em>`);
      if (typeof unlockAchievement === "function") unlockAchievement("combo_unlock");
      setTimeout(() => {
        closeOverlay("overlay-scare");
        // Show the reward as a document
        if (typeof DOCUMENTS !== "undefined") {
          DOCUMENTS[lock.rewardId] = { title: lock.rewardTitle, body: lock.rewardBody };
          state.docsRead.add(lock.rewardId);
          if (typeof showDocument === "function") showDocument(lock.rewardId);
        }
      }, 1400);
    } else {
      try { audio.sfx("click"); } catch (e) {}
      msg.innerHTML = `<span style="color:#c08070">Nothing. The dial resists.</span>`;
    }
  };
}

// --- Time-of-night events ---
// Short ambient moments that fire at 1 AM, 2 AM, 3 AM. Atmospheric only,
// no damage; logged as evidence on haunted runs, logged as debunks on
// debunked runs, mundane narration otherwise.
const TIME_OF_NIGHT_EVENTS = [
  {
    id: "bell_1am",
    hour: 1 * 60 + 24 * 60,  // 1:00 AM (in "minutes since midnight" terms of timeMinutes)
    hauntedText: "<em>A small brass bell, somewhere in the conservatory, rings once. You counted zero bells the first time. This is now one. You will remember it at two.</em>",
    mundaneText: "<em>A small brass bell, somewhere in the conservatory, rings once. The draft through the cracked pane has a way of finding the clapper.</em>",
    sfx: "ovilus"
  },
  {
    id: "tape_2am",
    hour: 2 * 60 + 24 * 60,
    hauntedText: "<em>From upstairs, the tape machine begins to play on its own. Adeline's voice — counting the children, softly, out of order.</em>",
    mundaneText: "<em>The tape machine in the study clicks. A reel, unbalanced on its spindle, has turned itself. Nothing more.</em>",
    sfx: "tape_play"
  },
  {
    id: "window_3am",
    hour: 3 * 60 + 24 * 60,
    hauntedText: "<em>A window, somewhere on the second floor, flies open. When you find it, it is the master bedroom — which has no window on the east.</em>",
    mundaneText: "<em>A window flies open somewhere upstairs. The wind, or the latch, or both.</em>",
    sfx: "window_rattle"
  }
];

let _tonTimer = null;
function startTimeOfNightLoop() {
  stopTimeOfNightLoop();
  function check() {
    if (state.calderLeft) {
      for (const ev of TIME_OF_NIGHT_EVENTS) {
        if (state._tonFired && state._tonFired[ev.id]) continue;
        if (state.timeMinutes >= ev.hour) {
          if (!state._tonFired) state._tonFired = {};
          state._tonFired[ev.id] = true;
          fireTimeOfNight(ev);
          break; // only one per tick
        }
      }
    }
    _tonTimer = setTimeout(check, 8000);
  }
  _tonTimer = setTimeout(check, 5000);
}
function stopTimeOfNightLoop() {
  if (_tonTimer) clearTimeout(_tonTimer);
  _tonTimer = null;
}
function fireTimeOfNight(ev) {
  try { audio.sfx(ev.sfx); } catch (e) {}
  const txt = state.truth === "haunted" ? ev.hauntedText : (state.truth === "debunked" ? ev.mundaneText : Math.random() < 0.5 ? ev.hauntedText : ev.mundaneText);
  narrate(txt);
  if (state.truth === "haunted") {
    logEvidence("Time of Night", `${ev.id.replace(/_/g, " ")} — unexplained.`);
    bumpAggression(1, "the house kept time");
  } else if (state.truth === "debunked") {
    logEvidence("Time of Night — Debunk", `${ev.id.replace(/_/g, " ")} — mundane cause identified.`);
  }
}

// --- Tape archive ---
// Adeline's reel-to-reel now holds 7 tapes instead of 1. Each has a label,
// a short transcript, and a truth-classification (real / mundane / noise).
// Picking a tape plays it; you can log it as evidence or skip. Listening
// to all 7 gives a small completion bonus.
const TAPE_ARCHIVE = [
  {
    id: "tape_4_17_73",
    label: "4/17/73 (marked with a red X)",
    text: "...Eliza, tell them. Tell them to leave the doors closed. They think it is the children they hear but it is Eliza, it was always Eliza. Nineteen in the fire and she their name for all of them. Tell them...",
    short: "Adeline names Eliza. Nineteen in the fire.",
    kind: "real"
  },
  {
    id: "tape_6_03_69",
    label: "6/3/69 (Adeline's hand, steady)",
    text: "Today I planted the peonies. Thirty-six of them, for the children. Six for each that was not found. They will come up pink if they come up at all. The soil here was never meant for flowers. Thomas used to say. Thomas used to say a great many things.",
    short: "Adeline on planting peonies — six for each twin 'not found.'",
    kind: "mundane"
  },
  {
    id: "tape_11_08_71",
    label: "11/8/71",
    text: "The wall is warmer than yesterday. I have put my cheek to it three times this morning. Henry — or the one I choose to call Henry — responded at the third touch. One knock. I took it for yes.",
    short: "Adeline: the east wall is warm. 'Henry' knocked once for yes.",
    kind: "real"
  },
  {
    id: "tape_2_29_72",
    label: "2/29/72 (label torn)",
    text: "[Hiss. A radio somewhere in another room is playing dance music. A kettle begins to whistle and is not attended to for the remainder of the tape. No voice is recorded.]",
    short: "A kettle whistles. No voice. The tape is mostly empty.",
    kind: "mundane"
  },
  {
    id: "tape_7_14_73",
    label: "7/14/73 (spliced, badly)",
    text: "...not my children. I know this now. I have always known. But they ask for milk and I — I keep the milk in the jar, Thomas, the way you showed me. And when the jar is empty in the morning I — I do not ask who drank. I do not ask.",
    short: "Adeline: 'not my children.' Empties a milk jar for them nightly.",
    kind: "real"
  },
  {
    id: "tape_test",
    label: "TEST (in Calder's hand)",
    text: "[Calder's voice, young, testing the machine.] 'Testing. Testing. Good evening, Mrs. Ashgrove. This is Frank — my father's boy, you may remember — I've brought you your post. Mrs. Ashgrove? I'll leave it on the...' [Click. Stop.]",
    short: "Young Calder testing the machine. Announces himself. No reply.",
    kind: "mundane"
  },
  {
    id: "tape_final",
    label: "(no date — last tape in the box)",
    text: "It is the twenty-third. I have decided. The wall will open for me the way it did not for Evelyn, because I will ask and she would not. I am seventy-two and I am tired of waiting to be let in. Frank, if you find this — do not play it a second time. — Adeline.",
    short: "Adeline: 'I have decided. The wall will open for me.' Addressed to Frank Calder.",
    kind: "real"
  }
];

function openTapeArchive() {
  if (!state._tapesHeard) state._tapesHeard = {};
  const entries = TAPE_ARCHIVE.map((t, i) => {
    const heard = state._tapesHeard[t.id];
    return `
      <div class="tape-entry ${heard ? 'tape-heard' : ''}" data-tape="${t.id}">
        <div class="tape-reel"></div>
        <div class="tape-label">
          <strong>${t.label}</strong>
          ${heard ? `<span class="tape-status">♪ heard</span>` : ""}
        </div>
      </div>`;
  }).join("");
  const body = document.getElementById("tool-body");
  document.getElementById("tool-title").textContent = "Adeline's Tape Archive";
  body.innerHTML = `
    <p style="text-align:center;color:#a08060;font-style:italic">Seven reels. The labels are in her hand — some steady, some not.</p>
    <div class="tape-shelf">${entries}</div>
  `;
  openOverlay("overlay-tool");
  body.querySelectorAll(".tape-entry").forEach(el => {
    el.onclick = () => playTape(el.dataset.tape);
  });
}

function playTape(id) {
  const tape = TAPE_ARCHIVE.find(t => t.id === id);
  if (!tape) return;
  if (!state._tapesHeard) state._tapesHeard = {};
  const firstTime = !state._tapesHeard[id];
  state._tapesHeard[id] = true;
  audio.sfx("tape_play");
  const body = document.getElementById("tool-body");
  const text = conciseText(tape.text, tape.short);
  body.innerHTML = `
    <h3 style="color:#c8a060;text-align:center">${tape.label}</h3>
    <div class="tape-player">
      <div class="tape-reel spinning"></div>
      <div class="tape-reel spinning"></div>
    </div>
    <p class="tape-transcript">${text}</p>
    <div class="device-actions">
      <button onclick="openTapeArchive()">Back to archive</button>
    </div>
  `;
  if (typeof tts !== "undefined") tts.speak(tape.label + ". " + text);
  if (firstTime) {
    if (tape.kind === "real") {
      logEvidence("Tape Playback", `Tape "${tape.label}" — ${tape.short}`);
    } else if (tape.kind === "mundane") {
      logEvidence("Tape — Mundane", `Tape "${tape.label}" — nothing paranormal.`);
    }
    // Completion bonus
    const allHeard = TAPE_ARCHIVE.every(t => state._tapesHeard[t.id]);
    if (allHeard && !state._tapeCompletionBonus) {
      state._tapeCompletionBonus = true;
      showMilestone("THE FULL ARCHIVE", "<em>You have heard every tape Adeline left. The picture is clearer now.</em>");
      logEvidence("Archive Complete", "All 7 tapes listened to — +$2,000 archivist bonus at verdict.");
    }
  }
}

function pickSeanceWord() {
  const truth = state.truth;
  const hauntedWords = ["ELIZA", "FIRE", "WALLS", "CAGE", "YES", "NINE"];
  const partialWords = ["TWIN", "COLD", "HERE", "SOON"];
  const debunkedNoise = ["XQTR", "PLMO", "VNBH", "ZZZZ", "AGHT"];
  if (truth === "haunted") return hauntedWords[Math.floor(Math.random() * hauntedWords.length)];
  if (truth === "partial") return partialWords[Math.floor(Math.random() * partialWords.length)];
  return debunkedNoise[Math.floor(Math.random() * debunkedNoise.length)];
}
