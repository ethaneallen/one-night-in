// Template for a new story. Copy this file, rename it, fill in the pieces.
// Wire it into index.html after <script src="stories.js">.
"use strict";

registerStory({
  id: "waverly",                           // unique slug
  title: "Waverly Hills",                  // title card
  subtitle: "An Investigation in One Night",
  byline: "",                              // optional

  // Room id where the investigator begins. Must exist in rooms below.
  startRoom: "gates",

  // Which truths this story can roll. Remove any to exclude.
  truths: ["haunted", "partial", "debunked"],

  // ROOM DEFINITIONS — same shape as default ROOMS.
  // Each room: { id, name, floor, description, hotspots:[...], emf, entities:[...] }
  rooms: {
    gates: {
      id: "gates",
      name: "The Gates",
      floor: "ARRIVAL",
      description: "<em>(Write a Price-voiced description here.)</em>",
      hotspots: [
        // { id, label, action, target }
        // action: travel | dialogue | document | examine | knock | frontdoor | desk | portrait | tape | nursery_door | locked_door
      ],
      emf: 0,
      entities: []
    },
    // ...more rooms
  },

  // ENTITIES — what haunts this location.
  // Each: { name, room, film, description, detect:{kii,spirit,ovilus,sls,evp,thermal,empump,knock,tape}, realInStates:[...], environmental:{debunked:"..."} }
  entities: {
    // example_entity: { ... }
  },

  // DOCUMENTS — items the player can Read.
  // Each: { title, body, contradicts?: "claimKey" }
  documents: {
    // example_doc: { title: "...", body: "...", contradicts: "npc_claim_key" }
  },

  // WORD POOLS per room for Spirit Box / Ovilus.
  // { roomId: [ { word, type } ] }   type: "clue" | "threat" | "noise"
  wordPools: {
    gates: [
      // { word: "LEAVE", type: "threat" }
    ]
  },

  // Main-NPC dialogue tree. Same shape as CALDER_DIALOGUE.
  dialogue: {
    // npc_arrival: { speaker, line, calderClaim?, choices: [{ text, goto, action? }] }
  },

  // Contradictions the player can catch — keyed by dialogue's calderClaim values.
  contradictions: {
    // example_claim: "NPC: '...' Document: '...'"
  },

  // Signature scares — same shape as SIGNATURE_SCARES.
  scares: [
    // {
    //   id: "story_scare_1",
    //   when: ({ s }) => s.calderLeft && s.currentRoom === "morgue" && s.timeMinutes >= 24*60,
    //   truths: ["haunted"],
    //   fire: () => {
    //     narrate("<em>...</em>");
    //     audio.sfx("whisper");
    //     showIntertitle("CHAPTER TITLE", "<em>Body.</em>", { once: "story_scare_1" });
    //   }
    // }
  ]
});
