// tts.js — Web Speech API narration, Vincent Price approximate.
"use strict";

const tts = (function() {
  const synth = window.speechSynthesis || null;
  let voices = [];
  let chosenVoice = null;
  let lastText = "";

  function refreshVoices() {
    if (!synth) return;
    voices = synth.getVoices() || [];
    pickVoice();
  }
  if (synth) {
    refreshVoices();
    // Voices often load asynchronously
    synth.addEventListener("voiceschanged", refreshVoices);
  }

  // Rank voices: prefer en-US/en-GB, prefer the requested gender, prefer non-network voices.
  const MALE_HINTS = ["male", "david", "guy", "mark", "george", "daniel", "james", "paul", "fred", "alex", "tom", "rishi", "aaron"];
  const FEMALE_HINTS = ["female", "zira", "susan", "karen", "samantha", "victoria", "kate", "serena", "tessa", "moira", "fiona", "allison", "ava"];
  // Barbara-Steele-leaning voices: husky, deliberate, preferably British or Italian-English.
  const STEELE_HINTS_STRONG = ["catherine", "hazel", "serena", "kate", "fiona", "tessa", "moira", "susan"];
  const STEELE_HINTS_COUNTRY = ["en-gb", "en-au", "en-ie", "it-"];

  function pickVoice() {
    if (!voices.length) { chosenVoice = null; return; }
    const pref = (typeof settings !== "undefined" && settings.ttsGender) || "male";
    const hints = pref === "female" ? FEMALE_HINTS : MALE_HINTS;
    const wrongHints = pref === "female" ? MALE_HINTS : FEMALE_HINTS;
    const en = voices.filter(v => /^en[-_]/i.test(v.lang));
    const pool = en.length ? en : voices;

    function score(v) {
      const n = v.name.toLowerCase();
      const l = (v.lang || "").toLowerCase();
      let s = 0;
      if (hints.some(h => n.includes(h))) s += 100;
      if (wrongHints.some(h => n.includes(h))) s -= 60;
      if (/google/i.test(v.name)) s += 20;
      if (/microsoft/i.test(v.name)) s += 15;
      if (v.localService) s += 5;
      if (/natural|enhanced|premium/i.test(v.name)) s += 25;

      if (pref === "female") {
        // Barbara Steele bias: British/Australian/Irish > American; huskier-sounding names first
        if (STEELE_HINTS_STRONG.some(h => n.includes(h))) s += 40;
        if (STEELE_HINTS_COUNTRY.some(h => l.startsWith(h))) s += 30;
        if (/en-us/.test(l)) s += 5;   // deprioritize American
        if (/en-gb/.test(l)) s += 15;
      } else {
        // Price bias: American or British, deep-named
        if (/en-us/.test(l)) s += 10;
        if (/en-gb/.test(l)) s += 8;
      }
      return s;
    }
    const ranked = pool.slice().sort((a, b) => score(b) - score(a));
    chosenVoice = ranked[0] || pool[0];
  }

  function stripTags(html) {
    return String(html || "")
      .replace(/<br\s*\/?>/gi, ". ")
      .replace(/<\/?em>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\[[A-Z ]+\]:?\s*/g, "")
      .replace(/&mdash;/g, "—")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function enabled() {
    return !!(synth && typeof settings !== "undefined" && settings.ttsEnabled);
  }

  function speak(text, opts) {
    if (!enabled()) return;
    const clean = stripTags(text);
    if (!clean) return;
    // Skip exact duplicate only if still pending/speaking the same line
    if (clean === lastText && synth.speaking) return;
    lastText = clean;
    // New behavior (May 2026): narration ALWAYS preempts by default so
    // clicking a new room / document / overlay cuts off whatever was being
    // read.  Callers can opt out with { preempt: false } for cases (like
    // the spirit box) where stacking voices is the desired effect.
    const shouldPreempt = !(opts && opts.preempt === false);
    if (shouldPreempt) synth.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    if (chosenVoice) u.voice = chosenVoice;
    // Female voice gets Barbara-Steele bias: slower + lower by default.
    const steeleBias = settings.ttsGender === "female";
    const rateBase = (settings.ttsRate || 90) / 100;
    const pitchBase = (settings.ttsPitch || 90) / 100;
    u.rate = Math.max(0.4, steeleBias ? rateBase * 0.92 : rateBase);
    u.pitch = Math.max(0.4, steeleBias ? pitchBase * 0.85 : pitchBase);
    u.volume = (settings.ttsVolume != null ? settings.ttsVolume : 85) / 100;
    synth.speak(u);
  }

  function stop() { if (synth) synth.cancel(); lastText = ""; }

  // Device speech — bypasses the Read-Aloud toggle and the chosenVoice.
  // Used by the spirit box and Ovilus so they speak captured words even
  // when narration is off. Caller supplies pick/pitch/rate/volume.
  //
  // opts: { mode: "random" | "ovilus" | "whisper", preempt?: boolean }
  function speakDevice(text, opts) {
    if (!synth) return;
    const clean = stripTags(text);
    if (!clean) return;
    if (opts && opts.preempt) synth.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    const mode = (opts && opts.mode) || "random";
    const pool = voices.filter(v => /^en[-_]/i.test(v.lang));
    const avail = pool.length ? pool : voices;
    if (mode === "random" && avail.length) {
      // Spirit box: random voice per utterance, random pitch + rate.
      u.voice = avail[Math.floor(Math.random() * avail.length)];
      u.pitch = 0.55 + Math.random() * 1.1;  // 0.55–1.65
      u.rate  = 0.8  + Math.random() * 0.45; // 0.8–1.25
      u.volume = 0.85;
    } else if (mode === "ovilus" && avail.length) {
      // Ovilus: low flat monotone. Prefer the deepest male voice available.
      const n = a => a.name.toLowerCase();
      const maleLike = avail.filter(v => /male|david|mark|fred|alex|george|daniel|james|paul/.test(n(v)));
      const p = maleLike.length ? maleLike : avail;
      u.voice = p[0];
      u.pitch = 0.5;   // very low
      u.rate  = 0.85;  // slightly slow
      u.volume = 0.9;
    } else if (avail.length) {
      u.voice = avail[0];
    }
    const masterVol = (typeof settings !== "undefined" ? settings.volMaster : 70) / 100;
    u.volume *= masterVol;
    synth.speak(u);
  }

  function availableGenders() {
    const names = voices.map(v => v.name.toLowerCase());
    return {
      male: names.some(n => MALE_HINTS.some(h => n.includes(h))),
      female: names.some(n => FEMALE_HINTS.some(h => n.includes(h)))
    };
  }

  function currentVoiceLabel() {
    return chosenVoice ? `${chosenVoice.name} (${chosenVoice.lang})` : "(no voice available)";
  }

  return { speak, speakDevice, stop, pickVoice, refreshVoices, enabled, availableGenders, currentVoiceLabel };
})();

// Stop any in-flight narration when the page is unloaded/refreshed, when
// the tab is hidden, or when navigating away.  speechSynthesis otherwise
// keeps speaking after the page is gone.
(function wireTtsLifecycle() {
  if (!window.speechSynthesis) return;
  const kill = () => { try { window.speechSynthesis.cancel(); } catch (e) {} };
  window.addEventListener("beforeunload", kill);
  window.addEventListener("pagehide", kill);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") kill();
  });
})();
