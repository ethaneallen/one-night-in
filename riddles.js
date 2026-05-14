// riddles.js — 11th-Hour-style cryptic riddle inventory.
// A chip in the HUD-row that opens a modal listing the player's current
// open threads phrased as Stauf-style couplets. The text auto-derives from
// game state: which docs unread, which entities unseen, which ritual
// components missing, which rooms unvisited, which puzzles unsolved.
"use strict";

(function () {

function chapter() {
  return (typeof state !== "undefined" && state._story === "wyndmere") ? "wyndmere" : "ashgrove";
}

function injectStyles() {
  if (document.getElementById("riddles-css")) return;
  const s = document.createElement("style");
  s.id = "riddles-css";
  s.textContent = `
.riddle-chip {
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
.riddle-chip:hover { background: #4a2818; color: #ffd498; border-color: #c08040; }
.riddle-overlay {
  position: fixed; inset: 0; z-index: 9100;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(20,10,8,.88) 0%, rgba(0,0,0,.96) 100%);
  font-family: var(--serif-body, Georgia, serif);
  animation: ridFade .25s ease;
}
@keyframes ridFade { from { opacity: 0 } to { opacity: 1 } }
.riddle-panel {
  background: linear-gradient(180deg,#1c1410 0%, #0c0806 100%);
  border: 1px solid #5a3820;
  padding: 22px 26px;
  max-width: 580px; width: calc(100% - 40px);
  max-height: 80vh; overflow-y: auto;
  color: #c8b89c;
  box-shadow: 0 0 80px rgba(120,40,20,.25);
}
.riddle-title {
  font-family: var(--serif-display, "Cinzel", serif);
  font-size: 13px; letter-spacing: 5px;
  color: #b89868; margin-bottom: 6px; text-align: center;
}
.riddle-sub {
  font-size: 11px; color: #8a7858; text-align: center;
  margin-bottom: 16px; font-style: italic;
}
.riddle-item {
  border-left: 2px solid #6a3820;
  padding: 8px 12px; margin: 10px 0;
  font-size: 14px; line-height: 1.55;
  color: #c8b89c;
}
.riddle-empty {
  text-align: center; padding: 30px 10px; font-style: italic; color: #8a7858;
}
.riddle-close {
  display: block; margin: 18px auto 0;
  background: rgba(30,18,12,.7); border: 1px solid #6a4828;
  color: #c8a878; padding: 6px 18px;
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 3px; font-size: 11px; cursor: pointer;
}
.riddle-close:hover { background: #4a3018; color: #ffd8a8; }
  `;
  document.head.appendChild(s);
}

// ───────────────────────────────────────────────────────────────────────
// Riddle generators per chapter. Each returns an array of strings drawn
// from current state — only currently-open threads appear.
// ───────────────────────────────────────────────────────────────────────
function ashgroveRiddles() {
  const out = [];
  const docsRead = (state.docsRead instanceof Set) ? state.docsRead : new Set(Array.isArray(state.docsRead) ? state.docsRead : []);
  const entSeen  = (state.entitiesSeen instanceof Set) ? state.entitiesSeen : new Set(Array.isArray(state.entitiesSeen) ? state.entitiesSeen : []);
  const r        = state._ritual || {};
  // Unread key docs — oblique, never literal.
  if (!docsRead.has("sealed_letter")) {
    out.push("A widow set wax against a word. The word, unread, still keeps the rite.");
  }
  if (!docsRead.has("coroner")) {
    out.push("Three small papers tell three small lies. Read them together; one of the three blinks first.");
  }
  if (!docsRead.has("nursery_diary")) {
    out.push("The hand that wrote in pencil is too small for the hand the registers admit.");
  }
  // Unseen entities — use the room’s proper name, not lowercased.
  if (typeof ENTITIES !== "undefined" && typeof ROOMS !== "undefined") {
    Object.entries(ENTITIES).forEach(([id, e]) => {
      if (entSeen.has(id)) return;
      if (e.realInStates && state.truth && !e.realInStates.includes(state.truth)) return;
      const rn = (e.room && ROOMS[e.room] && ROOMS[e.room].name) ? ROOMS[e.room].name : "a room of this house";
      out.push(`A face you have not been shown waits in ${rn}. It has, so far, the patience.`);
    });
  }
  // Ritual progress — keep the *image*, drop the directions.
  if (state.calderLeft && !r.performed) {
    if (!r.salt)   out.push("What is white, weighs a pound, and was put away in lead so that the dark would not learn it?");
    if (!r.name)   out.push("Nine letters under yellowed wax; she would not say them, and so they remain.");
    if (!r.effect) out.push("Silver, small, and a child’s. The child has no further use for it; you might.");
    if (r.salt && r.name && r.effect) out.push("Salt, name, and a small silver thing. The fourth chair at the table is yours — sit.");
  }
  // Puzzles
  if (!(state._puzzles && state._puzzles.ashgrove_cipher)) {
    out.push("Mr. Calder’s drawer is ill-fitted, and Adeline kept her alphabet. Step three letters back.");
  }
  return out;
}
function wyndmereRiddles() {
  const out = [];
  const docsRead = (state.docsRead instanceof Set) ? state.docsRead : new Set(Array.isArray(state.docsRead) ? state.docsRead : []);
  const entSeen  = (state.entitiesSeen instanceof Set) ? state.entitiesSeen : new Set(Array.isArray(state.entitiesSeen) ? state.entitiesSeen : []);
  const r        = state._ritual || {};
  if (!docsRead.has("wm_aherne_letter")) {
    out.push("A priest set down a pen on the morning of three deaths. The page kept writing; he did not.");
  }
  if (!docsRead.has("wm_theo_casenotes")) {
    out.push("A doctor wrote of his patients with calm. The last patient he wrote of shares his surname.");
  }
  if (!docsRead.has("wm_rituale")) {
    out.push("The Rituale is in Latin everywhere except the margins. The margins are in his hand, and not in Latin.");
  }
  if (typeof ENTITIES !== "undefined" && typeof ROOMS !== "undefined") {
    Object.entries(ENTITIES).forEach(([id, e]) => {
      if (entSeen.has(id)) return;
      if (e.realInStates && state.truth && !e.realInStates.includes(state.truth)) return;
      const rn = (e.room && ROOMS[e.room] && ROOMS[e.room].name) ? ROOMS[e.room].name : "some room of the Hollow";
      out.push(`Something is held by ${rn}, and waits to be stood close to.`);
    });
  }
  if (state.calderLeft && !r.performed) {
    if (!r.salt)   out.push("Blessed once, used never. Pewter remembers the priest’s hand better than the priest does.");
    if (!r.name)   out.push("Eight letters the doctor would write, and the priest would not. The lake learned them anyway.");
    if (!r.effect) out.push("A drift of pale hair on silver. She does not, presently, brush.");
    if (r.salt && r.name && r.effect) out.push("Salt, name, and a strand of her. The altar is patient, but not, you understand, forever.");
  }
  if (!(state._puzzles && state._puzzles.wyndmere_knock)) {
    out.push("The confessional answers a knock that Aherne would not have taught. The lake, the lake, did.");
  }
  if (!entSeen.has("beatrice") && state.calderLeft) {
    out.push("A pale shape rises in the boathouse water by inches you have not measured.");
  }
  return out;
}

function buildRiddles() {
  try {
    if (typeof state === "undefined") return [];
    const ch = chapter();
    const arr = ch === "wyndmere" ? wyndmereRiddles() : ashgroveRiddles();
    const seen = new Set();
    return arr.filter(s => {
      if (seen.has(s)) return false;
      seen.add(s); return true;
    }).slice(0, 8);
  } catch (e) {
    console.error("[riddles] buildRiddles failed:", e);
    return ["The house, briefly, refuses to be read."];
  }
}

function openRiddles() {
  console.log("[riddles] openRiddles() called");
  try {
    injectStyles();
    const items = buildRiddles();
    console.log("[riddles] built", items.length, "items");
    const overlay = document.createElement("div");
    overlay.className = "riddle-overlay";
    const panel = document.createElement("div");
    panel.className = "riddle-panel";
    panel.innerHTML = `
      <div class="riddle-title">RIDDLES</div>
      <div class="riddle-sub">
        What the house, when it speaks, says — and when it does not, withholds.
      </div>
      ${items.length
        ? items.map(t => `<div class="riddle-item">${escapeHtml(t)}</div>`).join("")
        : `<div class="riddle-empty">No open threads. The house, briefly, is quiet.</div>`}
      <button class="riddle-close" type="button">CLOSE</button>
    `;
    overlay.appendChild(panel);
    panel.querySelector(".riddle-close").onclick = () => overlay.remove();
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  } catch (e) {
    console.error("[riddles] openRiddles failed:", e);
    alert("Riddles failed to open. Check console for details.");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Mount a riddles chip into #sk-hud-row, re-parenting each tick like the
// field-notes / hint chips do.
function ensureRiddleChip() {
  if (typeof state === "undefined" || !state.calderLeft) {
    const ex = document.getElementById("riddle-chip-btn");
    if (ex) ex.remove();
    return;
  }
  // Inject styles eagerly so the chip is interactive on first render —
  // #sk-hud-row has pointer-events: none, and the rule that re-enables
  // pointer events on .riddle-chip lives in our injected stylesheet.
  injectStyles();
  let btn = document.getElementById("riddle-chip-btn");
  const row = document.getElementById("sk-hud-row");
  if (!row) return;
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "riddle-chip-btn";
    btn.className = "riddle-chip";
    btn.type = "button";
    btn.textContent = "RIDDLES";
    btn.title = "Cryptic clues to your current open threads.";
    // Inline pointer-events as a hard guarantee in case the stylesheet
    // hasn't run yet or got out-specificity'd by something else.
    btn.style.pointerEvents = "auto";
    btn.style.position = "relative";
    btn.style.zIndex = "100";
    // Capture-phase listener so nothing higher up can swallow the click.
    btn.addEventListener("click", function (ev) {
      console.log("[riddles] chip click fired");
      ev.preventDefault();
      ev.stopPropagation();
      try { openRiddles(); } catch (e) { console.error("[riddles] click handler failed:", e); }
    }, true);
    // Belt-and-braces: also wire pointerup in case click is being eaten.
    btn.addEventListener("pointerup", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      try { openRiddles(); } catch (e) { console.error("[riddles] pointerup handler failed:", e); }
    }, true);
  }
  // Re-assert inline pointer-events on every tick.
  btn.style.pointerEvents = "auto";
  // Always re-set onclick as a third safety net.
  btn.onclick = function (ev) {
    console.log("[riddles] chip onclick fired");
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    try { openRiddles(); } catch (e) { console.error("[riddles] onclick handler failed:", e); }
  };
  if (btn.parentElement !== row) row.appendChild(btn);
}

setInterval(() => { try { ensureRiddleChip(); } catch (e) {} }, 1500);

window.openRiddles = openRiddles;

})();
