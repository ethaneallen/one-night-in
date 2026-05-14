// vignettes.js — 7th-Guest-style ghost tableaux.
// When the investigator enters certain rooms (or examines certain props)
// for the first time AFTER state.calderLeft, a short scripted scene plays:
// the screen dims, two voices speak across each other (existing TTS pools),
// then it fades. One-shot per scene. Two scenes per chapter.
"use strict";

(function () {

// Each line: { who:"male"|"female"|"narr", text:"..." }
// `male` uses TTS male hint pool; `female` uses TTS female hint pool;
// `narr` is the investigator's own voice (Steele).
const VIGNETTES = {
  // ── Ashgrove ────────────────────────────────────────────────────────
  parlor_seance: {
    chapter: "ashgrove",
    room: "parlor",
    minAggression: 0,
    tint: "rgba(40,8,8,0.55)",
    title: "PARLOR — 1907",
    lines: [
      { who: "female", text: "Margaret, hold the circle. You let go last time and we lost her." },
      { who: "female", text: "I did not let go. She let go of me." },
      { who: "female", text: "Adeline — speak now, dear. Speak, before we lose the hour." },
      { who: "narr",   text: "And then, in the recording the photographer made that night, a third voice — that no one in the room was using — said, very calmly, the name of the small one." }
    ]
  },
  nursery_eliza: {
    chapter: "ashgrove",
    room: "nursery",
    minAggression: 0,
    tint: "rgba(20,30,40,0.55)",
    title: "NURSERY — 1907",
    lines: [
      { who: "female", text: "Eliza, my love, you must come down. Tea is ready." },
      { who: "female", text: "Eliza? The door is locked from your side." },
      { who: "male",   text: "(Mr. Calder, at the threshold:) Mrs. Cale. The door has not, you understand, a lock on the inside." },
      { who: "narr",   text: "There is no record of Eliza Cale after that afternoon. There is, however, a record of the wall, behind which she was found, being plastered over within the week." }
    ]
  },
  // ── Wyndmere ────────────────────────────────────────────────────────
  boathouse_beatrice: {
    chapter: "wyndmere",
    room: "wm_boathouse",
    minAggression: 0,
    tint: "rgba(8,16,28,0.6)",
    title: "BOATHOUSE — 1888",
    lines: [
      { who: "male",   text: "Beatrice, my dear, the oar. Give me the oar." },
      { who: "female", text: "Theodore — the rite did not work. The rite did not work and I am very cold and there is something in the boat with us." },
      { who: "male",   text: "There is nothing in the boat. Give me the oar." },
      { who: "narr",   text: "The coroner's report names Beatrice Thrale as drowned. The coroner's report does not, anywhere in its three pages, account for the second body found floating beside her — which, when retrieved, was Beatrice Thrale also." }
    ]
  },
  chapel_aherne: {
    chapter: "wyndmere",
    room: "wm_chapel",
    minAggression: 0,
    tint: "rgba(28,20,8,0.55)",
    title: "CHAPEL — 3 a.m., March 1904",
    lines: [
      { who: "male",   text: "(Father Aherne, quiet:) I have one rite in my pocket and one in my throat. The pocket one is approved. The throat one is not." },
      { who: "male",   text: "(Theodore, beside him:) Use the one that works, Father." },
      { who: "male",   text: "(Aherne:) The one that works, Doctor, is not, in the strictest sense, mine to use." },
      { who: "narr",   text: "Father Aherne went out on the lake at half past three. He did not come back. The lake came back. The lake, in fact, has been coming back ever since." }
    ]
  }
};

function injectStyles() {
  if (document.getElementById("vignettes-css")) return;
  const s = document.createElement("style");
  s.id = "vignettes-css";
  s.textContent = `
.vignette-overlay {
  position: fixed; inset: 0; z-index: 9000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #000;
  font-family: var(--serif-body, Georgia, serif);
  color: #c8b89c;
  padding: 24px;
  animation: vignFade .8s ease;
  text-align: center;
}
@keyframes vignFade { from { opacity: 0 } to { opacity: 1 } }
.vignette-tint {
  position: absolute; inset: 0;
  background: var(--vign-tint, rgba(30,8,8,0.55));
  pointer-events: none;
  mix-blend-mode: screen;
  animation: vignPulse 4s ease-in-out infinite;
}
@keyframes vignPulse {
  0%,100% { opacity: 0.8 } 50% { opacity: 1 }
}
.vignette-title {
  font-family: var(--serif-display, "Cinzel", serif);
  font-size: 13px; letter-spacing: 5px;
  color: #8a6a48; margin-bottom: 18px;
  z-index: 2; position: relative;
}
.vignette-line {
  max-width: 640px;
  font-size: 18px; line-height: 1.55;
  margin: 8px 0; opacity: 0;
  z-index: 2; position: relative;
  transition: opacity 1.2s ease;
}
.vignette-line.shown { opacity: 1; }
.vignette-line.female { color: #d8b8c8; }
.vignette-line.male   { color: #b8c8d8; }
.vignette-line.narr   { color: #b89868; font-style: italic; }
.vignette-skip {
  margin-top: 30px;
  background: rgba(30,18,12,.6);
  border: 1px solid #6a4828;
  color: #c8a878;
  padding: 6px 16px;
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 3px; font-size: 11px;
  cursor: pointer;
  z-index: 2; position: relative;
}
.vignette-skip:hover { background: #4a3018; color: #ffd8a8; }
  `;
  document.head.appendChild(s);
}

function chapter() {
  return (typeof state !== "undefined" && state._story === "wyndmere") ? "wyndmere" : "ashgrove";
}

function playVignette(id) {
  const v = VIGNETTES[id];
  if (!v) return;
  injectStyles();
  if (!state._vignettesShown) state._vignettesShown = {};
  if (state._vignettesShown[id]) return;
  state._vignettesShown[id] = true;

  const overlay = document.createElement("div");
  overlay.className = "vignette-overlay";
  overlay.style.setProperty("--vign-tint", v.tint || "rgba(30,8,8,0.55)");
  const tint = document.createElement("div");
  tint.className = "vignette-tint";
  overlay.appendChild(tint);

  const title = document.createElement("div");
  title.className = "vignette-title";
  title.textContent = v.title;
  overlay.appendChild(title);

  const lineEls = v.lines.map(l => {
    const el = document.createElement("div");
    el.className = "vignette-line " + l.who;
    el.textContent = l.text;
    overlay.appendChild(el);
    return el;
  });

  const skip = document.createElement("button");
  skip.className = "vignette-skip";
  skip.textContent = "✕  CLOSE THE EYES";
  overlay.appendChild(skip);

  document.body.appendChild(overlay);

  // Audio prep: duck ambient, dead-air right before the first line
  if (typeof audio !== "undefined") {
    if (audio.duckBed) audio.duckBed(0.45, 12000);
    if (audio.deadAirGate) audio.deadAirGate(500);
  }

  let cancelled = false;
  let timers = [];
  function cleanup() {
    cancelled = true;
    timers.forEach(t => clearTimeout(t));
    if (typeof tts !== "undefined" && tts.stop) tts.stop();
    overlay.remove();
  }
  skip.onclick = cleanup;

  // Sequence the lines with TTS. Each line: fade in, speak, wait, next.
  let when = 600;
  v.lines.forEach((line, i) => {
    timers.push(setTimeout(() => {
      if (cancelled) return;
      lineEls[i].classList.add("shown");
      // Speak the line. Visual color carries the speaker identity since
      // the TTS layer uses a single chosen voice per session.
      if (typeof tts !== "undefined" && tts.speak) {
        try { tts.speak(line.text, { preempt: i === 0 }); } catch (e) {}
      }
    }, when));
    // Estimate read time by length
    const estRead = Math.max(2800, line.text.length * 55);
    when += estRead;
  });

  // Auto-close at the end (plus 1s grace)
  timers.push(setTimeout(() => {
    if (!cancelled) cleanup();
  }, when + 1200));
}

// Check on every room render whether a vignette is due in this room.
function maybeTriggerOnRoomEnter() {
  if (typeof state === "undefined" || !state.calderLeft || state._dead || state._verdict) return;
  const ch = chapter();
  const rid = state.currentRoom;
  for (const id of Object.keys(VIGNETTES)) {
    const v = VIGNETTES[id];
    if (v.chapter !== ch) continue;
    if (v.room !== rid) continue;
    if (state._vignettesShown && state._vignettesShown[id]) continue;
    if ((state.aggression || 0) < (v.minAggression || 0)) continue;
    // 60% chance on each qualifying entry, so it doesn't feel mandatory
    if (Math.random() < 0.6) {
      // Delay slightly so room paints first
      setTimeout(() => playVignette(id), 900);
    }
    break;
  }
}

// Hook renderRoom
(function hookRenderRoom() {
  if (typeof window === "undefined") return;
  const orig = window.renderRoom;
  if (typeof orig !== "function") { setTimeout(hookRenderRoom, 200); return; }
  window.renderRoom = function () {
    const r = orig.apply(this, arguments);
    try { maybeTriggerOnRoomEnter(); } catch (e) {}
    return r;
  };
})();

// Dev helper
window.playVignette = playVignette;

})();
