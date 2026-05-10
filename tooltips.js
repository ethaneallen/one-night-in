// tooltips.js — hover tooltips for tools + inline descriptions
"use strict";

const TOOL_TOOLTIPS = {
  kii: {
    name: "K-II EMF Meter",
    tldr: "5 LEDs. High reading near a ghost — but wiring and pipes also spike it.",
    detail: "Measures electromagnetic fields. Ghosts register. So does old wiring. Cross-check with thermal to rule out mundane sources."
  },
  spirit: {
    name: "Spirit Box (P-SB7)",
    tldr: "Scans radio bands. Words pop out. You decide what's real.",
    detail: "Sweeps frequencies and produces white noise. Spirits may speak through the static. Log words you think are meaningful — noise words are traps."
  },
  ovilus: {
    name: "Ovilus",
    tldr: "Speaks words on its own when an entity is near.",
    detail: "Passive tool. Responds to EMF/temperature changes by emitting a word from its dictionary. Creepier than the spirit box because you didn't ask."
  },
  sls: {
    name: "SLS Camera",
    tldr: "Maps humanoid figures. Some ghosts only show here.",
    detail: "Structured light sensor — draws a skeleton on anything human-shaped. Capture screenshots as evidence. Furniture sometimes false-positives; verify with other tools."
  },
  evp: {
    name: "EVP Recorder",
    tldr: "Place, wait, review. The Quiet Twin is ONLY found this way.",
    detail: "Leave running in a room for 5+ in-game minutes. Come back and open the tool to review. Scrub the waveform for whisper markers."
  },
  thermal: {
    name: "Thermal Camera",
    tldr: "Cold spots = ghosts. Hot sources = debunks.",
    detail: "Your primary debunking tool. Many 'hauntings' turn out to be drafts, radiators, or plumbing. Log debunks — they count as evidence too."
  },
  empump: {
    name: "EM Pump",
    tldr: "Bait. Reveals latent entities on other tools. Raises aggression.",
    detail: "Generates a strong magnetic field. While active in a room, entities there may register on tools that wouldn't normally see them. Escalates danger meaningfully — use in rooms you're not in, then observe from elsewhere."
  },
  rempod: {
    name: "REM Pod",
    tldr: "Proximity alarm. Sounds when something enters its field.",
    detail: "A radiating antenna that pulses when anything disturbs its small electromagnetic bubble. Place and leave — it will notify you from wherever you are. Drafts, mice, and old plumbing can also trigger it, so context matters. A correlated K-II or EVP in the same room confirms a real hit."
  },
  knock: {
    name: "Knock (right-click wall)",
    tldr: "Three knocks. Something may answer.",
    detail: "Available as a hotspot in rooms with walls that want to talk (library, cellar). A response is strong evidence."
  },
  camera: {
    name: "Film Camera (35mm)",
    tldr: "Take photos. Develop in Gallery. Anomalies appear after the fact.",
    detail: "Leaf-shutter 35mm camera. Point and shoot any room. Review exposures in the Gallery — anomalies (figures, orbs, smudges, mist) sometimes appear that weren't visible live. Classify each as real or mundane. Cross-reference with your other evidence in that room to judge."
  }
};

function initTooltips() {
  const tip = document.getElementById("tooltip");
  if (!tip) return;

  function show(el, key) {
    const t = TOOL_TOOLTIPS[key];
    if (!t) return;
    tip.innerHTML = `<strong>${t.name}</strong>${t.tldr}`;
    tip.classList.remove("hidden");
    const r = el.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - 260, r.left) + "px";
    tip.style.top = (r.top - tip.offsetHeight - 8) + "px";
  }
  function hide() { tip.classList.add("hidden"); }

  // Delegate on inventory area — items are re-rendered, can't bind once
  document.getElementById("inventory-items").addEventListener("mouseover", e => {
    const item = e.target.closest("[data-tool]");
    if (item) show(item, item.dataset.tool);
  });
  document.getElementById("inventory-items").addEventListener("mouseout", e => {
    if (e.target.closest("[data-tool]")) hide();
  });
  window.addEventListener("scroll", hide);
}

// Help overlay content
const HELP_CONTENT = {
  howto: `
    <h3>Your goal, in one sentence</h3>
    <p style="font-size:15px;color:#e8d0a8;font-style:italic">Spend one night in Ashgrove House. At sunrise, tell the executor what you believe: <span style="color:#d4a878">haunted, partially haunted, or not haunted at all.</span></p>
    <h3>The four things to do</h3>
    <p><strong>1. Listen to Calder.</strong> The groundskeeper tells you the family history when you arrive. Some of it is wrong. Find documents (library, study, kitchen) that contradict him.</p>
    <p><strong>2. Use the instruments.</strong> After Calder leaves, nine tools appear at the bottom. Hover to read what each does. Click to use. Walk between rooms. Evidence logs automatically to the journal (<kbd>J</kbd>).</p>
    <p><strong>3. Sit still. Speak aloud.</strong> Every room has <em>Rest</em>, <em>Sit in Silence</em>, and <em>Call Out</em> actions. Use them. The house sometimes only answers when you stop looking.</p>
    <p><strong>4. Deliver your verdict.</strong> At sunrise, click the desk in the entry hall. Pick one of three answers. You will not be told if you were right until after you commit.</p>
    <h3>Two things to watch out for</h3>
    <p><strong>The house can kill you.</strong> Provoking it raises a hidden aggression meter (shown at the top of the screen). At maximum, your next action can end the investigation permanently.</p>
    <p><strong>A letter arrives at midnight.</strong> Read it when it comes. It tells you everything you need to understand the rest of the night.</p>
    <h3>If you remember nothing else</h3>
    <p style="color:#d4a878;font-style:italic">Use every tool in every room, read every document, and at sunrise tell the truth as best you can see it.</p>
  `,
  basics: `
    <h3>The job</h3>
    <p>You are a paranormal investigator hired to spend one night in Ashgrove House. An executor is paying $25,000 for a verdict by sunrise: Haunted, Partially Haunted, or Debunked.</p>
    <h3>The house</h3>
    <p>Twelve rooms across three floors. Use the <strong>M</strong> button (top-right) to open the map. Click any room to travel there. Time advances with every action.</p>
    <h3>The groundskeeper</h3>
    <p>Mr. Calder walks you through on arrival. He's not lying on purpose — he's been told family stories that aren't quite true. Find documents in the library and study to catch him. Each contradiction caught earns money at the verdict.</p>
    <h3>Investigation phase</h3>
    <p>After Calder leaves, the tools unlock at the bottom of the screen. Hover any tool to see what it does. Click to use. Evidence is captured to the <strong>Journal (J)</strong>.</p>
    <h3>Verdict</h3>
    <p>At 5:30 AM the front door unlocks. Click the desk in the entry hall to submit. Truth is randomly assigned per game. You are not told which.</p>
  `,
  tools: () => {
    let html = "<p>You have nine tools. Every tool contributes evidence. Use as many as you can.</p>";
    for (const k of ["kii","spirit","ovilus","sls","evp","thermal","empump","knock","camera"]) {
      const t = TOOL_TOOLTIPS[k];
      html += `<div class="tool-card"><strong>${t.name}</strong><br>${t.detail}</div>`;
    }
    return html;
  },
  danger: `
    <h3>The house pushes back</h3>
    <p>Your actions raise a hidden aggression meter. The house does not like being watched. When aggression is high enough, it responds.</p>
    <h3>Danger tiers (top of screen)</h3>
    <ul>
      <li><strong>QUIET</strong> — nothing wrong yet.</li>
      <li><strong>WATCHING</strong> — small flavor scares possible. No damage.</li>
      <li><strong>CLOSE</strong> — a threat may force you to choose. Wrong choice can hurt.</li>
      <li><strong>IN THE ROOM</strong> — the next provocation may be fatal.</li>
    </ul>
    <h3>What raises aggression</h3>
    <ul>
      <li>EM Pump (large jump)</li>
      <li>Knocking on walls</li>
      <li>Entering the nursery or cellar</li>
      <li>Spending too long in the same room</li>
      <li>Getting threat words on the spirit box</li>
    </ul>
    <h3>What lowers it</h3>
    <ul>
      <li>Resting — every room has a <strong>Rest</strong> option. Advances time, drops aggression.</li>
      <li>Changing rooms (small effect).</li>
    </ul>
    <h3>Can you die?</h3>
    <p>Yes. Some houses really are dangerous. If the night goes badly you will not live to submit a verdict.</p>
  `,
  verdict: `
    <h3>Scoring</h3>
    <p>Every tool has its own evidence category. Each category pays out based on how many entries you logged and which truth the house happens to be. Correct verdict pays the $25,000 fee. Wrong verdict loses the fee — but 30% of your investigation pay survives because you still did the work.</p>
    <h3>Bonuses</h3>
    <ul>
      <li>Tool coverage: +$1,500 for using 4+ tools, +$3,000 for 6+.</li>
      <li>Calder contradictions: +$500 per one caught (max 4).</li>
      <li>Named Eliza (from Adeline's tape in the study): +$5,000 on Haunted runs.</li>
    </ul>
    <h3>Replay</h3>
    <p>Each run randomizes the truth. The story details stay, but what's real changes.</p>
  `
};

const HELP_CONTENT_SHORT = {
  howto: `
    <h3>Goal</h3>
    <p>Spend one night in Ashgrove House. At sunrise, pick: <strong>Haunted</strong>, <strong>Partial</strong>, or <strong>Debunked</strong>.</p>
    <h3>What to do</h3>
    <ol>
      <li><strong>Listen to Calder.</strong> He lies. Find documents (library / study / kitchen) that contradict him. Each catch pays.</li>
      <li><strong>Use the nine tools.</strong> Click any in the bottom bar. Evidence auto-logs.</li>
      <li><strong>Rest / Sit in Silence / Call Out</strong> in every room. Not all evidence comes from tools.</li>
      <li><strong>At sunrise,</strong> click the desk in the entry hall. Deliver your verdict.</li>
    </ol>
    <h3>Warnings</h3>
    <ul>
      <li>Provocation raises aggression. Max tier on Haunted = death.</li>
      <li>At 12:00 AM a letter slides under the door. Read it.</li>
    </ul>
  `,
  basics: `
    <h3>The job</h3>
    <p>$25,000 for a correct verdict at sunrise. Truth is randomized.</p>
    <h3>The house</h3>
    <p>12 rooms, 3 floors. Press <kbd>M</kbd> for the map.</p>
    <h3>Calder</h3>
    <p>The groundskeeper tells the family history. Some is wrong. Catch him = bonus.</p>
    <h3>Tools</h3>
    <p>Unlock after Calder leaves. Click to use. Evidence → journal (<kbd>J</kbd>).</p>
    <h3>Verdict</h3>
    <p>At 5:30 AM, click the desk.</p>
  `,
  tools: () => {
    let html = "<p>Nine tools. Use them all.</p>";
    for (const k of ["kii","spirit","ovilus","sls","evp","thermal","empump","knock","camera"]) {
      const t = TOOL_TOOLTIPS[k];
      html += `<div class="tool-card"><strong>${t.name}</strong><br>${t.tldr}</div>`;
    }
    return html;
  },
  danger: `
    <h3>Aggression tiers</h3>
    <ul>
      <li><strong>QUIET</strong> — fine.</li>
      <li><strong>WATCHING</strong> — small scares.</li>
      <li><strong>CLOSE</strong> — dodge-or-die prompt possible.</li>
      <li><strong>IN THE ROOM</strong> — next provocation may kill.</li>
    </ul>
    <h3>Up</h3>
    <p>EM Pump, knocking, nursery/cellar, standing still too long, threats on spirit box.</p>
    <h3>Down</h3>
    <p>Rest (every room has it). Changing rooms helps a little.</p>
  `,
  verdict: `
    <h3>Payouts</h3>
    <p>Correct verdict = base $25,000. Wrong verdict = 30% of investigation pay.</p>
    <h3>Bonuses</h3>
    <ul>
      <li>4+ tools used: +$1,500. 6+ tools: +$3,000.</li>
      <li>Calder contradictions: +$500 each (max 5).</li>
      <li>Name Eliza (from tape): +$5,000 on Haunted.</li>
    </ul>
  `
};

function initHelp() {
  const body = document.getElementById("help-body");
  function showTab(tab) {
    document.querySelectorAll(".help-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    const concise = typeof settings !== "undefined" && settings.conciseMode;
    const source = concise ? HELP_CONTENT_SHORT : HELP_CONTENT;
    const content = source[tab];
    body.innerHTML = typeof content === "function" ? content() : content;
  }
  document.querySelectorAll(".help-tab").forEach(b => {
    b.addEventListener("click", () => showTab(b.dataset.tab));
  });
  document.getElementById("btn-help").addEventListener("click", () => {
    showTab("howto");
    openOverlay("overlay-help");
  });
}
