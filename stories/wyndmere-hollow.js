// One Night In… — Chapter II: WYNDMERE HOLLOW
// October 1976, three months after Ashgrove. An Adirondack lake-house.
// Inspirations: Rebecca (1940), The Uninvited (1944), Nightmare Castle (1965),
//               Let's Scare Jessica to Death (1971), The Exorcist (1973).
// Tone: Hitchcock-cool. Wet imagery. Gothic widow, drowned wife, possessed child.
"use strict";

(function () {
  // Helper: prefix all room/entity/doc ids with wm_ to avoid Ashgrove collisions.
  const P = "wm_";

  // ─────────────────────────────────────────────────────────────────────────
  // ROOMS
  // ─────────────────────────────────────────────────────────────────────────
  const rooms = {
    [P+"jetty"]: {
      id: P+"jetty",
      name: "The Jetty",
      floor: "ARRIVAL",
      description: "The launch sways under you and the rope, tied off twice for luck, agrees with the post in a slow wooden complaint. Lake Wyndmere is black tonight, and very still — the kind of stillness one feels obliged to apologise to. A path of crushed shell leads up between the pines toward a house that has not, judging by the windows, been lit for guests. A woman waits at the head of the path. <em>Mrs. Thrale.</em>",
      short: "You tie up at the jetty. Lake Wyndmere is glass-black. Mrs. Thrale, the housekeeper, waits at the head of the path.",
      hotspots: [
        { id: "wm-thrale-intro", label: "Greet Mrs. Thrale", action: "dialogue", target: "thrale_arrival" },
        { id: "wm-lake-look",   label: "Look out over the lake", action: "examine", target: P+"lake_first_look" },
        { id: "wm-boathouse",   label: "The boathouse (along the shore)", action: "travel", target: P+"boathouse" },
        { id: "wm-drive",       label: "Up the shell path to the house", action: "travel", target: P+"drive", requires: "walkthrough_start" }
      ],
      emf: 0,
      lockedUntil: null,
      entities: []
    },

    [P+"drive"]: {
      id: P+"drive",
      name: "The Drive Through the Pines",
      floor: "GROUND",
      description: "Pines, planted close, lean their dark heads in over the drive — a tunnel in summer, and tonight a throat. Half-buried in needles you make out a child's tricycle, the chrome long since gone to rust. A wooden sign, lettered in a careful Edwardian hand: <em>WYNDMERE — please observe the silence.</em>",
      short: "A close pine tunnel. A child's rusted tricycle in the needles. A sign asks for silence.",
      hotspots: [
        { id: "wm-tricycle", label: "Examine the tricycle", action: "examine", target: P+"tricycle" },
        { id: "wm-foyer",    label: "Approach the front door", action: "travel", target: P+"foyer" },
        { id: "wm-back-jetty", label: "Back down to the jetty", action: "travel", target: P+"jetty" },
        { id: "wm-chapel-path", label: "A side path toward the chapel", action: "travel", target: P+"chapel" }
      ],
      emf: 1,
      entities: []
    },

    [P+"foyer"]: {
      id: P+"foyer",
      name: "The Foyer",
      floor: "GROUND",
      description: "An entry hall in the manner of a great house misremembering itself: black-and-white tile underfoot, a staircase that turns once and disappears into the upper dark, and at the landing — a portrait. A woman in white, the brushwork a little hurried in the shoulders, as though the painter had not been quite ready to finish her. Beneath her: a banked vase of dried hydrangeas that look freshly arranged. A telephone on a half-moon table. The line, you note, is dead.",
      short: "Black-and-white tile. Stairs up. On the landing: a portrait of a woman in white, hydrangeas freshly arranged beneath her. Phone line dead.",
      hotspots: [
        { id: "wm-portrait-landing", label: "The portrait on the landing", action: "examine", target: P+"portrait_landing" },
        { id: "wm-hydrangeas", label: "The hydrangeas", action: "examine", target: P+"hydrangeas" },
        { id: "wm-phone", label: "Try the telephone", action: "examine", target: P+"phone" },
        { id: "wm-front-door", label: "Front door", action: "frontdoor" },
        { id: "wm-morning-rm", label: "To the morning room", action: "travel", target: P+"morning" },
        { id: "wm-library-rm", label: "To the library", action: "travel", target: P+"library" },
        { id: "wm-kitchen-rm", label: "To the kitchen (rear)", action: "travel", target: P+"kitchen" },
        { id: "wm-stairs-up",  label: "Up the stairs", action: "travel", target: P+"upper_hall" },
        { id: "wm-back-drive", label: "Back to the drive", action: "travel", target: P+"drive" }
      ],
      emf: 1,
      entities: ["portrait_landing"].map(s => P+s)
    },

    [P+"morning"]: {
      id: P+"morning",
      name: "The Morning Room",
      floor: "GROUND",
      description: "East light would have come through these tall windows once, had the season permitted; tonight only the lake's stillness presses against the glass. An easel still stands in the corner with a canvas turned to the wall. Above the cold fireplace: <em>Vivian Carrow's self-portrait</em>, signed and dated 1957 — the artist holding a brush and watching, with what you may decide later is patience and may decide later is something else, whoever has just entered the room.",
      short: "Vivian Carrow's self-portrait above the cold fireplace. Her easel still in the corner, canvas turned to the wall.",
      hotspots: [
        { id: "wm-self-portrait", label: "Vivian's self-portrait", action: "portrait", target: P+"self_portrait" },
        { id: "wm-easel", label: "The easel and turned canvas", action: "examine", target: P+"easel" },
        { id: "wm-diary-find", label: "Search the writing desk", action: "document", target: P+"viv_diary" },
        { id: "wm-morning-to-library", label: "Through to the library", action: "travel", target: P+"library" },
        { id: "wm-back-foyer", label: "Back to the foyer", action: "travel", target: P+"foyer" }
      ],
      emf: 2,
      entities: ["self_portrait", "cold_painter"].map(s => P+s)
    },

    [P+"library"]: {
      id: P+"library",
      name: "The Library",
      floor: "GROUND",
      description: "Theodore Carrow's books, and they are not the books one expects of a psychiatrist of his standing: Jung, yes, and Janet, but also the <em>Malleus</em>, an annotated <em>De Daemoniacis</em>, three editions of the <em>Rituale Romanum</em>. The desk is a doctor's desk — blotter, ink, a stethoscope coiled like a small black snake. A drawer is locked. A wing-back chair faces away from the door, and from a certain angle of approach you would swear it is occupied.",
      short: "Theodore's books — psychiatry and demonology side by side. Doctor's desk, stethoscope, locked drawer. A wing-back chair faces away from the door.",
      hotspots: [
        { id: "wm-case-notes", label: "Theodore's case-notes (top drawer)", action: "document", target: P+"theo_notes" },
        { id: "wm-rituale", label: "Annotated Rituale Romanum", action: "document", target: P+"rituale" },
        { id: "wm-locked-drawer", label: "The locked drawer", action: "examine", target: P+"locked_drawer" },
        { id: "wm-wingback", label: "Approach the wing-back chair", action: "examine", target: P+"wingback" },
        { id: "wm-library-to-morning", label: "Through to the morning room", action: "travel", target: P+"morning" },
        { id: "wm-library-to-kitchen", label: "Through to the kitchen", action: "travel", target: P+"kitchen" },
        { id: "wm-back-foyer", label: "Back to the foyer", action: "travel", target: P+"foyer" }
      ],
      emf: 2,
      entities: ["wingback", "voice_in_walls"].map(s => P+s)
    },

    [P+"kitchen"]: {
      id: P+"kitchen",
      name: "The Kitchen",
      floor: "GROUND",
      description: "A working kitchen, kept in a manner that suggests its keeper has not, in some years, accepted that there is no one to cook for. A loaf is rising under a tea-towel. A kettle, just off the boil. Two cups, set out: yours, presumably — and one other. The icebox hums in a register that is, very faintly, lower than it ought to be.",
      short: "Kept impeccably. A loaf rising. Kettle just off the boil. Two cups set out — yours and one other. The icebox hums too low.",
      hotspots: [
        { id: "wm-second-cup", label: "The second cup", action: "examine", target: P+"second_cup" },
        { id: "wm-ledger", label: "Household ledger on the shelf", action: "document", target: P+"thrale_ledger" },
        { id: "wm-icebox", label: "The icebox", action: "examine", target: P+"icebox" },
        { id: "wm-kitchen-to-library", label: "Through to the library", action: "travel", target: P+"library" },
        { id: "wm-back-foyer", label: "Back to the foyer", action: "travel", target: P+"foyer" }
      ],
      emf: 3,
      entities: []
    },

    [P+"upper_hall"]: {
      id: P+"upper_hall",
      name: "Upper Hall",
      floor: "UPPER",
      description: "A long carpeted corridor, runner-rugged in a faded oriental pattern. Three doors. The first stands open: the master bedroom, where Theodore and his second wife slept. The second is closed: Vivian's room — the door, even at this distance, is the wrong colour, as though it had been repainted recently in an attempt to forget what colour it had been. At the far end, behind a heavy curtain: a narrower door, padlocked. <em>The attic stair.</em>",
      short: "Master bedroom (door open). Vivian's room (door closed, repainted). At the end, behind a curtain — the padlocked attic stair.",
      hotspots: [
        { id: "wm-master-room",  label: "Master bedroom", action: "travel", target: P+"master" },
        { id: "wm-viv-room",     label: "Vivian's bedroom (closed)", action: "travel", target: P+"viv_room" },
        { id: "wm-attic-curtain", label: "Behind the curtain — the attic door", action: "travel", target: P+"attic_door" },
        { id: "wm-stairs-down",  label: "Back downstairs", action: "travel", target: P+"foyer" }
      ],
      emf: 2,
      entities: ["the_landing_cold"].map(s => P+s)
    },

    [P+"master"]: {
      id: P+"master",
      name: "The Master Bedroom",
      floor: "UPPER",
      description: "Theodore and Eleanor's room. The bed is made with the precision of grief or of a hotel. Eleanor's vanity sits beneath the window, brushes laid out as though she meant to come back in an hour. Her hairbrush still holds — implausibly, given the years — a small soft drift of fair hair. On the bedside table, in a silver frame: a photograph of Eleanor with a packed suitcase at her feet. She is not smiling.",
      short: "Theo and Eleanor's room. Vanity beneath the window. Eleanor's hairbrush still holds her hair. Framed photo: Eleanor with a packed suitcase, not smiling.",
      hotspots: [
        { id: "wm-vanity", label: "Eleanor's vanity", action: "examine", target: P+"vanity" },
        { id: "wm-hairbrush", label: "The hairbrush", action: "examine", target: P+"hairbrush" },
        { id: "wm-suitcase-photo", label: "The suitcase photograph", action: "document", target: P+"eleanor_photo" },
        { id: "wm-rest", label: "Rest a moment on the chaise", action: "rest_master" },
        { id: "wm-master-to-viv", label: "Across the hall to Vivian's room", action: "travel", target: P+"viv_room" },
        { id: "wm-back-uhall", label: "Back to the upper hall", action: "travel", target: P+"upper_hall" }
      ],
      emf: 2,
      entities: ["eleanor_cold"].map(s => P+s)
    },

    [P+"viv_room"]: {
      id: P+"viv_room",
      name: "Vivian's Bedroom",
      floor: "UPPER",
      description: "<em>The door swings inward without the key.</em> Eighteen years of dust have not, you notice, accumulated. The bed is unmade — the impression of a head still in the pillow, the bedclothes turned back as though their occupant had stepped out for a glass of water and meant to return. The window stands open onto the lake. The curtains are damp. So, beneath your shoe, is the carpet.",
      short: "The door opens without a key. The bed unmade, head-print in the pillow. Window open to the lake. Curtains damp. The carpet, beneath your shoe — wet.",
      hotspots: [
        { id: "wm-bed",        label: "The unmade bed", action: "examine", target: P+"viv_bed" },
        { id: "wm-viv-window", label: "The open window", action: "examine", target: P+"viv_window" },
        { id: "wm-wardrobe",   label: "Vivian's wardrobe", action: "examine", target: P+"wardrobe" },
        { id: "wm-final-letter", label: "Sealed letter on the writing-stand", action: "document", target: P+"viv_letter" },
        { id: "wm-viv-to-master", label: "Across the hall to the master bedroom", action: "travel", target: P+"master" },
        { id: "wm-viv-to-attic", label: "Down to the attic door", action: "travel", target: P+"attic_door" },
        { id: "wm-back-uhall", label: "Back to the upper hall", action: "travel", target: P+"upper_hall" }
      ],
      emf: 4,
      entities: ["drowned_wife", "bedroom_cold"].map(s => P+s)
    },

    [P+"attic_door"]: {
      id: P+"attic_door",
      name: "The Attic Door",
      floor: "UPPER",
      description: "A narrower door than the others, heavier than its frame suggests, set behind the curtain at the end of the hall. The padlock is the size of a fist. Beside it, on the wall, three small wooden crosses have been nailed at a child's eye-level. The lowest is upside down — not, you suspect, by intent, but by some long-ago slipping of the nail. From the other side: nothing. A silence so complete it has the shape of listening.",
      short: "Padlocked attic door. Three child-height crosses, the lowest inverted. Silence on the other side — listening silence.",
      hotspots: [
        { id: "wm-padlock", label: "Examine the padlock", action: "examine", target: P+"padlock" },
        { id: "wm-crosses", label: "The three crosses", action: "examine", target: P+"crosses" },
        { id: "wm-knock-attic", label: "Knock", action: "knock", target: P+"attic_knock" },
        { id: "wm-say-name", label: "Say a name three times", action: "examine", target: P+"three_names" },
        { id: "wm-attic-to-viv", label: "Back along to Vivian's bedroom", action: "travel", target: P+"viv_room" },
        { id: "wm-back-uhall", label: "Back to the upper hall", action: "travel", target: P+"upper_hall" }
      ],
      emf: 5,
      entities: ["beatrice", "the_jesuit"].map(s => P+s)
    },

    [P+"attic"]: {
      id: P+"attic",
      name: "The Attic",
      floor: "ATTIC",
      description: "<em>The padlock is open in your hand. You do not remember it opening.</em> A low-ceilinged room with the angles of the roof closing in. A child's bed under the eaves. A doll, faced into the corner. A coloring book on the floor, opened to a page that has been worked over in pencil long past the printed lines — the same shape, again and again, in ever-larger circles. The crucifix on the far wall is, very precisely, inverted. The air is the temperature of a stopped clock.",
      short: "Padlock open in your hand. Child's bed, doll faced into the corner. Coloring book worked over in pencil — the same shape, again and again. Inverted crucifix.",
      hotspots: [
        { id: "wm-coloring", label: "The coloring book", action: "document", target: P+"coloring_book" },
        { id: "wm-doll", label: "The doll", action: "examine", target: P+"doll" },
        { id: "wm-attic-crucifix", label: "The inverted crucifix", action: "examine", target: P+"inverted_crucifix" },
        { id: "wm-attic-bed", label: "The child's bed", action: "examine", target: P+"attic_bed" },
        { id: "wm-back-uhall", label: "Back down the stair", action: "travel", target: P+"upper_hall" }
      ],
      emf: 7,
      entities: ["beatrice", "voice_in_walls"].map(s => P+s)
    },

    [P+"chapel"]: {
      id: P+"chapel",
      name: "The Family Chapel",
      floor: "GROUND",
      description: "A small Catholic chapel beneath the pines, deconsecrated officially in 1963. Two rows of pews. An altar still dressed in white linen, very slightly grey along the edge. A purple stole has been laid across the altar with an unhurried care: <em>Father Aherne's</em>, by the embroidered monogram. The kneeling-rail is worn smooth at three places — the family's accustomed seats. A small brass plaque on the side wall bears one name: <em>BEATRICE CARROW, 1957–1962.</em>",
      short: "Deconsecrated 1963. Altar with Father Aherne's purple stole. Kneeling-rail worn at three places. A plaque: BEATRICE CARROW, 1957–1962.",
      hotspots: [
        { id: "wm-stole", label: "Father Aherne's stole", action: "examine", target: P+"stole" },
        { id: "wm-aherne-letter", label: "A letter inside the missal", action: "document", target: P+"aherne_letter" },
        { id: "wm-deathcert", label: "Death certificate (sacristy file)", action: "document", target: P+"beatrice_cert" },
        { id: "wm-plaque", label: "Beatrice's plaque", action: "examine", target: P+"plaque" },
        { id: "wm-latin-typing", label: "The typewriter on the lectern", action: "examine", target: P+"latin_typewriter" },
        { id: "wm-chapel-to-jetty", label: "Down the side path to the jetty", action: "travel", target: P+"jetty" },
        { id: "wm-back-drive", label: "Back to the drive", action: "travel", target: P+"drive" }
      ],
      emf: 3,
      entities: ["the_jesuit", "the_rosary"].map(s => P+s)
    },

    [P+"boathouse"]: {
      id: P+"boathouse",
      name: "The Boathouse",
      floor: "GROUND",
      description: "Cedar boards swollen with damp. A single rowboat hangs in its slings, oars up. A lantern on a peg, still trimmed. The water inside the boathouse is black and reflects nothing back — the way a well does when the well is deep. If you bring the lantern close to the surface there is, just beneath, a paler shape. You have not approached it.",
      short: "Single rowboat in slings. Lantern. The water inside is black, reflects nothing. Something pale just beneath the surface — you haven't approached it.",
      hotspots: [
        { id: "wm-lantern", label: "Take the lantern", action: "examine", target: P+"lantern" },
        { id: "wm-second-boat", label: "Look at the pale shape beneath", action: "examine", target: P+"second_boat" },
        { id: "wm-shore", label: "Out to the lake shore", action: "travel", target: P+"lakeshore" },
        { id: "wm-back-jetty", label: "Back along to the jetty", action: "travel", target: P+"jetty" }
      ],
      emf: 2,
      entities: ["the_lake"].map(s => P+s)
    },

    [P+"lakeshore"]: {
      id: P+"lakeshore",
      name: "The Lake Shore",
      floor: "GROUND",
      description: "Black stones, water-smoothed, the size of a sleeping cat. They line the shore in their thousands. In one place, very neatly, a row of them has been arranged: <em>letters</em>, perhaps; <em>a word</em>, perhaps. You have not made it out yet, and as you look, the lake breathes in and out against the stones with a sound that is, if you allow it, almost a voice.",
      short: "Black water-smoothed stones along the shore. A row of them has been arranged — letters, perhaps. The lake breathes against them.",
      hotspots: [
        { id: "wm-stones", label: "Read the row of stones", action: "examine", target: P+"shore_stones" },
        { id: "wm-stand-edge", label: "Stand at the water's edge", action: "examine", target: P+"water_edge" },
        { id: "wm-shore-to-jetty", label: "Along the shore back to the jetty", action: "travel", target: P+"jetty" },
        { id: "wm-back-boathouse", label: "Back to the boathouse", action: "travel", target: P+"boathouse" }
      ],
      emf: 4,
      entities: ["the_lake", "drowned_wife"].map(s => P+s)
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ENTITIES
  // ─────────────────────────────────────────────────────────────────────────
  const entities = {
    [P+"drowned_wife"]: {
      name: "The Drowned Wife",
      room: P+"viv_room",
      film: "Rebecca / The Uninvited — the absent first wife",
      description: "Vivian Carrow, 1908–1958. Returns to her bedroom wet through.",
      detect: { evp: true, thermal: true, empump: true },
      realInStates: ["haunted"]
    },
    [P+"bedroom_cold"]: {
      name: "The Bedroom Cold",
      room: P+"viv_room",
      film: "The Uninvited — the held cold",
      description: "A cold preserved in the bedroom since the day she did not return from the lake.",
      detect: { thermal: true, evp: true },
      realInStates: ["haunted", "partial"],
      environmental: { debunked: "The window is warped open by a quarter-inch. Lake air sinks into the room." }
    },
    [P+"self_portrait"]: {
      name: "The Self-Portrait",
      room: P+"morning",
      film: "Nightmare Castle — the painting that watches",
      description: "Vivian, brush in hand. The eyes resolve differently each time you turn back to the canvas.",
      detect: { sls: true },
      realInStates: ["haunted"],
      environmental: { debunked: "Condensation behind glass distorts the brushwork. The varnish is failing in irregular patches." }
    },
    [P+"cold_painter"]: {
      name: "The Painter",
      room: P+"morning",
      film: "Nightmare Castle — the wife with the white streak",
      description: "Vivian's working presence, by the easel.",
      detect: { thermal: true, ovilus: true },
      realInStates: ["haunted"]
    },
    [P+"portrait_landing"]: {
      name: "The Woman on the Landing",
      room: P+"foyer",
      film: "Rebecca — the unwelcoming wife above the stairs",
      description: "The hurried-shoulder portrait at the turn of the stair. Watches the door.",
      detect: { sls: true, thermal: true },
      realInStates: ["haunted", "partial"]
    },
    [P+"wingback"]: {
      name: "The Occupied Chair",
      room: P+"library",
      film: "The Uninvited — the chair that is not empty",
      description: "Theodore's wing-back chair. At certain angles of approach it is occupied. At others it is not.",
      detect: { sls: true, evp: true },
      realInStates: ["haunted"]
    },
    [P+"voice_in_walls"]: {
      name: "The Voice in the Walls",
      room: P+"library",
      film: "The Exorcist — the unrecorded second voice",
      description: "A voice on tape that was not in the room when the tape was made.",
      detect: { evp: true, tape: true },
      realInStates: ["haunted"]
    },
    [P+"the_landing_cold"]: {
      name: "The Cold on the Landing",
      room: P+"upper_hall",
      film: "The Uninvited — the staircase chill",
      description: "A column of cold air at the head of the stair — the exact width of a woman.",
      detect: { thermal: true, empump: true },
      realInStates: ["haunted", "partial"]
    },
    [P+"eleanor_cold"]: {
      name: "Eleanor's Cold",
      room: P+"master",
      film: "Let's Scare Jessica to Death — the woman who never quite left",
      description: "The second wife. She did not leave this room willingly.",
      detect: { evp: true, sls: true },
      realInStates: ["haunted"]
    },
    [P+"beatrice"]: {
      name: "Beatrice",
      room: P+"attic",
      film: "The Exorcist — the child in the upper room",
      description: "The doctor's daughter. Father Aherne's attempt did not succeed; nor did it entirely fail.",
      detect: { ovilus: true, evp: true, empump: true, knock: true },
      realInStates: ["haunted"]
    },
    [P+"the_jesuit"]: {
      name: "Father Aherne",
      room: P+"chapel",
      film: "The Exorcist — the priest who stayed",
      description: "A Jesuit who arrived in October 1962 and never left the property.",
      detect: { kii: true, knock: true, evp: true },
      realInStates: ["haunted", "partial"]
    },
    [P+"the_rosary"]: {
      name: "The Warm Rosary",
      room: P+"chapel",
      film: "The Exorcist — the inheritance of cold metal",
      description: "Father Aherne's beads. Inexplicably warm.",
      detect: { thermal: true },
      realInStates: ["haunted"],
      environmental: { debunked: "A draft from the sacristy's wood-stove keeps the altar end of the chapel measurably warmer." }
    },
    [P+"the_lake"]: {
      name: "The Lake",
      room: P+"lakeshore",
      film: "Let's Scare Jessica to Death — the water that listens",
      description: "Lake Wyndmere itself. In some readings of the night it is the largest entity on the property.",
      detect: { spirit: true, thermal: true, sls: true },
      realInStates: ["haunted", "partial"]
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DOCUMENTS
  // ─────────────────────────────────────────────────────────────────────────
  const documents = {
    [P+"viv_diary"]: {
      title: "Vivian Carrow — Diary, final entries",
      body:
        "<p><strong>2 October 1958.</strong> T. has spoken to Dr. M. again, and to Dr. P., and now also (he says) to a colleague at the Institute. They have agreed I am 'not well.' I am very well, but I am tired of being told otherwise by men with appointment-books.</p>" +
        "<p><strong>5 October.</strong> T. is short with B. tonight at supper. She wept. I am not to remove her from his discipline — those are the words used. <em>His discipline.</em> She is FIVE.</p>" +
        "<p><strong>7 October.</strong> A package today from Bellevue — papers for me to sign. I have not signed them. If I sign them I will not leave the house I have signed in.</p>" +
        "<p><strong>9 October.</strong> The lake will hold me up, or it will not. I would rather know.</p>",
      contradicts: "thrale_vivian_happy"
    },
    [P+"theo_notes"]: {
      title: "Dr. Theodore Carrow — Case Notes, B.C., 1962",
      body:
        "<p>Patient (B.C., aet. 5) demonstrates inappropriate affect on the anniversary of the mother's drowning. Speech impoverished. Marked nocturnal disturbance. Refers to mother as 'in the lake' and resists correction. Recommend rest, restriction of stimulus, exclusion of clergy (the housekeeper has been bringing in Fr. Aherne, against my standing instruction).</p>" +
        "<p>14 Oct. Increasingly violent during night hours. Restraint indicated.</p>" +
        "<p>22 Oct. Aherne admitted under duress. Performed the lesser rite. Patient unaffected.</p>" +
        "<p>28 Oct. Major rite attempted. Aherne deceased at 3:11 a.m., cause TBD. Patient stable. Will not speak.</p>",
      contradicts: "thrale_aherne_boston"
    },
    [P+"rituale"]: {
      title: "Rituale Romanum (1614 ed., annotated)",
      body:
        "<p>Theodore's marginalia, in a cramped clinical hand, against the rite of exorcism:</p>" +
        "<p><em>Hysterical. Cf. Charcot. — Useless. — But she answers in Latin she has never been taught. — DEAR GOD.</em></p>",
      contradicts: "thrale_no_priest"
    },
    [P+"viv_letter"]: {
      title: "Sealed letter — to T., from V., dated 9 Oct 1958",
      body:
        "<p><em>Theodore,</em></p>" +
        "<p>I will not sign your papers. I am not your patient and I am not your project. I will not be 'rested' in a hospital so that you may, as you put it last evening, 'continue your work in peace.' If I am wrong about myself you may have me declared so, but you will do it with my child watching, and you will live afterwards with what you have done. <em>V.</em></p>",
      contradicts: "thrale_vivian_happy"
    },
    [P+"eleanor_photo"]: {
      title: "Photograph — Eleanor Carrow with packed suitcase, 27 Oct 1962",
      body:
        "<p>Eleanor, in her travelling coat, beside a single suitcase. The shadow on the wall behind her includes the corner of a second figure, just out of frame. The date is written on the reverse in Eleanor's hand: <em>I am going tonight. Forgive me.</em></p>",
      contradicts: "thrale_eleanor_connecticut"
    },
    [P+"thrale_ledger"]: {
      title: "Household Ledger — M. Thrale, October 1958",
      body:
        "<p>Among the household orders for the month: <em>11 Oct — seven yards black bunting, Webster's, on account. Funeral wreath, white & yellow, Adams Florists. Three black-edged cards, Stationer's.</em></p>" +
        "<p>The entry is dated <strong>two days before</strong> Vivian Carrow was reported missing in the lake.</p>",
      contradicts: "thrale_vivian_happy"
    },
    [P+"aherne_letter"]: {
      title: "Father Donal Aherne, SJ — letter to his Provincial",
      body:
        "<p><em>Boston, draft not sent. Found between pages of the chapel missal.</em></p>" +
        "<p>Reverend Father — I write at the hour of three on the morning of 28 October, from the chapel here at Wyndmere. I do not expect to write to you again. The rite did not work in the form I attempted it. The child speaks Latin she does not know. The father will not hear me. The mother — and here I confess to a thing I should not — the mother is on the property still, and I have spoken with her this evening at the shore. She asked me to look after the girl. I do not know how to do this. I will try the rite again at dawn. If you are reading this it has gone otherwise. — DA</p>",
      contradicts: "thrale_aherne_boston"
    },
    [P+"beatrice_cert"]: {
      title: "Certificate of Death — Beatrice Carrow",
      body:
        "<p>NAME: Beatrice Mary Carrow. DOB: 4 March 1957. DOD: 29 October 1962. AGE: 5.</p>" +
        "<p>CAUSE OF DEATH: Meningitis, complicated by febrile seizures. CERTIFIED BY: Theodore S. Carrow, M.D. (the father).</p>" +
        "<p>BURIAL: Family chapel, Wyndmere. Casket: <em>closed</em>, at parent's instruction.</p>",
      contradicts: "thrale_beatrice_peaceful"
    },
    [P+"theo_suicide_note"]: {
      title: "Note left on Dr. Carrow's library desk, 28 Oct 1962",
      body:
        "<p>One sheet, in Theodore's hand: <em>I cannot continue. The arrangement with Aherne was a failure of my own design. May God forgive me for the doctor's part of it.</em></p>" +
        "<p>The note is dated <strong>28 October 1962</strong>. Father Aherne's body was discovered the following morning, 29 October, at 3:11 a.m. The note was therefore written before the failure it describes.</p>",
      contradicts: "thrale_theo_grief"
    },
    [P+"coloring_book"]: {
      title: "A child's coloring book, dated October 1962",
      body:
        "<p>The printed pages — rabbits, balloons, a lighthouse — have been worked over in pencil long past the lines. On every page, in expanding spirals: <em>the same word</em>, in a child's careful capitals. <strong>BELOW. BELOW. BELOW.</strong></p>" +
        "<p>The last page is dated in an adult hand: <em>B's last book. 28 Oct.</em></p>"
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // WORD POOLS — Spirit Box / Ovilus
  // ─────────────────────────────────────────────────────────────────────────
  const wordPools = {
    [P+"jetty"]:    [
      { word: "BELOW",    type: "clue" },
      { word: "WET",      type: "clue" },
      { word: "MOTHER",   type: "clue" },
      { word: "DEEP",     type: "threat" },
      { word: "ROPE",     type: "noise" }
    ],
    [P+"drive"]:    [
      { word: "QUIET",    type: "noise" },
      { word: "WATCH",    type: "threat" },
      { word: "TRIKE",    type: "noise" }
    ],
    [P+"foyer"]:    [
      { word: "VIVIAN",   type: "clue" },
      { word: "WAIT",     type: "threat" },
      { word: "ANSWER",   type: "noise" },
      { word: "BELL",     type: "noise" }
    ],
    [P+"morning"]:  [
      { word: "BRUSH",    type: "clue" },
      { word: "EAST",     type: "noise" },
      { word: "PAINT",    type: "clue" },
      { word: "SEE-ME",   type: "threat" }
    ],
    [P+"library"]:  [
      { word: "DOCTOR",   type: "clue" },
      { word: "RITE",     type: "clue" },
      { word: "STAY",     type: "threat" },
      { word: "TAPE",     type: "noise" }
    ],
    [P+"kitchen"]:  [
      { word: "TWO",      type: "clue" },
      { word: "BREAD",    type: "noise" },
      { word: "COLD",     type: "noise" }
    ],
    [P+"upper_hall"]: [
      { word: "HER",      type: "clue" },
      { word: "STAIR",    type: "threat" },
      { word: "LEAVE",    type: "threat" }
    ],
    [P+"master"]:   [
      { word: "ELEANOR",  type: "clue" },
      { word: "SUITCASE", type: "clue" },
      { word: "OPEN",     type: "noise" },
      { word: "DROWN",    type: "threat" }
    ],
    [P+"viv_room"]: [
      { word: "VIVIAN",   type: "clue" },
      { word: "BACK",     type: "clue" },
      { word: "WET",      type: "clue" },
      { word: "AGAIN",    type: "threat" },
      { word: "BELOW",    type: "threat" }
    ],
    [P+"attic_door"]: [
      { word: "BEATRICE", type: "clue" },
      { word: "OPEN",     type: "threat" },
      { word: "MOTHER",   type: "clue" },
      { word: "LATIN",    type: "noise" }
    ],
    [P+"attic"]:    [
      { word: "DOWN",     type: "threat" },
      { word: "FATHER",   type: "clue" },
      { word: "PRAY",     type: "clue" },
      { word: "AHERNE",   type: "clue" },
      { word: "BELOW",    type: "threat" },
      { word: "EAT",      type: "threat" }
    ],
    [P+"chapel"]:   [
      { word: "DOMINE",   type: "clue" },
      { word: "OREMUS",   type: "noise" },
      { word: "DEUS",     type: "noise" },
      { word: "DONAL",    type: "clue" },
      { word: "FAIL",     type: "threat" }
    ],
    [P+"boathouse"]: [
      { word: "KEEL",     type: "noise" },
      { word: "TWO",      type: "clue" },
      { word: "OAR",      type: "noise" }
    ],
    [P+"lakeshore"]: [
      { word: "BELOW",    type: "clue" },
      { word: "FORGAVE",  type: "clue" },
      { word: "FORGIVE",  type: "clue" },
      { word: "WAVES",    type: "noise" },
      { word: "STONE",    type: "noise" }
    ]
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DIALOGUE — Mrs. Margaret Thrale (Mrs. Danvers archetype)
  // ─────────────────────────────────────────────────────────────────────────
  const dialogue = {
    thrale_arrival: {
      speaker: "Mrs. Thrale",
      line: "You'll be the trust's investigator. I'm Mrs. Thrale. Housekeeper here since 1924 — for Mrs. Carrow first, and after her, of course, for the doctor, and after him for the house. I do not, you understand, work for the trust. I work for Wyndmere. Please come in. The doctor's library is much as he left it. Mrs. Carrow's room is locked, and will remain so.",
      short: "I'm Mrs. Thrale. Housekeeper since 1924. I work for Wyndmere, not the trust. The doctor's library is as he left it. Mrs. Carrow's room is locked.",
      choices: [
        { text: "Tell me about Mrs. Carrow.", goto: "thrale_vivian" },
        { text: "Tell me about Dr. Carrow.", goto: "thrale_theodore" },
        { text: "There was a second Mrs. Carrow, was there not?", goto: "thrale_eleanor" },
        { text: "And the child, Beatrice?", goto: "thrale_beatrice" },
        { text: "I'm told a priest was here in 1962.", goto: "thrale_aherne" },
        { text: "I'm ready. Show me the house.", goto: "start_walkthrough" }
      ]
    },

    thrale_vivian: {
      speaker: "Mrs. Thrale",
      line: "Mrs. Carrow was happy here. She painted. She walked at the shore in the mornings. The lake, on a still day, can quite become one's whole world — and Mrs. Carrow had the talent of stillness. She drowned, in the end, in a swimming accident. It was nobody's fault.",
      short: "Mrs. Carrow was happy here. She painted. She walked at the shore. Drowned, in the end, in a swimming accident. Nobody's fault.",
      calderClaim: "thrale_vivian_happy",
      choices: [
        { text: "Happy. You're certain of that.", goto: "thrale_vivian_pressed" },
        { text: "Back.", goto: "thrale_arrival" }
      ]
    },
    thrale_vivian_pressed: {
      speaker: "Mrs. Thrale",
      line: "I am certain of every thing I have just said to you. You will perhaps decide otherwise in the course of your evening. I would ask, only, that you not say it to me.",
      short: "I am certain of every thing I have said. You'll perhaps decide otherwise tonight. Please don't say it to me.",
      choices: [{ text: "Back.", goto: "thrale_vivian" }]
    },

    thrale_theodore: {
      speaker: "Mrs. Thrale",
      line: "The doctor was a great man. Bellevue, and three teaching appointments. He worked at the limit of what his profession permitted — and, on occasion, at the limit of what it forbade. He took his own life out of grief, in October of '62, the night after we lost Miss Beatrice. There is a note in the library. It is on the desk where he left it.",
      short: "The doctor was a great man. Took his own life out of grief, Oct '62, the night after we lost Miss Beatrice. The note is on the library desk where he left it.",
      calderClaim: "thrale_theo_grief",
      choices: [
        { text: "[Press] He left the note the night before, not after.", goto: "thrale_theo_pressed", requires: P+"theo_suicide_note" },
        { text: "Back.", goto: "thrale_arrival" }
      ]
    },
    thrale_theo_pressed: {
      speaker: "Mrs. Thrale",
      line: "<em>(A pause too long to be polite.)</em> You are reading dates very closely tonight. I should perhaps have put the note away years ago. The doctor was a careful man, in his way. He would have known what he was doing in dating it.",
      short: "(A pause too long to be polite.) You're reading dates closely tonight. He would have known what he was doing.",
      choices: [{ text: "Back.", goto: "thrale_theodore" }]
    },

    thrale_eleanor: {
      speaker: "Mrs. Thrale",
      line: "Mrs. Eleanor was the doctor's second wife — much younger, of course. After the doctor's death she could not bear the house. Quite understandable. She remarried in Connecticut in '64. She still writes to me. She is well.",
      short: "Eleanor — the doctor's much-younger second wife. Couldn't bear the house after his death. Remarried in Connecticut '64. Still writes. She is well.",
      calderClaim: "thrale_eleanor_connecticut",
      choices: [
        { text: "[Press] She left BEFORE the doctor, according to her own hand.", goto: "thrale_eleanor_pressed", requires: P+"eleanor_photo" },
        { text: "May I see one of her letters?", goto: "thrale_eleanor_letters" },
        { text: "Back.", goto: "thrale_arrival" }
      ]
    },
    thrale_eleanor_pressed: {
      speaker: "Mrs. Thrale",
      line: "She wrote that photograph in her travelling coat. She did not leave that night. I dissuaded her. She left, in the proper way, a fortnight later, by the morning train from Lake Placid. I drove her to the station myself.",
      short: "She wrote the photograph but didn't leave that night — I dissuaded her. She left a fortnight later by the morning train. I drove her to the station.",
      choices: [{ text: "Back.", goto: "thrale_eleanor" }]
    },
    thrale_eleanor_letters: {
      speaker: "Mrs. Thrale",
      line: "I keep them in my own room, which I do not show to guests. I will quote you a line if you like. She wrote to me last spring: <em>the lake, in dreams, still asks for me.</em> One does not get over Wyndmere. One only stops paying it visits.",
      short: "I keep them in my own room. She wrote last spring: 'the lake, in dreams, still asks for me.'",
      choices: [{ text: "Back.", goto: "thrale_eleanor" }]
    },

    thrale_beatrice: {
      speaker: "Mrs. Thrale",
      line: "Miss Beatrice passed peacefully. Meningitis. She was five. The doctor signed the certificate himself — and would not have, you understand, had it been otherwise. She is buried in the chapel. The plaque is on the wall there. You may visit.",
      short: "Miss Beatrice passed peacefully. Meningitis. Age 5. The doctor signed it himself. Buried in the chapel.",
      calderClaim: "thrale_beatrice_peaceful",
      choices: [
        { text: "[Press] The casket was closed at his instruction.", goto: "thrale_beatrice_pressed", requires: P+"beatrice_cert" },
        { text: "There is, then, no one upstairs in the attic.", goto: "thrale_attic" },
        { text: "Back.", goto: "thrale_arrival" }
      ]
    },
    thrale_beatrice_pressed: {
      speaker: "Mrs. Thrale",
      line: "<em>(Her eye does not move.)</em> A father may close the casket of his five-year-old daughter without it requiring an interpretation. The fever had been disfiguring. He spared us. Spare us, in your turn.",
      short: "(Her eye does not move.) A father may close his daughter's casket. The fever had been disfiguring. Spare us, in your turn.",
      choices: [{ text: "Back.", goto: "thrale_beatrice" }]
    },
    thrale_attic: {
      speaker: "Mrs. Thrale",
      line: "The attic is locked because the floor is unsound, and because the door does not close properly in damp weather, and because I do not, at my age, climb to it. The padlock has been on it since the doctor's time. I do not have the key.",
      short: "Attic is locked. Floor unsound. Door warps. I'm too old. Padlock has been there since the doctor's time. I don't have the key.",
      choices: [
        { text: "[Press] The padlock has been re-oiled in the last week.", goto: "thrale_attic_pressed", requires: "examined_padlock" },
        { text: "Back.", goto: "thrale_beatrice" }
      ]
    },
    thrale_attic_pressed: {
      speaker: "Mrs. Thrale",
      line: "I oil locks. It is what one does in a damp house. You will find every lock in Wyndmere has been oiled in the last week.",
      short: "I oil locks. It is what one does in a damp house.",
      choices: [{ text: "Back.", goto: "thrale_attic" }]
    },

    thrale_aherne: {
      speaker: "Mrs. Thrale",
      line: "Father Aherne. A friend of the family. He visited, in October of '62, at the doctor's request — Mrs. Eleanor was a Catholic, and was suffering, after Miss Beatrice, very greatly. The Father stayed a fortnight and returned to Boston. He died there some years later, I believe.",
      short: "Father Aherne. Family friend. Visited Oct '62 at the doctor's request — Eleanor was suffering. Stayed a fortnight, returned to Boston, died there some years later.",
      calderClaim: "thrale_aherne_boston",
      choices: [
        { text: "[Press] His own letter says otherwise. He died here.", goto: "thrale_aherne_pressed", requires: P+"aherne_letter" },
        { text: "Was there a service in the chapel?", goto: "thrale_no_priest" },
        { text: "Back.", goto: "thrale_arrival" }
      ]
    },
    thrale_aherne_pressed: {
      speaker: "Mrs. Thrale",
      line: "<em>(For the first time, her hands move.)</em> ...The Father did die at Wyndmere. The trust thought it kinder to put it otherwise in the file. He died in the chapel, of a heart, on the night the child went. The two events were not connected. They were merely simultaneous. I had hoped never to discuss it.",
      short: "(Her hands move for the first time.) ...He did die at Wyndmere. In the chapel. Of a heart. The night the child went. The two events were not connected — only simultaneous.",
      choices: [{ text: "Back.", goto: "thrale_aherne" }]
    },
    thrale_no_priest: {
      speaker: "Mrs. Thrale",
      line: "There was no service. The chapel had been deconsecrated by the time we needed it. We laid Miss Beatrice in herself. The doctor would not have a priest in the house — and Father Aherne was, by then, only a guest. A medical matter, after all, is a medical matter.",
      short: "No service. Chapel was deconsecrated by the time we needed it. The doctor would not have a priest in the house. A medical matter is a medical matter.",
      calderClaim: "thrale_no_priest",
      choices: [
        { text: "[Press] The Rituale in the library disagrees.", goto: "thrale_no_priest_pressed", requires: P+"rituale" },
        { text: "Back.", goto: "thrale_aherne" }
      ]
    },
    thrale_no_priest_pressed: {
      speaker: "Mrs. Thrale",
      line: "The doctor read everything. He read for amusement; he read for an argument with himself; he read because he could not sleep. A book on a shelf is not, you understand, evidence of a sacrament.",
      short: "The doctor read everything. A book on a shelf is not evidence of a sacrament.",
      choices: [{ text: "Back.", goto: "thrale_no_priest" }]
    },

    // Override Ashgrove's start_walkthrough — Mrs. Thrale's leave-taking.
    start_walkthrough: {
      speaker: "Mrs. Thrale",
      line: "Here are the keys to the front door, and to the boathouse — and the small one is for the chapel, should you find a reason. I sleep above the kitchen. I do not, ordinarily, come down before six. The lake is not to be entered, and the attic is not to be opened. I shall see you at dawn, if you are seeing visitors then.",
      short: "Keys to the front door, the boathouse, the chapel. I sleep above the kitchen. Don't enter the lake. Don't open the attic. I'll see you at dawn — if you're seeing visitors then.",
      choices: [
        { text: "One more question first.", goto: "thrale_arrival" },
        { text: "Goodnight, Mrs. Thrale.", goto: "__leave", action: "calder_leaves" }
      ]
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRADICTIONS — keyed by calderClaim
  // ─────────────────────────────────────────────────────────────────────────
  const contradictions = {
    thrale_vivian_happy:
      "Mrs. Thrale: 'Mrs. Carrow was happy here.' • Vivian's diary (9 Oct 1958): <em>'The lake will hold me up, or it will not. I would rather know.'</em> • Household ledger: <strong>black bunting and a funeral wreath ordered TWO DAYS BEFORE</strong> she was reported missing.",
    thrale_theo_grief:
      "Mrs. Thrale: 'He took his own life out of grief, the night after we lost Miss Beatrice.' • The note in the library is dated <strong>28 October</strong>. Beatrice and Aherne both died at 3:11 a.m. on <strong>29 October</strong>. He wrote the note BEFORE the loss it claims to grieve.",
    thrale_eleanor_connecticut:
      "Mrs. Thrale: 'Eleanor remarried in Connecticut in '64. She still writes.' • Eleanor's own photograph (27 Oct 1962, three days before Theodore's note): <em>'I am going tonight. Forgive me.'</em> A second figure stands just out of frame.",
    thrale_beatrice_peaceful:
      "Mrs. Thrale: 'Miss Beatrice passed peacefully. Meningitis.' • Theodore's case-notes record 'restraint indicated,' 'major rite attempted,' and 'patient will not speak' — language no paediatrician would use for a febrile child. • The casket was closed at the father's instruction.",
    thrale_aherne_boston:
      "Mrs. Thrale: 'Father Aherne returned to Boston and died there some years later.' • Aherne's own letter, written in the Wyndmere chapel at 3 a.m. on 28 October: <em>'I do not expect to write to you again.'</em> Theodore's case-notes record his death at 3:11 a.m. the following morning, in this house.",
    thrale_no_priest:
      "Mrs. Thrale: 'The doctor would not have a priest in the house.' • The Rituale Romanum (1614 ed.) in the doctor's library is annotated in his own hand — including the words <em>'But she answers in Latin she has never been taught. — DEAR GOD.'</em>"
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SIGNATURE SCARES
  // All `once:` keys are prefixed wm_ to avoid Ashgrove collisions.
  // All `when:` checks gate on s._story === "wyndmere".
  // ─────────────────────────────────────────────────────────────────────────
  const scares = [

    // 1. THE WET ROOM — first time the player enters Vivian's bedroom.
    {
      id: "wm_wet_room",
      when: ({ s }) => s._story === "wyndmere" && s.currentRoom === P+"viv_room" && !s._wmFlags?.wet_room,
      truths: ["haunted"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.wet_room = true;
        narrate("<em>Wet footprints lead from the hall door to the bed. As you watch — and you are watching, very carefully — the bedclothes settle, as though someone slight has sat down on the edge.</em>");
        try { audio.sfx("breath"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>The window does not slam. It is closed, with care, by an unhurried hand.</em>");
          try { audio.sfx("door"); } catch (_) {}
          if (typeof bumpAggression === "function") bumpAggression(2, "the bedroom received its tenant");
          if (typeof logEvidence === "function") logEvidence("Apparition", "Wet footprints, hall to bed. Bedclothes settled. Window closed by an unseen hand.");
        }, 1500);
        showIntertitle("THE WET ROOM",
          "<em>The room had been kept, eighteen years, as one keeps a place for someone who is in the habit of coming back.</em>",
          { once: "wm_wet_room" });
      }
    },

    // 2. THREE WHISPERS AT THE ATTIC DOOR — at 2 AM, if you ever stood at the attic door
    {
      id: "wm_three_whispers",
      when: ({ s }) => s._story === "wyndmere"
        && s.currentRoom === P+"attic_door"
        && s.timeMinutes >= (24*60 + 2*60)  // 2 AM next morning
        && !s._wmFlags?.three_whispers,
      truths: ["haunted", "partial"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.three_whispers = true;
        narrate("<em>You speak the child's name once — softly, almost to yourself. From beyond the door, after a beat that should not have been there: a small voice. <strong>'Yes, mother.'</strong></em>");
        try { audio.sfx("whisper"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>The chain on the padlock comes off in your hand. The padlock is still closed. The chain is still threaded through it. You did not, you would swear, untie anything.</em>");
          try { audio.sfx("chime"); } catch (_) {}
          if (typeof bumpAggression === "function") bumpAggression(3, "Beatrice answered to her mother's name");
          if (typeof logEvidence === "function") logEvidence("Direct Voice", "Child voice beyond the attic door: 'Yes, mother.' Chain off lock. Lock unbroken.");
        }, 1400);
        showIntertitle("YES, MOTHER",
          "<em>It is the misfortune of certain houses that their children, having gone, retain the manners of having stayed.</em>",
          { once: "wm_three_whispers" });
      }
    },

    // 3. MRS. THRALE'S MONOLOGUE — at 3 AM on the staircase landing.
    {
      id: "wm_thrale_monologue",
      when: ({ s }) => s._story === "wyndmere"
        && s.currentRoom === P+"upper_hall"
        && s.timeMinutes >= (24*60 + 3*60)
        && !s._wmFlags?.thrale_monologue,
      truths: ["haunted", "partial", "debunked"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.thrale_monologue = true;
        narrate("<em>At the foot of the upper stair, Mrs. Thrale is standing. She is wearing — you do not, at first, recognise it — a dressing-gown that is not her own. Pale silk. The cuffs are damp.</em>");
        try { audio.sfx("whisper"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>'You have been so kind to come,' she says, without lifting her face. 'But wouldn't it be easier, do you think — wouldn't it be so much easier — if you simply went to her? She would not mind the company. The lake is very deep, and very still, and you have come all this way.'</em>");
          if (typeof bumpAggression === "function") bumpAggression(2, "Mrs. Thrale, wearing the dead woman's gown, suggested the lake");
          if (typeof logEvidence === "function") logEvidence("Witness Statement", "Mrs. Thrale at 3 AM in Vivian Carrow's dressing-gown, suggesting the lake.");
        }, 1800);
        showIntertitle("THE INVITATION",
          "<em>One does not refuse a hostess. One only outlives her.</em>",
          { once: "wm_thrale_monologue" });
      }
    },

    // 4. THE SELF-PORTRAIT'S FOURTH FACE — after multiple morning-room visits.
    {
      id: "wm_portrait_ages",
      when: ({ s }) => s._story === "wyndmere"
        && s.currentRoom === P+"morning"
        && (s._wmCounts?.morning || 0) >= 3
        && !s._wmFlags?.portrait_ages,
      truths: ["haunted"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.portrait_ages = true;
        narrate("<em>You have looked at the self-portrait three times tonight, and three times the brushwork has been a little different — a child's hand at first, then an older painter's, then a wet one. The fourth time, the canvas is empty.</em>");
        try { audio.sfx("whisper"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>You turn. In the parlor mirror, behind you, she is standing. Brush still in her hand. The brush is dripping.</em>");
          try { audio.sfx("heartbeat"); } catch (_) {}
          if (typeof bumpAggression === "function") bumpAggression(3, "the painter, in the mirror behind you");
          if (typeof logEvidence === "function") logEvidence("Apparition", "Mirror reflection: Vivian Carrow, brush wet. Canvas now empty.");
        }, 1500);
        showIntertitle("THE FOURTH FACE",
          "<em>A painter, given long enough, will paint herself out of the frame, the better to enter the room.</em>",
          { once: "wm_portrait_ages" });
      }
    },

    // 5. THE GIRL SINGING IN THE LAKE — at the lakeshore between 1:00 and 1:30 AM
    {
      id: "wm_lake_singing",
      when: ({ s }) => s._story === "wyndmere"
        && (s.currentRoom === P+"lakeshore" || s.currentRoom === P+"jetty")
        && s.timeMinutes >= (24*60 + 1*60)
        && s.timeMinutes < (24*60 + 1*60 + 30)
        && !s._wmFlags?.lake_singing,
      truths: ["haunted", "partial"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.lake_singing = true;
        narrate("<em>From somewhere out across the water, very softly, a child is singing. The tune is one you almost know.</em>");
        try { audio.sfx("whisper"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>You take three paces toward the water. The singing stops. The lake, in front of you, is glass again — and very nearly black — and the only sound is the small wet kiss of it against the stones.</em>");
          if (typeof bumpAggression === "function") bumpAggression(1, "a child sang from the middle of the lake");
          if (typeof logEvidence === "function") logEvidence("Direct Voice", "Child's singing from the lake at 1 AM. Ceased on approach.");
        }, 1600);
        showIntertitle("FROM THE WATER",
          "<em>A lullaby is, in the end, only what a mother sings to a child who will not sleep.</em>",
          { once: "wm_lake_singing" });
      }
    },

    // 6. ELEANOR'S HAIR — touching the brush
    {
      id: "wm_eleanors_hair",
      when: ({ s }) => s._story === "wyndmere" && s._wmFlags?.brushed_brush && !s._wmFlags?.eleanors_hair,
      truths: ["haunted"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.eleanors_hair = true;
        narrate("<em>The bristles touch your palm a third time. Then — distinct, unmistakable, and as cold as the metal frame of the vanity itself — a hand closes around your wrist.</em>");
        try { audio.sfx("breath"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>It does not pull. It only holds — long enough that you understand it is asking you to listen. Then it lets go. The brush, on the vanity, is wet.</em>");
          if (typeof bumpAggression === "function") bumpAggression(2, "Eleanor took your wrist");
          if (typeof logEvidence === "function") logEvidence("Tactile Contact", "Cold hand around investigator's wrist. Released voluntarily. Hairbrush left wet.");
        }, 1500);
        showIntertitle("ELEANOR",
          "<em>The second wife, asked to vanish, was found instead at the wrist of the next person to enter the room.</em>",
          { once: "wm_eleanors_hair" });
      }
    },

    // 7. THE STONES AT THE SHORE — read them once, look away, look back
    {
      id: "wm_shore_message",
      when: ({ s }) => s._story === "wyndmere"
        && s.currentRoom === P+"lakeshore"
        && (s._wmCounts?.lakeshore || 0) >= 2
        && !s._wmFlags?.shore_message,
      truths: ["haunted", "partial", "debunked"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.shore_message = true;
        const t = (typeof state !== "undefined" && state.truth) || "haunted";
        const message =
          t === "haunted"  ? "I FORGIVE YOU" :
          t === "partial"  ? "I FORGAVE HIM" :
                             "WAVES";
        narrate("<em>You read the row of stones a second time. The arrangement is not what it was a minute ago.</em>");
        setTimeout(() => {
          narrate(`<em>It now reads, very clearly: <strong>${message}</strong>.</em>`);
          try { audio.sfx("chime"); } catch (_) {}
          if (typeof logEvidence === "function") logEvidence("Anomalous Object", `Lakeshore stones rearranged: '${message}'.`);
          if (t !== "debunked" && typeof bumpAggression === "function") bumpAggression(1, "the lake left a message");
        }, 1400);
        showIntertitle("THE STONES",
          "<em>The lake, like any patient correspondent, will reply if given time enough to compose itself.</em>",
          { once: "wm_shore_message" });
      }
    },

    // 8. THE SECOND BOAT — in the boathouse, lantern in hand
    {
      id: "wm_second_boat",
      when: ({ s }) => s._story === "wyndmere" && s._wmFlags?.took_lantern && s.currentRoom === P+"boathouse" && !s._wmFlags?.second_boat,
      truths: ["haunted", "partial"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.second_boat = true;
        narrate("<em>You lower the lantern toward the boathouse water. The pale shape beneath the surface is — you can see it now — the underside of a second rowboat, keel up, just out of reach.</em>");
        try { audio.sfx("breath"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>Beneath it, a passenger, face-up. The face is, at this distance and through this water, indistinct. Then it is not.</em>");
          try { audio.sfx("whisper"); } catch (_) {}
          if (typeof bumpAggression === "function") bumpAggression(2, "the second boat made itself known");
          if (typeof logEvidence === "function") logEvidence("Apparition", "Second rowboat submerged beneath the first. Passenger face-up. Identification: pending.");
        }, 1400);
        showIntertitle("THE SECOND BOAT",
          "<em>A boathouse, by tradition, holds one boat. Where a second is kept, a second is for.</em>",
          { once: "wm_second_boat" });
      }
    },

    // 9. THE LATIN TYPEWRITER — chapel
    {
      id: "wm_latin_typewriter",
      when: ({ s }) => s._story === "wyndmere" && s.currentRoom === P+"chapel" && !s._wmFlags?.latin_typewriter,
      truths: ["haunted", "partial"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.latin_typewriter = true;
        narrate("<em>The typewriter on the lectern, untouched, depresses one key, and another, and another, in a slow careful sequence. The paper advances. It reads:</em>");
        try { audio.sfx("knock"); } catch (_) {}
        setTimeout(() => {
          narrate("<em><strong>EXI · AB · EA · SPIRITVS · IMMVNDE</strong> — <em>(Depart from her, unclean spirit.)</em></em>");
          setTimeout(() => {
            narrate("<em>The typewriter stops. A long beat. Then, on its own, a single further word, struck hard enough to dent the page:</em> <strong>NO</strong>.");
            try { audio.sfx("distant_bang"); } catch (_) {}
            if (typeof bumpAggression === "function") bumpAggression(3, "the chapel answered the rite, and the answer was NO");
            if (typeof logEvidence === "function") logEvidence("Apport / Telekinesis", "Typewriter independently produced the formal rite of exorcism, then the response: NO.");
          }, 1700);
        }, 1400);
        showIntertitle("DEPART FROM HER",
          "<em>The chapel had been deconsecrated. The thing inside it, evidently, had not been informed.</em>",
          { once: "wm_latin_typewriter" });
      }
    },

    // 10. THE FACE BENEATH THE ICE — late jetty visit
    {
      id: "wm_face_in_ice",
      when: ({ s }) => s._story === "wyndmere"
        && s.currentRoom === P+"jetty"
        && s.timeMinutes >= (24*60 + 2*60 + 30)
        && !s._wmFlags?.face_in_ice,
      truths: ["haunted"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.face_in_ice = true;
        narrate("<em>The lake has, in the half hour since you last looked at it, formed a thin clear skin of ice — the first of the year, and earlier than the season permits. Through it, a foot beneath the surface, a face is looking up at you.</em>");
        try { audio.sfx("heartbeat"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>The face smiles. The ice, where its mouth is, fogs from the underside.</em>");
          if (typeof bumpAggression === "function") bumpAggression(4, "Vivian smiled at you from beneath the ice");
          if (typeof logEvidence === "function") logEvidence("Apparition", "Face beneath new ice on Lake Wyndmere at 2:30 AM. Smiled. Fogged the ice from below.");
        }, 1600);
        showIntertitle("BELOW",
          "<em>A lake, in October, is not yet a tomb. But it has begun, you notice, to practise.</em>",
          { once: "wm_face_in_ice" });
      }
    },

    // 11. THE COLORING BOOK — first time in the attic
    {
      id: "wm_below_below_below",
      when: ({ s }) => s._story === "wyndmere" && s.currentRoom === P+"attic" && !s._wmFlags?.coloring_seen,
      truths: ["haunted", "partial"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.coloring_seen = true;
        narrate("<em>The coloring book is open. The word — and it is the only word, on every page — has been pressed into the paper hard enough that the pencil-point has gone through in several places.</em>");
        try { audio.sfx("whisper"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>From beneath the floorboards, with the same careful spacing the child gave it: <strong>'Be-low. Be-low. Be-low.'</strong></em>");
          if (typeof bumpAggression === "function") bumpAggression(3, "the attic answered its own writing");
          if (typeof logEvidence === "function") logEvidence("Direct Voice", "Beneath attic floor: a child's voice, chanting 'Below.' Three times.");
        }, 1500);
        showIntertitle("BELOW",
          "<em>The word a child writes most often is the one she has been most often told.</em>",
          { once: "wm_below_below_below" });
      }
    },

    // 12. CHILD-DEATH GUARD — if aggression is maxed and player rests in the master bedroom
    {
      id: "wm_drowning_dream",
      when: ({ s }) => s._story === "wyndmere"
        && s._wmFlags?.rested_master
        && (s.aggression || 0) >= 7
        && !s._wmFlags?.drowning_dream,
      truths: ["haunted"],
      fire: () => {
        state._wmFlags = state._wmFlags || {};
        state._wmFlags.drowning_dream = true;
        narrate("<em>You close your eyes for a moment. The chaise creaks. The lake comes up — not as a thought, but as a place — and you are in it, looking up at a square of black sky between black pines, and there is a hand on your shoulder pressing you down.</em>");
        try { audio.sfx("breath"); } catch (_) {}
        setTimeout(() => {
          narrate("<em>You wake. The chaise is dry. Your forehead is wet — one print, palm-shaped, just above your eyes.</em>");
          if (typeof bumpAggression === "function") bumpAggression(2, "you were drowned, briefly, in your sleep");
          if (typeof logEvidence === "function") logEvidence("Tactile Contact", "Wet palmprint, investigator's forehead, on waking. No water-source within reach.");
        }, 1800);
        showIntertitle("THE PRESS",
          "<em>One does not, as a rule, dream another person's death. Where one does, one is asked to.</em>",
          { once: "wm_drowning_dream" });
      }
    }

  ];

  // Helper: track a couple of player actions the scares above depend on.
  // The engine doesn't ship these flags; we add a tiny hook by patching
  // examine targets and the "rest_master" action on first registration.
  function installHooks() {
    if (typeof window === "undefined") return;
    if (window._wmHooksInstalled) return;
    window._wmHooksInstalled = true;

    // Track room entry counts so multi-visit scares can fire.
    if (typeof window.onRoomEntered === "undefined") {
      // Best-effort: poll state.currentRoom transitions.
      let lastRoom = null;
      setInterval(() => {
        try {
          if (typeof state === "undefined") return;
          if (state._story !== "wyndmere") return;
          const r = state.currentRoom;
          if (r === lastRoom) return;
          lastRoom = r;
          state._wmCounts = state._wmCounts || {};
          // strip wm_ prefix for tidiness
          const key = r && r.startsWith("wm_") ? r.slice(3) : r;
          state._wmCounts[key] = (state._wmCounts[key] || 0) + 1;
        } catch (_) {}
      }, 800);
    }

    // Patch examine() if it exists, to set flags on specific targets.
    const origExamine = window.examine;
    if (typeof origExamine === "function") {
      window.examine = function (target) {
        try {
          state._wmFlags = state._wmFlags || {};
          if (target === P+"padlock") state._wmFlags.examined_padlock = true;
          if (target === P+"hairbrush") state._wmFlags.brushed_brush = true;
          if (target === P+"lantern") state._wmFlags.took_lantern = true;
        } catch (_) {}
        return origExamine.apply(this, arguments);
      };
    }

    // Patch performAction / doHotspot for the custom "rest_master" action.
    // We'll piggyback by listening for a click on the chaise hotspot id.
    document.addEventListener("click", (e) => {
      try {
        const el = e.target.closest && e.target.closest("[data-hotspot-id]");
        if (!el) return;
        if (el.getAttribute("data-hotspot-id") === "wm-rest") {
          state._wmFlags = state._wmFlags || {};
          state._wmFlags.rested_master = true;
        }
      } catch (_) {}
    }, true);
  }

  installHooks();

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRADICTION DOCS — the drag-drop "Sort the Claims" board pairs each
  // contradiction key with one document. Decoys are pure distractors.
  // ─────────────────────────────────────────────────────────────────────────
  const contraDocs = {
    thrale_vivian_happy:        { id: "wm_viv_diary",       label: "Vivian's diary (9 Oct 1958)",         desc: "'The lake will hold me up, or it will not. I would rather know.'" },
    thrale_theo_grief:          { id: "wm_theo_note",       label: "Theodore's note, library desk",        desc: "Dated 28 October. Beatrice and Aherne died at 3:11 a.m. on the 29th." },
    thrale_eleanor_connecticut: { id: "wm_eleanor_photo",   label: "Eleanor's photograph, 27 Oct 1962",    desc: "'I am going tonight. Forgive me.' A second figure stands just out of frame." },
    thrale_beatrice_peaceful:   { id: "wm_theo_casenotes",  label: "Theodore's case-notes — Beatrice",     desc: "'Restraint indicated. Major rite attempted. Patient will not speak.'" },
    thrale_aherne_boston:       { id: "wm_aherne_letter",   label: "Father Aherne's letter, chapel, 3 a.m.", desc: "'I do not expect to write to you again.' Dated the morning of the deaths." },
    thrale_no_priest:           { id: "wm_rituale",         label: "Annotated Rituale Romanum (1614)",      desc: "In the doctor's own hand: 'But she answers in Latin she has never been taught. — DEAR GOD.'" }
  };
  const contraDecoys = [
    { id: "wm_decoy_grocer",   label: "Grocer's account, May 1962",  desc: "Two pints of milk weekly. Strawberries when in season." },
    { id: "wm_decoy_ferry",    label: "Lake ferry timetable, 1959",  desc: "Last crossing 7:40 p.m. Sundays only in winter." },
    { id: "wm_decoy_society",  label: "Parish bulletin, Easter 1957", desc: "Mrs. Carrow read the second lesson. The weather kept the choir thin." }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // MAP ORDER — how Wyndmere's rooms appear in the player's map overlay.
  // ─────────────────────────────────────────────────────────────────────────
  const roomOrder = [
    P+"jetty", P+"drive", P+"foyer", P+"morning", P+"library", P+"kitchen",
    P+"upper_hall", P+"master", P+"viv_room", P+"attic_door", P+"attic",
    P+"chapel", P+"boathouse", P+"lakeshore"
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // EXAMINATIONS — short Hancock-cool flavor for every "examine" hotspot
  // target. Engine merges these into the global EXAMINATIONS dict in
  // loadStory(); without them, every look falls through to the generic
  // "You look, but find nothing of note." message.
  // ─────────────────────────────────────────────────────────────────────────
  const examinations = {
    [P+"lake_first_look"]: "The lake holds the house upside-down. A second Wyndmere, gable for gable, drifts a fraction behind the real one — as if the reflection is the older twin and slower to obey.",
    [P+"tricycle"]: "A child's tricycle, rust-pitted, one pedal missing. The seat is dry though the grass is wet — someone has lifted it down, more than once, from somewhere it should not be.",
    [P+"portrait_landing"]: "A family portrait, oils, three figures stiff against a painted lake. The little girl's eyes have been worked over with a different brush — fresher pigment, browner than the rest. You think they used to be paler.",
    [P+"hydrangeas"]: "A vase of hydrangeas on the hall table, faintly browning at the edges. A photograph has been slipped behind them, facing the wall. You leave it where it is — for now.",
    [P+"phone"]: "A black bakelite telephone on a doily. The receiver is warm. The line, when you lift it, gives only the small dry click of someone setting their own receiver down.",
    [P+"easel"]: "An easel half-turned to the window. The canvas shows the lakeshore at dusk — competent, melancholy, unfinished. A second, smaller figure stands behind the painter where no chair could be.",
    [P+"locked_drawer"]: "The top drawer of the desk is locked. The keyhole is fresh-cut into older wood. Whatever's inside, someone wanted it kept from a household that already trusted itself less than it pretended.",
    [P+"wingback"]: "A wing-back chair facing the cold grate. The leather is warm in a hollow the size of a small woman. There is no small woman in the room.",
    [P+"second_cup"]: "Two cups on the kitchen table. One is Mrs. Thrale's — lipstick on the rim. The second cup is clean, but the tea inside it is half-drunk.",
    [P+"icebox"]: "The icebox hums to itself. Inside: milk, a wrapped trout, a child's saucer of strawberries with the stems still green. The strawberries are fresh. The grocer last called on Tuesday.",
    [P+"vanity"]: "Catherine's vanity. Three crystal bottles, one stopper missing. A hairbrush set down mid-stroke, fine fair hair caught in the bristles. The mirror has been turned to face the wall.",
    [P+"hairbrush"]: "Fair hair, very fine, longer than the maid's. You wind a strand around your finger and it is dry, and not quite cold.",
    [P+"viv_bed"]: "The bed is made with hospital corners — by someone, recently. The pillow holds the impression of a small head. The sheets smell faintly of lake water.",
    [P+"viv_window"]: "The window faces the lake. On the sill, in the dust that should not be there, a line of small wet footprints leads away from the glass and stops at the rug.",
    [P+"wardrobe"]: "A child's wardrobe. Sunday dress, school pinafore, a little black coat. The black coat is damp at the hem. You hang it back exactly as you found it.",
    [P+"crosses"]: "Three small wooden crosses pinned above the attic door, the kind a country priest leaves for a household that has begun to ask. One has been turned upside-down; the nail holes show it was not always so.",
    [P+"three_names"]: "Three names scratched into the plaster beside the door, in a child's hand: VIVIAN. MARY. ELSPETH. Only one of those names belongs to anyone Mrs. Thrale has mentioned.",
    [P+"doll"]: "A porcelain doll sits upright in the centre of the attic floor, facing the door — facing you. Its dress is dry. Its hair is wet. It has been waiting a very long time to be looked at.",
    [P+"inverted_crucifix"]: "A crucifix nailed to the rafter, upside-down. The nail is old; the inversion is recent. Someone has scratched a small, careful word beneath it in Latin: TACE. Be silent.",
    [P+"attic_bed"]: "A narrow cot, stripped to the ticking. A child slept here — was kept here — long enough to wear a hollow in the mattress and a darker patch where a head returned, night after night, to the same spot.",
    [P+"rest_master"]: "You sit a moment on the chaise at the foot of Catherine's bed. The springs settle under you, and then, a beat later, settle again, on the other side. You stand up.",
    [P+"stole"]: "A priest's stole, purple, folded on the lectern as if its owner meant to come straight back. There is a small brown stain on the silk that no laundress will lift now.",
    [P+"plaque"]: "A brass plaque set into the chapel wall: IN MEMORIAM — V.T., 1924–1931. Mrs. Thrale has said nothing of a death in 1931. The brass is not tarnished. The plaque is older than the polish.",
    [P+"lantern"]: "A storm lantern on a peg, wick recently trimmed. The reservoir is half-full of paraffin and someone has used it within the night — the glass is still warm enough to mist when you breathe on it.",
    [P+"second_boat"]: "Two boats in a boathouse built for one. The second is smaller, clinker-built, paint flaking, the name across the stern scratched out so thoroughly that the wood beneath has been gouged.",
    [P+"water_edge"]: "The lake laps the shingle without urgency. Something has dragged a furrow up out of the water and into the reeds — narrow, the breadth of a child's heel — and the reeds have not yet sprung back."
  };

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────────────
  registerStory({
    id: "wyndmere",
    title: "Wyndmere Hollow",
    subtitle: "Three Months After Ashgrove",
    byline: "after Hitchcock, Lewis Allen, Bava, Hancock & Friedkin",
    startRoom: P+"jetty",
    truths: ["haunted", "partial", "debunked"],
    rooms,
    entities,
    documents,
    wordPools,
    dialogue,
    contradictions,
    contraDocs,
    contraDecoys,
    examinations,
    roomOrder,
    scares
  });
})();
