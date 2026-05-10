// stats.js — per-browser persistent investigation history
"use strict";

const STATS_KEY = "ashgrove_stats";

const DEFAULT_STATS = {
  runsStarted: 0,
  runsCompleted: 0,
  verdictsCorrect: 0,
  verdictsWrong: 0,
  deaths: 0,
  hauntedSeen: 0,
  partialSeen: 0,
  debunkedSeen: 0,
  elizaNamed: 0,
  fullCalderCatches: 0,    // all 5 contradictions caught
  maxAggressionEver: 0,
  totalEvidence: 0
};

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return Object.assign({}, DEFAULT_STATS);
    return Object.assign({}, DEFAULT_STATS, JSON.parse(raw));
  } catch (e) { return Object.assign({}, DEFAULT_STATS); }
}
function saveStats(s) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {}
}
function resetStats() {
  try { localStorage.removeItem(STATS_KEY); } catch (e) {}
}

// Hooks called from game.js at key moments.
function statsOnRunStart() {
  const s = loadStats();
  s.runsStarted++;
  saveStats(s);
}
function statsOnVerdict(wasCorrect, truth, namedEliza, calderCaught, maxAgg, evidenceCount) {
  const s = loadStats();
  s.runsCompleted++;
  if (wasCorrect) s.verdictsCorrect++; else s.verdictsWrong++;
  if (truth === "haunted") s.hauntedSeen++;
  else if (truth === "partial") s.partialSeen++;
  else if (truth === "debunked") s.debunkedSeen++;
  if (namedEliza) s.elizaNamed++;
  if (calderCaught >= 5) s.fullCalderCatches++;
  if (maxAgg > s.maxAggressionEver) s.maxAggressionEver = maxAgg;
  s.totalEvidence += evidenceCount || 0;
  saveStats(s);
}
function statsOnDeath() {
  const s = loadStats();
  s.deaths++;
  saveStats(s);
}

// Produce the HTML block for the main menu.
function renderStatsBlock() {
  const s = loadStats();
  if (s.runsStarted === 0) {
    return `<div class="mm-stats mm-stats-empty"><em>No investigations recorded yet.</em></div>`;
  }
  const truths = s.hauntedSeen + s.partialSeen + s.debunkedSeen;
  const truthList = [];
  if (s.hauntedSeen) truthList.push(`<span class="stat-tag stat-haunted">HAUNTED × ${s.hauntedSeen}</span>`);
  if (s.partialSeen) truthList.push(`<span class="stat-tag stat-partial">PARTIAL × ${s.partialSeen}</span>`);
  if (s.debunkedSeen) truthList.push(`<span class="stat-tag stat-debunked">DEBUNKED × ${s.debunkedSeen}</span>`);
  const allThree = s.hauntedSeen && s.partialSeen && s.debunkedSeen;
  return `
    <div class="mm-stats">
      <div class="mm-stats-head">YOUR RECORD</div>
      <div class="mm-stats-grid">
        <div><span class="stat-num">${s.runsCompleted}</span><span class="stat-lbl">nights survived</span></div>
        <div><span class="stat-num">${s.deaths}</span><span class="stat-lbl">deaths</span></div>
        <div><span class="stat-num">${s.verdictsCorrect}</span><span class="stat-lbl">correct verdicts</span></div>
        <div><span class="stat-num">${s.elizaNamed}</span><span class="stat-lbl">times you named her</span></div>
      </div>
      ${truths > 0 ? `<div class="mm-stats-truths">${truthList.join(" ")}</div>` : ""}
      ${allThree ? `<div class="mm-stats-flourish">You have seen all three truths.</div>` : ""}
      ${s.fullCalderCatches > 0 ? `<div class="mm-stats-flourish">You have caught Mr. Calder in every inconsistency ${s.fullCalderCatches === 1 ? "once" : s.fullCalderCatches + " times"}.</div>` : ""}
    </div>
  `;
}
