// puzzles.js — 7th-Guest-style standalone logic puzzles.
// One per chapter, attached to a real prop in a real room. Solving it
// rewards the player with a hidden document and a small composure boost.
// Both puzzles can be skipped (the lore reward is the only reward).
"use strict";

(function () {

function chapter() {
  return (typeof state !== "undefined" && state._story === "wyndmere") ? "wyndmere" : "ashgrove";
}

function injectStyles() {
  if (document.getElementById("puzzles-css")) return;
  const s = document.createElement("style");
  s.id = "puzzles-css";
  s.textContent = `
.puzzle-overlay {
  position: fixed; inset: 0; z-index: 9050;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(20,12,8,.94) 0%, rgba(0,0,0,.98) 100%);
  font-family: var(--serif-body, Georgia, serif);
  animation: puzFade .25s ease;
}
@keyframes puzFade { from { opacity: 0 } to { opacity: 1 } }
.puzzle-panel {
  background: linear-gradient(180deg,#1c1410 0%, #0c0806 100%);
  border: 1px solid #5a3820;
  padding: 24px 28px;
  max-width: 560px; width: calc(100% - 40px);
  color: #c8b89c;
  box-shadow: 0 0 80px rgba(120,40,20,.25);
}
.puzzle-title {
  font-family: var(--serif-display, "Cinzel", serif);
  font-size: 13px; letter-spacing: 5px;
  color: #b89868; margin-bottom: 10px; text-align: center;
}
.puzzle-flavor {
  font-size: 14px; line-height: 1.55; font-style: italic;
  color: #a89878; margin-bottom: 16px; text-align: center;
}
.puzzle-prompt {
  font-size: 15px; line-height: 1.55; margin-bottom: 16px;
}
.puzzle-input {
  width: 100%; background: rgba(20,12,8,.8); border: 1px solid #5a3820;
  color: #ffd8a8; font-family: var(--serif-display, "Cinzel", serif);
  font-size: 18px; letter-spacing: 6px; padding: 10px 14px;
  text-align: center; text-transform: uppercase;
}
.puzzle-knock-row {
  display: flex; justify-content: center; gap: 14px; margin: 20px 0;
}
.puzzle-knock-btn {
  width: 54px; height: 54px; border-radius: 50%;
  background: rgba(40,20,12,.7); border: 2px solid #5a3820;
  color: #d4a878; font-family: var(--serif-display, "Cinzel", serif);
  font-size: 22px; cursor: pointer; transition: all .1s;
}
.puzzle-knock-btn:hover { background: #4a2818; border-color: #c08040; }
.puzzle-knock-btn:active { transform: scale(0.92); background: #ffd498; color: #2a1810; }
.puzzle-tape {
  background: #0a0606; border: 1px solid #3a2818;
  padding: 8px 12px; margin: 10px 0; font-family: monospace;
  letter-spacing: 4px; min-height: 22px; color: #d4a878;
}
.puzzle-row {
  display: flex; justify-content: space-between; gap: 12px; margin-top: 16px;
}
.puzzle-btn {
  flex: 1; padding: 8px 12px;
  background: rgba(30,18,12,.7); border: 1px solid #6a4828;
  color: #c8a878; font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 3px; font-size: 11px; cursor: pointer;
}
.puzzle-btn:hover { background: #4a3018; color: #ffd8a8; }
.puzzle-status {
  font-size: 13px; margin-top: 10px; text-align: center; min-height: 18px;
}
.puzzle-status.bad { color: #c86848; }
.puzzle-status.good { color: #98c878; }
  `;
  document.head.appendChild(s);
}

function puzzleSolved(key) {
  return !!(state._puzzles && state._puzzles[key]);
}
function markSolved(key) {
  if (!state._puzzles) state._puzzles = {};
  state._puzzles[key] = true;
}

function openPuzzle(panelBuilder) {
  injectStyles();
  const overlay = document.createElement("div");
  overlay.className = "puzzle-overlay";
  const panel = panelBuilder(() => overlay.remove());
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

// ────────────────────────────────────────────────────────────────────
// ASHGROVE — Calder's study: the alphabet cipher
// Prop: a brass cylinder in Calder's desk drawer, engraved with
// 9 letters in an unfamiliar order. Below it, a slip: "Step three back."
// Caesar cipher, shift -3. Hidden message: ELIZACALE. Solution: "ELIZA CALE".
// Reward: a brittle photograph of Eliza, age 4, before the wall.
// ────────────────────────────────────────────────────────────────────
function ashgrovePuzzle(close) {
  const panel = document.createElement("div");
  panel.className = "puzzle-panel";
  const target = "ELIZACALE";
  // Encoded with +3 Caesar: H L L D D F D O H
  const encoded = "HOLCDFDOH"; // ELIZACALE → +3 → HOLCDFDOH (Z+3 wraps to C; A+3=D; L+3=O; E+3=H; I+3=L)
  // Recompute properly:
  // E(4)→H, L(11)→O, I(8)→L, Z(25)→C(wrap), A(0)→D, C(2)→F, A(0)→D, L(11)→O, E(4)→H
  // = HOLCDFDOH ✓
  panel.innerHTML = `
    <div class="puzzle-title">THE BRASS CYLINDER</div>
    <div class="puzzle-flavor">
      Mr. Calder's desk drawer, locked but ill-fitted. Inside, a brass cylinder
      engraved with nine letters in an unfamiliar order. Beneath it, in his
      hand: <em>Step three back. Adeline knew her alphabet.</em>
    </div>
    <div class="puzzle-tape" style="font-size:22px; letter-spacing:8px; text-align:center;">
      H&nbsp;O&nbsp;L&nbsp;C&nbsp;D&nbsp;F&nbsp;D&nbsp;O&nbsp;H
    </div>
    <div class="puzzle-prompt">
      <em>Step three back.</em> Enter the nine letters as they should read.
    </div>
    <input class="puzzle-input" id="puz-ash-in" maxlength="11" autocomplete="off" />
    <div class="puzzle-status" id="puz-ash-status"></div>
    <div class="puzzle-row">
      <button class="puzzle-btn" id="puz-ash-close">SET IT BACK DOWN</button>
      <button class="puzzle-btn" id="puz-ash-submit">SUBMIT</button>
    </div>
  `;
  setTimeout(() => panel.querySelector("#puz-ash-in").focus(), 50);
  const inEl = panel.querySelector("#puz-ash-in");
  const stEl = panel.querySelector("#puz-ash-status");
  function submit() {
    const v = inEl.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (v === target) {
      stEl.className = "puzzle-status good";
      stEl.textContent = "The cylinder clicks. Something inside it shifts.";
      markSolved("ashgrove_cipher");
      // Reward
      if (typeof showMilestone === "function") {
        showMilestone("PUZZLE · THE BRASS CYLINDER",
          "<em>A photograph slides out of the false base. A small girl, four perhaps, in a white dress. The handwriting on the back: <strong>Eliza, the day before. — A.</strong></em>");
      }
      if (typeof narrate === "function") narrate("<em>You set the cylinder down. A photograph has come loose from a hidden base — Eliza, age four, the day before the wall was plastered. Adeline kept her, you understand. She just could not keep her safe.</em>");
      if (typeof logEvidence === "function") logEvidence("Found Photograph", "Eliza Cale, age 4, the day before her disappearance. Adeline's hand on the back.");
      if (typeof gainComposure === "function") gainComposure(15, "a small mercy in brass");
      if (typeof audio !== "undefined" && audio.sfx) audio.sfx("chime");
      setTimeout(close, 1800);
    } else {
      stEl.className = "puzzle-status bad";
      stEl.textContent = "The cylinder will not turn. The letters do not belong in that order.";
      if (typeof audio !== "undefined" && audio.sfx) audio.sfx("click");
    }
  }
  panel.querySelector("#puz-ash-submit").onclick = submit;
  panel.querySelector("#puz-ash-close").onclick = close;
  inEl.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  return panel;
}

// ────────────────────────────────────────────────────────────────────
// WYNDMERE — Chapel: the knock pattern
// Prop: a confessional partition. Aherne's notes refer to a knock
// pattern that the lake answers to: short, short, long, short, long, long.
// Player must reproduce by clicking two buttons (SHORT / LONG).
// Reward: a third panel of the rite, in Beatrice's own hand.
// ────────────────────────────────────────────────────────────────────
function wyndmerePuzzle(close) {
  const panel = document.createElement("div");
  panel.className = "puzzle-panel";
  const target = ["S","S","L","S","L","L"]; // "··—·——"  (·=short, —=long)
  panel.innerHTML = `
    <div class="puzzle-title">THE CONFESSIONAL KNOCK</div>
    <div class="puzzle-flavor">
      A panel in the confessional. On the priest's side, a sticker, peeling:
      <em>"For the asking — short, short, long, short, long, long. Aherne does not approve."</em>
    </div>
    <div class="puzzle-prompt">
      Tap the pattern on the wood. The confessional, the lake, and whatever is
      in the lake, will hear you.
    </div>
    <div class="puzzle-knock-row">
      <button class="puzzle-knock-btn" id="puz-wm-short">·</button>
      <button class="puzzle-knock-btn" id="puz-wm-long">—</button>
    </div>
    <div class="puzzle-tape" id="puz-wm-tape">·&nbsp;·&nbsp;—&nbsp;·&nbsp;—&nbsp;—</div>
    <div class="puzzle-tape" id="puz-wm-you" style="opacity:.7; min-height:30px">&nbsp;</div>
    <div class="puzzle-status" id="puz-wm-status"></div>
    <div class="puzzle-row">
      <button class="puzzle-btn" id="puz-wm-reset">RESET</button>
      <button class="puzzle-btn" id="puz-wm-close">STEP BACK OUT</button>
    </div>
  `;
  const youEl = panel.querySelector("#puz-wm-you");
  const stEl  = panel.querySelector("#puz-wm-status");
  let input = [];
  function render() {
    youEl.innerHTML = input.length
      ? input.map(c => c === "S" ? "·" : "—").join("&nbsp;")
      : "&nbsp;";
  }
  function tap(kind) {
    input.push(kind);
    if (typeof audio !== "undefined" && audio.sfx) {
      audio.sfx(kind === "S" ? "wood_settle" : "distant_door");
    }
    render();
    if (input.length === target.length) {
      const ok = input.every((v, i) => v === target[i]);
      if (ok) {
        stEl.className = "puzzle-status good";
        stEl.textContent = "Something on the other side of the panel knocks once, in answer.";
        markSolved("wyndmere_knock");
        if (typeof showMilestone === "function") {
          showMilestone("PUZZLE · THE CONFESSIONAL KNOCK",
            "<em>A folded paper falls out from behind the partition. Beatrice's hand, not Aherne's: <strong>the third panel of the rite, the one he would not perform.</strong></em>");
        }
        if (typeof narrate === "function") narrate("<em>The confessional answers. A folded paper slips out from behind the panel — Beatrice's hand, the third panel of the rite, the one Father Aherne would not perform.</em>");
        if (typeof logEvidence === "function") logEvidence("Recovered Document", "Beatrice's third panel of the rite. The one Aherne refused.");
        if (typeof gainComposure === "function") gainComposure(15, "a confession heard");
        if (typeof audio !== "undefined" && audio.sfx) audio.sfx("chime");
        setTimeout(close, 1800);
      } else {
        stEl.className = "puzzle-status bad";
        stEl.textContent = "Wood under your knuckles. Nothing answers. Try again.";
        if (typeof audio !== "undefined" && audio.sfx) audio.sfx("click");
        setTimeout(() => { input = []; render(); stEl.textContent = ""; stEl.className = "puzzle-status"; }, 1500);
      }
    }
  }
  panel.querySelector("#puz-wm-short").onclick = () => tap("S");
  panel.querySelector("#puz-wm-long").onclick  = () => tap("L");
  panel.querySelector("#puz-wm-reset").onclick = () => { input = []; render(); stEl.textContent = ""; stEl.className = "puzzle-status"; };
  panel.querySelector("#puz-wm-close").onclick = close;
  render();
  return panel;
}

// Hotspots — add to scene when in the right room and not yet solved.
function addPuzzleHotspots() {
  if (typeof state === "undefined" || !state.calderLeft) return;
  const ch = chapter();
  const rid = state.currentRoom;
  const hs = document.getElementById("scene-hotspots");
  if (!hs) return;
  if (ch === "ashgrove" && rid === "study" && !puzzleSolved("ashgrove_cipher")) {
    const b = document.createElement("button");
    b.className = "hotspot-btn cursed-hotspot";
    b.textContent = "Open the locked drawer of Calder's desk";
    b.onclick = () => openPuzzle(ashgrovePuzzle);
    hs.appendChild(b);
  }
  if (ch === "wyndmere" && rid === "wm_chapel" && !puzzleSolved("wyndmere_knock")) {
    const b = document.createElement("button");
    b.className = "hotspot-btn cursed-hotspot";
    b.textContent = "Step into the confessional";
    b.onclick = () => openPuzzle(wyndmerePuzzle);
    hs.appendChild(b);
  }
}

// Hook into renderRoom (after all other hotspot adders)
(function hookRenderRoom() {
  if (typeof window === "undefined") return;
  const orig = window.renderRoom;
  if (typeof orig !== "function") { setTimeout(hookRenderRoom, 200); return; }
  window.renderRoom = function () {
    const r = orig.apply(this, arguments);
    try { addPuzzleHotspots(); } catch (e) {}
    return r;
  };
})();

window.openPuzzle = openPuzzle;
window.ashgrovePuzzle = ashgrovePuzzle;
window.wyndmerePuzzle = wyndmerePuzzle;

})();
