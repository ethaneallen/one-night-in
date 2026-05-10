// settings.js — settings menu, save/load, debug mode
"use strict";

const SETTINGS_KEY = "ashgrove_settings";
const SAVE_KEY = "ashgrove_save";

const settings = {
  volMaster: 70,
  volAmbient: 60,
  textSize: "medium",
  contrast: "normal",
  reduceMotion: false,
  debugUnlocked: false,
  ttsEnabled: false,
  ttsGender: "male",
  ttsRate: 90,
  ttsPitch: 90,
  ttsVolume: 85,
  tempUnit: "F",   // "F" or "C"
  skipWarning: false, // once accepted, returning players skip straight to prologue
  skipHowto: false,   // once the how-to is dismissed with the checkbox, skip it next time
  conciseMode: false, // TL;DR mode — swap the prose for short summaries
  aiEnabled: false,   // optional AI-backed Ovilus + Speak-to-House
  aiProvider: "gemini", // "gemini" | "groq" | "openai" | "anthropic"
  aiApiKey: ""        // user's own API key (never leaves their machine)
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) Object.assign(settings, JSON.parse(raw));
  } catch (e) {}
  applySettings();
  reflectSettingsToUI();
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
}
function applySettings() {
  document.body.classList.remove("text-small", "text-medium", "text-large");
  document.body.classList.add("text-" + settings.textSize);
  document.body.classList.toggle("high-contrast", settings.contrast === "high");
  document.body.classList.toggle("reduce-motion", settings.reduceMotion);
  document.body.classList.toggle("concise", !!settings.conciseMode);
  if (typeof audio !== "undefined") audio.updateVolumes();
}
function reflectSettingsToUI() {
  const $ = id => document.getElementById(id);
  $("set-vol-master").value = settings.volMaster;
  $("set-vol-master-v").textContent = settings.volMaster;
  $("set-vol-ambient").value = settings.volAmbient;
  $("set-vol-ambient-v").textContent = settings.volAmbient;
  $("set-text-size").value = settings.textSize;
  $("set-contrast").value = settings.contrast;
  $("set-reduce-motion").checked = settings.reduceMotion;
  const conciseEl = $("set-concise");
  if (conciseEl) conciseEl.checked = !!settings.conciseMode;
  const aiEnEl = $("set-ai-enabled");
  if (aiEnEl) aiEnEl.checked = !!settings.aiEnabled;
  const aiProvEl = $("set-ai-provider");
  if (aiProvEl) aiProvEl.value = settings.aiProvider || "gemini";
  const aiKeyEl = $("set-ai-key");
  if (aiKeyEl) aiKeyEl.value = settings.aiApiKey || "";
  const hintEl = $("ai-provider-hint");
  if (hintEl && typeof AI_PROVIDERS !== "undefined") {
    const p = AI_PROVIDERS[settings.aiProvider || "gemini"];
    hintEl.textContent = p ? p.hint : "";
  }
  $("settings-debug-panel").classList.toggle("hidden", !settings.debugUnlocked);
  $("set-temp-unit").value = settings.tempUnit || "F";
  $("set-tts-enabled").checked = settings.ttsEnabled;
  $("set-tts-gender").value = settings.ttsGender;
  $("set-tts-rate").value = settings.ttsRate;
  $("set-tts-rate-v").textContent = settings.ttsRate;
  $("set-tts-pitch").value = settings.ttsPitch;
  $("set-tts-pitch-v").textContent = settings.ttsPitch;
  $("set-tts-volume").value = settings.ttsVolume;
  $("set-tts-volume-v").textContent = settings.ttsVolume;
  const label = document.getElementById("tts-voice-label");
  if (label && typeof tts !== "undefined") label.textContent = tts.currentVoiceLabel();
  const hudBtn = document.getElementById("btn-tts-toggle");
  if (hudBtn) hudBtn.style.opacity = settings.ttsEnabled ? "1" : "0.4";
}

// --- settings wiring ---
function initSettings() {
  const $ = id => document.getElementById(id);

  $("btn-settings").addEventListener("click", () => {
    reflectSettingsToUI();
    openOverlay("overlay-settings");
  });

  $("set-vol-master").addEventListener("input", e => {
    settings.volMaster = +e.target.value;
    $("set-vol-master-v").textContent = settings.volMaster;
    applySettings(); saveSettings();
  });
  $("set-vol-ambient").addEventListener("input", e => {
    settings.volAmbient = +e.target.value;
    $("set-vol-ambient-v").textContent = settings.volAmbient;
    applySettings(); saveSettings();
  });
  $("set-text-size").addEventListener("change", e => {
    settings.textSize = e.target.value; applySettings(); saveSettings();
  });
  $("set-contrast").addEventListener("change", e => {
    settings.contrast = e.target.value; applySettings(); saveSettings();
  });
  $("set-reduce-motion").addEventListener("change", e => {
    settings.reduceMotion = e.target.checked; applySettings(); saveSettings();
  });
  const conciseEl = $("set-concise");
  if (conciseEl) {
    conciseEl.addEventListener("change", e => {
      settings.conciseMode = e.target.checked;
      applySettings();
      saveSettings();
      // Re-render current scene so the new mode takes effect immediately
      if (typeof renderRoom === "function" && state && state.currentRoom) renderRoom();
    });
  }
  // AI settings
  const aiEnEl = $("set-ai-enabled");
  if (aiEnEl) aiEnEl.addEventListener("change", e => {
    settings.aiEnabled = e.target.checked;
    saveSettings();
  });
  const aiProvEl = $("set-ai-provider");
  if (aiProvEl) aiProvEl.addEventListener("change", e => {
    settings.aiProvider = e.target.value;
    saveSettings();
    reflectSettingsToUI();
  });
  const aiKeyEl = $("set-ai-key");
  if (aiKeyEl) aiKeyEl.addEventListener("change", e => {
    settings.aiApiKey = e.target.value.trim();
    saveSettings();
  });
  const aiTestBtn = $("btn-ai-test");
  if (aiTestBtn) aiTestBtn.addEventListener("click", async () => {
    const result = $("ai-test-result");
    if (result) { result.textContent = "testing..."; result.style.color = "#8a7565"; }
    if (typeof aiTestConnection !== "function") {
      if (result) { result.textContent = "ai module not loaded"; result.style.color = "#c06040"; }
      return;
    }
    // Pick up the latest key from the input in case it wasn't blurred
    const keyEl = $("set-ai-key");
    if (keyEl) { settings.aiApiKey = keyEl.value.trim(); saveSettings(); }
    // And flip enabled on temporarily so the test fires even before the checkbox
    const wasEnabled = settings.aiEnabled;
    settings.aiEnabled = true;
    const r = await aiTestConnection();
    settings.aiEnabled = wasEnabled;
    if (result) {
      if (r.ok) { result.textContent = "✓ connected: " + r.response.slice(0, 40); result.style.color = "#80c080"; }
      else { result.textContent = "✗ " + r.error; result.style.color = "#c06040"; }
    }
  });
  $("set-temp-unit").addEventListener("change", e => {
    settings.tempUnit = e.target.value; saveSettings();
  });
  // Skip-warning checkbox on the title overlay
  const skipChk = $("chk-skip-warning");
  if (skipChk) {
    skipChk.checked = !!settings.skipWarning;
    skipChk.addEventListener("change", e => {
      settings.skipWarning = e.target.checked; saveSettings();
    });
  }

  // TTS settings
  $("set-tts-enabled").addEventListener("change", e => {
    settings.ttsEnabled = e.target.checked;
    saveSettings();
    reflectSettingsToUI();
    if (!settings.ttsEnabled && typeof tts !== "undefined") tts.stop();
  });
  $("set-tts-gender").addEventListener("change", e => {
    settings.ttsGender = e.target.value;
    saveSettings();
    if (typeof tts !== "undefined") { tts.pickVoice(); reflectSettingsToUI(); }
  });
  $("set-tts-rate").addEventListener("input", e => {
    settings.ttsRate = +e.target.value; $("set-tts-rate-v").textContent = settings.ttsRate; saveSettings();
  });
  $("set-tts-pitch").addEventListener("input", e => {
    settings.ttsPitch = +e.target.value; $("set-tts-pitch-v").textContent = settings.ttsPitch; saveSettings();
  });
  $("set-tts-volume").addEventListener("input", e => {
    settings.ttsVolume = +e.target.value; $("set-tts-volume-v").textContent = settings.ttsVolume; saveSettings();
  });
  $("btn-tts-test").addEventListener("click", () => {
    const wasEnabled = settings.ttsEnabled;
    settings.ttsEnabled = true;
    if (typeof tts !== "undefined") tts.speak("The house is attending. I suggest you listen.", { preempt: true });
    settings.ttsEnabled = wasEnabled;
  });
  document.getElementById("btn-tts-toggle").addEventListener("click", () => {
    settings.ttsEnabled = !settings.ttsEnabled;
    saveSettings();
    reflectSettingsToUI();
    if (!settings.ttsEnabled && typeof tts !== "undefined") tts.stop();
  });

  // 5-click debug unlock on title
  let clickCount = 0;
  let clickTimer = null;
  $("settings-title").addEventListener("click", () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => clickCount = 0, 1500);
    if (clickCount >= 5) {
      clickCount = 0;
      if (settings.debugUnlocked) {
        settings.debugUnlocked = false; saveSettings(); reflectSettingsToUI();
      } else {
        $("settings-debug-prompt").classList.remove("hidden");
        $("debug-password").value = "";
        $("debug-password").focus();
      }
    }
  });
  $("debug-submit").addEventListener("click", submitDebugPassword);
  $("debug-cancel").addEventListener("click", () => {
    $("settings-debug-prompt").classList.add("hidden");
  });
  $("debug-password").addEventListener("keydown", e => {
    if (e.key === "Enter") submitDebugPassword();
    if (e.key === "Escape") $("debug-cancel").click();
  });

  // debug actions
  document.querySelectorAll("[data-force-truth]").forEach(b => {
    b.addEventListener("click", () => {
      state.truth = b.dataset.forceTruth;
      reflectDebug();
      narrate(`[DEBUG] Truth forced to ${state.truth.toUpperCase()}.`);
    });
  });
  document.querySelectorAll("[data-skip]").forEach(b => {
    b.addEventListener("click", () => advanceTime(+b.dataset.skip));
  });
  document.querySelector("[data-skip-to-sunrise]").addEventListener("click", () => {
    state.timeMinutes = SUNRISE;
    advanceTime(0);
  });
  $("debug-reveal-all").addEventListener("click", () => {
    for (const id in ENTITIES) if (ENTITIES[id].realInStates.includes(state.truth)) state.entitiesSeen.add(id);
    narrate("[DEBUG] All real entities revealed in journal.");
  });
  $("debug-catch-calder").addEventListener("click", () => {
    Object.values(CALDER_CONTRADICTIONS).forEach(text => {
      if (!state.calderCaught.includes(text)) state.calderCaught.push(text);
    });
    narrate("[DEBUG] All Calder contradictions auto-caught.");
  });
  $("debug-skip-walkthrough").addEventListener("click", () => {
    if (state.calderLeft) return;
    const ok = confirm(
      "Skip Calder's walkthrough?\n\n" +
      "WARNING: Calder's walkthrough is where he makes the 5 claims you can catch him on later. " +
      "If you skip it, he makes NO claims, so you cannot catch any inconsistencies, " +
      "and you will forfeit up to $2,500 in Calder bonus at the verdict.\n\n" +
      "Skip anyway? (For testing only — not recommended for actual playthroughs.)"
    );
    if (ok) { closeOverlay("overlay-settings"); calderLeaves(); }
  });
  $("debug-agg-plus").addEventListener("click", () => bumpAggression(1, "debug"));
  $("debug-agg-max").addEventListener("click", () => { state.aggression = 9; renderDanger(); narrate("[DEBUG] Aggression set to 9."); });
  $("debug-agg-reset").addEventListener("click", () => { state.aggression = 0; renderDanger(); narrate("[DEBUG] Aggression reset."); });
  $("debug-flavor-scare").addEventListener("click", () => { closeOverlay("overlay-settings"); flavorScare(); });
  $("debug-threat").addEventListener("click", () => {
    closeOverlay("overlay-settings");
    // Threat prompts only kill on HAUNTED. Testers expect death when they
    // pick an unsafe choice, so auto-flip truth to HAUNTED for the test.
    if (state.truth !== "haunted") {
      const oldTruth = state.truth;
      state.truth = "haunted";
      narrate(`[DEBUG] Truth was ${(oldTruth || "unset").toUpperCase()}. Temporarily forced to HAUNTED so the threat prompt can kill you. Pick the unsafe option to see the death path.`);
    }
    const p = pickThreatForRoom(state.currentRoom);
    if (p) fireThreatPrompt(p);
    else narrate("[DEBUG] No threat prompt defined for this room. Try: nursery, library, master, upstairs_hall, wine_cellar.");
  });
  $("debug-kill").addEventListener("click", () => { closeOverlay("overlay-settings"); killPlayer("Debug kill."); });

  // --- Expanded debug panel ---
  // Room jump
  const roomPicker = $("debug-room-jump");
  if (roomPicker && typeof ROOMS !== "undefined") {
    roomPicker.innerHTML = Object.keys(ROOMS).map(id => `<option value="${id}">${ROOMS[id].name} (${id})</option>`).join("");
  }
  $("debug-room-go").addEventListener("click", () => {
    if (!roomPicker) return;
    closeOverlay("overlay-settings");
    if (typeof travelTo === "function") travelTo(roomPicker.value, true);
  });

  // Scare picker
  const scarePicker = $("debug-scare-pick");
  if (scarePicker && typeof SIGNATURE_SCARES !== "undefined") {
    scarePicker.innerHTML = SIGNATURE_SCARES.map(s => `<option value="${s.id}">${s.id}</option>`).join("");
  }
  $("debug-scare-fire").addEventListener("click", () => {
    if (!scarePicker) return;
    const target = SIGNATURE_SCARES.find(s => s.id === scarePicker.value);
    if (target) {
      closeOverlay("overlay-settings");
      // Mark it shown so the scheduler doesn't immediately re-fire, then fire
      if (typeof _shownIntertitles !== "undefined") _shownIntertitles.add("scare:" + target.id);
      try { target.fire(); } catch (e) { console.error(e); narrate("[DEBUG] Scare failed: " + e.message); }
    }
  });

  // Plot beats
  $("debug-midnight").addEventListener("click", () => {
    closeOverlay("overlay-settings");
    const s = SIGNATURE_SCARES && SIGNATURE_SCARES.find(x => x.id === "midnight_letter");
    if (s) { if (typeof _shownIntertitles !== "undefined") _shownIntertitles.delete("scare:midnight_letter"); s.fire(); }
  });
  $("debug-eliza").addEventListener("click", () => {
    closeOverlay("overlay-settings");
    // Satisfy the preconditions manually
    state.truth = "haunted";
    state.timeMinutes = Math.max(state.timeMinutes, 24 * 60 + 240);
    state.docsRead.add("midnight_letter");
    while (state.evidence.length < 6) state.evidence.push({ type: "Debug", detail: "seeded", when: formatTime(), room: state.currentRoom });
    const s = SIGNATURE_SCARES && SIGNATURE_SCARES.find(x => x.id === "eliza_confrontation");
    if (s) { if (typeof _shownIntertitles !== "undefined") _shownIntertitles.delete("scare:eliza_confrontation"); s.fire(); }
  });
  $("debug-sunrise").addEventListener("click", () => {
    closeOverlay("overlay-settings");
    state.timeMinutes = SUNRISE;
    advanceTime(0);
  });

  // Time slider: 0 means 7:00 PM, 720 means 7 PM + 12 hours = 7 AM
  const timeSlider = $("debug-time-slider");
  const timeReadout = $("debug-time-readout");
  function fmtDebugTime(mins) {
    const abs = 19 * 60 + mins;
    const h24 = Math.floor(abs / 60) % 24;
    const m = abs % 60;
    const ampm = h24 >= 12 && h24 < 24 ? "PM" : "AM";
    let h12 = h24 % 12; if (h12 === 0) h12 = 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  }
  if (timeSlider) {
    timeSlider.addEventListener("input", e => {
      if (timeReadout) timeReadout.textContent = fmtDebugTime(+e.target.value);
    });
    timeSlider.addEventListener("change", e => {
      state.timeMinutes = 19 * 60 + (+e.target.value);
      advanceTime(0);
      narrate(`[DEBUG] Time set to ${fmtDebugTime(+e.target.value)}.`);
    });
  }

  // Evidence seeding
  $("debug-seed-5").addEventListener("click", () => seedEvidence(5));
  $("debug-seed-15").addEventListener("click", () => seedEvidence(15));
  $("debug-clear-evidence").addEventListener("click", () => {
    state.evidence = [];
    state.calderCaught = [];
    state.entitiesSeen = new Set();
    narrate("[DEBUG] Evidence journal cleared.");
  });
  function seedEvidence(n) {
    const types = ["K-II Spike", "Spirit Box", "Ovilus", "SLS Capture", "EVP Capture", "Thermal — Cold", "Knock Response", "REM Pod"];
    for (let i = 0; i < n; i++) {
      const t = types[i % types.length];
      state.evidence.push({
        type: t,
        detail: `Debug-seeded evidence entry #${i + 1}`,
        when: formatTime(),
        room: state.currentRoom
      });
    }
    narrate(`[DEBUG] Seeded ${n} evidence entries.`);
  }

  // Docs
  $("debug-read-midnight").addEventListener("click", () => {
    closeOverlay("overlay-settings");
    state.docsRead.add("midnight_letter");
    if (typeof openDocument === "function") openDocument("midnight_letter");
  });
  $("debug-read-all-docs").addEventListener("click", () => {
    if (typeof DOCUMENTS !== "undefined") {
      Object.keys(DOCUMENTS).forEach(k => state.docsRead.add(k));
      narrate(`[DEBUG] Marked ${state.docsRead.size} documents as read.`);
    }
  });

  // State inspection
  $("debug-dump-state").addEventListener("click", () => {
    try {
      const payload = JSON.stringify({
        truth: state.truth,
        currentRoom: state.currentRoom,
        timeMinutes: state.timeMinutes,
        aggression: state.aggression,
        evidence: state.evidence.length,
        calderCaught: state.calderCaught,
        docsRead: Array.from(state.docsRead || []),
        entitiesSeen: Array.from(state.entitiesSeen || []),
        toolUses: state.toolUses,
        rempods: state.rempods,
        empumpRoom: state.empumpRoom,
        _elizaChoice: state._elizaChoice,
        milestones: Object.keys(state._m || {})
      }, null, 2);
      navigator.clipboard.writeText(payload).then(
        () => narrate("[DEBUG] State JSON copied to clipboard."),
        () => { console.log(payload); narrate("[DEBUG] State printed to console (clipboard denied)."); }
      );
    } catch (e) { narrate("[DEBUG] Dump failed: " + e.message); }
  });
  $("debug-show-truth").addEventListener("click", () => {
    narrate(`[DEBUG] Current truth: <em>${(state.truth || "unassigned").toUpperCase()}</em>`);
  });

  // save/load
  $("btn-save-game").addEventListener("click", saveGame);
  $("btn-load-game").addEventListener("click", loadGame);
  $("btn-new-game").addEventListener("click", () => {
    if (confirm("Start over? Current progress will be lost.")) location.reload();
  });
  $("btn-delete-save").addEventListener("click", () => {
    if (!hasSave()) { alert("No saved game to delete."); return; }
    if (!confirm("Delete the saved investigation? This cannot be undone.")) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    alert("Saved game deleted.");
  });
  $("btn-reset-all").addEventListener("click", () => {
    if (!confirm("Reset EVERYTHING — saved game, all settings, AND your investigation history?\n\nThis cannot be undone.")) return;
    if (!confirm("Really reset everything? Last chance.")) return;
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      if (typeof resetStats === "function") resetStats();
    } catch (e) {}
    alert("Everything reset. The game will reload.");
    location.reload();
  });
}

function submitDebugPassword() {
  const pw = document.getElementById("debug-password").value;
  if (pw === "iddqd") {
    settings.debugUnlocked = true;
    saveSettings();
    document.getElementById("settings-debug-prompt").classList.add("hidden");
    reflectSettingsToUI();
    reflectDebug();
    narrate("[DEBUG MODE ACTIVATED]");
  } else {
    document.getElementById("debug-password").value = "";
    document.getElementById("debug-password").placeholder = "wrong";
  }
}
function reflectDebug() {
  const t = document.getElementById("debug-truth");
  if (t) t.textContent = state.truth ? state.truth.toUpperCase() : "-";
}

// --- save / load ---
function serializeState() {
  return JSON.stringify({
    truth: state.truth,
    currentRoom: state.currentRoom,
    timeMinutes: state.timeMinutes,
    evidence: state.evidence,
    calderCaught: state.calderCaught,
    calderLeft: state.calderLeft,
    aggression: state.aggression,
    docsRead: Array.from(state.docsRead),
    entitiesSeen: Array.from(state.entitiesSeen),
    portraitFirstShot: state.portraitFirstShot,
    evpPlacements: state.evpPlacements,
    empumpRoom: state.empumpRoom,
    rempods: state.rempods || {},
    toolUses: state.toolUses || {},
    _enteredNursery: !!state._enteredNursery,
    _enteredCellar: !!state._enteredCellar,
    _roomTimeStart: state._roomTimeStart || 0,
    _lastRestAt: state._lastRestAt || 0,
    _m: state._m || {},
    _elizaChoice: state._elizaChoice || null,
    _elizaProtected: !!state._elizaProtected,
    photos: state.photos || []
  });
}
function saveGame() {
  if (!state.truth) { alert("No game in progress."); return; }
  try {
    localStorage.setItem(SAVE_KEY, serializeState());
    narrate("[Game saved]");
  } catch (e) { alert("Save failed: " + e.message); }
}
function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) { alert("No save found."); return; }
  try {
    const d = JSON.parse(raw);
    state.truth = d.truth;
    state.currentRoom = d.currentRoom;
    state.timeMinutes = d.timeMinutes;
    state.evidence = d.evidence || [];
    state.calderCaught = d.calderCaught || [];
    state.calderLeft = !!d.calderLeft;
    state.aggression = d.aggression || 0;
    state.docsRead = new Set(d.docsRead || []);
    state.entitiesSeen = new Set(d.entitiesSeen || []);
    state.portraitFirstShot = d.portraitFirstShot;
    state.evpPlacements = d.evpPlacements || {};
    state.empumpRoom = d.empumpRoom || null;
    state.rempods = d.rempods || {};
    state.toolUses = d.toolUses || {};
    state._enteredNursery = !!d._enteredNursery;
    state._enteredCellar = !!d._enteredCellar;
    state._roomTimeStart = d._roomTimeStart || 0;
    state._lastRestAt = d._lastRestAt || 0;
    state._m = d._m || {};
    state._elizaChoice = d._elizaChoice || null;
    state._elizaProtected = !!d._elizaProtected;
    state.photos = d.photos || [];
    state.endDialog = null;
    closeOverlay("overlay-settings");
    closeOverlay("overlay-title");
    renderRoom();
    narrate("[Game loaded]");
  } catch (e) { alert("Load failed: " + e.message); }
}
function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
