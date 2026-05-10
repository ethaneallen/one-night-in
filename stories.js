// stories.js — extension point for additional chapters of One Night In…
//
// Ashgrove House is Chapter I, baked into data.js.
// Future stories register themselves here via registerStory(). Each story
// provides its own ROOMS, ENTITIES, CALDER_DIALOGUE (or analogue NPC),
// DOCUMENTS, WORD_POOLS, SIGNATURE_SCARES, and optional overrides.
//
// To add a new story:
//   1. Create stories/<slug>.js that calls registerStory({ ... })
//   2. Add <script src="stories/<slug>.js"> to index.html AFTER data.js
//   3. The title screen will show a "Choose Investigation" list when
//      more than one story is registered.
//
// Fields (all required unless noted):
//   id:            short machine-readable slug
//   title:         display name ("Ashgrove House")
//   subtitle:      one-line hook ("An Investigation in One Night")
//   byline:        optional attribution line
//   startRoom:     room id where the investigator arrives
//   rooms:         object map of room definitions, same shape as ROOMS
//   entities:      same shape as ENTITIES
//   documents:     same shape as DOCUMENTS
//   wordPools:     same shape as WORD_POOLS
//   dialogue:      main NPC dialogue tree (Calder analogue)
//   contradictions: calderClaim -> contradiction text
//   scares:        array, same shape as SIGNATURE_SCARES
//   truths:        which truth states this story supports
//                  (default ["haunted","partial","debunked"])
//   epilogue:      optional fn(state) -> string, overrides default
//   titleArt:      optional SVG string for title backdrop
//
"use strict";

const STORIES = {};

function registerStory(story) {
  if (!story || !story.id) { console.warn("registerStory: missing id"); return; }
  STORIES[story.id] = story;
}

function listStories() {
  return Object.values(STORIES);
}

function loadStory(id) {
  const story = STORIES[id];
  if (!story) { console.warn("loadStory: unknown", id); return false; }
  // Swap the module-level data references the engine reads.
  if (story.rooms)          Object.assign(ROOMS, story.rooms);
  if (story.entities)       Object.assign(ENTITIES, story.entities);
  if (story.documents)      Object.assign(DOCUMENTS, story.documents);
  if (story.wordPools)      Object.assign(WORD_POOLS, story.wordPools);
  if (story.dialogue)       Object.assign(CALDER_DIALOGUE, story.dialogue);
  if (story.contradictions) Object.assign(CALDER_CONTRADICTIONS, story.contradictions);
  if (story.scares)         SIGNATURE_SCARES.push(...story.scares);
  if (story.startRoom)      state.currentRoom = story.startRoom;
  state._story = id;
  return true;
}

// Register the default Ashgrove story so the registry isn't empty.
// Because data.js already sets the global ROOMS/ENTITIES/etc, we only
// need to register a reference — no data copy.
registerStory({
  id: "ashgrove",
  title: "Ashgrove House",
  subtitle: "An Investigation in One Night",
  byline: "after the manner of Mr. V. Price & Mr. W. Castle",
  startRoom: "drive",
  // Data lives in data.js directly — we don't duplicate it here.
  // Future stories will provide their own rooms/entities/etc.
  rooms: null, entities: null, documents: null,
  wordPools: null, dialogue: null, contradictions: null, scares: null,
  truths: ["haunted", "partial", "debunked"]
});

// Inject a story picker into the title screen when 2+ stories exist.
(function injectStoryPicker() {
  const stories = listStories();
  if (stories.length < 2) return;
  const panel = document.querySelector(".title-panel");
  const btn = document.getElementById("btn-start");
  if (!panel || !btn) return;
  const wrap = document.createElement("div");
  wrap.className = "story-picker-wrap";
  wrap.innerHTML = `
    <div class="verdict-label" style="text-align:center">Choose your investigation</div>
    <select id="story-picker" class="story-picker">
      ${stories.map(s => `<option value="${s.id}">${s.title} — <em>${s.subtitle || ""}</em></option>`).join("")}
    </select>
  `;
  panel.insertBefore(wrap, btn);
})();
