# One Night In…

> *A Silver Age horror investigation game, made in the spirit of Mr. V. Price and Mr. W. Castle.*

**Version 0.5.0 · Public Preview**

An anthology of haunted-house investigations. Each chapter is a self-contained night in a different cursed property — same engine, same instruments, a new story every time.

**Chapter I: Ashgrove House.**

You are a paranormal investigator, engaged by an unnamed executor to spend one night alone in Ashgrove House. By sunrise you must deliver a verdict: **Haunted**, **Partially Haunted**, or **Debunked**. The house is assigned one of these three truths at random at the start of every run. You are not told which.

---

## Features

### The investigation
- **One house, three truths.** Every run hides one of three answers. A correct verdict — and the evidence to back it — is the difference between $25,000 and nothing.
- **Nine authentic investigation tools.** K-II EMF meter, auto-sweeping spirit box, Ovilus, SLS camera, EVP recorder, thermal imager, EM pump, REM pod, and 35mm film camera. Each has its own vintage-housing UI and its own mini-mechanic. Each entity is detectable only by certain tools — the "13 Ghosts" rule.
- **Film camera with developable photos.** Take photographs of any room; four anomaly types (figures, orbs, smudges, mist) may develop in the gallery. Classify each as real or mundane by cross-referencing with the other evidence you've logged in that room.
- **An unreliable groundskeeper.** Mr. Calder, who has worked for the trust since he was a boy, will tell you the family history. Five of the things he says are wrong. Find the documents that prove it — each catch pays a bonus.
- **Scripted signature scares.** The silver thimble on the stairs. The breathing east wall. The rocking chair through the doorway. The figure at the end of the hallway at 3 AM. Each fires once per run, on authored conditions.
- **Cross-referencing puzzles.** The name *Eliza* appears in four places across the house. Naming her on the verdict screen earns full lore — but only if you did the reading.
- **Branched epilogues.** Two to four paragraphs of closing prose composed from what truth you drew, who you named, what Calder said, which contradictions you caught.

### Mini-games & side activities
- **Margaret's Ouija board.** Sit at the séance table; the planchette glides across a proper arc-layout board and auto-locks on letters the spirit wants to spell. Spell ELIZA for a naming bonus.
- **Silver séance bell.** Ring it, and on Haunted runs, listen for the answer.
- **Combination lock puzzle.** A hidden drawer beneath the séance table opens with the year 1851. Inside: nine unsent letters to Miss Halliwell.
- **Expanded tape archive.** Seven reels of Adeline's voice in the study, not one. Listen to all seven for the archivist bonus.
- **Time-of-night events.** 1 AM, 2 AM, 3 AM each have their own ambient beat — a distant bell, a tape playing itself, a window flying open upstairs.
- **"Speak to the house"** — Entry Hall and Wine Cellar hotspot. Ask the house anything in plain English (requires AI — see below).

### Atmosphere & polish
- **A voice that reads to you.** Narration is written in the voice of 1960s-70s horror cinema — Robert Wise, William Castle, Vincent Price. Optional text-to-speech reads every room, document, and dialogue aloud. Choose a male or female voice.
- **Your actions pull the house toward you.** A hidden aggression system tracks how much the house notices you. Every provocation (knocking, EM pump, staying too long) tightens the rope. A scripted "rest" action loosens it. If you provoke too much, on a Haunted run, you will not live to submit a verdict.
- **Random ambient sounds.** 14 synthesized effects (floor creaks, pipe groans, distant doors, piano fragments, child laughter) fire on their own all night long. Frequency scales with aggression.
- **Weather system.** Clear or foggy nights rolled per investigation, affecting audio bed and atmosphere.
- **Per-room music beds.** 13 distinct ambient layers keyed to each room's mood.
- **Film-grain overlay + heartbeat vignette** at high aggression tiers.
- **William Castle warning placard on the title screen.** *"The Society assumes no liability for events that occur after the front door is locked."*

### Accessibility & player options
- **Concise mode (TL;DR).** Every room description, Calder dialogue, document, and help panel has a 1–2 sentence summary version. One toggle in Settings swaps the Gothic prose for short form.
- **Read-aloud (Web Speech API)** for all prose, with voice, rate, pitch, volume controls.
- **Text size** small / medium / large.
- **High-contrast mode** and **reduce-motion** setting.
- **Laptop-optimized layout** — scales down HUD, overlays, and Ouija board on short viewports so nothing requires page scrolling at 768px.

### Replay & progression
- **26 achievements** — tracked across all runs, persistent in localStorage. Hidden achievements for death, easter eggs, and the Eliza pact. Dedicated "Achievements" screen off the main menu.
- **Lifetime stats panel** on the main menu — runs, verdicts, deaths, truths witnessed.
- **The Guest Log** — historical investigator entries from 1974 onward, some incomplete, off the main menu.

### Optional AI integration
- **"Speak with the house"** — connect a free Google Gemini API key (or Groq, OpenAI, Anthropic) and the Ovilus replies with words generated live by an AI playing the voice of the dead. A new hotspot lets you ask the house anything in plain English and get a reply in the Gothic voice of its inhabitants.
- Key stored only in the player's browser, sent only to the chosen provider. No server middleman.
- Optional and gated — the game works identically without it.

### Easter eggs
- **"COME AT ME, BRO!"** — a Call Out option. The house replies, in your grandmother's voice: *"Don't be that guy."*
- **Five rapid clicks on the Settings title** unlocks the debug panel (password: `iddqd`).

## Running it

Open `html-game/index.html` in a modern browser (Chrome, Edge, Firefox, Safari). That's the whole install. No build step, no dependencies.

For best effect:
- Play with sound on
- Play in a dark room
- Enable **Read aloud** in Settings (⚙) and pick a voice — Microsoft David on Windows or Alex on macOS is closest to the Price timbre

## Controls

The game is fully point-and-click with the mouse. Keyboard shortcuts are not required. HUD buttons, clockwise from the time: 🔊 read-aloud toggle · **?** help · **J** evidence journal · **M** map · **⚙** settings.

## Development

### Project structure

```
html-game/
  index.html        — single-page shell, script loads, all overlays
  style.css         — full visual system (typography, frames, housings, grain)
  data.js           — rooms, entities, documents, word pools, Calder dialogue
  game.js           — state machine, tools, navigation, verdict
  danger.js         — aggression, scares, death, ambient-sfx scheduler
  scares.js         — authored signature scare scheduler
  art.js            — 13 inline SVG room paintings
  audio.js          — WebAudio synthesized ambient + sfx (zero asset files)
  weather.js        — per-run weather roll (clear / fog) + audio
  stats.js          — lifetime run/verdict/death tracking
  achievements.js   — 26 achievements + unlock toast + progress panel
  minigames.js      — Ouija, combo lock, tape archive, time-of-night, speak-to-house
  ai.js             — optional AI provider abstraction (Gemini / Groq / OpenAI / Anthropic)
  settings.js       — settings panel + save/load + debug mode
  tts.js            — Web Speech API narration
  tooltips.js       — hover tooltips + help overlay content
  menu.js           — main menu, pause menu, version display
  stories.js        — extension point for future chapters
  stories/
    README.md       — how to add a new location
    _TEMPLATE.js    — starting template for new stories
  WALKTHROUGH.md    — full spoiler cheatsheet
  ashgrove-house-guide.md — player-friendly how-to
```

### Adding a new story

Ashgrove House is Chapter I. The engine supports more chapters. See [`html-game/stories/README.md`](html-game/stories/README.md) for the author's guide. A new location is a single `.js` file plus one `<script>` tag.

Each chapter should declare its own canonical cinematic inspirations (see below) and not repeat Ashgrove's.

### Running locally with live-reload

The game runs from `file://` with no server. If you want auto-reload while editing, run a trivial static server from `html-game/`:

```bash
python -m http.server 8000
# or: npx serve .
```

Then open http://localhost:8000.

### Debug mode

In Settings, click the word **Settings** five times quickly. Enter password `iddqd` (Doom reference). A debug panel appears with: force truth, skip time, reveal entities, auto-catch Calder, force scares, and kill the player.

## Accessibility

- Read-aloud (Web Speech API) for all prose, with voice, rate, pitch, and volume controls
- Text size: small / medium / large
- Normal / high-contrast mode
- Reduce motion setting disables flicker, fades, jump-scare zoom, and grain animation

## Design DNA — what's already used

Chapter I (Ashgrove House) is built on four canonical films, plus a handful of tertiary references. **Future chapters should not repeat these four canonical films.** Pick different ones.

**Canonical to Ashgrove:**
- *The Changeling* (1980) — the tape, the rolling object, the long-buried family truth
- *The Haunting* (Robert Wise, 1963) — breathing walls, knock-response, the house as character
- *13 Ghosts* (William Castle, 1960) — the tool-visibility mechanic, the count of twelve
- *The Innocents* (1961) — the ambiguity thesis, the governess, the twins

**Tertiary (used sparingly):**
- *House on Haunted Hill* (1959) — framing device, warning placard
- *Legend of Hell House* (1973) — the EM pump as dispeller
- *Amityville* (1979) — "built on something"
- *Crimson Peak* (2015) — color palette
- *Carnival of Souls* (1962) — ambient tone
- *The Phantom Carriage* (1922) — distant watchers

## Story document

The full canonical backstory — every entity, every signature scare, every haunting state — is in [`STORY.md`](STORY.md). If you're a collaborator writing new content, start there.

## Acknowledgments

Built with coffee, respect, and every William Castle film the author could find.

## License

All original prose, code, and art in this repository are © the author. The cinematic references are cultural heritage of the horror genre and are used as acknowledged inspiration, not reproduction. If you fork, keep the Silver Age manners.

---

## Changelog

### 0.5.0 — Public Preview *(current)*

**Rebrand & structure**
- Retitled as **"One Night In…"**, an anthology; Ashgrove House is now Chapter I.
- Title screen uses a three-tier hierarchy: umbrella game name → separator rule → story name → chapter label.
- "Further Chapters — Coming Soon" placeholder block on the main menu.

**New mini-games**
- Ouija board (Margaret's séance table) with proper arc layout and auto-locking planchette.
- Silver séance bell — ring it, listen for the answer on Haunted runs.
- Combination lock puzzle (hidden drawer, 1851).
- Expanded tape archive (7 reels of Adeline, not 1) with archivist bonus.
- Time-of-night events at 1/2/3 AM.
- "Speak to the house" hotspots in Entry Hall and Wine Cellar.

**Film camera**
- New 9th tool. Take photographs; four anomaly types may develop.
- Cross-reference panel on the photo review screen shows every other piece of evidence from that room to help judge real vs. mundane.

**AI integration (optional)**
- Connect a free Google Gemini / Groq key (or paid OpenAI / Anthropic) for:
  - AI-backed Ovilus that speaks in the voice of the dead
  - "Speak to the house" feature (3 uses per run)
- Everything works without AI; no feature is gated.

**Achievements & stats**
- 26 achievements with persistent unlocks.
- Lifetime run/verdict/death stats panel on the main menu.
- The Guest Log — historical investigator entries.

**Atmosphere**
- Random ambient sounds (14 new synthesized sfx firing on a scheduler).
- Weather system (clear / fog) with audio beds.
- 13 per-room music beds.
- Continuous spirit-box sweep (it scans on its own, like a real P-SB7).
- Rain streaks scoped to outdoor rooms only; audio muffles indoors.

**Accessibility**
- Concise (TL;DR) mode for all prose: rooms, Calder, documents, help.
- Laptop-height media queries shrink chrome, overlays, and Ouija board on <=800px tall viewports.
- `index.html` cache-control meta tags prevent stale-cache boot failures.

**Easter eggs**
- "COME AT ME, BRO!" call-out with house's grandmotherly reply.

**Bug fixes & polish**
- Deleted the old intro cinematic (did not land with testers).
- Removed the duplicate Journal tile from the tools bar.
- Removed the corner-bracket overlay decorations that read as glitches.
- Fixed double scrollbars in the Achievements overlay.
- Fixed the Ouija board oscillating between 3-4 letters; now sweeps the full board with clear auto-lock behavior.
- Photo camera inventory badge highlights when photos need review.
- Gemini API: model fallback chain, disabled thinking mode, loosened safety filters, verbose error logging in DevTools console.

### 0.4.0 — Initial vertical slice

Core engine: 13 rooms, 12 entities, 8 tools, Calder walkthrough, truth system, verdict screen, signature scares, midnight letter, aggression meter, death states, save/load, read-aloud, intro warning placard.
