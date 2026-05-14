// One Night In… — FATAL FRAME pass
// =====================================================================
// Three mechanics borrowed (and re-skinned for 1880s spiritualism) from
// the Fatal Frame / Project Zero series:
//
//   1. THE DAGUERREOTYPE PLATE — Camera Obscura. A wandering "spectral
//      mark" drifts across the viewfinder; the player must aim the
//      reticle onto it, hold to charge the plate, and expose at the
//      peak. The longer you hold, the dread meter climbs — release too
//      late and the entity closes the distance. A perfect capture
//      ("FATAL FRAME") works even on debunked runs, producing a figure
//      where none should exist.
//
//   2. PSYCHOMETRY (TOUCH READING) — Mask of the Lunar Eclipse. Touch
//      an heirloom and three "impression peaks" rise out of the static.
//      Click each peak as it crosses the centre to receive a fragment
//      of the original owner's memory. Quality scales how vivid the
//      narrated flashback is.
//
//   3. HOLD YOUR BREATH — Crimson Butterfly / Maiden of Black Water.
//      Triggered automatically when you enter a room that already
//      contains a real entity and the house tension is ≥ 2. A small
//      overlay appears: press-and-hold to stay still. Release inside
//      the GREEN BAND once the presence has passed. Released too early
//      = you flinched and were noticed; held too long = composure
//      crash. Skipping the prompt is allowed but costs aggression.
//
// All three hook in non-invasively via window-wraps. Load AFTER
// extras.js so that the global helpers (narrate, runSkillCheck, el,
// bumpAggression, drainComposure, audio, advanceTime, logEvidence,
// showMilestone, ENTITIES, ROOMS) are guaranteed to exist.
"use strict";

(function () {

// ─────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────

function ensureState() {
  if (!state._ff)             state._ff = {};
  if (!state._ff.psychDone)   state._ff.psychDone = {};   // per object id
  if (!state._ff.daguerreo)   state._ff.daguerreo = [];   // captured plate index in state.photos
  if (typeof state._ff.breathTriggers !== "number") state._ff.breathTriggers = 0;
}

function safeNarrate(html) {
  try { if (typeof narrate === "function") narrate(html); } catch (e) {}
}
function safeLog(cat, txt) {
  try { if (typeof logEvidence === "function") logEvidence(cat, txt); } catch (e) {}
}
function safeSfx(name) {
  try { if (typeof audio !== "undefined" && audio.sfx) audio.sfx(name); } catch (e) {}
}
function safeBumpAgg(n, why) {
  try { if (typeof bumpAggression === "function") bumpAggression(n, why); } catch (e) {}
}
function safeDrain(n, why) {
  try { if (typeof drainComposure === "function") drainComposure(n, why); } catch (e) {}
}
function safeBumpComp(n, why) {
  try { if (typeof bumpComposure === "function") bumpComposure(n, why); } catch (e) {}
}

function entityInRoom(roomId) {
  if (typeof ENTITIES !== "object" || !ENTITIES) return null;
  const truth = state.truth;
  for (const [id, e] of Object.entries(ENTITIES)) {
    if (!e || !e.realInStates || !e.realInStates.includes(truth)) continue;
    if (e.room === roomId) return { id, e };
  }
  return null;
}

function clampN(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// ─────────────────────────────────────────────────────────────────────
// 1. THE DAGUERREOTYPE PLATE  (Fatal Frame · Camera Obscura)
// ─────────────────────────────────────────────────────────────────────
//
// A guided minigame inside the Film Camera tool. Replaces the simple
// "Take photograph" snap with an aim-and-charge round whose result
// determines the photo's anomaly quality.

function runDaguerreotype() {
  return new Promise(resolve => {
    const roomId = state.currentRoom;
    const roomName = (typeof ROOMS !== "undefined" && ROOMS[roomId] && ROOMS[roomId].name) || roomId;
    const roomArt = (typeof roomSvg === "function") ? roomSvg(roomId) : "";
    const ent = entityInRoom(roomId);

    const root = document.createElement("div");
    root.className = "sk-overlay ff-overlay";
    root.innerHTML = `
      <div class="sk-panel ff-panel">
        <div class="sk-title">THE DAGUERREOTYPE · LONG EXPOSURE</div>
        <div class="sk-sub">
          <strong>How to play:</strong> move the mouse to aim the reticle.
          When the reticle is over the wandering <em>spectral mark</em>,
          the <strong>PLATE</strong> charges. Click <strong>EXPOSE</strong>
          to commit. The longer you wait, the better the plate —
          but <strong>DREAD</strong> rises. If DREAD fills, the entity
          closes the distance and the plate is ruined.
        </div>
        <div class="ff-dag-stage" id="ff-dag-stage">
          <div class="ff-dag-art">${roomArt}</div>
          <div class="ff-dag-vignette"></div>
          <div class="ff-dag-mark" id="ff-dag-mark"></div>
          <div class="ff-dag-reticle" id="ff-dag-reticle">
            <span></span><span></span><span></span><span></span>
            <div class="ff-dag-cross"></div>
          </div>
          <div class="ff-dag-label">${roomName.toUpperCase()} · PLATE I · ƒ/2.8</div>
        </div>
        <div class="ff-dag-meters">
          <div class="ff-dag-meter">
            <span class="ff-dag-mlabel">PLATE</span>
            <div class="ff-dag-mbar"><div class="ff-dag-mfill plate" id="ff-dag-plate"></div></div>
          </div>
          <div class="ff-dag-meter">
            <span class="ff-dag-mlabel">DREAD</span>
            <div class="ff-dag-mbar"><div class="ff-dag-mfill dread" id="ff-dag-dread"></div></div>
          </div>
        </div>
        <div class="sk-actions ff-dag-actions">
          <button type="button" id="ff-dag-expose" class="ff-dag-expose">EXPOSE PLATE</button>
          <button type="button" id="ff-dag-cancel">Lower the camera</button>
        </div>
      </div>`;
    document.body.appendChild(root);

    const stage    = root.querySelector("#ff-dag-stage");
    const mark     = root.querySelector("#ff-dag-mark");
    const reticle  = root.querySelector("#ff-dag-reticle");
    const plateBar = root.querySelector("#ff-dag-plate");
    const dreadBar = root.querySelector("#ff-dag-dread");
    const expose   = root.querySelector("#ff-dag-expose");
    const cancel   = root.querySelector("#ff-dag-cancel");

    let stageW = 0, stageH = 0;
    function resize() {
      const r = stage.getBoundingClientRect();
      stageW = r.width; stageH = r.height;
    }
    resize();
    window.addEventListener("resize", resize);

    // Spectral mark drifts via smooth random-walk
    let mx = stageW * 0.5, my = stageH * 0.5;
    let mvx = 60, mvy = 40;
    // Reticle follows mouse, smoothed
    let rx = stageW * 0.5, ry = stageH * 0.5;
    let mouseX = stageW * 0.5, mouseY = stageH * 0.5;

    stage.addEventListener("mousemove", e => {
      const r = stage.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });
    stage.addEventListener("touchmove", e => {
      if (!e.touches[0]) return;
      const r = stage.getBoundingClientRect();
      mouseX = e.touches[0].clientX - r.left;
      mouseY = e.touches[0].clientY - r.top;
      e.preventDefault();
    }, { passive: false });

    let plate = 0;       // 0..1
    let dread = 0;       // 0..1
    let finished = false;
    let last = performance.now();
    let raf;

    function step(t) {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      // Drift the spectral mark
      if (Math.random() < 0.04) {
        mvx = (Math.random() * 140 + 30) * (Math.random() < 0.5 ? -1 : 1);
        mvy = (Math.random() * 100 + 20) * (Math.random() < 0.5 ? -1 : 1);
      }
      mx += mvx * dt;
      my += mvy * dt;
      if (mx < 30)         { mx = 30;         mvx = Math.abs(mvx); }
      if (mx > stageW - 30){ mx = stageW - 30;mvx = -Math.abs(mvx); }
      if (my < 30)         { my = 30;         mvy = Math.abs(mvy); }
      if (my > stageH - 30){ my = stageH - 30;mvy = -Math.abs(mvy); }
      mark.style.left = mx + "px";
      mark.style.top  = my + "px";

      // Smooth reticle toward mouse (lens lag — gives the gameplay weight)
      rx += (mouseX - rx) * 0.18;
      ry += (mouseY - ry) * 0.18;
      reticle.style.left = rx + "px";
      reticle.style.top  = ry + "px";

      // Distance to mark
      const dx = rx - mx, dy = ry - my;
      const d  = Math.sqrt(dx*dx + dy*dy);
      const onTarget = d < 46;

      if (onTarget) {
        plate += dt * 0.42;     // ~2.4s for a full plate when held perfectly
        reticle.classList.add("locked");
      } else {
        plate -= dt * 0.18;     // drains when off
        reticle.classList.remove("locked");
      }
      plate = clampN(plate, 0, 1);

      // Dread rises always, faster when on-target (the thing notices the lens)
      dread += dt * (onTarget ? 0.16 : 0.10);
      dread = clampN(dread, 0, 1);

      plateBar.style.width = (plate * 100) + "%";
      dreadBar.style.width = (dread * 100) + "%";

      if (dread >= 1 && !finished) {
        end(0, /*scared=*/true);
        return;
      }
      if (!finished) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    function end(rawScore, scared) {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      const score = clampN(rawScore, 0, 1);
      const grade = scared ? "RUINED" : score >= 0.85 ? "FATAL FRAME" : score >= 0.55 ? "CLEAR" : score >= 0.25 ? "DIM" : "BLURRED";
      const cls   = scared ? "sk-r-miss" : score >= 0.85 ? "sk-r-great" : score >= 0.55 ? "sk-r-great" : score >= 0.25 ? "sk-r-ok" : "sk-r-miss";
      const result = document.createElement("div");
      result.className = "sk-result";
      result.innerHTML = `<span class="${cls}">${grade}</span>`;
      root.querySelector(".ff-dag-actions").style.display = "none";
      root.querySelector(".ff-panel").appendChild(result);
      safeSfx(scared ? "tense" : "chime");
      setTimeout(() => {
        root.style.transition = "opacity .28s";
        root.style.opacity = "0";
        setTimeout(() => { root.remove(); resolve({ score, scared, fatal: !scared && score >= 0.85, entityHere: !!ent }); }, 280);
      }, 800);
    }

    expose.addEventListener("click", () => end(plate, false));
    cancel.addEventListener("click", () => end(0, false));

    // Hard cap — 14 seconds
    setTimeout(() => { if (!finished) end(plate, false); }, 14000);
  });
}

// Wrap toolCamera to add a second device-action button for the
// long-exposure path. Cheap and non-invasive.
(function patchCamera() {
  if (typeof window.toolCamera !== "function") return;
  const orig = window.toolCamera;
  window.toolCamera = function () {
    try { orig.apply(this, arguments); } catch (e) { console.warn("toolCamera failed:", e); return; }
    try {
      const actions = document.querySelector("#tool-body .device .device-actions");
      if (!actions) return;
      if (actions.querySelector(".ff-dag-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ff-dag-btn";
      btn.textContent = "✦ Long-exposure plate";
      btn.title = "A 19th-century daguerreotype: aim, hold, and expose at the peak. Slower, riskier — but able to catch what film cannot.";
      btn.onclick = () => window._daguerreotypeStart();
      actions.appendChild(btn);
    } catch (e) { console.warn("daguerreotype button inject failed:", e); }
  };
})();

window._daguerreotypeStart = async function () {
  ensureState();
  const roomId = state.currentRoom;
  const roomName = (ROOMS[roomId] && ROOMS[roomId].name) || roomId;
  // Time cost up-front — a long exposure takes minutes
  if (typeof advanceTime === "function") advanceTime(3);
  const out = await runDaguerreotype();
  // Score / outcome → photo entry
  if (out.scored === false || out.score === 0 && out.scared) {
    safeNarrate("<em>The plate is ruined. Something stepped into the frame just as you exposed it, and you flinched.</em>");
    safeDrain(14, "the plate was ruined");
    safeBumpAgg(2, "you tried to photograph what didn't want photographing");
    return;
  }

  // Determine anomaly with a heavy bias on the score
  let anomaly = null;
  const truth = state.truth;
  const realHere = entityInRoom(roomId);

  if (out.fatal) {
    // FATAL FRAME — captures a figure even on debunked runs (the killer feature)
    if (realHere) {
      anomaly = { type: "figure", entityId: realHere.id };
    } else if (truth === "debunked") {
      // The "wasn't there" twist — daguerreotypes pick up history, not just now
      const ids = Object.keys(ENTITIES || {});
      anomaly = ids.length ? { type: "figure", entityId: ids[Math.floor(Math.random() * ids.length)], echo: true } : { type: "mist", seed: Math.random() };
    } else {
      // haunted/partial without an entity right here — pull whichever entity is real this run
      const realIds = Object.entries(ENTITIES || {}).filter(([k, e]) => e.realInStates && e.realInStates.includes(truth)).map(([k]) => k);
      anomaly = realIds.length ? { type: "figure", entityId: realIds[Math.floor(Math.random() * realIds.length)], echo: true } : { type: "mist", seed: Math.random() };
    }
  } else if (out.score >= 0.55) {
    if (realHere && Math.random() < 0.55) anomaly = { type: "figure", entityId: realHere.id };
    else anomaly = { type: ["orb", "smudge", "mist"][Math.floor(Math.random() * 3)], seed: Math.random() };
  } else if (out.score >= 0.25) {
    anomaly = Math.random() < 0.5 ? { type: "mist", seed: Math.random() } : null;
  } else {
    anomaly = null;
  }

  const photo = {
    roomId,
    when: (typeof formatTime === "function") ? formatTime() : "",
    timeMinutes: state.timeMinutes,
    anomaly,
    reviewed: false,
    decision: null,
    daguerreotype: true,
    quality: out.score,
    fatalFrame: out.fatal
  };
  state.photos = state.photos || [];
  state.photos.push(photo);
  state._ff.daguerreo.push(state.photos.length - 1);

  if (typeof bumpToolUse === "function") bumpToolUse("camera");
  safeSfx("chime");

  if (out.fatal) {
    safeNarrate("<em>The silver iodide drinks the light. In the developed plate is a shape your lens did not see.</em>");
    safeBumpAgg(2, "the lens caught it looking back");
    safeLog("Photo", `<em>FATAL FRAME</em> daguerreotype #${state.photos.length} in ${roomName}. The plate caught something the film could not.`);
    if (typeof showMilestone === "function") {
      showMilestone("✦ FATAL FRAME ✦", "<em>A perfect plate. Develop it in the Gallery to see what the silver remembered.</em>");
    }
    if (typeof unlockAchievement === "function") unlockAchievement("fatal_frame");
  } else if (out.score >= 0.55) {
    safeNarrate("<em>A clear plate. The silver remembers the room better than your eyes did.</em>");
    safeLog("Photo", `Daguerreotype #${state.photos.length} in ${roomName} (clear plate, develop in Gallery).`);
    safeDrain(6, null);
  } else {
    safeNarrate("<em>The plate is faint. The light was wrong, or perhaps you were.</em>");
    safeLog("Photo", `Daguerreotype #${state.photos.length} in ${roomName} (dim plate).`);
    safeDrain(8, null);
  }
};

// ─────────────────────────────────────────────────────────────────────
// 2. PSYCHOMETRY (TOUCH READING)
// ─────────────────────────────────────────────────────────────────────
//
// Three "impression peaks" rise and fall in three lanes. The player
// clicks each lane when its glow is centred over the read-line. Each
// successful peak unlocks one memory fragment.

const PSYCH_OBJECTS = {
  // Ashgrove ─────
  ash_doll: {
    chapter: "ashgrove",
    room: "nursery",
    label: "Evelyn's rag doll",
    flavor: "The doll has only one eye now. The other was a glass bead, lost.",
    fragments: [
      "<em>A child's voice, very soft: <strong>\"Don't tell mother. She'll be cross.\"</strong></em>",
      "<em>You feel small hands fitting a button into the doll's chest where a heart should go.</em>",
      "<em>A man's voice — Calder? — older, in a different room: <strong>\"It was an accident, Eliza. It was an accident.\"</strong></em>"
    ]
  },
  ash_locket: {
    chapter: "ashgrove",
    room: "parlor",
    label: "The unfastened locket",
    flavor: "Silver, tarnished at the hinges. A clasp that has been opened, recently, by someone who knew the trick of it.",
    fragments: [
      "<em>A young woman's voice: <strong>\"He cannot know I kept this. He cannot know.\"</strong></em>",
      "<em>The feeling of a wedding band, slipped off, and placed inside.</em>",
      "<em>A child, weeping in another room, and a decision being made not to go to her.</em>"
    ]
  },
  ash_inkwell: {
    chapter: "ashgrove",
    room: "library",
    label: "Calder's inkwell",
    flavor: "The ink inside is dry but the glass is cold. Far colder than the room.",
    fragments: [
      "<em>The scratch of a nib, very fast, then stopped. Then very fast again.</em>",
      "<em>A man's voice, near tears: <strong>\"I will not write what they want me to write. I will not.\"</strong></em>",
      "<em>The smell of burning paper.</em>"
    ]
  },
  ash_watch: {
    chapter: "ashgrove",
    room: "study",
    label: "The pocket-watch on the desk",
    flavor: "Stopped, of course, at 3:14. Its glass is faintly fogged from the inside.",
    fragments: [
      "<em>A heartbeat, slowing.</em>",
      "<em>A woman's voice — not Eliza's — saying: <strong>\"She wasn't the only one, you know.\"</strong></em>",
      "<em>The cold clarity of a decision made too late to undo.</em>"
    ]
  },
  // Wyndmere ─────
  wm_ribbon: {
    chapter: "wyndmere",
    room: "wm_chapel",
    label: "A blue ribbon, knotted on a pew",
    flavor: "Damp. It has been here a long time, but does not smell of mildew.",
    fragments: [
      "<em>A girl's voice, laughing: <strong>\"You'll never catch me!\"</strong></em>",
      "<em>The feeling of running on stones, barefoot, in summer.</em>",
      "<em>The same girl, much later, very still: <strong>\"They said don't go to the lake.\"</strong></em>"
    ]
  },
  wm_oar: {
    chapter: "wyndmere",
    room: "wm_boathouse",
    label: "An oar with a carved initial",
    flavor: "Heavier than it should be. Someone carved a single letter into the handle and then sanded it half-away.",
    fragments: [
      "<em>The lap of water against wood.</em>",
      "<em>A man muttering: <strong>\"It will look like she fell. It will look like she fell.\"</strong></em>",
      "<em>A long silence, and then a name — not yours — being called from the shore.</em>"
    ]
  }
};

function runPsychometry(obj) {
  return new Promise(resolve => {
    const root = document.createElement("div");
    root.className = "sk-overlay ff-overlay";
    root.innerHTML = `
      <div class="sk-panel ff-panel ff-psych-panel">
        <div class="sk-title">PSYCHOMETRY · ${obj.label.toUpperCase()}</div>
        <div class="sk-sub">
          <strong>How to play:</strong> three lanes carry memory <em>impressions</em>.
          Each lane's glow rises and falls. <strong>Click a lane</strong> when its
          peak is centred over the white read-line to receive one fragment.
          You have three chances, one per lane.
        </div>
        <div class="ff-psych-stage">
          <div class="ff-psych-lane" data-lane="0">
            <div class="ff-psych-glow"></div>
            <div class="ff-psych-line"></div>
            <div class="ff-psych-lock">·</div>
          </div>
          <div class="ff-psych-lane" data-lane="1">
            <div class="ff-psych-glow"></div>
            <div class="ff-psych-line"></div>
            <div class="ff-psych-lock">·</div>
          </div>
          <div class="ff-psych-lane" data-lane="2">
            <div class="ff-psych-glow"></div>
            <div class="ff-psych-line"></div>
            <div class="ff-psych-lock">·</div>
          </div>
        </div>
        <div class="ff-psych-readout" id="ff-psych-readout">
          <em class="ff-psych-flavor">${obj.flavor}</em>
        </div>
        <div class="sk-actions">
          <button type="button" id="ff-psych-done">Let go</button>
        </div>
      </div>`;
    document.body.appendChild(root);

    const lanes = Array.from(root.querySelectorAll(".ff-psych-lane"));
    const readout = root.querySelector("#ff-psych-readout");
    const doneBtn = root.querySelector("#ff-psych-done");

    // Each lane has an oscillating "intensity" 0..1 with its own phase
    const laneState = lanes.map((lane, i) => ({
      lane,
      glow: lane.querySelector(".ff-psych-glow"),
      lock: lane.querySelector(".ff-psych-lock"),
      phase: Math.random() * Math.PI * 2,
      speed: 0.9 + Math.random() * 0.7,
      taken: false,
      score: 0
    }));

    let finished = false;
    let last = performance.now();
    let raf;

    function step(t) {
      const dt = (t - last) / 1000; last = t;
      laneState.forEach(s => {
        s.phase += s.speed * dt;
        const v = (Math.sin(s.phase) + 1) * 0.5;     // 0..1
        s.glow.style.opacity = (0.18 + v * 0.82).toFixed(3);
        s.glow.style.transform = `scale(${0.7 + v * 0.5})`;
        s.current = v;
      });
      if (!finished) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    function takeLane(i) {
      const s = laneState[i];
      if (s.taken || finished) return;
      s.taken = true;
      const v = s.current || 0;
      // Score: how close to a peak (v ≈ 1)
      const score = v;
      s.score = score;
      s.lane.classList.add(score >= 0.78 ? "hit-great" : score >= 0.45 ? "hit-ok" : "hit-miss");
      s.lock.textContent = score >= 0.78 ? "✓" : score >= 0.45 ? "•" : "×";
      // Reveal fragment — clarity scales with score
      const fragmentHtml = obj.fragments[i] || "";
      const wrap = document.createElement("div");
      wrap.className = "ff-psych-fragment " + (score >= 0.78 ? "f-great" : score >= 0.45 ? "f-ok" : "f-miss");
      if (score >= 0.45) {
        wrap.innerHTML = fragmentHtml;
      } else {
        // Faint / partial — strip half the words to render as half-heard
        const stripped = fragmentHtml.replace(/<[^>]+>/g, "").split(" ");
        const masked = stripped.map(w => Math.random() < 0.55 ? "…" : w).join(" ");
        wrap.innerHTML = `<em style="opacity:.65">${masked}</em>`;
      }
      readout.appendChild(wrap);
      // If all lanes done → wrap
      if (laneState.every(x => x.taken)) {
        setTimeout(() => end(), 1200);
      }
    }

    laneState.forEach((s, i) => {
      s.lane.addEventListener("click", () => takeLane(i));
    });
    doneBtn.addEventListener("click", () => end());

    function end() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      const avg = laneState.reduce((a, s) => a + (s.taken ? s.score : 0), 0) / 3;
      setTimeout(() => {
        root.style.transition = "opacity .28s";
        root.style.opacity = "0";
        setTimeout(() => { root.remove(); resolve({ score: avg, lanes: laneState.map(s => s.score) }); }, 280);
      }, 600);
    }

    // Hard cap — psychometry is slow but not infinite
    setTimeout(() => { if (!finished) end(); }, 22000);
  });
}

window._psychTouch = async function (objId) {
  ensureState();
  const obj = PSYCH_OBJECTS[objId];
  if (!obj) return;
  if (state._ff.psychDone[objId]) {
    safeNarrate("<em>You have already touched this. Some things should not be asked twice.</em>");
    return;
  }
  state._ff.psychDone[objId] = true;
  safeNarrate(`<em>You take it up. ${obj.flavor}</em>`);
  if (typeof advanceTime === "function") advanceTime(2);
  const out = await runPsychometry(obj);
  // Cost scales mildly with how much you saw — bearing witness is the price
  const cost = Math.round(4 + out.score * 8);
  safeDrain(cost, "you stood inside someone else's last memory");
  // Reveal narrative summary into the main log
  const tone = out.score >= 0.7 ? "clearly" : out.score >= 0.4 ? "in pieces" : "faintly";
  safeLog("Psychometry", `Touched <em>${obj.label}</em>. Memory came ${tone}.`);
  // Slight clue-bias: at high score, mark the entity tied to this object as "seen"
  if (out.score >= 0.7 && obj.tiedEntityId) {
    state.entitiesSeen = state.entitiesSeen || new Set();
    state.entitiesSeen.add(obj.tiedEntityId);
  }
  if (out.score >= 0.78) {
    if (typeof unlockAchievement === "function") unlockAchievement("psychometer");
  }
  safeSfx("chime");
  if (typeof renderRoom === "function") renderRoom();
};

// Inject psychometry hotspots into rooms (re-render-safe)
function addPsychHotspots() {
  try {
    const chapter = (state._story === "wyndmere") ? "wyndmere" : "ashgrove";
    if (!state.calderLeft) return;
    const slots = document.getElementById("scene-hotspots");
    if (!slots) return;
    const roomId = state.currentRoom;
    Object.entries(PSYCH_OBJECTS).forEach(([id, obj]) => {
      if (obj.chapter !== chapter) return;
      if (obj.room !== roomId) return;
      const existingId = "ff-psych-hot-" + id;
      if (document.getElementById(existingId)) return;
      const used = !!(state._ff && state._ff.psychDone && state._ff.psychDone[id]);
      const btn = document.createElement("button");
      btn.id = existingId;
      btn.type = "button";
      btn.className = "hotspot-btn ff-psych-hotspot" + (used ? " ff-psych-used" : "");
      btn.textContent = used ? "· Touched: " + obj.label : "✦ Touch " + obj.label;
      btn.disabled = used;
      btn.onclick = () => window._psychTouch(id);
      slots.appendChild(btn);
    });
  } catch (e) { console.warn("addPsychHotspots failed:", e); }
}

// ─────────────────────────────────────────────────────────────────────
// 3. HOLD YOUR BREATH
// ─────────────────────────────────────────────────────────────────────
//
// Triggered when you enter a room that already contains a real entity
// and tension is ≥ 2. A small panel slides in: press-and-hold to be
// still. After a randomised "presence pass" delay, a GREEN BAND opens
// for ~1 second — release inside it for a clean evasion.

function runBreathHold() {
  return new Promise(resolve => {
    const root = document.createElement("div");
    root.className = "ff-breath";
    root.innerHTML = `
      <div class="ff-breath-panel">
        <div class="ff-breath-title">BE STILL</div>
        <div class="ff-breath-sub">Something is in the room with you. <strong>Press and hold</strong> the panel — release when the band turns <span class="ff-breath-cue">GREEN</span>.</div>
        <div class="ff-breath-bar">
          <div class="ff-breath-track">
            <div class="ff-breath-band" id="ff-breath-band"></div>
            <div class="ff-breath-needle" id="ff-breath-needle"></div>
          </div>
        </div>
        <div class="ff-breath-hold" id="ff-breath-hold">
          <span id="ff-breath-state">HOLD</span>
        </div>
        <button type="button" class="ff-breath-skip" id="ff-breath-skip">Run for it (cost: aggression)</button>
      </div>`;
    document.body.appendChild(root);

    // Critical interactive moment: cancel any ongoing narration TTS so the
    // player can react immediately instead of listening to room prose.
    try { if (typeof tts !== "undefined" && tts.stop) tts.stop(); } catch (e) {}

    const band   = root.querySelector("#ff-breath-band");
    const needle = root.querySelector("#ff-breath-needle");
    const hold   = root.querySelector("#ff-breath-hold");
    const stateLbl = root.querySelector("#ff-breath-state");
    const skip   = root.querySelector("#ff-breath-skip");

    const TOTAL_MS = 7500;
    const passStart = 3500 + Math.floor(Math.random() * 1800); // band opens here
    const passEnd   = passStart + 1100;                         // band closes here
    band.style.left  = (passStart / TOTAL_MS * 100) + "%";
    band.style.width = ((passEnd - passStart) / TOTAL_MS * 100) + "%";

    let holding = false;
    let releasedAt = null;
    let finished = false;
    let start = null;
    let raf;
    let hardCapTimer = null;

    function armHardCap() {
      // Only arm once the player engages, so TTS narration / reading time
      // does not auto-fail the minigame before they touch anything.
      if (hardCapTimer) return;
      hardCapTimer = setTimeout(() => {
        if (!finished) {
          releasedAt = releasedAt == null ? TOTAL_MS + 1000 : releasedAt;
          end();
        }
      }, TOTAL_MS + 6000);
    }

    function startHold() {
      if (finished || holding) return;
      holding = true;
      hold.classList.add("active");
      stateLbl.textContent = "STILL";
      start = performance.now();
      armHardCap();
      tick(start);
    }
    function stopHold() {
      if (finished || !holding) return;
      holding = false;
      hold.classList.remove("active");
      releasedAt = performance.now() - start;
      end();
    }
    function tick(t) {
      if (!holding || finished) return;
      const elapsed = t - start;
      const pct = Math.min(1, elapsed / TOTAL_MS);
      needle.style.left = (pct * 100) + "%";
      // Auto-fail if held past total
      if (elapsed >= TOTAL_MS) {
        releasedAt = TOTAL_MS + 1000;
        end();
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    hold.addEventListener("mousedown", startHold);
    hold.addEventListener("touchstart", e => { e.preventDefault(); startHold(); }, { passive: false });
    document.addEventListener("mouseup", stopHold);
    document.addEventListener("touchend", stopHold);
    skip.addEventListener("click", () => {
      finished = true;
      cancelAnimationFrame(raf);
      if (hardCapTimer) { clearTimeout(hardCapTimer); hardCapTimer = null; }
      document.removeEventListener("mouseup", stopHold);
      document.removeEventListener("touchend", stopHold);
      root.style.transition = "opacity .2s";
      root.style.opacity = "0";
      setTimeout(() => { root.remove(); resolve({ outcome: "fled" }); }, 220);
    });

    function end() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      if (hardCapTimer) { clearTimeout(hardCapTimer); hardCapTimer = null; }
      document.removeEventListener("mouseup", stopHold);
      document.removeEventListener("touchend", stopHold);
      let outcome;
      if (releasedAt == null) outcome = "fled";
      else if (releasedAt < passStart) outcome = "early";
      else if (releasedAt <= passEnd)  outcome = "clean";
      else outcome = "late";
      hold.classList.add("done-" + outcome);
      stateLbl.textContent = outcome === "clean" ? "PASSED" : outcome === "early" ? "FLINCHED" : outcome === "late" ? "TOO LATE" : "RAN";
      setTimeout(() => {
        root.style.transition = "opacity .25s";
        root.style.opacity = "0";
        setTimeout(() => { root.remove(); resolve({ outcome }); }, 260);
      }, 750);
    }

    // No global hard cap timer — it now only arms after first interaction
    // (see armHardCap inside startHold). Players can read the prompt and
    // listen to narration without auto-failing the minigame.
  });
}

async function maybeBreathHold() {
  try {
    ensureState();
    if (!state.calderLeft) return;
    const tension = parseInt(document.body.dataset.tension || "0", 10);
    if (tension < 2) return;
    const here = entityInRoom(state.currentRoom);
    if (!here) return;
    // Throttle: at most once per ~3 transitions per chapter
    if (state._ff._lastBreathTurn && (state._ff._lastBreathTurn === state.timeMinutes)) return;
    if (Math.random() > 0.55) return;       // probabilistic so it doesn't fire every entry
    state._ff._lastBreathTurn = state.timeMinutes;
    state._ff.breathTriggers += 1;

    safeNarrate("<em>The air changes. Something is already here.</em>");
    safeSfx("breath");
    const out = await runBreathHold();
    if (out.outcome === "clean") {
      safeNarrate("<em>It passes within an arm's length. You did not move. It moves on.</em>");
      safeBumpComp(8, "you stayed perfectly still");
      if (typeof unlockAchievement === "function") unlockAchievement("held_breath");
    } else if (out.outcome === "early") {
      safeNarrate("<em>You flinched a half-second too soon. Whatever is in here turns — toward you.</em>");
      safeBumpAgg(2, "you flinched");
      safeDrain(10, "you flinched");
    } else if (out.outcome === "late") {
      safeNarrate("<em>You held too long. Your lungs burn, your vision swims; the room tilts and you have to grip the wall.</em>");
      safeDrain(16, "you held your breath too long");
    } else {
      safeNarrate("<em>You back out of the room before it can finish looking at you.</em>");
      safeBumpAgg(1, "you bolted");
      safeDrain(4, "you bolted");
    }
  } catch (e) { console.warn("maybeBreathHold failed:", e); }
}

// Wrap onRoomEnter — runs on every successful travel
(function patchRoomEnter() {
  if (typeof window.onRoomEnter !== "function") {
    // onRoomEnter is referenced from danger.js; the function name is global-scoped.
    // Wait for it to bind via the existing wrap chain.
    return;
  }
})();

// Because onRoomEnter is declared with `function` in danger.js (not on window),
// it isn't easily wrappable. Instead, hook the room-render path.
(function patchRender() {
  if (typeof window.renderRoom !== "function") return;
  const orig = window.renderRoom;
  let lastRoom = null;
  window.renderRoom = function () {
    try { orig.apply(this, arguments); } catch (e) { console.warn(e); return; }
    try {
      addPsychHotspots();
      if (state.currentRoom !== lastRoom) {
        lastRoom = state.currentRoom;
        // Defer slightly so the room narration renders first
        setTimeout(() => maybeBreathHold(), 600);
      }
    } catch (e) { console.warn("fatalframe render-wrap failed:", e); }
  };
})();

// ─────────────────────────────────────────────────────────────────────
// Expose globals (for inline onclicks & debugging)
// ─────────────────────────────────────────────────────────────────────
window._daguerreotypeRun = runDaguerreotype;
window._psychometryRun   = runPsychometry;
window._breathHoldRun    = runBreathHold;

console.log("[fatalframe] loaded — daguerreotype + psychometry + breath-hold active.");

})();
