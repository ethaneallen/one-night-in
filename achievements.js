// achievements.js — persistent achievement tracking.
// Stored in localStorage alongside stats. Unlocks are forever, across all runs.
"use strict";

const ACHIEVEMENTS_KEY = "ashgrove_achievements";

// Catalog: id -> { name, description, hidden? }
const ACHIEVEMENTS = {
  // Verdicts
  first_correct:     { name: "First Witness",        description: "Deliver a correct verdict." },
  all_three_truths:  { name: "Triple Séance",        description: "See all three truths across your investigations (Haunted, Partial, Debunked)." },
  haunted_correct:   { name: "It Is Real",           description: "Correctly deliver a Haunted verdict." },
  partial_correct:   { name: "Needle in the Static", description: "Correctly deliver a Partially Haunted verdict." },
  debunked_correct:  { name: "A Reasonable Woman",   description: "Correctly deliver a Debunked verdict." },

  // Investigation quality
  all_calder:        { name: "Unreliable Witness",   description: "Catch all 5 of Calder's contradictions in a single run." },
  six_tools:         { name: "Full Kit",             description: "Use 6 or more tools in a single run." },
  nine_tools:        { name: "Everything in the Case", description: "Use all 9 tools in a single run." },
  name_eliza:        { name: "Her True Name",        description: "Name ELIZA on a Haunted verdict, supported by evidence." },

  // Photo camera
  photo_figure:      { name: "Figure in the Frame",  description: "Develop a photograph that contains a figure." },
  photo_classify:    { name: "A Steady Hand",        description: "Correctly log 5 photo anomalies as real." },
  photo_debunk:      { name: "Dust, Not Spirits",    description: "Correctly dismiss 5 photo anomalies as mundane." },

  // Minigames
  seance_eliza:      { name: "A Name at the Table",  description: "Spell ELIZA using Margaret's planchette." },
  combo_unlock:      { name: "The Dial Gives",       description: "Solve the combination lock puzzle." },
  tapes_all:         { name: "The Full Archive",     description: "Listen to all 7 of Adeline's tapes in a single run." },
  read_all_docs:     { name: "A Thorough Reader",    description: "Read every document in the house in a single run." },

  // Danger / survival
  survived_haunted:  { name: "Dawn Reached",         description: "Survive a Haunted run to sunrise without dying." },
  no_rest_haunted:   { name: "Iron Nerves",          description: "Complete a Haunted run without ever resting." },
  max_agg_survived:  { name: "Eye of the Storm",     description: "Reach IN THE ROOM aggression tier and survive." },
  died:              { name: "A Cautionary Entry",   description: "Die inside Ashgrove House.", hidden: true },

  // Special
  bagans:            { name: "Don't Be That Guy",    description: "Call out 'COME AT ME, BRO!' at the house.", hidden: true },
  midnight_letter:   { name: "The Executor Writes",  description: "Read the letter that arrives at midnight." },
  eliza_pact_yes:    { name: "Yes",                  description: "Say yes to Eliza at 4:00 AM." },
  eliza_pact_no:     { name: "No",                   description: "Refuse Eliza at 4:00 AM." },
  skip_calder:       { name: "Didn't Catch the Name", description: "Dismiss Calder without hearing his full walkthrough.", hidden: true },
  bell_rung:         { name: "She Was Listening",    description: "Ring Margaret's silver bell at the séance table." },
};

// Load persisted unlocks
let _unlocked = {};
function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) _unlocked = JSON.parse(raw) || {};
  } catch (e) { _unlocked = {}; }
}
function saveAchievements() {
  try { localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(_unlocked)); } catch (e) {}
}

// Core API — call from anywhere in the game
function unlockAchievement(id) {
  if (!ACHIEVEMENTS[id]) { console.warn("Unknown achievement:", id); return; }
  if (_unlocked[id]) return; // already unlocked
  _unlocked[id] = { when: Date.now() };
  saveAchievements();
  showAchievementToast(id);
}
function isAchievementUnlocked(id) { return !!_unlocked[id]; }
function allUnlockedIds() { return Object.keys(_unlocked); }
function resetAchievements() {
  _unlocked = {};
  try { localStorage.removeItem(ACHIEVEMENTS_KEY); } catch (e) {}
}

// Toast animation — reuses milestone slot but with a distinct class
function showAchievementToast(id) {
  const a = ACHIEVEMENTS[id];
  if (!a) return;
  const host = document.getElementById("milestone-toast");
  if (!host) return;
  const prefix = document.getElementById("toast-prefix");
  const body = document.getElementById("toast-body");
  if (prefix) prefix.textContent = "ACHIEVEMENT UNLOCKED";
  if (body) body.innerHTML = `<strong>${a.name}</strong><br><span style="color:#a89878;font-style:italic">${a.description}</span>`;
  host.classList.remove("hidden");
  host.classList.add("achievement-toast");
  try { if (typeof audio !== "undefined" && audio.sfx) audio.sfx("chime"); } catch (e) {}
  setTimeout(() => {
    host.classList.add("hidden");
    host.classList.remove("achievement-toast");
  }, 4200);
}

function renderAchievements() {
  const host = document.getElementById("achievements-list");
  if (!host) return;
  const ids = Object.keys(ACHIEVEMENTS);
  const unlockedCount = ids.filter(id => _unlocked[id]).length;
  const total = ids.length;
  const pct = Math.round((unlockedCount / total) * 100);
  const cards = ids.map(id => {
    const a = ACHIEVEMENTS[id];
    const unlocked = !!_unlocked[id];
    const isHidden = a.hidden && !unlocked;
    return `
      <div class="ach-card ${unlocked ? 'ach-on' : 'ach-off'}">
        <div class="ach-icon">${unlocked ? '★' : (a.hidden ? '?' : '·')}</div>
        <div class="ach-body">
          <div class="ach-name">${isHidden ? 'Hidden' : a.name}</div>
          <div class="ach-desc">${isHidden ? '<em>Keep playing to discover.</em>' : a.description}</div>
        </div>
      </div>`;
  }).join("");
  host.innerHTML = `
    <div class="ach-progress">
      <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${pct}%"></div></div>
      <div class="ach-progress-text">${unlockedCount} of ${total} unlocked</div>
    </div>
    <div class="ach-grid">${cards}</div>
  `;
}

// Boot
loadAchievements();
