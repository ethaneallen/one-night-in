// audio.js — WebAudio synthesized sounds. Zero asset files.
"use strict";

const audio = (function() {
  let ctx = null;
  let masterGain = null;
  let ambientGain = null;
  let ambientNode = null;
  let currentBed = null;
  let started = false;

  function ensureCtx() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    masterGain = ctx.createGain();
    ambientGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    ambientGain.connect(masterGain);
    updateVolumes();
  }

  function updateVolumes() {
    if (!ctx) return;
    const m = (typeof settings !== "undefined" ? settings.volMaster : 70) / 100;
    const a = (typeof settings !== "undefined" ? settings.volAmbient : 60) / 100;
    masterGain.gain.setTargetAtTime(m, ctx.currentTime, 0.05);
    ambientGain.gain.setTargetAtTime(a, ctx.currentTime, 0.05);
  }

  function start() {
    if (started) return;
    ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    started = true;
  }

  // --- ambient bed: slow drone with room-specific timbre ---
  function playAmbient(roomId) {
    ensureCtx();
    if (!ctx) return;
    if (currentBed === roomId) return;
    currentBed = roomId;
    if (ambientNode) {
      ambientNode.stop && ambientNode.stop();
      ambientNode.disconnect && ambientNode.disconnect();
    }
    const freq = {
      drive: 55, entry_hall: 45, parlor: 50, library: 40, dining: 48, kitchen: 60,
      conservatory: 52, upstairs_hall: 42, master: 38, nursery: 33, governess: 44,
      study: 41, wine_cellar: 28,
      // Wyndmere Hollow (Chapter II) — each room gets its own fundamental so
      // the legacy drone changes when you travel, not just the per-room bed.
      wm_jetty: 49,        wm_drive: 53,        wm_foyer: 46,
      wm_morning: 51,      wm_library: 39,      wm_kitchen: 58,
      wm_upper_hall: 43,   wm_master: 36,       wm_viv_room: 34,
      wm_attic_door: 41,   wm_attic: 30,        wm_chapel: 47,
      wm_boathouse: 32,    wm_lakeshore: 50
    }[roomId] || 45;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 2;

    osc1.type = "sawtooth"; osc1.frequency.value = freq;
    osc2.type = "sawtooth"; osc2.frequency.value = freq * 1.01;
    osc3.type = "sine";     osc3.frequency.value = freq * 0.5;
    g.gain.value = 0.12;
    osc1.connect(g); osc2.connect(g); osc3.connect(g);
    g.connect(filter); filter.connect(ambientGain);
    osc1.start(); osc2.start(); osc3.start();

    ambientNode = {
      stop: () => { osc1.stop(); osc2.stop(); osc3.stop(); },
      disconnect: () => { g.disconnect(); filter.disconnect(); }
    };
  }

  function stopAmbient() {
    if (ambientNode) {
      ambientNode.stop && ambientNode.stop();
      ambientNode.disconnect && ambientNode.disconnect();
    }
    ambientNode = null; currentBed = null;
  }

  // --- one-shot SFX ---
  function beep(freq, dur, type, vol) {
    ensureCtx(); if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol || 0.15, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(masterGain);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  }

  function sfx(name) {
    switch (name) {
      case "click": return beep(1200, 0.04, "square", 0.08);
      case "door":  return beep(120, 0.25, "sawtooth", 0.18);
      case "lock":  beep(300, 0.05, "square", 0.2); setTimeout(() => beep(180, 0.12, "square", 0.2), 60); return;
      case "kii_tick": return beep(2400, 0.03, "square", 0.12);
      case "kii_alarm": return beep(800, 0.18, "square", 0.2);
      case "knock": beep(90, 0.08, "triangle", 0.25); setTimeout(() => beep(90, 0.08, "triangle", 0.25), 150); setTimeout(() => beep(90, 0.08, "triangle", 0.25), 300); return;
      case "answer_knock": setTimeout(() => { beep(70, 0.1, "triangle", 0.25); setTimeout(() => beep(70, 0.1, "triangle", 0.25), 140); setTimeout(() => beep(70, 0.1, "triangle", 0.25), 290); }, 900); return;
      case "spirit_sweep": return noise(0.5, 800, 3000);
      case "ovilus":       return beep(600, 0.12, "square", 0.15);
      case "sls":          noise(0.08, 2000, 6000); return;
      case "evp_play":     noise(0.4, 200, 1200); return;
      case "thermal":      return beep(400, 0.08, "sine", 0.1);
      case "empump_on":    loopyTone(55, 1.2, 0.18); return;
      case "tape_play":    noise(0.7, 300, 1500); setTimeout(() => beep(200, 0.4, "sawtooth", 0.12), 150); return;
      case "verdict":      beep(440, 0.2, "sine", 0.2); setTimeout(() => beep(330, 0.3, "sine", 0.2), 220); return;
      case "breath":       noise(1.2, 100, 400); return;
      case "jolt":         return jolt();
      case "screech":      return screech();
      case "heartbeat":    return heartbeat();
      case "distant_bang": return distantBang();
      case "music_box":    return musicBox();
      case "whisper":      return whisper();
      case "chime":        return chime();
      case "floor_creak":  return floorCreak();
      case "pipe_groan":   return pipeGroan();
      case "wood_settle":  return woodSettle();
      case "dist_door":    return distantDoor();
      case "window_rattle":return windowRattle();
      case "chain_drag":   return chainDrag();
      case "faint_laugh":  return faintLaugh();
      case "dist_piano":   return distantPiano();
      case "scratch_wall": return scratchWall();
      case "distant_footsteps": return distantFootsteps();
      case "clock_tick":   return clockTick();
      default: return;
    }
  }

  // Classic horror movie screech - picks from 4 variants so repeat deaths vary
  function screech() {
    ensureCtx(); if (!ctx) return;
    const variant = Math.floor(Math.random() * 4);
    switch (variant) {
      case 0: screechPsycho(); break;
      case 1: screechOrganDrone(); break;
      case 2: screechChorus(); break;
      case 3: screechShriek(); break;
    }
    // LOUD death layers — noise rumble + sharp jolt + sub-bass drop
    noise(1.8, 60, 300);
    // Immediate high-freq piercing crack to startle
    const now = ctx.currentTime;
    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = "sawtooth"; crack.frequency.value = 2400;
    crack.frequency.exponentialRampToValueAtTime(400, now + 0.35);
    crackGain.gain.setValueAtTime(0, now);
    crackGain.gain.linearRampToValueAtTime(0.55, now + 0.01);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    crack.connect(crackGain); crackGain.connect(masterGain);
    crack.start(now); crack.stop(now + 0.7);
    // Sub-bass thud at the end for weight
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine"; sub.frequency.value = 45;
    subGain.gain.setValueAtTime(0, now + 0.05);
    subGain.gain.linearRampToValueAtTime(0.65, now + 0.08);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    sub.connect(subGain); subGain.connect(masterGain);
    sub.start(now + 0.05); sub.stop(now + 1.5);
  }
  function screechPsycho() {
    const now = ctx.currentTime, dur = 1.5;
    [880, 932, 1200, 1760].forEach(f => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(f, now);
      o.frequency.linearRampToValueAtTime(f * 1.05, now + dur);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.15, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      o.connect(g); g.connect(masterGain); o.start(now); o.stop(now + dur + 0.05);
    });
  }
  function screechOrganDrone() {
    const now = ctx.currentTime, dur = 1.8;
    [65, 98, 130, 146].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = i < 2 ? "sawtooth" : "triangle";
      o.frequency.setValueAtTime(f * 1.3, now);
      o.frequency.exponentialRampToValueAtTime(f * 0.75, now + dur);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      o.connect(g); g.connect(masterGain); o.start(now); o.stop(now + dur + 0.05);
    });
  }
  function screechChorus() {
    const now = ctx.currentTime, dur = 1.6;
    [220, 277, 330, 440, 554, 659].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine";
      const detune = (Math.random() - 0.5) * 20;
      o.frequency.value = f;
      o.detune.value = detune;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.08, now + 0.15 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      o.connect(g); g.connect(masterGain); o.start(now); o.stop(now + dur + 0.05);
    });
  }
  function screechShriek() {
    const now = ctx.currentTime, dur = 1.4;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(1200, now);
    o.frequency.linearRampToValueAtTime(2800, now + 0.4);
    o.frequency.linearRampToValueAtTime(2200, now + dur);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g); g.connect(masterGain); o.start(now); o.stop(now + dur + 0.05);
  }

  function heartbeat() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // Two thuds per beat
    [0, 0.12].forEach(off => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(70, now + off);
      o.frequency.exponentialRampToValueAtTime(35, now + off + 0.15);
      g.gain.setValueAtTime(0.25, now + off);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.18);
      o.connect(g); g.connect(masterGain);
      o.start(now + off); o.stop(now + off + 0.2);
    });
  }

  function distantBang() {
    ensureCtx(); if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 400;
    o.type = "triangle"; o.frequency.value = 80;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(f); f.connect(g); g.connect(masterGain);
    o.start(); o.stop(ctx.currentTime + 0.4);
  }

  // A sharp, jarring close-range bang — high-freq crack + lowpass thump.
  // Used for knocks and pipes when aggression is elevated.
  function jolt() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // High-frequency metallic crack
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass"; f1.frequency.value = 1800; f1.Q.value = 3;
    o1.type = "square"; o1.frequency.value = 850;
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.45, now + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    o1.connect(f1); f1.connect(g1); g1.connect(masterGain);
    o1.start(now); o1.stop(now + 0.12);
    // Body thump underneath
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    const f2 = ctx.createBiquadFilter();
    f2.type = "lowpass"; f2.frequency.value = 250;
    o2.type = "triangle"; o2.frequency.value = 70;
    g2.gain.setValueAtTime(0.55, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    o2.connect(f2); f2.connect(g2); g2.connect(masterGain);
    o2.start(now); o2.stop(now + 0.24);
    // Brief noise burst for transient attack
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const gn = ctx.createGain();
    gn.gain.value = 0.3;
    src.connect(gn); gn.connect(masterGain);
    src.start(now);
  }

  function musicBox() {
    ensureCtx(); if (!ctx) return;
    // A creepy fragmentary lullaby — different every time.
    // Pick from a minor-mode scale; add a couple of jarring intervals.
    // A minor: A4 C5 D5 E5 F5 G5 A5 (+ one outlier per phrase for wrongness)
    const scale = [440, 494, 523, 587, 659, 698, 784, 880];
    const outliers = [466, 554, 622, 740]; // passing dissonances
    const length = 4 + Math.floor(Math.random() * 5); // 4–8 notes
    const notes = [];
    for (let i = 0; i < length; i++) {
      const pool = Math.random() < 0.18 ? outliers : scale;
      notes.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    const now = ctx.currentTime;
    const spacing = 0.28 + Math.random() * 0.2;  // 0.28–0.48s per note
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f * (1 - 0.02 + Math.random() * 0.04); // drift
      const t = now + i * spacing;
      const dur = 0.25 + Math.random() * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.04, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + dur + 0.02);
    });
  }

  function whisper() {
    ensureCtx(); if (!ctx) return;
    // Filtered noise bursts in a speech-like pattern
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const dur = 0.08 + Math.random() * 0.12;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 1500 + Math.random() * 800; f.Q.value = 8;
      const g = ctx.createGain();
      g.gain.value = 0.12;
      src.connect(f); f.connect(g); g.connect(masterGain);
      src.start(now + i * 0.22);
    }
  }

  // Replaced the old bright bell. This is a slow, low swell with a dissonant
  // undertone, dying into the ambient grain. Reads as 'something happened' not
  // 'notification'.
  function chime() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 2.6;
    // Fundamental: low, almost subaudible
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sine";
    o1.frequency.setValueAtTime(82, now);
    o1.frequency.exponentialRampToValueAtTime(68, now + dur);
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.14, now + 0.35);
    g1.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o1.connect(g1); g1.connect(masterGain);
    o1.start(now); o1.stop(now + dur + 0.05);
    // Minor-second dissonance floating above it
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = "triangle";
    o2.frequency.value = 233; // ~B flat 3
    o2.detune.value = -15;
    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(0.05, now + 0.6);
    g2.gain.exponentialRampToValueAtTime(0.001, now + dur - 0.3);
    o2.connect(g2); g2.connect(masterGain);
    o2.start(now); o2.stop(now + dur + 0.05);
    // Filtered noise tail — barely audible, adds 'room tone'
    const tailDur = 1.2;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * tailDur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 380;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.05, now + 0.4);
    gn.gain.exponentialRampToValueAtTime(0.001, now + tailDur + 0.4);
    src.connect(f); f.connect(gn); gn.connect(masterGain);
    src.start(now + 0.4);
  }

  // --- Ambient / random house sounds ---

  function floorCreak() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.35 + Math.random() * 0.4;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 250 + Math.random() * 200; f.Q.value = 6;
    o.type = "sawtooth";
    o.frequency.setValueAtTime(180, now);
    o.frequency.linearRampToValueAtTime(90, now + dur);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.07, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(f); f.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + dur + 0.02);
  }

  function pipeGroan() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 1.5 + Math.random() * 1.2;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 400;
    o.type = "sawtooth";
    o.frequency.setValueAtTime(55, now);
    o.frequency.linearRampToValueAtTime(85, now + dur * 0.5);
    o.frequency.linearRampToValueAtTime(48, now + dur);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.09, now + 0.3);
    g.gain.linearRampToValueAtTime(0.001, now + dur);
    o.connect(f); f.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + dur + 0.05);
  }

  function woodSettle() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // A tight pop + resonant ring — old timber cooling
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = 140 + Math.random() * 80;
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.2);
  }

  function distantDoor() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // Low-passed thud + faint latch click after
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 200;
    o.type = "sine"; o.frequency.value = 60;
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o.connect(f); f.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.55);
    // Faint latch
    setTimeout(() => beep(1100, 0.03, "square", 0.04), 140);
  }

  function windowRattle() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.07;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square"; o.frequency.value = 600 + Math.random() * 400;
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.06);
    }
  }

  function chainDrag() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 1.2;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.sin(i / 600) * 0.5 + 0.5) * 0.7;
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.15);
    g.gain.linearRampToValueAtTime(0.001, now + dur);
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(now);
  }

  function faintLaugh() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // 3-5 staccato voiced bursts at mid-high freqs
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = now + i * (0.12 + Math.random() * 0.08);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 900 + Math.random() * 600; f.Q.value = 4;
      o.type = "sawtooth"; o.frequency.value = 280 + Math.random() * 120;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(f); f.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.12);
    }
  }

  function distantPiano() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // Two or three muted, off-key notes
    const freqs = [130.8, 146.8, 174.6, 196, 207.6]; // C3 D3 F3 G3 G#3 (minor-ish)
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const t = now + i * (0.5 + Math.random() * 0.5);
      const f = freqs[Math.floor(Math.random() * freqs.length)];
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 600;
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
      o.connect(lp); lp.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 1.5);
    }
  }

  function scratchWall() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.6 + Math.random() * 0.4;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.sin((i / data.length) * Math.PI) * (0.5 + Math.random() * 0.5);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass"; f.frequency.value = 2200;
    const g = ctx.createGain();
    g.gain.value = 0.07;
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(now);
  }

  function distantFootsteps() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // 4-6 low thumps with irregular spacing, filtered heavily
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = now + i * (0.38 + Math.random() * 0.12);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 180;
      o.type = "sine"; o.frequency.value = 55 + Math.random() * 15;
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(f); f.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.2);
    }
  }

  function clockTick() {
    ensureCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.9;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square"; o.frequency.value = 2200;
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.04);
    }
  }

  function noise(dur, lo, hi) {
    ensureCtx(); if (!ctx) return;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = (lo + hi) / 2;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(filter); filter.connect(g); g.connect(masterGain);
    src.start();
  }

  function loopyTone(freq, dur, vol) {
    ensureCtx(); if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(masterGain);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  }

  // --- Spirit Box continuous static loop ---
  let spiritStaticNode = null;
  function startSpiritStatic() {
    ensureCtx(); if (!ctx) return;
    if (spiritStaticNode) return;
    // 2-second noise buffer, looped
    const dur = 2;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // Bandpass so it sounds like speaker static, not white noise
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 300;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 3200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.15);
    // Slow amplitude wobble to feel like radio drifting
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.4;
    lfoGain.gain.value = 0.018;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start(); lfo.start();
    spiritStaticNode = {
      stop() {
        try {
          g.gain.cancelScheduledValues(ctx.currentTime);
          g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
          src.stop(ctx.currentTime + 0.2);
          lfo.stop(ctx.currentTime + 0.2);
        } catch (e) {}
      }
    };
  }
  function stopSpiritStatic() {
    if (spiritStaticNode) { spiritStaticNode.stop(); spiritStaticNode = null; }
  }

  // --- Rain bed for weather ---
  let rainNode = null;
  function startRainBed(intensity) {
    ensureCtx(); if (!ctx) return;
    if (rainNode) return;
    // Pink-ish noise, bandpass-filtered to sound like rain on roof
    const dur = 4;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 800;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 4200;
    const g = ctx.createGain();
    const baseGain = (intensity || 0.5) * 0.18;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(baseGain, ctx.currentTime + 1.2);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(ambientGain);
    src.start();
    rainNode = {
      baseGain,
      lp,
      g,
      setIndoors(indoors) {
        // Muffle indoors: drop highs, reduce volume
        try {
          lp.frequency.setTargetAtTime(indoors ? 1400 : 4200, ctx.currentTime, 0.5);
          g.gain.setTargetAtTime(indoors ? baseGain * 0.45 : baseGain, ctx.currentTime, 0.5);
        } catch (e) {}
      },
      stop() {
        try {
          g.gain.cancelScheduledValues(ctx.currentTime);
          g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
          src.stop(ctx.currentTime + 1.1);
        } catch (e) {}
      }
    };
  }
  function stopRainBed() { if (rainNode) { rainNode.stop(); rainNode = null; } }
  function setRainIndoors(indoors) { if (rainNode && rainNode.setIndoors) rainNode.setIndoors(indoors); }

  // --- Per-room music beds ---
  // A second layered drone/tone keyed to the room's mood. Sits quietly
  // under playAmbient()'s base drone; swaps on room change.
  let musicBedNode = null;
  let currentBedRoom = null;

  // Each bed is a function that creates oscillators attached to ambientGain.
  // Kept very quiet (gain * 0.04 to 0.07) so it's felt, not heard.
  // Beds expose `bedSubGain` for duckBed() and `nodes` for warpBed().
  function buildBed(kind) {
    const now = ctx.currentTime;
    const nodes = [];
    // One shared sub-gain for the whole bed — reactive audio modulates this
    // (duckBed) instead of individual osc gains, so volume rides cleanly.
    const bedSubGain = ctx.createGain();
    bedSubGain.gain.setValueAtTime(1, now);
    bedSubGain.connect(ambientGain);
    function osc(type, freq, detune, gainVal, filterFreq) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune || 0;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gainVal, now + 1.5);
      if (filterFreq) {
        const f = ctx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = filterFreq; f.Q.value = 2;
        o.connect(f); f.connect(g);
      } else {
        o.connect(g);
      }
      g.connect(bedSubGain);
      o.start();
      nodes.push({ o, g });
    }
    switch (kind) {
      case "parlor":
        // Low organ chord — C2, G2, Eb3 — melancholy minor
        osc("sine", 65.4, 0, 0.06, 300);
        osc("sine", 98, 3, 0.05, 300);
        osc("triangle", 155.6, -4, 0.04, 400);
        break;
      case "library":
        // Quieter, stringy — single low drone with slow beating
        osc("sawtooth", 73.4, 0, 0.045, 450);
        osc("sawtooth", 73.4, 8, 0.035, 450);
        break;
      case "nursery":
        // Music-box drift — high shimmering triangle tones
        osc("triangle", 523, 0, 0.025, 1600);
        osc("triangle", 659, 5, 0.02, 1600);
        osc("sine", 130, 0, 0.05, 300);
        break;
      case "master":
        // Deep, slow breathing — sub + breathing filter movement
        osc("sine", 52, 0, 0.08, 250);
        osc("triangle", 104, -6, 0.03, 350);
        break;
      case "wine_cellar":
        // Sub bass + metallic drip
        osc("sine", 43.6, 0, 0.1, 200);
        osc("sine", 87, 5, 0.04, 250);
        break;
      case "study":
        // Tape-hiss-ish mid with a quiet ticking element
        osc("sine", 87, 0, 0.045, 400);
        osc("sawtooth", 130.8, -8, 0.025, 500);
        break;
      case "conservatory":
        // Higher airy drone — wind-through-glass
        osc("sine", 130.8, 0, 0.035, 800);
        osc("triangle", 196, 4, 0.025, 900);
        break;
      case "kitchen":
        // Mechanical hum — pipes
        osc("sawtooth", 60, 0, 0.05, 200);
        osc("square", 120, 5, 0.018, 250);
        break;
      case "dining":
        // Hollow, empty
        osc("sine", 82.4, 0, 0.055, 350);
        osc("triangle", 164.8, -5, 0.03, 400);
        break;
      case "entry_hall":
        // Neutral warm tone
        osc("sine", 87, 0, 0.05, 400);
        break;
      case "upstairs_hall":
        // Hallway wind, slightly higher
        osc("sine", 98, 0, 0.05, 500);
        osc("triangle", 146.8, -6, 0.03, 600);
        break;
      case "governess":
        // Gentle minor chord — unresolved
        osc("sine", 110, 0, 0.05, 500);
        osc("sine", 139, 4, 0.035, 500);
        break;

      // ── Wyndmere Hollow (Chapter II) ───────────────────────────────
      case "wm_jetty":
        // Lapping lake — low water sub + distant horn
        osc("sine", 49, 0, 0.07, 220);
        osc("triangle", 73, -6, 0.03, 320);
        osc("sine", 196, 4, 0.018, 900);
        break;
      case "wm_drive":
        // Wet gravel approach — soft outdoor moan, slightly brighter
        osc("sine", 62, 0, 0.055, 300);
        osc("triangle", 92.5, -4, 0.028, 420);
        break;
      case "wm_foyer":
        // Grand, hollow entry — open fifth, chandelier shimmer
        osc("sine", 73.4, 0, 0.06, 320);
        osc("sine", 110, 3, 0.04, 360);
        osc("triangle", 440, 0, 0.012, 1800);
        break;
      case "wm_morning":
        // Cold east-facing room — thin glassy upper drone
        osc("sine", 87, 0, 0.045, 380);
        osc("triangle", 196, 5, 0.022, 1100);
        osc("sine", 261, -3, 0.014, 1400);
        break;
      case "wm_library":
        // Wing-back hush — wood-paneled mid drone with paper rustle bias
        osc("sawtooth", 69.3, 0, 0.04, 420);
        osc("sawtooth", 69.3, 9, 0.03, 420);
        osc("sine", 138.6, -4, 0.025, 600);
        break;
      case "wm_kitchen":
        // Damp scullery — ticking pipes, water under floor
        osc("sawtooth", 55, 0, 0.05, 200);
        osc("square", 110, 6, 0.016, 240);
        osc("sine", 41, 0, 0.04, 180);
        break;
      case "wm_upper_hall":
        // Long corridor wind — wider stereo-feeling beats
        osc("sine", 92.5, 0, 0.05, 460);
        osc("triangle", 138.6, -7, 0.03, 560);
        osc("sine", 92.5, 5, 0.025, 460);
        break;
      case "wm_master":
        // Mrs. Thrale's bed — slow heavy breath under it all
        osc("sine", 46, 0, 0.085, 220);
        osc("triangle", 98, -8, 0.03, 340);
        osc("sine", 146, -2, 0.018, 500);
        break;
      case "wm_viv_room":
        // Vivian's room — wet, cold music-box ghost
        osc("triangle", 494, 0, 0.022, 1700);
        osc("triangle", 622, 7, 0.018, 1700);
        osc("sine", 110, 0, 0.05, 280);
        break;
      case "wm_attic_door":
        // Held breath — single low tone, very narrow
        osc("sine", 58, 0, 0.075, 220);
        osc("sine", 58, 6, 0.04, 220);
        break;
      case "wm_attic":
        // Up under the eaves — high airy hiss + a low warning
        osc("sine", 55, 0, 0.06, 250);
        osc("triangle", 165, 3, 0.025, 900);
        osc("sine", 330, -5, 0.012, 1400);
        break;
      case "wm_chapel":
        // Stone chapel — open fifth pipe-organ feel
        osc("sine", 65.4, 0, 0.07, 280);
        osc("sine", 98, 4, 0.05, 320);
        osc("triangle", 196, -3, 0.03, 700);
        break;
      case "wm_boathouse":
        // Hollow timber over black water — sub + creak
        osc("sine", 41, 0, 0.08, 200);
        osc("triangle", 82, -6, 0.03, 320);
        osc("sine", 123, 9, 0.018, 500);
        break;
      case "wm_lakeshore":
        // Outside, at the water's edge — wide low moan + mist shimmer
        osc("sine", 52, 0, 0.07, 240);
        osc("triangle", 78, -5, 0.03, 360);
        osc("sine", 220, 6, 0.014, 1600);
        break;

      case "drive":
      default:
        // Outdoor — low moan of night air
        osc("sine", 58, 0, 0.05, 300);
        osc("triangle", 87, -4, 0.025, 400);
        break;
    }
    return {
      bedSubGain,
      nodes,
      stop() {
        try {
          const t = ctx.currentTime;
          nodes.forEach(({ o, g }) => {
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(g.gain.value, t);
            g.gain.linearRampToValueAtTime(0, t + 1.5);
            o.stop(t + 1.6);
          });
        } catch (e) {}
      }
    };
  }

  function playRoomBed(roomId) {
    ensureCtx(); if (!ctx) return;
    if (currentBedRoom === roomId) return;
    currentBedRoom = roomId;
    if (musicBedNode) musicBedNode.stop();
    musicBedNode = buildBed(roomId);
  }
  function stopRoomBed() {
    if (musicBedNode) { musicBedNode.stop(); musicBedNode = null; }
    currentBedRoom = null;
  }

  // --- Reactive audio (called by gameplay on scares, manifestations, etc.) ---

  // duckBed: temporarily reduce the room bed's volume by `amount` (0..1) for `ms`.
  // Returns smoothly. Safe to call when no bed is playing.
  function duckBed(amount, ms) {
    ensureCtx(); if (!ctx || !musicBedNode || !musicBedNode.bedSubGain) return;
    const g = musicBedNode.bedSubGain.gain;
    const t = ctx.currentTime;
    const dipTo = Math.max(0.05, 1 - (amount || 0.7));
    try {
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(dipTo, t + 0.15);
      g.linearRampToValueAtTime(1, t + Math.max(0.5, (ms || 1500) / 1000));
    } catch (e) {}
  }

  // warpBed: pitch the bed downward by `cents` for `ms`, then restore.
  // Used on manifestations and scares — the room itself sags downward.
  function warpBed(cents, ms) {
    ensureCtx(); if (!ctx || !musicBedNode || !musicBedNode.nodes) return;
    const dur = Math.max(300, ms || 2200);
    const t = ctx.currentTime;
    musicBedNode.nodes.forEach(({ o }) => {
      try {
        const base = o.detune.value || 0;
        o.detune.cancelScheduledValues(t);
        o.detune.setValueAtTime(base, t);
        o.detune.linearRampToValueAtTime(base - Math.abs(cents || 80), t + 0.4);
        o.detune.linearRampToValueAtTime(base, t + dur / 1000);
      } catch (e) {}
    });
  }

  // --- Heartbeat layer: subtle sub-pulse, started/stopped externally ---
  let heartbeatNode = null;
  function startHeartbeat() {
    ensureCtx(); if (!ctx) return;
    if (heartbeatNode) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine"; o.frequency.value = 55;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 180;
    o.connect(lp); lp.connect(g); g.connect(ambientGain);
    o.start();
    // 60 bpm pulse pattern (1 sec): two short bumps (lub-dub), then quiet
    let stopped = false;
    function pulse() {
      if (stopped || !ctx) return;
      const t = ctx.currentTime;
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(0.0, t);
        g.gain.linearRampToValueAtTime(0.10, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        g.gain.setValueAtTime(0.0, t + 0.28);
        g.gain.linearRampToValueAtTime(0.07, t + 0.34);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      } catch (e) {}
      setTimeout(pulse, 1100 + Math.random() * 200);
    }
    pulse();
    heartbeatNode = {
      stop() {
        stopped = true;
        try {
          const t = ctx.currentTime;
          g.gain.cancelScheduledValues(t);
          g.gain.linearRampToValueAtTime(0, t + 0.4);
          o.stop(t + 0.5);
        } catch (e) {}
      }
    };
  }
  function stopHeartbeat() {
    if (heartbeatNode) { heartbeatNode.stop(); heartbeatNode = null; }
  }

  // --- One-shot: whisper a name (used once per night, EVP-style) ---
  // Synthesized: filtered pink noise with formant peaks + envelope per syllable.
  function whisperName(name) {
    ensureCtx(); if (!ctx || !name) return;
    const cleaned = String(name).trim().toLowerCase().replace(/[^a-z\s'-]/g, "");
    const syllables = cleaned.split(/[\s\-']/).filter(Boolean);
    if (!syllables.length) return;
    const t0 = ctx.currentTime + 0.05;
    syllables.forEach((syl, idx) => {
      const start = t0 + idx * 0.42;
      const dur = 0.32 + Math.min(0.25, syl.length * 0.04);
      // Pink-ish noise via filtered white
      const bufferSize = Math.floor(ctx.sampleRate * (dur + 0.1));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      // Formants — vowel-ish band-pass
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      // Vary formant by first vowel of syllable
      const vowel = (syl.match(/[aeiouy]/) || ["a"])[0];
      const fMap = { a: 700, e: 500, i: 350, o: 450, u: 400, y: 380 };
      bp.frequency.value = fMap[vowel] || 500;
      bp.Q.value = 6;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 180;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.14, start + 0.05);
      g.gain.linearRampToValueAtTime(0.18, start + dur * 0.55);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(masterGain);
      src.start(start);
      src.stop(start + dur + 0.05);
    });
    // Underlying sub pitched at the name's stress (simple constant)
    const sub = ctx.createOscillator();
    sub.type = "sine"; sub.frequency.value = 75;
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0, t0);
    subG.gain.linearRampToValueAtTime(0.04, t0 + 0.2);
    subG.gain.exponentialRampToValueAtTime(0.0001, t0 + syllables.length * 0.42 + 0.3);
    sub.connect(subG); subG.connect(masterGain);
    sub.start(t0); sub.stop(t0 + syllables.length * 0.42 + 0.4);
    // Duck the bed under the whisper so it's audible
    duckBed(0.5, syllables.length * 420 + 600);
  }

  // --- Panned knock: same synthesis as knock sfx but with a stereo position ---
  function pannedKnock(pan) {
    ensureCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) p.pan.value = Math.max(-1, Math.min(1, pan || 0));
    function bump(offset) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square"; o.frequency.value = 90;
      g.gain.setValueAtTime(0, t + offset);
      g.gain.linearRampToValueAtTime(0.30, t + offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.10);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 320;
      o.connect(lp); lp.connect(g);
      if (p) { g.connect(p); p.connect(masterGain); } else { g.connect(masterGain); }
      o.start(t + offset); o.stop(t + offset + 0.12);
    }
    bump(0); bump(0.22); bump(0.44);
  }

  // ────────────────────────────────────────────────────────────────────
  // CREEP MUSIC LAYER — Fat-Man-inspired detuned-piano plinks
  // Sparse, sour cluster notes that drift over the ambient bed.
  // Tempo and dissonance scale with state.aggression.
  // ────────────────────────────────────────────────────────────────────
  let creepNode = null;
  function startCreepLayer() {
    ensureCtx(); if (!ctx) return;
    if (creepNode) return;
    let stopped = false;
    // Output bus: lowpass + plate-ish feedback delay for cathedral feel
    const bus = ctx.createGain();
    bus.gain.value = 0.55;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1700; lp.Q.value = 0.5;
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    bus.connect(lp);
    lp.connect(ambientGain);
    lp.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ambientGain);

    // Half-diminished cluster — equal-weight wrongness
    // D, F, Ab, B (in Hz, low octave): 73.4, 87.3, 103.8, 123.5
    const clusters = [
      [73.4, 87.3, 103.8, 123.5],      // D F Ab B
      [98, 116.5, 138.6, 164.8],       // G Bb Db E
      [110, 130.8, 155.6, 185],        // A C Eb F#
      [82.4, 98, 116.5, 138.6]         // E G Bb Db
    ];
    let cluster = clusters[Math.floor(Math.random() * clusters.length)];
    function rotateCluster() {
      cluster = clusters[Math.floor(Math.random() * clusters.length)];
    }
    setInterval(rotateCluster, 45000 + Math.random() * 20000);

    function plink() {
      if (stopped) return;
      try {
        const agg = (typeof state !== "undefined" && state.aggression) || 0;
        // Octave: low when calm, climbs as aggression rises
        const octShift = agg > 70 ? 4 : agg > 40 ? 3 : agg > 15 ? 2 : 1;
        const base = cluster[Math.floor(Math.random() * cluster.length)];
        const freq = base * Math.pow(2, octShift);
        const now = ctx.currentTime;
        const dur = 2.4 + Math.random() * 1.4;
        // Two detuned sines for a "prepared piano" timbre
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const o3 = ctx.createOscillator(); // AM modulator
        const g  = ctx.createGain();
        const amG = ctx.createGain();
        o1.type = "sine"; o1.frequency.value = freq;
        o2.type = "sine"; o2.frequency.value = freq; o2.detune.value = -7;
        o3.type = "sine"; o3.frequency.value = 4.2; // tremolo
        amG.gain.value = 0.18;
        // Mild brighter overtone — gives the celeste edge
        const o4 = ctx.createOscillator();
        const g4 = ctx.createGain();
        o4.type = "triangle"; o4.frequency.value = freq * 2;
        g4.gain.setValueAtTime(0, now);
        g4.gain.linearRampToValueAtTime(0.025, now + 0.008);
        g4.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.6);
        o4.connect(g4); g4.connect(bus); o4.start(now); o4.stop(now + dur);

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.085, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o3.connect(amG); amG.connect(g.gain);
        o1.connect(g); o2.connect(g); g.connect(bus);
        o1.start(now); o2.start(now); o3.start(now);
        o1.stop(now + dur + 0.05); o2.stop(now + dur + 0.05); o3.stop(now + dur + 0.05);
      } catch (e) {}
      // Tempo: 8-16s when calm, 3-7s when angry
      const agg = (typeof state !== "undefined" && state.aggression) || 0;
      const lo = Math.max(2500, 9000 - agg * 70);
      const hi = Math.max(5500, 16000 - agg * 110);
      const next = lo + Math.random() * (hi - lo);
      setTimeout(plink, next);
    }
    // Stagger first hit so it's not synchronized with room change
    setTimeout(plink, 2500 + Math.random() * 4000);

    creepNode = {
      stop() {
        stopped = true;
        try {
          const t = ctx.currentTime;
          bus.gain.cancelScheduledValues(t);
          bus.gain.linearRampToValueAtTime(0, t + 1.5);
        } catch (e) {}
      }
    };
  }
  function stopCreepLayer() {
    if (creepNode) { creepNode.stop(); creepNode = null; }
  }

  // ────────────────────────────────────────────────────────────────────
  // DEAD-AIR GATE — drop ambient to silence briefly, then restore.
  // Use right before a scare; the silence is the scare.
  // ────────────────────────────────────────────────────────────────────
  let preGateGain = null;
  function deadAirGate(ms) {
    ensureCtx(); if (!ctx || !ambientGain) return;
    const dur = (ms || 600) / 1000;
    const t = ctx.currentTime;
    try {
      if (preGateGain == null) preGateGain = ambientGain.gain.value;
      ambientGain.gain.cancelScheduledValues(t);
      ambientGain.gain.setTargetAtTime(0, t, 0.05);
      // Restore
      setTimeout(() => {
        try {
          updateVolumes(); // resets ambientGain to settings.volAmbient
          preGateGain = null;
        } catch (e) {}
      }, Math.max(200, ms || 600));
    } catch (e) {}
  }

  // ────────────────────────────────────────────────────────────────────
  // GRANULAR WHISPER BED — bandpassed sibilants you can't quite parse.
  // Cheap continuous unease; runs while creep layer is active.
  // ────────────────────────────────────────────────────────────────────
  let granularNode = null;
  function startGranularBed() {
    ensureCtx(); if (!ctx) return;
    if (granularNode) return;
    let stopped = false;
    function grain() {
      if (stopped) return;
      try {
        const dur = 0.06 + Math.random() * 0.08;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const env = Math.sin((i / data.length) * Math.PI);
          data[i] = (Math.random() * 2 - 1) * env;
        }
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 1100 + Math.random() * 1400; bp.Q.value = 8;
        const g = ctx.createGain();
        g.gain.value = 0.022;
        // Random pan L/R
        let dest = ambientGain;
        if (ctx.createStereoPanner) {
          const p = ctx.createStereoPanner();
          p.pan.value = (Math.random() * 2 - 1) * 0.85;
          p.connect(ambientGain);
          dest = p;
        }
        src.connect(bp); bp.connect(g); g.connect(dest);
        src.start();
      } catch (e) {}
      setTimeout(grain, 500 + Math.random() * 1400);
    }
    setTimeout(grain, 1200 + Math.random() * 1800);
    granularNode = { stop() { stopped = true; } };
  }
  function stopGranularBed() {
    if (granularNode) { granularNode.stop(); granularNode = null; }
  }

  return { start, ensureCtx, updateVolumes, playAmbient, stopAmbient, sfx, startSpiritStatic, stopSpiritStatic, startRainBed, stopRainBed, setRainIndoors, playRoomBed, stopRoomBed, duckBed, warpBed, startHeartbeat, stopHeartbeat, whisperName, pannedKnock, startCreepLayer, stopCreepLayer, deadAirGate, startGranularBed, stopGranularBed };
})();

// start audio on first user interaction
document.addEventListener("click", () => audio.start(), { once: true });
