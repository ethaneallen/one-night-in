// hints.js — the only AI-adjacent feature kept: a player-requested HINT
// system. Pure local fallback table now (no API calls). Each hint costs
// the investigator real money, real composure, real aggression, and real
// time — the house never gives a thing for free.
//
// Replaces the old `playability-wave3-ai.js`. Loads after game.js.
"use strict";

(function () {

// ── Tunables ─────────────────────────────────────────────────────────────
const HINTS_PER_NIGHT = 3;
const HINT_COST_DOLLARS = 1500; // deducted from final payout per hint used
const HINT_COST_AGGRESSION = 3; // bump on use
const HINT_COST_COMPOSURE  = 15; // drain on use
const HINT_COST_MINUTES    = 20; // advanceTime on use

// ── Story-aware hint pools ───────────────────────────────────────────────
const HINTS_ASHGROVE = [
  "Listen to the rooms you have not entered. The house keeps its secrets in the places you have not bothered to look.",
  "You have not yet stood where Eliza taught. The cold there is older.",
  "You have not read every page in the library. The page that matters is the one on yellow paper.",
  "The cellar door has a new lock. New locks have reasons.",
  "There is a name in nine letters. Speak it and the night will answer.",
  "The bell in the séance room will ring for those who ring it properly. You have not been proper.",
  "The east wall of the nursery does not face east. Mind that.",
  "Mr. Calder has been here fifty years. He has told you four lies. There is a fifth.",
  "The portrait in the parlor was painted before the fire, and the fire was very particular.",
  "You have a camera. You have not used it on every face.",
];

const HINTS_WYNDMERE = [
  "The padlock on the attic door is older than the door it guards. Padlocks have reasons.",
  "The typewriter in the chapel is not, strictly speaking, idle. It is patient.",
  "Three stones at the tide line. They were laid in an order. The lake will not say which.",
  "Eleanor's hairbrush has been moved. It is moved again, while you read this.",
  "The portrait on the landing was painted in a hurry. Painters who hurry are usually afraid.",
  "Vivian's window opens by itself. It would prefer you noticed which way.",
  "The kettle in the kitchen is just off the boil. It has been just off the boil since you arrived.",
  "Mrs. Thrale has not, in your hearing, said the priest's name. Listen for what she does not say.",
  "There is a second boat in the boathouse. There should be one.",
  "The hydrangeas in the foyer are freshly arranged. They were not, when you came in.",
  "Father Aherne's letter is dated the morning of the deaths. Letters dated that way are usually finished by other hands.",
  "The annotated Rituale Romanum is written in the doctor's hand. The doctor was not, in his training, a priest.",
];

function _pool() {
  return (typeof state !== "undefined" && state._story === "wyndmere")
    ? HINTS_WYNDMERE : HINTS_ASHGROVE;
}

// ── Stauf-style host commentary: a snide preface paired with every hint.
// Tiered by aggression. Calder for Ashgrove, Theodore for Wyndmere.
const HOST_PREFIX_ASH = {
  friendly: [
    "Mr. Calder, kindly: ",
    "Calder, from a back hallway: ",
    "Calder, at no charge: "
  ],
  cool: [
    "Calder, less kindly: ",
    "Calder, with a small sigh: ",
    "Calder, very precisely: "
  ],
  mean: [
    "Calder, smiling — you can hear it: ",
    "Calder, no longer pretending: ",
    "Calder, who has watched four others ask before you: "
  ]
};
const HOST_PREFIX_WM = {
  friendly: [
    "Doctor Thrale, professionally: ",
    "Theodore, against the rules of his profession: ",
    "Theodore, doctor-soft: "
  ],
  cool: [
    "Theodore, less professionally: ",
    "Theodore, who has begun to enjoy this: ",
    "Theodore, very nearly amused: "
  ],
  mean: [
    "Theodore, no longer soft: ",
    "Theodore, who is, you understand, in the lake: ",
    "Theodore, who has decided you will not, in the end, leave: "
  ]
};
function _hostPrefix() {
  const ch = (typeof state !== "undefined" && state._story === "wyndmere") ? "wm" : "ash";
  const agg = (typeof state !== "undefined" && state.aggression) || 0;
  const tier = agg >= 65 ? "mean" : agg >= 30 ? "cool" : "friendly";
  const dict = ch === "wm" ? HOST_PREFIX_WM : HOST_PREFIX_ASH;
  const arr = dict[tier];
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Styles (scoped) ──────────────────────────────────────────────────────
(function injectStyles() {
  if (document.getElementById("hints-css")) return;
  const s = document.createElement("style");
  s.id = "hints-css";
  s.textContent = `
.hint-fab {
  background: rgba(20,12,8,.82);
  border: 1px solid #6a3820;
  color: #d4a878;
  padding: 3px 11px;
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 2px; font-size: 10px;
  border-radius: 2px;
  pointer-events: auto;
  cursor: pointer; transition: all .15s;
}
.hint-fab:hover:not(:disabled) { background: #4a2818; color: #ffd498; border-color: #c08040; }
.hint-fab:disabled { opacity: .35; cursor: default; }
.hint-overlay {
  position: fixed; inset: 0; z-index: 9100;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(20,10,8,.84) 0%, rgba(0,0,0,.96) 100%);
  font-family: var(--serif-body, Georgia, serif);
  animation: hintFade .2s ease;
}
@keyframes hintFade { from { opacity: 0 } to { opacity: 1 } }
.hint-panel {
  background: linear-gradient(180deg,#1c1410 0%, #0c0806 100%);
  border: 1px solid #6a3820;
  box-shadow: 0 0 0 1px #8a5028 inset, 0 30px 80px rgba(0,0,0,.7);
  padding: 22px 26px 18px;
  width: min(560px, 94vw);
  max-height: 90vh; overflow: auto;
  color: #d4a878; border-radius: 4px;
}
.hint-title {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 5px; font-size: 16px; color: #c08040;
  margin: 0 0 8px; text-align: center;
}
.hint-sub {
  font-size: 14px; color: #b89878; font-style: italic;
  margin: 0 0 14px; text-align: center; line-height: 1.55;
}
.hint-cost {
  background: #2a0c0a; border: 1px solid #6a2020;
  padding: 12px 14px; margin: 10px 0 14px;
  font-size: 13.5px; color: #e88060; line-height: 1.65;
  font-family: var(--serif-body, Georgia, serif);
}
.hint-cost strong { color: #ff8060; letter-spacing: 1px; }
.hint-cost ul { margin: 6px 0 2px 22px; padding: 0; }
.hint-cost li { margin: 2px 0; }
.hint-reply {
  background: #08060a; border-left: 3px solid #c08040;
  padding: 14px 16px; margin: 14px 0;
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 0.5px; font-size: 16px; line-height: 1.7;
  color: #ffd498;
}
.hint-row { display: flex; gap: 10px; justify-content: center; margin-top: 8px; }
.hint-btn {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 2px; font-size: 13px;
  background: #2a1810; color: #d4a878;
  border: 1px solid #6a3820; padding: 10px 18px;
  cursor: pointer; transition: all .15s;
}
.hint-btn:hover:not(:disabled) { background: #4a2818; color: #ffd498; }
.hint-btn.danger { color: #ff8060; border-color: #6a2020; }
.hint-btn.danger:hover:not(:disabled) { background: #3a0c08; color: #ffa080; }
.hint-btn:disabled { opacity: .35; cursor: default; }
.hint-tally {
  text-align: center; font-size: 12px; color: #8a7565;
  margin-top: 10px; font-style: italic; letter-spacing: 1px;
}
`;
  document.head.appendChild(s);
})();

// ── State helpers ────────────────────────────────────────────────────────
function hintsUsed() { return (state._hintsUsed || 0); }
function hintsLeft() { return Math.max(0, HINTS_PER_NIGHT - hintsUsed()); }
function totalPenalty() { return hintsUsed() * HINT_COST_DOLLARS; }

// ── Floating button ──────────────────────────────────────────────────────
function ensureHintBtn() {
  if (typeof state === "undefined" || !state.calderLeft) {
    const old = document.getElementById("hint-fab");
    if (old) old.remove();
    return;
  }
  let btn = document.getElementById("hint-fab");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "hint-fab";
    btn.className = "hint-fab";
    btn.type = "button";
    btn.onclick = openHintConfirm;
  }
  const row = document.getElementById("sk-hud-row");
  if (row && btn.parentElement !== row) row.appendChild(btn);
  else if (!row && !btn.parentElement) document.body.appendChild(btn);
  updateHintBtn();
}
function updateHintBtn() {
  const btn = document.getElementById("hint-fab");
  if (!btn) return;
  const left = hintsLeft();
  btn.textContent = left > 0
    ? `🔔 HINT · ${left} LEFT`
    : `🔔 HINTS · SPENT`;
  btn.title = left > 0
    ? `Get one oblique hint from the house. COSTS $${HINT_COST_DOLLARS.toLocaleString()}, plus your nerves and the night's clock.`
    : "You have used all three hints tonight.";
  btn.disabled = left <= 0;
}

// ── Confirmation modal (cost shown before commit) ────────────────────────
function openHintConfirm() {
  if (hintsLeft() <= 0) return;
  const overlay = document.createElement("div");
  overlay.className = "hint-overlay";
  const panel = document.createElement("div");
  panel.className = "hint-panel";
  const left = hintsLeft();
  const alreadySpent = totalPenalty();
  panel.innerHTML = `
    <div class="hint-title">ASK THE HOUSE FOR A HINT</div>
    <div class="hint-sub">You close your eyes and listen for one piece of guidance. It is not free.</div>
    <div class="hint-cost">
      <strong>EACH HINT WILL COST YOU:</strong>
      <ul>
        <li><strong>$${HINT_COST_DOLLARS.toLocaleString()}</strong> deducted from your final payout</li>
        <li><strong>+${HINT_COST_AGGRESSION}</strong> aggression — the house notices you asked</li>
        <li><strong>−${HINT_COST_COMPOSURE}</strong> composure — your nerves take it personally</li>
        <li><strong>+${HINT_COST_MINUTES} minutes</strong> consumed on the clock</li>
      </ul>
      ${alreadySpent ? `<div style="margin-top:8px;color:#c08040">Already deducted from this run: <strong>$${alreadySpent.toLocaleString()}</strong>.</div>` : ""}
    </div>
    <div class="hint-row">
      <button class="hint-btn" id="hint-cancel">No, I'll keep looking</button>
      <button class="hint-btn danger" id="hint-confirm">Yes — pay the cost</button>
    </div>
    <div class="hint-tally">${left} hint${left===1?"":"s"} remain before dawn.</div>
  `;
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  panel.querySelector("#hint-cancel").onclick = () => overlay.remove();
  panel.querySelector("#hint-confirm").onclick = () => {
    overlay.remove();
    deliverHint();
  };
}

// ── Deliver the hint and apply all costs ─────────────────────────────────
function deliverHint() {
  if (hintsLeft() <= 0) return;
  state._hintsUsed = hintsUsed() + 1;

  // Apply costs — non-lethal. Hints scare you; they will not kill you.
  if (typeof advanceTime === "function") advanceTime(HINT_COST_MINUTES);
  // Aggression bump, but never push past 90 from a hint.
  if (typeof state !== "undefined") {
    const aBefore = state.aggression || 0;
    const aAfter  = Math.min(90, aBefore + HINT_COST_AGGRESSION);
    const aDelta  = Math.max(0, aAfter - aBefore);
    if (aDelta > 0 && typeof bumpAggression === "function") {
      bumpAggression(aDelta, "you asked the house for help");
    }
    // Composure drain, but floor at 20 so a hint never breaks you.
    const cBefore = typeof state.composure === "number" ? state.composure : 100;
    const cAfter  = Math.max(20, cBefore - HINT_COST_COMPOSURE);
    const cDelta  = cBefore - cAfter;
    if (cDelta > 0 && typeof drainComposure === "function") {
      drainComposure(cDelta, "you broke and asked");
    }
  }

  // Pick a hint, prefer ones not yet shown this run
  if (!state._hintsShown) state._hintsShown = [];
  const pool = _pool();
  const unshown = pool.filter(h => !state._hintsShown.includes(h));
  const chosen = (unshown.length ? unshown : pool)[Math.floor(Math.random() * (unshown.length || pool.length))];
  state._hintsShown.push(chosen);

  // Stauf-style host commentary prefix — flavour scales with aggression.
  const prefix = _hostPrefix();
  const displayed = prefix + "*" + chosen + "*";

  // Show the hint
  const overlay = document.createElement("div");
  overlay.className = "hint-overlay";
  const panel = document.createElement("div");
  panel.className = "hint-panel";
  const totalDeducted = totalPenalty();
  panel.innerHTML = `
    <div class="hint-title">THE HOUSE ANSWERS</div>
    <div class="hint-reply"><span class="hint-prefix">${escapeHtml(prefix)}</span><em>${escapeHtml(chosen)}</em></div>
    <div class="hint-tally">
      $${HINT_COST_DOLLARS.toLocaleString()} deducted · ${hintsLeft()} hint${hintsLeft()===1?"":"s"} remain ·
      Total deducted this run: <strong>$${totalDeducted.toLocaleString()}</strong>
    </div>
    <div class="hint-row" style="margin-top:14px">
      <button class="hint-btn" id="hint-close">Open your eyes</button>
    </div>
  `;
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  panel.querySelector("#hint-close").onclick = () => overlay.remove();

  // Side effects: record in journal so player can reread the hint
  if (typeof logEvidence === "function") {
    logEvidence("Hint Used (−$" + HINT_COST_DOLLARS.toLocaleString() + ")", `You asked. The house answered: "${chosen}"`);
  }
  if (typeof audio !== "undefined") {
    if (audio.sfx) { try { audio.sfx("breath"); } catch(e){} }
    if (audio.duckBed) audio.duckBed(0.5, 1500);
    if (audio.warpBed) audio.warpBed(80, 2200);
  }
  if (typeof tts !== "undefined" && tts.speak) tts.speak(prefix + chosen, { preempt: false });

  updateHintBtn();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Hook into renderHud so the button appears/disappears with calderLeft ─
(function wrapHud() {
  if (typeof window === "undefined") return;
  const orig = window.renderHud;
  if (typeof orig !== "function") {
    // renderHud may not be defined yet; try later
    setTimeout(wrapHud, 200);
    return;
  }
  if (orig._hintsWrapped) return;
  window.renderHud = function patched() {
    const out = orig.apply(this, arguments);
    ensureHintBtn();
    return out;
  };
  window.renderHud._hintsWrapped = true;
})();

// Boot-time attempt (save-load mid-night)
setTimeout(() => {
  try { if (state && state.calderLeft) ensureHintBtn(); } catch (e) {}
}, 1200);

// Expose for engine integration (scorecard pulls totalPenalty)
window.HINTS = {
  used: hintsUsed,
  left: hintsLeft,
  totalPenalty: totalPenalty,
  COST_PER_HINT: HINT_COST_DOLLARS
};

})();
