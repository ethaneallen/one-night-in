// composure.js — investigator's composure / sanity (player-side stat)
// Distinct from `state.aggression`, which represents the *house's* menace.
// Composure drains when in haunted rooms, after scares, when reading dark
// documents, etc. Low composure produces noisy tool readings, flickering
// document text, and (at 0) a one-time forced retreat to a safe room with
// a permanently jittery hand for the rest of the run.
"use strict";

const COMPOSURE_MAX = 100;
// thresholds drive UI + gameplay effects
const COMPOSURE_RATTLED   = 60; // hands begin to shake — noisier readouts
const COMPOSURE_UNRAVEL   = 30; // documents glitch, tools may fail
const COMPOSURE_BREAK     =  0; // forced retreat + permanent jitter

// --- Init / reset ---
function initComposure() {
  if (typeof state.composure !== "number") state.composure = COMPOSURE_MAX;
  if (typeof state._composureBroken !== "boolean") state._composureBroken = false;
  if (typeof state._composureLastTick !== "number") state._composureLastTick = state.timeMinutes || 0;
  renderComposure();
}

// --- Public API ---
function bumpComposure(n, reason) {
  // n positive = restore; negative = drain
  if (typeof state.composure !== "number") initComposure();
  const before = state.composure;
  state.composure = Math.max(0, Math.min(COMPOSURE_MAX, state.composure + n));
  if (n < 0 && reason && Math.abs(n) >= 8) {
    if (typeof narrate === "function") narrate(`<em>[Composure shaken: ${reason}]</em>`);
  } else if (n >= 15 && reason) {
    if (typeof narrate === "function") narrate(`<em>[Composure recovers: ${reason}]</em>`);
  }
  // Threshold crossings
  if (before > COMPOSURE_UNRAVEL && state.composure <= COMPOSURE_UNRAVEL) {
    onComposureUnravel();
  }
  if (before > COMPOSURE_BREAK && state.composure <= COMPOSURE_BREAK) {
    onComposureBreak();
  }
  renderComposure();
  // Body class for low-composure CSS (document glitch, vignette)
  document.body.classList.toggle("composure-rattled",  state.composure <= COMPOSURE_RATTLED);
  document.body.classList.toggle("composure-unravel",  state.composure <= COMPOSURE_UNRAVEL);
  document.body.classList.toggle("composure-broken",   state._composureBroken === true);
}
function drainComposure(n, reason) { bumpComposure(-Math.abs(n), reason); }

// --- HUD rendering ---
function renderComposure() {
  const el = document.getElementById("hud-composure");
  if (!el) return;
  const c = typeof state.composure === "number" ? state.composure : COMPOSURE_MAX;
  const cR = Math.round(c);
  el.title = `Composure: ${cR} / ${COMPOSURE_MAX} — drains in haunted rooms, restores when you rest.`;
  // Classify
  el.classList.remove("comp-good", "comp-rattled", "comp-unravel", "comp-broken");
  let tier;
  if (state._composureBroken)            { el.classList.add("comp-broken");  tier = "BROKEN"; }
  else if (c <= COMPOSURE_UNRAVEL)       { el.classList.add("comp-unravel"); tier = "UNRAVELLING"; }
  else if (c <= COMPOSURE_RATTLED)       { el.classList.add("comp-rattled"); tier = "RATTLED"; }
  else                                    { el.classList.add("comp-good");    tier = "STEADY"; }
  // Update label text — reflect tier + numeric so the player always knows
  const label = document.getElementById("hud-composure-label");
  if (label) label.textContent = `— ${tier} · ${cR} —`;
  // Inner fill (10 notches)
  const meter = document.getElementById("hud-composure-meter");
  if (meter) {
    const lit = Math.round((c / COMPOSURE_MAX) * 10);
    let html = "";
    for (let i = 1; i <= 10; i++) {
      html += `<span class="cnotch${i <= lit ? " on" : ""}"></span>`;
    }
    meter.innerHTML = html;
  }
}

// --- Threshold reactions ---
function onComposureUnravel() {
  if (typeof showIntertitle === "function") {
    showIntertitle("COMPOSURE UNRAVELLING",
      "<em>Your hands, you notice, are not entirely steady. The page wavers when you try to read it.</em>",
      { once: "composure_unravel" });
  }
  if (typeof audio !== "undefined" && audio.sfx) audio.sfx("heartbeat");
}

function onComposureBreak() {
  if (state._composureBroken) return;
  state._composureBroken = true;
  // Forced retreat to a safe room
  const storyId = (typeof state !== "undefined" && state._story) || "ashgrove";
  const safeRoom = storyId === "wyndmere" ? "wm_foyer" : "entry_hall";
  if (typeof showIntertitle === "function") {
    showIntertitle("YOU BREAK",
      "<em>Your nerve goes. You find yourself \u2014 unable to recall the corridor between \u2014 standing in a place you remember being safer.</em>",
      { once: "composure_break" });
  }
  // Mid-run penalty: jitter persists, a doc becomes unreadable until end
  state._composureBrokenAt = state.timeMinutes;
  // Lock a random unread doc (only matters if at least one is unread)
  try {
    if (typeof DOCUMENTS !== "undefined") {
      const all = Object.keys(DOCUMENTS);
      const unread = all.filter(d => !(state.docsRead && state.docsRead.has && state.docsRead.has(d)));
      if (unread.length) {
        state._composureLockedDoc = unread[Math.floor(Math.random() * unread.length)];
      }
    }
  } catch (e) {}
  // Travel home (use travelTo if available, else just set currentRoom)
  setTimeout(() => {
    if (typeof travelTo === "function") {
      try { travelTo(safeRoom, true); } catch (e) {}
    } else {
      state.currentRoom = safeRoom;
      if (typeof renderRoom === "function") renderRoom();
    }
    if (typeof audio !== "undefined" && audio.sfx) audio.sfx("breath");
  }, 800);
}

// --- Per-tick drain ---
// Called from advanceTime() in game.js. Drains composure based on the
// current room's danger tier (proxy: aggression level + room emf).
function composureTick(prevMinutes) {
  if (typeof state.composure !== "number") initComposure();
  if (!state.calderLeft) return;
  if (state.endDialog) return;
  const now = state.timeMinutes;
  const delta = Math.max(0, now - (state._composureLastTick || now));
  state._composureLastTick = now;
  if (delta <= 0) return;

  // Drain rate per in-game minute
  let rate = 0;
  const agg = state.aggression || 0;
  const room = (typeof ROOMS !== "undefined") ? ROOMS[state.currentRoom] : null;
  const emf = room ? (room.emf || 0) : 0;
  // Base drain from tier
  if (agg >= 9)      rate = 0.50;          // IN THE ROOM
  else if (agg >= 7) rate = 0.30;          // CLOSE
  else if (agg >= 4) rate = 0.15;          // WATCHING
  else               rate = 0.04;          // QUIET
  // EMF nudge — high-EMF rooms drain faster
  rate += emf * 0.04;
  // Late-night nudge
  if (now >= 24 * 60 + 120) rate *= 1.25;  // after 2 AM
  if (now >= 24 * 60 + 180) rate *= 1.25;  // after 3 AM (compounded)
  // Apply drain (no narration spam on tick — silent)
  const drain = rate * delta;
  if (drain >= 0.1) {
    state.composure = Math.max(0, state.composure - drain);
    // Threshold check
    const c = state.composure;
    if (c <= COMPOSURE_BREAK && !state._composureBroken) onComposureBreak();
    else if (c <= COMPOSURE_UNRAVEL) document.body.classList.add("composure-unravel");
    document.body.classList.toggle("composure-rattled", c <= COMPOSURE_RATTLED);
    renderComposure();
  }
}

// --- Convenience: drain hooks for common gameplay events ---
function composureOnScare(severity)     { drainComposure(severity || 12, "the moment you'd been dreading"); }
function composureOnThreatPrompt()      { drainComposure(6,  "a decision you didn't want to make"); }
function composureOnPhotoFigure()       { drainComposure(4,  "what the camera caught"); }
function composureOnRest(mins)          { bumpComposure(Math.min(35, (mins || 30) * 0.9), "you rested"); }
function composureOnDarkDoc()           { drainComposure(3,  "something you read"); }
function composureOnNarrativeBeat(n)    { drainComposure(n || 2, null); }

// --- Tool readout jitter (called by tool functions if they want to) ---
// Returns true if the next reading should be "noisy / unreliable" because
// the investigator's hands are unsteady.
function composureToolFails() {
  const c = typeof state.composure === "number" ? state.composure : COMPOSURE_MAX;
  if (c <= COMPOSURE_BREAK) return Math.random() < 0.30; // post-break: occasional failure
  if (c <= COMPOSURE_UNRAVEL) return Math.random() < 0.18;
  if (c <= COMPOSURE_RATTLED) return Math.random() < 0.06;
  return false;
}

// Expose for save/load and other modules
if (typeof window !== "undefined") {
  window.bumpComposure = bumpComposure;
  window.drainComposure = drainComposure;
  window.composureTick = composureTick;
  window.renderComposure = renderComposure;
  window.initComposure = initComposure;
  window.composureOnScare = composureOnScare;
  window.composureOnThreatPrompt = composureOnThreatPrompt;
  window.composureOnPhotoFigure = composureOnPhotoFigure;
  window.composureOnRest = composureOnRest;
  window.composureOnDarkDoc = composureOnDarkDoc;
  window.composureOnNarrativeBeat = composureOnNarrativeBeat;
  window.composureToolFails = composureToolFails;
}
