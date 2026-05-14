// playability-wave2.js — second wave of playability upgrades.
//
// Adds:
//   • Darkroom develop rhythm game (wraps cameraViewPhoto)
//   • Tape splice mini-game (wraps playTape for the "spliced, badly" reel)
//   • Séance bell Simon-says (wraps ringSeanceBell)
//   • Eliza letter cipher (wraps the combo-drawer reward)
//   • A "Field Notes" floating panel offering:
//       - Sort Calder's Claims (drag-drop contradictions)
//       - Vocabulary Match (Ovilus lineup)
//       - Light a Candle (draft trail across rooms)
//       - Piano Fragment (Margaret's melody)
//
// Loads AFTER playability.js. Disable by removing the script tag.
"use strict";

(function () {

// ============================================================
// 0. Helpers (mirror wave 1 conventions)
// ============================================================
const W2 = window.W2 = {};
function el(tag, attrs, kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "style") Object.assign(e.style, attrs[k]);
    else if (k === "html") e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if (kids) for (const c of [].concat(kids)) {
    if (c == null) continue;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return e;
}
function styleTag(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id; s.textContent = css;
  document.head.appendChild(s);
}
function safeSfx(n) { try { if (typeof audio !== "undefined") audio.sfx(n); } catch (e) {} }
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

// Shared WebAudio context for tones (audio.js keeps its ctx private, so
// we create our own here for the piano + bell. Lazy-initialized on first
// user gesture to satisfy autoplay policy).
let _w2Ctx = null;
function getCtx() {
  if (_w2Ctx) return _w2Ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _w2Ctx = new AC();
  } catch (e) { return null; }
  return _w2Ctx;
}
function playTone(freq, dur, type) {
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") ac.resume();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = freq;
    o.type = type || "sine";
    o.connect(g); g.connect(ac.destination);
    const t = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.6));
    o.start(t); o.stop(t + (dur || 0.6) + 0.05);
  } catch (e) {}
}

styleTag("playability-w2-css", `
.w2-overlay {
  position: fixed; inset: 0; z-index: 9100;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(20,10,8,.82) 0%, rgba(0,0,0,.96) 100%);
  font-family: var(--serif-body, Georgia, serif);
  animation: w2Fade .2s ease;
}
@keyframes w2Fade { from { opacity: 0 } to { opacity: 1 } }
.w2-panel {
  background: linear-gradient(180deg,#1c1410 0%, #0c0806 100%);
  border: 1px solid #4a2818;
  box-shadow: 0 0 0 1px #8a5028 inset, 0 30px 80px rgba(0,0,0,.7);
  padding: 22px 26px 18px;
  width: min(620px, 94vw);
  max-height: 90vh; overflow: auto;
  color: #d4a878;
  border-radius: 4px;
}
.w2-title {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 5px; font-size: 16px;
  color: #c08040; margin: 0 0 6px;
  text-align: center;
}
.w2-sub {
  font-size: 16px; color: #b89878; font-style: italic; margin: 0 0 16px;
  text-align: center; line-height: 1.5;
}
.w2-stage {
  background: #08060a; border: 1px solid #2a1810;
  margin: 0 auto 12px; padding: 12px; position: relative;
}
.w2-actions { display: flex; gap: 10px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
.w2-actions button, .w2-btn {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 2px; font-size: 14px;
  background: #2a1810; color: #d4a878;
  border: 1px solid #6a3820; padding: 10px 18px;
  cursor: pointer; transition: all .15s;
}
.w2-actions button:hover, .w2-btn:hover { background: #4a2818; color: #ffd498; }
.w2-actions button:disabled { opacity: .4; cursor: default; }
.w2-result { text-align: center; min-height: 22px; margin-top: 12px;
  font-family: var(--serif-display); letter-spacing: 3px; font-size: 16px; }
.w2-r-great { color: #80d090; }
.w2-r-ok    { color: #d4a878; }
.w2-r-miss  { color: #c05050; }
.w2-warn-banner {
  background: linear-gradient(180deg,#3a1810,#1a0808);
  border: 1px solid #c05050;
  color: #ffb088;
  padding: 10px 14px; margin: 10px 0;
  font-size: 15px; line-height: 1.5;
  text-align: center;
  animation: w2WarnPulse .5s ease;
}
@keyframes w2WarnPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }

/* Field Notes button (lives inside #sk-hud-row, styled like a chip) */
#w2-fn-btn {
  background: rgba(20,12,8,.82);
  border: 1px solid #4a2818;
  color: #d4a878;
  padding: 3px 11px;
  font-family: var(--serif-display); letter-spacing: 2px; font-size: 10px;
  border-radius: 2px;
  pointer-events: auto;
  cursor: pointer;
  transition: all .15s;
}
#w2-fn-btn:hover { background: #4a2818; color: #ffd498; }

.w2-fn-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-top: 12px; }
.w2-fn-card {
  background: #160c08; border: 1px solid #4a2818;
  padding: 12px; cursor: pointer; transition: all .15s;
  text-align: left;
}
.w2-fn-card:hover { background: #2a1810; border-color: #8a5028; }
.w2-fn-card.done { opacity: .55; cursor: default; }
.w2-fn-name { font-family: var(--serif-display); letter-spacing: 3px; font-size: 14px; color: #ffd498; }
.w2-fn-desc { font-size: 15px; color: #b89878; margin-top: 6px; font-style: italic; line-height: 1.5; }

/* Darkroom */
.w2-dr-tray {
  width: 320px; height: 60px;
  background: linear-gradient(180deg,#604838,#1a0c08);
  border: 2px solid #2a1810;
  margin: 0 auto 10px; position: relative;
  border-radius: 6px;
  transition: transform .12s;
}
.w2-dr-tray.shake { transform: rotate(-2deg); }
.w2-dr-tray.shake2 { transform: rotate(2deg); }
.w2-dr-tick {
  display: inline-block; width: 8px; height: 12px;
  background: #3a2818; margin: 0 2px;
}
.w2-dr-tick.good { background: #80d090; box-shadow: 0 0 6px #80d09080; }
.w2-dr-tick.bad  { background: #c05050; }

/* Splice */
.w2-sp-wave {
  position: relative; height: 60px;
  background: #06030a; border: 1px solid #2a1810; margin: 6px 0;
}
.w2-sp-bar { position: absolute; top: 10px; bottom: 10px; width: 3px; background: #c08040; opacity: .6; }
.w2-sp-cut { position: absolute; top: 0; bottom: 0; width: 2px; background: #ffd498; box-shadow: 0 0 6px #ffd498; }
.w2-sp-shaded { position: absolute; top: 0; bottom: 0; background: rgba(64,160,80,.15); border-left: 1px dashed #80d090; border-right: 1px dashed #80d090; }

/* Bell tones */
.w2-bell-bell {
  display: inline-flex; gap: 18px; justify-content: center; margin: 8px 0;
}
.w2-bell-key {
  width: 70px; height: 70px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #c8a060, #4a2818);
  border: 2px solid #6a3820;
  color: #1a0a08; font-family: var(--serif-display); letter-spacing: 2px;
  font-size: 18px; font-weight: 700; cursor: pointer;
  transition: all .12s;
  display: inline-flex; align-items: center; justify-content: center;
}
.w2-bell-key:hover { transform: scale(1.05); }
.w2-bell-key.active { background: radial-gradient(circle at 35% 30%, #ffe080, #c08040); box-shadow: 0 0 16px #ffd49880; }
.w2-bell-key.wrong  { background: radial-gradient(circle at 35% 30%, #ff8080, #802020); }
.w2-bell-row { font-size: 22px; color: #ffd498; letter-spacing: 8px; text-align: center; margin: 6px 0; }

/* Cipher */
.w2-ci-cipher-row {
  font-family: 'Courier New', monospace; font-size: 18px;
  letter-spacing: 6px; text-align: center; padding: 14px 6px;
  background: #0c0604; border: 1px solid #2a1810; margin-bottom: 10px;
  color: #c08040;
}
.w2-ci-plain {
  font-family: 'Courier New', monospace; font-size: 18px;
  letter-spacing: 6px; text-align: center; padding: 14px 6px;
  background: #0c0604; border: 1px solid #2a1810; margin-bottom: 10px;
  color: #80d090;
  min-height: 24px;
}
.w2-ci-controls { display:flex; align-items: center; gap: 10px; justify-content: center; }
.w2-ci-shift {
  font-family: var(--serif-display); font-size: 24px; color: #ffd498;
  min-width: 40px; text-align: center; padding: 4px 10px;
  background: #160c08; border: 1px solid #4a2818;
}

/* Contradictions drag-drop */
.w2-co-board { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 10px 0; }
.w2-co-col {
  background: #08060a; border: 1px solid #2a1810; padding: 10px;
  min-height: 240px;
}
.w2-co-col h4 {
  margin: 0 0 10px; font-family: var(--serif-display); letter-spacing: 2px;
  font-size: 14px; color: #c08040; text-align: center;
}
.w2-co-claim, .w2-co-doc {
  background: #160c08; border: 1px solid #4a2818; padding: 10px 12px;
  margin-bottom: 8px; font-size: 15px; color: #d4a878; cursor: grab;
  transition: all .12s; line-height: 1.45;
}
.w2-co-claim.dragging, .w2-co-doc.dragging { opacity: .4; }
.w2-co-slot {
  background: #0c0604; border: 1px dashed #4a2818;
  min-height: 48px; padding: 8px; margin-bottom: 8px;
  font-size: 14px; color: #a89580; font-style: italic;
  text-align: center; display: flex; align-items: center; justify-content: center;
  line-height: 1.4;
}
.w2-co-slot.hover { border-color: #c08040; background: #160c08; }
.w2-co-slot.correct { border: 1px solid #80d090; color: #80d090; }
.w2-co-slot.wrong   { border: 1px solid #c05050; color: #c05050; }

/* Vocabulary match */
.w2-vo-words {
  display: flex; justify-content: center; gap: 10px; margin: 12px 0;
}
.w2-vo-word {
  font-family: var(--serif-display); letter-spacing: 3px;
  background: #2a1810; border: 1px solid #6a3820;
  padding: 12px 20px; color: #ffd498; font-size: 18px;
}
.w2-vo-lineup { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 10px; }
.w2-vo-pick {
  background: #160c08; border: 1px solid #4a2818; padding: 12px;
  font-size: 15px; color: #d4a878; cursor: pointer; text-align: center;
  transition: all .15s; line-height: 1.4;
}
.w2-vo-pick:hover { background: #2a1810; border-color: #c08040; }
.w2-vo-pick.correct { background: #1a3020; border-color: #80d090; color: #80d090; }
.w2-vo-pick.wrong   { background: #301818; border-color: #c05050; color: #c05050; }

/* Candle / piano shared dial */
.w2-cd-flame {
  width: 80px; height: 100px; margin: 10px auto;
  position: relative; transition: transform .3s;
}
.w2-cd-flame-body {
  position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 14px; height: 60px; background: linear-gradient(180deg,#604838,#1a0a08);
}
.w2-cd-flame-wick {
  position: absolute; left: 50%; bottom: 60px;
  transform: translateX(-50%) rotate(0deg);
  width: 14px; height: 24px;
  background: radial-gradient(ellipse at 50% 80%, #ffd060 0%, #ff8020 50%, #c04010 100%);
  border-radius: 50% 50% 35% 35% / 60% 60% 40% 40%;
  box-shadow: 0 0 18px #ff8020, 0 0 32px #ff402080;
  transform-origin: 50% 100%;
  transition: transform .3s ease;
}
.w2-cd-rooms { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin: 10px 0; }
.w2-cd-room {
  background: #160c08; border: 1px solid #4a2818; padding: 10px;
  font-size: 14px; text-align: center; color: #d4a878; cursor: pointer;
  font-family: var(--serif-display); letter-spacing: 1px;
}
.w2-cd-room:hover { background: #2a1810; border-color: #c08040; }
.w2-cd-room.visited { color: #80d090; border-color: #80d090; }

/* Piano keys */
.w2-pi-keys { display: flex; justify-content: center; gap: 4px; margin: 16px 0; }
.w2-pi-key {
  width: 50px; height: 110px;
  background: linear-gradient(180deg,#f0e0c0 0%,#c8b090 100%);
  border: 1px solid #2a1810; border-radius: 0 0 4px 4px;
  cursor: pointer; color: #1a0a08;
  font-family: var(--serif-display); font-size: 11px; letter-spacing: 1px;
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 6px;
  transition: all .12s;
}
.w2-pi-key:hover { background: linear-gradient(180deg,#ffeac8,#d4b890); }
.w2-pi-key.lit  { background: linear-gradient(180deg,#ffd498,#c08040); box-shadow: 0 0 20px #ffd49880; }
`);

// ============================================================
// 1. Modal helper
// ============================================================
function openModal({ title, sub, build }) {
  return new Promise(resolve => {
    const root = el("div", { class: "w2-overlay" });
    const panel = el("div", { class: "w2-panel" });
    panel.appendChild(el("div", { class: "w2-title", html: title }));
    if (sub) panel.appendChild(el("div", { class: "w2-sub", html: sub }));
    const stage = el("div", { class: "w2-stage" });
    panel.appendChild(stage);
    const result = el("div", { class: "w2-result" });
    panel.appendChild(result);
    const actions = el("div", { class: "w2-actions" });
    panel.appendChild(actions);
    root.appendChild(panel);
    document.body.appendChild(root);
    let done = false;
    function close(val) {
      if (done) return; done = true;
      root.style.transition = "opacity .25s";
      root.style.opacity = "0";
      setTimeout(() => { root.remove(); resolve(val); }, 260);
    }
    const closeBtn = el("button", { type: "button" }, "Close");
    closeBtn.onclick = () => close(null);
    actions.appendChild(closeBtn);
    build({ stage, actions, result, close, panel });
  });
}

// ============================================================
// 1b. Brute-force guard for Field Notes mini-games.
// After (max-1) wrongs: warning banner inside the modal.
// After max wrongs: close modal, bump aggression, burn a candle wick,
// lock this activity for the rest of the night.
//
// `lockKey` is a state flag name (e.g. "_vocabLocked"). Used by the
// Field Notes menu to gray the card out.
//
// `panel` is the .w2-panel element; we insert/update a banner inside.
// `close` is the modal's close fn.
//
// Returns an object with .miss() — call after each wrong attempt.
function makeMistakeGuard(opts) {
  // opts = { name, lockKey, max, panel, stage, close }
  let wrong = 0;
  const max = opts.max || 3;
  function setBanner(text, fatal) {
    let b = opts.panel.querySelector(".w2-warn-banner");
    if (!b) {
      b = el("div", { class: "w2-warn-banner" });
      opts.panel.insertBefore(b, opts.stage);
    }
    b.innerHTML = text;
    if (fatal) b.style.background = "linear-gradient(180deg,#8a2010,#3a0808)";
  }
  return {
    get count() { return wrong; },
    miss() {
      wrong++;
      if (wrong >= max) {
        // Fatal — close, punish, lock
        setBanner("<strong>The house has lost patience with your guessing.</strong><br>This page has closed. You may not open it again before dawn.", true);
        try { if (typeof bumpAggression === "function") bumpAggression(3, "the house noticed you brute-forcing " + opts.name); } catch (e) {}
        // Burn a candle wick if available (wave 1 tracks this on PLAY.restsLeft)
        try {
          if (window.PLAY && PLAY.restsLeft > 0) {
            PLAY.restsLeft--;
            if (typeof PLAY.renderCandles === "function") PLAY.renderCandles();
          }
        } catch (e) {}
        // Lock the activity
        if (opts.lockKey) state[opts.lockKey] = true;
        safeSfx("heartbeat");
        setTimeout(() => opts.close(null), 1800);
        return true; // signal fatal
      } else if (wrong >= max - 1) {
        setBanner("<strong>The house is starting to notice.</strong><br>One more wrong guess and the page will close. You will not get this back tonight.");
        safeSfx("whisper");
      }
      return false;
    }
  };
}

// ============================================================
// 2. DARKROOM — develop a photo (rhythm agitation)
// ============================================================
//
// Agitate the tray with a steady rhythm. Click the AGITATE button on the
// beat. Then PULL within a window. Quality determines if the anomaly
// remains sharp / muddied / lost.
async function darkroomDevelop(photo) {
  return openModal({
    title: "DARKROOM · DEVELOP",
    sub: "<strong>How to play:</strong> tap AGITATE in time with each beat (six beats total). When the meter peaks near the top, click PULL. Pull too early or too late and the image is ruined.",
    build: ({ stage, actions, result, close }) => {
      stage.innerHTML = `
        <div class="w2-dr-tray" id="w2-dr-tray"></div>
        <div style="text-align:center;margin-bottom:8px" id="w2-dr-ticks"></div>
        <div style="text-align:center;margin-bottom:8px" id="w2-dr-meter">
          <div style="display:inline-block;width:240px;height:8px;background:#0c0604;border:1px solid #2a1810;position:relative">
            <div id="w2-dr-fill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:#80d090;transition:width .12s"></div>
          </div>
        </div>
        <div style="text-align:center;font-size:14px;color:#b89878;font-style:italic;line-height:1.5" id="w2-dr-msg">Listen for the beat...</div>
      `;
      const tray = stage.querySelector("#w2-dr-tray");
      const ticks = stage.querySelector("#w2-dr-ticks");
      const fill = stage.querySelector("#w2-dr-fill");
      const msg = stage.querySelector("#w2-dr-msg");
      const beats = 6;
      const beatMs = 850;
      let beatI = 0;
      let goodBeats = 0;
      let nextBeatAt = performance.now() + 600;
      let phase = "agitate"; // -> "pull" -> done
      let pullPct = 0;

      // Render beat ticks
      function renderTicks(states) {
        ticks.innerHTML = states.map(s =>
          `<span class="w2-dr-tick ${s||""}"></span>`
        ).join("");
      }
      const tickStates = Array(beats).fill("");
      renderTicks(tickStates);

      const agitateBtn = el("button", { type: "button" }, "AGITATE");
      const pullBtn = el("button", { type: "button" }, "PULL");
      pullBtn.disabled = true;
      actions.insertBefore(agitateBtn, actions.firstChild);
      actions.insertBefore(pullBtn, actions.firstChild);

      // Tick loop — visual swing + advance beat counter
      let raf;
      function loop(t) {
        if (phase === "agitate") {
          if (t >= nextBeatAt) {
            // Player missed this beat
            tickStates[beatI] = "bad";
            renderTicks(tickStates);
            beatI++;
            tray.classList.toggle("shake");
            nextBeatAt = t + beatMs;
            safeSfx("click");
            if (beatI >= beats) { phase = "pull"; pullBtn.disabled = false; agitateBtn.disabled = true; msg.textContent = "Now PULL when the meter peaks."; }
          }
        } else if (phase === "pull") {
          // Oscillate pull meter 0..100 with sine
          pullPct = 50 + Math.sin(t / 280) * 50;
          fill.style.width = pullPct + "%";
        }
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      agitateBtn.onclick = () => {
        if (phase !== "agitate") return;
        const now = performance.now();
        const diff = Math.abs(now - nextBeatAt);
        if (diff < 220) {
          tickStates[beatI] = "good";
          goodBeats++;
          safeSfx("kii_tick");
        } else {
          tickStates[beatI] = "bad";
          safeSfx("click");
        }
        renderTicks(tickStates);
        beatI++;
        tray.classList.toggle("shake");
        tray.classList.toggle("shake2");
        nextBeatAt = now + beatMs;
        if (beatI >= beats) { phase = "pull"; pullBtn.disabled = false; agitateBtn.disabled = true; msg.textContent = "Now PULL when the meter peaks."; }
      };
      pullBtn.onclick = () => {
        if (phase !== "pull") return;
        cancelAnimationFrame(raf);
        // Score: rhythm fraction × pull peak fraction
        const rhythm = goodBeats / beats;
        const pull = pullPct / 100;
        const score = clamp(rhythm * 0.6 + pull * 0.4, 0, 1);
        const grade = score >= 0.75 ? "GREAT" : score >= 0.45 ? "OK" : "POOR";
        const cls = score >= 0.75 ? "w2-r-great" : score >= 0.45 ? "w2-r-ok" : "w2-r-miss";
        result.innerHTML = `<span class="${cls}">${grade}</span>`;
        safeSfx(score >= 0.75 ? "chime" : "click");
        setTimeout(() => close(score), 900);
      };
    }
  });
}

// Wrap cameraViewPhoto so that the FIRST open of an undecided anomaly
// photo runs the darkroom mini-game and demotes the anomaly on poor score.
(function gateDarkroom() {
  const orig = window.cameraViewPhoto;
  if (typeof orig !== "function") return;
  window.cameraViewPhoto = function patched(idx) {
    const p = state.photos && state.photos[idx];
    // Skip the darkroom for daguerreotype plates — the long-exposure minigame
    // IS their develop step. Running darkroom on top of them was overwriting
    // (and sometimes demoting) a Fatal Frame capture.
    if (!p || !p.anomaly || p.decision || p._developed || p.daguerreotype || state._darkroomBypass) {
      if (p && p.daguerreotype && !p._developed) p._developed = true;
      return orig.apply(this, arguments);
    }
    state._darkroomBypass = true;
    darkroomDevelop(p).then(score => {
      state._darkroomBypass = false;
      p._developed = true;
      p._developScore = score == null ? 0 : score;
      // Apply degradation on poor develop
      if (p._developScore < 0.3) {
        if (p.anomaly && p.anomaly.type === "figure") {
          p.anomaly = { type: "smudge", seed: Math.random() };
        } else if (p.anomaly) {
          p.anomaly = null;
        }
      } else if (p._developScore < 0.5 && p.anomaly.type === "figure") {
        p.anomaly = { type: "mist", seed: Math.random() };
      }
      // Bonus on great develop
      if (p._developScore >= 0.75 && p.anomaly && p.anomaly.type === "figure") {
        state._comboPayout = (state._comboPayout || 0) + 500;
      }
      orig.apply(this, [idx]);
    });
  };
})();

// ============================================================
// 3. TAPE SPLICE — the "spliced, badly" reel
// ============================================================
//
// Place IN and OUT cut markers around a noise spike to extract the
// hidden sentence. Success reveals an extra line, score logged.
async function tapeSplice() {
  return openModal({
    title: "TAPE · SPLICE",
    sub: "<strong>How to play:</strong> on the audio waveform, find the cluster of TALL bars (that's the hidden voice). Drag the IN handle to just before it and the OUT handle to just after. Then click SPLICE.",
    build: ({ stage, actions, result, close }) => {
      // Hidden target region
      const targetIn  = 35 + Math.random() * 10;
      const targetOut = targetIn + 12 + Math.random() * 6;
      const bars = Array.from({length: 80}, (_, i) => {
        const pct = i / 80 * 100;
        const inSpike = (pct > targetIn + 2 && pct < targetOut - 2);
        const h = inSpike ? 28 + Math.random()*22 : 4 + Math.random()*10;
        return `<div class="w2-sp-bar" style="left:${pct}%;height:${h}px;top:${30-h/2}px"></div>`;
      }).join("");
      stage.innerHTML = `
        <div class="w2-sp-wave" id="w2-sp">${bars}
          <div class="w2-sp-cut" id="w2-sp-in"  style="left:20%"></div>
          <div class="w2-sp-cut" id="w2-sp-out" style="left:80%"></div>
          <div class="w2-sp-shaded" id="w2-sp-shade"></div>
        </div>
        <div style="text-align:center;font-size:14px;color:#b89878;line-height:1.5" id="w2-sp-msg">Click on the waveform to set IN (first click) and OUT (second click), then COMMIT.</div>
      `;
      const wave = stage.querySelector("#w2-sp");
      const inM = stage.querySelector("#w2-sp-in");
      const outM = stage.querySelector("#w2-sp-out");
      const shade = stage.querySelector("#w2-sp-shade");
      let inPct = 20, outPct = 80, nextSet = "in";
      function paint() {
        inM.style.left = inPct + "%";
        outM.style.left = outPct + "%";
        shade.style.left = Math.min(inPct, outPct) + "%";
        shade.style.width = Math.abs(outPct - inPct) + "%";
      }
      paint();
      wave.addEventListener("click", e => {
        const r = wave.getBoundingClientRect();
        const pct = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
        if (nextSet === "in") { inPct = pct; nextSet = "out"; }
        else { outPct = pct; nextSet = "in"; }
        paint();
      });
      const commit = el("button", { type: "button" }, "COMMIT SPLICE");
      commit.onclick = () => {
        const lo = Math.min(inPct, outPct), hi = Math.max(inPct, outPct);
        // Score by overlap with target
        const overlap = Math.max(0, Math.min(hi, targetOut) - Math.max(lo, targetIn));
        const targetW = targetOut - targetIn;
        const score = clamp(overlap / targetW, 0, 1);
        const grade = score >= 0.75 ? "GREAT" : score >= 0.45 ? "OK" : "POOR";
        const cls = score >= 0.75 ? "w2-r-great" : score >= 0.45 ? "w2-r-ok" : "w2-r-miss";
        result.innerHTML = `<span class="${cls}">${grade}</span>`;
        safeSfx(score >= 0.75 ? "chime" : "click");
        setTimeout(() => close(score), 900);
      };
      actions.insertBefore(commit, actions.firstChild);
    }
  });
}

// Wrap playTape — only for the spliced reel, only on first play.
(function gateTapeSplice() {
  const orig = window.playTape;
  if (typeof orig !== "function") return;
  window.playTape = function patched(id) {
    if (id !== "tape_7_14_73" || state._spliceBypass) return orig.apply(this, arguments);
    const heard = state._tapesHeard && state._tapesHeard[id];
    if (heard) return orig.apply(this, arguments);
    state._spliceBypass = true;
    tapeSplice().then(score => {
      state._spliceBypass = false;
      if (score == null) score = 0;
      orig.apply(this, [id]);
      if (score >= 0.45) {
        if (typeof logEvidence === "function") {
          logEvidence("Tape Splice", `Reel 7/14/73 spliced cleanly. Hidden phrase recovered: "...not my children. I know this now." (Skill: ${score >= 0.75 ? "GREAT" : "OK"})`);
        }
        state._comboPayout = (state._comboPayout || 0) + (score >= 0.75 ? 1500 : 750);
        if (typeof showMilestone === "function") showMilestone("SPLICE RECOVERED", `<em>The hidden passage of 7/14/73 plays clean. +$${score >= 0.75 ? "1,500" : "750"}.</em>`);
      } else if (typeof narrate === "function") {
        narrate("<em>Your splice catches only static. The hidden line did not survive the cut.</em>");
      }
    });
  };
})();

// ============================================================
// 4. SÉANCE BELL — Simon-says tones
// ============================================================
//
// The house rings a sequence on three bells. The player repeats it.
// Length grows. On haunted runs, the LAST tone is deliberately wrong —
// catching it earns a bonus.
async function bellSimon(isHaunted) {
  return openModal({
    title: "SILVER BELL · CALL & RESPONSE",
    sub: "<strong>How to play:</strong> the bell will ring a pattern of three or more notes (I, II, III, IV). Watch + listen carefully, then click the same keys in the same order to repeat. Each round adds one more note.",
    build: ({ stage, actions, result, close }) => {
      stage.innerHTML = `
        <div class="w2-bell-row" id="w2-bell-row">— waiting —</div>
        <div class="w2-bell-bell">
          <div class="w2-bell-key" data-k="0">I</div>
          <div class="w2-bell-key" data-k="1">II</div>
          <div class="w2-bell-key" data-k="2">III</div>
        </div>
        <div style="text-align:center;font-size:14px;color:#b89878;line-height:1.5" id="w2-bell-msg">Listen first.</div>
      `;
      const keys = Array.from(stage.querySelectorAll(".w2-bell-key"));
      const row = stage.querySelector("#w2-bell-row");
      const msg = stage.querySelector("#w2-bell-msg");
      // Three rounds: length 3, 4, 5.
      const rounds = [3, 4, 5];
      let round = 0;
      let sequence = [];
      let inputs = [];
      let playerTurn = false;

      const tones = [440, 587, 740]; // approx bell pitches

      function bellTone(k) {
        playTone(tones[k], 0.6, "sine");
      }

      function flash(k, klass) {
        const key = keys[k];
        key.classList.add(klass);
        setTimeout(() => key.classList.remove(klass), 420);
      }

      async function playSequence() {
        playerTurn = false;
        msg.textContent = "Listen...";
        row.textContent = "● ".repeat(sequence.length).trim();
        for (let i = 0; i < sequence.length; i++) {
          await new Promise(r => setTimeout(r, 520));
          bellTone(sequence[i]);
          flash(sequence[i], "active");
        }
        playerTurn = true;
        inputs = [];
        msg.textContent = "Your turn.";
      }

      async function startRound() {
        const len = rounds[round];
        sequence = Array.from({length: len}, () => Math.floor(Math.random() * 3));
        await playSequence();
      }

      function endGame(score, blurb) {
        playerTurn = false;
        const grade = score >= 0.75 ? "GREAT" : score >= 0.4 ? "OK" : "MISS";
        const cls = score >= 0.75 ? "w2-r-great" : score >= 0.4 ? "w2-r-ok" : "w2-r-miss";
        result.innerHTML = `<span class="${cls}">${grade}</span><div style="font-size:11px;color:#a09080;letter-spacing:1px;margin-top:4px">${blurb || ""}</div>`;
        setTimeout(() => close(score), 1500);
      }

      keys.forEach(k => {
        k.onclick = () => {
          if (!playerTurn) return;
          const idx = +k.dataset.k;
          bellTone(idx);
          flash(idx, "active");
          inputs.push(idx);
          const i = inputs.length - 1;
          if (inputs[i] !== sequence[i]) {
            flash(idx, "wrong");
            // If haunted and we're on the last beat of the last round — was it the "wrong on purpose" beat?
            // We don't model that here directly; instead: any error ends with proportional score.
            const partial = i / sequence.length;
            const acrossRounds = (round + partial) / rounds.length;
            endGame(acrossRounds, "The bell stopped answering.");
            return;
          }
          if (inputs.length === sequence.length) {
            // Round complete
            round++;
            if (round >= rounds.length) {
              // Final round complete. If haunted, award an extra bonus for "catching"
              // the misleading final tone — modeled as a guaranteed perfect ride.
              const bonus = isHaunted ? " The house's pattern broke and you held the line." : "";
              endGame(1.0, "All rounds clean." + bonus);
            } else {
              setTimeout(startRound, 700);
            }
          }
        };
      });
      // Start
      setTimeout(startRound, 600);
    }
  });
}

(function gateBell() {
  const orig = window.ringSeanceBell;
  if (typeof orig !== "function") return;
  window.ringSeanceBell = function patched() {
    if (state._bellBypass) return orig.apply(this, arguments);
    state._bellBypass = true;
    const isHaunted = state.truth === "haunted";
    bellSimon(isHaunted).then(score => {
      state._bellBypass = false;
      orig.apply(this);  // original narration / sfx / aggression
      if (score >= 0.75 && typeof logEvidence === "function") {
        logEvidence("Séance Bell", `Held the bell's call-and-response cleanly. ${isHaunted ? "The house answered the full pattern." : "The bell rang only as a bell."}`);
        state._comboPayout = (state._comboPayout || 0) + (isHaunted ? 1500 : 500);
        if (typeof showMilestone === "function") showMilestone("THE BELL KEPT TIME", `<em>+$${isHaunted ? "1,500" : "500"} to the verdict.</em>`);
      } else if (score < 0.4 && typeof narrate === "function") {
        narrate("<em>You lost the rhythm. The bell, for a moment, was only a bell.</em>");
      }
    });
  };
})();

// ============================================================
// 5. ELIZA LETTER CIPHER
// ============================================================
//
// On opening the combo-drawer reward, present a Caesar-shift puzzle on
// one of Eliza's nine letters. Solving reveals her full name and auto-adds
// "Eliza Halliwell" hint to the verdict screen.
function elizaCipher() {
  return openModal({
    title: "A LETTER · IN CIPHER",
    sub: "<strong>How to play:</strong> the text is shifted by a Caesar cipher. Drag the SHIFT slider until the scrambled letters spell real English words. Then click DECODE.",
    build: ({ stage, actions, result, close }) => {
      const plain = "PLEASE COME BACK MISS HALLIWELL";
      const shift = 5 + Math.floor(Math.random() * 8); // 5..12
      const cipher = plain.split("").map(ch => {
        if (ch === " ") return " ";
        const code = ch.charCodeAt(0) - 65;
        return String.fromCharCode(((code + shift) % 26) + 65);
      }).join("");
      let cur = 0;
      stage.innerHTML = `
        <div class="w2-ci-cipher-row">${cipher}</div>
        <div class="w2-ci-plain" id="w2-ci-plain">— rotate the wheel —</div>
        <div class="w2-ci-controls">
          <button class="w2-btn" id="w2-ci-dn">◀</button>
          <div class="w2-ci-shift" id="w2-ci-shift">0</div>
          <button class="w2-btn" id="w2-ci-up">▶</button>
        </div>
        <p style="text-align:center;font-size:14px;color:#b89878;margin-top:12px;font-style:italic;line-height:1.5">The letters are pencil; the hand is small; the year on the back is 1850.</p>
      `;
      function render() {
        stage.querySelector("#w2-ci-shift").textContent = cur;
        const decoded = cipher.split("").map(ch => {
          if (ch === " ") return " ";
          const code = ch.charCodeAt(0) - 65;
          return String.fromCharCode(((code - cur + 260) % 26) + 65);
        }).join("");
        stage.querySelector("#w2-ci-plain").textContent = decoded;
        // Auto-recognize success
        if (decoded === plain) {
          safeSfx("chime");
          result.innerHTML = `<span class="w2-r-great">DECODED</span>`;
          stage.querySelector("#w2-ci-plain").style.color = "#80d090";
          setTimeout(() => close(1.0), 1400);
        }
      }
      render();
      stage.querySelector("#w2-ci-up").onclick = () => { cur = (cur + 1) % 26; render(); };
      stage.querySelector("#w2-ci-dn").onclick = () => { cur = (cur + 25) % 26; render(); };
    }
  });
}

// Wrap showDocument so the FIRST view of the combo letters reward
// presents the cipher puzzle.
(function gateCipher() {
  const orig = window.showDocument;
  if (typeof orig !== "function") return;
  window.showDocument = function patched(id) {
    if (id !== "combo_parlor_drawer" || state._cipherDone || state._cipherBypass) return orig.apply(this, arguments);
    state._cipherBypass = true;
    elizaCipher().then(score => {
      state._cipherBypass = false;
      state._cipherDone = true;
      if (score && score >= 0.9) {
        state._cipherSolved = true;
        // Auto-fill the verdict name input later, if empty
        state._cipherHint = "Eliza Halliwell";
        if (typeof logEvidence === "function") {
          logEvidence("Cipher Solved", `Decoded a child's letter: "PLEASE COME BACK MISS HALLIWELL." Her full name is recorded.`);
        }
        state._comboPayout = (state._comboPayout || 0) + 2000;
        if (typeof showMilestone === "function") showMilestone("HALLIWELL", "<em>A child's hand named the schoolmistress. +$2,000.</em>");
      }
      orig.apply(this, [id]);
    });
  };
})();

// Pre-fill verdict name input from cipher hint
document.addEventListener("click", (e) => {
  if (e.target && e.target.matches && e.target.matches('[data-verdict]')) {
    setTimeout(() => {
      const input = document.getElementById("verdict-name-input");
      if (input && !input.value && state._cipherHint) input.value = state._cipherHint;
    }, 100);
  }
}, true);

// ============================================================
// 6. CALDER CONTRADICTIONS — drag-drop board
// ============================================================
//
// Lists all uncaught contradictions with shuffled "candidate documents."
// Player drags doc → claim. Correct match adds to calderCaught and pays.
const CONTRA_DOCS = {
  evelyn_fall: { id: "coroner_report",   label: "Coroner's report — Evelyn Ashgrove, 1923", desc: "'Cause of death: undetermined. Fingernail damage on east wall.'" },
  twins_drowned: { id: "drain_log",      label: "Pond drainage log, 1940",                  desc: "'No bodies recovered. Pond dry to bedrock.'" },
  adeline_kind:  { id: "adeline_letter", label: "Adeline's letter, 1972",                   desc: "'I mean to join them in the walls before the house gets me first.'" },
  cellar_nothing:{ id: "lockwork_invoice",label: "Locksmith invoice, July 1974",            desc: "'Modern deadbolt installed. Cellar door. Per Calder Sr.'" },
  executor_identity:{ id: "trust_deed",  label: "Trust deed, 1899",                         desc: "'Founded by E. Ashgrove. Notarized. Will & testament 1902.'" }
};
const CONTRA_DECOYS = [
  { id: "decoy_invoice", label: "Coal invoice, 1931", desc: "Twelve tons. Paid in cash." },
  { id: "decoy_letter",  label: "Letter from a cousin, 1958", desc: "Asking about a Christmas visit." },
  { id: "decoy_news",    label: "Society notice, 1894", desc: "Margaret hosts a tea." }
];

async function contradictionsBoard() {
  return openModal({
    title: "FIELD NOTES · SORT THE CLAIMS",
    sub: "<strong>How to play:</strong> drag each document on the right onto the claim it contradicts on the left. <strong>3 wrong drops = the page closes for the night.</strong>",
    build: ({ stage, actions, result, close, panel }) => {
      const guard = makeMistakeGuard({ name: "contradictions board", lockKey: "_contraLocked", max: 3, panel, stage, close });
      const claimsList = Object.keys(CALDER_CONTRADICTIONS).map(k => ({
        key: k, claim: CALDER_CONTRADICTIONS[k], caught: state.calderCaught.includes(CALDER_CONTRADICTIONS[k])
      }));
      const docs = claimsList.map(c => CONTRA_DOCS[c.key]).concat(CONTRA_DECOYS);
      docs.sort(() => Math.random() - 0.5);
      stage.innerHTML = `
        <div class="w2-co-board">
          <div class="w2-co-col">
            <h4>${state._story === "wyndmere" ? "MRS. THRALE'S CLAIMS" : "CALDER'S CLAIMS"}</h4>
            <div id="w2-co-claims"></div>
          </div>
          <div class="w2-co-col">
            <h4>DOCUMENTS</h4>
            <div id="w2-co-docs"></div>
          </div>
        </div>
        <p style="text-align:center;font-size:14px;color:#b89878;font-style:italic;line-height:1.5">Drag a document onto a claim. Decoys cost nothing &mdash; but careless guesses do.</p>
      `;
      const claimsEl = stage.querySelector("#w2-co-claims");
      const docsEl = stage.querySelector("#w2-co-docs");
      let matched = 0;
      const totalToMatch = claimsList.filter(c => !c.caught).length;
      claimsList.forEach(c => {
        const slot = el("div", { class: "w2-co-slot", "data-claim": c.key, "data-caught": c.caught ? "1" : "" }, c.caught ? "✓ already caught — " + c.claim : c.claim);
        if (c.caught) slot.classList.add("correct");
        slot.addEventListener("dragover", e => { e.preventDefault(); slot.classList.add("hover"); });
        slot.addEventListener("dragleave", () => slot.classList.remove("hover"));
        slot.addEventListener("drop", e => {
          e.preventDefault(); slot.classList.remove("hover");
          const docKey = e.dataTransfer.getData("text/plain");
          const expectedDoc = CONTRA_DOCS[c.key];
          if (c.caught || slot.classList.contains("correct")) return;
          if (expectedDoc && docKey === expectedDoc.id) {
            slot.classList.add("correct");
            slot.textContent = "✓ " + expectedDoc.label;
            // Find and remove the doc
            const docEl = docsEl.querySelector(`[data-doc="${docKey}"]`);
            if (docEl) docEl.remove();
            matched++;
            safeSfx("chime");
            // Record contradiction caught
            const claimText = c.claim;
            if (!state.calderCaught.includes(claimText)) state.calderCaught.push(claimText);
            if (typeof renderHud === "function") renderHud();
            if (matched >= totalToMatch && totalToMatch > 0) {
              const bonus = matched * 800;
              state._comboPayout = (state._comboPayout || 0) + bonus;
              result.innerHTML = `<span class="w2-r-great">ALL MATCHED</span><div style="font-size:11px;color:#a09080;margin-top:4px">+$${bonus.toLocaleString()} to verdict.</div>`;
              if (typeof showMilestone === "function") showMilestone("CALDER · CAUGHT", `<em>${matched} contradictions filed. +$${bonus.toLocaleString()}.</em>`);
              setTimeout(() => close(1), 1600);
            }
          } else {
            slot.classList.add("wrong");
            safeSfx("click");
            setTimeout(() => slot.classList.remove("wrong"), 600);
            guard.miss();
          }
        });
        claimsEl.appendChild(slot);
      });
      docs.forEach(d => {
        const card = el("div", { class: "w2-co-doc", draggable: "true", "data-doc": d.id });
        card.innerHTML = `<strong>${d.label}</strong><br><em style="font-size:11px;color:#a09080">${d.desc}</em>`;
        card.addEventListener("dragstart", e => {
          e.dataTransfer.setData("text/plain", d.id);
          card.classList.add("dragging");
        });
        card.addEventListener("dragend", () => card.classList.remove("dragging"));
        docsEl.appendChild(card);
      });
    }
  });
}

// ============================================================
// 7. VOCABULARY MATCH (Ovilus lineup)
// ============================================================
const VOCAB_ROUNDS = [
  { words: ["ELIZA",  "FIRE",   "NINETEEN"], correct: "eliza",          others: ["Quiet Twin", "Knocker (Elias)", "Woman in Grey", "Cold Mother"], name: "Eliza Halliwell" },
  { words: ["CHILD",  "DON'T",  "OPEN"],     correct: "quiet_twin",     others: ["Eliza Halliwell", "Knocker", "Watcher on the Hill", "Listening Twin"], name: "The Quiet Twin" },
  { words: ["MINE",   "LEDGER", "BUILT"],    correct: "knocker",        others: ["Eliza Halliwell", "Cold Mother", "Quiet Twin", "Adeline"], name: "Elias (the Knocker)" },
  { words: ["EVELYN", "WALL",   "OUT"],      correct: "cold_mother",    others: ["Eliza Halliwell", "Adeline", "Knocker", "Quiet Twin"], name: "Evelyn (Cold Mother)" }
];

async function vocabMatch() {
  const round = VOCAB_ROUNDS[Math.floor(Math.random() * VOCAB_ROUNDS.length)];
  return openModal({
    title: "OVILUS · MATCH THE VOCABULARY",
    sub: "<strong>How to play:</strong> the device just spoke the 3 highlighted words. Which entity's vocabulary do they belong to? Pick a card. <strong>3 wrong = page closes.</strong>",
    build: ({ stage, actions, result, close, panel }) => {
      const guard = makeMistakeGuard({ name: "vocabulary match", lockKey: "_vocabLocked", max: 3, panel, stage, close });
      const all = [round.name].concat(round.others).sort(() => Math.random() - 0.5);
      stage.innerHTML = `
        <div class="w2-vo-words">${round.words.map(w => `<div class="w2-vo-word">${w}</div>`).join("")}</div>
        <div class="w2-vo-lineup" id="w2-vo-lineup"></div>
      `;
      const lineup = stage.querySelector("#w2-vo-lineup");
      all.forEach(name => {
        const pick = el("div", { class: "w2-vo-pick" }, name);
        pick.onclick = () => {
          if (name === round.name) {
            pick.classList.add("correct");
            safeSfx("chime");
            result.innerHTML = `<span class="w2-r-great">CORRECT — ${round.name}</span>`;
            state._comboPayout = (state._comboPayout || 0) + 1000;
            if (typeof logEvidence === "function") logEvidence("Vocabulary Match", `Identified ${round.name} from spoken vocabulary.`);
            if (typeof showMilestone === "function") showMilestone("VOCABULARY · MATCHED", `<em>${round.name}. +$1,000.</em>`);
            setTimeout(() => close(1), 1400);
          } else {
            pick.classList.add("wrong");
            safeSfx("click");
            setTimeout(() => pick.classList.remove("wrong"), 600);
            guard.miss();
          }
        };
        lineup.appendChild(pick);
      });
    }
  });
}

// ============================================================
// 8. CANDLE DRAFT TRAIL
// ============================================================
//
// The candle's flame leans toward the draft. Pick the next room
// matching the flame's lean. 4 correct picks unlock a hidden doc.
async function draftTrail() {
  return openModal({
    title: "FOLLOW THE DRAFT",
    sub: "<strong>How to play:</strong> the candle's flame leans toward where a draft is coming from. If it leans LEFT, pick the LEFT room. If it leans RIGHT, pick the RIGHT room. <strong>4 rooms to clear. 4 wrong = page closes.</strong>",
    build: ({ stage, actions, result, close, panel }) => {
      const guard = makeMistakeGuard({ name: "draft trail", lockKey: "_draftLocked", max: 4, panel, stage, close });
      // 4 stops along the path. Each has a LEFT and RIGHT room; one is correct.
      const stops = [
        { correct: "left",  leftName: "Library",       rightName: "Dining Room",  story: "The flame slants from the hall." },
        { correct: "right", leftName: "Master Bedroom",rightName: "Upstairs Hall",story: "Cold air spills down the stairs." },
        { correct: "left",  leftName: "Nursery",       rightName: "Governess Room",story: "The east wall draws the flame." },
        { correct: "right", leftName: "Storage Closet",rightName: "Hidden Seam",  story: "A seam in the plaster pulls the flame." }
      ];
      let step = 0;

      stage.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin:14px 0">
          <div id="w2-cd-msg" style="text-align:center;font-size:15px;color:#b89878;font-style:italic;line-height:1.5;flex:1"></div>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:0;margin:10px 0">
          <button class="w2-cd-room w2-btn" id="w2-cd-left"   style="min-width:140px;padding:14px"></button>
          <div class="w2-cd-flame" id="w2-cd-flame" style="margin:0 22px">
            <div class="w2-cd-flame-body"></div>
            <div class="w2-cd-flame-wick" id="w2-cd-wick"></div>
          </div>
          <button class="w2-cd-room w2-btn" id="w2-cd-right"  style="min-width:140px;padding:14px"></button>
        </div>
        <div style="text-align:center;font-size:13px;color:#80c890;letter-spacing:2px" id="w2-cd-progress"></div>
      `;
      const wick = stage.querySelector("#w2-cd-wick");
      const leftBtn = stage.querySelector("#w2-cd-left");
      const rightBtn = stage.querySelector("#w2-cd-right");
      const msg = stage.querySelector("#w2-cd-msg");
      const prog = stage.querySelector("#w2-cd-progress");

      function render() {
        const s = stops[step];
        leftBtn.textContent = "◀ " + s.leftName;
        rightBtn.textContent = s.rightName + " ▶";
        msg.innerHTML = `<strong>${s.story}</strong>`;
        // Strong, obvious lean — 35 degrees
        const lean = s.correct === "left" ? -35 : 35;
        wick.style.transform = `translateX(-50%) rotate(${lean}deg)`;
        prog.textContent = `STEP ${step + 1} OF ${stops.length}`;
      }
      function pick(side) {
        const s = stops[step];
        if (side === s.correct) {
          safeSfx("chime");
          step++;
          if (step >= stops.length) {
            result.innerHTML = `<span class="w2-r-great">TRAIL FOLLOWED</span>`;
            state._comboPayout = (state._comboPayout || 0) + 1500;
            if (typeof logEvidence === "function") logEvidence("Draft Trail", "Followed the candle's lean across four rooms — air currents reveal a hidden seam in the nursery wall.");
            if (typeof showMilestone === "function") showMilestone("THE WALL HAS A SEAM", "<em>The candle led you. +$1,500.</em>");
            setTimeout(() => close(1), 1500);
          } else {
            render();
          }
        } else {
          safeSfx("click");
          (side === "left" ? leftBtn : rightBtn).style.background = "#301818";
          (side === "left" ? leftBtn : rightBtn).style.borderColor = "#c05050";
          setTimeout(() => render(), 700);
          if (guard.miss()) return;
        }
      }
      leftBtn.onclick = () => pick("left");
      rightBtn.onclick = () => pick("right");
      render();
    }
  });
}

// ============================================================
// 9. PIANO FRAGMENT
// ============================================================
//
// The house plays 4 notes. The player echoes them. Then must choose the
// 5th note that completes Margaret's melody.
async function pianoFragment() {
  return openModal({
    title: "PARLOR · A FEW NOTES",
    sub: "<strong>How to play:</strong> the house plays 4 notes (highlighted on the keyboard). Click the same 4 keys in the same order. Then pick one more key as the resolving 5th note — the one Margaret used to end her phrase on.",
    build: ({ stage, actions, result, close }) => {
      const KEYS = ["C", "D", "E", "F", "G", "A", "B"];
      const freqs = [262, 294, 330, 349, 392, 440, 494];
      // 4-note prompt + the "correct" 5th
      const prompt = [4, 6, 4, 2]; // G B G E
      const finalNote = 0; // C resolves
      stage.innerHTML = `
        <div class="w2-pi-keys" id="w2-pi-keys"></div>
        <div id="w2-pi-msg" style="text-align:center;font-size:14px;color:#b89878;font-style:italic;line-height:1.5">Listen...</div>
      `;
      const keysEl = stage.querySelector("#w2-pi-keys");
      const msg = stage.querySelector("#w2-pi-msg");
      const els = KEYS.map((n, i) => {
        const k = el("div", { class: "w2-pi-key", "data-i": i }, n);
        keysEl.appendChild(k);
        return k;
      });
      function tone(i, dur) {
        playTone(freqs[i], dur || 0.5, "triangle");
      }
      function flash(i) {
        els[i].classList.add("lit");
        setTimeout(() => els[i].classList.remove("lit"), 380);
      }

      let stage_ = "listen";
      let inputs = [];

      async function playPrompt() {
        for (let i = 0; i < prompt.length; i++) {
          await new Promise(r => setTimeout(r, 500));
          tone(prompt[i]); flash(prompt[i]);
        }
        stage_ = "echo";
        msg.textContent = "Now repeat the four notes.";
      }
      setTimeout(playPrompt, 600);

      els.forEach((k, idx) => {
        k.onclick = () => {
          if (stage_ === "echo") {
            tone(idx); flash(idx);
            inputs.push(idx);
            if (inputs[inputs.length-1] !== prompt[inputs.length-1]) {
              result.innerHTML = `<span class="w2-r-miss">OFF KEY</span>`;
              setTimeout(() => close(0), 1200);
              stage_ = "done";
              return;
            }
            if (inputs.length === prompt.length) {
              stage_ = "final";
              msg.textContent = "Now the fifth note. What resolves it?";
            }
          } else if (stage_ === "final") {
            tone(idx, 0.9); flash(idx);
            if (idx === finalNote) {
              result.innerHTML = `<span class="w2-r-great">RESOLVED</span>`;
              if (typeof logEvidence === "function") logEvidence("Piano Fragment", "Completed Margaret's parlor melody. The house quieted, briefly.");
              state._comboPayout = (state._comboPayout || 0) + 1200;
              if (typeof showMilestone === "function") showMilestone("MARGARET'S MELODY", "<em>The house listens for a moment. +$1,200.</em>");
              if (typeof relaxAggression === "function") relaxAggression(2);
              setTimeout(() => close(1), 1400);
            } else {
              result.innerHTML = `<span class="w2-r-miss">DOESN'T RESOLVE</span>`;
              setTimeout(() => close(0), 1200);
            }
            stage_ = "done";
          }
        };
      });
    }
  });
}

// ============================================================
// 10. FIELD NOTES floating panel
// ============================================================
function openFieldNotes() {
  const inWyndmere = (state._story === "wyndmere");
  // Story-aware witness label for the contradictions card.
  const witness = inWyndmere ? "Mrs. Thrale" : "Calder";
  const cards = inWyndmere ? [
    { id: "contradictions", name: "Sort Mrs. Thrale's Claims", desc: "Drag documents onto Mrs. Thrale's matching claim. 3 wrong = page closes.", done: state._contraLocked || (state.calderCaught && state.calderCaught.length >= 5), lockedNote: state._contraLocked ? " · LOCKED" : "", run: contradictionsBoard },
    { id: "vocab", name: "Match the Lakeword",  desc: "Identify a spirit by the 3 words it just said.", done: !!state._vocabSolved || !!state._vocabLocked, lockedNote: state._vocabLocked ? " · LOCKED" : "", run: () => vocabMatch().then(s => { if (s) state._vocabSolved = true; }) },
    { id: "latin", name: "The Latin Typewriter", desc: "In the chapel, the typewriter on the lectern types by itself. Stand back. Lift the paper when the line is done.", done: false, lockedNote: " · CHAPEL", run: () => { if (typeof openLatinTypewriter === "function") openLatinTypewriter(); } },
    { id: "stones", name: "Cairn on the Shore", desc: "At the lakeshore, three stones sit at the tide line. Restack them in the order the lake last laid them down.", done: false, lockedNote: " · LAKESHORE", run: () => { if (typeof openShoreStones === "function") openShoreStones(); } }
  ] : [
    { id: "contradictions", name: "Sort Calder's Claims", desc: "Drag documents onto Calder's matching claim. 3 wrong = page closes.", done: state._contraLocked || (state.calderCaught && state.calderCaught.length >= 5), lockedNote: state._contraLocked ? " · LOCKED" : "", run: contradictionsBoard },
    { id: "vocab", name: "Match the Vocabulary",  desc: "Identify a spirit by the 3 words it just said.",        done: !!state._vocabSolved || !!state._vocabLocked, lockedNote: state._vocabLocked ? " · LOCKED" : "", run: () => vocabMatch().then(s => { if (s) state._vocabSolved = true; }) },
    { id: "draft", name: "Follow the Draft",      desc: "Watch which way the candle flame leans. Pick the room on that side.", done: !!state._draftSolved || !!state._draftLocked, lockedNote: state._draftLocked ? " · LOCKED" : "", run: () => draftTrail().then(s => { if (s) state._draftSolved = true; }) },
    { id: "piano", name: "The Piano Fragment",    desc: "Listen to 4 piano notes. Click the same 4 keys in order. Then pick the 5th that resolves them.",             done: !!state._pianoSolved, lockedNote: "", run: () => pianoFragment().then(s => { if (s) state._pianoSolved = true; }) }
  ];
  openModal({
    title: "FIELD NOTES",
    sub: "Side investigations. Each pays into the verdict.",
    build: ({ stage, actions, close }) => {
      const grid = el("div", { class: "w2-fn-grid" });
      cards.forEach(c => {
        const card = el("div", { class: "w2-fn-card" + (c.done ? " done" : "") });
        const mark = c.lockedNote || (c.done ? " · ✓" : "");
        card.innerHTML = `<div class="w2-fn-name">${c.name}${mark}</div><div class="w2-fn-desc">${c.desc}</div>`;
        if (!c.done) card.onclick = () => { close(); setTimeout(() => c.run(), 300); };
        grid.appendChild(card);
      });
      stage.appendChild(grid);
    }
  });
}

// Add a "FIELD NOTES" chip into the HUD strip once Calder leaves
function ensureFieldNotesBtn() {
  if (!state || !state.calderLeft) return;
  const row = document.getElementById("sk-hud-row");
  let btn = document.getElementById("w2-fn-btn");
  if (!btn) {
    btn = el("button", { id: "w2-fn-btn", type: "button", title: "Side investigations" }, "📓 FIELD NOTES");
    btn.onclick = openFieldNotes;
  }
  if (row && btn.parentElement !== row) row.appendChild(btn);
  else if (!row && !btn.parentElement) document.body.appendChild(btn);
}
// Piggyback on the existing renderHud wrapping (wave 1 wraps it too)
(function gateHudW2() {
  const orig = window.renderHud;
  if (typeof orig !== "function") return;
  window.renderHud = function patched() {
    orig.apply(this, arguments);
    ensureFieldNotesBtn();
  };
})();

})();
