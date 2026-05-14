// One Night In… — Chapter I: Ashgrove House — game data
// All 12 rooms, 12 entities, tool-visibility matrix, Calder dialogue, word pools.

const ROOMS = {
  drive: {
    id: "drive",
    name: "The Drive",
    floor: "ARRIVAL",
    description: "Gravel, speaking faintly beneath your shoes — the sort of sound a house makes to announce an arrival it had hoped would be postponed. Ashgrove House rises before you: slate, and much glass, though you notice — with a small, cold feeling at the base of your neck — that no window faces east above the porch. A man in his seventies raises one hand from the steps. Mr. Calder. The groundskeeper.",
    short: "You arrive at Ashgrove House. No windows face east. Mr. Calder, the groundskeeper, waves from the porch.",
    hotspots: [
      { id: "calder-intro", label: "Greet Calder", action: "dialogue", target: "calder_arrival" },
      { id: "enter-house", label: "Enter the house", action: "travel", target: "entry_hall", requires: "walkthrough_start" }
    ],
    emf: 0,
    lockedUntil: null
  },
  entry_hall: {
    id: "entry_hall",
    name: "Entry Hall",
    floor: "GROUND",
    description: "A grand hall, dressed in the dark woods of a century ago — the kind of room that has been polished for guests who never came. The front door stands at your back. A writing desk, with a blotter stained by the pens of the dead. A staircase rises, turning once, into an upper dark. Three doors offer themselves, though none of them, strictly speaking, invite you.",
    short: "A dark wood entry hall. Writing desk, stairs up, doors to parlor, library, dining room, and the cellar stairs.",
    hotspots: [
      { id: "front-door", label: "Front door", action: "frontdoor" },
      { id: "desk", label: "Desk", action: "desk" },
      { id: "staircase", label: "Staircase", action: "travel", target: "upstairs_hall" },
      { id: "parlor-door", label: "To the parlor", action: "travel", target: "parlor" },
      { id: "library-door", label: "To the library", action: "travel", target: "library" },
      { id: "dining-door", label: "To the dining room", action: "travel", target: "dining" },
      { id: "cellar-door", label: "Cellar stairs (down)", action: "travel", target: "wine_cellar" }
    ],
    emf: 0,
    entities: []
  },
  parlor: {
    id: "parlor",
    name: "Parlor",
    floor: "GROUND",
    description: "A heavy, velvet room — the sort in which one sits only when one must. A painting, ornate beyond its merit, dominates the west wall; the subject's face is, you notice, arranged in a manner that refuses to be remembered a moment after you have looked away. In the corner, still set for company: Margaret Ashgrove's séance table, now three-quarters of a century unattended.",
    short: "A velvet parlor. An unmemorable portrait on one wall. Margaret's old séance table in the corner.",
    hotspots: [
      { id: "portrait", label: "The portrait", action: "portrait" },
      { id: "seance-table", label: "Séance table", action: "examine", target: "seance_table" },
      { id: "seance-sit", label: "Sit at the séance table", action: "seance" },
      { id: "seance-bell", label: "Ring Margaret's silver bell", action: "seance_bell" },
      { id: "parlor-drawer", label: "A locked drawer beneath the table", action: "combo", target: "parlor_drawer" },
      { id: "parlor-to-library", label: "Through to the library", action: "travel", target: "library" },
      { id: "back-hall", label: "Back to the hall", action: "travel", target: "entry_hall" }
    ],
    emf: 1,
    entities: ["portrait"]
  },
  library: {
    id: "library",
    name: "Library",
    floor: "GROUND",
    description: "Shelves rise to a ceiling that is somehow higher than the room outside would permit — a trick, one hopes, of dim light and taller stories than ceilings usually tell. Elias Ashgrove's ledgers lie open on the desk, turned, one suspects, to pages he intended. The air is not cold. It is, rather, <em>attended</em>.",
    short: "The library. Tall shelves, Elias's ledgers on the desk. The air feels <em>watched</em>.",
    hotspots: [
      { id: "coroner-file", label: "Coroner's file (Evelyn, 1923)", action: "document", target: "coroner" },
      { id: "trust-docs", label: "Trust documents", action: "document", target: "trust" },
      { id: "margaret-diary", label: "Margaret's séance diary", action: "document", target: "margaret_diary" },
      { id: "knock-wall", label: "Knock on the wall", action: "knock", target: "library_wall" },
      { id: "library-to-parlor", label: "Through to the parlor", action: "travel", target: "parlor" },
      { id: "library-to-dining", label: "Through to the dining room", action: "travel", target: "dining" },
      { id: "back-hall", label: "Back to the hall", action: "travel", target: "entry_hall" }
    ],
    emf: 2,
    entities: ["knocker"]
  },
  dining: {
    id: "dining",
    name: "Dining Room",
    floor: "GROUND",
    description: "A mahogany table of considerable length, set — though no one will eat tonight — for twelve. The chairs, slightly askew, wear a skin of dust like all furniture kept too long from purpose. A door leads, in due course, to the kitchen.",
    short: "A long dining table, still set for twelve. Dusty chairs. A door to the kitchen.",
    hotspots: [
      { id: "table", label: "The long table", action: "examine", target: "dining_table" },
      { id: "kitchen", label: "To the kitchen", action: "travel", target: "kitchen" },
      { id: "conservatory", label: "To the conservatory", action: "travel", target: "conservatory" },
      { id: "back-hall", label: "Back to the hall", action: "travel", target: "entry_hall" }
    ],
    emf: 0,
    entities: []
  },
  kitchen: {
    id: "kitchen",
    name: "Kitchen",
    floor: "GROUND",
    description: "A cast-iron range, iron-cold, iron-patient. Copper pipes cross the ceiling in a manner the modern plumber would condemn, and some of them are humming to themselves — a habit, you tell yourself firmly, of old copper under pressure. The wiring in this house predates a war. Possibly two.",
    short: "A cold kitchen. Old copper pipes hum overhead. Wiring is ancient — a natural source of EMF.",
    hotspots: [
      { id: "pipes", label: "Copper pipes", action: "examine", target: "pipes" },
      { id: "wiring", label: "Old wiring", action: "examine", target: "wiring" },
      { id: "old-clipping", label: "A yellowed clipping pinned to the pantry shelf", action: "document", target: "fire_clipping" },
      { id: "kitchen-to-conservatory", label: "Through to the conservatory", action: "travel", target: "conservatory" },
      { id: "back-dining", label: "Back to the dining room", action: "travel", target: "dining" }
    ],
    emf: 3,
    entities: []
  },
  conservatory: {
    id: "conservatory",
    name: "Conservatory",
    floor: "GROUND",
    description: "A glass room, once intended for the raising of things which preferred sun to weather; now a museum of what was not, in the end, raised. The vines have died in ornamental postures. A draft — cold, faintly green-smelling — enters by one of the panes, which, at some evening not recorded, has cracked.",
    short: "A glass conservatory. Dead vines. A cold draft comes through one cracked pane.",
    hotspots: [
      { id: "vines", label: "The dead vines", action: "examine", target: "vines" },
      { id: "cracked-pane", label: "Cracked glass pane", action: "examine", target: "crack" },
      { id: "conservatory-to-kitchen", label: "Through to the kitchen", action: "travel", target: "kitchen" },
      { id: "back-dining", label: "Back to the dining room", action: "travel", target: "dining" }
    ],
    emf: 0,
    entities: []
  },
  upstairs_hall: {
    id: "upstairs_hall",
    name: "Upstairs Hall",
    floor: "SECOND",
    description: "A hallway longer, one suspects, than the house's plan would strictly permit; the runner beneath your feet has been worn, down the centre, by traffic of which there is at present no record. Your eye, unbidden, finds the far end — where, at moments, there is a figure, and at other moments there is the simple fact that you have been looking too long into an empty corridor.",
    short: "The upstairs hall. Long and worn. At the far end, sometimes, a figure.",
    hotspots: [
      { id: "far-end", label: "Look down the hallway", action: "examine", target: "hallway_end" },
      { id: "master", label: "Master bedroom", action: "travel", target: "master" },
      { id: "nursery", label: "Nursery (locked)", action: "nursery_door" },
      { id: "governess", label: "Governess's room", action: "travel", target: "governess" },
      { id: "study", label: "Adeline's study", action: "travel", target: "study" },
      { id: "downstairs", label: "Back downstairs", action: "travel", target: "entry_hall" }
    ],
    emf: 1,
    entities: ["woman_in_grey"]
  },
  master: {
    id: "master",
    name: "Master Bedroom",
    floor: "SECOND",
    description: "A four-poster, shrouded in the dust-cloths of long absence, waits as patiently as beds do. The east wall — which the original architectural drawings insist ought to hold two tall windows — is, instead, brick, and plastered, and perfectly flat. When you do not look at it directly, it is perfectly flat also; though one cannot, in good conscience, swear to this.",
    short: "The master bedroom. A covered four-poster. The east wall is bricked over — the original plans show windows there.",
    hotspots: [
      { id: "bed", label: "The bed", action: "examine", target: "master_bed" },
      { id: "east-wall", label: "The east wall", action: "examine", target: "east_wall" },
      { id: "master-to-study", label: "Through to Adeline's study", action: "travel", target: "study" },
      { id: "back-hall2", label: "Back to the upstairs hall", action: "travel", target: "upstairs_hall" }
    ],
    emf: 0,
    entities: ["breath"]
  },
  nursery: {
    id: "nursery",
    name: "Nursery",
    floor: "SECOND",
    description: "A child's room, preserved as precisely as if the year — 1923 — had been buckled into a frame and left upon the mantel. A rocking chair broods in the corner. Toys, arranged by no adult hand, lie as a child would have left them. Near the doorway, a small silver thimble. The east wall — which you will wish, in a moment, that you had not noticed — is scarred with gouges in long, patient, parallel rows.",
    short: "The nursery, frozen in 1923. Rocking chair, toys, a silver thimble. The east wall is clawed with long parallel gouges.",
    hotspots: [
      { id: "rocking-chair", label: "Rocking chair", action: "examine", target: "rocking_chair" },
      { id: "thimble", label: "Silver thimble", action: "examine", target: "thimble" },
      { id: "east-wall-nursery", label: "The east wall", action: "examine", target: "east_wall_nursery" },
      { id: "nursery-to-governess", label: "Through to the governess's room", action: "travel", target: "governess" },
      { id: "back-hall2", label: "Back to the upstairs hall", action: "travel", target: "upstairs_hall" }
    ],
    emf: 2,
    entities: ["cold_mother", "quiet_twin", "rocking_chair_scare"]
  },
  governess: {
    id: "governess",
    name: "Governess's Room",
    floor: "SECOND",
    description: "A narrow room, adjoining the nursery through a thin wall which has, over the years, heard many things. The window faces south — meaning, pointedly, that it does not face east. Upon a small writing desk, a child's drawing is pinned: two identical figures, holding hands. One does not, at first, notice the third hand, rising from between them — but one does, the next time.",
    short: "The governess's room. Adjoins the nursery. A child's drawing of two twins — with a third hand between them.",
    hotspots: [
      { id: "drawing", label: "The child's drawing", action: "examine", target: "drawing" },
      { id: "governess-to-nursery", label: "Adjoining door to the nursery", action: "travel", target: "nursery" },
      { id: "back-hall2", label: "Back to the upstairs hall", action: "travel", target: "upstairs_hall" }
    ],
    emf: 1,
    entities: ["listening_twin"]
  },
  study: {
    id: "study",
    name: "Adeline's Study",
    floor: "SECOND",
    description: "The last refuge of Adeline Ashgrove, widow and mistress of this house for the three decades in which she did not leave it. A reel-to-reel tape machine, kept in good repair by some hand that was not hers, occupies the desk. Her tapes, boxed and labelled in a hand that becomes, over the years, both better and worse, line the shelves. The air smells of old paper and older intentions.",
    short: "Adeline's study. Her reel-to-reel tape machine sits on the desk. Boxed tapes line the shelves.",
    hotspots: [
      { id: "tape-machine", label: "Reel-to-reel tape machine", action: "tape" },
      { id: "tape-box", label: "Box of tapes", action: "examine", target: "tape_box" },
      { id: "letter-1972", label: "A sealed letter (1972)", action: "document", target: "sealed_letter" },
      { id: "study-to-master", label: "Through to the master bedroom", action: "travel", target: "master" },
      { id: "back-hall2", label: "Back to the upstairs hall", action: "travel", target: "upstairs_hall" }
    ],
    emf: 2,
    entities: ["tape_voice"]
  },
  wine_cellar: {
    id: "wine_cellar",
    name: "Wine Cellar",
    floor: "CELLAR",
    description: "Stone walls, the older stones laid for a building which is not this one and has not, in over a century, stood. The wine racks are empty; the bottles sold when the trust took charge. At the far end, a door of heavy oak — bolted with a modern deadbolt of the 1970s, installed (as your training will remind you) after the last occupant's death, rather than before. One wonders, of course, for what.",
    short: "The wine cellar. Empty racks. A heavy oak door at the back, deadbolted in the 1970s — after Adeline died, not before.",
    hotspots: [
      { id: "locked-door", label: "The locked door", action: "locked_door" },
      { id: "racks", label: "Wine racks", action: "examine", target: "racks" },
      { id: "knock-cellar-door", label: "Knock on the locked door", action: "knock", target: "cellar_door" },
      { id: "back-hall-up", label: "Back up to the entry hall", action: "travel", target: "entry_hall" }
    ],
    emf: 1,
    entities: ["hands"]
  }
};

const ROOM_ORDER = [
  "drive", "entry_hall", "parlor", "library", "dining", "kitchen", "conservatory",
  "upstairs_hall", "master", "nursery", "governess", "study", "wine_cellar"
];

// 12 entities + scripted scares, with tool-visibility profiles (the 13 Ghosts rule)
// Keys in `detect`: kii, spirit, ovilus, sls, evp, thermal, empump, knock.
// Each entity belongs to a room and contributes to a truth-state outcome.
const ENTITIES = {
  cold_mother: {
    name: "The Cold Mother",
    room: "nursery",
    film: "The Innocents — Miss Jessel",
    description: "Evelyn Ashgrove, who died clawing through the east wall in 1923.",
    detect: { thermal: true, evp: true, empump: true },
    realInStates: ["haunted"]
  },
  listening_twin: {
    name: "The Listening Twin",
    room: "governess",
    film: "The Innocents — Flora",
    description: "One of the lost 1935 twins.",
    detect: { ovilus: true, sls: true },
    realInStates: ["haunted"]
  },
  quiet_twin: {
    name: "The Quiet Twin",
    room: "nursery",
    film: "The Innocents — Miles",
    description: "Behind the walls. Only the EVP recorder catches him.",
    detect: { evp: true, thermal: true },
    realInStates: ["haunted", "partial"]
  },
  knocker: {
    name: "The Knocker",
    room: "library",
    film: "The Haunting — the banging",
    description: "Elias Ashgrove, speaking in rhythm.",
    detect: { kii: true, knock: true, evp: true },
    realInStates: ["haunted"]
  },
  woman_in_grey: {
    name: "The Woman in Grey",
    room: "upstairs_hall",
    film: "The Changeling — the stairs apparition",
    description: "Margaret Ashgrove, at the end of the upstairs hall.",
    detect: { sls: true, thermal: true },
    realInStates: ["haunted"]
  },
  tape_voice: {
    name: "The Tape Voice",
    room: "study",
    film: "The Changeling — tape playback",
    description: "Adeline Ashgrove's voice on tape 4/17/73. Names someone called 'Eliza'.",
    detect: { tape: true },
    realInStates: ["haunted", "partial", "debunked"]
  },
  rocking_chair_scare: {
    name: "The Rocking Chair",
    room: "nursery",
    film: "The Changeling — wheelchair scene",
    description: "The chair rocks on its own when seen through the doorway.",
    detect: {},
    realInStates: ["haunted", "partial"],
    environmental: { debunked: "The chair's rocker is uneven. Vibrations from footsteps upstairs make it move." }
  },
  breath: {
    name: "The Breath",
    room: "master",
    film: "The Haunting — the breathing door",
    description: "The east wall of the master bedroom flexes — inhale, exhale.",
    detect: { evp: true, thermal: true },
    realInStates: ["haunted"],
    environmental: { debunked: "A collapsed chimney flue creates a pressure differential. The wall flexes with outside wind." }
  },
  portrait: {
    name: "The Portrait",
    room: "parlor",
    film: "The Haunting — the statue",
    description: "The painting's subject changes between visits. Only SLS records it.",
    detect: { sls: true },
    realInStates: ["haunted"]
  },
  hands: {
    name: "The Hands",
    room: "wine_cellar",
    film: "The Haunting — the grip in the dark",
    description: "Behind the cellar's locked door. The most dangerous entity when provoked.",
    detect: { kii: true, spirit: true, ovilus: true, sls: true, evp: true, thermal: true, empump: true, knock: true },
    realInStates: ["haunted"],
    environmental: { debunked: "Water hammer in decayed copper plumbing produces the knocks. The cold is a root-cellar draft." }
  },
  watcher: {
    name: "The Watcher on the Hill",
    room: "conservatory",
    film: "The Innocents — Quint at the window",
    description: "Visible through the cracked conservatory pane, at the edge of the woods.",
    detect: { sls: true },
    realInStates: ["haunted"]
  },
  echo: {
    name: "The Echo",
    room: "any",
    film: "The Haunting — Hill House as protagonist",
    description: "The house itself answers when called.",
    detect: { spirit: true, ovilus: true, knock: true, empump: true },
    realInStates: ["haunted"]
  }
};

// Calder dialogue tree. 4 facts are WRONG — documents in the library/study contradict them.
// Each wrong claim has a paired document the player can find to catch it.
const CALDER_DIALOGUE = {
  calder_arrival: {
    speaker: "Mr. Calder",
    line: "You'll be the investigator, then. I'm Calder. Worked for the trust since I was a boy — my father kept this house for Mrs. Ashgrove before me. Neither of us ever set foot in the nursery after '23, nor the cellar at all, and I don't intend to start tonight.",
    short: "I'm Calder. Worked this house since I was a boy. Won't enter the nursery or the cellar. Never have.",
    choices: [
      { text: "Tell me about the family.", goto: "family" },
      { text: "What should I know about the house?", goto: "rules" },
      { text: "Who hired me? The executor — who is he?", goto: "executor" },
      { text: "Have you seen anything yourself, Mr. Calder?", goto: "seen" },
      { text: "I'm ready. Start the walkthrough.", goto: "start_walkthrough" }
    ]
  },
  executor: {
    speaker: "Mr. Calder",
    line: "I've never met him. Never spoke to him, even. Letters come through the trust solicitor in town. Signatures match — the solicitor checks — but the name on the letters isn't one I was ever told as a boy.",
    short: "Never met him. Letters come through the solicitor. Name's not one I was told as a boy.",
    choices: [
      { text: "Then how do you know he's real?", goto: "executor_real" },
      { text: "What name is on the letters?", goto: "executor_name" },
      { text: "Back.", goto: "calder_arrival" }
    ]
  },
  executor_real: {
    speaker: "Mr. Calder",
    line: "The money's real. That's what the solicitor says, and it's what I'm paid out of. Whether the man's real — I've stopped asking. You learn that, in service to this house.",
    short: "The money's real. Whether the man is — I've stopped asking.",
    choices: [{ text: "Back.", goto: "executor" }]
  },
  executor_name: {
    speaker: "Mr. Calder",
    line: "He signs E. Ashgrove. My father used to laugh at that. Said there hadn't been an E. Ashgrove signing anything since 1902. But the solicitor says it's in order, so.",
    short: "He signs E. Ashgrove. There's been no E. Ashgrove alive since 1902. Solicitor says it's in order.",
    calderClaim: "executor_identity",
    choices: [{ text: "Back.", goto: "executor" }]
  },
  seen: {
    speaker: "Mr. Calder",
    line: "Not as such. Not what I'd swear to, in a court. I've heard things. I've come in mornings and found doors open I locked the night before. I've found Mrs. Ashgrove's study rearranged, once or twice, and she was fifty years dead. That's all.",
    short: "Nothing I'd swear to in court. Doors open I locked shut. Mrs. Ashgrove's study rearranged — and she's been dead fifty years.",
    choices: [
      { text: "That's quite a lot, actually.", goto: "seen_followup" },
      { text: "Back.", goto: "calder_arrival" }
    ]
  },
  seen_followup: {
    speaker: "Mr. Calder",
    line: "I didn't say it was nothing. I said I wouldn't swear to it. There's a difference.",
    short: "I didn't say it was nothing. I said I wouldn't swear to it.",
    choices: [{ text: "Back.", goto: "seen" }]
  },
  family: {
    speaker: "Mr. Calder",
    line: "Three generations. Elias built it in 1887 — shipping money, my father said, and don't ask what cargo. His son Thomas inherited. Thomas's first wife Evelyn died of a fall in the nursery in '23 — terrible business. He remarried. That was Adeline. She raised the twins, or tried to.",
    short: "Elias built it 1887. Son Thomas inherited. Wife Evelyn fell in the nursery, '23. Second wife Adeline raised the twins.",
    calderClaim: "evelyn_fall",
    choices: [
      { text: "The twins?", goto: "twins" },
      { text: "Evelyn died of a fall? Where did you hear that?", goto: "evelyn_followup" },
      { text: "Margaret — Elias's wife — the spiritualist?", goto: "margaret" },
      { text: "What about Adeline at the end?", goto: "adeline" },
      { text: "Back.", goto: "calder_arrival" }
    ]
  },
  evelyn_followup: {
    speaker: "Mr. Calder",
    line: "My father. He had it from Mrs. Ashgrove — Adeline, the second wife. She'd have been sixteen when Evelyn died, so I suppose she had it from Thomas. A fall in the nursery. The room was sealed after.",
    short: "From my father, who had it from Adeline, who had it from Thomas. A fall. Nursery sealed after.",
    choices: [
      { text: "[Press] Sealed why, if it was a fall?", goto: "evelyn_pressed" },
      { text: "Back.", goto: "family" }
    ]
  },
  evelyn_pressed: {
    speaker: "Mr. Calder",
    line: "...I've wondered that myself. I'll not pretend I haven't. But my father wasn't one to answer a question twice, and I took what he gave me.",
    short: "I've wondered. My father wasn't one to answer a question twice.",
    choices: [
      { text: "Back.", goto: "evelyn_followup" }
    ]
  },
  margaret: {
    speaker: "Mr. Calder",
    line: "Ah. Margaret. Elias's wife. She was — the polite word is 'a spiritualist.' The less polite one is what my grandfather called her, which I won't repeat. She held séances in the parlor every Thursday for twenty years. Wrote diaries about them. Those diaries are somewhere in the library, if you care to look.",
    short: "Elias's wife. A spiritualist. Held séances here twenty years. Her diaries are in the library.",
    choices: [
      { text: "Did she believe?", goto: "margaret_believed" },
      { text: "Back.", goto: "family" }
    ]
  },
  margaret_believed: {
    speaker: "Mr. Calder",
    line: "She wrote once — my father showed me this, when I was perhaps too young for it — 'We did not build a home. We built a cage.' He made me memorize it. I don't know why. I've never forgotten.",
    short: "She wrote once: 'We did not build a home. We built a cage.' My father made me memorize it.",
    choices: [{ text: "Back.", goto: "margaret" }]
  },
  twins: {
    speaker: "Mr. Calder",
    line: "Henry and Clara. Inseparable, they say. They drowned in the pond in '35 — both on the same night. No bodies ever found, but that was always the theory. My father remembered the search. Two days, he said. Men with poles.",
    short: "Henry and Clara. Drowned in the pond, '35. Same night. No bodies ever found — but that's the theory.",
    calderClaim: "twins_drowned",
    choices: [
      { text: "No bodies? In a pond?", goto: "twins_followup" },
      { text: "[Press] Did Mrs. Ashgrove ever say what she thought happened?", goto: "twins_adeline" },
      { text: "Back.", goto: "family" }
    ]
  },
  twins_followup: {
    speaker: "Mr. Calder",
    line: "Pond was deep. That's what my father said. 'Pond was deep, son, and some things a pond keeps.' I was seven. I did not argue.",
    short: "Pond was deep, my father said. Some things a pond keeps. I was seven. I didn't argue.",
    choices: [
      { text: "Back.", goto: "twins" }
    ]
  },
  twins_adeline: {
    speaker: "Mr. Calder",
    line: "She said — toward the end, when she was not entirely herself — she said they were 'taken into the walls.' She said it more than once. I took her a tea. She said it to me, looking right at me. I have wondered, since, what I ought to have answered.",
    short: "Toward the end, she said they were 'taken into the walls.' Said it more than once. I've wondered what I ought to have answered.",
    choices: [
      { text: "[Press] Why do you still say 'drowned' then?", goto: "twins_cracked" },
      { text: "Back.", goto: "twins" }
    ]
  },
  twins_cracked: {
    speaker: "Mr. Calder",
    line: "Because that is what I am paid to say, and because I am seventy-three years old, and because I do not wish, at this late hour, to have a different memory than the one I have been given. You investigate. I tend the grounds.",
    short: "Because it's what I'm paid to say. I'm seventy-three. I don't want a different memory at this late hour.",
    choices: [
      { text: "Back.", goto: "twins" }
    ]
  },
  adeline: {
    speaker: "Mr. Calder",
    line: "A kind woman at the end. Outlived her husband by thirty years. Stayed in this house alone, held onto it. Died peaceful, in her own bed, a Tuesday in May of '74.",
    short: "A kind woman at the end. Outlived her husband thirty years. Died peaceful in her bed, May '74.",
    calderClaim: "adeline_kind",
    choices: [
      { text: "Did she ever try to leave the house?", goto: "adeline_leave" },
      { text: "Peaceful — how do you know? Were you here?", goto: "adeline_here" },
      { text: "Back.", goto: "family" }
    ]
  },
  adeline_leave: {
    speaker: "Mr. Calder",
    line: "Not after the twins. Thirty-nine years she did not go past the porch steps. My father used to carry the post up to her. When he died, I carried it.",
    short: "Not after the twins. Thirty-nine years she never passed the porch steps.",
    choices: [{ text: "Back.", goto: "adeline" }]
  },
  adeline_here: {
    speaker: "Mr. Calder",
    line: "I was nineteen. I found her. I — I don't remember now whether she was peaceful. One tells the story one prefers. I prefer that one. You'll allow me that, I hope.",
    short: "I was nineteen. I found her. I don't remember if she was peaceful. I prefer the story I tell.",
    choices: [{ text: "Back.", goto: "adeline" }]
  },
  rules: {
    speaker: "Mr. Calder",
    line: "Two rules, for me. I won't go in the nursery, and I won't go in the cellar. You want to, that's your business and the executor's. A third rule, if you like: don't call out in the halls after midnight. I've never had reason to state why. Only that I don't.",
    short: "Two rules: I won't go in the nursery. I won't go in the cellar. A third, if you like: don't call out after midnight.",
    choices: [
      { text: "Why not the cellar?", goto: "cellar_why" },
      { text: "What's in the cellar?", goto: "cellar_what" },
      { text: "Why not call out?", goto: "callout" },
      { text: "Back.", goto: "calder_arrival" }
    ]
  },
  cellar_why: {
    speaker: "Mr. Calder",
    line: "My father wouldn't go down there. My grandfather wouldn't either, as far as I know. I learned young to respect that. When a grown man refuses a thing for forty years, you don't ask him to start.",
    short: "My father wouldn't go down there. Grandfather neither. When a man refuses for forty years, you don't ask.",
    choices: [
      { text: "Back.", goto: "rules" }
    ]
  },
  cellar_what: {
    speaker: "Mr. Calder",
    line: "Nothing but a wine cellar. Door's just old and stuck.",
    short: "Nothing but a wine cellar. Door's old and stuck.",
    calderClaim: "cellar_nothing",
    choices: [
      { text: "[Press] Old and stuck, with a modern deadbolt?", goto: "cellar_pressed" },
      { text: "Back.", goto: "rules" }
    ]
  },
  cellar_pressed: {
    speaker: "Mr. Calder",
    line: "...That was put on after Mrs. Ashgrove died. The trust arranged it. I wasn't told why, and I did not, at the time, think it my place to ask. I'll admit it's a question I've kept.",
    short: "Put on after Mrs. Ashgrove died. Trust arranged it. I wasn't told why.",
    choices: [{ text: "Back.", goto: "cellar_what" }]
  },
  callout: {
    speaker: "Mr. Calder",
    line: "My father used to say, 'Son, houses like this one have ears, and ears like to be spoken to, and what they hear they remember.' I don't know if he meant it. I mind it anyway.",
    short: "Houses like this have ears. What they hear, they remember.",
    choices: [
      { text: "Back.", goto: "rules" }
    ]
  },
  start_walkthrough: {
    speaker: "Mr. Calder",
    line: "Right then. Here are the keys. Front door locks behind me at sundown — opens again at dawn, not one minute sooner, not for any reason. You've the house to yourself. I'll see you in the morning, if you want to be seen.",
    short: "Here are the keys. Door locks behind me at sundown, opens at dawn. Not before. House is yours.",
    choices: [
      { text: "One more question first.", goto: "calder_arrival" },
      { text: "Lock it behind you.", goto: "__leave", action: "calder_leaves" }
    ]
  }
};

// Documents that contradict Calder.
const DOCUMENTS = {
  coroner: {
    title: "Coroner's Report — Evelyn Ashgrove, Aug 1923",
    body: "Cause of death: UNDETERMINED. Body found in the nursery. Hands severely lacerated from repeated impact and clawing against the east interior wall, which had been partially dismantled. Several bricks removed from the inside by the deceased prior to death. No fall injury consistent with the household account.",
    short: "Cause of death: UNDETERMINED. Hands lacerated from clawing at the east nursery wall. Bricks removed from inside. Not a fall.",
    contradicts: "evelyn_fall"
  },
  trust: {
    title: "Trust Founding Documents — Ashgrove Preservation Society (1899)",
    body: "Established by Elias Ashgrove, three years prior to his death in 1902, for the sole purpose of keeping Ashgrove House 'closed, maintained, and undisturbed in perpetuity.' Funding in escrow. No public access shall be granted. Language echoes Margaret Ashgrove's private diary: 'We did not build a home, we built a cage.'",
    short: "Founded by Elias Ashgrove 1899, to keep the house 'closed, maintained, undisturbed in perpetuity.' Margaret wrote: 'We built a cage.'"
  },
  sealed_letter: {
    title: "Sealed Letter from Adeline Ashgrove to the Trust Board (1972)",
    body: "I mean to join them in the walls before the house gets me first. I have tried for years to speak with Evelyn and the children and at last they answer. You will not sell. You will not open. You will not. Signed, A.A.",
    short: "I mean to join them in the walls before the house gets me first. — Adeline",
    contradicts: "adeline_kind"
  },
  pond_drained: {
    title: "Clipping — Ashgrove Hollow Gazette, May 1940",
    body: "The Ashgrove pond has been drained this spring for the new reservoir project. No remains were recovered despite thorough search of the basin, contradicting the long-held assumption regarding the disappearance of the Ashgrove twins in 1935.",
    short: "The Ashgrove pond was drained, spring 1940. No remains found. The twins did not drown there."
  },
  tape_transcript: {
    title: "Reel-to-reel Tape 4/17/73 (Adeline's voice)",
    body: "...Eliza, tell them. Tell them to leave the doors closed. They think it is the children they hear but it is Eliza, it was always Eliza. Nineteen in the fire and she their name for all of them. Tell them...",
    short: "It is Eliza, it was always Eliza. Nineteen in the fire. She their name for all of them. — Adeline, 4/17/73",
    contradicts: null
  },
  fire_clipping: {
    title: "Clipping — Ashgrove Hollow Gazette, 14 October 1851",
    body: "The Meeting-House fire of Sunday last took from us nineteen souls. The building — the Ashgrove Hollow Free Meeting-House, erected 1807 — is reported a total loss, with no timber recoverable. An account of the deceased, prepared by the sexton Mr. Halliwell, lists the names of the nineteen; among them, five of the family Halliwell, four of the family Abbott, a widow Prideaux, the schoolmistress Miss ELIZA HALLIWELL aged twenty-four years, and nine children in her charge. No cause of the blaze has yet been determined by the justices.",
    short: "Meeting-House fire, 1851. Nineteen dead: schoolmistress ELIZA HALLIWELL (24), nine children in her charge, and nine others. Cause undetermined."
  },
  margaret_diary: {
    title: "Margaret Ashgrove's Séance Diary — Entry, 1896",
    body: "We had a guest at the table again tonight. She does not give her full name, only Eliza. She speaks through the planchette with a patience I have not encountered in any previous visitor — as though she has been waiting a very long time, and has become accustomed to waiting. She asked after the children. I told her there are no children in this house. She did not reply for several minutes. Then she said: not yet.",
    short: "A guest at the table. Gave her name as Eliza. Asked after the children. I said there are none. She replied: not yet. — Margaret, 1896",
    contradicts: null
  },
  seance_carved: {
    title: "Carved under the séance table (Parlor)",
    body: "Scratched with some pointed tool — a pin, perhaps, or a pen-nib — on the underside of the middle plank: 'ELIZA HERE, STILL.' The carving is older than the varnish. It has been, since 1896 at the latest, waiting for someone to lift the cloth.",
    short: "Scratched under the middle plank: 'ELIZA HERE, STILL.' Older than the 1896 varnish."
  },
  midnight_letter: {
    title: "A letter, slid under the front door",
    body: "INVESTIGATOR — Since you are reading this, you have been in the house for five hours and have, I suspect, learned less than you had hoped. Allow me, the executor, a single page of instruction.\n\nThis house is not only haunted. It is a PACT. In 1851, the Ashgrove Hollow Meeting-House burned with nineteen souls inside — a schoolmistress named ELIZA HALLIWELL and the children in her charge. The blaze was set. The perpetrator was ELIAS ASHGROVE, who built this house over the foundation of the one he destroyed.\n\nHe founded the trust three years before his death, not to protect the world from the house, but to protect the house from the world. His wife MARGARET held séances to speak with Eliza and those with her, and recorded what she learned in her diary (in the library). In 1923 his daughter-in-law EVELYN tried to release them from the east wall of the nursery. It killed her. In 1935 the twins, HENRY and CLARA, were taken into the walls — not drowned. ADELINE, Thomas's second wife, knew all of this and, at the end, joined them willingly.\n\nYour verdict will determine whether the pact continues. The executor is not who Mr. Calder believes. The executor is the house itself, and I am writing to you from within it.\n\nI will not write again. — E.A.",
    short: "INVESTIGATOR — This house is a PACT.\n\n1851: Elias Ashgrove set fire to the Meeting-House. Nineteen died inside — the schoolmistress ELIZA HALLIWELL and the children in her charge. He built this house over its foundation.\n\n1899: He founded the trust to keep the house sealed — to protect the house from the world, not the other way around. Margaret spoke with Eliza at séance. Evelyn (1923) tried to free them from the east nursery wall. It killed her. The twins (1935) were taken into the walls — not drowned. Adeline knew, and joined them willingly.\n\nYour verdict decides whether the pact continues. The executor is the house itself. I write from within it.\n\nI will not write again. — E.A."
  }
};

// Per-room word pools for Spirit Box and Ovilus.
// Each word flagged: clue | threat | noise.
const WORD_POOLS = {
  entry_hall: [
    { word: "WELCOME", type: "noise" },
    { word: "COLD", type: "noise" },
    { word: "STAY", type: "threat" },
    { word: "BEHIND", type: "threat" },
    { word: "OUT", type: "noise" },
    { word: "LOCK", type: "clue" },
    { word: "TURN", type: "noise" }
  ],
  parlor: [
    { word: "MARGARET", type: "clue" },
    { word: "SEANCE", type: "clue" },
    { word: "LIE", type: "threat" },
    { word: "CAGE", type: "clue" },
    { word: "SIT", type: "noise" },
    { word: "PAINT", type: "clue" },
    { word: "VISITOR", type: "clue" },
    { word: "NEARER", type: "threat" },
    { word: "VELVET", type: "noise" },
    { word: "QUIET", type: "noise" }
  ],
  library: [
    { word: "ELIAS", type: "clue" },
    { word: "LEDGER", type: "noise" },
    { word: "KNOCK", type: "threat" },
    { word: "TRUST", type: "clue" },
    { word: "SHIP", type: "clue" },
    { word: "CARGO", type: "clue" },
    { word: "PAGE", type: "noise" },
    { word: "INK", type: "noise" },
    { word: "PATIENT", type: "threat" },
    { word: "OWNED", type: "clue" }
  ],
  kitchen: [
    { word: "BURN", type: "threat" },
    { word: "OVEN", type: "noise" },
    { word: "NINETEEN", type: "clue" },
    { word: "SALT", type: "noise" },
    { word: "COPPER", type: "noise" },
    { word: "BREAD", type: "noise" },
    { word: "ASH", type: "clue" },
    { word: "HOT", type: "noise" },
    { word: "GUEST", type: "noise" }
  ],
  conservatory: [
    { word: "WATCH", type: "threat" },
    { word: "WOODS", type: "clue" },
    { word: "FAR", type: "noise" },
    { word: "GLASS", type: "noise" },
    { word: "SEEN", type: "threat" },
    { word: "TREELINE", type: "clue" },
    { word: "STILL", type: "threat" },
    { word: "COLD", type: "noise" }
  ],
  dining: [
    { word: "TWELVE", type: "clue" },
    { word: "CHAIR", type: "noise" },
    { word: "GUEST", type: "noise" },
    { word: "EMPTY", type: "noise" },
    { word: "NINETEEN", type: "clue" },
    { word: "PLACE", type: "noise" },
    { word: "TABLE", type: "noise" }
  ],
  upstairs_hall: [
    { word: "GREY", type: "clue" },
    { word: "WOMAN", type: "clue" },
    { word: "BEHIND", type: "threat" },
    { word: "MOTHER", type: "clue" },
    { word: "HALLWAY", type: "noise" },
    { word: "RUNNER", type: "noise" },
    { word: "TURN", type: "threat" },
    { word: "WATCH", type: "threat" },
    { word: "NOT", type: "threat" }
  ],
  master: [
    { word: "BREATHE", type: "threat" },
    { word: "WALL", type: "clue" },
    { word: "EAST", type: "clue" },
    { word: "CLOSER", type: "threat" },
    { word: "BRICK", type: "clue" },
    { word: "QUILT", type: "noise" },
    { word: "SLEEP", type: "noise" },
    { word: "FLEX", type: "threat" }
  ],
  nursery: [
    { word: "EVELYN", type: "clue" },
    { word: "INSIDE", type: "threat" },
    { word: "THIMBLE", type: "clue" },
    { word: "MOTHER", type: "clue" },
    { word: "DONT", type: "threat" },
    { word: "OPEN", type: "threat" },
    { word: "BEHIND", type: "threat" },
    { word: "HAND", type: "clue" },
    { word: "CHILD", type: "clue" },
    { word: "HIDE", type: "threat" },
    { word: "QUIET", type: "noise" }
  ],
  governess: [
    { word: "CLARA", type: "clue" },
    { word: "HENRY", type: "clue" },
    { word: "WINDOW", type: "clue" },
    { word: "HIDE", type: "threat" },
    { word: "SOUTH", type: "noise" },
    { word: "SISTER", type: "clue" },
    { word: "BROTHER", type: "clue" },
    { word: "DRAW", type: "noise" },
    { word: "THIRD", type: "clue" }
  ],
  study: [
    { word: "ADELINE", type: "clue" },
    { word: "ELIZA", type: "clue" },
    { word: "TAPE", type: "noise" },
    { word: "JOIN", type: "threat" },
    { word: "NINETEEN", type: "clue" },
    { word: "CLOSED", type: "threat" },
    { word: "BOX", type: "noise" },
    { word: "REEL", type: "noise" },
    { word: "REMEMBER", type: "threat" },
    { word: "WILL", type: "threat" }
  ],
  wine_cellar: [
    { word: "HANDS", type: "threat" },
    { word: "FIRE", type: "clue" },
    { word: "NINETEEN", type: "clue" },
    { word: "BELOW", type: "threat" },
    { word: "ELIZA", type: "clue" },
    { word: "FIRST", type: "threat" },
    { word: "BOLT", type: "noise" },
    { word: "DEEP", type: "noise" },
    { word: "OPEN", type: "threat" },
    { word: "US", type: "threat" }
  ]
};

// Universal pool sampled in every room — gives variety so room pools
// aren't the only source. Has no clues (those are room-specific).
const WORD_POOL_UNIVERSAL = [
  { word: "HELLO", type: "noise" },
  { word: "HERE", type: "noise" },
  { word: "YES", type: "noise" },
  { word: "NO", type: "noise" },
  { word: "WHY", type: "noise" },
  { word: "WAIT", type: "noise" },
  { word: "WHO", type: "noise" },
  { word: "NAME", type: "noise" },
  { word: "HELP", type: "threat" },
  { word: "LEAVE", type: "threat" },
  { word: "RUN", type: "threat" },
  { word: "STOP", type: "threat" },
  { word: "DIE", type: "threat" },
  { word: "BACK", type: "threat" },
  { word: "LOOK", type: "threat" },
  { word: "QUIET", type: "noise" },
  { word: "DARK", type: "noise" },
  { word: "LIGHT", type: "noise" },
  { word: "DOOR", type: "noise" },
  { word: "WAIT", type: "noise" },
  { word: "SOON", type: "threat" },
  { word: "NEVER", type: "threat" },
  { word: "YOURS", type: "threat" },
  { word: "MINE", type: "threat" }
];
