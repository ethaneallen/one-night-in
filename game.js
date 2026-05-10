// One Night In… — shared game engine (current story: Ashgrove House)
"use strict";

const TOOLS = [
  { id: "kii",     name: "K-II Meter",       short: "K-II",    key: "kii" },
  { id: "spirit",  name: "Spirit Box",       short: "Spirit Box",  key: "spirit" },
  { id: "ovilus",  name: "Ovilus",           short: "Ovilus",  key: "ovilus" },
  { id: "sls",     name: "SLS Camera",       short: "SLS",     key: "sls" },
  { id: "evp",     name: "EVP Recorder",     short: "EVP",     key: "evp" },
  { id: "thermal", name: "Thermal Camera",   short: "Thermal", key: "thermal" },
  { id: "empump",  name: "EM Pump",          short: "EM Pump", key: "empump" },
  { id: "rempod",  name: "REM Pod",          short: "REM Pod", key: "rempod" },
  { id: "camera",  name: "Film Camera",      short: "Camera",  key: "camera" }
];

const state = {
  truth: null,           // "haunted" | "partial" | "debunked"
  currentRoom: "drive",
  timeMinutes: 19 * 60,  // 7:00 PM in minutes since midnight
  evidence: [],
  calderCaught: [],
  calderLeft: false,
  aggression: 0,
  docsRead: new Set(),
  entitiesSeen: new Set(),
  portraitFirstShot: null,
  evpPlacements: {},     // room -> minutes placed
  empumpRoom: null,
  endDialog: null,
  toolUses: {            // count of meaningful uses per tool this run
    kii: 0, spirit: 0, ovilus: 0, sls: 0, evp: 0, thermal: 0, empump: 0, knock: 0, rempod: 0, camera: 0
  },
  rempods: {},           // roomId -> { triggeredAt: minutes|null, triggerCount: n }
  photos: []             // [{ roomId, when, hasFigure, entityId|null }]
};
function bumpToolUse(k) { state.toolUses[k] = (state.toolUses[k] || 0) + 1; }

// === TIME ===
// Each interactive action advances time. Sunrise at 5:30 AM.
const SUNRISE = 5 * 60 + 30 + 24 * 60; // 5:30 AM next day in minutes from midnight
function advanceTime(mins) {
  state.timeMinutes += mins;
  if (state.timeMinutes >= SUNRISE && state.calderLeft && !state.endDialog) {
    state.endDialog = true;
    showVerdict();
  }
  renderHud();
  if (typeof checkStaleRoom === "function") checkStaleRoom();
  if (typeof renderDanger === "function") renderDanger();
  if (typeof checkChapterCard === "function") checkChapterCard();
  if (typeof scareTick === "function") scareTick();
  // Auto-save once per in-game hour after Calder leaves (quiet, no narration)
  if (state.calderLeft && typeof saveGame === "function") {
    const lastAuto = state._lastAutoSave || 0;
    if (state.timeMinutes - lastAuto >= 60) {
      state._lastAutoSave = state.timeMinutes;
      try {
        localStorage.setItem("ashgrove_save", serializeState());
      } catch (e) { /* ignore, quota etc */ }
    }
  }
  // REM Pod ticker — each placed pod may trigger based on what's in its room.
  if (state.calderLeft && state.rempods) {
    for (const roomId in state.rempods) {
      const pod = state.rempods[roomId];
      // Don't trigger the same pod more than once per 8 in-game minutes
      if (pod.triggeredAt !== null && state.timeMinutes - pod.triggeredAt < 8) continue;
      // Check entities in that room for this run's truth
      const entitiesInRoom = Object.values(ENTITIES).filter(e =>
        e.realInStates.includes(state.truth) && e.room === roomId
      );
      let chance = 0;
      let cause = "";
      if (state.truth === "haunted" && entitiesInRoom.length > 0) {
        chance = 0.45;
        cause = "entity";
      } else if (state.truth === "partial" && entitiesInRoom.length > 0) {
        chance = 0.15;
        cause = "entity";
      } else {
        // Debunked / no real entity: occasional drafts, mice, pipes
        const envProne = ["kitchen", "conservatory", "wine_cellar", "master"].includes(roomId);
        chance = envProne ? 0.08 : 0.03;
        cause = "env";
      }
      if (Math.random() < chance) {
        pod.triggeredAt = state.timeMinutes;
        pod.triggerCount = (pod.triggerCount || 0) + 1;
        const roomName = ROOMS[roomId]?.name || roomId;
        audio.sfx("kii_alarm");
        if (cause === "entity") {
          narrate(`<em>[Your REM Pod in the ${roomName} is sounding — something entered its field.]</em>`);
          logEvidence("REM Pod", `Proximity trigger in ${roomName} — something passed close to the pod.`);
          showMilestone(`REM POD · ${roomName}`, `<em>Something crossed the pod's field. The alarm is sounding.</em>`);
          entitiesInRoom.forEach(e => {
            const id = Object.keys(ENTITIES).find(k => ENTITIES[k] === e);
            if (id) state.entitiesSeen.add(id);
          });
        } else {
          narrate(`<em>[Your REM Pod in the ${roomName} sounded — briefly. A draft, most likely. Or a mouse.]</em>`);
          logEvidence("REM Pod", `Trigger in ${roomName} — likely environmental (draft, plumbing, or small animal).`);
          showMilestone(`REM POD · ${roomName}`, `<em>A brief trigger. Draft or small animal, most likely.</em>`);
        }
      }
    }
  }
  // EVP ready-narration: fires once per recorder when its 5 minutes elapse.
  if (state.calderLeft && state.evpPlacements) {
    if (!state._evpReadyNotified) state._evpReadyNotified = {};
    for (const roomId in state.evpPlacements) {
      const elapsed = state.timeMinutes - state.evpPlacements[roomId];
      if (elapsed >= 5 && !state._evpReadyNotified[roomId]) {
        state._evpReadyNotified[roomId] = true;
        const roomName = ROOMS[roomId]?.name || roomId;
        if (roomId === state.currentRoom) {
          narrate(`<em>[Your EVP recorder here has captured its five minutes. Open the recorder to review.]</em>`);
        } else {
          narrate(`<em>[Your EVP recorder in the ${roomName} is ready for review. Return to play it back.]</em>`);
        }
        // Visible toast — persists until player acts
        showMilestone(`EVP READY · ${roomName}`, `<em>Your recorder has captured its five minutes. Return to the ${roomName} and review.</em>`);
      }
    }
  }
}
function formatTime() {
  let m = state.timeMinutes % (24 * 60);
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h24 >= 12 && h24 < 24 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

// === NARRATION ===
function narrate(text) {
  const n = document.getElementById("narration");
  const p = document.createElement("p");
  p.innerHTML = String(text).replace(/&/g, "&amp;").replace(/<(?!\/?em\b)/g, "&lt;");
  n.appendChild(p);
  n.scrollTop = n.scrollHeight;
  while (n.children.length > 6) n.removeChild(n.firstChild);
  if (typeof tts !== "undefined") tts.speak(text);
}
function clearNarration() { document.getElementById("narration").innerHTML = ""; }

// === EVIDENCE ===
function showMilestone(prefix, body) {
  if (!state._milestones) state._milestones = {};
  // prefix+body composite key = dedupe guard
  const k = prefix + "|" + body;
  if (state._milestones[k]) return;
  state._milestones[k] = true;
  const t = document.getElementById("milestone-toast");
  if (!t) return;
  document.getElementById("toast-prefix").textContent = prefix;
  document.getElementById("toast-body").innerHTML = body;
  t.classList.remove("hidden");
  t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
  clearTimeout(window._toastHide);
  window._toastHide = setTimeout(() => t.classList.add("hidden"), 6500);
  if (typeof audio !== "undefined") audio.sfx("chime");
}

function logEvidence(type, detail) {
  const entry = { type, detail, when: formatTime(), room: state.currentRoom };
  state.evidence.push(entry);
  narrate(`[EVIDENCE] ${type}: ${detail}`);
  // Milestones — once-per-save flourishes surfaced as a toast
  if (!state._m) state._m = {};
  const markMilestone = (k, prefix, body) => {
    if (state._m[k]) return; state._m[k] = true;
    showMilestone(prefix, body);
  };
  if (type.startsWith("K-II Spike"))     markMilestone("first_kii",      "First EMF Spike", "<em>An instrument has, at last, agreed with your suspicion.</em>");
  if (type === "Spirit Box")              markMilestone("first_spirit",   "First Spoken Word", "<em>A voice, from a device designed only to listen.</em>");
  if (type === "SLS Capture")             markMilestone("first_sls",      "First Figure", "<em>Skeletal, ill-proportioned, and certainly there.</em>");
  if (type === "EVP Capture")             markMilestone("first_evp",      "First Whisper", "<em>A voice on the tape, which was alone in the room.</em>");
  if (type === "Thermal — Cold")          markMilestone("first_cold",     "First Cold Spot", "<em>The temperature disagrees with the room.</em>");
  if (type === "Knock Response")          markMilestone("first_knock",    "First Reply", "<em>You knocked. It knocked back. The conversation is now open.</em>");
  if (type === "Tape Playback")           markMilestone("first_tape",     "A Name on the Tape", "<em>'Eliza.' A name in no document of the house.</em>");
  if (type === "REM Pod" && !/environmental/i.test(detail))
                                           markMilestone("first_rempod",   "First Proximity Trigger", "<em>Something entered a field only the pod could feel.</em>");
  if (type === "Direct Callout")          markMilestone("first_callout",  "It Answered", "<em>You spoke. It answered, in your own voice volume.</em>");
  if (type === "Confirmation")            markMilestone("first_confirm",  "Two Instruments Agree", "<em>The moment every investigator waits for.</em>");
  if (type === "Solo Session")            markMilestone("first_solo",     "Ten Minutes Alone", "<em>You sat in silence. The house took notice.</em>");
  if (state.calderCaught.length >= 2)     markMilestone("calder_2",       "The Witness is Unreliable", "<em>Two of Mr. Calder's stories have now been contradicted by paper.</em>");
  if (state.calderCaught.length >= 4)     markMilestone("calder_4",       "All Five Inconsistencies", "<em>You have caught the groundskeeper in every story he was given.</em>");
  // Paired-tool synergy: if another tool hit in the same room within 5 min,
  // surface a dramatic confirmation narration. Once per pair per room.
  if (!state._lastHit) state._lastHit = {};
  if (!state._paired) state._paired = {};
  const isHit = /Spike|Capture|Response|Box|Ovilus|Whisper|Cold|Pod|Callout|Tape/.test(type);
  if (isHit) {
    const now = state.timeMinutes;
    const rm = state.currentRoom;
    const key = rm + ":" + type;
    // Check other recent hits in this room
    for (const otherKey in state._lastHit) {
      const [otherRoom, otherType] = otherKey.split(":");
      if (otherRoom !== rm || otherType === type) continue;
      if (now - state._lastHit[otherKey] > 5) continue;
      const pairKey = [otherType, type].sort().join("+") + "@" + rm;
      if (state._paired[pairKey]) continue;
      state._paired[pairKey] = true;
      const roomName = ROOMS[rm]?.name || rm;
      setTimeout(() => {
        narrate(`<em>[Two instruments agree. Whatever is in the ${roomName} has now registered on both. This is the moment investigators live for.]</em>`);
        audio.sfx("kii_alarm");
        logEvidence("Confirmation", `Two tools (${otherType} + ${type}) agreed in ${roomName}.`);
      }, 800);
      break;
    }
    state._lastHit[key] = now;
  }
  // First-time intertitles for headline evidence
  if (typeof showIntertitle === "function") {
    if (type === "SLS Capture" && !state._firstSlsShown) {
      state._firstSlsShown = true;
      showIntertitle("A FIGURE IN FRAME",
        "<em>The instrument, calibrated for the human form, has found one — where, properly speaking, one ought not to be.</em>",
        { once: "first_sls" });
    } else if (type === "EVP Capture" && !state._firstEvpShown) {
      state._firstEvpShown = true;
      showIntertitle("A VOICE ON THE TAPE",
        "<em>You pressed Record. You left the room. You returned. The tape, one notes, was not alone.</em>",
        { once: "first_evp" });
    } else if (type === "Knock Response" && !state._firstKnockShown) {
      state._firstKnockShown = true;
      showIntertitle("THE KNOCK ANSWERED",
        "<em>Three, from you. Three, from elsewhere. The conversation — begun at your invitation — has been accepted.</em>",
        { once: "first_knock" });
    } else if (type === "Tape Playback" && !state._firstTapeShown) {
      state._firstTapeShown = true;
      showIntertitle("ELIZA",
        "<em>A name spoken, upon a tape, in a voice that ought by now to be silent. A name which is in no document of the house.</em>",
        { once: "first_tape" });
    }
  }
}

// === HUD / MAP / JOURNAL rendering ===
function renderHud() {
  document.getElementById("hud-time").textContent = formatTime();
  const room = ROOMS[state.currentRoom];
  document.getElementById("hud-location").textContent =
    room ? `Ashgrove House — ${room.name}` : "Ashgrove House";
}

// Pick the short version if concise mode is on and a short variant exists.
function conciseText(longStr, shortStr) {
  if (typeof settings !== "undefined" && settings.conciseMode && shortStr) return shortStr;
  return longStr;
}

function renderRoom() {
  const room = ROOMS[state.currentRoom];
  document.body.classList.toggle("indoors", room.id !== "drive");
  if (typeof audio !== "undefined" && audio.setRainIndoors) audio.setRainIndoors(room.id !== "drive");
  document.getElementById("scene-title").textContent = room.name;
  document.getElementById("scene-description").innerHTML = conciseText(room.description, room.short);
  if (typeof tts !== "undefined") tts.speak(room.name + ". " + conciseText(room.description, room.short));
  const art = document.getElementById("scene-art");
  art.innerHTML = typeof roomSvg === "function" ? roomSvg(room.id) : `[${room.floor}]`;
  art.style.background = roomArtGradient(room);

  const hs = document.getElementById("scene-hotspots");
  hs.innerHTML = "";
  for (const h of room.hotspots) {
    if (h.requires === "walkthrough_start" && !state.calderLeft) continue;
    const b = document.createElement("button");
    b.className = "hotspot-btn";
    b.textContent = h.label;
    b.onclick = () => handleHotspot(h);
    hs.appendChild(b);
  }
  if (state.calderLeft && state.currentRoom !== "drive") {
    const rest = document.createElement("button");
    rest.className = "hotspot-btn rest";
    rest.textContent = "Rest a moment";
    rest.onclick = () => doRest();
    hs.appendChild(rest);

    const silence = document.createElement("button");
    silence.className = "hotspot-btn silence";
    silence.textContent = "Sit in silence (10 min)";
    silence.title = "Wait alone in the room. Tension builds. Anything may happen.";
    silence.onclick = () => doSitInSilence();
    hs.appendChild(silence);

    const callout = document.createElement("button");
    callout.className = "hotspot-btn callout";
    callout.textContent = "Call out into the room";
    callout.title = "Speak a name or question. The house may answer.";
    callout.onclick = () => doCallOut();
    hs.appendChild(callout);
  }
  renderInventory();
  renderHud();
}

function roomArtGradient(room) {
  const map = {
    drive:        "linear-gradient(180deg,#1a1820 0%,#0a0808 100%)",
    entry_hall:   "linear-gradient(180deg,#2a1e1a 0%,#100a08 100%)",
    parlor:       "linear-gradient(180deg,#3a1a20 0%,#140608 100%)",
    library:      "linear-gradient(180deg,#2a2218 0%,#100c06 100%)",
    dining:       "linear-gradient(180deg,#22180e 0%,#0a0604 100%)",
    kitchen:      "linear-gradient(180deg,#1a1a14 0%,#080806 100%)",
    conservatory: "linear-gradient(180deg,#182018 0%,#060a06 100%)",
    upstairs_hall:"linear-gradient(180deg,#1a141a 0%,#080608 100%)",
    master:       "linear-gradient(180deg,#20182a 0%,#080610 100%)",
    nursery:      "linear-gradient(180deg,#2a2030 0%,#0a0810 100%)",
    governess:    "linear-gradient(180deg,#2a2422 0%,#0c0a08 100%)",
    study:        "linear-gradient(180deg,#281e14 0%,#0c0804 100%)",
    wine_cellar:  "linear-gradient(180deg,#14100a 0%,#040202 100%)"
  };
  return map[room.id] || "#1a1416";
}

function renderInventory() {
  const inv = document.getElementById("inventory-items");
  inv.innerHTML = "";
  const available = state.calderLeft && state._toolsUnlocked !== false;
  for (const t of TOOLS) {
    const d = document.createElement("div");
    d.className = "inv-item";
    let badge = "";
    if (t.id === "evp" && state.evpPlacements && Object.keys(state.evpPlacements).length > 0) {
      const anyReady = Object.values(state.evpPlacements).some(placedAt => state.timeMinutes - placedAt >= 5);
      badge = `<span class="inv-badge ${anyReady ? "ready" : "rec"}">${anyReady ? "●" : "…"}</span>`;
    } else if (t.id === "empump" && state.empumpRoom) {
      badge = `<span class="inv-badge on">◈</span>`;
    } else if (t.id === "rempod" && state.rempods && Object.keys(state.rempods).length > 0) {
      const anyHot = Object.values(state.rempods).some(p => p.triggeredAt !== null && (state.timeMinutes - p.triggeredAt) < 3);
      badge = `<span class="inv-badge ${anyHot ? "rec" : "on"}">◉</span>`;
    } else if (t.id === "camera" && state.photos && state.photos.length > 0) {
      const pending = state.photos.some(p => p.anomaly && !p.decision);
      badge = `<span class="inv-badge ${pending ? "rec" : "on"}">${state.photos.length}</span>`;
    }
    d.innerHTML = `<div>${t.short}</div>${badge}`;
    d.dataset.tool = t.id;
    if (!available) {
      d.style.opacity = 0.3;
      d.title = "Available after Calder leaves";
    } else {
      d.onclick = () => openTool(t.id);
    }
    inv.appendChild(d);
  }
}

function renderMap() {
  const g = document.getElementById("map-grid");
  g.innerHTML = "";
  for (const id of ROOM_ORDER) {
    const r = ROOMS[id];
    const d = document.createElement("div");
    d.className = "map-room" + (state.currentRoom === id ? " current" : "");
    if (id === "drive" && state.calderLeft) d.classList.add("locked");
    // Status markers for deployed equipment
    let markers = "";
    const evpPlacedAt = state.evpPlacements ? state.evpPlacements[id] : undefined;
    if (evpPlacedAt !== undefined) {
      const elapsed = state.timeMinutes - evpPlacedAt;
      const remaining = 5 - elapsed;
      if (remaining > 0) {
        markers += `<span class="map-marker evp-rec">● REC ${remaining}m</span>`;
      } else {
        markers += `<span class="map-marker evp-ready">● READY</span>`;
      }
    }
    if (state.empumpRoom === id) {
      markers += `<span class="map-marker empump-on">◈ EM PUMP</span>`;
    }
    if (state.rempods && state.rempods[id]) {
      const pod = state.rempods[id];
      const recentlyTriggered = pod.triggeredAt !== null && (state.timeMinutes - pod.triggeredAt) < 3;
      if (recentlyTriggered) {
        markers += `<span class="map-marker rempod-hot">◉ REM TRIG</span>`;
      } else {
        markers += `<span class="map-marker rempod-armed">◉ REM</span>`;
      }
    }
    d.innerHTML = `<span class="floor">${r.floor}</span>${r.name}${markers}`;
    d.onclick = () => {
      if (id === "drive" && state.calderLeft) {
        narrate("The front door is locked from the outside. You cannot leave until sunrise.");
        return;
      }
      travelTo(id, true);
      closeOverlay("overlay-map");
    };
    g.appendChild(d);
  }
}

function renderJournal() {
  const e = document.getElementById("journal-entries");
  if (state.evidence.length === 0) {
    e.innerHTML = "<p style='color:#5a4850'>No evidence yet.</p>";
  } else {
    // Group by room, preserving discovery order within each group
    const groups = {};
    for (const ev of state.evidence) {
      const key = ev.room || "_unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    // Render each room as a <details> collapsible, most-recent room first.
    // Use an ordered list of rooms by the most recent entry's timestamp.
    const sortedRooms = Object.keys(groups).sort((a, b) => {
      const aLast = groups[a][groups[a].length - 1];
      const bLast = groups[b][groups[b].length - 1];
      return (bLast ? state.evidence.indexOf(bLast) : 0) - (aLast ? state.evidence.indexOf(aLast) : 0);
    });
    e.innerHTML = sortedRooms.map(rk => {
      const roomName = ROOMS[rk]?.name || rk;
      const items = groups[rk];
      const rows = items.map(ev =>
        `<div class="journal-entry"><span class="when">${ev.when}</span>${ev.type}: ${ev.detail}</div>`
      ).join("");
      return `<details class="journal-group" open>
        <summary><span class="jg-name">${roomName}</span><span class="jg-count">${items.length} entr${items.length === 1 ? "y" : "ies"}</span></summary>
        <div class="journal-group-body">${rows}</div>
      </details>`;
    }).join("");
  }
  const c = document.getElementById("journal-calder");
  if (state.calderCaught.length > 0) {
    c.innerHTML = `<details class="journal-group calder-group" open>
      <summary><span class="jg-name">Inconsistencies caught</span><span class="jg-count">${state.calderCaught.length} / 5</span></summary>
      <div class="journal-group-body">${state.calderCaught.map(t => `<div class="journal-entry">${t}</div>`).join("")}</div>
    </details>`;
  } else {
    c.innerHTML = "";
  }
}

// === NAVIGATION ===
function travelTo(roomId, isMap) {
  if (!ROOMS[roomId]) return;
  const isRoomChange = roomId !== state.currentRoom;
  if (isRoomChange) {
    advanceTime(isMap ? 10 : 5);
    state.currentRoom = roomId;
    clearNarration();
    if (typeof onRoomEnter === "function") onRoomEnter();
    if (state.calderLeft) {
      if (roomId === "nursery" && !state._enteredNursery) {
        state._enteredNursery = true;
        bumpAggression(2, "you crossed the nursery threshold");
      } else if (roomId === "wine_cellar" && !state._enteredCellar) {
        state._enteredCellar = true;
        bumpAggression(2, "you went down into the cellar");
      }
    }
  }
  if (isRoomChange && !document.body.classList.contains("reduce-motion")) {
    crossfadeToRoom();
  } else {
    renderRoom();
  }
  tickAmbient();
  if (typeof audio !== "undefined") {
    audio.playAmbient(state.currentRoom);
    if (audio.playRoomBed) audio.playRoomBed(state.currentRoom);
  }
  if (typeof renderDanger === "function") renderDanger();
}

function crossfadeToRoom() {
  const art = document.getElementById("scene-art");
  const scene = document.getElementById("scene");
  art.classList.add("fading");
  scene.classList.add("fading");
  setTimeout(() => {
    renderRoom();
    requestAnimationFrame(() => {
      art.classList.remove("fading");
      scene.classList.remove("fading");
    });
  }, 420);
}

// Ambient flavor: random one-liners based on room + truth state
function tickAmbient() {
  const room = ROOMS[state.currentRoom];
  if (!state.calderLeft) return;
  if (Math.random() < 0.3) {
    const t = state.truth;
    const lines = {
      haunted: {
        nursery: "Something creaks in the east wall. Not a settling-house creak. Something with timing.",
        library: "The spines of the ledgers are not quite in the order you left them.",
        upstairs_hall: "You feel you are being watched from the far end of the hall.",
        master: "The east wall is breathing. Shallow, steady.",
        wine_cellar: "The temperature drops as you reach the bottom step.",
        parlor: "The portrait's eyes, you think, have moved.",
        study: "The tape machine clicks once on its own.",
        default: "The house is awake tonight."
      },
      partial: {
        nursery: "A child, somewhere behind the walls, is crying. You tell yourself it's the wind.",
        default: "The house settles. Old wood, old pipes."
      },
      debunked: {
        kitchen: "A copper pipe thrums. Water hammer. Nothing more.",
        master: "The wall flexes — once. You can feel the draft that does it.",
        default: "Old house. Drafts, creaks. Ordinary."
      }
    };
    const pool = lines[t] || lines.debunked;
    narrate(pool[room.id] || pool.default);
  }
}

// === HOTSPOT HANDLERS ===
function handleHotspot(h) {
  advanceTime(2);
  switch (h.action) {
    case "travel":     return travelTo(h.target, false);
    case "dialogue":   return openDialogue(h.target);
    case "document":   return openDocument(h.target);
    case "examine":    return examineObject(h.target);
    case "frontdoor":  return handleFrontDoor();
    case "desk":       return handleDesk();
    case "portrait":   return handlePortrait();
    case "tape":       return handleTape();
    case "knock":      return handleKnock(h.target);
    case "nursery_door": return handleNurseryDoor();
    case "locked_door":  return handleLockedDoor();
    case "seance":       return openSeance();
    case "seance_bell":  return ringSeanceBell();
    case "combo":        return openComboLock(h.target);
    case "speak_house":  return openSpeakToHouse();
    default: narrate("Nothing happens.");
  }
}

function examineObject(target) {
  const desc = EXAMINATIONS[target];
  if (desc) narrate(desc);
  else narrate("You look, but find nothing of note.");

  // Multi-room puzzle trigger: lifting the séance cloth reveals the carving,
  // but only after the player has been primed by the kitchen clipping
  // or Margaret's diary — otherwise they wouldn't think to look.
  if (target === "seance_table" && !state.docsRead.has("seance_carved")) {
    const primed = state.docsRead.has("fire_clipping") || state.docsRead.has("margaret_diary");
    if (primed) {
      setTimeout(() => {
        narrate("<em>Something moves you to lift the cloth and turn one of the planks. There is, on its underside, a carving — older than the varnish.</em>");
        setTimeout(() => {
          openDocument("seance_carved");
          if (typeof showIntertitle === "function") {
            showIntertitle("ELIZA HERE, STILL",
              "<em>The planchette remembers. The name, which did not belong to any Ashgrove, is already in the wood.</em>",
              { once: "puzzle_eliza" });
          }
        }, 1600);
      }, 1200);
    }
  }
}

const EXAMINATIONS = {
  seance_table: "Margaret Ashgrove's séance table, its cloth faded now to the colour of old photographs. A planchette, four candle-stubs, a small silver bell. You take the liberty, as no one is watching, of pressing a foot upon the floorboard beneath — which gives, obligingly. Stage-rigging for the faithful. One notes, however, that theatre does not preclude sincerity.",
  dining_table: "Twelve places, set. The coroner's report, at no small inconvenience, insists that nineteen died in the fire of 1851. One is moved to wonder which, of these two numbers, is the more honest.",
  pipes: "Copper pipes, laid in a time when copper was copper and plumbers had opinions. They thrum, faintly — water-hammer, which any K-II meter worth its calibration will happily misidentify as a spirit of some distress.",
  wiring: "Original knob-and-tube — a species of electrical work which the modern inspector would, with some feeling, condemn. An EMF reading in its vicinity means, one is obliged to record, absolutely nothing of the supernatural.",
  vines: "Dead vines, arranged in attitudes of what was once ambition. No haunting here. Only neglect, which is its own, lesser ghost.",
  crack: "A small triangular crack, no longer than a child's finger, in one pane. Cold air enters. The thermal camera, should one consult it, will render the draft as a pale blue finger reaching inward.",
  master_bed: "A four-poster, shrouded. A quilt folded at its foot, the stitching done by a hand long gone to dust. Nothing beneath the pillow. Nothing, one can report with some satisfaction, beneath the bed.",
  east_wall: "Where windows ought to be, there is wall — and, upon the hand you have, perhaps unwisely, pressed against it, a feeling which is and is not cold, and which does and does not belong.",
  rocking_chair: "The chair is old. One rocker, it may be observed, is shorter than its fellow by perhaps the breadth of a sixpence. In the right conditions, such a chair will move of its own weight — as, presumably, will many things.",
  thimble: "A silver thimble, engraved with the letters E.A. — Evelyn Ashgrove, whom you have read about, and whom you will not meet. You lift it; reconsider; set it down, precisely where it had been. It is not yours. It belongs to the room.",
  east_wall_nursery: "The plaster bears gouges — parallel, deep, and, one is reluctantly compelled to note, spaced as the fingers of a grown woman's hand. Evelyn Ashgrove attempted, in the summer of 1923, to pass through this wall. From the <em>interior</em> side.",
  drawing: "Two children, identical, holding hands; one does not, at a first glance, observe that the hands they hold are not each other's, but a smaller third hand, drawn in pencil, rising from the floor between them. One does, however, observe this, upon the second glance. One cannot then unobserve it.",
  tape_box: "Reels in their dozens, labelled in a hand that becomes over the years both steadier and less well. The dates run from 1968 to 1974. One tape, labelled 4/17/73, wears a small red sticker — the sort a librarian applies to volumes requiring special handling.",
  racks: "Empty. The bottles long sold, when the trust assumed stewardship of the house. The racks, preserved for effect, give the cellar the pleasing appearance of a place where wine was once enjoyed.",
  hallway_end: "You stare down the long corridor. There is nothing there. You continue to stare, for rather longer than strictly necessary; and when at last you look away, you are not entirely certain of the exact moment at which there was, or was not, nothing."
};

function handleFrontDoor() {
  if (!state.calderLeft) { narrate("The door is open. Mr. Calder is outside."); return; }
  if (state.timeMinutes < SUNRISE) { narrate("Locked. Won't open until sunrise."); return; }
  narrate("The sky is greying. The lock turns on its own.");
}
function handleDesk() {
  if (state.timeMinutes < SUNRISE) { narrate("A blotter, an inkwell, an envelope sealed for morning. The executor's check. Not yet."); return; }
  showVerdict();
}
function handlePortrait() {
  if (!state.portraitFirstShot) {
    narrate("The painting of a seated figure. The face is indistinct. You note its exact state — maybe you should capture this with the SLS later and compare.");
    state.portraitFirstShot = "noted";
  } else if (state.entitiesSeen.has("portrait_change")) {
    narrate("The face has changed again.");
  } else {
    narrate("The painting. Something about the face disagrees with your memory of it. You cannot say what.");
  }
}
function handleNurseryDoor() {
  narrate("The nursery door is unlocked tonight — the first time in decades, per Calder. You can enter.");
  travelTo("nursery", false);
}
function handleLockedDoor() {
  if (state.aggression >= 3) {
    narrate("The deadbolt clicks on its own. The door swings a foot inward on its hinges. Something on the other side is breathing.");
    state.aggression += 2;
    logEvidence("Environmental", "The locked cellar door opened without a key.");
  } else {
    narrate("Heavy oak with a modern deadbolt. Added in 1974. No key exists to the trust.");
  }
}
function handleKnock(target) {
  narrate("You rap on the wall. Three knocks.");
  audio.sfx("knock");
  advanceTime(3);
  if (state.truth === "haunted" && (target === "library_wall" || target === "cellar_door")) {
    setTimeout(() => {
      narrate("After a long pause — three knocks answer. From somewhere else in the house.");
      logEvidence("Knock Response", `Three knocks answered your three from elsewhere (${ROOMS[state.currentRoom].name}).`);
      bumpToolUse("knock");
      bumpAggression(1, "you knocked back");
      audio.sfx("answer_knock");
    }, 900);
  } else if (state.truth === "partial") {
    setTimeout(() => narrate("The pipes in the wall clank. You can't tell if it's an answer."), 900);
  } else {
    setTimeout(() => narrate("Silence. Then a distant clank — copper plumbing, not a ghost."), 900);
  }
}
function handleTape() {
  if (typeof openTapeArchive === "function") return openTapeArchive();
  // Fallback
  narrate("You thread the tape labeled 4/17/73 onto the reel-to-reel. Press play.");
  audio.sfx("tape_play");
  setTimeout(() => {
    showDocument("tape_transcript");
    logEvidence("Tape Playback", "Adeline's voice names 'Eliza' — a name in no other document.");
    state.docsRead.add("tape_transcript");
  }, 1200);
}

// === DOCUMENTS ===
function openDocument(id) {
  const d = DOCUMENTS[id];
  if (!d) { narrate("Nothing legible."); return; }
  showDocument(id);
  state.docsRead.add(id);
  if (id === "midnight_letter" && typeof unlockAchievement === "function") unlockAchievement("midnight_letter");
  if (d.contradicts) {
    const claimText = CALDER_CONTRADICTIONS[d.contradicts];
    if (claimText && !state.calderCaught.includes(claimText)) {
      state.calderCaught.push(claimText);
      narrate(`[You've caught Calder in a contradiction: ${claimText}]`);
    }
  }
}
function showDocument(id) {
  const d = DOCUMENTS[id];
  const body = document.getElementById("tool-body");
  document.getElementById("tool-title").textContent = d.title;
  const text = conciseText(d.body, d.short);
  body.innerHTML = `<p style="white-space:pre-wrap;line-height:1.7;color:#c8b8a0">${text}</p>`;
  openOverlay("overlay-tool");
  if (typeof tts !== "undefined") tts.speak(d.title + ". " + text);
}

const CALDER_CONTRADICTIONS = {
  evelyn_fall: "Calder: 'Evelyn died of a fall.' Coroner's report: undetermined, bloody hands on the wall.",
  twins_drowned: "Calder: 'The twins drowned in the pond.' Pond was drained in 1940 — no bodies found.",
  adeline_kind: "Calder: 'Adeline was kind at the end.' Her 1972 letter: 'I mean to join them in the walls before the house gets me first.'",
  cellar_nothing: "Calder: 'Nothing but a wine cellar.' Modern deadbolt installed 1974 — after Adeline died.",
  executor_identity: "Calder: 'The executor signs E. Ashgrove.' Elias Ashgrove died in 1902. The trust was founded by him three years before that."
};

// === DIALOGUE ===
function openDialogue(nodeId) {
  const node = CALDER_DIALOGUE[nodeId];
  if (!node) return;
  if (nodeId === "start_walkthrough") state._heardCalderFinish = true;
  document.getElementById("dialogue-speaker").textContent = node.speaker;
  const line = conciseText(node.line, node.short);
  document.getElementById("dialogue-line").textContent = line;
  if (typeof tts !== "undefined") tts.speak(node.speaker + ". " + line);
  const c = document.getElementById("dialogue-choices");
  c.innerHTML = "";
  for (const ch of node.choices) {
    const b = document.createElement("button");
    b.textContent = ch.text;
    b.onclick = () => {
      if (ch.goto === "__leave") {
        closeOverlay("overlay-dialogue");
        calderLeaves();
      } else {
        openDialogue(ch.goto);
      }
    };
    c.appendChild(b);
  }
  openOverlay("overlay-dialogue");
}

function calderLeaves() {
  state.calderLeft = true;
  advanceTime(90);
  audio.sfx("door");
  setTimeout(() => audio.sfx("lock"), 400);
  travelTo("entry_hall", false);
  if (typeof showIntertitle === "function") {
    showIntertitle("THE DOOR IS CLOSED",
      "<em>The bolt throws itself, without hurry, as bolts will in houses which have long since decided upon the matter. You are alone — which is, of course, an approximation.</em>",
      { once: "calder_left" });
  }
  // Delay tool availability: give a beat of dread first.
  state._toolsUnlocked = false;
  setTimeout(() => {
    narrate("<em>The door closes, without haste; the bolt is thrown.</em>");
  }, 4200);
  setTimeout(() => {
    narrate("<em>You stand in the entry hall for a long moment. The house, it seems, has other company than yours.</em>");
    audio.sfx("breath");
  }, 7200);
  setTimeout(() => {
    narrate("<em>You steady yourself. Open your case. Your instruments are at hand now.</em>");
    state._toolsUnlocked = true;
    renderInventory();
  }, 11000);
  if (typeof startAmbientTicker === "function") startAmbientTicker();
  if (typeof startHeartbeatTicker === "function") startHeartbeatTicker();
  if (typeof startLateEffectsTicker === "function") startLateEffectsTicker();
  if (typeof startTremorTicker === "function") startTremorTicker();
  if (typeof startMaxAggTicker === "function") startMaxAggTicker();
  if (typeof startAmbientSfxLoop === "function") startAmbientSfxLoop();
  if (typeof startTimeOfNightLoop === "function") startTimeOfNightLoop();
}

// === OVERLAYS ===
function openOverlay(id) { document.getElementById(id).classList.remove("hidden"); }
function closeOverlay(id) {
  document.getElementById(id).classList.add("hidden");
  // Only stop narration when closing a MODAL overlay the player explicitly dismissed.
  // Don't stop when intertitles auto-hide at the end of their fade.
  if (typeof tts !== "undefined" && id !== "intertitle") tts.stop();
  // Any time the tool overlay closes, kill the spirit-box static loop.
  if (id === "overlay-tool" && typeof audio !== "undefined" && audio.stopSpiritStatic) {
    audio.stopSpiritStatic();
  }
  // Also kill the continuous spirit-box sweep loop
  if (id === "overlay-tool" && _spiritLoopTimer) {
    clearTimeout(_spiritLoopTimer);
    _spiritLoopTimer = null;
    _spiritCurrentWord = null;
  }
  // "Something happened while you weren't looking" — fires on tool close.
  if (id === "overlay-tool" && state.calderLeft && !state.endDialog) {
    maybeAfterToolScare();
  }
}

// Fires on tool-overlay close. More likely at higher aggression,
// more likely on haunted run. Completely absent on debunked.
const AFTER_TOOL_LINES = {
  haunted: [
    "<em>You lower the instrument. Something in the room has moved. You cannot, at this distance, say what.</em>",
    "<em>When you look up, you notice the door behind you is open a hand's breadth further than you left it.</em>",
    "<em>A smell — faint, organic, recent — was not in the room when you opened the device.</em>",
    "<em>The temperature, in the few seconds you were not paying attention, has measurably dropped.</em>",
    "<em>You set the instrument down. At the edge of your peripheral vision, something adjusts its posture.</em>",
    "<em>You realise you have been holding your breath. You did not decide to.</em>",
    "<em>A single drop of water strikes the floorboard behind you. The ceiling is, so far as you can see, dry.</em>",
    "<em>You hear your own footsteps continue for a half-second after you stop.</em>"
  ],
  partial: [
    "<em>You lower the instrument. The room seems, for just a moment, wrong — though you cannot say how.</em>",
    "<em>A draft finds the back of your neck. You do not turn.</em>",
    "<em>The floorboards settle as if someone had just stood.</em>"
  ],
  debunked: []
};
function maybeAfterToolScare() {
  if (state.truth === "debunked") return;
  const tier = (typeof DANGER_TIERS !== "undefined") ? DANGER_TIERS.indexOf(getTier()) : 1;
  const base = state.truth === "haunted" ? 0.22 : 0.12;
  const chance = Math.min(0.7, base + tier * 0.12);
  if (Math.random() > chance) return;
  const pool = AFTER_TOOL_LINES[state.truth] || [];
  if (pool.length === 0) return;
  // Avoid immediate-repeat
  let line;
  let tries = 0;
  do {
    line = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  } while (line === state._lastAfterTool && tries < 4);
  state._lastAfterTool = line;
  setTimeout(() => {
    narrate(line);
    audio.sfx(Math.random() < 0.5 ? "breath" : "distant_bang");
  }, 500);
}

// Init close buttons
document.addEventListener("click", e => {
  if (e.target.matches(".btn-close[data-close]")) {
    closeOverlay(e.target.dataset.close);
  }
});

function openJournal() { renderJournal(); openOverlay("overlay-journal"); }
// Journal tab switcher
document.addEventListener("click", e => {
  const t = e.target.closest(".jtab");
  if (!t) return;
  const which = t.dataset.jtab;
  document.querySelectorAll(".jtab").forEach(b => b.classList.toggle("active", b.dataset.jtab === which));
  document.querySelectorAll(".jtab-panel").forEach(p => p.classList.toggle("active", p.id === "journal-tab-" + which));
});

// Map + journal buttons
document.getElementById("btn-map").addEventListener("click", () => { renderMap(); openOverlay("overlay-map"); });
document.getElementById("btn-journal").addEventListener("click", openJournal);

// === TOOLS ===
// Entity is "present" iff its room matches (or "any") AND it's real in current truth.
function entityPresentHere(entId) {
  const e = ENTITIES[entId];
  if (!e) return false;
  if (!e.realInStates.includes(state.truth)) return false;
  if (e.room !== "any" && e.room !== state.currentRoom) return false;
  return true;
}
// EM Pump effect: while active in this room, latent entities here become
// detectable by tools that didn't normally see them. Bait and observe.
function entitiesDetectedBy(toolKey) {
  const out = [];
  const pumpHere = state.empumpRoom === state.currentRoom;
  // Aggression leakage: when the house is agitated, latent entities start
  // showing up on tools that wouldn't normally see them.
  //   Close (7-8):     30% chance per tool
  //   In the Room (9+): 60% chance per tool
  // EM pump still adds on top (up to 60%) — the two stack as max, not sum.
  const agg = state.aggression || 0;
  const aggLeak = agg >= 9 ? 0.6 : agg >= 7 ? 0.3 : 0;
  for (const id in ENTITIES) {
    if (!entityPresentHere(id)) continue;
    const e = ENTITIES[id];
    if (e.detect[toolKey]) { out.push(id); continue; }
    if (toolKey === "tape") continue;
    const leakChance = Math.max(pumpHere ? 0.6 : 0, aggLeak);
    if (leakChance > 0 && Math.random() < leakChance) {
      out.push(id);
    }
  }
  return out;
}

// --- Film Camera ---
// Aim the camera at the current room and snap a photograph. The viewfinder
// shows the painted room SVG with a scan-line / shutter crosshair. On snap,
// the photo is committed to state.photos. Sometimes, on haunted runs with
// an SLS-visible entity, a figure appears in the developed photo that
// wasn't visible live.
function toolCamera() {
  const roomId = state.currentRoom;
  const room = ROOMS[roomId];
  const roomName = room?.name || roomId;
  const roomArt = typeof roomSvg === "function" ? roomSvg(roomId) : "";
  setToolBody("Film Camera", `
    <div class="device bakelite">
      <div class="device-label">FILM CAMERA · 35MM</div>
      <div class="device-model">LEAF SHUTTER · f/2.8 · ISO 800</div>
      <div class="device-screen amber" style="padding:4px">
        <div style="display:flex;justify-content:space-between;padding:2px 6px;color:#c8a060;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px">
          <span>${roomName.toUpperCase()}</span><span>${formatTime()}</span>
        </div>
        <div class="camera-viewfinder">
          <div class="camera-bg">${roomArt}</div>
          <div class="camera-reticle">
            <div class="reticle-h"></div>
            <div class="reticle-v"></div>
            <div class="reticle-dot"></div>
            <div class="reticle-corners"></div>
          </div>
        </div>
      </div>
      <div class="device-actions">
        <button onclick="cameraSnap()">Take photograph</button>
        <button onclick="cameraOpenGallery()">Gallery (${(state.photos || []).length})</button>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
}

// Roll a photo anomaly. Types: "figure" (real ghost body), "orb" (floating
// light — could be dust or a spirit), "smudge" (smear — could be fingerprint
// or ectoplasm), "mist" (haze — could be breath, fog, or spectral), or null
// (clean exposure). Truth-weighted: haunted photos are the richest, debunked
// runs still produce mundane artifacts (dust, fingerprints, lens fog).
function rollPhotoAnomaly(roomId) {
  const truth = state.truth;
  // Is a real entity in the room? (only matters for "figure")
  const entitiesHere = Object.entries(ENTITIES).filter(([k, e]) =>
    e.realInStates.includes(truth) && e.room === roomId
  );
  const r = Math.random();
  if (truth === "haunted") {
    if (entitiesHere.length && r < 0.15) {
      return { type: "figure", entityId: entitiesHere[Math.floor(Math.random()*entitiesHere.length)][0] };
    }
    if (r < 0.40) return { type: "orb",    seed: Math.random() };
    if (r < 0.60) return { type: "smudge", seed: Math.random() };
    if (r < 0.75) return { type: "mist",   seed: Math.random() };
    return null;
  }
  if (truth === "partial") {
    if (entitiesHere.length && r < 0.06) {
      return { type: "figure", entityId: entitiesHere[Math.floor(Math.random()*entitiesHere.length)][0] };
    }
    if (r < 0.26) return { type: "orb",    seed: Math.random() };
    if (r < 0.41) return { type: "smudge", seed: Math.random() };
    if (r < 0.53) return { type: "mist",   seed: Math.random() };
    return null;
  }
  // debunked: no figure, but still gets dust / smudge / lens fog
  if (r < 0.18) return { type: "orb",    seed: Math.random() };
  if (r < 0.28) return { type: "smudge", seed: Math.random() };
  if (r < 0.36) return { type: "mist",   seed: Math.random() };
  return null;
}

function cameraSnap() {
  const roomId = state.currentRoom;
  const roomName = ROOMS[roomId]?.name || roomId;
  const anomaly = rollPhotoAnomaly(roomId);
  const photo = {
    roomId,
    when: formatTime(),
    timeMinutes: state.timeMinutes,
    anomaly,                  // null or { type, entityId?, seed? }
    reviewed: false,          // opened at least once in the gallery
    decision: null            // "logged" | "dismissed" | null (pending)
  };
  state.photos.push(photo);
  bumpToolUse("camera");
  advanceTime(1);
  audio.sfx("chime");
  if (!document.body.classList.contains("reduce-motion")) {
    const flash = document.createElement("div");
    flash.className = "camera-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 220);
  }
  logEvidence("Photo", `Photograph #${state.photos.length} taken in ${roomName} (undeveloped).`);
  showMilestone(`PHOTO CAPTURED`, `<em>Exposure ${state.photos.length}. The film is not developed yet — review in the Gallery.</em>`);
}

function cameraOpenGallery() {
  if (!state.photos || state.photos.length === 0) {
    setToolBody("Film Camera — Gallery", `
      <div class="device bakelite">
        <div class="device-label">FILM GALLERY · EMPTY</div>
        <div class="device-model">NO EXPOSURES ON FILM</div>
        <div class="device-screen amber">
          <p style="text-align:center;color:#8a7565;font-style:italic;margin:14px 0">You haven't taken any photographs yet.</p>
        </div>
        <div class="device-actions">
          <button onclick="toolCamera()">Back to viewfinder</button>
        </div>
      </div>`);
    return;
  }
  const pending = state.photos.filter(p => p.anomaly && !p.decision).length;
  const thumbs = state.photos.map((p, i) => {
    const rName = ROOMS[p.roomId]?.name || p.roomId;
    const roomArt = typeof roomSvg === "function" ? roomSvg(p.roomId) : "";
    const anomalyClass = p.anomaly
      ? (p.decision === "logged" ? "has-logged" : p.decision === "dismissed" ? "has-dismissed" : "has-anomaly")
      : "";
    const anomalyLayer = p.anomaly ? photoAnomalyOverlay(p.anomaly, "thumb") : "";
    const badge = p.anomaly && !p.decision
      ? `<span class="photo-badge">!</span>`
      : p.decision === "logged"
        ? `<span class="photo-badge logged">✓</span>`
        : p.decision === "dismissed"
          ? `<span class="photo-badge dismissed">·</span>`
          : "";
    return `
      <div class="photo-thumb ${anomalyClass}" onclick="cameraViewPhoto(${i})">
        <div class="photo-thumb-img">${roomArt}${anomalyLayer}${badge}</div>
        <div class="photo-thumb-label">
          <span>#${i + 1} · ${rName}</span>
          <span class="photo-thumb-when">${p.when}</span>
        </div>
      </div>`;
  }).join("");
  const header = pending > 0
    ? `<div class="photo-pending-banner">${pending} ANOMALY${pending === 1 ? "" : " CAPTURES"} AWAIT YOUR REVIEW</div>`
    : "";
  setToolBody("Film Camera — Gallery", `
    <div class="device bakelite">
      <div class="device-label">FILM GALLERY · ${state.photos.length} EXPOSURE${state.photos.length === 1 ? "" : "S"}</div>
      <div class="device-model">DEVELOPED IN SEPIA · 35MM</div>
      <div class="device-screen amber" style="padding:8px">
        ${header}
        <div class="photo-grid">${thumbs}</div>
      </div>
      <div class="device-actions">
        <button onclick="toolCamera()">Back to viewfinder</button>
      </div>
    </div>`);
}

function cameraViewPhoto(idx) {
  const p = state.photos[idx];
  if (!p) return;
  const rName = ROOMS[p.roomId]?.name || p.roomId;
  const roomArt = typeof roomSvg === "function" ? roomSvg(p.roomId) : "";
  p.reviewed = true;

  const a = p.anomaly;
  const anomalyLayer = a ? photoAnomalyOverlay(a, "full") : "";
  const info = photoAnomalyCaption(a);

  // If this was already decided, just display it (no buttons)
  let actionsHtml;
  if (!a) {
    actionsHtml = `
      <button onclick="cameraOpenGallery()">Back to gallery</button>
      <button onclick="toolCamera()">Take another</button>`;
  } else if (p.decision) {
    const mark = p.decision === "logged"
      ? `<span style="color:#80c090">Logged as evidence.</span>`
      : `<span style="color:#8a7565">Dismissed as mundane.</span>`;
    actionsHtml = `
      <div style="flex:1;text-align:center;font-style:italic;font-size:12px">${mark}</div>
      <button onclick="cameraOpenGallery()">Back to gallery</button>`;
  } else {
    actionsHtml = `
      <button class="photo-btn-log" onclick="cameraDecidePhoto(${idx}, 'logged')">Log as evidence</button>
      <button class="photo-btn-dismiss" onclick="cameraDecidePhoto(${idx}, 'dismissed')">Dismiss as mundane</button>
      <button onclick="cameraOpenGallery()">Back</button>`;
  }

  const crossRef = a ? photoCrossReference(p) : "";

  setToolBody(`Photo #${idx + 1} · ${rName}`, `
    <div class="device bakelite">
      <div class="device-label">EXPOSURE #${idx + 1}${a && !p.decision ? " · ANOMALY DETECTED" : ""}</div>
      <div class="device-model">${rName.toUpperCase()} · ${p.when}</div>
      <div class="device-screen amber" style="padding:4px">
        <div class="camera-viewfinder photo-review">
          <div class="camera-bg">${roomArt}</div>
          ${anomalyLayer}
        </div>
        <p class="photo-caption" style="color:${info.color}">${info.text}</p>
        ${crossRef}
        ${a && !p.decision ? `<p class="photo-hint">Weigh this photo against what your other instruments said about this room. If they agreed, the anomaly is likely real. If the room read silent, the photo is likely dust or lens fog.</p>` : ""}
      </div>
      <div class="device-actions">
        ${actionsHtml}
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
}

// Gather every evidence entry from the same room as this photo, classified
// as corroborating (suggests real phenomena), debunking (suggests mundane),
// or neutral. Used to guide the player's log/dismiss decision.
function photoCrossReference(p) {
  const roomEntries = (state.evidence || []).filter(e =>
    e.room === p.roomId && !(e.type || "").startsWith("Photo")
  );
  const rName = ROOMS[p.roomId]?.name || p.roomId;

  // Classify each entry
  const corroborating = [];
  const debunking = [];
  const neutral = [];
  const CORROBORATING = [
    "K-II Spike", "Spirit Box", "Ovilus", "SLS Capture", "EVP Capture",
    "Thermal — Cold", "Knock Response", "REM Pod", "Silence Witness"
  ];
  for (const e of roomEntries) {
    const t = e.type || "";
    if (t.startsWith("Thermal — Hot") || t === "Debunk" || t.includes("Debunked") || t.includes("Mundane")) {
      debunking.push(e);
    } else if (CORROBORATING.some(c => t.startsWith(c))) {
      corroborating.push(e);
    } else {
      neutral.push(e);
    }
  }

  if (roomEntries.length === 0) {
    return `
      <div class="photo-crossref photo-crossref-empty">
        <div class="pcr-head">CORROBORATION — ${rName.toUpperCase()}</div>
        <div class="pcr-body pcr-silent">
          <em>Nothing else on record for this room.</em><br>
          <span class="pcr-sub">You took this photo without first surveying with other instruments. A clean room with no corroborating readings suggests the anomaly is probably mundane (dust, smudging, lens fog).</span>
        </div>
      </div>`;
  }

  const bullets = (arr, cls) => arr.map(e =>
    `<li class="${cls}"><strong>${e.type}</strong> <span class="pcr-when">${e.when}</span><br><span class="pcr-detail">${e.detail}</span></li>`
  ).join("");

  // Summary verdict
  let summary;
  if (corroborating.length >= 2) {
    summary = `<div class="pcr-summary pcr-real">Multiple instruments agreed with something in this room. The anomaly likely represents a real phenomenon.</div>`;
  } else if (corroborating.length === 1 && debunking.length === 0) {
    summary = `<div class="pcr-summary pcr-ambiguous">One other instrument flagged this room. Corroborated, but not strongly — your call.</div>`;
  } else if (corroborating.length === 0 && debunking.length >= 1) {
    summary = `<div class="pcr-summary pcr-fake">Only mundane readings in this room (${debunking.length}). The anomaly is likely a fluke — dust, smudging, or lens fog.</div>`;
  } else if (corroborating.length >= 1 && debunking.length >= 1) {
    summary = `<div class="pcr-summary pcr-ambiguous">Mixed signals: ${corroborating.length} corroborating, ${debunking.length} debunking. Ambiguous.</div>`;
  } else {
    summary = `<div class="pcr-summary pcr-ambiguous">Ambient readings only. Not enough to corroborate or rule out.</div>`;
  }

  return `
    <div class="photo-crossref">
      <div class="pcr-head">CORROBORATION — ${rName.toUpperCase()}</div>
      ${summary}
      ${corroborating.length ? `<div class="pcr-col"><div class="pcr-col-head pcr-col-real">Corroborating (${corroborating.length})</div><ul class="pcr-list">${bullets(corroborating, "pcr-real")}</ul></div>` : ""}
      ${debunking.length ? `<div class="pcr-col"><div class="pcr-col-head pcr-col-fake">Debunking (${debunking.length})</div><ul class="pcr-list">${bullets(debunking, "pcr-fake")}</ul></div>` : ""}
      ${neutral.length ? `<div class="pcr-col pcr-col-neutral"><div class="pcr-col-head">Neutral (${neutral.length})</div><ul class="pcr-list">${bullets(neutral, "pcr-neutral")}</ul></div>` : ""}
    </div>`;
}

function cameraDecidePhoto(idx, decision) {
  const p = state.photos[idx];
  if (!p || !p.anomaly || p.decision) return;
  p.decision = decision;
  const rName = ROOMS[p.roomId]?.name || p.roomId;
  const a = p.anomaly;
  if (decision === "logged") {
    if (a.type === "figure") {
      const entName = ENTITIES[a.entityId]?.name || "something";
      logEvidence("Photo — Figure", `Photo #${idx + 1} in ${rName}: ${entName} visible in frame. Not seen live.`);
      state.entitiesSeen.add(a.entityId);
      showMilestone("A FIGURE IN THE FRAME", `<em>Photograph #${idx + 1} shows ${entName}.</em>`);
      if (typeof unlockAchievement === "function") unlockAchievement("photo_figure");
    } else {
      const label = a.type === "orb" ? "Photo — Orb" : a.type === "smudge" ? "Photo — Smudge" : "Photo — Mist";
      logEvidence(label, `Photo #${idx + 1} in ${rName}: anomalous ${a.type} logged as paranormal.`);
    }
  } else {
    logEvidence("Photo — Debunked", `Photo #${idx + 1} in ${rName}: ${a.type} dismissed as mundane (dust / smudge / fog).`);
  }
  cameraViewPhoto(idx);
}

function photoAnomalyCaption(a) {
  if (!a) return { text: "Nothing unusual visible.", color: "#8a7565" };
  switch (a.type) {
    case "figure": return { text: "There is something in the frame that was not there.", color: "#e88050" };
    case "orb":    return { text: "A bright orb floats in the frame. Dust caught by the flash — or something else?", color: "#e8c060" };
    case "smudge": return { text: "A dark smear across the exposure. Fingerprint on the lens — or ectoplasm?", color: "#c090a0" };
    case "mist":   return { text: "A pale haze curls through the room. Breath in cold air — or a presence?", color: "#a0b8c8" };
    default:       return { text: "Nothing unusual visible.", color: "#8a7565" };
  }
}

function photoAnomalyOverlay(a, size) {
  if (!a) return "";
  switch (a.type) {
    case "figure": return photoFigureOverlay(a.entityId, size);
    case "orb":    return photoOrbOverlay(a.seed, size);
    case "smudge": return photoSmudgeOverlay(a.seed, size);
    case "mist":   return photoMistOverlay(a.seed, size);
  }
  return "";
}

function photoFigureOverlay(entityId, size) {
  const x = 30 + Math.random() * 40;
  const y = 30 + Math.random() * 30;
  if (typeof ghostSvg === "function") {
    return `<div class="photo-figure-layer">${ghostSvg(entityId, x, y, size === "thumb" ? 0.7 : 0.85)}</div>`;
  }
  return "";
}

function photoOrbOverlay(seed, size) {
  // Deterministic pseudo-random from seed so the orb sits in the same spot every view
  const rng = (n) => {
    const x = Math.sin(seed * 9973 + n) * 10000;
    return x - Math.floor(x);
  };
  const count = 1 + Math.floor(rng(1) * 3); // 1-3 orbs
  let orbs = "";
  for (let i = 0; i < count; i++) {
    const cx = 15 + rng(i*3 + 2) * 70;
    const cy = 20 + rng(i*3 + 3) * 60;
    const r  = 2 + rng(i*3 + 4) * 4;
    const op = 0.55 + rng(i*3 + 5) * 0.35;
    orbs += `<circle cx="${cx}%" cy="${cy}%" r="${r}%" fill="url(#photo-orb-grad)" opacity="${op.toFixed(2)}"/>`;
  }
  return `<div class="photo-figure-layer"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">
    <defs><radialGradient id="photo-orb-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff8e0" stop-opacity="1"/>
      <stop offset="50%" stop-color="#f0d890" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#f0d890" stop-opacity="0"/>
    </radialGradient></defs>
    ${orbs}
  </svg></div>`;
}

function photoSmudgeOverlay(seed, size) {
  const rng = (n) => { const x = Math.sin(seed * 7919 + n) * 10000; return x - Math.floor(x); };
  const cx = 25 + rng(1) * 50;
  const cy = 25 + rng(2) * 50;
  const rot = Math.floor(rng(3) * 360);
  return `<div class="photo-figure-layer"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">
    <defs><radialGradient id="photo-smudge-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a1810" stop-opacity="0.75"/>
      <stop offset="60%" stop-color="#2a1810" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#2a1810" stop-opacity="0"/>
    </radialGradient></defs>
    <ellipse cx="${cx}%" cy="${cy}%" rx="18%" ry="9%" fill="url(#photo-smudge-grad)" transform="rotate(${rot} ${cx} ${cy})"/>
    <ellipse cx="${cx}%" cy="${cy}%" rx="10%" ry="5%" fill="#1a0808" opacity="0.5" transform="rotate(${rot+15} ${cx} ${cy})"/>
  </svg></div>`;
}

function photoMistOverlay(seed, size) {
  const rng = (n) => { const x = Math.sin(seed * 6521 + n) * 10000; return x - Math.floor(x); };
  const cx = 30 + rng(1) * 40;
  const cy = 40 + rng(2) * 30;
  return `<div class="photo-figure-layer"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">
    <defs><radialGradient id="photo-mist-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8e0d0" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#d0c8b8" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#d0c8b8" stop-opacity="0"/>
    </radialGradient></defs>
    <ellipse cx="${cx}%" cy="${cy}%" rx="28%" ry="14%" fill="url(#photo-mist-grad)"/>
    <ellipse cx="${(cx+8)}%" cy="${(cy-3)}%" rx="18%" ry="10%" fill="url(#photo-mist-grad)" opacity="0.7"/>
    <ellipse cx="${(cx-6)}%" cy="${(cy+4)}%" rx="14%" ry="8%" fill="url(#photo-mist-grad)" opacity="0.6"/>
  </svg></div>`;
}

function toolRemPod() {
  const room = state.currentRoom;
  if (!state.rempods) state.rempods = {};
  const placed = state.rempods[room];
  advanceTime(1);
  if (placed) {
    // Pick it up
    delete state.rempods[room];
    narrate("You retrieve the REM Pod from " + ROOMS[room].name + ". Its indicator lights die one by one.");
    setToolBody("REM Pod", `
      <div class="device bakelite">
        <div class="device-label">REM-ATDD · PROXIMITY</div>
        <div class="device-model">REMOVED FROM ${ROOMS[room].name.toUpperCase()}</div>
        <div class="device-screen amber">
          <p style="color:#8a7565;text-align:center;font-style:italic;margin:10px 0">Pod retrieved. Place it anywhere to resume monitoring.</p>
        </div>
        <div class="rivet-bl">●</div><div class="rivet-br">●</div>
      </div>`);
    return;
  }
  state.rempods[room] = { triggeredAt: null, triggerCount: 0, placedAt: state.timeMinutes };
  bumpToolUse("rempod");
  setToolBody("REM Pod", `
    <div class="device bakelite">
      <div class="device-label">REM-ATDD · PROXIMITY</div>
      <div class="device-model">TELESCOPING ANT · 4 LEDS</div>
      <div class="device-screen amber">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 0">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#60a0ff;box-shadow:0 0 10px #60a0ff"></span>
          <span style="color:#60a0ff;font-family:var(--serif-display);letter-spacing:3px;font-size:12px">ARMED</span>
        </div>
        <p style="color:#d4a878;text-align:center;font-style:italic;margin-bottom:6px">Placed in ${ROOMS[room].name}. It will sound if anything enters its small field.</p>
        <p style="color:#b09888;text-align:center;font-style:italic;margin-bottom:0;font-size:13px">You may now leave the room. The pod will notify you from wherever you are.</p>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
  audio.sfx("chime");
}

function openTool(toolId) {
  // First-use hint: show a Help-style tooltip the first time any tool is activated.
  if (!state._sawFirstToolHint) {
    state._sawFirstToolHint = true;
    narrate("<em>[Tip: hover any instrument to see what it does. Press <strong>?</strong> at the top for the full field-guide. Every tool contributes to your verdict — use them all.]</em>");
  }
  // Per-tool first-use hint
  if (!state._toolHints) state._toolHints = {};
  if (!state._toolHints[toolId]) {
    state._toolHints[toolId] = true;
    const hint = {
      kii:     "Five LEDs. Lights up near electromagnetic sources — real ghosts, but also old wiring and appliances. Verify with thermal.",
      spirit:  "Sweep frequencies for voices. Log words you think are meaningful. Some are noise. Threats raise the house's aggression.",
      ovilus:  "Open and leave it active. It will speak unprompted when an entity is near. The words go straight to the journal.",
      sls:     "Point and scan. Human-shaped figures are marked on the grid. Some furniture false-positives — use Capture to log real ones.",
      evp:     "Place in a room. Leave for 5+ in-game minutes. Return to review the waveform — whispers are marked, click to isolate.",
      thermal: "Cold = ghost. Hot = mundane (pipes, wiring). Log Debunk candidates — on Debunked runs they pay the most.",
      empump:  "Bait. Place in a room — attracts entities, raises aggression sharply. Also unlocks detection on tools that wouldn't normally see what's there.",
      rempod:  "Proximity alarm. Place and leave. It sounds from another room when something gets close. Drafts and mice can trigger it too — context matters.",
      camera:  "Film, not digital. Take photographs of any room. Review them in the Gallery to develop — sometimes a figure appears that was not there when the shutter clicked."
    }[toolId];
    if (hint) setTimeout(() => narrate("<em>[" + hint + "]</em>"), 400);
  }
  switch (toolId) {
    case "kii":     return toolKII();
    case "spirit":  return toolSpirit();
    case "ovilus":  return toolOvilus();
    case "sls":     return toolSLS();
    case "evp":     return toolEVP();
    case "thermal": return toolThermal();
    case "empump":  return toolEMPump();
    case "rempod":  return toolRemPod();
    case "camera":  return toolCamera();
  }
}
function setToolBody(title, html) {
  // Stop any prior tool's continuous audio before the new one opens.
  if (title.indexOf("Spirit Box") !== 0 && typeof audio !== "undefined" && audio.stopSpiritStatic) {
    audio.stopSpiritStatic();
  }
  // Leaving spirit-box for another tool? Kill the sweep loop.
  if (title.indexOf("Spirit Box") !== 0 && _spiritLoopTimer) {
    clearTimeout(_spiritLoopTimer);
    _spiritLoopTimer = null;
    _spiritCurrentWord = null;
  }
  document.getElementById("tool-title").textContent = title;
  document.getElementById("tool-body").innerHTML = html;
  openOverlay("overlay-tool");
}

// --- K-II Meter ---
function toolKII() {
  const room = ROOMS[state.currentRoom];
  let leds = room.emf || 0;
  const hits = entitiesDetectedBy("kii");
  if (hits.length > 0) leds = 5;
  advanceTime(1);
  bumpToolUse("kii");
  const ledHtml = Array.from({length:5}, (_,i) => `<div class="led ${i<leds?"on":""}"></div>`).join("");
  let msg = leds === 0 ? "Flat. No EMF activity here." :
            leds <= 2 ? "Low reading. Probably environmental — wiring, appliances." :
            leds <= 4 ? "Significant EMF. Worth investigating." :
                         "SATURATED. Something is very close.";
  if (hits.length > 0) {
    logEvidence("K-II Spike", `${hits.map(h=>ENTITIES[h].name).join(", ")} detected in ${room.name}.`);
    hits.forEach(h => state.entitiesSeen.add(h));
  } else if (leds >= 3) {
    logEvidence("K-II Environmental", `${leds}/5 reading in ${room.name} — likely wiring.`);
  }
  setToolBody("K-II EMF Meter", `
    <div class="device bakelite">
      <div class="device-label">EMF SAFETY RANGE</div>
      <div class="device-model">MODEL K-II · 50-1000 HZ</div>
      <div class="device-screen amber">
        <div style="text-align:center;color:#8a7565;font-family:var(--serif-display);font-size:10px;letter-spacing:3px;margin-bottom:10px">${room.name.toUpperCase()}</div>
        <div class="led-row">${ledHtml}</div>
        <p style="text-align:center;font-family:var(--serif-body);font-size:14px;color:#d4a878;margin-top:10px;margin-bottom:0;font-style:italic">${msg}</p>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
  if (leds >= 4) audio.sfx("kii_alarm"); else if (leds > 0) audio.sfx("kii_tick");
}

// --- Spirit Box ---
// Pick a random word from this room's pool + the universal pool, weighted by
// truth state + entity presence. Avoid repeating the last word. Occasionally
// returns null so not every sweep yields a word (silence is eerie too).
function pickWord(room) {
  const roomPool = WORD_POOLS[room] || [];
  const universal = (typeof WORD_POOL_UNIVERSAL !== "undefined") ? WORD_POOL_UNIVERSAL : [];
  const combined = roomPool.concat(universal);
  if (combined.length === 0) return null;
  const hasEntity = entitiesDetectedBy("spirit").length > 0 || state.truth === "haunted";
  // Silence chance — higher when no entity, lower when haunted
  const silenceChance = hasEntity ? (state.truth === "haunted" ? 0.12 : 0.22) : 0.45;
  if (Math.random() < silenceChance) return null;
  // Weighted pool — but universal words are always lighter weight so
  // room-specific clues still surface a good portion of the time.
  const biased = [];
  for (const w of roomPool) {
    let weight = 1;
    if (state.truth === "haunted") {
      weight = w.type === "clue" ? 3 : w.type === "threat" ? 2 : 1;
    } else if (state.truth === "partial") {
      weight = w.type === "noise" ? 2 : 1;
    } else {
      weight = w.type === "noise" ? 3 : 1;
    }
    if (!hasEntity) weight = w.type === "noise" ? 2 : 0.5;
    for (let i = 0; i < weight * 10; i++) biased.push(w);
  }
  // Universal pool added at flat weight ~6 per word (less than room-specific clues).
  for (const w of universal) {
    let weight = hasEntity ? 0.6 : 1;
    if (w.type === "threat" && state.truth === "haunted") weight *= 1.5;
    for (let i = 0; i < weight * 10; i++) biased.push(w);
  }
  // Pick, avoiding immediate repeat
  let pick = biased[Math.floor(Math.random() * biased.length)];
  if (state._lastSpiritWord && pick.word === state._lastSpiritWord && biased.length > 1) {
    // Try once more
    pick = biased[Math.floor(Math.random() * biased.length)];
  }
  state._lastSpiritWord = pick.word;
  return pick;
}
// Continuous spirit-box sweep — mimics a real P-SB7, which scans radio bands
// on its own every few seconds until powered off. Opening the tool starts
// the loop; closing the overlay stops it. "Log word" captures whatever is
// on screen right now.
let _spiritLoopTimer = null;
let _spiritCurrentWord = null;
function toolSpirit() {
  if (_spiritLoopTimer) { clearTimeout(_spiritLoopTimer); _spiritLoopTimer = null; }
  advanceTime(2);
  if (audio.startSpiritStatic) audio.startSpiritStatic();
  spiritSweep();
  // Schedule repeated sweeps every 3.5–5s
  function loop() {
    // Stop if the overlay is no longer the spirit box
    const titleEl = document.getElementById("tool-title");
    if (!titleEl || !titleEl.textContent.startsWith("Spirit Box")) {
      if (_spiritLoopTimer) { clearTimeout(_spiritLoopTimer); _spiritLoopTimer = null; }
      return;
    }
    spiritSweep();
    _spiritLoopTimer = setTimeout(loop, 3500 + Math.random() * 1500);
  }
  _spiritLoopTimer = setTimeout(loop, 3500 + Math.random() * 1500);
}

function spiritSweep() {
  const room = ROOMS[state.currentRoom];
  const w = pickWord(state.currentRoom);
  _spiritCurrentWord = w;
  const staticLine = "·˙·˙·˙·˙·˙·˙·˙·˙·˙·˙·˙·˙·˙·˙";
  // Dial + word color both keyed to word type so the result reads at a glance.
  //   clue  -> green  (insight)
  //   threat-> red    (warning)
  //   noise -> amber  (ambiguous, the default flavor)
  //   none  -> dim grey (silence)
  let dialPct;
  let dialColor = "#ffc060";
  let dialGlow = "#d06818";
  let wordClass = "";
  if (!w) {
    dialPct = 35 + Math.random() * 30;
    dialColor = "#6a5040"; dialGlow = "#3a2010";
  } else if (w.type === "clue") {
    dialPct = 70 + Math.random() * 22;
    dialColor = "#40d060"; dialGlow = "#208030";
    wordClass = " word-clue";
  } else if (w.type === "threat") {
    dialPct = 60 + Math.random() * 28;
    dialColor = "#d04040"; dialGlow = "#801010";
    wordClass = " word-threat";
  } else {
    dialPct = 8 + Math.random() * 28;
    dialColor = "#d4a878"; dialGlow = "#8a5828";
    wordClass = " word-noise";
  }
  const wordHtml = w
    ? `<div class="spirit-word${wordClass}">${w.word}</div>`
    : `<div class="spirit-word" style="color:#5a4850">---</div>`;
  const body = `
    <div class="device">
      <div class="device-label">RADIO SWEEP · SSB/AM</div>
      <div class="device-model">P-SB7 · 76 – 108 MHZ</div>
      <div class="device-screen amber">
        <div style="text-align:center;color:#8a7565;font-family:var(--serif-display);font-size:10px;letter-spacing:3px;margin-bottom:10px">${room.name.toUpperCase()}</div>
        <div style="position:relative;height:20px;background:linear-gradient(180deg,#1a0a08 0%,#0a0604 100%);border:1px solid #3a1808;margin-bottom:12px;overflow:visible">
          <!-- Tick marks evenly spaced across the band -->
          <div style="position:absolute;inset:0;display:flex;justify-content:space-between;padding:0 8px;align-items:flex-end">
            ${[76, 82, 88, 94, 100, 106].map(n => `
              <span style="display:flex;flex-direction:column;align-items:center;gap:2px">
                <span style="display:block;width:1px;height:6px;background:#6a3820"></span>
                <span style="color:#8a5028;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.5px">${n}</span>
              </span>
            `).join("")}
          </div>
          <div style="position:absolute;top:-3px;bottom:-3px;left:${dialPct}%;width:2px;background:${dialColor};box-shadow:0 0 6px ${dialColor},0 0 12px ${dialGlow}"></div>
        </div>
        <div class="spirit-static">${staticLine}</div>
        ${wordHtml}
        <div class="spirit-static">${staticLine}</div>
      </div>
      <div class="device-actions">
        <button onclick="spiritLogCurrent()" ${w ? "" : "disabled"}>${w ? "Log this word" : "— sweeping —"}</button>
        <span style="flex:1;text-align:center;font-size:11px;color:#8a7565;font-style:italic">The box sweeps on its own.</span>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`;
  // setToolBody only on the first sweep — reuse the container after that
  // so we don't tear down + rebuild the static bed or overlay on every tick
  const existingTitle = document.getElementById("tool-title");
  if (!existingTitle || !existingTitle.textContent.startsWith("Spirit Box")) {
    setToolBody("Spirit Box — P-SB7", body);
  } else {
    const tb = document.getElementById("tool-body");
    if (tb) tb.innerHTML = body;
  }
  if (w && typeof tts !== "undefined" && tts.speakDevice) {
    // Let the static stabilize, then the voice cuts through.
    // Lowercase the word before speech so TTS engines don't spell it out
    // (many treat ALL-CAPS as an acronym: "R. U. N." instead of "run").
    setTimeout(() => tts.speakDevice(w.word.toLowerCase(), { mode: "random", preempt: true }), 350);
  }
}

// Log whatever word is currently on the spirit-box display
function spiritLogCurrent() {
  if (!_spiritCurrentWord) { narrate("Nothing to log."); return; }
  spiritLogWord(_spiritCurrentWord.word, _spiritCurrentWord.type);
}
function spiritLogWord(word, type) {
  if (!word) { narrate("Nothing to log."); return; }
  const roomName = ROOMS[state.currentRoom].name;
  const detail = `Word captured: "${word}" in ${roomName}`;
  const already = state.evidence.some(e => e.type === "Spirit Box" && e.detail === detail);
  if (already) {
    narrate(`<em>[Already in journal — "${word}" in ${roomName}.]</em>`);
    return;
  }
  logEvidence("Spirit Box", detail);
  bumpToolUse("spirit");
  // Toast confirmation so the player gets visible feedback even while the
  // tool overlay is open on top of the journal.
  const typeLabel = type === "clue" ? "CLUE" : type === "threat" ? "THREAT" : "NOISE";
  showMilestone(`LOGGED · ${typeLabel}`, `<em>"${word}"</em> added to the journal (${roomName}).`);
  if (type === "threat") bumpAggression(1, "the spirit box spoke a threat");
}

// --- Ovilus ---
function toolOvilus() {
  // If AI is enabled, try to get a spirit word from the model. Falls back
  // to the random word pool if the call fails or times out (1.5s cap).
  if (typeof aiIsEnabled === "function" && aiIsEnabled()) {
    renderOvilusThinking();
    aiOvilusRace().then(aiWord => {
      renderOvilus(aiWord ? { word: aiWord.toUpperCase(), type: "clue", fromAI: true } : pickWord(state.currentRoom));
    });
    return;
  }
  const w = pickWord(state.currentRoom);
  renderOvilus(w);
}

async function aiOvilusRace() {
  const roomName = ROOMS[state.currentRoom]?.name || state.currentRoom;
  const lastEvidence = (state.evidence && state.evidence.slice(-1)[0]) || null;
  const detail = lastEvidence ? `Last logged: ${lastEvidence.type} — ${lastEvidence.detail}` : "";
  const p = aiOvilusWord({ roomName, detail });
  const timeout = new Promise(resolve => setTimeout(() => resolve(null), 4000));
  const word = await Promise.race([p, timeout]);
  // Sanitize to 1-2 words max
  if (!word) return null;
  const parts = word.split(/\s+/).slice(0, 2);
  const clean = parts.join(" ").replace(/[^\w\s'-]/g, "").trim();
  return clean || null;
}

function renderOvilusThinking() {
  setToolBody("Ovilus", `
    <div class="device steel">
      <div class="device-label">OVILUS · ITC DICTIONARY</div>
      <div class="device-model">ROM v3.2 · listening...</div>
      <div class="device-screen green">
        <div style="text-align:center;padding:24px 0;font-family:'Courier New',monospace;color:#60a070;font-size:14px">
          <span class="ovilus-thinking">◈ ◈ ◈</span>
        </div>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
}

function renderOvilus(w) {
  advanceTime(2);
  // Signal-strength readout + color both keyed to word type.
  //   clue  -> green  (insight)   5/5 bars
  //   threat-> red    (warning)   4/5 bars
  //   noise -> amber  (ambiguous) 2/5 bars
  //   none  -> dim    (silence)   1/5 bars
  let signalLevel, barType = "", wordClass = "";
  if (!w)                       { signalLevel = 1; barType = "silent"; }
  else if (w.type === "clue")   { signalLevel = 5; barType = "clue";   wordClass = " word-clue"; }
  else if (w.type === "threat") { signalLevel = 4; barType = "threat"; wordClass = " word-threat"; }
  else                          { signalLevel = 2; barType = "noise";  wordClass = " word-noise"; }
  let sigBars = "";
  for (let i = 1; i <= 5; i++) {
    sigBars += `<span class="ovilus-bar${i <= signalLevel ? " on " + barType : ""}"></span>`;
  }
  const msg = w
    ? `<div class="spirit-word${wordClass}">${w.word}</div><p style="text-align:center;color:#8a7565;font-style:italic;margin-bottom:0;font-size:13px">the device spoke on its own</p>`
    : `<div style="height:28px"></div><p style="text-align:center;color:#5a4850;font-style:italic;margin-bottom:0;font-size:13px">silent</p>`;
  if (w) {
    const aiTag = w.fromAI ? " (via the device)" : "";
    logEvidence("Ovilus", `Spoke "${w.word}" unprompted in ${ROOMS[state.currentRoom].name}${aiTag}`);
    bumpToolUse("ovilus");
  }
  setToolBody("Ovilus", `
    <div class="device steel">
      <div class="device-label">OVILUS · ITC DICTIONARY</div>
      <div class="device-model">ROM v3.2 · 1400 WORDS</div>
      <div class="device-screen green">
        ${msg}
        <div class="ovilus-sig-row">
          <span class="ovilus-sig-label">EMF TRIGGER</span>
          <span class="ovilus-sig-bars">${sigBars}</span>
        </div>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
  if (w) {
    audio.sfx("ovilus");
    if (typeof tts !== "undefined" && tts.speakDevice) {
      setTimeout(() => tts.speakDevice(w.word.toLowerCase(), { mode: "ovilus", preempt: true }), 200);
    }
  }
}

// --- SLS Camera ---
function toolSLS() {
  const room = ROOMS[state.currentRoom];
  const hits = entitiesDetectedBy("sls");
  advanceTime(2);
  let figures = "";
  hits.forEach((id, i) => {
    const x = 15 + (i * 25 + Math.random() * 15) % 70;
    const y = 20 + Math.random() * 30;
    figures += slsStickFigure(id, x, y);
  });
  // Debunk-mode false positives (furniture reads as figures)
  if (state.truth === "debunked" && Math.random() < 0.4) {
    figures += slsStickFigure("__false", 20 + Math.random()*60, 30 + Math.random()*30, 0.55);
  }
  const roomArt = typeof roomSvg === "function" ? roomSvg(room.id) : "";
  const body = `
    <div class="device steel">
      <div class="device-label">STRUCTURED LIGHT SENSOR</div>
      <div class="device-model">SLS-IR · 640×480 · LIVE</div>
      <div class="device-screen green" style="padding:4px">
        <div style="display:flex;justify-content:space-between;padding:2px 6px;color:#40a050;font-family:'Courier New',monospace;font-size:8px;letter-spacing:1px">
          <span>REC ●</span><span>${room.name.toUpperCase()}</span><span>${formatTime()}</span>
        </div>
        <div class="sls-grid">
          <div class="sls-room-bg">${roomArt}</div>
          <div class="sls-grid-lines"></div>
          <div class="sls-scan-line"></div>
          ${figures}
        </div>
      </div>
      <div class="device-actions">
        <button onclick="slsCapture()">Capture</button>
        <button onclick="toolSLS()">Re-scan</button>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`;
  setToolBody("SLS Camera", body);
  window._slsHits = hits;
  window._slsRoom = state.currentRoom;
  audio.sfx("sls");
}
function slsCapture() {
  const hits = window._slsHits || [];
  const room = window._slsRoom;
  // Per-room cooldown to stop spam-capture exploit.
  // You can capture once per room per 15 in-game minutes.
  if (!state._slsCaptures) state._slsCaptures = {};
  const lastCap = state._slsCaptures[room];
  if (lastCap != null && (state.timeMinutes - lastCap) < 15) {
    const waitMin = 15 - (state.timeMinutes - lastCap);
    narrate(`<em>[The SLS buffer is still saturated from the last capture in ${ROOMS[room].name}. Give it ${waitMin} minute${waitMin === 1 ? "" : "s"}.]</em>`);
    return;
  }
  state._slsCaptures[room] = state.timeMinutes;
  if (hits.length === 0) {
    logEvidence("SLS Capture", `No figures in frame (${ROOMS[room].name}).`);
  } else {
    hits.forEach(id => state.entitiesSeen.add(id));
    logEvidence("SLS Capture", `Humanoid figure(s) in ${ROOMS[room].name}: ${hits.map(h=>ENTITIES[h].name).join(", ")}`);
  }
  bumpToolUse("sls");
}

// Jump-scare face generator — 1960s B&W horror style.
// Three variants, picked at random; each uses filters for blur + grain + B&W.
const JUMPSCARE_FACES = ["mummified", "decayed", "skeletal"];
function randomJumpscareFace() {
  const kind = JUMPSCARE_FACES[Math.floor(Math.random() * JUMPSCARE_FACES.length)];
  return jumpscareFaceSvg(kind);
}

// Mummified: shrunken, leathery, taut skin, collapsed cheeks, lidless eyes
function faceMummified() {
  return `
    <!-- base head silhouette, narrower at jaw -->
    <path d="M 200 60 Q 110 70 100 200 Q 96 300 130 380 Q 170 470 200 475 Q 230 472 272 378 Q 310 298 302 198 Q 292 70 200 60 Z" fill="#aaa098"/>
    <!-- off-center jaw distortion for asymmetry -->
    <path d="M 130 380 Q 150 450 200 475 Q 240 465 272 378 Q 250 390 200 400 Q 160 392 130 380 Z" fill="#6a5e54"/>
    <!-- sunken temple shadows -->
    <path d="M 100 200 Q 130 260 110 320" fill="none" stroke="#2a221c" stroke-width="14" opacity="0.6"/>
    <path d="M 302 200 Q 270 250 292 320" fill="none" stroke="#2a221c" stroke-width="10" opacity="0.5"/>
    <!-- cheek bone suggestion (asymmetric) -->
    <ellipse cx="145" cy="270" rx="22" ry="14" fill="#d4ccc0" opacity="0.5"/>
    <ellipse cx="260" cy="260" rx="18" ry="11" fill="#d4ccc0" opacity="0.45"/>
    <!-- eye sockets: one higher, one lower — classic B&W horror wrongness -->
    <ellipse cx="155" cy="208" rx="38" ry="30" fill="#050505"/>
    <ellipse cx="258" cy="222" rx="34" ry="28" fill="#050505"/>
    <!-- dry pale eyes inside sockets -->
    <ellipse cx="158" cy="212" rx="14" ry="10" fill="#e8e0d4"/>
    <ellipse cx="258" cy="225" rx="12" ry="9" fill="#e8e0d4"/>
    <circle cx="156" cy="214" r="3" fill="#050505"/>
    <circle cx="256" cy="227" r="3" fill="#050505"/>
    <!-- nasal cavity: triangular gash -->
    <path d="M 200 270 L 180 340 L 200 348 L 218 340 Z" fill="#050505"/>
    <!-- mouth: pulled open, teeth showing -->
    <path d="M 155 390 Q 200 420 245 390 L 245 405 Q 200 430 155 405 Z" fill="#050505"/>
    <g fill="#b4ac9c">
      <rect x="162" y="392" width="10" height="16"/>
      <rect x="175" y="392" width="10" height="18"/>
      <rect x="188" y="392" width="10" height="20"/>
      <rect x="202" y="392" width="10" height="18"/>
      <rect x="215" y="392" width="10" height="16"/>
      <rect x="228" y="392" width="10" height="14"/>
    </g>
    <!-- wisps of hair -->
    <path d="M 110 90 Q 140 20 200 30 Q 270 24 300 100" stroke="#3a322a" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M 130 70 L 125 130 M 155 55 L 150 120 M 185 45 L 180 110 M 220 45 L 225 110 M 255 55 L 260 120 M 280 75 L 285 130" stroke="#2a221c" stroke-width="1.5" fill="none" opacity="0.6"/>
    <!-- lesions / stretched skin texture -->
    <path d="M 140 160 Q 155 180 145 195 M 260 150 Q 275 170 268 190 M 175 300 Q 185 320 178 335 M 230 310 Q 238 330 232 345" stroke="#3a322a" stroke-width="1.5" fill="none" opacity="0.55"/>
  `;
}

// Decayed: wet-looking rot, missing flesh, one side caved in, exposed bone patches
function faceDecayed() {
  return `
    <path d="M 200 60 Q 100 70 92 200 Q 92 310 140 395 Q 175 465 200 475 Q 225 470 258 395 Q 300 310 306 200 Q 298 70 200 60 Z" fill="#888076"/>
    <!-- left cheek caved in -->
    <path d="M 100 180 Q 120 230 90 270 Q 112 310 130 360 Q 95 330 92 280 Q 95 220 100 180 Z" fill="#1a120a"/>
    <!-- exposed bone patch on forehead -->
    <path d="M 170 90 Q 200 75 240 95 Q 255 130 230 145 Q 195 140 170 130 Z" fill="#d8cfc0" opacity="0.6"/>
    <!-- missing skin across nose / right cheek — uneven edge -->
    <path d="M 220 160 Q 265 165 285 210 Q 285 260 260 290 Q 238 275 222 240 Q 220 200 220 160 Z" fill="#c4b8a8" opacity="0.4"/>
    <!-- open wound on temple -->
    <path d="M 105 150 Q 118 175 100 200 Q 90 180 105 150 Z" fill="#0a0604"/>
    <!-- eye sockets — left caved behind shadow, right uncovered and staring -->
    <ellipse cx="148" cy="218" rx="40" ry="30" fill="#050505"/>
    <ellipse cx="266" cy="210" rx="36" ry="28" fill="#050505"/>
    <!-- right eye: wet, too wide, iris uneven -->
    <ellipse cx="266" cy="215" rx="22" ry="16" fill="#e0d8cc"/>
    <circle cx="270" cy="218" r="7" fill="#0a0604"/>
    <circle cx="272" cy="215" r="1.5" fill="#ffffff"/>
    <!-- left eye: just darkness, maybe a glint -->
    <circle cx="150" cy="222" r="2" fill="#a0988c"/>
    <!-- nasal cavity torn wider than it should be -->
    <path d="M 195 270 Q 180 295 175 340 Q 195 360 220 340 Q 218 295 205 270 Z" fill="#050505"/>
    <!-- mouth: lopsided, lower lip missing -->
    <path d="M 150 400 Q 175 415 205 418 Q 240 415 260 395 Q 245 430 200 438 Q 160 430 150 400 Z" fill="#0a0604"/>
    <!-- broken teeth -->
    <g fill="#a89c88">
      <polygon points="168,405 174,422 180,405"/>
      <rect x="182" y="405" width="8" height="19"/>
      <polygon points="192,405 200,425 208,405"/>
      <rect x="212" y="405" width="8" height="17"/>
      <polygon points="222,405 230,418 238,405"/>
    </g>
    <!-- stringy hair clumps -->
    <path d="M 110 75 L 95 180 M 130 55 L 118 160 M 165 45 L 160 120 M 235 45 L 240 115 M 275 55 L 285 170 M 295 80 L 308 190" stroke="#1a1208" stroke-width="2" fill="none" opacity="0.75"/>
    <!-- moisture drips -->
    <path d="M 150 340 Q 152 360 148 380 M 270 320 Q 272 345 268 370" stroke="#2a1a10" stroke-width="2" fill="none" opacity="0.5"/>
  `;
}

// Skeletal: bare skull, wide eye sockets, full teeth, no flesh — classic Castle skeleton
function faceSkeletal() {
  return `
    <!-- cranium: wider top, narrower jaw -->
    <path d="M 200 55 Q 98 65 88 190 Q 86 250 108 300 L 128 320 L 128 405 Q 128 430 148 440 L 180 448 L 192 478 L 208 478 L 220 448 L 252 440 Q 272 430 272 405 L 272 320 L 292 300 Q 314 250 312 190 Q 302 65 200 55 Z" fill="#d4cab8"/>
    <!-- cranium shadow on right side -->
    <path d="M 200 55 Q 280 78 308 160 Q 316 230 288 290 L 272 310 L 272 405 Q 265 432 252 440 L 230 446 Q 252 405 262 350 Q 268 280 260 200 Q 244 100 200 55 Z" fill="#9a9080" opacity="0.55"/>
    <!-- cranium suture lines -->
    <path d="M 200 55 Q 195 110 200 160 M 160 75 Q 150 130 160 180 M 240 75 Q 250 130 240 180" stroke="#5a4e40" stroke-width="1.2" fill="none" opacity="0.6"/>
    <!-- eye sockets: large, slightly uneven, deep black -->
    <ellipse cx="148" cy="195" rx="48" ry="42" fill="#000"/>
    <ellipse cx="252" cy="205" rx="44" ry="40" fill="#000"/>
    <!-- glints deep in sockets — pinpoint highlights -->
    <circle cx="152" cy="200" r="2" fill="#e0d8c8"/>
    <circle cx="254" cy="212" r="2" fill="#e0d8c8"/>
    <!-- socket upper rim shading for depth -->
    <path d="M 105 175 Q 148 155 192 180" stroke="#5a4e40" stroke-width="3" fill="none" opacity="0.5"/>
    <path d="M 210 185 Q 252 162 296 188" stroke="#5a4e40" stroke-width="3" fill="none" opacity="0.5"/>
    <!-- zygomatic arches -->
    <path d="M 100 225 Q 120 270 135 290" stroke="#8a8070" stroke-width="4" fill="none" opacity="0.7"/>
    <path d="M 298 235 Q 278 275 265 295" stroke="#8a8070" stroke-width="4" fill="none" opacity="0.7"/>
    <!-- nasal cavity: large upside-down heart -->
    <path d="M 200 245 Q 172 270 168 320 Q 180 340 200 345 Q 220 340 232 320 Q 228 270 200 245 Z" fill="#000"/>
    <!-- maxilla teeth (upper) -->
    <g fill="#e8dec8" stroke="#3a302a" stroke-width="0.8">
      <path d="M 145 355 L 150 395 L 158 395 L 158 355 Z"/>
      <path d="M 160 355 L 162 400 L 175 400 L 173 355 Z"/>
      <path d="M 176 355 L 178 403 L 193 403 L 191 355 Z"/>
      <path d="M 194 355 L 196 405 L 211 405 L 209 355 Z"/>
      <path d="M 212 355 L 214 403 L 227 403 L 225 355 Z"/>
      <path d="M 228 355 L 230 400 L 243 400 L 241 355 Z"/>
      <path d="M 244 355 L 246 395 L 254 395 L 256 355 Z"/>
    </g>
    <!-- mandible (jaw) -->
    <path d="M 130 405 Q 135 445 200 455 Q 265 445 270 405 L 258 405 Q 258 420 200 430 Q 142 420 142 405 Z" fill="#c0b6a4"/>
    <!-- mandible teeth (lower) -->
    <g fill="#e8dec8" stroke="#3a302a" stroke-width="0.8">
      <path d="M 150 410 L 152 435 L 162 435 L 164 410 Z"/>
      <path d="M 168 410 L 170 440 L 182 440 L 184 410 Z"/>
      <path d="M 188 410 L 190 442 L 202 442 L 204 410 Z"/>
      <path d="M 207 410 L 209 442 L 221 442 L 223 410 Z"/>
      <path d="M 227 410 L 229 440 L 240 440 L 242 410 Z"/>
      <path d="M 245 410 L 247 435 L 257 435 L 259 410 Z"/>
    </g>
    <!-- crack across forehead for asymmetry -->
    <path d="M 145 110 Q 170 130 200 115 Q 230 135 255 125" stroke="#3a302a" stroke-width="1.5" fill="none" opacity="0.8"/>
  `;
}

function jumpscareFaceSvg(kind) {
  // Shared filter defs: heavy grain, mild blur, strong B&W high-contrast.
  const defs = `
    <defs>
      <filter id="js-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"/>
        <feComposite in2="SourceGraphic" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="js-blur" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0.8"/>
      </filter>
      <filter id="js-bw">
        <feColorMatrix type="matrix" values="
          0.33 0.33 0.33 0 0
          0.33 0.33 0.33 0 0
          0.33 0.33 0.33 0 0
          0    0    0    1 0"/>
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.7" intercept="-0.25"/>
          <feFuncG type="linear" slope="1.7" intercept="-0.25"/>
          <feFuncB type="linear" slope="1.7" intercept="-0.25"/>
        </feComponentTransfer>
      </filter>
      <radialGradient id="js-light" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#c8c0b4" stop-opacity="1"/>
        <stop offset="40%" stop-color="#4a4038" stop-opacity="1"/>
        <stop offset="100%" stop-color="#000" stop-opacity="1"/>
      </radialGradient>
    </defs>`;
  let body = "";
  if (kind === "mummified") body = faceMummified();
  else if (kind === "decayed") body = faceDecayed();
  else body = faceSkeletal();
  return `
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      ${defs}
      <rect width="400" height="500" fill="#000"/>
      <g filter="url(#js-bw)">
        <g filter="url(#js-blur)">${body}</g>
      </g>
      <rect width="400" height="500" fill="url(#js-light)" opacity="0.25" style="mix-blend-mode:multiply"/>
    </svg>`;
}

// SVG ghost silhouettes by entity archetype
function ghostSvg(entId, xPct, yPct, opacity) {
  const op = opacity != null ? opacity : 0.85;
  const palette = {
    cold_mother:    "woman",
    listening_twin: "child",
    quiet_twin:     "child",
    knocker:        "man",
    woman_in_grey:  "woman",
    breath:         "mass",
    hands:          "hands",
    portrait:       "man",
    watcher:        "man_far"
  };
  const kind = palette[entId] || "unknown";
  // Each kind is a little stick-figure SVG in SLS green
  const w = kind === "man_far" ? 20 : kind === "child" ? 40 : 60;
  const h = kind === "man_far" ? 50 : kind === "child" ? 80 : 120;
  let body = "";
  switch (kind) {
    case "man":
      // Tall. Too tall. Head thrown back, jaw hung open. One arm longer.
      body = `
        <path d="M 28 120 L 4 120 Q 7 100 14 85 Q 10 70 15 54 Q 12 38 18 24 Q 20 16 26 11 Q 34 15 38 25 Q 36 40 42 56 Q 48 74 52 95 Q 58 120 52 120 Z" fill-opacity="0.14" stroke="none"/>
        <path d="M 28 120 L 12 120 Q 17 100 20 88 Q 15 74 20 60 Q 16 44 22 28 Q 25 18 28 14 Q 32 18 34 30 Q 30 48 36 66 Q 42 84 44 120 Z" fill-opacity="0.38" stroke="none"/>
        <ellipse cx="27" cy="14" rx="7" ry="11" fill-opacity="0.5" stroke="none"/>
        <path d="M 22 16 Q 24 20 22 24 Q 24 26 26 24" fill-opacity="0" stroke-opacity="0.7" stroke-width="0.8"/>
        <ellipse cx="23" cy="14" rx="2" ry="3" fill="#000" fill-opacity="0.95" stroke="none"/>
        <ellipse cx="31" cy="14" rx="2" ry="3" fill="#000" fill-opacity="0.95" stroke="none"/>
        <path d="M 25 20 Q 27 22 29 20" stroke-opacity="0.6" stroke-width="0.6" fill="none"/>
        <path d="M 26 24 L 26 30 L 30 30 L 30 24 Z" fill="#000" fill-opacity="0.55" stroke="none"/>
        <path d="M 16 46 Q 2 68 5 90 Q 8 100 4 110" stroke-width="1.3" fill="none" stroke-opacity="0.55" stroke-linecap="round"/>
        <path d="M 38 50 Q 52 68 54 85" stroke-width="0.9" fill="none" stroke-opacity="0.45" stroke-linecap="round"/>
        <path d="M 8 108 L 0 118 M 10 112 L 5 120 M 48 110 L 55 120" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
      break;
    case "woman":
      // Head tilted to the side. Long hair tangled over the face.
      // Fingers too long. Standing slightly off-axis.
      body = `
        <path d="M 32 120 L 2 120 Q 12 82 18 54 Q 13 38 19 22 Q 24 10 32 8 Q 39 11 40 22 Q 43 40 39 58 Q 48 82 58 120 Z" fill-opacity="0.14" stroke="none"/>
        <path d="M 32 120 L 10 120 Q 18 84 22 58 Q 17 42 23 26 Q 28 16 32 14 Q 36 16 36 28 Q 34 48 38 66 Q 44 88 50 120 Z" fill-opacity="0.36" stroke="none"/>
        <g transform="rotate(-8 32 16)">
          <ellipse cx="32" cy="14" rx="7" ry="10" fill-opacity="0.5" stroke="none"/>
          <path d="M 25 10 Q 24 16 25 24 Q 23 28 21 34 Q 18 40 17 50 Q 19 44 21 38 Q 22 32 24 28" fill-opacity="0.55" stroke="none"/>
          <path d="M 39 10 Q 42 18 43 28 Q 45 36 46 48 Q 44 38 42 32 Q 41 24 40 18" fill-opacity="0.55" stroke="none"/>
          <path d="M 27 16 Q 30 18 33 16" stroke-width="0.6" fill="none" stroke-opacity="0.8"/>
          <path d="M 30 16 Q 32 19 34 16" stroke-width="0.5" fill="none" stroke-opacity="0.8"/>
          <ellipse cx="29" cy="15" rx="1.2" ry="2.5" fill="#000" fill-opacity="0.9" stroke="none"/>
        </g>
        <path d="M 16 60 L 3 100 Q 2 112 4 118" stroke-width="1.1" fill="none" stroke-opacity="0.55" stroke-linecap="round"/>
        <path d="M 3 98 L 0 106 M 4 104 L 1 112 M 6 110 L 3 118" stroke-width="0.5" stroke-opacity="0.5" fill="none"/>
        <path d="M 44 60 Q 55 92 52 118" stroke-width="0.9" fill="none" stroke-opacity="0.45" stroke-linecap="round"/>
        <path d="M 52 110 L 55 120 M 54 112 L 58 120" stroke-width="0.4" stroke-opacity="0.4" fill="none"/>`;
      break;
    case "child":
      // Head too large for body. Arms hang wrong-long. Tilted face.
      // Hollow eyes. This is the Innocents vibe — children, but wrong.
      body = `
        <path d="M 20 80 L 2 80 Q 4 62 10 50 Q 6 36 10 24 Q 14 16 20 14 Q 26 16 30 24 Q 34 36 30 50 Q 36 62 38 80 Z" fill-opacity="0.16" stroke="none"/>
        <path d="M 20 80 L 6 80 Q 10 64 13 50 Q 10 38 14 28 Q 17 20 20 18 Q 23 20 26 28 Q 30 38 27 50 Q 30 64 34 80 Z" fill-opacity="0.42" stroke="none"/>
        <g transform="rotate(-5 20 12)">
          <ellipse cx="20" cy="12" rx="8" ry="10" fill-opacity="0.55" stroke="none"/>
          <path d="M 13 8 Q 12 14 13 22 M 27 8 Q 28 14 27 22" stroke-width="0.6" fill="none" stroke-opacity="0.7"/>
          <ellipse cx="17" cy="12" rx="1.8" ry="2.8" fill="#000" fill-opacity="0.95" stroke="none"/>
          <ellipse cx="23" cy="12" rx="1.8" ry="2.8" fill="#000" fill-opacity="0.95" stroke="none"/>
          <path d="M 17 17 L 23 17" stroke-width="0.8" stroke-opacity="0.75"/>
          <path d="M 19 19 L 21 19" stroke-width="0.4" stroke-opacity="0.6"/>
        </g>
        <path d="M 10 40 L 2 66 Q 1 74 2 78" stroke-width="1" fill="none" stroke-opacity="0.55" stroke-linecap="round"/>
        <path d="M 2 72 L 0 78 M 3 75 L 1 79" stroke-width="0.4" stroke-opacity="0.5" fill="none"/>
        <path d="M 30 40 L 36 68 Q 37 74 37 78" stroke-width="0.9" fill="none" stroke-opacity="0.5" stroke-linecap="round"/>`;
      break;
    case "mass":
      // Something trying to be a person and almost getting there.
      // Suggestion of a shoulder, half a face, a hand.
      // Not symmetrical. Not finished.
      body = `
        <path d="M 20 118 Q 10 100 14 78 Q 6 60 18 42 Q 14 30 26 22 Q 36 18 44 28 Q 52 40 46 58 Q 54 74 48 92 Q 52 110 44 118 Z" fill-opacity="0.1" stroke="none"/>
        <path d="M 22 118 Q 16 104 18 86 Q 10 70 22 54 Q 18 42 28 30 Q 34 26 40 34 Q 44 48 38 64 Q 46 78 40 92 Q 46 110 40 118 Z" fill-opacity="0.22" stroke="none"/>
        <path d="M 24 118 Q 20 104 22 92 Q 18 80 26 66 Q 22 54 30 42 Q 32 40 36 46 Q 36 58 32 70 Q 38 82 34 96 Q 38 112 34 118 Z" fill-opacity="0.36" stroke="none"/>
        <ellipse cx="32" cy="30" rx="5" ry="7" fill-opacity="0.45" stroke="none"/>
        <ellipse cx="30" cy="30" rx="1.2" ry="2" fill="#000" fill-opacity="0.9" stroke="none"/>
        <path d="M 34 34 Q 36 36 35 38" stroke-width="0.5" fill="none" stroke-opacity="0.7"/>
        <path d="M 42 70 Q 52 66 54 72 Q 54 76 50 76 Q 46 74 42 72" fill-opacity="0.4" stroke="none"/>
        <path d="M 50 72 L 55 70 M 51 74 L 56 73 M 52 75 L 57 75" stroke-width="0.5" stroke-opacity="0.6" fill="none"/>
        <path d="M 30 22 Q 20 40 24 60 Q 16 78 26 96 Q 22 110 32 118" stroke-width="0.4" fill="none" stroke-opacity="0.35"/>
        <path d="M 36 26 Q 46 42 40 62 Q 46 78 36 96" stroke-width="0.3" fill="none" stroke-opacity="0.35"/>`;
      break;
    case "hands":
      body = `
        <path d="M 0 120 Q 30 110 60 120 L 60 120 L 0 120 Z" fill-opacity="0.2" stroke="none"/>`;
      for (let i = 0; i < 5; i++) {
        const x = 8 + i * 11;
        const reachY = 28 + (i % 2) * 8 + Math.sin(i) * 4;
        const palmY = reachY + 12;
        body += `
          <path d="M ${x-5} 120 Q ${x-6} ${palmY+6} ${x-4} ${palmY} L ${x+4} ${palmY} Q ${x+6} ${palmY+6} ${x+5} 120 Z" fill-opacity="0.3" stroke="none"/>
          <ellipse cx="${x}" cy="${palmY}" rx="5" ry="4" fill-opacity="0.55" stroke="none"/>
          <path d="M ${x-4} ${palmY} L ${x-4} ${reachY+2}" stroke-width="1.3" stroke-opacity="0.7" stroke-linecap="round"/>
          <path d="M ${x-1.5} ${palmY-1} L ${x-2} ${reachY}" stroke-width="1.3" stroke-opacity="0.7" stroke-linecap="round"/>
          <path d="M ${x+1.5} ${palmY-1} L ${x+1} ${reachY-1}" stroke-width="1.3" stroke-opacity="0.7" stroke-linecap="round"/>
          <path d="M ${x+4} ${palmY} L ${x+4} ${reachY+3}" stroke-width="1.2" stroke-opacity="0.7" stroke-linecap="round"/>
          <path d="M ${x-5} ${palmY+2} Q ${x-8} ${palmY+6} ${x-7} ${palmY+10}" stroke-width="1" stroke-opacity="0.6" stroke-linecap="round" fill="none"/>`;
      }
      break;
    case "man_far":
      // Distant and thin. Looks like a coat on a rack, until it doesn't.
      body = `
        <path d="M 10 50 L 4 50 Q 5 42 6 34 Q 4 24 6 14 Q 7 10 9 8 L 9 4 L 11 4 L 11 8 Q 13 10 14 14 Q 16 24 14 34 Q 15 42 16 50 Z" fill-opacity="0.28" stroke="none"/>
        <ellipse cx="10" cy="6" rx="3" ry="3.5" fill-opacity="0.45" stroke="none"/>
        <ellipse cx="8.8" cy="6" rx="0.7" ry="1.2" fill="#000" fill-opacity="0.95" stroke="none"/>
        <ellipse cx="11.2" cy="6" rx="0.7" ry="1.2" fill="#000" fill-opacity="0.95" stroke="none"/>
        <path d="M 9 9 L 11 9" stroke-width="0.3" stroke-opacity="0.6"/>
        <path d="M 5 22 L 2 42" stroke-width="0.7" stroke-opacity="0.45" fill="none" stroke-linecap="round"/>
        <path d="M 15 22 L 18 42" stroke-width="0.5" stroke-opacity="0.4" fill="none" stroke-linecap="round"/>`;
      break;
    default:
      body = `<circle cx="30" cy="60" r="20" fill-opacity="0.4"/>`;
  }
  const fid = "ghostBlur_" + Math.random().toString(36).slice(2, 8);
  return `<div class="ghost-svg ghost-flicker" style="left:${xPct}%;top:${yPct}%;opacity:${op}">
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" stroke="#60e070" fill="#60e070" style="filter:drop-shadow(0 0 6px #40e040) drop-shadow(0 0 12px rgba(64,224,64,0.4))">
      <defs>
        <filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6"/>
        </filter>
      </defs>
      <g filter="url(#${fid})">${body}</g>
    </svg>
  </div>`;
}

// SLS stick-figure — matches real SLS camera output: skeletal lines
// with joint dots, drawn over the live camera feed. Size-scaled by archetype.
function slsStickFigure(entId, xPct, yPct, opacity) {
  const op = opacity != null ? opacity : 0.92;
  // Per-entity tendencies. Each may still diverge wildly on a given scan.
  const palette = {
    cold_mother:    { kind: "adult",  tilt: -4, bias: "reaching" },
    listening_twin: { kind: "child",  tilt: 0,  bias: "still" },
    quiet_twin:     { kind: "child",  tilt: -6, bias: "crouched" },
    knocker:        { kind: "adult",  tilt: 2,  bias: "stiff" },
    woman_in_grey:  { kind: "adult",  tilt: -8, bias: "hanging" },
    breath:         { kind: "adult",  tilt: 0,  bias: "incomplete" },
    hands:          { kind: "adult",  tilt: 0,  bias: "armsup" },
    portrait:       { kind: "adult",  tilt: 3,  bias: "still" },
    watcher:        { kind: "far",    tilt: 0,  bias: "stiff" },
    __false:        { kind: "adult",  tilt: 0,  bias: "noise", weak: true }
  };
  const cfg = palette[entId] || { kind: "adult", tilt: 0, bias: "still" };
  const weak = cfg.weak ? 0.55 : 1;
  const isChild = cfg.kind === "child";
  const isFar   = cfg.kind === "far";

  // Stochastic pose roll — the real SLS chaos.
  // Each scan, some body parts may be missing, elongated, or angled wrong.
  function roll(chance) { return Math.random() < chance; }
  const pose = {
    hasHead:   !roll(cfg.bias === "incomplete" ? 0.35 : 0.07),
    hasLeftArm:  !roll(cfg.bias === "incomplete" ? 0.3 : 0.12),
    hasRightArm: !roll(cfg.bias === "incomplete" ? 0.3 : 0.12),
    hasLeftLeg:  !roll(cfg.bias === "incomplete" ? 0.35 : 0.08),
    hasRightLeg: !roll(cfg.bias === "incomplete" ? 0.35 : 0.08),
    armLRaised: (cfg.bias === "reaching" || cfg.bias === "armsup") ? roll(0.75) : roll(0.32),
    armRRaised: (cfg.bias === "armsup") ? roll(0.75) : (cfg.bias === "reaching" ? roll(0.5) : roll(0.32)),
    armLLong:   roll(0.35),             // longer/more-often elongated
    armRLong:   roll(0.35),
    armLExtreme: roll(0.15),            // 2.5x length — really long
    armRExtreme: roll(0.15),
    armLSide:   roll(0.25),             // held out horizontally to the side
    armRSide:   roll(0.25),
    legLShort:  cfg.bias === "crouched" ? roll(0.7) : roll(0.18),
    legRShort:  cfg.bias === "crouched" ? roll(0.7) : roll(0.18),
    legLLong:   roll(0.18),             // stretched legs
    legRLong:   roll(0.18),
    legsApart:  roll(0.22),             // very wide stance
    noSpine:    roll(0.1),              // limbs float without torso line
    diagonalBody: roll(0.12),           // spine tilted hard left or right
    extraTilt:  roll(0.18) ? (Math.random() * 40 - 20) : 0, // +/-20deg on top of cfg.tilt
    noHead:     roll(cfg.bias === "incomplete" ? 0.35 : 0.12),   // unified with hasHead below
    hanging:    cfg.bias === "hanging",
    noise:      cfg.bias === "noise"
  };
  // Re-derive hasHead from the new noHead roll (overrides earlier)
  pose.hasHead = !pose.noHead;
  // Generous viewBox — extreme arms/legs would otherwise clip
  const w = isFar ? 70 : isChild ? 120 : 160;
  const h = isFar ? 110 : isChild ? 170 : 220;
  const hx = w / 2;
  // Key joint positions (in viewBox units)
  let headR, neckY, shoulderY, elbowY, handY, hipY, kneeY, footY;
  if (isFar) {
    headR = 5; neckY = 14; shoulderY = 18; elbowY = 32; handY = 46; hipY = 42; kneeY = 64; footY = 84;
  } else if (isChild) {
    headR = 9; neckY = 22; shoulderY = 30; elbowY = 56; handY = 80; hipY = 68; kneeY = 96; footY = 124;
  } else {
    headR = 11; neckY = 28; shoulderY = 40; elbowY = 78; handY = 114; hipY = 92; kneeY = 130; footY = 164;
  }
  const shoulderW = isChild ? 18 : isFar ? 10 : 24;
  const hipW = isChild ? 13 : isFar ? 7 : 18;
  const jointR = isFar ? 1.6 : 2.4;
  const stroke = isFar ? 1.3 : 2;
  // Asymmetry — one limb longer than the other, slight curve
  const armLdx = isChild ? -2 : -4;
  const armRdx = isChild ? 1 : 2;
  const stickColor = "#40e040";
  const jointColor = "#80ff80";
  const seg = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stickColor}" stroke-width="${stroke}" stroke-linecap="round"/>`;
  const joint = (x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${r || jointR}" fill="${jointColor}"/>`;

  let bodyParts = "";
  // Diagonal body: shift hips away from shoulders so the spine leans.
  const spineDx = pose.diagonalBody ? (Math.random() < 0.5 ? -18 : 18) : 0;
  const hipCx = hx + spineDx;

  // Head
  if (pose.hasHead) {
    const headCx = hx + (pose.diagonalBody ? -spineDx * 0.25 : 0);
    bodyParts += `<circle cx="${headCx}" cy="${headR + 2}" r="${headR}" fill="none" stroke="${stickColor}" stroke-width="${stroke}"/>`;
    bodyParts += joint(headCx, headR + 2);
  }
  // Spine (unless the pose has no spine — limbs float)
  if (!pose.noSpine) {
    bodyParts += seg(hx, pose.hasHead ? neckY : shoulderY - 2, hipCx, hipY);
  }

  // Shoulders — only draw if NOT no-spine (otherwise they visually orphan)
  if (!pose.noSpine) {
    bodyParts += seg(hx - shoulderW, shoulderY, hx + shoulderW, shoulderY);
  }
  bodyParts += joint(hx - shoulderW, shoulderY);
  bodyParts += joint(hx + shoulderW, shoulderY);

  // Arm length multipliers
  const armLFactor = pose.armLExtreme ? 2.5 : pose.armLLong ? 1.5 : 1;
  const armRFactor = pose.armRExtreme ? 2.5 : pose.armRLong ? 1.5 : 1;

  // Left arm — raised, sideways, elongated, or missing
  if (pose.hasLeftArm) {
    let eLx, eLy, hLx, hLy;
    if (pose.armLSide && !pose.armLRaised) {
      // Held horizontally out to the side
      const reach = 22 * armLFactor;
      eLx = hx - shoulderW - reach * 0.45;
      eLy = shoulderY + (Math.random() - 0.5) * 6;
      hLx = hx - shoulderW - reach;
      hLy = shoulderY + (Math.random() - 0.5) * 10;
    } else if (pose.armLRaised) {
      // Arm up toward/above head
      eLx = hx - shoulderW - 2;
      eLy = shoulderY - 18 * armLFactor * 0.5;
      hLx = hx - shoulderW - 4 - (armLFactor > 1.5 ? 6 : 0);
      hLy = shoulderY - 32 * armLFactor;
    } else {
      // Hanging down
      eLx = hx - shoulderW - 4;
      eLy = elbowY;
      hLx = hx - shoulderW - 10;
      hLy = handY + (armLFactor - 1) * 40;
    }
    bodyParts += seg(hx - shoulderW, shoulderY, eLx, eLy);
    bodyParts += joint(eLx, eLy);
    bodyParts += seg(eLx, eLy, hLx, hLy);
    bodyParts += joint(hLx, hLy);
  }

  // Right arm — symmetric logic
  if (pose.hasRightArm) {
    let eRx, eRy, hRx, hRy;
    if (pose.armRSide && !pose.armRRaised) {
      const reach = 22 * armRFactor;
      eRx = hx + shoulderW + reach * 0.45;
      eRy = shoulderY + (Math.random() - 0.5) * 6;
      hRx = hx + shoulderW + reach;
      hRy = shoulderY + (Math.random() - 0.5) * 10;
    } else if (pose.armRRaised) {
      eRx = hx + shoulderW + 2;
      eRy = shoulderY - 18 * armRFactor * 0.5;
      hRx = hx + shoulderW + 4 + (armRFactor > 1.5 ? 6 : 0);
      hRy = shoulderY - 32 * armRFactor;
    } else {
      eRx = hx + shoulderW + 2;
      eRy = elbowY;
      hRx = hx + shoulderW + 10;
      hRy = handY + (armRFactor - 1) * 40;
    }
    bodyParts += seg(hx + shoulderW, shoulderY, eRx, eRy);
    bodyParts += joint(eRx, eRy);
    bodyParts += seg(eRx, eRy, hRx, hRy);
    bodyParts += joint(hRx, hRy);
  }

  // Hips
  if (!pose.noSpine) {
    bodyParts += seg(hipCx - hipW, hipY, hipCx + hipW, hipY);
  }
  bodyParts += joint(hipCx - hipW, hipY);
  bodyParts += joint(hipCx + hipW, hipY);

  // Leg length + spread multipliers
  const legSpread = pose.legsApart ? 14 : 0;
  const legLFactor = pose.legLLong ? 1.5 : pose.legLShort ? 0.45 : 1;
  const legRFactor = pose.legRLong ? 1.5 : pose.legRShort ? 0.45 : 1;

  if (pose.hasLeftLeg) {
    const kYL = hipY + (kneeY - hipY) * legLFactor;
    const fYL = hipY + (footY - hipY) * legLFactor;
    const kXL = hipCx - hipW - 2 - legSpread * 0.4;
    const fXL = hipCx - hipW - 4 - legSpread;
    bodyParts += seg(hipCx - hipW, hipY, kXL, kYL);
    bodyParts += joint(kXL, kYL);
    bodyParts += seg(kXL, kYL, fXL, fYL);
    bodyParts += joint(fXL, fYL);
  }
  if (pose.hasRightLeg) {
    const kYR = hipY + (kneeY - hipY) * legRFactor;
    const fYR = hipY + (footY - hipY) * legRFactor;
    const kXR = hipCx + hipW + 1 + legSpread * 0.4;
    const fXR = hipCx + hipW + 2 + legSpread;
    bodyParts += seg(hipCx + hipW, hipY, kXR, kYR);
    bodyParts += joint(kXR, kYR);
    bodyParts += seg(kXR, kYR, fXR, fYR);
    bodyParts += joint(fXR, fYR);
  }

  // "Hanging" bias: Woman in Grey specifically — droop the head, slump shoulders
  const tiltFinal = (pose.hanging ? cfg.tilt - 8 : cfg.tilt) + (pose.extraTilt || 0);

  const body = `<g transform="rotate(${tiltFinal} ${hx} ${neckY})">${bodyParts}</g>`;
  // Unused locals (kept for clarity / future tweaks): armLdx, armRdx
  void armLdx; void armRdx;
  return `<div class="ghost-svg ghost-flicker" style="left:${xPct}%;bottom:${yPct}%;opacity:${op * weak}">
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="filter: drop-shadow(0 0 5px #40e040) drop-shadow(0 0 14px rgba(64,224,64,0.6));">
      ${body}
    </svg>
  </div>`;
}

// --- EVP Recorder ---
function toolEVP() {
  const room = state.currentRoom;
  advanceTime(1);
  const placed = state.evpPlacements[room];
  if (placed === undefined) {
    state.evpPlacements[room] = state.timeMinutes;
    setToolBody("EVP Recorder", `
      <div class="device bakelite">
        <div class="device-label">DIGITAL VOICE RECORDER</div>
        <div class="device-model">MFR · CONDENSER MIC · REC</div>
        <div class="device-screen amber">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 0">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff3020;box-shadow:0 0 8px #ff3020"></span>
            <span style="color:#ffc060;font-family:var(--serif-display);letter-spacing:3px;font-size:12px">RECORDING</span>
          </div>
          <p style="color:#d4a878;text-align:center;margin-bottom:6px;font-style:italic">You place the recorder in ${ROOMS[room].name} and walk away.</p>
          <p style="color:#8a7565;text-align:center;font-size:13px;margin-bottom:0">Needs 5 in-game minutes of silence before review.</p>
        </div>
        <div class="rivet-bl">●</div><div class="rivet-br">●</div>
      </div>`);
    return;
  }
  const elapsed = state.timeMinutes - placed;
  if (elapsed < 5) {
    setToolBody("EVP Recorder", `
      <div class="device bakelite">
        <div class="device-label">DIGITAL VOICE RECORDER</div>
        <div class="device-model">MFR · CONDENSER MIC · REC</div>
        <div class="device-screen amber">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 0">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff3020;box-shadow:0 0 8px #ff3020"></span>
            <span style="color:#ffc060;font-family:var(--serif-display);letter-spacing:3px;font-size:12px">RECORDING · ${5 - elapsed} MIN</span>
          </div>
          <p style="color:#d4a878;text-align:center;margin-bottom:0;font-style:italic">Still running in ${ROOMS[room].name}.</p>
        </div>
        <div class="rivet-bl">●</div><div class="rivet-br">●</div>
      </div>`);
    return;
  }
  // Ready to review
  const hits = entitiesDetectedBy("evp");
  const waveform = `<div class="evp-wave">` +
    Array.from({length: 20}, (_,i) => `<div style="position:absolute;left:${i*5}%;top:${30+Math.random()*40}%;width:2px;height:${5+Math.random()*20}px;background:#3a4a4a"></div>`).join("") +
    (hits.length > 0 ?
      hits.map((h,i) => `<div class="evp-marker whisper" style="left:${15 + i*20 + Math.random()*10}%" onclick="evpMarkWhisper('${h}')"></div>`).join("")
      : "") +
    `</div>`;
  const promptText = hits.length > 0
    ? "Scrub the waveform. Bright markers may be whispers — click them to isolate."
    : "Static throughout. You listen and listen. Nothing.";
  delete state.evpPlacements[room];
  if (state._evpReadyNotified) delete state._evpReadyNotified[room];
  setToolBody("EVP Recorder — Playback", `
    <div class="device bakelite">
      <div class="device-label">PLAYBACK · REVIEW</div>
      <div class="device-model">${ROOMS[room].name.toUpperCase()} · ${formatTime()}</div>
      <div class="device-screen amber">
        ${waveform}
        <p style="color:#d4a878;text-align:center;margin-bottom:0;font-style:italic;font-size:14px">${promptText}</p>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
  audio.sfx("evp_play");
}
function evpMarkWhisper(entId) {
  const e = ENTITIES[entId];
  state.entitiesSeen.add(entId);
  logEvidence("EVP Capture", `Whisper isolated: ${e.name}. ${e.description}`);
  narrate(`[On playback, a voice]: ${evpLine(entId)}`);
  bumpToolUse("evp");
}
function evpLine(entId) {
  const lines = {
    cold_mother:     "(a woman, weeping) 'evelyn… evelyn… let me out, please let me out…'",
    listening_twin:  "(a child, listening more than speaking) '…mother says it's almost time…'",
    quiet_twin:      "(a child's voice, very close to the microphone) 'don't open it.'",
    knocker:         "(a man's voice, low, ledger-patient) 'it was mine. it is mine. they are mine.'",
    woman_in_grey:   "(a woman, far away) 'the house. is. a. cage.'",
    tape_voice:      "(Adeline, firm) 'you will not sell. you will not open. you will not.'",
    breath:          "(a long, slow inhale, then a longer exhale, then nothing)",
    portrait:        "(a man, amused, close) 'so you can see me after all.'",
    hands:           "(many overlapping voices, nineteen of them) 'we were here first. we were here first. we were here first.'",
    watcher:         "(a man, across a great distance, yet very clear) 'you will be seen again.'",
    echo:            "(the house itself, in your own voice) 'hello. hello. hello.'",
    rocking_chair_scare: "(a child, humming a tune you almost recognise)"
  };
  return lines[entId] || "(an indistinct word, just at the edge of meaning)";
}

// --- Thermal Camera ---
// Thermal is the debunking tool — cold spots = ghost activity, hot spots = mundane sources.
function thermalReading(isCold) {
  const unit = (typeof settings !== "undefined" && settings.tempUnit) || "F";
  if (unit === "C") {
    return isCold ? "-4.2°C" : "+18.6°C";
  }
  return isCold ? "+24.4°F" : "+65.5°F";
}
const THERMAL_MUNDANE = {
  kitchen: "The copper pipes glow red. Old wiring pops a bright hotspot along the south wall.",
  conservatory: "A fingertip of cold blue traces the cracked pane. Wind, not a ghost.",
  master: "A pressure draft comes off the east wall — cold, but tracks with outside wind. Debunkable.",
  library: "The ledgers behind the desk are faintly warm — the wall shares a chimney flue.",
  wine_cellar: "A long narrow draft from floor level. Root-cellar air leak."
};
function toolThermal() {
  const room = ROOMS[state.currentRoom];
  const coldHits = entitiesDetectedBy("thermal");
  const cx = 28 + Math.random() * 44;
  const cy = 30 + Math.random() * 40;
  const isCold = coldHits.length > 0;
  const hotColor = isCold ? "#3050a0" : "#ffe080";
  const targetColor = isCold ? "#60a0ff" : "#ffc040";
  advanceTime(2);
  const unit = (typeof settings !== "undefined" && settings.tempUnit) || "F";
  // Realistic readings per truth/entity state
  const spotTemp = isCold
    ? (unit === "C" ? "-4.2" : "24.4")
    : (unit === "C" ? "18.6" : "65.5");
  const maxTemp = isCold
    ? (unit === "C" ? "18.6" : "65.5")
    : (unit === "C" ? "28.4" : "83.1");
  const minTemp = isCold
    ? (unit === "C" ? "-6.8" : "19.8")
    : (unit === "C" ? "14.0" : "57.2");
  const unitSuffix = "°" + unit;
  const dateStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "/");
  const roomArt = typeof roomSvg === "function" ? roomSvg(room.id) : "";
  const body = `
    <div class="device steel">
      <div class="device-label">FLIR · THERMAL IMAGER</div>
      <div class="device-model">-20°C TO +250°C · ε 0.95</div>
      <div class="device-screen" style="padding:4px">
        <div class="thermal" style="--cx:${cx}%;--cy:${cy}%;--hot:${hotColor};--target-color:${targetColor}">
          <div class="thermal-scene">
            <div class="thermal-room-bg">${roomArt}</div>
            <div class="thermal-heatmap"></div>
            <div class="thermal-target"></div>
            <div class="thermal-target-label">${spotTemp}</div>
            <div class="thermal-hud">
              <div class="max">Max <strong>${maxTemp}${unitSuffix}</strong></div>
              <div class="ts">${dateStr}<br>${formatTime()}</div>
            </div>
          </div>
          <div class="thermal-scale">
            <span class="thermal-scale-top">${maxTemp}</span>
            <span class="thermal-scale-bot">${minTemp}</span>
          </div>
        </div>
      </div>
      <p style="text-align:center;color:${isCold ? '#60a0ff' : '#d4a878'};font-style:italic;margin:12px 0 0">${isCold ? "COLD ANOMALY detected." : "Heat sources visible — no supernatural signature."}</p>
      <div class="device-actions">
        <button onclick="thermalLogCold()" ${isCold ? "" : "disabled"}>Log cold</button>
        <button onclick="thermalLogDebunk()">Log debunk</button>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`;
  setToolBody("Thermal Camera", body);
  window._thermalCold = coldHits;
  window._thermalRoom = state.currentRoom;
  audio.sfx("thermal");
}
function thermalLogCold() {
  const hits = window._thermalCold || [];
  if (hits.length === 0) return;
  hits.forEach(id => state.entitiesSeen.add(id));
  logEvidence("Thermal — Cold", `Unnatural cold spot: ${hits.map(h=>ENTITIES[h].name).join(", ")} in ${ROOMS[window._thermalRoom].name}`);
  bumpToolUse("thermal");
}
function thermalLogDebunk() {
  const room = window._thermalRoom;
  const mundane = THERMAL_MUNDANE[room];
  if (mundane) {
    logEvidence("Thermal — Debunk", `${ROOMS[room].name}: ${mundane}`);
  } else {
    logEvidence("Thermal — Debunk", `${ROOMS[room].name}: no supernatural heat signature.`);
  }
  bumpToolUse("thermal");
}

// --- EM Pump ---
function toolEMPump() {
  const room = state.currentRoom;
  if (state.empumpRoom === room) {
    state.empumpRoom = null;
    narrate("You pick up the EM pump. Its hum stops.");
    setToolBody("EM Pump", "<p>Pump retrieved.</p>");
    relaxAggression(1);
    return;
  }
  state.empumpRoom = room;
  bumpToolUse("empump");
  bumpAggression(2, "the pump is baiting");
  advanceTime(3);
  setToolBody("EM Pump", `
    <div class="device bakelite">
      <div class="device-label">EM FIELD GENERATOR</div>
      <div class="device-model">MFR · 20 GAUSS · ACTIVE</div>
      <div class="device-screen amber">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 0">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ffc060;box-shadow:0 0 10px #ffc060;animation:hbPulse 1.2s infinite"></span>
          <span style="color:#ffc060;font-family:var(--serif-display);letter-spacing:3px;font-size:12px">ACTIVE</span>
        </div>
        <p style="color:#d4a878;text-align:center;font-style:italic;margin-bottom:6px">Placed in ${ROOMS[room].name}. It hums, building a field.</p>
        <p style="color:#b09888;text-align:center;font-style:italic;margin-bottom:8px;font-size:13px">While active here, latent entities may register on tools that would normally miss them. Run your other instruments in this room to observe the effect.</p>
        <p style="color:#c05050;text-align:center;margin-bottom:0;font-family:var(--serif-display);font-size:10px;letter-spacing:3px">⚠ AGGRESSION RISING</p>
      </div>
      <div class="rivet-bl">●</div><div class="rivet-br">●</div>
    </div>`);
  audio.sfx("empump_on");
  if (state.truth === "haunted" && state.aggression >= 3) {
    logEvidence("Provocation", `EM pump triggered manifestation activity in ${ROOMS[room].name}.`);
  }
}

// === VERDICT ===
function showVerdict() {
  // Dawn crossfade: a soft amber/pink sweep announces sunrise before
  // the verdict overlay fades in. Skipped cleanly by reduce-motion.
  if (!document.body.classList.contains("reduce-motion")) {
    const sweep = document.createElement("div");
    sweep.className = "dawn-sweep";
    document.body.appendChild(sweep);
    // Quiet one intertitle too — "SUNRISE"
    if (typeof showIntertitle === "function") {
      showIntertitle("SUNRISE",
        "<em>The front door unlocks. The executor expects a verdict.</em>",
        { once: "sunrise" });
    }
    // Open the verdict overlay after the sweep has had time to bloom
    setTimeout(() => {
      openOverlay("overlay-verdict");
      document.getElementById("verdict-result").innerHTML = "";
      document.getElementById("verdict-restart").classList.add("hidden");
      document.querySelectorAll("#verdict-choices button").forEach(b => {
        b.disabled = false;
        b.onclick = () => submitVerdict(b.dataset.verdict);
      });
      // Fade out the dawn sweep once the overlay is visible
      setTimeout(() => { sweep.style.transition = "opacity 2s"; sweep.style.opacity = "0"; }, 500);
      setTimeout(() => sweep.remove(), 3000);
    }, 3800);
  } else {
    openOverlay("overlay-verdict");
    document.getElementById("verdict-result").innerHTML = "";
    document.getElementById("verdict-restart").classList.add("hidden");
    document.querySelectorAll("#verdict-choices button").forEach(b => {
      b.disabled = false;
      b.onclick = () => submitVerdict(b.dataset.verdict);
    });
  }
}

function submitVerdict(choice) {
  const correct = choice === state.truth;
  const resultEl = document.getElementById("verdict-result");

  // Achievements: verdict-based
  if (typeof unlockAchievement === "function") {
    if (correct) {
      unlockAchievement("first_correct");
      if (state.truth === "haunted")  unlockAchievement("haunted_correct");
      if (state.truth === "partial")  unlockAchievement("partial_correct");
      if (state.truth === "debunked") unlockAchievement("debunked_correct");
      unlockAchievement("survived_haunted"); // reached dawn (called from submit)
      // All three truths tracked across runs
      if (isAchievementUnlocked("haunted_correct") && isAchievementUnlocked("partial_correct") && isAchievementUnlocked("debunked_correct")) {
        unlockAchievement("all_three_truths");
      }
    }
    // Investigation-quality checks (fire on any verdict, correct or not)
    const toolsUsedCount = Object.values(state.toolUses || {}).filter(v => v > 0).length;
    if (toolsUsedCount >= 6) unlockAchievement("six_tools");
    if (toolsUsedCount >= 9) unlockAchievement("nine_tools");
    if ((state.calderCaught || []).length >= 5) unlockAchievement("all_calder");
    if (state._tapesHeard && TAPE_ARCHIVE && TAPE_ARCHIVE.every(t => state._tapesHeard[t.id])) {
      unlockAchievement("tapes_all");
    }
    if (typeof DOCUMENTS !== "undefined" && state.docsRead && Object.keys(DOCUMENTS).every(id => state.docsRead.has(id))) {
      unlockAchievement("read_all_docs");
    }
    // Photo-classification counts
    const photoReal = (state.photos || []).filter(p => p.decision === "logged" && p.anomaly).length;
    const photoDismissed = (state.photos || []).filter(p => p.decision === "dismissed" && p.anomaly).length;
    if (photoReal >= 5) unlockAchievement("photo_classify");
    if (photoDismissed >= 5) unlockAchievement("photo_debunk");
    // Haunted no-rest run
    if (correct && state.truth === "haunted" && !state._everRested) unlockAchievement("no_rest_haunted");
    // Iron nerves: reached max aggression at some point
    if (state._everMaxAgg) unlockAchievement("max_agg_survived");
    // Skipped Calder — never heard final walkthrough start
    if (!state._heardCalderFinish) unlockAchievement("skip_calder");
  }


  // Evidence category counts — every tool contributes its own category
  const cats = {
    kii:     state.evidence.filter(e => e.type.startsWith("K-II")).length,
    spirit:  state.evidence.filter(e => e.type === "Spirit Box").length,
    ovilus:  state.evidence.filter(e => e.type === "Ovilus").length,
    sls:     state.evidence.filter(e => e.type === "SLS Capture").length,
    evp:     state.evidence.filter(e => e.type === "EVP Capture").length,
    therm_c: state.evidence.filter(e => e.type === "Thermal — Cold").length,
    therm_d: state.evidence.filter(e => e.type === "Thermal — Debunk").length,
    knock:   state.evidence.filter(e => e.type === "Knock Response").length,
    prov:    state.evidence.filter(e => e.type === "Provocation").length,
    tape:    state.docsRead.has("tape_transcript") ? 1 : 0,
    env:     state.evidence.filter(e => e.type === "Environmental" || (e.type === "REM Pod" && /environmental/i.test(e.detail))).length,
    rempod:  state.evidence.filter(e => e.type === "REM Pod" && !/environmental/i.test(e.detail)).length
  };
  const caught = state.calderCaught.length;
  const entities = state.entitiesSeen.size;

  // Category scoring, per truth state.
  // Each category awards $ up to a cap, with different weights per truth.
  const scoring = {
    haunted: {
      // The house IS haunted — positive readings matter, Eliza unlocks bonus.
      kii:     { cap: 2000,  per: 1000, desc: "K-II spikes" },
      spirit:  { cap: 2000,  per: 500,  desc: "Spirit Box words" },
      ovilus:  { cap: 1500,  per: 500,  desc: "Ovilus utterances" },
      sls:     { cap: 3000,  per: 1000, desc: "SLS captures" },
      evp:     { cap: 4000,  per: 1500, desc: "EVP whispers" },
      therm_c: { cap: 2500,  per: 1000, desc: "Thermal cold spots" },
      therm_d: { cap: 500,   per: 250,  desc: "Debunks (partial credit)" },
      knock:   { cap: 1500,  per: 1500, desc: "Knock response" },
      prov:    { cap: 2000,  per: 1000, desc: "Provocation activity" },
      tape:    { cap: 5000,  per: 5000, desc: "Named Eliza (tape)" },
      env:     { cap: 0,     per: 0,    desc: "" },
      rempod:  { cap: 2000,  per: 1000, desc: "REM Pod entity triggers" }
    },
    partial: {
      // One real entity (Quiet Twin, EVP-only) plus lots of coincidence.
      kii:     { cap: 500,   per: 250,  desc: "K-II (mostly wiring here)" },
      spirit:  { cap: 500,   per: 250,  desc: "Spirit Box (mostly noise)" },
      ovilus:  { cap: 500,   per: 250,  desc: "Ovilus" },
      sls:     { cap: 1000,  per: 500,  desc: "SLS (one real figure possible)" },
      evp:     { cap: 5000,  per: 2500, desc: "EVP (the Quiet Twin is the real one)" },
      therm_c: { cap: 500,   per: 250,  desc: "Thermal cold spots" },
      therm_d: { cap: 2500,  per: 500,  desc: "Debunks" },
      knock:   { cap: 500,   per: 500,  desc: "Knock pattern" },
      prov:    { cap: 500,   per: 500,  desc: "Provocation" },
      tape:    { cap: 2000,  per: 2000, desc: "Found the tape" },
      env:     { cap: 1000,  per: 500,  desc: "Environmental explanations" },
      rempod:  { cap: 1500,  per: 1500, desc: "REM Pod entity trigger" }
    },
    debunked: {
      // Nothing supernatural. The honest verdict pays for investigation,
      // and debunks pay the most.
      kii:     { cap: 500,   per: 125,  desc: "K-II (environmental wiring)" },
      spirit:  { cap: 250,   per: 125,  desc: "Spirit Box (noise words)" },
      ovilus:  { cap: 250,   per: 125,  desc: "Ovilus (noise)" },
      sls:     { cap: 500,   per: 250,  desc: "SLS (false positives)" },
      evp:     { cap: 500,   per: 250,  desc: "EVP (pareidolia)" },
      therm_c: { cap: 250,   per: 125,  desc: "Thermal 'cold' (drafts)" },
      therm_d: { cap: 5000,  per: 1000, desc: "Thermal debunks (primary)" },
      knock:   { cap: 250,   per: 250,  desc: "Knock (pipes)" },
      prov:    { cap: 0,     per: 0,    desc: "" },
      tape:    { cap: 1000,  per: 1000, desc: "Adeline's tape (context)" },
      env:     { cap: 2000,  per: 500,  desc: "Environmental explanations" },
      rempod:  { cap: 0,     per: 0,    desc: "" }
    }
  };

  let lines = [];
  let investigationPay = 0;
  const rules = scoring[state.truth];
  for (const key in rules) {
    const r = rules[key];
    if (r.cap === 0) continue;
    const raw = cats[key] * r.per;
    const capped = Math.min(raw, r.cap);
    if (capped > 0) {
      investigationPay += capped;
      lines.push(`<li>${r.desc}: ${cats[key]} × $${r.per.toLocaleString()} → $${capped.toLocaleString()}${raw > capped ? " (capped)" : ""}</li>`);
    }
  }

  // Coverage bonus: how many tools did the player meaningfully use?
  const toolsUsed = Object.values(state.toolUses).filter(v => v > 0).length;
  const coverageBonus = toolsUsed >= 6 ? 3000 : toolsUsed >= 4 ? 1500 : 0;

  // Calder bonus: catching contradictions
  const calderBonus = caught * 500;

  // Named-entity bonus — player types the answer on the verdict screen.
  const nameInputEl = document.getElementById("verdict-name-input");
  const nameRaw = (nameInputEl ? (nameInputEl.value || "") : "").trim().toLowerCase();
  state._namedEntity = nameRaw;
  let namingBonus = 0;
  let namingNote = "";
  if (correct) {
    const namedEliza = /\beliza\b/.test(nameRaw);
    const namedQuietTwin = /\b(quiet\s*twin|henry|clara)\b/.test(nameRaw);
    const namedNone = /\b(none|nothing|no one|noone|no entity|nobody)\b/.test(nameRaw);
    const puzzleSolved = state.docsRead.has("tape_transcript") &&
      (state.docsRead.has("fire_clipping") || state.docsRead.has("margaret_diary") || state.docsRead.has("seance_carved"));
    if (state.truth === "haunted" && namedEliza && puzzleSolved) {
      namingBonus = 9000; namingNote = "Named <em>Eliza</em> — and you did the work. You found the 1851 fire, or Margaret's séance diary, or the carving beneath the table. Full lore unlocked.";
      if (typeof unlockAchievement === "function") unlockAchievement("name_eliza");
    } else if (state.truth === "haunted" && namedEliza && state.docsRead.has("tape_transcript")) {
      namingBonus = 4000; namingNote = "Named <em>Eliza</em> on the strength of Adeline's tape alone. Lucky guess — credit given.";
      if (typeof unlockAchievement === "function") unlockAchievement("name_eliza");
    } else if (state.truth === "partial" && namedQuietTwin && state.entitiesSeen.has("quiet_twin")) {
      namingBonus = 7000; namingNote = "Named the Quiet Twin correctly. Complete identification.";
    } else if (state.truth === "debunked" && namedNone) {
      namingBonus = 4000; namingNote = "Named no entity. An honest verdict.";
    } else if (nameRaw) {
      namingNote = "Named '<em>" + nameRaw.replace(/</g, "&lt;") + "</em>' — noted, but not the principal identification.";
    } else {
      namingNote = "You declined to name the entity.";
    }
  }

  // Correct-verdict multiplier on the investigation pot.
  // Wrong verdict: fee withheld but investigation pay survives at 30% (you still did work).
  const multiplier = correct ? 1.0 : 0.3;
  const base = correct ? 25000 : 0; // the fee itself requires a correct verdict
  const archivistBonus = state._tapeCompletionBonus ? 2000 : 0;
  const comboBonus = state._comboPayout || 0;
  const finalPot = Math.round(base + investigationPay * multiplier) + coverageBonus + calderBonus + namingBonus + archivistBonus + comboBonus;

  // SPOILER-FREE verdict screen. The actual truth, the entity identity,
  // the category labels ("EVP whispers" etc.) all leak the answer and
  // ruin replay. Player sees: accepted/rejected, totals, and a button
  // to optionally reveal the full debrief if they want spoilers.
  const outcome = correct
    ? `<div class="verdict-correct"><strong>The executor accepts your verdict.</strong></div>`
    : `<div class="verdict-wrong"><strong>The executor rejects your verdict.</strong> The base fee is withheld.</div>`;

  // Strip category descriptors for the per-line breakdown. Show count + total only.
  const sanitizedLines = lines.map(ln => {
    // lines entries look like '<li>desc: N × $X → $Y</li>'; hide desc.
    return ln.replace(/<li>([^:]*?):/, "<li>Evidence:");
  });

  const breakdown = `
    <p>Base fee: <strong>$${base.toLocaleString()}</strong> ${correct ? "" : "(withheld)"}</p>
    <p>Investigation scoring (× ${multiplier}):</p>
    <ul style="margin:6px 0 12px 20px;color:#a09080;font-size:13px;line-height:1.7">${sanitizedLines.join("") || "<li>No evidence logged.</li>"}</ul>
    <p>Tool coverage: ${toolsUsed} / 9 tools used${coverageBonus ? ` (+$${coverageBonus.toLocaleString()})` : ""}</p>
    <p>Calder inconsistencies: ${caught} / 5${calderBonus ? ` (+$${calderBonus.toLocaleString()})` : ""}</p>
    <p>Entities identified: ${entities} / 12</p>
    ${namingBonus ? `<p>Identification bonus applied.</p>` : ""}
    ${archivistBonus ? `<p>Archivist bonus (all tapes heard): +$${archivistBonus.toLocaleString()}</p>` : ""}
    ${comboBonus ? `<p>Puzzle rewards: +$${comboBonus.toLocaleString()}</p>` : ""}
    <p style="margin-top:12px;font-size:16px">Total payout: <strong>$${finalPot.toLocaleString()}</strong></p>
    <div style="margin-top:18px;padding-top:14px;border-top:1px solid #2a1810">
      <button id="verdict-reveal-btn" style="font-family:var(--serif-display);font-size:11px;letter-spacing:2px">Read the executor's dossier (spoilers)</button>
      <div id="verdict-reveal" style="display:none;margin-top:14px"></div>
    </div>
  `;

  resultEl.innerHTML = outcome + breakdown;

  // Persistent stats: record this verdict.
  if (typeof statsOnVerdict === "function") {
    const namedEliza = /\beliza\b/.test(nameRaw);
    statsOnVerdict(correct, state.truth, namedEliza, caught, state.aggression || 0, state.evidence.length);
  }

  // Silver Age "THE END?" placard — fires once on the first verdict submission
  // of the run, before anything else is read. Pure William Castle capper.
  if (!state._endPlacardShown && typeof showIntertitle === "function") {
    state._endPlacardShown = true;
    showIntertitle("",
      "<span class='big'>THE END?</span><em>Do you believe you have the truth of it?</em>",
      { once: "end_placard" });
  }
  // Optional spoiler reveal — stores the full truth + epilogue for when the player wants it.
  const revealBtn = document.getElementById("verdict-reveal-btn");
  if (revealBtn) {
    revealBtn.onclick = () => {
      const truthNames = { haunted: "HAUNTED", partial: "PARTIALLY HAUNTED", debunked: "DEBUNKED" };
      const truthLine = correct
        ? `<p style="color:#80c080"><strong>Your verdict was correct.</strong> The house was, in fact, ${truthNames[state.truth]}.</p>`
        : `<p style="color:#c05050"><strong>Your verdict was incorrect.</strong> The house was, in fact, ${truthNames[state.truth]}. You answered ${truthNames[choice]}.</p>`;
      const naming = namingNote ? `<p style="color:#c8b8a0;font-size:14px">Identification: ${namingNote}</p>` : "";
      document.getElementById("verdict-reveal").innerHTML =
        truthLine + naming +
        `<p style="margin-top:12px;color:#8a7565;font-style:italic">${truthFlavor()}</p>`;
      document.getElementById("verdict-reveal").style.display = "block";
      revealBtn.disabled = true;
      revealBtn.textContent = "Dossier read.";
    };
  }
  audio.sfx("verdict");
  document.querySelectorAll("#verdict-choices button").forEach(b => b.disabled = true);
  document.getElementById("verdict-restart").classList.remove("hidden");
}
function truthFlavor() {
  const name = state._namedEntity || "";
  const caught = state.calderCaught.length;
  const saw = state.entitiesSeen;
  const tape = state.docsRead.has("tape_transcript");
  const trust = state.docsRead.has("trust");
  const letter = state.docsRead.has("sealed_letter");
  const coroner = state.docsRead.has("coroner");
  const parts = [];

  if (state.truth === "haunted") {
    if (/\beliza\b/.test(name)) {
      parts.push("<em>You have named Eliza — the collective name the nineteen burned in 1851 chose for themselves, and the name Adeline learned, at the last, to speak aloud.</em>");
      if (state.docsRead.has("seance_carved")) parts.push("<em>You lifted the séance cloth and found the carving. You read Eliza Halliwell's name in the Gazette, or the diary, or both. You earned the name.</em>");
      parts.push("The executor is satisfied. The trust is renewed for another generation. The deadbolt on the cellar door is checked, by a hand not Calder's, and found to be in good order.");
    } else if (tape) {
      // still haunted, still correct — continues in the next branch
    }
    // Eliza confrontation consequences (if the scene fired)
    if (state._elizaChoice === "yes") {
      parts.push("<em>At four in the morning, when she asked, you said yes. The pact continues. Ashgrove House keeps its people, and the people keep it.</em>");
    } else if (state._elizaChoice === "no") {
      parts.push("<em>At four in the morning, when she asked, you said NO. You submitted a Haunted verdict anyway. The trust will quietly void the sale and send a second investigator next quarter. Somewhere, a door is being widened.</em>");
    } else if (state._elizaChoice === "refuse") {
      parts.push("<em>You refused to answer her. She laughed. You will think about that laugh for some time.</em>");
    } else if (state._elizaChoice === "name") {
      parts.push("<em>You demanded the chorus say its name, and it did — all nineteen of them, in unison. That identification is worth a great deal, and will cost you, in increments, for the rest of your life.</em>");
    } else if (!tape && !/\beliza\b/.test(name)) {
      parts.push("Your verdict is correct. You did not, however, find the tape in Adeline's study, which is the key the executor expected you to turn.");
      parts.push("The trust renews. Another investigator will be called, in due course.");
    } else if (tape && !/\beliza\b/.test(name)) {
      parts.push("You heard Adeline's tape. You did not, when asked, name what she named. Still, the verdict is correct. Calder will carry the keys another year.");
    }
    if (trust && letter) parts.push("<em>In the years that follow, you will remember the founding language of the trust — 'closed, maintained, and undisturbed in perpetuity' — and you will understand that you have just helped it keep its promise.</em>");
    if (caught >= 3) parts.push("<em>Mr. Calder, you suspect, will dream of you. You are not sure he will dream kindly.</em>");
  }
  else if (state.truth === "partial") {
    if (/\b(quiet\s*twin|henry|clara)\b/.test(name) && saw.has("quiet_twin")) {
      parts.push("<em>You have named the Quiet Twin — and you are, so far as anyone living has ever been, correct.</em>");
      parts.push("The commissioning developer reviews your evidence. The nursery east wall is opened, under careful supervision, that spring. What is found behind it is not, at the developer's request, ever officially reported.");
    } else if (saw.has("quiet_twin")) {
      parts.push("You captured the Quiet Twin on the EVP recorder. You did not, when the time came, give him a name.");
      parts.push("The developer is satisfied with the verdict. The east wall is not, in the event, opened. It remains as Evelyn left it.");
    } else {
      parts.push("Your verdict is technically correct, though you did not meet the one who made it so. He remains, so far as he has ever been, where he has been since 1935.");
    }
    if (coroner && caught >= 2) parts.push("<em>The coroner's report on Evelyn is quietly, permanently reclassified. The word</em> undetermined <em>is, in its modest way, a kind of monument.</em>");
  }
  else { // debunked
    if (/\b(none|nothing|no one|noone|no entity|nobody)\b/.test(name)) {
      parts.push("<em>You named no entity, and you were right to.</em>");
      parts.push("Ashgrove House is, in the end, a house — a cold-pressure-differential here, a water-hammer there, a century of grief for context. The developer begins restoration in April. The family cemetery is left intact.");
    } else {
      parts.push("Your verdict is correct. Your identification of an entity is, under the circumstances, generous.");
      parts.push("The developer proceeds regardless. Ashgrove opens as a bed-and-breakfast in 1976. The nursery is renumbered Room 9 and let to guests without incident for forty-seven years.");
    }
    if (state.evidence.filter(e => e.type === "Thermal — Debunk").length >= 5) {
      parts.push("<em>Your thermal readings are, for decades afterward, cited in the literature as a model debunking methodology. You are not, for reasons you do not entirely understand, ever asked to work another case.</em>");
    }
  }

  if (caught >= 4) parts.push("<em>You caught Mr. Calder in every inconsistency he carried. He paid out the rest of his life in small apologies, to you and to no one.</em>");
  else if (caught === 0 && state.calderLeft) parts.push("<em>You caught Mr. Calder in nothing. He is, in his way, grateful; and you, in yours, remain in his debt.</em>");

  return parts.join(" ");
}

document.getElementById("verdict-restart").addEventListener("click", () => location.reload());

// === BOOT ===
document.getElementById("btn-start").addEventListener("click", () => {
  // If multiple stories are registered and the user picked one, load it.
  if (typeof STORIES !== "undefined") {
    const picker = document.getElementById("story-picker");
    const chosen = picker ? picker.value : "ashgrove";
    if (chosen && chosen !== "ashgrove" && typeof loadStory === "function") {
      loadStory(chosen);
    }
    const st = STORIES[chosen] || STORIES.ashgrove;
    const allowed = (st && st.truths) || ["haunted", "partial", "debunked"];
    state.truth = allowed[Math.floor(Math.random() * allowed.length)];
  } else {
    const truths = ["haunted", "partial", "debunked"];
    state.truth = truths[Math.floor(Math.random() * truths.length)];
  }
  state.aggression = 0;
  state._roomTimeStart = state.timeMinutes;
  state._lastRestAt = state.timeMinutes;

  // --- Silver Age prologue: full-screen narrator monologue before the game begins.
  // Replaces the title panel with a fade-in narrator box; the backdrop stays.
  const titleOverlay = document.getElementById("overlay-title");
  const titlePanel = titleOverlay.querySelector(".title-panel");
  titlePanel.classList.add("fade-out");
  // Build a prologue panel over the same backdrop
  const prologue = document.createElement("div");
  prologue.className = "overlay-inner title-panel prologue-panel";
  prologue.innerHTML = `
    <div class="title-stamp">A word, before we begin</div>
    <div class="prologue-text" id="prologue-text">
      <p>You have, I see, accepted the terms. Very well.</p>
      <p>The executor you will not meet; the fee, should you live to collect it, is generous. The house before you is a <em>peculiar</em> arrangement — less a dwelling, in the opinion of the present narrator, than an <em>appointment kept</em>.</p>
      <p>You will be given instruments. You will be given, if you will accept it, a <em>warning</em>: the rooms of Ashgrove House are not, strictly speaking, empty. Some of them simply have not been occupied in a long time. That, as you will discover, is not the same thing.</p>
      <p class="prologue-sign">— The Management</p>
    </div>
    <button id="btn-prologue-continue">Continue into the night</button>
  `;
  titlePanel.parentNode.insertBefore(prologue, titlePanel.nextSibling);
  // Speak the prologue aloud if TTS is on
  setTimeout(() => {
    const proseEl = document.getElementById("prologue-text");
    if (proseEl && typeof tts !== "undefined" && tts.speak) {
      tts.speak(proseEl.textContent.replace(/— The Management/, ""));
    }
  }, 400);
  document.getElementById("btn-prologue-continue").addEventListener("click", () => {
    if (typeof tts !== "undefined") tts.stop();
    closeOverlay("overlay-title");
    // If the player has not dismissed the how-to with the checkbox, show it now.
    if (typeof settings !== "undefined" && !settings.skipHowto) {
      openOverlay("overlay-howto");
      // Reflect any prior checkbox state
      const chk = document.getElementById("chk-skip-howto");
      if (chk) chk.checked = !!settings.skipHowto;
    } else {
      startGameProper();
    }
  });
});

// Separated so the how-to and the direct path both reuse it.
function startGameProper() {
  if (typeof statsOnRunStart === "function") statsOnRunStart();
  // Roll weather for this investigation and apply it.
  if (typeof rollWeather === "function") {
    const w = rollWeather();
    if (typeof applyWeather === "function") applyWeather(w);
    state._weatherObj = w;
  }
  if (typeof showIntertitle === "function") {
    showIntertitle("A NIGHT AT ASHGROVE",
      "<em>The executor's letter was brief; the fee, considerable. One does not read such letters a second time. One packs one's instruments.</em>",
      { once: "opening" });
  }
  renderRoom();
  renderDanger();
  setTimeout(() => {
    narrate("<em>The executor's letter directed you to arrive before sundown, and you are — as is customary — cutting it close.</em>");
    if (state._weatherObj && typeof narrateWeather === "function") {
      setTimeout(() => narrateWeather(state._weatherObj), 2000);
    }
  }, 4200);
}

// How-to "Begin" and the checkbox.
// The game scripts load at end-of-body, so DOMContentLoaded has already
// fired by the time this runs. Bind immediately.
(function bindHowtoBegin() {
  const beginBtn = document.getElementById("btn-howto-begin");
  if (!beginBtn) return;
  beginBtn.addEventListener("click", () => {
    const chk = document.getElementById("chk-skip-howto");
    if (chk && chk.checked && typeof settings !== "undefined") {
      settings.skipHowto = true;
      if (typeof saveSettings === "function") saveSettings();
    }
    closeOverlay("overlay-howto");
    startGameProper();
  });
})();

// Initial HUD
renderHud();
renderInventory();
