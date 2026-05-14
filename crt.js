// crt.js — Optional period filter. Adds a fixed overlay with animated film
// grain, soft vignette, and faint horizontal scanlines. Toggled via
// settings.periodFilter (added in settings.js).
"use strict";

(function () {

function injectStyles() {
  if (document.getElementById("crt-css")) return;
  const s = document.createElement("style");
  s.id = "crt-css";
  s.textContent = `
.crt-overlay {
  position: fixed; inset: 0; z-index: 8500;
  pointer-events: none;
  /* No mix-blend so scanlines stay visible on dark scenes */
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,0) 0px,
      rgba(0,0,0,0) 2px,
      rgba(0,0,0,0.28) 3px,
      rgba(0,0,0,0) 4px
    ),
    radial-gradient(
      ellipse at center,
      rgba(0,0,0,0) 45%,
      rgba(0,0,0,0.55) 100%
    );
  opacity: 0.95;
  animation: crtFlicker 5s steps(2) infinite;
}
@keyframes crtFlicker {
  0%, 92%, 100% { opacity: 0.95; }
  93%           { opacity: 0.78; }
  94%           { opacity: 1; }
  95%           { opacity: 0.85; }
  96%           { opacity: 0.97; }
}
.crt-grain {
  position: fixed; inset: -25%; z-index: 8501;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.8 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 220px 220px;
  opacity: 0.34;
  mix-blend-mode: screen;
  animation: crtGrainShift 0.18s steps(2) infinite;
}
@keyframes crtGrainShift {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-6px, 3px); }
  50%  { transform: translate(4px, -5px); }
  75%  { transform: translate(-3px, -2px); }
  100% { transform: translate(0, 0); }
}
.crt-vignette-corners {
  position: fixed; inset: 0; z-index: 8502;
  pointer-events: none;
  background:
    radial-gradient(
      circle at top left,
      rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%
    ),
    radial-gradient(
      circle at top right,
      rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%
    );
}
body.reduce-motion .crt-overlay,
body.reduce-motion .crt-grain { animation: none; }

/* Keep HUD chrome visible above the CRT overlays.  The overlays use
   pointer-events: none so clicks already pass through; this is purely
   visual so the player can still see the top-right icons and the chip
   row when the period filter is on. */
body.crt-on #hud-top,
body.crt-on header,
body.crt-on #hud-right,
body.crt-on #sk-hud-row { position: relative; z-index: 8600; }
body.crt-on #overlay-settings,
body.crt-on #overlay-title,
body.crt-on .ff-breath,
body.crt-on .hint-overlay,
body.crt-on .riddle-overlay { z-index: 9100; }
  `;
  document.head.appendChild(s);
}

let nodes = null;
function enable() {
  injectStyles();
  document.body.classList.add("crt-on");
  if (nodes) return;
  const scan = document.createElement("div");
  scan.className = "crt-overlay";
  const grain = document.createElement("div");
  grain.className = "crt-grain";
  const corners = document.createElement("div");
  corners.className = "crt-vignette-corners";
  document.body.appendChild(scan);
  document.body.appendChild(grain);
  document.body.appendChild(corners);
  nodes = { scan, grain, corners };
}
function disable() {
  document.body.classList.remove("crt-on");
  if (!nodes) return;
  nodes.scan.remove();
  nodes.grain.remove();
  nodes.corners.remove();
  nodes = null;
}

function apply() {
  if (typeof settings !== "undefined" && settings.periodFilter) enable();
  else disable();
}

// Public API
window.crtFilter = { enable, disable, apply };

// Apply once on load + whenever settings change.
document.addEventListener("DOMContentLoaded", () => { setTimeout(apply, 50); });
// Also apply immediately in case DOMContentLoaded already fired
if (document.readyState !== "loading") setTimeout(apply, 50);

})();
