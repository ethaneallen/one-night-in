// taunts.js — Stauf-style host taunts.
// Calder narrates Ashgrove. Theodore narrates Wyndmere. Both have three tiers
// of taunt scaling with state.aggression: friendly, cool, malicious. One taunt
// every 4-7 game-minutes of *real* play time (gated on real-time so they do
// not all fire during long waits/silences).
"use strict";

(function () {

const TAUNTS_ASHGROVE_FRIENDLY = [
  "Mr. Calder, dryly, in a back hallway: *Mind the third step. It is, as I said, false.*",
  "Calder's voice, from nowhere obvious: *You are doing very well. Better than the last one. He left, you understand, in a basket.*",
  "Calder: *Old man Cale built the house. He built it slow, he built it tall — and what he built, in the end, was a mouth.*",
  "Calder, faintly: *The bell does not need pulling. The bell rings when it wishes to be answered.*",
  "Calder: *Adeline would have liked you. She liked the ones who asked. The ones who did not ask, mostly, did not last.*",
];
const TAUNTS_ASHGROVE_COOL = [
  "Calder, closer than he should be: *You have stood, now, where she taught. You have not, yet, asked what she taught.*",
  "Calder: *The house gives, in its way. It gives you what you brought. Tonight, you brought a great deal.*",
  "Calder: *The fifth lie — and there is a fifth — was a kindness. I will not, you understand, tell you which.*",
  "Calder: *You have been here three hours. The house has been here four hundred. It can wait.*",
  "Calder: *Ring once for Margaret. Ring twice for Adeline. Ring three, very carefully, for the one with no name.*",
];
const TAUNTS_ASHGROVE_MALICIOUS = [
  "Calder, very near the back of your neck: *She is in the room with you. She has been. She is patient with patient people.*",
  "Calder: *Run if you must. The house has, in its experience, been run from before. The house, in its experience, wins.*",
  "Calder, smiling — you can hear it: *Old man Cale built the house. Old man Cale built it for guests. Old man Cale built it, in the end, for one specific guest. The chair, sir, is yours.*",
  "Calder: *Your composure is at the floor. Mine has been at the floor for fifty years. You get used to it.*",
  "Calder: *I will not be sorry. I am paid not to be sorry. I am paid, as it happens, by the house.*",
];

const TAUNTS_WYNDMERE_FRIENDLY = [
  "Theodore Thrale, doctor-soft: *You should not, of course, be in here. But you are, of course, in here. Do mind the lake.*",
  "Theodore: *Eleanor is sleeping. Eleanor is always sleeping. The trick of it is that Eleanor is not, in fact, the one asleep.*",
  "Theodore: *I went to Boston. I came back. I did not, as it turned out, come back alone.*",
  "Theodore, distant: *Vivian painted what was over her shoulder. She painted, in the end, very well.*",
  "Theodore: *The hydrangeas are not, you understand, hydrangeas. They are an instrument. They listen.*",
];
const TAUNTS_WYNDMERE_COOL = [
  "Theodore: *You have read Aherne's letter. Aherne, when he wrote it, did not know how to finish it. He still does not.*",
  "Theodore: *Beatrice was a doctor's wife. Beatrice is, at present, a lake.*",
  "Theodore, against your ear: *The cylinder was for me. It has, since, decided otherwise.*",
  "Theodore: *Father Aherne went out on the lake, in March of '04, with one rite in his pocket and another in his throat. The lake took the throat.*",
  "Theodore: *I do not, professionally, believe in souls. I do, professionally, believe in what walks out of the boathouse at three.*",
];
const TAUNTS_WYNDMERE_MALICIOUS = [
  "Theodore, no longer soft: *She will not stay drowned. She has, of late, learned to bring company.*",
  "Theodore: *You spoke her name. You should not, in this house, have spoken her name. She is now, you understand, listening to whoever speaks next.*",
  "Theodore: *The water in the foyer vase is lake water. So is the water in the kettle. So, presently, is most of you.*",
  "Theodore: *The chapel will not, tonight, refuse you. It has very much, tonight, decided not to refuse anyone.*",
  "Theodore: *Run if you must. The lake is, after all, very patient with a runner.*",
];

function _tier() {
  const agg = (typeof state !== "undefined" && state.aggression) || 0;
  if (agg >= 65) return "mal";
  if (agg >= 30) return "cool";
  return "friend";
}
function _pool() {
  const ch = (typeof state !== "undefined" && state._story === "wyndmere") ? "wm" : "ash";
  const t = _tier();
  if (ch === "ash") {
    if (t === "mal")  return TAUNTS_ASHGROVE_MALICIOUS;
    if (t === "cool") return TAUNTS_ASHGROVE_COOL;
    return TAUNTS_ASHGROVE_FRIENDLY;
  } else {
    if (t === "mal")  return TAUNTS_WYNDMERE_MALICIOUS;
    if (t === "cool") return TAUNTS_WYNDMERE_COOL;
    return TAUNTS_WYNDMERE_FRIENDLY;
  }
}

let _lastTauntAt = 0;
let _shown = new Set();
const MIN_GAP_MS = 4 * 60 * 1000;   // 4 minutes real-time minimum
const MAX_GAP_MS = 8 * 60 * 1000;
let _nextDue = Date.now() + (3 * 60 * 1000) + Math.random() * 2 * 60 * 1000;

function _markdownToHtml(s) {
  return String(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function tauntTick() {
  if (typeof state === "undefined") return;
  if (!state.calderLeft) return;           // Don't taunt during prologue
  if (state._dead) return;
  if (state._verdict) return;
  // Don't talk over an open overlay
  if (document.querySelector(".hint-overlay, .vignette-overlay, .riddle-overlay, .puzzle-overlay, .modal-open")) return;
  if (Date.now() < _nextDue) return;

  const pool = _pool();
  const unshown = pool.filter(t => !_shown.has(t));
  const list = unshown.length ? unshown : pool;
  const pick = list[Math.floor(Math.random() * list.length)];
  _shown.add(pick);
  _lastTauntAt = Date.now();
  _nextDue = Date.now() + MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);

  if (typeof narrate === "function") narrate(_markdownToHtml(pick));
  if (typeof audio !== "undefined" && audio.duckBed) audio.duckBed(0.7, 1800);
}

// Ambient audio orchestrator — start creep music & granular bed once
// investigation begins; stop when player dies or returns to title.
let _ambientStarted = false;
function ambientTick() {
  if (typeof audio === "undefined") return;
  if (typeof state === "undefined") return;
  const shouldRun = !!state.calderLeft && !state._dead && !state._verdict;
  if (shouldRun && !_ambientStarted) {
    if (audio.startCreepLayer) audio.startCreepLayer();
    if (audio.startGranularBed) audio.startGranularBed();
    _ambientStarted = true;
  } else if (!shouldRun && _ambientStarted) {
    if (audio.stopCreepLayer) audio.stopCreepLayer();
    if (audio.stopGranularBed) audio.stopGranularBed();
    _ambientStarted = false;
  }
}

// Public manual trigger so dev console / verdict / scares can force a taunt.
window.forceTaunt = function () {
  const pool = _pool();
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (typeof narrate === "function") narrate(_markdownToHtml(pick));
};

// Dead-air gate hook: monkey-patch audio.sfx('screech') / 'jolt' to pre-gate.
// Subtle but powerful — silence right before the loud thing.
(function attachDeadAirHook() {
  if (typeof audio === "undefined" || !audio.sfx) { setTimeout(attachDeadAirHook, 300); return; }
  const orig = audio.sfx.bind(audio);
  audio.sfx = function (name) {
    if (name === "screech" || name === "jolt") {
      if (audio.deadAirGate) audio.deadAirGate(450);
      // Tiny delay so the silence registers BEFORE the impact
      setTimeout(() => orig(name), 280);
      return;
    }
    return orig(name);
  };
})();

// Tick both systems every 8 seconds
setInterval(() => { try { tauntTick(); } catch (e) {} try { ambientTick(); } catch (e) {} }, 8000);

})();
