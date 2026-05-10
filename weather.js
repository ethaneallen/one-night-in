// weather.js — random weather roll per investigation.
// Applies a CSS class to #weather-layer, schedules lightning strikes,
// and exposes an audio hook for rain/thunder beds.
"use strict";

const WEATHER_TYPES = [
  { id: "clear", weight: 3, label: "a clear, cold night" },
  { id: "fog",   weight: 2, label: "a fog that settled, tonight, for reasons of its own" }
];

function rollWeather() {
  const total = WEATHER_TYPES.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of WEATHER_TYPES) {
    if ((r -= w.weight) <= 0) return w;
  }
  return WEATHER_TYPES[0];
}

function applyWeather(weather) {
  const el = document.getElementById("weather-layer");
  if (!el) return;
  el.className = "weather-" + weather.id;
  if (typeof state !== "undefined") state._weather = weather.id;
  // Rain / thunderstorm are disabled, but guard any stale audio beds.
  if (typeof audio !== "undefined" && audio.stopRainBed) audio.stopRainBed();
  stopLightningLoop();
}

let _lightningId = null;
function startLightningLoop() {
  function tick() {
    if (!state.calderLeft && typeof state !== "undefined" && state._weather !== "thunderstorm") return;
    fireLightning();
    _lightningId = setTimeout(tick, 18000 + Math.random() * 32000); // 18-50s
  }
  _lightningId = setTimeout(tick, 8000 + Math.random() * 12000);
}
function stopLightningLoop() { if (_lightningId) clearTimeout(_lightningId); _lightningId = null; }

function fireLightning() {
  if (document.body.classList.contains("reduce-motion")) {
    // Reduce-motion players still get the thunderclap audio, just no flash
    if (typeof audio !== "undefined" && audio.sfx) audio.sfx("distant_bang");
    return;
  }
  const flash = document.createElement("div");
  flash.className = "lightning-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
  // Delayed thunderclap — distance effect. 400-2000ms later.
  const delay = 400 + Math.random() * 1600;
  setTimeout(() => { if (audio && audio.sfx) audio.sfx("jolt"); }, delay);
}

// Narration on arrival — tells the player what weather they got.
function narrateWeather(weather) {
  if (!weather || weather.id === "clear") return;
  if (typeof narrate !== "function") return;
  narrate(`<em>[The night arrives with ${weather.label}.]</em>`);
}
