# Adding stories

The engine ships with Ashgrove House as the default investigation. To add a new one:

1. **Copy** `_TEMPLATE.js` to `stories/<slug>.js`.
2. **Fill in** the rooms, entities, documents, dialogue, word pools, contradictions, and scares. See [`../data.js`](../data.js) for the Ashgrove reference.
3. **Wire it** into [`../index.html`](../index.html) by adding `<script src="stories/<slug>.js"></script>` **after** `<script src="stories.js">`.
4. On reload, if 2+ stories are registered, the title screen shows a dropdown where the player picks which investigation to run.

## What a story needs (minimum viable)

- 1 arrival room + at least 4 more interior rooms
- 3 entities minimum (one per truth state)
- 1 main NPC dialogue tree, with at least 2 `calderClaim` contradictions
- 3–5 documents, at least 1 contradicting an NPC claim
- Word pools for every room (~5 words each, mix of clue/threat/noise)
- 2–3 signature scares

## What is shared across stories

- Typography, vignette, grain, chapter card system
- All 7 tool overlays and scoring categories
- The aggression / danger / death system
- Intertitle card system
- Evidence journal, verdict system, epilogue scaffolding

## Tips

- The Price-voice prose style should be consistent across stories if you want the narrator to feel like the same entity. `<em>` is rendered in warm amber.
- `state._story` holds the current story id if any scare or scoring code needs to check.
- Scares should mark their `once` key with the story id prefix to avoid collisions across stories.
