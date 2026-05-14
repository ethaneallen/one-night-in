// One Night In… — EXTRAS pass
// =====================================================================
// Four optional systems pulled from the canon ghost-hunting catalogue:
//
//   A. CURSED POSSESSIONS  — Phasmophobia. Four hidden objects in Ashgrove
//      that grant a power at a steep cost (mirror reveals the entity's
//      room, music box lures it, ouija board cashes evidence for nerves,
//      tarot pull rolls a buff or curse).
//
//   B. SPIRIT BOX QUESTIONS — Phasmophobia. Instead of only passively
//      sweeping radio bands, the investigator can ask one of four
//      questions. Each biases the next response and carries a risk.
//
//   C. REALITY WARPS — F.E.A.R. / Alma. Once the house's tension is high
//      and you re-enter a room you've already seen, the prose itself
//      *changes* once — a single eerie detail that wasn't there before.
//      One-shot per room per chapter.
//
//   D. BANISHMENT RITUAL — Ghost Exile / Ghost Exorcism Inc. After you
//      have gathered three components (salt · true name · personal
//      effect) a fourth ending becomes available at sunrise: a 3-stage
//      rite that, if performed well, BANISHES the entity instead of
//      merely reporting on it.
//
// All four hook into existing globals without modifying the source files
// (they wrap renderRoom / toolSpirit / onRoomEnter / showVerdict).
//
// Load AFTER playability-wave2.js so that el(), runSkillCheck() and the
// audio / composure / aggression helpers are guaranteed to exist.
"use strict";

(function () {

// ─────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────

function ensureState() {
  if (!state._cursed)   state._cursed = {};       // chapter-scoped
  if (!state._warps)    state._warps  = {};
  if (!state._ritual)   state._ritual = { salt: false, name: false, effect: false, performed: false, succeeded: false };
  if (!state._spiritQs) state._spiritQs = { asked: 0 };
}

function chapter() { return state._story === "wyndmere" ? "wyndmere" : "ashgrove"; }
function cursedSlot() {
  const c = chapter();
  if (!state._cursed[c]) state._cursed[c] = {};
  return state._cursed[c];
}
function sfx(name) {
  try { if (typeof audio !== "undefined" && audio.sfx) audio.sfx(name); } catch (e) {}
}
function bumpAgg(n, reason) {
  try { if (typeof bumpAggression === "function") bumpAggression(n, reason); } catch (e) {}
}
function dropComposure(n, reason) {
  try { if (typeof drainComposure === "function") drainComposure(n, reason); } catch (e) {}
}
function gainComposure(n, reason) {
  try { if (typeof bumpComposure === "function") bumpComposure(n, reason); } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────────
// C. REALITY WARPS — single-line, single-shot, per room per chapter
// ─────────────────────────────────────────────────────────────────────

const WARPS = {
  ashgrove: {
    entry_hall:   ["Every door off the hall is now ajar by precisely the same inch."],
    parlor:       ["The portrait has been turned to face the wall. You did not turn it.",
                   "The séance bell is on the floor. The rope is not."],
    library:      ["Every ledger lies open to the same page: <em>14</em>.",
                   "The wing-back chair has been pulled out from the desk and angled, very precisely, toward where you are about to stand."],
    dining:       ["The chairs — all twelve of them — have been pulled out and turned to face the doorway in which you are standing."],
    kitchen:      ["One of the copper pipes is dripping. The drops do not strike the floor.",
                   "The cast-iron range, iron-cold for an hour, is now warm to the back of your hand."],
    conservatory: ["A handprint, child-sized and pressed from the <em>inside</em>, fogs the cracked pane."],
    upstairs_hall:["The far end of the hall is, this time, further away than it has any right to be.",
                   "The runner is no longer worn down the centre. It is worn, instead, in two narrower parallel lines."],
    master:       ["The east wall has a fresh handprint at the height of a child's reach. The plaster is, you note, still warm.",
                   "The dust-cloth on the four-poster has been folded down. The pillow holds the impression of a head."],
    nursery:      ["The rocking chair is rocking, gentle and unattended. The toys, since you were last here, have been arranged in a circle.",
                   "The silver thimble is no longer near the doorway. It is in the centre of the floor."],
    governess:    ["The drawing has been re-pinned. The third hand is, this time, outermost.",
                   "The adjoining door is open. You closed it."],
    study:        ["Adeline's tapes are no longer boxed. They have been set out in a row, oldest to most recent. The reels are turning, very slowly, on a machine that is not switched on."],
    wine_cellar:  ["The bolt on the heavy oak door is, at this moment, slid back."]
  },
  wyndmere: {
    wm_foyer:     ["The hydrangeas have been freshly arranged. The water in the vase is, when you touch it, lake-cold.",
                   "The telephone is off the hook. The line, still, is dead."],
    wm_morning:   ["The canvas on the easel has been turned around. Whatever is painted on it, you do not, at first, recognise as a face."],
    wm_library:   ["The wing-back chair has, at this moment, the precise depression of a recently risen sitter.",
                   "The annotated Rituale Romanum lies open to a page Father Aherne did not, in life, annotate."],
    wm_kitchen:   ["The second cup is warm. The kettle, cold."],
    wm_upper_hall:["The runner is, this time, wet down its centre, as though something had dripped from one end of the hall to the other."],
    wm_master:    ["Eleanor's hairbrush is in the centre of the bed. A small soft drift of fair hair, fresh, is caught in the bristles."],
    wm_viv_room:  ["The window has been closed. The curtains are still wet. So is the carpet, in the shape of footprints walking inland."],
    wm_attic_door:["The padlock is open. It is still in place — but it is open."],
    wm_attic:     ["The doll has been turned. It is facing you."],
    wm_chapel:    ["The purple stole on the altar has been folded. It is, again, in the shape it would be folded after a rite."],
    wm_boathouse: ["The pale shape beneath the water is closer to the surface than it was. You have not moved."],
    wm_lakeshore: ["The row of stones now spells a word you can almost read. It is a name."]
  }
};

function maybeWarpRoom() {
  if (!state.calderLeft) return;
  const tension = +(document.body.dataset.tension || 0);
  if (tension < 2) return;
  const rid = state.currentRoom;
  if (!rid) return;
  if (!state._warps[rid + ":visited"]) {
    // First visit gets no warp — must have been here before.
    state._warps[rid + ":visited"] = true;
    return;
  }
  if (state._warps[rid + ":warped"]) return; // one-shot per room per chapter
  // Reasonable trigger: 45% chance on a qualifying re-entry
  if (Math.random() > 0.45) return;
  const pool = (WARPS[chapter()] || {})[rid];
  if (!pool || !pool.length) return;
  state._warps[rid + ":warped"] = true;
  const line = pool[Math.floor(Math.random() * pool.length)];
  // Let renderRoom finish first
  setTimeout(() => {
    const desc = document.getElementById("scene-description");
    if (desc) {
      const wrap = document.createElement("div");
      wrap.className = "warp-line";
      wrap.innerHTML = line;
      desc.insertBefore(wrap, desc.firstChild);
    }
    if (typeof narrate === "function") narrate("<em>" + line + "</em>");
    sfx("whisper");
    // Costs the player a nerve — but small. A reality-break should sting.
    dropComposure(4, "a detail that wasn't there before");
  }, 260);
}

// Wrap onRoomEnter (defined in danger.js)
(function wrapRoomEnter() {
  const origRE = window.onRoomEnter;
  window.onRoomEnter = function () {
    ensureState();
    if (typeof origRE === "function") origRE.apply(this, arguments);
    try { maybeWarpRoom(); } catch (e) { /* never let extras kill the game */ }
  };
})();

// ─────────────────────────────────────────────────────────────────────
// B. SPIRIT BOX QUESTIONS — biased single-response after each question
// ─────────────────────────────────────────────────────────────────────

const SPIRIT_QUESTIONS = {
  here:  { text: "Are you here?",            risk: "low",
           responses: { clue: 0.30, threat: 0.10, noise: 0.30, silent: 0.30 },
           agg: 0, drain: 0,
           silentLine: "Static. Then nothing at all." },
  name:  { text: "What is your name?",       risk: "med",
           responses: { clue: 0.55, threat: 0.20, noise: 0.20, silent: 0.05 },
           agg: 1, drain: 3,
           silentLine: "A word that was almost a name. Not quite." },
  death: { text: "How did you die?",         risk: "high",
           responses: { clue: 0.45, threat: 0.45, noise: 0.05, silent: 0.05 },
           agg: 2, drain: 6,
           silentLine: "A long, hissing silence that the static cannot quite cover." },
  leave: { text: "Do you want me to leave?", risk: "high",
           responses: { clue: 0.10, threat: 0.65, noise: 0.20, silent: 0.05 },
           agg: 2, drain: 5,
           silentLine: "Nothing answers. The silence is not consent." }
};

// Pick a biased word from the existing pools, given a target type.
function biasedPickByType(roomId, targetType) {
  const roomPool   = (typeof WORD_POOLS !== "undefined" ? WORD_POOLS[roomId] : []) || [];
  const universal  = (typeof WORD_POOL_UNIVERSAL !== "undefined" ? WORD_POOL_UNIVERSAL : []) || [];
  const all = roomPool.concat(universal);
  const matching = all.filter(w => w.type === targetType);
  if (matching.length === 0) {
    // Fall back to any word
    if (all.length === 0) return null;
    return all[Math.floor(Math.random() * all.length)];
  }
  return matching[Math.floor(Math.random() * matching.length)];
}

function rollResponseType(weights) {
  let r = Math.random();
  for (const k of Object.keys(weights)) {
    if ((r -= weights[k]) <= 0) return k;
  }
  return "silent";
}

function askSpiritQuestion(qKey) {
  const q = SPIRIT_QUESTIONS[qKey];
  if (!q) return;
  ensureState();
  state._spiritQs.asked += 1;
  // Disable buttons during the wait
  document.querySelectorAll(".sq-row button").forEach(b => b.disabled = true);
  // Show what we asked in the log, but DON'T read it aloud — the player is
  // the one asking, and we want the spirit-box reply (via speakDevice) to
  // be the only voice that comes out of the device.
  {
    const n = document.getElementById("narration");
    if (n) {
      const p = document.createElement("p");
      p.innerHTML = '<em>You ask, quietly into the device: "' + q.text.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '"</em>';
      n.appendChild(p);
      n.scrollTop = n.scrollHeight;
      while (n.children.length > 6) n.removeChild(n.firstChild);
    }
  }

  // Costs apply immediately — the asking itself stirs the house
  if (q.agg)   bumpAgg(q.agg, 'you asked: "' + q.text + '"');
  if (q.drain) dropComposure(q.drain, "asking what you did not want answered");

  // Roll a response type, weighted by truth state
  let weights = Object.assign({}, q.responses);
  if (state.truth === "debunked") {
    // No real spirit — most answers are noise or silence
    weights = { clue: 0.05, threat: 0.05, noise: 0.55, silent: 0.35 };
  } else if (state.truth === "partial") {
    // Halfway — clues are diluted
    weights.clue   = (weights.clue || 0) * 0.6;
    weights.noise  = (weights.noise || 0) + 0.2;
    weights.silent = (weights.silent || 0) + 0.05;
  }
  // Normalise
  let total = 0; for (const k of Object.keys(weights)) total += weights[k];
  for (const k of Object.keys(weights)) weights[k] /= total;
  const type = rollResponseType(weights);

  setTimeout(() => {
    if (type === "silent") {
      // Render a "no response" panel in place of the spirit word
      const wEl = document.querySelector("#tool-body .spirit-word");
      if (wEl) {
        wEl.textContent = "— silence —";
        wEl.style.color = "#5a4850";
        wEl.style.fontStyle = "italic";
      }
      if (typeof narrate === "function") narrate("<em>" + q.silentLine + "</em>");
    } else {
      const word = biasedPickByType(state.currentRoom, type);
      if (word) {
        const wEl = document.querySelector("#tool-body .spirit-word");
        if (wEl) {
          wEl.textContent = word.word;
          wEl.style.color = type === "clue" ? "#80d090" : type === "threat" ? "#d04040" : "#d4a878";
        }
        // Auto-log as an answer (worth full evidence credit)
        if (typeof logEvidence === "function") {
          const tag = type === "clue" ? "(clue)" : type === "threat" ? "(threat)" : "(noise)";
          logEvidence("Spirit Box", `Asked "${q.text}" — answer: "${word.word}" ${tag}.`);
        }
        if (typeof tts !== "undefined" && tts.speakDevice) {
          setTimeout(() => tts.speakDevice(word.word.toLowerCase(), { mode: "random", preempt: true }), 250);
        }
        // Threat answers escalate further
        if (type === "threat") bumpAgg(1, "the box answered in anger");
      }
    }
    // Re-enable after a beat so it doesn't feel mashable
    setTimeout(() => {
      document.querySelectorAll(".sq-row button").forEach(b => b.disabled = false);
    }, 1800);
  }, 1500);
}
window._sqAsk = askSpiritQuestion;

function injectSpiritQuestions() {
  const body = document.getElementById("tool-body");
  if (!body) return;
  if (body.querySelector(".sq-row")) return; // already injected this tick
  const titleEl = document.getElementById("tool-title");
  if (!titleEl || !titleEl.textContent.startsWith("Spirit Box")) return;
  const row = document.createElement("div");
  row.className = "sq-row";
  row.innerHTML = `
    <div class="sq-label">— ASK A QUESTION —</div>
    <div class="sq-buttons">
      <button data-q="here"  title="Low risk. A simple confirmation.">Are you here?</button>
      <button data-q="name"  title="Medium risk. A name draws attention.">What is your name?</button>
      <button data-q="death" title="High risk. Forces the entity to remember.">How did you die?</button>
      <button data-q="leave" title="High risk. May provoke.">Do you want me to leave?</button>
    </div>
    <div class="sq-hint">Each question costs nerve. Threats raise aggression.</div>
  `;
  row.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => askSpiritQuestion(btn.dataset.q);
  });
  body.appendChild(row);
}

// Wrap spiritSweep so the question palette is re-attached after every sweep tick
(function wrapSpiritSweep() {
  const origSweep = window.spiritSweep;
  if (typeof origSweep !== "function") return;
  window.spiritSweep = function () {
    origSweep.apply(this, arguments);
    try { injectSpiritQuestions(); } catch (e) {}
  };
})();

// ─────────────────────────────────────────────────────────────────────
// A. CURSED POSSESSIONS — Ashgrove only (this pass)
// ─────────────────────────────────────────────────────────────────────
//
// Four items, four rooms. Each appears as a hotspot once the player is
// in that room and Calder has left. Each is single-use per run and
// carries an explicit cost.

const CURSED_ITEMS = {
  mirror: {
    chapter: "ashgrove",
    room: "parlor",
    label: "A small mirror, face-down on the séance table",
    title: "THE HAUNTED MIRROR",
    flavor: "A silvered glass, palm-sized, face-down. The frame is bone or near to it. Margaret Ashgrove's, you suspect. Turning it over is, you understand without being told, a small trespass.",
    use: function () {
      // Reveal where an entity is currently located.
      const ents = Object.values(ENTITIES).filter(e => e.realInStates && e.realInStates.includes(state.truth));
      const hint = ents.length > 0
        ? (function () {
            const e = ents[Math.floor(Math.random() * ents.length)];
            const room = (typeof ROOMS !== "undefined" && ROOMS[e.room]) ? ROOMS[e.room].name : e.room;
            return `<em>The glass clouds, clears, and shows you a long corridor — and at the end of it, the ${room}. Something is in that room, watching back.</em>`;
          })()
        : "<em>The glass clouds, clears, and shows you only the room you are already in. There is, this time, no one in it but you.</em>";
      if (typeof narrate === "function") narrate(hint);
      bumpAgg(2, "you turned the mirror over");
      dropComposure(6, "a thing looking back");
      if (typeof showMilestone === "function") showMilestone("CURSED · THE MIRROR", hint);
      if (typeof advanceTime === "function") advanceTime(3);
      if (typeof logEvidence === "function") logEvidence("Cursed Possession", "Turned the bone-framed mirror. The glass showed a room.");
    }
  },
  musicbox: {
    chapter: "ashgrove",
    room: "nursery",
    label: "A small wooden music box on the windowsill",
    title: "THE MUSIC BOX",
    flavor: "Walnut, the lid scratched in a child's hand: <em>EVELYN, AGE 4</em>. The key is, improbably, still in it.",
    use: function () {
      const note = "<em>You wind the key. A few thin notes — <em>Mein Liebster ist gegangen</em>, you think — drift out. The house, almost at once, leans toward this room.</em>";
      if (typeof narrate === "function") narrate(note);
      if (typeof showMilestone === "function") showMilestone("CURSED · THE MUSIC BOX", note);
      // Lure: aggression climbs sharply; for the next 30 in-game minutes any
      // tool used in this room is more likely to read positive.
      state._cursed._lureRoom = "nursery";
      state._cursed._lureUntil = state.timeMinutes + 30;
      bumpAgg(3, "the music box drew the house in");
      dropComposure(4, "winding it");
      if (typeof advanceTime === "function") advanceTime(2);
      if (typeof logEvidence === "function") logEvidence("Cursed Possession", "Wound Evelyn's music box. The house turned its head.");
    }
  },
  ouija: {
    chapter: "ashgrove",
    room: "library",
    label: "A planchette, set on Elias's desk-blotter",
    title: "THE PLANCHETTE",
    flavor: "Not the board — just the small wooden pointer, on the blotter, as though someone had been about to use it and stopped.",
    use: function () {
      // Direct evidence reveal — pick the entity matching the truth state
      const cost = "<em>You set your fingers on it. It moves. You did not move it.</em>";
      if (typeof narrate === "function") narrate(cost);
      const realEnts = Object.values(ENTITIES).filter(e => e.realInStates && e.realInStates.includes(state.truth));
      let answer;
      if (state.truth === "debunked" || realEnts.length === 0) {
        // No one to speak — the board lies
        const lies = [
          "<em>It spells: <strong>YES YES YES YES YES</strong> — far past any question. Then it stops.</em>",
          "<em>It spells a date: <strong>OCT 14 1923</strong>. The library was empty that night, by every record.</em>",
          "<em>It spells your own name. You did not give it your name.</em>"
        ];
        answer = lies[Math.floor(Math.random() * lies.length)];
      } else {
        const e = realEnts[Math.floor(Math.random() * realEnts.length)];
        const ename = (e.name || "").toUpperCase();
        const room = (typeof ROOMS !== "undefined" && ROOMS[e.room]) ? ROOMS[e.room].name : e.room;
        answer = `<em>The planchette draws out, letter by patient letter: <strong>${ename}</strong>. Then: <strong>${room.toUpperCase()}</strong>.</em>`;
        if (typeof logEvidence === "function") logEvidence("Cursed Possession", `Planchette named: ${e.name}, in the ${room}.`);
        if (e && Object.keys(ENTITIES).find(k => ENTITIES[k] === e)) {
          state.entitiesSeen.add(Object.keys(ENTITIES).find(k => ENTITIES[k] === e));
        }
      }
      if (typeof narrate === "function") narrate(answer);
      if (typeof showMilestone === "function") showMilestone("CURSED · THE PLANCHETTE", answer);
      bumpAgg(2, "you put your fingers on the planchette");
      dropComposure(10, "letting it move you");
      if (typeof advanceTime === "function") advanceTime(5);
    }
  },
  tarot: {
    chapter: "ashgrove",
    room: "study",
    label: "A deck of tarot, fanned across Adeline's tapes",
    title: "TAROT — ONE CARD",
    flavor: "The deck is older than the tapes. It has been shuffled, recently, by someone who did not finish.",
    use: function () {
      const cards = [
        { name: "THE FOOL",       weight: 18, fx: function () {
            if (typeof narrate === "function") narrate("<em>The Fool. The reading recommends carrying on regardless. You have lost half an hour.</em>");
            if (typeof advanceTime === "function") advanceTime(30);
          } },
        { name: "THE TOWER",      weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The Tower, struck by lightning, figures falling. The house, in this instant, drops the temperature by twelve degrees.</em>");
            bumpAgg(4, "the Tower");
            dropComposure(15, "what the card showed");
            // Best-effort: trigger an immediate scare check next tick
            if (typeof scareTick === "function") setTimeout(scareTick, 600);
          } },
        { name: "THE HANGED MAN", weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The Hanged Man. A pause. The next instrument you use will read truly — once.</em>");
            state._cursed._nextToolGuaranteed = true;
          } },
        { name: "DEATH",          weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>Death. Not the end, the deck reminds you primly. The house, for a moment, stops attending to you.</em>");
            // Drop aggression
            if (typeof state.aggression === "number") {
              state.aggression = Math.max(0, state.aggression - 3);
              if (typeof renderDanger === "function") renderDanger();
            }
            gainComposure(8, "Death, in its proper sense");
          } },
        { name: "THE STAR",       weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The Star. Gentle, clear water, and the small reminder that you are not, after all, alone in the difficulty of this work.</em>");
            gainComposure(18, "the Star");
          } },
        { name: "THE MOON",       weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The Moon. The pool, the dog and the wolf. Some of what you have logged tonight is not true. The deck declines to say which.</em>");
            dropComposure(5, "doubt, freshly planted");
          } },
        { name: "THE LOVERS",     weight: 12, fx: function () {
            if (typeof narrate === "function") narrate("<em>The Lovers. Two figures, an angel above. The reading: trust an instrument over a witness.</em>");
            gainComposure(6, "a small clarity");
          } }
      ];
      // Weighted pick
      let total = 0; for (const c of cards) total += c.weight;
      let r = Math.random() * total;
      let pick = cards[0];
      for (const c of cards) { if ((r -= c.weight) <= 0) { pick = c; break; } }
      if (typeof showMilestone === "function") showMilestone("TAROT · " + pick.name, "<em>One card. One reading. The deck does not give second chances tonight.</em>");
      pick.fx();
      if (typeof advanceTime === "function") advanceTime(2);
      if (typeof logEvidence === "function") logEvidence("Cursed Possession", `Tarot pull: ${pick.name}.`);
    }
  },

  // ─── Wyndmere Hollow ──────────────────────────────────────────────
  wm_mirror: {
    chapter: "wyndmere",
    room: "wm_morning",
    label: "A small mirror, propped behind Vivian's turned canvas",
    title: "VIVIAN'S MIRROR",
    flavor: "A shard of mirror, no larger than a hand, set into a frame Vivian made herself. She had been using it, you understand, to paint what was over her shoulder.",
    use: function () {
      const ents = Object.values(ENTITIES).filter(e => e.realInStates && e.realInStates.includes(state.truth));
      const hint = ents.length > 0
        ? (function () {
            const e = ents[Math.floor(Math.random() * ents.length)];
            const room = (typeof ROOMS !== "undefined" && ROOMS[e.room]) ? ROOMS[e.room].name : e.room;
            return `<em>The glass shows you, briefly, the ${room}. Something in it is also holding a mirror — and looking, you understand, back through yours.</em>`;
          })()
        : "<em>The glass shows you the room you are in. Nothing in it but the canvas, turned, and you.</em>";
      if (typeof narrate === "function") narrate(hint);
      bumpAgg(2, "you angled the painter's mirror");
      dropComposure(6, "what was over your shoulder");
      if (typeof showMilestone === "function") showMilestone("CURSED · VIVIAN'S MIRROR", hint);
      if (typeof advanceTime === "function") advanceTime(3);
      if (typeof logEvidence === "function") logEvidence("Cursed Possession", "Turned Vivian's painting-mirror. The glass showed a room.");
    }
  },
  wm_cylinder: {
    chapter: "wyndmere",
    room: "wm_attic",
    label: "A wax cylinder labelled BEATRICE — HYMN FOR THE DROWNED",
    title: "THE WAX CYLINDER",
    flavor: "The label is in a doctor's hand. The cylinder itself is intact. There is, improbably, a working machine for it.",
    use: function () {
      const note = "<em>You crank the handle. A woman sings, very far down a long pipe — a hymn you do not, at first, recognise as Latin. The house, at once, tilts toward the chapel.</em>";
      if (typeof narrate === "function") narrate(note);
      if (typeof showMilestone === "function") showMilestone("CURSED · THE WAX CYLINDER", note);
      state._cursed._lureRoom = "wm_chapel";
      state._cursed._lureUntil = state.timeMinutes + 30;
      bumpAgg(3, "the hymn called the house in");
      dropComposure(4, "what she was singing");
      if (typeof advanceTime === "function") advanceTime(2);
      if (typeof logEvidence === "function") logEvidence("Cursed Possession", "Played Beatrice's hymn. The house listened.");
    }
  },
  wm_latinsheet: {
    chapter: "wyndmere",
    room: "wm_chapel",
    label: "A folded sheet of Father Aherne's annotations, under the altar cloth",
    title: "AHERNE'S NOTES",
    flavor: "Latin in one hand, English in another. The English hand is shaking. The Latin is not — it is, you suspect, not Aherne's at all.",
    use: function () {
      const cost = "<em>You read the Latin aloud. The page, when you finish, is warmer than the room.</em>";
      if (typeof narrate === "function") narrate(cost);
      const realEnts = Object.values(ENTITIES).filter(e => e.realInStates && e.realInStates.includes(state.truth));
      let answer;
      if (state.truth === "debunked" || realEnts.length === 0) {
        const lies = [
          "<em>The annotations name a person who, according to every record at Wyndmere, never existed.</em>",
          "<em>The annotations name an hour: <strong>3:11 a.m.</strong> The hour Theodore wrote was the hour they died.</em>",
          "<em>The page names you. You did not give Aherne your name.</em>"
        ];
        answer = lies[Math.floor(Math.random() * lies.length)];
      } else {
        const e = realEnts[Math.floor(Math.random() * realEnts.length)];
        const ename = (e.name || "").toUpperCase();
        const room = (typeof ROOMS !== "undefined" && ROOMS[e.room]) ? ROOMS[e.room].name : e.room;
        answer = `<em>The annotations name, plainly: <strong>${ename}</strong>. And the place she is, when she is anywhere: <strong>${room.toUpperCase()}</strong>.</em>`;
        if (typeof logEvidence === "function") logEvidence("Cursed Possession", `Aherne's annotations named: ${e.name}, in the ${room}.`);
        if (e && Object.keys(ENTITIES).find(k => ENTITIES[k] === e)) {
          state.entitiesSeen.add(Object.keys(ENTITIES).find(k => ENTITIES[k] === e));
        }
      }
      if (typeof narrate === "function") narrate(answer);
      if (typeof showMilestone === "function") showMilestone("CURSED · AHERNE'S NOTES", answer);
      bumpAgg(2, "you read Aherne's notes aloud");
      dropComposure(10, "what the Latin said");
      if (typeof advanceTime === "function") advanceTime(5);
    }
  },
  wm_pendulum: {
    chapter: "wyndmere",
    room: "wm_library",
    label: "Aherne's weighted pendulum, on a brass chain",
    title: "THE PENDULUM",
    flavor: "Brass and silver. Heavier than it looks. Father Aherne, you understand, did not approve of these — and used them anyway.",
    use: function () {
      const cards = [
        { name: "DUE EAST",   weight: 18, fx: function () {
            if (typeof narrate === "function") narrate("<em>The pendulum holds, very still, due east — toward the lake. You have, by the time it stops, lost half an hour.</em>");
            if (typeof advanceTime === "function") advanceTime(30);
          } },
        { name: "FALLING",    weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The chain breaks. The weight falls. The temperature, with it, drops twelve degrees in a heartbeat.</em>");
            bumpAgg(4, "the pendulum");
            dropComposure(15, "what the chain meant");
            if (typeof scareTick === "function") setTimeout(scareTick, 600);
          } },
        { name: "DUE NORTH",  weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The pendulum settles due north. A pause. The next instrument you use will read truly — once.</em>");
            state._cursed._nextToolGuaranteed = true;
          } },
        { name: "STILL",      weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The pendulum hangs absolutely still. The house, for a moment, stops attending to you.</em>");
            if (typeof state.aggression === "number") {
              state.aggression = Math.max(0, state.aggression - 3);
              if (typeof renderDanger === "function") renderDanger();
            }
            gainComposure(8, "a clean stillness");
          } },
        { name: "WIDE ARC",   weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The pendulum traces a wide, easy arc. Lake water, the priest used to say, can also be a comfort.</em>");
            gainComposure(18, "a wide arc");
          } },
        { name: "TIGHT CIRCLE", weight: 14, fx: function () {
            if (typeof narrate === "function") narrate("<em>The pendulum spins, very tight, the wrong way for the latitude. Some of what you have logged tonight is not true. The chain declines to say which.</em>");
            dropComposure(5, "doubt, freshly planted");
          } },
        { name: "TWO POINTS", weight: 12, fx: function () {
            if (typeof narrate === "function") narrate("<em>The pendulum picks out two points in the room — one near, one far — and rocks between them. Trust your instrument, the reading says, before any witness.</em>");
            gainComposure(6, "a small clarity");
          } }
      ];
      let total = 0; for (const c of cards) total += c.weight;
      let r = Math.random() * total;
      let pick = cards[0];
      for (const c of cards) { if ((r -= c.weight) <= 0) { pick = c; break; } }
      if (typeof showMilestone === "function") showMilestone("PENDULUM · " + pick.name, "<em>One reading. The brass does not give second chances tonight.</em>");
      pick.fx();
      if (typeof advanceTime === "function") advanceTime(2);
      if (typeof logEvidence === "function") logEvidence("Cursed Possession", `Pendulum reading: ${pick.name}.`);
    }
  }
};

function openCursedModal(key) {
  const item = CURSED_ITEMS[key];
  if (!item) return;
  const slot = cursedSlot();
  const used = !!slot[key + ":used"];
  const root = document.createElement("div");
  root.className = "cursed-overlay";
  root.innerHTML = `
    <div class="cursed-panel">
      <div class="cursed-title">${item.title}</div>
      <p class="cursed-flavor">${item.flavor}</p>
      ${used
        ? `<p class="cursed-spent"><em>You have already used this once. It will not, you suspect, work twice.</em></p>`
        : `<p class="cursed-warn">Using it costs <strong>composure</strong> and stirs the house. <em>Single use.</em></p>`}
      <div class="cursed-actions">
        ${used
          ? ""
          : `<button class="cursed-use">Use it</button>`}
        <button class="cursed-leave">${used ? "Close" : "Leave it alone"}</button>
      </div>
    </div>`;
  document.body.appendChild(root);
  const close = () => root.remove();
  root.querySelector(".cursed-leave").onclick = close;
  const useBtn = root.querySelector(".cursed-use");
  if (useBtn) {
    useBtn.onclick = () => {
      slot[key + ":used"] = true;
      sfx("chime");
      try { item.use(); } catch (e) { console && console.error && console.error(e); }
      close();
      // Re-render so the hotspot updates label/state
      if (typeof renderRoom === "function") setTimeout(renderRoom, 30);
    };
  }
}
window._cursedOpen = openCursedModal;

function addCursedHotspots() {
  if (!state.calderLeft) return;
  const ch = chapter();
  const rid = state.currentRoom;
  const hs = document.getElementById("scene-hotspots");
  if (!hs) return;
  const slot = cursedSlot();
  for (const key of Object.keys(CURSED_ITEMS)) {
    const item = CURSED_ITEMS[key];
    if (item.chapter && item.chapter !== ch) continue;
    if (item.room !== rid) continue;
    const used = !!slot[key + ":used"];
    const btn = document.createElement("button");
    btn.className = "hotspot-btn cursed-hotspot" + (used ? " cursed-spent" : "");
    btn.textContent = used ? "— " + item.title.toLowerCase() + " (spent)" : item.label;
    btn.onclick = () => openCursedModal(key);
    hs.appendChild(btn);
  }
}

// ─────────────────────────────────────────────────────────────────────
// D. BANISHMENT RITUAL — chapter-aware (Ashgrove + Wyndmere)
// ─────────────────────────────────────────────────────────────────────
//
// Components per chapter:
//   1. SALT-equivalent     — hotspot in a "preparation" room
//   2. TRUE NAME           — auto-set when player reads a naming document
//   3. PERSONAL EFFECT     — hotspot on a small intimate object
//
// Once all three are collected, a "Perform the rite" hotspot appears in
// the rite room. The rite is three skill checks; if the average score
// >= 0.6, BANISHED, and the verdict reflects it.

const RITE_CONFIG = {
  ashgrove: {
    saltRoom:   "kitchen",
    saltLabel:  "Take the lead-lined tin from the pantry shelf",
    saltTitle:  "RITE · SALT",
    saltNarr:   "<em>You take the small lead-lined tin of salt down from the pantry shelf. The label, in Adeline's hand: <strong>For the threshold, when needed.</strong></em>",
    saltMile:   "<em>A first component. The other two, presumably, exist.</em>",
    effectRoom: "nursery",
    effectLabel:"Pocket the silver thimble",
    effectTitle:"RITE · A PERSONAL EFFECT",
    effectNarr: "<em>You pocket the silver thimble. It is small enough to be forgotten, which is, of course, the point.</em>",
    effectMile: "<em>The kind of object a child does not, in the end, leave behind by choice.</em>",
    nameDocs:   ["sealed_letter", "coroner"],
    nameMile:   "<em>Eliza, the unbaptised. Of the three, the hardest to come by.</em>",
    performRoom:"parlor",
    performLabel:"✦ Perform the rite at the séance table",
    introNarr:  "<em>You set the salt around the séance table. You set the thimble in its centre. You speak Eliza's name, quietly, into the room.</em>",
    trueName:   "ELIZA",
    nameChoices:["MARGARET", "ELIZA", "ADELINE", "EVELYN"],
    winNarr1:   "<em>The salt holds. The name is spoken. The thimble lights, and what was in the wall is, by the time the small fire goes out, no longer in it.</em>",
    winNarr2:   "<em>You are, very suddenly, alone in the house. Properly alone. The way a house is, when nothing is in it.</em>",
    loseNarr:   "<em>The salt scatters. The name does not — quite — fit the room. The thimble does not light. The rite, you understand, is over, and was not enough.</em>"
  },
  wyndmere: {
    saltRoom:   "wm_kitchen",
    saltLabel:  "Take the pewter cellar of blessed salt from the dresser",
    saltTitle:  "RITE · SALT",
    saltNarr:   "<em>You take the pewter salt-cellar. Father Aherne blessed it himself; the salt has lain unused, but not idle, for thirty-six years.</em>",
    saltMile:   "<em>A first component. The other two, presumably, exist.</em>",
    effectRoom: "wm_master",
    effectLabel:"Take Eleanor's hair from the silver brush",
    effectTitle:"RITE · A PERSONAL EFFECT",
    effectNarr: "<em>You lift a soft, fair drift of Eleanor's hair from the brush. It is the kind of thing she would, in her right mind, never have left behind.</em>",
    effectMile: "<em>The kind of object that goes, of its own accord, to the one it belonged with.</em>",
    nameDocs:   ["wm_theo_casenotes", "wm_rituale", "wm_aherne_letter"],
    nameMile:   "<em>Beatrice, the woman who would not stay drowned. Of the three, the hardest to come by.</em>",
    performRoom:"wm_chapel",
    performLabel:"✦ Perform the rite at the altar",
    introNarr:  "<em>You set the blessed salt across the altar. You lay Eleanor's hair upon it. You speak Beatrice's name, quietly, into the room.</em>",
    trueName:   "BEATRICE",
    nameChoices:["VIVIAN", "BEATRICE", "ELEANOR", "MARY"],
    winNarr1:   "<em>The salt holds. The name is spoken. The hair takes the small fire, and what was in the lake is, by the time it goes out, no longer in it.</em>",
    winNarr2:   "<em>The lake, very suddenly, is only a lake. The house is only a house. Wyndmere is alone with itself again.</em>",
    loseNarr:   "<em>The salt scatters. The hair will not catch. The name — Beatrice — does not, quite, answer to the room. The rite is over, and was not enough.</em>"
  }
};

function riteCfg() { return RITE_CONFIG[chapter()] || RITE_CONFIG.ashgrove; }

function ritualReady() {
  ensureState();
  return state._ritual.salt && state._ritual.name && state._ritual.effect && !state._ritual.performed;
}

function collectSalt() {
  ensureState();
  if (state._ritual.salt) return;
  const c = riteCfg();
  state._ritual.salt = true;
  if (typeof narrate === "function") narrate(c.saltNarr);
  if (typeof showMilestone === "function") showMilestone(c.saltTitle, c.saltMile);
  sfx("chime");
  if (typeof advanceTime === "function") advanceTime(2);
  if (typeof renderRoom === "function") setTimeout(renderRoom, 30);
}

function collectThimble() {
  ensureState();
  if (state._ritual.effect) return;
  const c = riteCfg();
  state._ritual.effect = true;
  if (typeof narrate === "function") narrate(c.effectNarr);
  if (typeof showMilestone === "function") showMilestone(c.effectTitle, c.effectMile);
  sfx("chime");
  dropComposure(3, "taking a small dead thing");
  if (typeof advanceTime === "function") advanceTime(1);
  if (typeof renderRoom === "function") setTimeout(renderRoom, 30);
}

// Hook the docs-read mechanism — when a naming document is read,
// the true name is acquired. We poll on renderRoom for simplicity.
function checkNameFromDocs() {
  ensureState();
  if (state._ritual.name) return;
  const c = riteCfg();
  if (!state.docsRead) return;
  for (const id of c.nameDocs) {
    if (state.docsRead.has(id)) {
      state._ritual.name = true;
      if (typeof showMilestone === "function") showMilestone("RITE · A TRUE NAME", c.nameMile);
      return;
    }
  }
}

function addRitualHotspots() {
  if (!state.calderLeft) return;
  const c = riteCfg();
  const rid = state.currentRoom;
  const hs = document.getElementById("scene-hotspots");
  if (!hs) return;
  ensureState();
  checkNameFromDocs();

  if (rid === c.saltRoom && !state._ritual.salt) {
    const b = document.createElement("button");
    b.className = "hotspot-btn rite-hotspot";
    b.textContent = c.saltLabel;
    b.onclick = collectSalt;
    hs.appendChild(b);
  }
  if (rid === c.effectRoom && !state._ritual.effect) {
    const b = document.createElement("button");
    b.className = "hotspot-btn rite-hotspot";
    b.textContent = c.effectLabel;
    b.onclick = collectThimble;
    hs.appendChild(b);
  }
  if (rid === c.performRoom && ritualReady()) {
    const b = document.createElement("button");
    b.className = "hotspot-btn rite-hotspot rite-ready";
    b.textContent = c.performLabel;
    b.onclick = performBanishment;
    hs.appendChild(b);
  }
  // Progress chip on the rite room when not yet ready
  if (rid === c.performRoom && !ritualReady() && !state._ritual.performed
      && (state._ritual.salt || state._ritual.name || state._ritual.effect)) {
    const chip = document.createElement("button");
    chip.className = "hotspot-btn rite-hotspot rite-progress";
    chip.disabled = true;
    chip.textContent =
      "✦ Rite components: "
      + (state._ritual.salt   ? "salt · " : "— · ")
      + (state._ritual.name   ? "name · " : "— · ")
      + (state._ritual.effect ? "effect"   : "—");
    hs.appendChild(chip);
  }
}

// The rite itself — three sequential skill checks.
async function performBanishment() {
  ensureState();
  if (!ritualReady()) return;
  if (typeof runSkillCheck !== "function") {
    if (typeof narrate === "function") narrate("<em>(The rite requires the skill-check module, which is not loaded.)</em>");
    return;
  }
  state._ritual.performed = true;
  bumpAgg(2, "you began the rite");
  const cfg = riteCfg();
  if (typeof narrate === "function") narrate(cfg.introNarr);

  // STAGE 1 — Draw the salt circle (trace the perimeter of an SVG ring)
  const stage1 = await runSkillCheck({
    title: "RITE · 1 / 3 — THE CIRCLE",
    sub: "<strong>How to play:</strong> click and drag around the ring. The salt traces wherever your cursor passes. Cover the full circle without skipping.",
    durationMs: 14000,
    build: ({ stage, actions, finish }) => {
      const W = 320, H = 320;
      Object.assign(stage.style, { width: W + "px", height: H + "px", cursor: "crosshair" });
      stage.innerHTML = `
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#1c1208,#040204)"></div>
        <svg id="rite-circle" width="${W}" height="${H}" style="position:absolute;inset:0">
          <circle cx="160" cy="160" r="120" fill="none" stroke="#3a2818" stroke-width="2" stroke-dasharray="3 5"/>
        </svg>
        <canvas id="rite-canvas" width="${W}" height="${H}" style="position:absolute;inset:0"></canvas>
        <div style="position:absolute;left:8px;bottom:8px;right:8px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8a7565">COVERAGE: <span id="rite-cov">0%</span></div>
      `;
      const canvas = stage.querySelector("#rite-canvas");
      const ctx = canvas.getContext("2d");
      let drawing = false;
      const segments = 48; const visited = new Array(segments).fill(false);
      function angleSeg(x, y) {
        const dx = x - 160, dy = y - 160;
        const r = Math.hypot(dx, dy);
        if (r < 100 || r > 140) return -1;
        let a = Math.atan2(dy, dx); if (a < 0) a += Math.PI * 2;
        return Math.floor((a / (Math.PI * 2)) * segments);
      }
      function tag(x, y) {
        const s = angleSeg(x, y);
        if (s >= 0) visited[s] = true;
        ctx.fillStyle = "rgba(220, 200, 170, 0.9)";
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        const cov = Math.floor(visited.filter(Boolean).length / segments * 100);
        const covEl = stage.querySelector("#rite-cov");
        if (covEl) covEl.textContent = cov + "%";
      }
      function rel(e) {
        const r = stage.getBoundingClientRect();
        return { x: (e.clientX || (e.touches && e.touches[0].clientX) || 0) - r.left,
                 y: (e.clientY || (e.touches && e.touches[0].clientY) || 0) - r.top };
      }
      stage.addEventListener("mousedown", e => { drawing = true; const p = rel(e); tag(p.x, p.y); });
      stage.addEventListener("mousemove", e => { if (!drawing) return; const p = rel(e); tag(p.x, p.y); });
      stage.addEventListener("mouseup",   () => drawing = false);
      stage.addEventListener("mouseleave",() => drawing = false);
      stage.addEventListener("touchstart",e => { drawing = true; const p = rel(e); tag(p.x, p.y); e.preventDefault(); });
      stage.addEventListener("touchmove", e => { if (!drawing) return; const p = rel(e); tag(p.x, p.y); e.preventDefault(); });
      stage.addEventListener("touchend",  () => drawing = false);

      const seal = document.createElement("button");
      seal.type = "button"; seal.textContent = "Seal the circle";
      seal.onclick = () => {
        const cov = visited.filter(Boolean).length / segments;
        finish(Math.min(1, cov));
      };
      actions.insertBefore(seal, actions.firstChild);
    }
  });

  // STAGE 2 — Speak the name
  const stage2 = await runSkillCheck({
    title: "RITE · 2 / 3 — THE NAME",
    sub: "<strong>How to play:</strong> the rite calls for the child's true name. Choose carefully.",
    durationMs: 30000,
    build: ({ stage, actions, finish }) => {
      Object.assign(stage.style, { width: "320px", height: "180px" });
      const correct = cfg.trueName;
      const choices = cfg.nameChoices.slice();
      const grid = document.createElement("div");
      grid.style.cssText = "position:absolute;inset:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px;";
      for (const c of choices) {
        const btn = document.createElement("button");
        btn.type = "button"; btn.textContent = c;
        btn.style.cssText = "font-family:'Cinzel',serif;letter-spacing:3px;font-size:14px;padding:18px 0;background:#1a1208;border:1px solid #4a2818;color:#d4a878;cursor:pointer";
        btn.onclick = () => {
          if (c === correct) finish(1.0);
          else finish(0.2);
        };
        grid.appendChild(btn);
      }
      stage.appendChild(grid);
    }
  });

  // STAGE 3 — Burn the effect (timing meter)
  const stage3 = await runSkillCheck({
    title: "RITE · 3 / 3 — THE BURNING",
    sub: "<strong>How to play:</strong> a marker sweeps along the bar. Click <em>BURN</em> when the marker is inside the bright green zone.",
    durationMs: 12000,
    build: ({ stage, actions, finish }) => {
      const W = 380, H = 140;
      Object.assign(stage.style, { width: W + "px", height: H + "px" });
      stage.innerHTML = `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#1a0a04,#06030a)"></div>
        <div id="bn-bar" style="position:absolute;left:20px;right:20px;top:50%;height:24px;transform:translateY(-50%);background:linear-gradient(90deg,#3a1a08 0%,#3a1a08 38%,#80d090 38%,#80d090 50%,#3a1a08 50%,#3a1a08 62%,#3a1a08 100%);border:1px solid #4a2818"></div>
        <div id="bn-mark" style="position:absolute;left:20px;top:50%;width:3px;height:36px;background:#ffd498;transform:translateY(-50%);box-shadow:0 0 6px #ffd498"></div>
        <div style="position:absolute;left:0;right:0;bottom:8px;text-align:center;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8a7565">CLICK BURN WHEN THE MARKER IS GREEN</div>
      `;
      const mark = stage.querySelector("#bn-mark");
      const innerWidth = W - 40;
      let t = 0, dir = 1, raf;
      let lastT = performance.now();
      function loop(now) {
        const dt = (now - lastT) / 1000; lastT = now;
        t += dir * dt * 0.55;
        if (t > 1) { t = 1; dir = -1; }
        if (t < 0) { t = 0; dir = 1; }
        mark.style.left = (20 + t * innerWidth) + "px";
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      const burn = document.createElement("button");
      burn.type = "button"; burn.textContent = "BURN";
      burn.onclick = () => {
        cancelAnimationFrame(raf);
        const d = Math.abs(t - 0.5);
        const score = d < 0.06 ? 1.0 : d < 0.12 ? 0.65 : d < 0.18 ? 0.35 : 0.1;
        finish(score);
      };
      actions.insertBefore(burn, actions.firstChild);
    }
  });

  const score = ((stage1 || 0) + (stage2 || 0) + (stage3 || 0)) / 3;
  const succeeded = score >= 0.6;
  state._ritual.succeeded = succeeded;

  // Resolution narration + verdict hook
  if (succeeded) {
    if (typeof narrate === "function") {
      narrate(cfg.winNarr1);
      narrate(cfg.winNarr2);
    }
    if (typeof showMilestone === "function") showMilestone("BANISHED", "<em>What was here is here no longer. The verdict, in the morning, will be of a different shape.</em>");
    if (typeof state.aggression === "number") { state.aggression = 0; if (typeof renderDanger === "function") renderDanger(); }
    if (typeof unlockAchievement === "function") {
      unlockAchievement("first_correct");
      unlockAchievement("haunted_correct");
      unlockAchievement("banished");
    }
    sfx("chime");
  } else {
    if (typeof narrate === "function") {
      narrate(cfg.loseNarr);
    }
    if (typeof showMilestone === "function") showMilestone("RITE · INCOMPLETE", "<em>You have spent the components. The house has noticed.</em>");
    bumpAgg(4, "a botched rite");
    dropComposure(20, "the rite did not take");
  }
}
window._riteRun = performBanishment;

// Render-hook for cursed items + ritual hotspots
(function wrapRenderRoom() {
  const origRR = window.renderRoom;
  if (typeof origRR !== "function") return;
  window.renderRoom = function () {
    ensureState();
    origRR.apply(this, arguments);
    try { addCursedHotspots(); } catch (e) {}
    try { addRitualHotspots(); } catch (e) {}
  };
})();

// Hook into the verdict to acknowledge a banishment
(function wrapVerdictSubmit() {
  const origSV = window.submitVerdict;
  if (typeof origSV !== "function") return;
  window.submitVerdict = function (choice) {
    // If the player banished + then guesses correctly, the result page
    // gets a special intro. The default function handles scoring; we
    // just nudge the result element after the fact.
    origSV.apply(this, arguments);
    if (state._ritual && state._ritual.succeeded) {
      setTimeout(() => {
        const r = document.getElementById("verdict-result");
        if (!r) return;
        const banner = document.createElement("div");
        banner.className = "rite-banner";
        banner.innerHTML = "<strong>✦ BANISHED ✦</strong><br><em>The dawn breaks on a house that is, this time, properly empty.</em>";
        r.insertBefore(banner, r.firstChild);
      }, 80);
    }
  };
})();

// One-time init at script load (in case renderRoom has already fired)
ensureState();

})(); // end IIFE
