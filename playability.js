// playability.js — Wave 1 of the "more game, less read-and-click" pass.
//
// This file is purely additive. It wraps existing tool/scare/verdict
// functions to insert skill-check mini-games, a candle/rest economy, an
// HUD progress chip, a scored verdict breakdown, nightly modifiers, and
// click feedback. Load AFTER game.js, danger.js, scares.js.
//
// If you need to disable this entire layer, just comment out the script
// tag in index.html. Nothing else depends on it.
"use strict";

(function () {

// ============================================================
// 0. Utilities
// ============================================================

const PLAY = window.PLAY = {
  // Per-run skill score; rolls into the verdict breakdown.
  skillTotal: 0,
  skillAttempts: 0,
  // Rest economy.
  restsLeft: 4,
  restsMax: 4,
  // Nightly modifier (rolled at startGameProper).
  modifier: null,
  // Streak (persisted across runs in localStorage).
  streak: 0
};

function el(tag, attrs, children) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "style") Object.assign(e.style, attrs[k]);
    else if (k === "html") e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if (children) for (const c of [].concat(children)) {
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
function safeAudio(name) {
  try { if (typeof audio !== "undefined") audio.sfx(name); } catch (e) {}
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function reduceMotion() {
  return document.body.classList.contains("reduce-motion");
}

styleTag("playability-css", `
.sk-overlay {
  position: fixed; inset: 0; z-index: 9000;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(20,10,8,.78) 0%, rgba(0,0,0,.94) 100%);
  font-family: var(--serif-body, Georgia, serif);
  animation: skFade .18s ease;
}
@keyframes skFade { from { opacity: 0 } to { opacity: 1 } }
.sk-panel {
  background: linear-gradient(180deg,#1c1410 0%, #0c0806 100%);
  border: 1px solid #4a2818;
  box-shadow: 0 0 0 1px #8a5028 inset, 0 30px 80px rgba(0,0,0,.7);
  padding: 22px 26px 18px;
  width: min(520px, 92vw);
  color: #d4a878;
  text-align: center;
  border-radius: 4px;
}
.sk-title {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 5px; font-size: 12px;
  color: #c08040; margin: 0 0 4px;
}
.sk-sub {
  font-size: 13px; color: #a09080; font-style: italic; margin: 0 0 14px;
}
.sk-stage {
  position: relative;
  background: #08060a;
  border: 1px solid #2a1810;
  margin: 0 auto 12px;
  overflow: hidden;
}
.sk-actions {
  display: flex; gap: 10px; justify-content: center; margin-top: 8px;
}
.sk-actions button {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 2px; font-size: 11px;
  background: #2a1810; color: #d4a878;
  border: 1px solid #6a3820; padding: 8px 14px;
  cursor: pointer; transition: all .15s;
}
.sk-actions button:hover { background: #4a2818; color: #ffd498; }
.sk-actions button:disabled { opacity: .4; cursor: default; }
.sk-result {
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 3px; font-size: 13px;
  margin-top: 10px; min-height: 18px;
}
.sk-r-great { color: #80d090; }
.sk-r-ok    { color: #d4a878; }
.sk-r-miss  { color: #c05050; }

/* Click feedback */
@keyframes skClickFlash {
  0% { box-shadow: 0 0 0 0 rgba(212,168,120,.55); }
  100% { box-shadow: 0 0 0 14px rgba(212,168,120,0); }
}
.sk-click-flash { animation: skClickFlash .45s ease-out; }

/* HUD: candle + progress chip — docked as a clean strip directly below
 * the main HUD bar so it reads as an extension of the HUD instead of a
 * floating plate hovering over the scene art. */
#sk-hud-row {
  position: fixed;
  top: 36px;            /* main HUD is 36px tall — sit flush beneath it */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 14px;
  z-index: 50;
  font-family: var(--serif-display, "Cinzel", serif);
  font-size: 10px;
  letter-spacing: 2px;
  pointer-events: none;
  padding: 4px 18px 5px;
  background: linear-gradient(180deg, #15101200 0%, #100b0d 60%, #0a0608 100%);
  border-bottom: 1px solid #2a2022;
  box-shadow: 0 1px 0 rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35);
}
.sk-chip {
  background: rgba(20,12,8,.82);
  border: 1px solid #3a2818;
  color: #c4ad94;
  padding: 3px 11px;
  border-radius: 2px;
  pointer-events: auto;
  cursor: default;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.sk-chip strong { color: #ffd498; font-weight: 600; letter-spacing: 1px; }
.sk-candle {
  display: inline-flex; gap: 4px; align-items: center;
}
.sk-candle-wick {
  display: inline-block; width: 6px; height: 9px;
  background: linear-gradient(180deg,#ffd060 0%, #ff8020 60%, #c04010 100%);
  box-shadow: 0 0 5px #ff8020, 0 0 10px #ff402080;
  border-radius: 50% 50% 35% 35% / 60% 60% 40% 40%;
}
.sk-candle-wick.spent {
  background: #2a1a10; box-shadow: none;
}

/* Push the scene area down so it doesn't sit under the new strip */
#scene { padding-top: 28px; }

/* Hide the strip neatly on very narrow windows */
@media (max-width: 720px) {
  #sk-hud-row { font-size: 9px; gap: 6px; padding: 3px 8px; }
  .sk-chip { padding: 2px 6px; }
}

/* Modifier banner */
.sk-modifier {
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  background: rgba(20,12,8,.92);
  border: 1px solid #6a3820;
  color: #d4a878;
  font-family: var(--serif-display, "Cinzel", serif);
  letter-spacing: 3px; font-size: 11px;
  padding: 8px 18px;
  z-index: 5000;
  animation: skFade .4s ease;
}
.sk-modifier strong { color: #ffd498; }

/* Verdict grade */
.sk-grade-box {
  margin-top: 14px; padding: 12px 14px;
  background: linear-gradient(180deg,#241612 0%, #0c0604 100%);
  border: 1px solid #6a3820;
  text-align: center;
}
.sk-grade-letter {
  font-family: var(--serif-display, "Cinzel", serif);
  font-size: 48px; font-weight: 700;
  letter-spacing: 4px;
  color: #ffd498;
  text-shadow: 0 0 20px #ff800040;
  margin: 0;
}
.sk-grade-stars {
  font-size: 22px; letter-spacing: 6px; color: #ffd060;
  margin: 4px 0 8px;
}
.sk-grade-line {
  font-family: var(--serif-body, Georgia, serif);
  font-size: 13px; color: #a09080;
  margin: 3px 0;
}

/* Onboarding pulse */
@keyframes skPulse { 0%,100% { box-shadow: 0 0 0 0 #ffd06080 } 50% { box-shadow: 0 0 0 8px #ffd06000 } }
.sk-pulse { animation: skPulse 1.4s infinite; }
`);

// ============================================================
// 1. Skill-check helper — modal overlay, RAF loop, returns 0..1.
// ============================================================
//
// Each individual mini-game implements its own draw/step closure
// inside runSkillCheck. Returns a Promise resolving to a quality
// score in [0,1] (or null on cancel — treated as miss).

function runSkillCheck({ title, sub, durationMs = 7000, build, onCancel }) {
  return new Promise(resolve => {
    const root = el("div", { class: "sk-overlay", id: "sk-overlay" });
    const panel = el("div", { class: "sk-panel" });
    panel.appendChild(el("div", { class: "sk-title", html: title }));
    if (sub) panel.appendChild(el("div", { class: "sk-sub", html: sub }));
    const stage = el("div", { class: "sk-stage" });
    panel.appendChild(stage);
    const result = el("div", { class: "sk-result" });
    panel.appendChild(result);
    const actions = el("div", { class: "sk-actions" });
    panel.appendChild(actions);
    root.appendChild(panel);
    document.body.appendChild(root);

    let finished = false;
    function finish(score) {
      if (finished) return;
      finished = true;
      const grade = score >= 0.75 ? "GREAT" : score >= 0.4 ? "STEADY" : "POOR";
      const cls   = score >= 0.75 ? "sk-r-great" : score >= 0.4 ? "sk-r-ok" : "sk-r-miss";
      result.innerHTML = `<span class="${cls}">${grade}</span>`;
      PLAY.skillTotal += score;
      PLAY.skillAttempts += 1;
      safeAudio(score >= 0.75 ? "chime" : "click");
      setTimeout(() => {
        root.style.transition = "opacity .25s";
        root.style.opacity = "0";
        setTimeout(() => { root.remove(); resolve(score); }, 260);
      }, 700);
    }

    // Cancel button
    const cancelBtn = el("button", { type: "button" }, "Give up");
    cancelBtn.onclick = () => { if (onCancel) onCancel(); finish(0); };
    actions.appendChild(cancelBtn);

    // Hand off
    build({ stage, actions, finish, result, panel });

    // Hard cap — if not finished by durationMs, auto-resolve at current score (0)
    setTimeout(() => { if (!finished) finish(0); }, durationMs + 1500);
  });
}

// ============================================================
// 2. K-II — steady-aim compass dial
// ============================================================
//
// A "hot direction" arrow drifts on a circular dial. Player must keep
// their cursor inside an aim window for a cumulative 3 seconds out of 6.

function kiiSteadyAim() {
  return runSkillCheck({
    title: "K-II · STEADY READ",
    sub: "<strong>How to play:</strong> move your mouse left/right to aim the yellow needle. Keep the needle on the GREEN BAND (which drifts) for ~2.5 seconds total. The fill bar shows your progress.",
    durationMs: 7000,
    build: ({ stage, finish }) => {
      Object.assign(stage.style, { width: "320px", height: "200px", cursor: "crosshair" });
      stage.innerHTML = `
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#2a1408,#080604)"></div>
        <div id="sk-kii-band" style="position:absolute;left:0;top:50%;height:18px;width:60px;background:linear-gradient(90deg,#40c060,#80f0a0);transform:translateY(-50%);opacity:.85;box-shadow:0 0 14px #40c06080"></div>
        <div id="sk-kii-needle" style="position:absolute;top:50%;height:6px;width:24px;background:#ffd498;transform:translate(-50%,-50%);box-shadow:0 0 8px #ffd498"></div>
        <div id="sk-kii-bar" style="position:absolute;left:8px;right:8px;bottom:6px;height:6px;background:#1a0a04;border:1px solid #3a1808"><div id="sk-kii-fill" style="height:100%;width:0;background:#40c060;transition:width .2s"></div></div>
        <div style="position:absolute;top:6px;left:10px;color:#8a5028;font-size:9px;letter-spacing:2px;font-family:'Courier New',monospace">SIG STR</div>
      `;
      const stageW = 320;
      let needleX = 160;
      let bandX = 130; // band's left edge in px
      const bandW = 60;
      const needleW = 24;
      let bandVx = 60; // px/sec
      let held = 0; // ms inside band
      const target = 2500; // 2.5s
      let last = performance.now();
      let raf;
      const needle = stage.querySelector("#sk-kii-needle");
      const band = stage.querySelector("#sk-kii-band");
      const fill = stage.querySelector("#sk-kii-fill");
      function onMove(e) {
        const r = stage.getBoundingClientRect();
        needleX = clamp(e.clientX - r.left, needleW/2, stageW - needleW/2);
        needle.style.left = needleX + "px";
      }
      stage.addEventListener("mousemove", onMove);
      stage.addEventListener("touchmove", e => {
        if (e.touches[0]) onMove({ clientX: e.touches[0].clientX });
      });
      function step(t) {
        const dt = (t - last) / 1000; last = t;
        // Drift the band
        bandX += bandVx * dt;
        if (bandX <= 0)            { bandX = 0;           bandVx = Math.abs(bandVx); }
        if (bandX >= stageW - bandW) { bandX = stageW - bandW; bandVx = -Math.abs(bandVx); }
        // Randomly perturb speed
        if (Math.random() < 0.02) bandVx = (Math.random() * 120 + 40) * (Math.random() < 0.5 ? -1 : 1);
        band.style.left = bandX + "px";
        // Check overlap
        const inBand = (needleX > bandX) && (needleX < bandX + bandW);
        if (inBand) held += dt * 1000;
        fill.style.width = (held / target * 100) + "%";
        fill.style.background = inBand ? "#80f0a0" : "#40c060";
        if (held >= target) { cancelAnimationFrame(raf); finish(1.0); return; }
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      // Time-out → score by how close to target
      setTimeout(() => {
        cancelAnimationFrame(raf);
        finish(clamp(held / target, 0, 1));
      }, 6500);
    }
  });
}

// ============================================================
// 3. Spirit Box — tune-in lock
// ============================================================
//
// Before the auto-sweep begins, the player must "lock" the box on the
// right frequency. A pointer drifts; click when it crosses the green band.

function spiritTuneIn() {
  return runSkillCheck({
    title: "SPIRIT BOX · TUNE",
    sub: "<strong>How to play:</strong> the bright pointer sweeps left to right. Click LOCK when it crosses through the GREEN BAND. Close = good lock, far = bad.",
    durationMs: 6000,
    build: ({ stage, actions, finish }) => {
      Object.assign(stage.style, { width: "360px", height: "70px" });
      stage.innerHTML = `
        <div style="position:absolute;left:0;right:0;top:24px;height:22px;background:linear-gradient(90deg,#1a0808,#3a1808,#1a0808)"></div>
        <div id="sb-band" style="position:absolute;top:24px;height:22px;width:48px;background:linear-gradient(180deg,#40d060,#206030);left:160px;box-shadow:0 0 10px #40d06080"></div>
        <div id="sb-ptr" style="position:absolute;top:14px;width:3px;height:42px;background:#ffd498;left:0;box-shadow:0 0 8px #ffd498"></div>
        <div style="position:absolute;left:6px;top:54px;color:#8a5028;font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px">76</div>
        <div style="position:absolute;right:6px;top:54px;color:#8a5028;font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px">108 MHz</div>
      `;
      const stageW = 360;
      const ptr = stage.querySelector("#sb-ptr");
      const band = stage.querySelector("#sb-band");
      const bandW = 48;
      const bandX = 160;
      let ptrX = 0, vx = 220;
      let last = performance.now(), raf;
      let locked = false;
      function step(t) {
        const dt = (t - last) / 1000; last = t;
        ptrX += vx * dt;
        if (ptrX < 0) { ptrX = 0; vx = Math.abs(vx); }
        if (ptrX > stageW) { ptrX = stageW; vx = -Math.abs(vx); }
        ptr.style.left = ptrX + "px";
        if (!locked) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      const lockBtn = el("button", { type: "button" }, "LOCK");
      lockBtn.onclick = () => {
        if (locked) return; locked = true;
        cancelAnimationFrame(raf);
        const dist = Math.abs((ptrX) - (bandX + bandW/2));
        // Inside band → great. Within 30px → ok. Beyond → miss.
        const score = dist < bandW/2 ? 1.0 : dist < bandW/2 + 30 ? 0.5 : 0.1;
        finish(score);
      };
      actions.insertBefore(lockBtn, actions.firstChild);
    }
  });
}

// ============================================================
// 4. EVP — waveform scrub
// ============================================================
//
// A playhead drags along a waveform. The whisper is hidden between two
// noise spikes. Stop within tolerance.

function evpScrub(hasWhisper) {
  return runSkillCheck({
    title: "EVP · ISOLATE",
    sub: hasWhisper
      ? "<strong>How to play:</strong> drag across the waveform to scrub. A faint <span style='color:#80d090'>green band</span> marks where a whisper hides — park the playhead inside it and click ISOLATE. The closer you center it, the cleaner the capture."
      : "<strong>How to play:</strong> scrub for any signal. If the tape is static-only, ISOLATE returns nothing.",
    durationMs: 12000,
    build: ({ stage, actions, finish }) => {
      Object.assign(stage.style, { width: "440px", height: "120px", cursor: "ew-resize" });
      const W = 440;
      const targetPct = hasWhisper ? 22 + Math.random() * 56 : -100;
      // Much more forgiving: a 12% band reads as "in zone", a 22% band as
      // "close enough to count for partial credit". Plus the band is now
      // VISIBLE so the player isn't guessing.
      const innerTol = 6;   // % — bullseye
      const outerTol = 14;  // % — band edge
      const bars = Array.from({length: 60}, (_, i) => {
        const distToTarget = Math.abs(i / 60 * 100 - targetPct);
        const isSpike = (distToTarget > 7 && distToTarget < 14);
        const h = isSpike ? 30 + Math.random()*40 : 6 + Math.random()*14;
        return `<div style="display:inline-block;width:5px;margin:0 1px;height:${h}px;background:${isSpike?'#a08060':'#3a4a4a'};vertical-align:middle"></div>`;
      }).join("");
      // Visible target band (only when there's a whisper to find)
      const bandHtml = hasWhisper ? `
        <div style="position:absolute;top:0;bottom:32px;left:${(targetPct - outerTol)}%;width:${outerTol*2}%;background:linear-gradient(180deg, rgba(128,208,144,0.04) 0%, rgba(128,208,144,0.16) 50%, rgba(128,208,144,0.04) 100%);border-left:1px dashed rgba(128,208,144,0.55);border-right:1px dashed rgba(128,208,144,0.55);pointer-events:none"></div>
        <div style="position:absolute;top:0;bottom:32px;left:${(targetPct - innerTol)}%;width:${innerTol*2}%;background:rgba(128,208,144,0.18);pointer-events:none"></div>
      ` : "";
      stage.innerHTML = `
        <div style="position:relative;height:80px;background:#08060a;border-bottom:1px solid #2a1810;overflow:hidden">
          ${bandHtml}
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 4px">${bars}</div>
          <div id="ev-head" style="position:absolute;top:0;bottom:0;width:2px;background:#ffd498;left:0;box-shadow:0 0 8px #ffd498;pointer-events:none"></div>
        </div>
        <div id="ev-cue" style="text-align:center;color:#8a7565;font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;padding:6px 0;height:24px">${hasWhisper ? "SCRUB · TUNE TO THE BAND" : "STATIC · NOTHING TO TUNE"}</div>
      `;
      const head = stage.querySelector("#ev-head");
      const cue = stage.querySelector("#ev-cue");
      let pct = 0;
      let lastTickAt = 0;
      let timeInBand = 0;  // ms accumulated inside outerTol
      let lastUpdate = performance.now();
      function onMove(e) {
        const r = stage.getBoundingClientRect();
        pct = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
        head.style.left = (pct / 100 * W) + "px";
        if (hasWhisper) {
          const d = Math.abs(pct - targetPct);
          // Warmer / colder cue + a gentle blip when you cross the band
          if (d < innerTol) {
            cue.textContent = "◆ LOCKED — ISOLATE NOW";
            cue.style.color = "#80d090";
          } else if (d < outerTol) {
            cue.textContent = "● IN THE BAND";
            cue.style.color = "#80d090";
          } else if (d < outerTol + 10) {
            cue.textContent = "warmer…";
            cue.style.color = "#d4a878";
          } else {
            cue.textContent = "cold";
            cue.style.color = "#5a4850";
          }
          // Audio: subtle tick when you cross into the band
          const now = performance.now();
          if (d < outerTol && now - lastTickAt > 220) {
            lastTickAt = now;
            try { if (typeof audio !== "undefined" && audio.sfx) audio.sfx("click"); } catch (e) {}
          }
        }
      }
      stage.addEventListener("mousemove", onMove);
      stage.addEventListener("touchmove", e => e.touches[0] && onMove({ clientX: e.touches[0].clientX }));
      // Continuously accumulate time-in-band so a player who hovers correctly
      // for a second or two gets credit even if they release a hair off-center.
      let raf;
      function loop() {
        const now = performance.now();
        const dt = now - lastUpdate;
        lastUpdate = now;
        if (hasWhisper && Math.abs(pct - targetPct) < outerTol) timeInBand += dt;
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      const stopBtn = el("button", { type: "button" }, "ISOLATE");
      stopBtn.onclick = () => {
        cancelAnimationFrame(raf);
        if (!hasWhisper) { finish(0); return; }
        const d = Math.abs(pct - targetPct);
        // Position score: 1.0 bullseye, 0.7 in-band, taper to 0.1 far away
        let posScore;
        if (d < innerTol)      posScore = 1.0;
        else if (d < outerTol) posScore = 0.7;
        else if (d < outerTol + 10) posScore = 0.35;
        else posScore = 0.1;
        // Time-in-band bonus: up to +0.25 for steady tracking
        const timeBonus = clamp(timeInBand / 1500, 0, 1) * 0.25;
        const score = clamp(posScore + timeBonus, 0, 1);
        finish(score);
      };
      actions.insertBefore(stopBtn, actions.firstChild);
    }
  });
}

// ============================================================
// 5. Thermal — box the coldest cluster
// ============================================================

function thermalReticle(hasCold) {
  return runSkillCheck({
    title: "THERMAL · BOX THE ANOMALY",
    sub: hasCold
      ? "<strong>How to play:</strong> a bright <span style='color:#80c0ff'>blue cold-spot</span> drifts across the heat map. Keep the reticle on it. The temperature readout tells you how close you are. Hold for ~1.5 seconds total to lock the capture."
      : "<strong>How to play:</strong> sweep the heat map — but there's <em>no cold signature</em> here. Either wait for the steady-room timer to fill, or click <strong>CONFIRM CLEAR</strong> to log it as a clean debunk now.",
    durationMs: 9000,
    build: ({ stage, actions, finish }) => {
      const W = 360, H = 220;
      Object.assign(stage.style, { width: W+"px", height: H+"px", cursor: "crosshair" });
      // A wandering cold spot — slower than before, and visually unmistakable
      let cx = Math.random() * (W - 60) + 30, cy = Math.random() * (H - 60) + 30;
      // Guarantee a minimum drift speed so the spot is never visually "stuck".
      function _v() { const s = (Math.random() < 0.5 ? -1 : 1); return s * (40 + Math.random() * 40); }
      let vx = _v(), vy = _v();
      stage.innerHTML = `
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 70%,#a04020,#400810 60%,#10040a)"></div>
        ${hasCold ? `
          <div id="th-spot" style="position:absolute;width:88px;height:88px;border-radius:50%;
            background:radial-gradient(circle, #cfe8ff 0%, #80c0ff 28%, #3060c0 55%, #1a2a60 75%, transparent 90%);
            box-shadow:0 0 24px #80c0ff, 0 0 48px #3060c080;
            transform:translate(-50%,-50%);left:${cx}px;top:${cy}px;
            animation:thSpotPulse 1.4s ease-in-out infinite"></div>
          <style>@keyframes thSpotPulse{0%,100%{opacity:0.92;filter:blur(0)}50%{opacity:1;filter:blur(1px)}}</style>
        ` : ""}
        <div id="th-ret" style="position:absolute;width:72px;height:72px;border:2px dashed #ffd498;border-radius:6px;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 8px rgba(255,212,152,0.4)"></div>
        <div id="th-temp" style="position:absolute;top:10px;right:12px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:#ffc060;background:rgba(0,0,0,0.55);padding:3px 8px;border:1px solid #4a2818">--.-°</div>
        <div id="th-fill" style="position:absolute;left:6px;right:6px;bottom:6px;height:8px;background:#1a0a04;border:1px solid #3a1808"><div id="th-fill-i" style="height:100%;width:0;background:linear-gradient(90deg,#3060c0,#80c0ff);transition:width .12s;box-shadow:0 0 6px #80c0ff80"></div></div>
      `;
      const spot = stage.querySelector("#th-spot");
      const ret = stage.querySelector("#th-ret");
      const fillI = stage.querySelector("#th-fill-i");
      const tempEl = stage.querySelector("#th-temp");
      let mx = W/2, my = H/2;
      // Place the reticle at the centre of the stage immediately so the player
      // can SEE it before they move their mouse — previously it sat clipped at
      // (0,0) of the stage and looked like a broken UI element.
      ret.style.left = mx + "px";
      ret.style.top  = my + "px";
      function onMove(e) {
        const r = stage.getBoundingClientRect();
        mx = clamp(e.clientX - r.left, 0, W);
        my = clamp(e.clientY - r.top, 0, H);
        ret.style.left = mx + "px"; ret.style.top = my + "px";
      }
      stage.addEventListener("mousemove", onMove);
      stage.addEventListener("touchmove", e => e.touches[0] && onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }));
      let held = 0;
      const target = 1500;  // 1.5s instead of 1.8s
      const lockRadius = 50; // was 35 — much more forgiving
      let last = performance.now(), raf;
      let lastBeepAt = 0;
      function step(t) {
        const dt = (t - last) / 1000; last = t;
        if (hasCold) {
          cx += vx * dt; cy += vy * dt;
          if (cx < 50) { cx = 50; vx = -vx; }
          if (cx > W-50) { cx = W-50; vx = -vx; }
          if (cy < 50) { cy = 50; vy = -vy; }
          if (cy > H-50) { cy = H-50; vy = -vy; }
          if (spot) { spot.style.left = cx+"px"; spot.style.top = cy+"px"; }
          const d = Math.hypot(mx-cx, my-cy);
          // Temperature readout — drops fast inside lock radius
          const tempF = d < lockRadius ? (24 + d*0.05).toFixed(1) : (45 + Math.min(d, 200) * 0.12).toFixed(1);
          tempEl.textContent = tempF + "°F";
          tempEl.style.color = d < lockRadius ? "#80c0ff" : d < lockRadius + 50 ? "#ffc060" : "#a06040";
          // Reticle glows when in range
          ret.style.borderColor = d < lockRadius ? "#80c0ff" : "#ffd498";
          if (d < lockRadius) {
            held += dt * 1000;
            const now = performance.now();
            if (now - lastBeepAt > 280) {
              lastBeepAt = now;
              try { if (typeof audio !== "undefined" && audio.sfx) audio.sfx("click"); } catch (e) {}
            }
          }
          fillI.style.width = (held/target*100)+"%";
        } else {
          tempEl.textContent = "+65.5°F";
        }
        if (held >= target) { cancelAnimationFrame(raf); finish(1.0); return; }
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      // For the no-cold (debunk) branch: give the player agency + a visible timer.
      // Auto-fill the bottom bar over ~8s so they SEE something happening, and
      // add a CONFIRM CLEAR button so they don't have to sit and wait.
      if (!hasCold) {
        const startedAt = performance.now();
        const waitMs = 8000;
        (function tickClear() {
          const t = performance.now() - startedAt;
          const pct = Math.min(100, (t / waitMs) * 100);
          if (fillI) {
            fillI.style.width = pct + "%";
            fillI.style.background = "linear-gradient(90deg,#a04020,#ffc060)";
            fillI.style.boxShadow = "0 0 6px #ffc06080";
          }
          if (t < waitMs) requestAnimationFrame(tickClear);
        })();
        const ok = el("button", { type: "button" }, "CONFIRM CLEAR");
        ok.onclick = () => { cancelAnimationFrame(raf); finish(1.0); };
        actions.insertBefore(ok, actions.firstChild);
      }
      setTimeout(() => { cancelAnimationFrame(raf); finish(hasCold ? clamp(held/target,0,1) : 1.0); }, 8500);
    }
  });
}

// ============================================================
// 6. SLS — hold reticle on moving figure
// ============================================================

function slsTrack(nFigures) {
  if (nFigures === 0) {
    // No figures in frame — still run a quick "empty sweep" check so the
    // player always sees a mini-game when they capture. 3s gentle scan.
    return runSkillCheck({
      title: "SLS · EMPTY FRAME",
      sub: "<strong>How to play:</strong> the grid shows nothing humanoid. Click CONFIRM EMPTY to log a clean capture (no figures present).",
      durationMs: 5000,
      build: ({ stage, actions, finish }) => {
        const W = 360, H = 200;
        Object.assign(stage.style, { width: W+"px", height: H+"px" });
        stage.innerHTML = `
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0a1410,#020604)"></div>
          <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(64,160,80,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(64,160,80,.18) 1px,transparent 1px);background-size:24px 24px"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#40a050;font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px">NO HUMANOID SIGNATURES</div>`;
        const ok = el("button", { type: "button" }, "CONFIRM EMPTY");
        ok.onclick = () => finish(1.0);
        actions.insertBefore(ok, actions.firstChild);
      }
    });
  }
  return runSkillCheck({
    title: "SLS · FRAME THE FIGURE",
    sub: "<strong>How to play:</strong> a stick-figure walks back and forth on the grid. Move your cursor over it and keep the reticle box on it for ~2 seconds. If it steps out of frame too long, the capture fails.",
    durationMs: 8000,
    build: ({ stage, actions, finish }) => {
      const W = 360, H = 220;
      Object.assign(stage.style, { width: W+"px", height: H+"px", cursor: "crosshair" });
      let fx = 60, fy = H-60;
      let dir = 1; let bobT = 0;
      stage.innerHTML = `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0a1410,#020604)"></div>
        <div id="sl-grid" style="position:absolute;inset:0;background-image:linear-gradient(rgba(64,160,80,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(64,160,80,.18) 1px,transparent 1px);background-size:24px 24px"></div>
        <div id="sl-fig" style="position:absolute;width:18px;height:42px;left:${fx}px;top:${fy}px;transform:translate(-50%,-50%);background:#40d060;box-shadow:0 0 10px #40d06080;clip-path:polygon(40% 0,60% 0,60% 30%,80% 30%,80% 60%,55% 60%,55% 100%,45% 100%,45% 60%,20% 60%,20% 30%,40% 30%)"></div>
        <div id="sl-ret" style="position:absolute;width:44px;height:54px;border:2px solid #ffd498;transform:translate(-50%,-50%);pointer-events:none"></div>
        <div id="sl-fill" style="position:absolute;left:6px;right:6px;bottom:6px;height:6px;background:#1a0a04;border:1px solid #3a1808"><div id="sl-fill-i" style="height:100%;width:0;background:#40d060;transition:width .15s"></div></div>
      `;
      const fig = stage.querySelector("#sl-fig");
      const ret = stage.querySelector("#sl-ret");
      const fillI = stage.querySelector("#sl-fill-i");
      let mx = W/2, my = H/2;
      function onMove(e) {
        const r = stage.getBoundingClientRect();
        mx = clamp(e.clientX - r.left, 0, W);
        my = clamp(e.clientY - r.top, 0, H);
        ret.style.left = mx+"px"; ret.style.top = my+"px";
      }
      stage.addEventListener("mousemove", onMove);
      stage.addEventListener("touchmove", e => e.touches[0] && onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }));
      let held = 0, target = 1800;
      let last = performance.now(), raf;
      function step(t) {
        const dt = (t-last)/1000; last = t; bobT += dt;
        fx += dir * 50 * dt;
        if (fx < 30) dir = 1; if (fx > W-30) dir = -1;
        fy = H/2 + Math.sin(bobT*2) * 40;
        fig.style.left = fx+"px"; fig.style.top = fy+"px";
        const d = Math.hypot(mx-fx, my-fy);
        if (d < 28) held += dt * 1000;
        fillI.style.width = (held/target*100)+"%";
        if (held >= target) { cancelAnimationFrame(raf); finish(1.0); return; }
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      setTimeout(() => { cancelAnimationFrame(raf); finish(clamp(held/target,0,1)); }, 7500);
    }
  });
}

// ============================================================
// 7. Camera — focus + exposure dials
// ============================================================

function cameraFocus() {
  return runSkillCheck({
    title: "FILM CAMERA · FOCUS & EXPOSURE",
    sub: "<strong>How to play:</strong> drag the two sliders until the preview is BRIGHT and SHARP (not blurry, not too dark). When it looks good, click SHUTTER.",
    durationMs: 12000,
    build: ({ stage, actions, finish }) => {
      const W = 360, H = 200;
      Object.assign(stage.style, { width: W+"px", height: H+"px" });
      // Two sliders, each with a hidden target.
      const focusTarget = 30 + Math.random()*40;     // %
      const exposureTarget = 30 + Math.random()*40;  // %
      stage.innerHTML = `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#180c08,#06030a)"></div>
        <div id="cf-preview" style="position:absolute;left:10px;top:10px;right:10px;height:110px;background:radial-gradient(ellipse at center,#604030,#100806);filter:blur(8px) brightness(.5);transition:filter .15s"></div>
        <div style="position:absolute;left:10px;top:130px;color:#8a5028;font-size:9px;letter-spacing:2px;font-family:'Courier New',monospace">FOCUS</div>
        <input type="range" min="0" max="100" value="0" id="cf-focus" style="position:absolute;left:60px;top:128px;right:10px;accent-color:#c08040">
        <div style="position:absolute;left:10px;top:158px;color:#8a5028;font-size:9px;letter-spacing:2px;font-family:'Courier New',monospace">EXPOS</div>
        <input type="range" min="0" max="100" value="0" id="cf-exp" style="position:absolute;left:60px;top:156px;right:10px;accent-color:#c08040">
      `;
      const preview = stage.querySelector("#cf-preview");
      const fSlider = stage.querySelector("#cf-focus");
      const eSlider = stage.querySelector("#cf-exp");
      function update() {
        const f = +fSlider.value;
        const e = +eSlider.value;
        const blur = Math.abs(f - focusTarget) * 0.4;
        const brightness = 0.3 + (1 - Math.abs(e - exposureTarget)/100) * 1.2;
        preview.style.filter = `blur(${blur}px) brightness(${brightness.toFixed(2)})`;
      }
      fSlider.oninput = update; eSlider.oninput = update; update();
      const shutter = el("button", { type: "button" }, "SHUTTER");
      shutter.onclick = () => {
        const fErr = Math.abs(+fSlider.value - focusTarget);
        const eErr = Math.abs(+eSlider.value - exposureTarget);
        const score = clamp(1 - (fErr + eErr) / 60, 0, 1);
        finish(score);
      };
      actions.insertBefore(shutter, actions.firstChild);
    }
  });
}

// ============================================================
// 8. EM Pump — align 3 dial segments
// ============================================================

function pumpAlign() {
  return runSkillCheck({
    title: "EM PUMP · ALIGN CIRCUIT",
    sub: "<strong>How to play:</strong> three rings are spinning at different speeds. Click anywhere in the dial to STOP the next ring — each click locks one in order (outer → middle → inner). Stop each notch as close to the top marker as you can. Three locked notches = ENERGIZE auto-fires.",
    durationMs: 18000,
    build: ({ stage, actions, finish }) => {
      const W = 260, H = 260;
      Object.assign(stage.style, { width: W+"px", height: H+"px", cursor: "pointer" });
      stage.innerHTML = `<svg viewBox="0 0 260 260" width="260" height="260" style="display:block">
        <defs>
          <radialGradient id="pmp-bg"><stop offset="0%" stop-color="#1a0e08"/><stop offset="100%" stop-color="#080406"/></radialGradient>
        </defs>
        <circle cx="130" cy="130" r="125" fill="url(#pmp-bg)"/>
        <circle cx="130" cy="130" r="105" fill="none" stroke="#3a2418" stroke-width="2"/>
        <circle cx="130" cy="130" r="75"  fill="none" stroke="#3a2418" stroke-width="2"/>
        <circle cx="130" cy="130" r="45"  fill="none" stroke="#3a2418" stroke-width="2"/>
        <g id="pmp-r1" style="transform-origin:130px 130px"><polygon points="130,15 121,38 139,38" fill="#c08040" stroke="#5a3018" stroke-width="1"/></g>
        <g id="pmp-r2" style="transform-origin:130px 130px"><polygon points="130,45 121,68 139,68" fill="#c08040" stroke="#5a3018" stroke-width="1"/></g>
        <g id="pmp-r3" style="transform-origin:130px 130px"><polygon points="130,75 121,98 139,98" fill="#c08040" stroke="#5a3018" stroke-width="1"/></g>
        <line x1="130" y1="2" x2="130" y2="14" stroke="#ffd498" stroke-width="2"/>
        <polygon points="130,0 122,12 138,12" fill="#ffd498"/>
        <text id="pmp-status" x="130" y="240" text-anchor="middle" fill="#8a7565" font-family="Courier New, monospace" font-size="11" letter-spacing="2">RING 1 · STOP IT</text>
      </svg>`;
      // Each ring spins at its own speed; positive = clockwise.
      const rings = [
        { el: stage.querySelector("#pmp-r1"), angle: Math.random()*360, speed: 110, locked: false },
        { el: stage.querySelector("#pmp-r2"), angle: Math.random()*360, speed: -140, locked: false },
        { el: stage.querySelector("#pmp-r3"), angle: Math.random()*360, speed: 175, locked: false }
      ];
      const status = stage.querySelector("#pmp-status");
      function distFromTop(a) {
        const n = ((a % 360) + 360) % 360;
        return Math.min(n, 360 - n);
      }
      function nextIdx() { return rings.findIndex(r => !r.locked); }
      function updateStatus() {
        const i = nextIdx();
        if (i < 0) { status.textContent = "● ENERGIZING ●"; status.setAttribute("fill", "#80d090"); }
        else { status.textContent = `RING ${i+1} · CLICK TO STOP`; status.setAttribute("fill", "#d4a878"); }
      }
      updateStatus();
      function stopNext() {
        const i = nextIdx();
        if (i < 0) return;
        rings[i].locked = true;
        // Visual confirm: notch turns green if close, amber otherwise
        const d = distFromTop(rings[i].angle);
        const poly = rings[i].el.querySelector("polygon");
        poly.setAttribute("fill", d < 12 ? "#80d090" : d < 28 ? "#d4c068" : "#c06040");
        try { if (typeof audio !== "undefined" && audio.sfx) audio.sfx("click"); } catch (e) {}
        updateStatus();
        if (rings.every(r => r.locked)) {
          // Auto-energize
          const score = rings.reduce((acc, r) => acc + clamp(1 - distFromTop(r.angle)/45, 0, 1), 0) / 3;
          stage.querySelector("svg").style.filter = score > 0.6
            ? "drop-shadow(0 0 18px #80d090)"
            : "drop-shadow(0 0 14px #c06040)";
          setTimeout(() => { cancelAnimationFrame(raf); finish(score); }, 500);
        }
      }
      // Click anywhere on the stage stops the next ring
      stage.addEventListener("click", stopNext);
      let last = performance.now(), raf;
      function loop(t) {
        const dt = (t - last) / 1000; last = t;
        for (const r of rings) {
          if (!r.locked) r.angle = (r.angle + r.speed * dt) % 360;
          r.el.style.transform = `rotate(${r.angle}deg)`;
        }
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      // Manual energize fallback (in case player wants to stop early)
      const stopBtn = el("button", { type: "button" }, "Energize");
      stopBtn.onclick = () => {
        cancelAnimationFrame(raf);
        const score = rings.reduce((acc, r) => acc + clamp(1 - distFromTop(r.angle)/45, 0, 1), 0) / 3;
        finish(score);
      };
      actions.insertBefore(stopBtn, actions.firstChild);
    }
  });
}

// ============================================================
// 9. Hook each tool — wrap the original with a skill-gate.
// ============================================================
//
// Strategy: keep the original tool function intact; before invoking it,
// run the appropriate skill check. The result is stashed on state so
// the existing tool logic can read it. We DO NOT block evidence — even
// a poor score logs evidence, but with a quality tag.
//
// For tools where the existing UI already IS the interaction
// (Spirit Box continuous sweep, EVP staged review), we run the check
// once per session and remember it, not every click.

function withGate(name, gateFn) {
  const orig = window[name];
  if (typeof orig !== "function") return;
  window[name] = function patched(...args) {
    if (!state.calderLeft) return orig.apply(this, args);          // Calder phase = skip
    if (state._skillBypass)  return orig.apply(this, args);        // re-entry guard
    state._skillBypass = true;
    Promise.resolve(gateFn()).then(score => {
      state._skillBypass = false;
      state._lastSkillScore = (score == null) ? 0 : score;
      orig.apply(this, args);
    });
  };
}

// K-II: gate every reading.
withGate("toolKII", () => kiiSteadyAim());

// Spirit Box: gate the FIRST open per room.
withGate("toolSpirit", () => {
  if (!state._spiritTuned) state._spiritTuned = {};
  if (state._spiritTuned[state.currentRoom]) return Promise.resolve(state._spiritTuned[state.currentRoom]);
  return spiritTuneIn().then(s => { state._spiritTuned[state.currentRoom] = s; return s; });
});

// Thermal: gate every reading.
withGate("toolThermal", () => {
  let hasCold = false;
  try { hasCold = (typeof entitiesDetectedBy === "function") && entitiesDetectedBy("thermal").length > 0; } catch (e) {}
  return thermalReticle(hasCold);
});

// EVP: gate the REVIEW step (only when placed long enough). The original
// toolEVP figures out whether to show "still recording" or "playback".
// We only want to fire the scrub mini-game on the review phase.
(function gateEVP() {
  const orig = window.toolEVP;
  if (typeof orig !== "function") return;
  window.toolEVP = function patched() {
    if (!state.calderLeft || state._skillBypass) return orig.apply(this, arguments);
    const room = state.currentRoom;
    const placed = state.evpPlacements[room];
    const elapsed = placed === undefined ? -1 : (state.timeMinutes - placed);
    if (elapsed < 5) return orig.apply(this, arguments); // place or wait — no gate
    // Review phase: skill-gate
    state._skillBypass = true;
    const hasWhisper = (typeof entitiesDetectedBy === "function") && entitiesDetectedBy("evp").length > 0;
    evpScrub(hasWhisper).then(score => {
      state._skillBypass = false;
      state._lastSkillScore = score;
      // On a great isolate, the existing flow already lists whisper markers
      // and clicking them logs. On a poor score, suppress whisper markers
      // by temporarily blanking entitiesDetectedBy for this call only via
      // a flag the original respects — fall back: just inform the player.
      orig.call(this);
      if (hasWhisper && score < 0.4) {
        narrate("<em>[Your scrub missed the whisper window. The marker is muddied.]</em>");
      }
    });
  };
})();

// SLS: gate the CAPTURE step.
(function gateSLS() {
  const orig = window.slsCapture;
  if (typeof orig !== "function") return;
  window.slsCapture = function patched() {
    if (!state.calderLeft || state._skillBypass) return orig.apply(this, arguments);
    const hits = (window._slsHits || []);
    state._skillBypass = true;
    slsTrack(hits.length).then(score => {
      state._skillBypass = false;
      state._lastSkillScore = score;
      if (hits.length > 0 && score < 0.4) {
        narrate("<em>[The figure stepped out of frame before you locked. No capture.]</em>");
        return; // don't call orig — failed capture
      }
      orig.apply(this, arguments);
    });
  };
})();

// Camera snap: gate every snap.
(function gateCamera() {
  const orig = window.cameraSnap;
  if (typeof orig !== "function") return;
  window.cameraSnap = function patched() {
    if (!state.calderLeft || state._skillBypass) return orig.apply(this, arguments);
    state._skillBypass = true;
    cameraFocus().then(score => {
      state._skillBypass = false;
      state._lastSkillScore = score;
      // Stash for the original snap to read — on poor scores we degrade the result.
      state._cameraFocusScore = score;
      orig.apply(this, arguments);
      // If the most recently pushed photo has an anomaly but focus was poor,
      // demote it to smudge / null.
      const photo = state.photos[state.photos.length - 1];
      if (photo && photo.anomaly) {
        if (score < 0.3) {
          photo.anomaly = null;
          narrate("<em>[Out of focus. Anything in the frame was lost to blur.]</em>");
        } else if (score < 0.6 && photo.anomaly.type === "figure") {
          photo.anomaly = { type: "smudge", seed: Math.random() };
          narrate("<em>[Soft focus. Whatever was there has smeared to a smudge.]</em>");
        }
      }
    });
  };
})();

// EM Pump: gate activation (placing).
(function gatePump() {
  const orig = window.toolEMPump;
  if (typeof orig !== "function") return;
  window.toolEMPump = function patched() {
    if (!state.calderLeft || state._skillBypass) return orig.apply(this, arguments);
    // Picking up (already active in this room) skips the gate.
    if (state.empumpRoom === state.currentRoom) return orig.apply(this, arguments);
    state._skillBypass = true;
    pumpAlign().then(score => {
      state._skillBypass = false;
      state._lastSkillScore = score;
      if (score < 0.4) {
        narrate("<em>[Circuit unaligned. The pump refuses to energize.]</em>");
        return;
      }
      orig.apply(this, arguments);
    });
  };
})();

// ============================================================
// 10. Interactive 3 AM hallway figure
// ============================================================
//
// The existing scare narrates and logs. We intercept by re-binding
// SIGNATURE_SCARES["figure_at_distance"].fire — if found — to present
// a Photograph / Look-away choice.

(function makeInteractive3AM() {
  if (typeof SIGNATURE_SCARES === "undefined") return;
  const scare = SIGNATURE_SCARES.find(s => s.id === "figure_at_distance");
  if (!scare) return;
  const oldFire = scare.fire;
  scare.fire = function () {
    safeAudio("heartbeat");
    showIntertitle("3:00 AM", "<em>At the far end of the hall, a small figure stands. Perfectly still.</em>", { once: "scare_figure_3am" });
    // Present the choice via the existing scare overlay
    const overlay = document.getElementById("overlay-scare");
    const body = document.getElementById("scare-body");
    if (!overlay || !body) { oldFire(); return; }
    body.innerHTML = `
      <div style="text-align:center;padding:20px 14px;color:#d4a878">
        <div style="font-family:var(--serif-display,Cinzel);letter-spacing:4px;font-size:12px;color:#c05050;margin-bottom:10px">3:00 AM</div>
        <p style="font-style:italic;font-size:16px;line-height:1.5">A child-sized figure stands at the far end of the upstairs hall. It has not moved. <strong>What do you do?</strong></p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          <button id="sk-3am-photo"  style="font-family:var(--serif-display);letter-spacing:2px;font-size:11px;padding:10px 16px;background:#2a1810;color:#d4a878;border:1px solid #6a3820;cursor:pointer">📷 PHOTOGRAPH</button>
          <button id="sk-3am-away"   style="font-family:var(--serif-display);letter-spacing:2px;font-size:11px;padding:10px 16px;background:#2a1810;color:#d4a878;border:1px solid #6a3820;cursor:pointer">👁 LOOK AWAY</button>
        </div>
        <p style="font-size:12px;color:#8a7565;font-style:italic;margin-top:14px">A photograph requires a steady hand. Looking away costs evidence but keeps the house calm.</p>
      </div>`;
    overlay.classList.remove("hidden");

    document.getElementById("sk-3am-away").onclick = () => {
      overlay.classList.add("hidden");
      narrate("<em>You drop your gaze to the floor. When you look up, the corridor is empty.</em>");
      if (typeof relaxAggression === "function") relaxAggression(1);
    };
    document.getElementById("sk-3am-photo").onclick = () => {
      overlay.classList.add("hidden");
      cameraFocus().then(score => {
        if (score >= 0.6) {
          narrate("<em>Click. The shutter falls. The image — when you risk a glance — is unmistakable.</em>");
          if (typeof logEvidence === "function") logEvidence("Signature Scare", "Photographed the figure at 3 AM. Image sharp. (Skill: GREAT)");
          if (state.entitiesSeen) state.entitiesSeen.add("listening_twin");
          state._comboPayout = (state._comboPayout || 0) + 2000;
          if (typeof showMilestone === "function") showMilestone("PHOTOGRAPH · 3 AM", "<em>A child's face, clear as morning. +$2,000 to the verdict.</em>");
        } else {
          narrate("<em>You raise the camera. The flash fires. The figure is gone before the shutter closes.</em>");
          if (typeof logEvidence === "function") logEvidence("Signature Scare", "Attempted to photograph the 3 AM figure. Blur only. (Skill: POOR)");
          if (typeof bumpAggression === "function") bumpAggression(1, "the figure noticed your camera");
        }
      });
    };
  };
})();

// ============================================================
// 11. Candle / Rest economy + HUD
// ============================================================
//
// Wrap doRest to consume a wick. Trying to rest with zero wicks is
// rejected with a flavor line.

(function gateRest() {
  const orig = window.doRest;
  if (typeof orig !== "function") return;
  window.doRest = function patched() {
    if (!state.calderLeft) return orig.apply(this, arguments);
    if (PLAY.restsLeft <= 0) {
      narrate("<em>You have nothing left to give the hour. There are no more rests in you tonight.</em>");
      return;
    }
    const before = state._lastRestAt || 0;
    orig.apply(this, arguments);
    // Only decrement if the rest actually fired (cooldown could've blocked it)
    if (state._lastRestAt !== before) {
      PLAY.restsLeft -= 1;
      renderHudRow();
    }
  };
})();

// HUD row builder — candle + progress chip + skill chip
function buildHudRow() {
  if (document.getElementById("sk-hud-row")) return;
  const row = el("div", { id: "sk-hud-row" });
  // Candle widget
  const candle = el("div", { class: "sk-chip sk-candle", id: "sk-candle", title: "Rests remaining tonight" });
  candle.innerHTML = `<span style="color:#a09080">REST</span> <span id="sk-candle-wicks"></span>`;
  row.appendChild(candle);
  // Nightly-modifier chip (the night's weather/condition + its tool effect)
  const night = el("div", { class: "sk-chip", id: "sk-night", title: "Tonight's conditions" });
  night.innerHTML = `<span style="color:#a09080">NIGHT</span> <span id="sk-night-text">—</span>`;
  row.appendChild(night);
  // Progress chip
  const prog = el("div", { class: "sk-chip", id: "sk-progress", title: "Investigation progress" });
  prog.innerHTML = `<span id="sk-progress-text">—</span>`;
  row.appendChild(prog);
  document.body.appendChild(row);
}
function renderHudRow() {
  if (!state || !state.calderLeft) {
    const row = document.getElementById("sk-hud-row");
    if (row) row.style.display = "none";
    return;
  }
  buildHudRow();
  document.getElementById("sk-hud-row").style.display = "flex";
  // Candle wicks
  const wicks = [];
  for (let i = 0; i < PLAY.restsMax; i++) {
    wicks.push(`<span class="sk-candle-wick ${i >= PLAY.restsLeft ? "spent" : ""}"></span>`);
  }
  const w = document.getElementById("sk-candle-wicks");
  if (w) w.innerHTML = wicks.join("");
  // Nightly modifier chip
  const nText = document.getElementById("sk-night-text");
  const nChip = document.getElementById("sk-night");
  if (nText && nChip) {
    const m = PLAY && PLAY.modifier;
    if (m && m.name) {
      nText.innerHTML = `<strong>${m.name.toUpperCase()}</strong>`;
      nChip.title = `Tonight: ${m.name} — ${m.desc}`;
      nChip.style.display = "";
    } else {
      nChip.style.display = "none";
    }
  }
  // Progress
  const ev = (state.evidence || []).length;
  const caught = (state.calderCaught || []).length;
  const tools = Object.values(state.toolUses || {}).filter(v => v > 0).length;
  const ents = (state.entitiesSeen || new Set()).size;
  const text = document.getElementById("sk-progress-text");
  if (text) {
    const inWyndmere = (state._story === "wyndmere");
    const witness = inWyndmere ? "THRALE" : "CALDER";
    const claimTotal = inWyndmere ? 6 : 5;
    const entTotal = inWyndmere ? 13 : 12;
    text.innerHTML = `EVIDENCE <strong>${ev}</strong> · TOOLS <strong>${tools}</strong>/9 · ${witness} <strong>${caught}</strong>/${claimTotal} · SEEN <strong>${ents}</strong>/${entTotal}`;
  }
}

// Re-render on the natural game tick by wrapping renderHud.
(function gateHud() {
  const orig = window.renderHud;
  if (typeof orig !== "function") return;
  window.renderHud = function patched() {
    orig.apply(this, arguments);
    renderHudRow();
  };
})();

// ============================================================
// 12. Nightly modifier roll
// ============================================================

const MODIFIERS = [
  { id: "fog",      name: "Heavy Fog",         desc: "Thermal readings are jittery. Spirit Box clearer.",   apply: () => { state._modFog = true; } },
  { id: "newmoon",  name: "New Moon",          desc: "Spirit Box clearer. SLS dimmer.",                     apply: () => { state._modNewMoon = true; } },
  { id: "silence",  name: "Trust Demands Silence", desc: "Read-aloud disabled. Verdict pays +10%.",         apply: () => { if (typeof tts !== "undefined" && tts.disable) tts.disable(); state._modSilence = true; } },
  { id: "wind",     name: "High Wind",         desc: "False positives more common. Worth more debunks.",    apply: () => { state._modWind = true; } },
  { id: "calm",     name: "Calm Night",        desc: "No modifier. A standard investigation.",              apply: () => {} }
];
function rollNightlyModifier() {
  // 35% chance of "calm" so the player isn't fighting a modifier every run.
  if (Math.random() < 0.35) return MODIFIERS[MODIFIERS.length - 1];
  const choices = MODIFIERS.slice(0, -1);
  return choices[Math.floor(Math.random() * choices.length)];
}
function announceModifier(m) {
  PLAY.modifier = m;
  if (!m || m.id === "calm") return;
  m.apply();
  const banner = el("div", { class: "sk-modifier" });
  banner.innerHTML = `<strong>TONIGHT:</strong> ${m.name} — <em style="font-style:italic">${m.desc}</em>`;
  document.body.appendChild(banner);
  setTimeout(() => { banner.style.transition = "opacity 1.2s"; banner.style.opacity = "0"; }, 6000);
  setTimeout(() => banner.remove(), 7400);
}

// Hook startGameProper
(function gateStart() {
  const orig = window.startGameProper;
  if (typeof orig !== "function") return;
  window.startGameProper = function patched() {
    orig.apply(this, arguments);
    PLAY.restsLeft = PLAY.restsMax;
    PLAY.skillTotal = 0; PLAY.skillAttempts = 0;
    PLAY.streak = +(localStorage.getItem("ashgrove_streak") || 0);
    const m = rollNightlyModifier();
    setTimeout(() => announceModifier(m), 6000); // after the room-narrate beat
    setTimeout(buildHudRow, 500);
    setTimeout(renderHudRow, 800);
  };
})();

// ============================================================
// 13. Scored verdict breakdown (star rating, letter grade)
// ============================================================

function gradeForScore(pct) {
  if (pct >= 0.92) return { letter: "S",  stars: 5, blurb: "Definitive. The executor will tell others." };
  if (pct >= 0.80) return { letter: "A",  stars: 5, blurb: "Excellent investigation." };
  if (pct >= 0.65) return { letter: "B",  stars: 4, blurb: "Competent work." };
  if (pct >= 0.50) return { letter: "C",  stars: 3, blurb: "An adequate night." };
  if (pct >= 0.30) return { letter: "D",  stars: 2, blurb: "You went home. The executor has questions." };
  return                  { letter: "F",  stars: 1, blurb: "Better luck next investigation." };
}
function injectVerdictGrade(correct) {
  // Compute a quality 0..1 based on tools used, calder caught, skill avg, entities seen.
  const toolsUsed = Object.values(state.toolUses || {}).filter(v => v > 0).length;
  const caught = (state.calderCaught || []).length;
  const ents = (state.entitiesSeen || new Set()).size;
  const skillAvg = PLAY.skillAttempts > 0 ? PLAY.skillTotal / PLAY.skillAttempts : 0;

  const q =
    0.30 * (toolsUsed / 9) +
    0.20 * (caught / 5) +
    0.15 * Math.min(1, ents / 6) +
    0.20 * skillAvg +
    0.15 * (correct ? 1 : 0);

  const grade = gradeForScore(q);
  const stars = "★★★★★".slice(0, grade.stars) + "☆☆☆☆☆".slice(0, 5 - grade.stars);

  // Streak update
  if (correct) {
    PLAY.streak = (PLAY.streak || 0) + 1;
  } else {
    PLAY.streak = 0;
  }
  try { localStorage.setItem("ashgrove_streak", String(PLAY.streak)); } catch (e) {}

  const html = `
    <div class="sk-grade-box">
      <p class="sk-grade-letter">${grade.letter}</p>
      <div class="sk-grade-stars">${stars}</div>
      <p class="sk-grade-line"><em>${grade.blurb}</em></p>
      <p class="sk-grade-line">Tool coverage <strong style="color:#d4a878">${toolsUsed}/9</strong> · ${(state._story === "wyndmere") ? "Mrs. Thrale" : "Calder"} caught <strong style="color:#d4a878">${caught}/${(state._story === "wyndmere") ? 6 : 5}</strong> · Entities seen <strong style="color:#d4a878">${ents}/${(state._story === "wyndmere") ? 13 : 12}</strong></p>
      <p class="sk-grade-line">Skill checks <strong style="color:#d4a878">${PLAY.skillAttempts}</strong> attempted · avg <strong style="color:#d4a878">${Math.round(skillAvg*100)}%</strong></p>
      <p class="sk-grade-line">Current streak: <strong style="color:#ffd498">${PLAY.streak}</strong> correct verdict${PLAY.streak === 1 ? "" : "s"} in a row</p>
    </div>
  `;
  const res = document.getElementById("verdict-result");
  if (res) {
    const div = document.createElement("div");
    div.innerHTML = html;
    res.appendChild(div);
  }
}

(function gateVerdict() {
  const orig = window.submitVerdict;
  if (typeof orig !== "function") return;
  window.submitVerdict = function patched(choice) {
    const correct = choice === state.truth;
    orig.apply(this, arguments);
    setTimeout(() => injectVerdictGrade(correct), 60);
  };
})();

// ============================================================
// 14. Click feedback (subtle flash on buttons / hotspots)
// ============================================================

document.addEventListener("click", (e) => {
  let target = e.target;
  // Only react to buttons & hotspots
  while (target && target !== document.body) {
    if (target.tagName === "BUTTON" || (target.classList && (target.classList.contains("hotspot-btn") || target.classList.contains("inv-item")))) {
      if (reduceMotion()) break;
      target.classList.remove("sk-click-flash");
      void target.offsetWidth;
      target.classList.add("sk-click-flash");
      setTimeout(() => target.classList.remove("sk-click-flash"), 500);
      // Soft click on every UI press
      try { if (typeof audio !== "undefined") audio.sfx("click"); } catch (err) {}
      break;
    }
    target = target.parentElement;
  }
}, true);

// ============================================================
// 15. Onboarding nudge — first action after Calder leaves
// ============================================================
//
// When Calder leaves and tools unlock, pulse the camera tool with a
// gentle hint suggesting the player photograph the entry hall.

function onboardingPulse() {
  if (state._sawOnboardCam) return;
  const inv = document.getElementById("inventory-items");
  if (!inv) return;
  const cam = Array.from(inv.children).find(c => /camera/i.test(c.textContent));
  if (!cam) return;
  cam.classList.add("sk-pulse");
  state._sawOnboardCam = true;
  narrate("<em>[Tip: try the camera first. Photograph the entry hall — the develop step pays whether you find a ghost or not.]</em>");
  setTimeout(() => cam.classList.remove("sk-pulse"), 12000);
}
// Watch for inventory to populate / Calder departure.
let _onboardTries = 0;
const _onboardI = setInterval(() => {
  _onboardTries += 1;
  if (state && state.calderLeft) { onboardingPulse(); clearInterval(_onboardI); }
  if (_onboardTries > 60) clearInterval(_onboardI); // give up after ~30s
}, 500);

})();
