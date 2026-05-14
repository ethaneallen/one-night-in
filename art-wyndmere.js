// art-wyndmere.js — inline SVG room paintings for Chapter II: Wyndmere Hollow.
// Loaded after art.js. Entries are added to the same ROOM_SVG dictionary so
// roomSvg(roomId) finds them transparently.
// Palette: cool blue-grey / drowned green / wet slate, with a thin amber accent
// where lantern or candle is present. One iconic scene per room.
"use strict";

// ─── jetty ───────────────────────────────────────────────────────────────
// Wooden dock extending into a black still lake. Moored launch on the right.
// Distant pines. Moon broken across the water.
ROOM_SVG.wm_jetty = `
<defs>
<linearGradient id="wj-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0e1a"/><stop offset="60%" stop-color="#0c121c"/><stop offset="100%" stop-color="#080a12"/>
</linearGradient>
<linearGradient id="wj-water" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#080a10"/><stop offset="50%" stop-color="#04060a"/><stop offset="100%" stop-color="#02030a"/>
</linearGradient>
<linearGradient id="wj-wood" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1c14"/><stop offset="100%" stop-color="#100804"/>
</linearGradient>
<radialGradient id="wj-moon" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#e8e0c8" stop-opacity="0.95"/><stop offset="100%" stop-color="#e8e0c8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wj" cx="50%" cy="55%" r="65%">
<stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.78"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wj-sky)"/>
<g fill="#04060a">
<path d="M 0 92 L 28 70 L 50 86 L 78 60 L 110 82 L 140 70 L 175 84 L 210 66 L 245 80 L 280 70 L 320 86 L 320 110 L 0 110 Z"/>
</g>
<circle cx="62" cy="34" r="14" fill="url(#wj-moon)"/>
<circle cx="62" cy="34" r="8" fill="#f0e8c8" opacity="0.85"/>
<rect y="100" width="320" height="80" fill="url(#wj-water)"/>
<g stroke="#1a1c28" stroke-width="0.4" fill="none" opacity="0.55">
<path d="M 0 118 Q 80 116 160 118 T 320 118"/>
<path d="M 0 126 Q 80 124 160 126 T 320 126"/>
<path d="M 0 134 Q 80 132 160 134 T 320 134"/>
<path d="M 0 144 Q 80 142 160 144 T 320 144"/>
<path d="M 0 156 Q 80 154 160 156 T 320 156"/>
</g>
<g stroke="#c8b890" stroke-width="0.6" opacity="0.5">
<path d="M 50 108 L 56 116 M 62 114 L 68 122 M 74 120 L 80 130 M 86 126 L 92 138"/>
</g>
<rect x="120" y="104" width="180" height="10" fill="url(#wj-wood)"/>
<g stroke="#0a0402" stroke-width="0.5" opacity="0.85">
<line x1="140" y1="104" x2="140" y2="114"/><line x1="160" y1="104" x2="160" y2="114"/>
<line x1="180" y1="104" x2="180" y2="114"/><line x1="200" y1="104" x2="200" y2="114"/>
<line x1="220" y1="104" x2="220" y2="114"/><line x1="240" y1="104" x2="240" y2="114"/>
<line x1="260" y1="104" x2="260" y2="114"/><line x1="280" y1="104" x2="280" y2="114"/>
</g>
<rect x="128" y="114" width="6" height="20" fill="#0a0604"/>
<rect x="194" y="114" width="6" height="22" fill="#0a0604"/>
<rect x="260" y="114" width="6" height="24" fill="#0a0604"/>
<path d="M 260 100 Q 268 96 280 100 L 304 100 Q 314 102 314 112 L 314 122 L 252 122 L 252 112 Q 252 102 260 100 Z" fill="#160e08" stroke="#2a1a10" stroke-width="0.8"/>
<rect x="258" y="104" width="52" height="14" fill="#0a0604"/>
<path d="M 268 104 L 268 118 M 282 104 L 282 118 M 296 104 L 296 118" stroke="#2a1810" stroke-width="0.5"/>
<line x1="252" y1="111" x2="244" y2="118" stroke="#3a2a18" stroke-width="0.8"/>
<line x1="244" y1="118" x2="260" y2="120" stroke="#3a2a18" stroke-width="0.8"/>
<g opacity="0.6" stroke="#080a10" stroke-width="0.4" fill="none">
<path d="M 30 96 L 26 80 L 28 96 M 28 80 L 24 76 M 28 80 L 32 76"/>
<path d="M 50 96 L 47 78 L 50 96 M 47 78 L 43 74 M 47 78 L 52 74"/>
<path d="M 110 92 L 107 70 M 107 70 L 102 64 M 107 70 L 113 64"/>
<path d="M 245 88 L 243 68 M 243 68 L 238 62 M 243 68 L 248 62"/>
<path d="M 290 92 L 287 72 M 287 72 L 282 66 M 287 72 L 293 66"/>
</g>
<g stroke="#3a3020" stroke-width="0.6" opacity="0.4">
<path d="M 100 130 L 240 134"/>
<path d="M 80 154 L 260 158"/>
</g>
<rect width="320" height="180" fill="url(#vign-wj)"/>
`;

// ─── drive ───────────────────────────────────────────────────────────────
// A close pine-tunnel. Half-buried rusted tricycle, far-off house glow.
ROOM_SVG.wm_drive = `
<defs>
<linearGradient id="wd-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0e0808"/><stop offset="100%" stop-color="#06040a"/>
</linearGradient>
<linearGradient id="wd-ground" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#100a06"/><stop offset="100%" stop-color="#040201"/>
</linearGradient>
<radialGradient id="wd-glow" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#c08038" stop-opacity="0.45"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wd" cx="50%" cy="55%" r="60%">
<stop offset="45%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.85"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wd-sky)"/>
<rect y="100" width="320" height="80" fill="url(#wd-ground)"/>
<ellipse cx="160" cy="86" rx="36" ry="20" fill="url(#wd-glow)"/>
<g fill="#080604">
<path d="M 0 0 L 0 130 L 30 130 L 35 70 L 38 30 L 30 12 L 22 36 L 18 0 Z"/>
<path d="M 320 0 L 320 130 L 290 130 L 285 70 L 282 30 L 290 12 L 298 36 L 302 0 Z"/>
<path d="M 30 0 L 30 110 L 60 110 L 65 50 L 60 22 L 52 38 L 46 0 Z"/>
<path d="M 290 0 L 290 110 L 260 110 L 255 50 L 260 22 L 268 38 L 274 0 Z"/>
<path d="M 60 0 L 60 96 L 82 96 L 88 50 L 84 20 L 74 30 L 70 0 Z"/>
<path d="M 260 0 L 260 96 L 238 96 L 232 50 L 236 20 L 246 30 L 250 0 Z"/>
</g>
<g fill="#0c0806" opacity="0.85">
<path d="M 82 0 L 82 86 L 104 86 L 108 40 L 105 18 L 96 26 L 92 0 Z"/>
<path d="M 238 0 L 238 86 L 216 86 L 212 40 L 215 18 L 224 26 L 228 0 Z"/>
</g>
<path d="M 134 102 L 186 102 L 196 120 L 124 120 Z" fill="#180c08" opacity="0.7"/>
<path d="M 132 130 L 188 130 Q 200 132 200 140 L 200 150 L 120 150 L 120 140 Q 120 132 132 130 Z" fill="#1a0c08"/>
<path d="M 122 132 L 198 132" stroke="#2a1408" stroke-width="0.6"/>
<rect x="132" y="138" width="56" height="6" fill="#0a0604"/>
<text x="160" y="143" font-family="Cormorant Garamond,serif" font-style="italic" font-size="5" fill="#8a6838" text-anchor="middle">WYNDMERE</text>
<g transform="translate(80,142)" stroke="#4a2818" stroke-width="0.8" fill="#3a1a10">
<circle cx="0" cy="6" r="6" fill="#1a0c08" stroke="#3a2010"/>
<circle cx="14" cy="3" r="3" fill="#1a0c08" stroke="#3a2010"/>
<line x1="0" y1="6" x2="14" y2="3"/>
<line x1="0" y1="0" x2="6" y2="-4"/>
<rect x="4" y="-5" width="6" height="2" fill="#3a1a10"/>
</g>
<g stroke="#1a1208" stroke-width="0.4" opacity="0.5">
<path d="M 20 130 L 100 138 M 220 138 L 300 130"/>
<path d="M 30 150 L 110 156 M 210 156 L 290 150"/>
</g>
<rect width="320" height="180" fill="url(#vign-wd)"/>
`;

// ─── foyer ───────────────────────────────────────────────────────────────
// Black-and-white checker tile, staircase rising, hurried portrait above the
// landing, vase of fresh hydrangeas, dead phone.
ROOM_SVG.wm_foyer = `
<defs>
<linearGradient id="wf-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1c1418"/><stop offset="55%" stop-color="#100a0c"/><stop offset="100%" stop-color="#06040a"/>
</linearGradient>
<linearGradient id="wf-wains" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1c14"/><stop offset="100%" stop-color="#100802"/>
</linearGradient>
<pattern id="wf-tile" x="0" y="0" width="44" height="22" patternUnits="userSpaceOnUse" patternTransform="skewX(-28)">
<rect width="22" height="22" fill="#1c1818"/><rect x="22" width="22" height="22" fill="#080404"/>
<line x1="0" y1="22" x2="44" y2="22" stroke="#040202" stroke-width="0.6"/>
</pattern>
<linearGradient id="wf-stair" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a2218"/><stop offset="100%" stop-color="#100804"/>
</linearGradient>
<linearGradient id="wf-runner" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#7a2c1a"/><stop offset="100%" stop-color="#2a0a08"/>
</linearGradient>
<radialGradient id="wf-chand" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#ffd8a0" stop-opacity="0.95"/>
<stop offset="60%" stop-color="#c89060" stop-opacity="0.4"/>
<stop offset="100%" stop-color="#3a1a08" stop-opacity="0"/>
</radialGradient>
<radialGradient id="wf-pool" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#d8a060" stop-opacity="0.35"/>
<stop offset="70%" stop-color="#6a2810" stop-opacity="0.12"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<linearGradient id="wf-doorway" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a1a0a" stop-opacity="0.85"/><stop offset="100%" stop-color="#080404"/>
</linearGradient>
<linearGradient id="wf-portrait-frame" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#6a4828"/><stop offset="50%" stop-color="#3a2a18"/><stop offset="100%" stop-color="#1a1208"/>
</linearGradient>
<radialGradient id="wf-portrait-glow" cx="50%" cy="38%" r="55%">
<stop offset="0%" stop-color="#c8a878" stop-opacity="0.55"/><stop offset="100%" stop-color="#08060a" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wf" cx="50%" cy="55%" r="68%">
<stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.78"/>
</radialGradient>
</defs>

<!-- back wall -->
<rect width="320" height="180" fill="url(#wf-wall)"/>

<!-- distant doorway into the morning room (warm lake-light beyond) -->
<rect x="208" y="50" width="46" height="86" fill="url(#wf-doorway)"/>
<rect x="208" y="50" width="46" height="86" fill="none" stroke="#2a1810" stroke-width="1.2"/>
<rect x="210" y="52" width="42" height="82" fill="#1a0e08"/>
<ellipse cx="231" cy="105" rx="18" ry="32" fill="url(#wf-pool)" opacity="0.55"/>
<!-- a sliver of curtain through the doorway -->
<rect x="240" y="52" width="6" height="82" fill="#5a2818" opacity="0.55"/>

<!-- wood wainscoting along the back wall -->
<rect y="100" width="320" height="34" fill="url(#wf-wains)"/>
<g stroke="#0a0402" stroke-width="0.5" fill="none" opacity="0.7">
  <line x1="0" y1="100" x2="320" y2="100"/>
  <line x1="0" y1="132" x2="320" y2="132"/>
  <line x1="40"  y1="102" x2="40"  y2="130"/>
  <line x1="84"  y1="102" x2="84"  y2="130"/>
  <line x1="160" y1="102" x2="160" y2="130"/>
  <line x1="278" y1="102" x2="278" y2="130"/>
</g>

<!-- checker tile floor with subtle perspective skew -->
<rect y="134" width="320" height="46" fill="url(#wf-tile)"/>
<path d="M 0 134 L 320 134" stroke="#000" stroke-width="0.8"/>
<!-- floor reflection of chandelier -->
<ellipse cx="160" cy="156" rx="64" ry="6" fill="#c89060" opacity="0.10"/>

<!-- chandelier above -->
<line x1="160" y1="0" x2="160" y2="20" stroke="#3a2a18" stroke-width="0.8"/>
<ellipse cx="160" cy="26" rx="42" ry="18" fill="url(#wf-chand)"/>
<g stroke="#5a3818" stroke-width="0.5" fill="#1a1008">
  <circle cx="160" cy="26" r="3"/>
  <line x1="138" y1="24" x2="160" y2="26"/><line x1="182" y1="24" x2="160" y2="26"/>
  <line x1="146" y1="36" x2="160" y2="26"/><line x1="174" y1="36" x2="160" y2="26"/>
  <circle cx="138" cy="24" r="1.8" fill="#ffd890"/>
  <circle cx="182" cy="24" r="1.8" fill="#ffd890"/>
  <circle cx="146" cy="36" r="1.8" fill="#ffd890"/>
  <circle cx="174" cy="36" r="1.8" fill="#ffd890"/>
</g>

<!-- the family portrait (girl's eyes overpainted — fits lore) -->
<g transform="translate(96, 40)">
  <rect x="0" y="0" width="76" height="60" fill="url(#wf-portrait-frame)"/>
  <rect x="3" y="3" width="70" height="54" fill="#08060a"/>
  <rect x="3" y="3" width="70" height="54" fill="url(#wf-portrait-glow)"/>
  <!-- three figures, stiff — faces present but wrong -->
  <!-- father: sunken eyes, downturned mouth -->
  <ellipse cx="20" cy="22" rx="5" ry="6" fill="#d8c4a0" opacity="0.55"/>
  <ellipse cx="18.4" cy="21.6" rx="0.9" ry="1.1" fill="#04020a"/>
  <ellipse cx="21.6" cy="21.6" rx="0.9" ry="1.1" fill="#04020a"/>
  <path d="M 18 25.4 Q 20 24.8 22 25.4" stroke="#1a0a08" stroke-width="0.35" fill="none"/>
  <path d="M 14 30 Q 20 26 26 30 L 28 50 L 12 50 Z" fill="#3a2818" opacity="0.7"/>
  <!-- daughter (center): brown-overpainted eyes (lore), thin mouth, head tilted -->
  <ellipse cx="38" cy="24" rx="4" ry="5" fill="#e8d4a8" opacity="0.6"/>
  <circle cx="36.5" cy="23.5" r="0.9" fill="#3a1a08"/>
  <circle cx="39.5" cy="23.5" r="0.9" fill="#3a1a08"/>
  <path d="M 36 27 L 40 27" stroke="#2a0c08" stroke-width="0.35"/>
  <path d="M 33 28 Q 38 26 43 28 L 45 50 L 31 50 Z" fill="#1a0a08" opacity="0.7"/>
  <!-- mother: hollow asymmetric eyes, lips pressed thin -->
  <ellipse cx="56" cy="22" rx="5" ry="6" fill="#d8c4a0" opacity="0.55"/>
  <ellipse cx="54.2" cy="21.4" rx="1" ry="1.2" fill="#04020a"/>
  <ellipse cx="57.6" cy="22" rx="1" ry="1.2" fill="#04020a"/>
  <path d="M 53.5 25.6 Q 56 25.1 58.4 25.6" stroke="#1a0a08" stroke-width="0.35" fill="none"/>
  <path d="M 50 30 Q 56 26 62 30 L 64 50 L 48 50 Z" fill="#3a2818" opacity="0.7"/>
  <!-- painted lake background -->
  <rect x="3" y="42" width="70" height="6" fill="#1a2830" opacity="0.4"/>
</g>

<!-- staircase, foreshortened, with red runner -->
<path d="M 0 134 L 64 134 L 64 180 L 0 180 Z" fill="url(#wf-stair)"/>
<g stroke="#080404" stroke-width="0.8">
  <line x1="0" y1="142" x2="64" y2="142"/><line x1="0" y1="150" x2="64" y2="150"/>
  <line x1="0" y1="158" x2="64" y2="158"/><line x1="0" y1="166" x2="64" y2="166"/>
  <line x1="0" y1="174" x2="64" y2="174"/>
</g>
<rect x="22" y="134" width="22" height="46" fill="url(#wf-runner)"/>
<line x1="22" y1="134" x2="22" y2="180" stroke="#3a0808" stroke-width="0.4"/>
<line x1="44" y1="134" x2="44" y2="180" stroke="#3a0808" stroke-width="0.4"/>
<!-- bannister + newel post -->
<rect x="0" y="50" width="6" height="90" fill="#1a0c08"/>
<rect x="0" y="46" width="10" height="8" fill="#2a1810"/>
<line x1="6" y1="54" x2="64" y2="134" stroke="#1a0c08" stroke-width="2.2"/>
<g stroke="#1a0c08" stroke-width="0.7">
  <line x1="14" y1="72" x2="14" y2="134"/>
  <line x1="26" y1="90" x2="26" y2="134"/>
  <line x1="38" y1="108" x2="38" y2="134"/>
  <line x1="50" y1="126" x2="50" y2="134"/>
</g>

<!-- hall table with hydrangea vase + bakelite telephone + folded photograph -->
<g transform="translate(252, 116)">
  <rect x="0" y="0" width="56" height="6" fill="#3a241a"/>
  <rect x="2" y="6" width="2" height="18" fill="#2a1810"/>
  <rect x="52" y="6" width="2" height="18" fill="#2a1810"/>
  <!-- vase -->
  <path d="M 6 -2 L 10 -22 L 22 -22 L 26 -2 Z" fill="#0a0608" stroke="#3a2a20" stroke-width="0.6"/>
  <!-- hydrangea heads -->
  <g fill="#5a4868" opacity="0.85">
    <circle cx="10" cy="-26" r="3"/><circle cx="16" cy="-28" r="3.5"/><circle cx="22" cy="-26" r="3"/>
    <circle cx="13" cy="-22" r="2.5"/><circle cx="19" cy="-22" r="3"/><circle cx="16" cy="-24" r="3"/>
  </g>
  <g fill="#3a2c40" opacity="0.6">
    <circle cx="11" cy="-23" r="1.4"/><circle cx="20" cy="-23" r="1.4"/><circle cx="15" cy="-26" r="1.4"/>
  </g>
  <!-- telephone -->
  <g transform="translate(32, -8)">
    <rect x="0" y="0" width="18" height="10" fill="#080404" rx="1"/>
    <rect x="-2" y="-3" width="22" height="4" fill="#080404" rx="1.5"/>
    <circle cx="9" cy="5" r="2.6" fill="#1a0e08" stroke="#3a2a18" stroke-width="0.3"/>
    <line x1="9" y1="1" x2="9" y2="-3" stroke="#2a1a10" stroke-width="0.5"/>
  </g>
  <!-- photograph turned face-down behind the vase -->
  <rect x="-2" y="-4" width="10" height="6" fill="#c8b890" opacity="0.55" transform="rotate(-8 3 -1)"/>
</g>

<!-- doorway warm spill onto the tile -->
<ellipse cx="231" cy="140" rx="22" ry="6" fill="#d89058" opacity="0.20"/>

<rect width="320" height="180" fill="url(#vign-wf)"/>
`;

// ─── morning room ────────────────────────────────────────────────────────
// Tall window with lake view; easel with turned canvas; cold fireplace;
// Vivian's self-portrait above (a faint figure with brush).
ROOM_SVG.wm_morning = `
<defs>
<linearGradient id="wm-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1814"/><stop offset="100%" stop-color="#0a0a08"/>
</linearGradient>
<linearGradient id="wm-window" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a2030"/><stop offset="50%" stop-color="#0a121a"/><stop offset="100%" stop-color="#02060a"/>
</linearGradient>
<linearGradient id="wm-fp" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1c14"/><stop offset="100%" stop-color="#100804"/>
</linearGradient>
<radialGradient id="vign-wm" cx="50%" cy="55%" r="65%">
<stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wm-wall)"/>
<rect y="140" width="320" height="40" fill="#0a0604"/>
<g stroke="#1a0c08" stroke-width="0.4" opacity="0.7">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="160" x2="320" y2="160"/>
<line x1="40" y1="140" x2="40" y2="180"/><line x1="120" y1="140" x2="120" y2="180"/>
<line x1="200" y1="140" x2="200" y2="180"/><line x1="280" y1="140" x2="280" y2="180"/>
</g>
<rect x="20" y="30" width="76" height="110" fill="url(#wm-window)" stroke="#3a2a1c" stroke-width="1.5"/>
<g stroke="#3a2a1c" stroke-width="0.8">
<line x1="58" y1="30" x2="58" y2="140"/><line x1="20" y1="85" x2="96" y2="85"/>
</g>
<g fill="#02040a" opacity="0.85">
<path d="M 20 110 L 96 110 L 96 140 L 20 140 Z"/>
</g>
<circle cx="40" cy="48" r="4" fill="#e0d8b8" opacity="0.8"/>
<g fill="#080a14" opacity="0.7">
<path d="M 20 100 L 30 92 L 42 100 L 52 90 L 66 100 L 78 94 L 96 102 L 96 110 L 20 110 Z"/>
</g>
<g>
<rect x="120" y="20" width="80" height="80" fill="#1a1410" stroke="#5a4030" stroke-width="2"/>
<rect x="124" y="24" width="72" height="72" fill="#08060a"/>
<ellipse cx="148" cy="50" rx="10" ry="12" fill="#e0d4b8" opacity="0.5"/>
<!-- gaunt cheek/temple shadow for hollow skull-like read -->
<path d="M 140 48 Q 142 56 146 60" stroke="#1a0a08" stroke-width="0.6" fill="none" opacity="0.55"/>
<path d="M 156 48 Q 154 56 150 60" stroke="#1a0a08" stroke-width="0.6" fill="none" opacity="0.55"/>
<!-- hollow black eyes, asymmetric (right eye sits lower & smaller — wrong) -->
<ellipse cx="144.5" cy="48.5" rx="1.5" ry="2" fill="#020108"/>
<ellipse cx="151.5" cy="50" rx="1.3" ry="1.7" fill="#020108"/>
<!-- single thin downturned mouth slit, off-center -->
<path d="M 144 56 Q 148 55 152 56.5" stroke="#1a0a08" stroke-width="0.7" fill="none"/>
<!-- nose hint: vertical shadow -->
<path d="M 148 52 L 148 55" stroke="#3a2018" stroke-width="0.4" opacity="0.7"/>
<rect x="138" y="62" width="20" height="2" fill="#080404"/>
<path d="M 138 64 Q 148 60 158 64 L 162 92 L 134 92 Z" fill="#c0a888" opacity="0.45"/>
<line x1="170" y1="74" x2="186" y2="62" stroke="#2a1810" stroke-width="1.5"/>
<rect x="184" y="58" width="6" height="6" fill="#1a0c08"/>
<g fill="#2a1808" opacity="0.55"><circle cx="184" cy="60" r="0.8"/><circle cx="187" cy="62" r="0.8"/></g>
</g>
<g transform="translate(220,40)">
<line x1="0" y1="0" x2="0" y2="100" stroke="#2a1808" stroke-width="2"/>
<line x1="40" y1="0" x2="40" y2="100" stroke="#2a1808" stroke-width="2"/>
<line x1="-6" y1="100" x2="46" y2="100" stroke="#2a1808" stroke-width="2"/>
<rect x="2" y="20" width="36" height="48" fill="#0a0604" stroke="#1a0c08" stroke-width="1.2"/>
<line x1="2" y1="34" x2="38" y2="34" stroke="#1a0c08" stroke-width="0.4"/>
<line x1="2" y1="48" x2="38" y2="48" stroke="#1a0c08" stroke-width="0.4"/>
<line x1="20" y1="14" x2="22" y2="76" stroke="#100804" stroke-width="2"/>
</g>
<rect x="270" y="100" width="46" height="40" fill="url(#wm-fp)" stroke="#3a2a20" stroke-width="1"/>
<rect x="276" y="108" width="34" height="32" fill="#040202"/>
<g fill="#1a0c08">
<rect x="280" y="124" width="8" height="3"/><rect x="290" y="120" width="10" height="3"/>
<rect x="284" y="130" width="8" height="3"/>
</g>
<rect width="320" height="180" fill="url(#vign-wm)"/>
`;

// ─── library ─────────────────────────────────────────────────────────────
// Wing-back chair facing away; bookshelf; doctor's desk with stethoscope.
ROOM_SVG.wm_library = `
<defs>
<linearGradient id="wl-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1208"/><stop offset="100%" stop-color="#0a0604"/>
</linearGradient>
<linearGradient id="wl-chair" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a1c18"/><stop offset="100%" stop-color="#1a0a08"/>
</linearGradient>
<linearGradient id="wl-desk" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1808"/><stop offset="100%" stop-color="#100804"/>
</linearGradient>
<radialGradient id="wl-lamp" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#e8b070" stop-opacity="0.55"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wl" cx="50%" cy="55%" r="65%">
<stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.78"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wl-wall)"/>
<rect y="140" width="320" height="40" fill="#0a0402"/>
<g stroke="#1a0c08" stroke-width="0.4" opacity="0.6">
<line x1="0" y1="152" x2="320" y2="152"/>
<line x1="0" y1="164" x2="320" y2="164"/>
</g>
<rect x="10" y="20" width="90" height="120" fill="#100804" stroke="#2a1808" stroke-width="1"/>
<g stroke="#2a1808" stroke-width="0.5" fill="none">
<line x1="10" y1="44" x2="100" y2="44"/><line x1="10" y1="68" x2="100" y2="68"/>
<line x1="10" y1="92" x2="100" y2="92"/><line x1="10" y1="116" x2="100" y2="116"/>
</g>
<g>
<rect x="14" y="24" width="6" height="18" fill="#5a2818"/><rect x="22" y="22" width="4" height="20" fill="#2a3818"/>
<rect x="28" y="26" width="5" height="16" fill="#4a1808"/><rect x="35" y="24" width="6" height="18" fill="#3a2010"/>
<rect x="44" y="22" width="5" height="20" fill="#5a3020"/><rect x="51" y="26" width="4" height="16" fill="#2a1808"/>
<rect x="58" y="24" width="6" height="18" fill="#4a2010"/><rect x="66" y="26" width="5" height="16" fill="#3a1a10"/>
<rect x="74" y="22" width="4" height="20" fill="#5a2818"/><rect x="80" y="24" width="6" height="18" fill="#2a1c10"/>
<rect x="88" y="26" width="4" height="16" fill="#4a2418"/>
<rect x="14" y="48" width="4" height="18" fill="#3a1a10"/><rect x="20" y="46" width="6" height="20" fill="#2a1808"/>
<rect x="28" y="48" width="5" height="18" fill="#4a2010"/><rect x="36" y="46" width="4" height="20" fill="#5a2818"/>
<rect x="42" y="50" width="6" height="16" fill="#2a1808"/><rect x="50" y="48" width="5" height="18" fill="#3a1a10"/>
<rect x="58" y="46" width="6" height="20" fill="#4a2818"/><rect x="66" y="50" width="4" height="16" fill="#2a1808"/>
<rect x="72" y="48" width="6" height="18" fill="#3a2010"/><rect x="80" y="46" width="5" height="20" fill="#4a2418"/>
<rect x="88" y="50" width="4" height="16" fill="#2a1808"/>
<rect x="14" y="72" width="6" height="18" fill="#2a1808"/><rect x="22" y="70" width="4" height="20" fill="#3a2010"/>
<rect x="28" y="74" width="5" height="16" fill="#4a2418"/><rect x="36" y="72" width="6" height="18" fill="#3a1a10"/>
<rect x="44" y="74" width="4" height="16" fill="#2a1808"/><rect x="50" y="72" width="6" height="18" fill="#5a2818"/>
<rect x="58" y="74" width="5" height="16" fill="#2a1808"/><rect x="66" y="72" width="4" height="18" fill="#3a1a10"/>
<rect x="72" y="74" width="6" height="16" fill="#2a1808"/><rect x="80" y="72" width="5" height="18" fill="#4a2418"/>
<rect x="88" y="74" width="4" height="16" fill="#2a1808"/>
<rect x="14" y="96" width="5" height="18" fill="#3a1a10"/><rect x="21" y="98" width="6" height="16" fill="#2a1808"/>
<rect x="29" y="96" width="4" height="18" fill="#4a2010"/><rect x="35" y="98" width="6" height="16" fill="#3a1a10"/>
<rect x="43" y="96" width="5" height="18" fill="#5a2818"/><rect x="50" y="98" width="4" height="16" fill="#2a1808"/>
<rect x="56" y="96" width="6" height="18" fill="#3a2010"/><rect x="64" y="98" width="5" height="16" fill="#2a1808"/>
<rect x="71" y="96" width="4" height="18" fill="#4a2418"/><rect x="77" y="98" width="6" height="16" fill="#3a1a10"/>
<rect x="85" y="96" width="5" height="18" fill="#2a1808"/>
<rect x="14" y="120" width="6" height="16" fill="#4a2418"/><rect x="22" y="120" width="5" height="16" fill="#3a1a10"/>
<rect x="29" y="120" width="6" height="16" fill="#2a1808"/><rect x="37" y="120" width="4" height="16" fill="#5a2818"/>
<rect x="43" y="120" width="6" height="16" fill="#2a1808"/><rect x="51" y="120" width="5" height="16" fill="#3a2010"/>
<rect x="58" y="120" width="6" height="16" fill="#4a2418"/><rect x="66" y="120" width="4" height="16" fill="#2a1808"/>
<rect x="72" y="120" width="6" height="16" fill="#3a1a10"/><rect x="80" y="120" width="5" height="16" fill="#4a2818"/>
<rect x="87" y="120" width="6" height="16" fill="#2a1808"/>
</g>
<ellipse cx="240" cy="76" rx="60" ry="40" fill="url(#wl-lamp)"/>
<rect x="170" y="118" width="120" height="22" fill="url(#wl-desk)" stroke="#1a0c04" stroke-width="0.8"/>
<rect x="180" y="124" width="18" height="12" fill="#0a0604" stroke="#1a0c04" stroke-width="0.4"/>
<g stroke="#3a2a18" stroke-width="0.7" fill="none">
<path d="M 210 130 Q 218 122 226 130 Q 234 138 244 130"/>
<circle cx="244" cy="130" r="3" fill="#1a0c08" stroke="#3a2a18"/>
<circle cx="210" cy="130" r="2" fill="#1a0c08"/>
</g>
<rect x="262" y="126" width="22" height="10" fill="#100804" stroke="#3a2a18" stroke-width="0.4"/>
<rect x="266" y="128" width="14" height="2" fill="#3a2a18"/>
<g transform="translate(126, 78)">
<path d="M 0 0 L 0 50 L 50 50 L 50 0 Q 50 -8 42 -8 L 38 -8 L 38 12 L 12 12 L 12 -8 L 8 -8 Q 0 -8 0 0 Z" fill="url(#wl-chair)" stroke="#0a0402" stroke-width="0.5"/>
<rect x="-4" y="50" width="58" height="8" fill="#1a0a08"/>
<line x1="2" y1="50" x2="2" y2="58" stroke="#0a0402" stroke-width="0.8"/>
<line x1="48" y1="50" x2="48" y2="58" stroke="#0a0402" stroke-width="0.8"/>
<path d="M 8 -8 L 8 12" stroke="#5a2818" stroke-width="1" opacity="0.6"/>
<path d="M 42 -8 L 42 12" stroke="#5a2818" stroke-width="1" opacity="0.6"/>
</g>
<rect width="320" height="180" fill="url(#vign-wl)"/>
`;

// ─── kitchen ─────────────────────────────────────────────────────────────
// Two teacups, kettle just off the boil, loaf rising under a cloth, icebox.
ROOM_SVG.wm_kitchen = `
<defs>
<linearGradient id="wk-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1410"/><stop offset="100%" stop-color="#0a0604"/>
</linearGradient>
<pattern id="wk-tile" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
<rect width="20" height="20" fill="#181410"/><rect width="20" height="20" fill="none" stroke="#0a0604" stroke-width="0.4"/>
</pattern>
<linearGradient id="wk-counter" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1c14"/><stop offset="100%" stop-color="#100804"/>
</linearGradient>
<linearGradient id="wk-icebox" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a3028"/><stop offset="100%" stop-color="#1a1410"/>
</linearGradient>
<radialGradient id="vign-wk" cx="50%" cy="55%" r="65%">
<stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wk-wall)"/>
<rect y="0" width="320" height="100" fill="url(#wk-tile)"/>
<rect y="100" width="320" height="20" fill="url(#wk-counter)"/>
<rect y="120" width="320" height="60" fill="#0a0604"/>
<rect x="240" y="20" width="60" height="100" fill="url(#wk-icebox)" stroke="#0a0604" stroke-width="1"/>
<rect x="244" y="24" width="52" height="42" fill="#1a1410" stroke="#0a0604" stroke-width="0.4"/>
<rect x="244" y="70" width="52" height="46" fill="#1a1410" stroke="#0a0604" stroke-width="0.4"/>
<rect x="288" y="44" width="4" height="14" fill="#080404"/>
<rect x="288" y="88" width="4" height="14" fill="#080404"/>
<g transform="translate(38, 70)">
<path d="M 0 30 Q -4 20 4 12 L 22 12 Q 30 20 26 30 Z" fill="#2a1810" stroke="#0a0402" stroke-width="0.6"/>
<rect x="6" y="6" width="14" height="6" fill="#1a0c08"/>
<rect x="10" y="0" width="6" height="6" fill="#2a1810"/>
<path d="M 26 18 Q 36 18 36 26" fill="none" stroke="#2a1810" stroke-width="2"/>
<g stroke="#c8c0a0" stroke-width="0.6" opacity="0.55" fill="none">
<path d="M 6 4 Q 4 -2 8 -8 Q 12 -14 8 -20"/>
<path d="M 14 4 Q 12 -4 16 -10 Q 20 -16 14 -22"/>
</g>
</g>
<g transform="translate(100, 86)">
<ellipse cx="0" cy="14" rx="10" ry="2" fill="#0a0402" opacity="0.5"/>
<path d="M -8 0 Q -10 -2 -8 -6 L 8 -6 Q 10 -2 8 0 L 8 12 Q 8 14 6 14 L -6 14 Q -8 14 -8 12 Z" fill="#e8d8b0" stroke="#3a2820" stroke-width="0.5"/>
<path d="M 8 0 Q 14 -2 14 4 Q 14 8 8 8" fill="none" stroke="#3a2820" stroke-width="1"/>
<ellipse cx="0" cy="-6" rx="8" ry="1.5" fill="#3a2010" opacity="0.5"/>
</g>
<g transform="translate(140, 86)">
<ellipse cx="0" cy="14" rx="10" ry="2" fill="#0a0402" opacity="0.5"/>
<path d="M -8 0 Q -10 -2 -8 -6 L 8 -6 Q 10 -2 8 0 L 8 12 Q 8 14 6 14 L -6 14 Q -8 14 -8 12 Z" fill="#e8d8b0" stroke="#3a2820" stroke-width="0.5"/>
<path d="M 8 0 Q 14 -2 14 4 Q 14 8 8 8" fill="none" stroke="#3a2820" stroke-width="1"/>
<ellipse cx="0" cy="-6" rx="8" ry="1.5" fill="#3a2010" opacity="0.5"/>
</g>
<g transform="translate(190, 88)">
<ellipse cx="0" cy="14" rx="22" ry="3" fill="#0a0402" opacity="0.4"/>
<path d="M -20 12 Q -22 -6 -16 -12 Q 0 -16 16 -12 Q 22 -6 20 12 Z" fill="#c8b890" opacity="0.85"/>
<path d="M -18 8 Q -10 -8 0 -10 Q 12 -10 18 6" fill="none" stroke="#8a7860" stroke-width="0.4" opacity="0.6"/>
<g stroke="#6a5848" stroke-width="0.3" opacity="0.4">
<line x1="-14" y1="-4" x2="14" y2="-2"/><line x1="-16" y1="0" x2="16" y2="2"/>
</g>
</g>
<rect width="320" height="180" fill="url(#vign-wk)"/>
`;

// ─── upper hall ──────────────────────────────────────────────────────────
// A runner-rugged corridor: open master door (left), closed Vivian door
// (center, repainted), curtain at the end of the hall over the attic stair.
ROOM_SVG.wm_upper_hall = `
<defs>
<linearGradient id="wu-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1208"/><stop offset="100%" stop-color="#0a0604"/>
</linearGradient>
<linearGradient id="wu-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0402"/><stop offset="100%" stop-color="#020100"/>
</linearGradient>
<linearGradient id="wu-runner" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#5a2818"/><stop offset="100%" stop-color="#2a0a08"/>
</linearGradient>
<linearGradient id="wu-curtain" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a1a14"/><stop offset="100%" stop-color="#0a0402"/>
</linearGradient>
<radialGradient id="vign-wu" cx="50%" cy="55%" r="60%">
<stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wu-wall)"/>
<path d="M 0 132 L 320 132 L 280 180 L 40 180 Z" fill="url(#wu-floor)"/>
<path d="M 110 132 L 210 132 L 200 180 L 120 180 Z" fill="url(#wu-runner)"/>
<g stroke="#3a1a14" stroke-width="0.4" opacity="0.5">
<line x1="112" y1="140" x2="208" y2="140"/><line x1="114" y1="148" x2="206" y2="148"/>
<line x1="116" y1="158" x2="204" y2="158"/><line x1="118" y1="168" x2="202" y2="168"/>
</g>
<g>
<rect x="20" y="40" width="40" height="92" fill="#02040a" stroke="#3a2820" stroke-width="1.2"/>
<path d="M 20 40 L 60 40 L 56 132 L 22 132 Z" fill="#04020a"/>
<rect x="24" y="44" width="32" height="38" fill="#080a14" opacity="0.6"/>
<circle cx="54" cy="86" r="1.4" fill="#c0a048"/>
</g>
<g>
<rect x="142" y="44" width="36" height="88" fill="#1a1410" stroke="#3a2820" stroke-width="1.2"/>
<rect x="146" y="48" width="28" height="38" fill="#0a0604"/>
<rect x="146" y="90" width="28" height="38" fill="#0a0604"/>
<circle cx="172" cy="88" r="1.4" fill="#c0a048"/>
<rect x="142" y="44" width="36" height="88" fill="#100808" opacity="0.35"/>
</g>
<g transform="translate(252, 50)">
<path d="M 0 0 L 30 0 L 32 80 L -2 80 Z" fill="url(#wu-curtain)" stroke="#1a0a08" stroke-width="0.6"/>
<g stroke="#1a0a08" stroke-width="0.5" fill="none" opacity="0.7">
<path d="M 4 0 L 5 80"/><path d="M 10 0 L 11 80"/><path d="M 16 0 L 17 80"/><path d="M 22 0 L 23 80"/><path d="M 28 0 L 29 80"/>
</g>
<rect x="6" y="34" width="20" height="22" fill="#080404" stroke="#2a1808" stroke-width="0.6"/>
<g fill="#3a2a18"><rect x="14" y="42" width="4" height="4"/><rect x="13" y="46" width="6" height="3"/></g>
</g>
<g stroke="#4a3220" stroke-width="0.8" fill="#1a0e08">
<circle cx="80" cy="70" r="3"/><circle cx="80" cy="70" r="1" fill="#e8b070"/>
<circle cx="232" cy="70" r="3"/><circle cx="232" cy="70" r="1" fill="#e8b070"/>
</g>
<rect width="320" height="180" fill="url(#vign-wu)"/>
`;

// ─── master bedroom ──────────────────────────────────────────────────────
// Made bed; vanity beneath window with brush and silver-framed photograph.
ROOM_SVG.wm_master = `
<defs>
<linearGradient id="wmas-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1814"/><stop offset="100%" stop-color="#0a0608"/>
</linearGradient>
<linearGradient id="wmas-bed" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a2820"/><stop offset="100%" stop-color="#1a0e08"/>
</linearGradient>
<linearGradient id="wmas-quilt" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#c0a888"/><stop offset="100%" stop-color="#5a4030"/>
</linearGradient>
<linearGradient id="wmas-window" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0e1420"/><stop offset="100%" stop-color="#040810"/>
</linearGradient>
<radialGradient id="vign-wmas" cx="50%" cy="55%" r="65%">
<stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.78"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wmas-wall)"/>
<rect y="130" width="320" height="50" fill="#0a0604"/>
<g stroke="#1a0c08" stroke-width="0.4" opacity="0.6">
<line x1="0" y1="146" x2="320" y2="146"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<g transform="translate(180, 60)">
<rect x="0" y="0" width="130" height="20" fill="url(#wmas-bed)"/>
<rect x="0" y="20" width="130" height="40" fill="url(#wmas-quilt)" opacity="0.95"/>
<path d="M 0 20 L 130 20 L 122 32 L 8 32 Z" fill="#e0d4b8" opacity="0.7"/>
<rect x="6" y="26" width="42" height="10" rx="4" fill="#e8dcc0"/>
<g stroke="#8a7860" stroke-width="0.4" opacity="0.5" fill="none">
<path d="M 14 40 L 116 40"/><path d="M 18 50 L 112 50"/>
</g>
<rect x="0" y="60" width="130" height="6" fill="#1a0a06"/>
</g>
<rect x="32" y="50" width="80" height="50" fill="url(#wmas-window)" stroke="#3a2a1c" stroke-width="1.2"/>
<g stroke="#3a2a1c" stroke-width="0.6"><line x1="72" y1="50" x2="72" y2="100"/><line x1="32" y1="75" x2="112" y2="75"/></g>
<g fill="#04060c"><path d="M 32 88 L 42 80 L 54 88 L 66 78 L 80 88 L 96 82 L 112 90 L 112 100 L 32 100 Z"/></g>
<g transform="translate(40,100)">
<rect x="0" y="0" width="70" height="6" fill="#2a1810"/>
<rect x="0" y="6" width="70" height="22" fill="#1a0c08" stroke="#0a0604" stroke-width="0.4"/>
<rect x="6" y="12" width="26" height="12" fill="#0a0402"/>
<rect x="38" y="12" width="26" height="12" fill="#0a0402"/>
<line x1="35" y1="6" x2="35" y2="28" stroke="#0a0604" stroke-width="0.4"/>
<rect x="2" y="-10" width="66" height="10" fill="#080404"/>
<rect x="6" y="-8" width="58" height="6" fill="#1a1410"/>
<g fill="#c8c0a0" opacity="0.55"><rect x="40" y="-6" width="22" height="2"/><rect x="40" y="-3" width="18" height="1"/></g>
<rect x="10" y="-4" width="14" height="3" fill="#3a2820" rx="1"/>
<g fill="#1a0c08"><rect x="12" y="-3" width="1" height="2"/><rect x="14" y="-3" width="1" height="2"/><rect x="16" y="-3" width="1" height="2"/><rect x="18" y="-3" width="1" height="2"/><rect x="20" y="-3" width="1" height="2"/><rect x="22" y="-3" width="1" height="2"/></g>
</g>
<rect width="320" height="180" fill="url(#vign-wmas)"/>
`;

// ─── Vivian's room ───────────────────────────────────────────────────────
// Unmade bed with head-impression; open window onto lake; wet curtains; wet
// floor stain leading to the bed.
ROOM_SVG.wm_viv_room = `
<defs>
<linearGradient id="wv-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#141820"/><stop offset="100%" stop-color="#080a0e"/>
</linearGradient>
<linearGradient id="wv-bed" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a2018"/><stop offset="100%" stop-color="#100a06"/>
</linearGradient>
<linearGradient id="wv-sheet" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#c8c0b0"/><stop offset="100%" stop-color="#5a5040"/>
</linearGradient>
<linearGradient id="wv-window" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a2230"/><stop offset="60%" stop-color="#080c14"/><stop offset="100%" stop-color="#020408"/>
</linearGradient>
<linearGradient id="wv-curtain" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a4048"/><stop offset="60%" stop-color="#202830"/><stop offset="100%" stop-color="#101820"/>
</linearGradient>
<radialGradient id="wv-wet" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#3a4858" stop-opacity="0.65"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wv" cx="50%" cy="55%" r="65%">
<stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wv-wall)"/>
<rect y="135" width="320" height="45" fill="#04060a"/>
<rect x="34" y="34" width="100" height="74" fill="url(#wv-window)" stroke="#3a2a1c" stroke-width="1.5"/>
<g fill="#04060c"><path d="M 34 92 L 48 84 L 64 92 L 80 82 L 100 92 L 118 86 L 134 94 L 134 108 L 34 108 Z"/></g>
<!-- mullions drawn AFTER the lake silhouette so the vertical bar stays continuous edge to edge -->
<g stroke="#3a2a1c" stroke-width="0.9"><line x1="84" y1="34" x2="84" y2="108"/><line x1="34" y1="71" x2="134" y2="71"/></g>
<circle cx="56" cy="50" r="2.5" fill="#e0d8b8" opacity="0.7"/>
<g>
<path d="M 20 28 Q 32 32 32 50 L 36 108 L 18 108 Z" fill="url(#wv-curtain)" opacity="0.9"/>
<path d="M 134 28 Q 122 32 122 50 L 118 108 L 138 108 Z" fill="url(#wv-curtain)" opacity="0.9"/>
<g stroke="#0a0608" stroke-width="0.4" opacity="0.5">
<path d="M 22 30 L 28 108"/><path d="M 26 30 L 30 108"/>
<path d="M 132 30 L 126 108"/><path d="M 128 30 L 124 108"/>
</g>
<path d="M 26 102 Q 30 110 26 116" fill="none" stroke="#1a2028" stroke-width="1.2" opacity="0.85"/>
<path d="M 126 102 Q 122 110 126 116" fill="none" stroke="#1a2028" stroke-width="1.2" opacity="0.85"/>
</g>
<g transform="translate(170, 70)">
<rect x="0" y="0" width="130" height="14" fill="url(#wv-bed)"/>
<rect x="0" y="14" width="130" height="40" fill="url(#wv-sheet)" opacity="0.95"/>
<path d="M 0 14 Q 30 6 60 14 Q 86 4 130 14" fill="#1a1410" opacity="0.55"/>
<ellipse cx="22" cy="22" rx="14" ry="6" fill="#3a3020" opacity="0.7"/>
<ellipse cx="22" cy="22" rx="8" ry="3" fill="#1a1410" opacity="0.85"/>
<path d="M 40 16 Q 80 30 130 24 L 130 54 L 40 54 Z" fill="#5a4838" opacity="0.55"/>
<path d="M 60 22 Q 80 36 110 30" fill="none" stroke="#1a1410" stroke-width="0.5" opacity="0.6"/>
<rect x="0" y="54" width="130" height="6" fill="#1a0a06"/>
</g>
<ellipse cx="80" cy="130" rx="36" ry="6" fill="url(#wv-wet)"/>
<ellipse cx="150" cy="146" rx="38" ry="5" fill="url(#wv-wet)"/>
<ellipse cx="210" cy="156" rx="32" ry="4" fill="url(#wv-wet)"/>
<g fill="#2a3848" opacity="0.7">
<ellipse cx="60" cy="138" rx="4" ry="2"/><ellipse cx="84" cy="148" rx="4" ry="2"/>
<ellipse cx="110" cy="156" rx="4" ry="2"/><ellipse cx="140" cy="162" rx="4" ry="2"/>
<ellipse cx="172" cy="166" rx="4" ry="2"/><ellipse cx="200" cy="170" rx="4" ry="2"/>
</g>
<rect width="320" height="180" fill="url(#vign-wv)"/>
`;

// ─── attic door ──────────────────────────────────────────────────────────
// Padlocked door behind a heavy curtain. Three child-eye-level crosses,
// lowest inverted. Wallpaper peeling.
ROOM_SVG.wm_attic_door = `
<defs>
<pattern id="wad-paper" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
<rect width="20" height="40" fill="#1a1408"/>
<path d="M 0 0 L 0 40" stroke="#2a1c10" stroke-width="0.3" opacity="0.6"/>
<path d="M 4 2 Q 6 20 4 38" stroke="#2a1c10" stroke-width="0.25" fill="none" opacity="0.45"/>
</pattern>
<linearGradient id="wad-door" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a0c08"/><stop offset="100%" stop-color="#08040a"/>
</linearGradient>
<linearGradient id="wad-curtain" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a1a14"/><stop offset="100%" stop-color="#0a0402"/>
</linearGradient>
<radialGradient id="vign-wad" cx="50%" cy="50%" r="60%">
<stop offset="40%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.88"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wad-paper)"/>
<rect y="160" width="320" height="20" fill="#0a0402"/>
<g transform="translate(0, 0)">
<path d="M 0 0 L 80 0 L 70 180 L 0 180 Z" fill="url(#wad-curtain)"/>
<g stroke="#1a0a08" stroke-width="0.5" opacity="0.7" fill="none">
<path d="M 6 0 L 8 180"/><path d="M 18 0 L 18 180"/><path d="M 30 0 L 30 180"/><path d="M 42 0 L 40 180"/><path d="M 54 0 L 50 180"/><path d="M 66 0 L 60 180"/>
</g>
</g>
<g transform="translate(240, 0)">
<path d="M 80 0 L 0 0 L 10 180 L 80 180 Z" fill="url(#wad-curtain)"/>
<g stroke="#1a0a08" stroke-width="0.5" opacity="0.7" fill="none">
<path d="M 74 0 L 72 180"/><path d="M 62 0 L 62 180"/><path d="M 50 0 L 50 180"/><path d="M 38 0 L 40 180"/><path d="M 26 0 L 30 180"/><path d="M 14 0 L 20 180"/>
</g>
</g>
<rect x="100" y="20" width="120" height="140" fill="url(#wad-door)" stroke="#040000" stroke-width="1.5"/>
<rect x="106" y="26" width="108" height="128" fill="#08040a" stroke="#1a0c08" stroke-width="0.5"/>
<g stroke="#1a0c08" stroke-width="0.5" fill="none" opacity="0.85">
<line x1="160" y1="26" x2="160" y2="154"/>
<line x1="106" y1="90" x2="214" y2="90"/>
</g>
<rect x="148" y="82" width="24" height="22" fill="#3a2010" stroke="#0a0402" stroke-width="0.6"/>
<rect x="152" y="86" width="6" height="14" rx="3" fill="#1a0c08"/>
<rect x="160" y="86" width="6" height="14" rx="3" fill="#1a0c08"/>
<path d="M 148 82 Q 148 70 160 70 Q 172 70 172 82" fill="none" stroke="#3a2010" stroke-width="4"/>
<rect x="138" y="100" width="44" height="6" fill="#2a1808"/>
<g fill="#08040a">
<rect x="140" y="100" width="40" height="2"/>
</g>
<g stroke="#080a14" stroke-width="0.4" opacity="0.7" fill="none">
<path d="M 100 110 L 140 102 L 180 102 L 220 110"/>
<path d="M 100 124 L 140 122 L 180 122 L 220 124"/>
</g>
<!-- three small wooden crosses nailed at child's eye-level on the door: left, center, right (right one inverted, "long-ago slipped nail") -->
<g fill="#8a5028" stroke="#1a0a04" stroke-width="0.4">
<!-- left: upright -->
<rect x="123" y="44" width="3" height="18"/><rect x="118" y="50" width="13" height="3"/>
<!-- center: upright -->
<rect x="158.5" y="44" width="3" height="18"/><rect x="153.5" y="50" width="13" height="3"/>
<!-- right: inverted (cross-bar near the bottom) -->
<rect x="194" y="44" width="3" height="18"/><rect x="189" y="56" width="13" height="3"/>
</g>
<!-- tiny iron nails at the centers -->
<g fill="#1a0a04">
<circle cx="124.5" cy="51.5" r="0.6"/>
<circle cx="160" cy="51.5" r="0.6"/>
<circle cx="195.5" cy="57.5" r="0.6"/>
</g>
<!-- faint shadow halos so they read as mounted on the door, not floating -->
<g fill="#000" opacity="0.4">
<ellipse cx="124.5" cy="64" rx="8" ry="1"/>
<ellipse cx="160" cy="64" rx="8" ry="1"/>
<ellipse cx="195.5" cy="64" rx="8" ry="1"/>
</g>
<rect width="320" height="180" fill="url(#vign-wad)"/>
`;

// ─── attic ───────────────────────────────────────────────────────────────
// Sloped ceiling, child's bed under eaves, faced-away doll, coloring book on
// the floor, inverted crucifix on far wall.
ROOM_SVG.wm_attic = `
<defs>
<linearGradient id="wat-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#181208"/><stop offset="100%" stop-color="#080402"/>
</linearGradient>
<linearGradient id="wat-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1208"/><stop offset="100%" stop-color="#040201"/>
</linearGradient>
<linearGradient id="wat-bed" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a2820"/><stop offset="100%" stop-color="#1a0e08"/>
</linearGradient>
<linearGradient id="wat-sheet" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#a89878"/><stop offset="100%" stop-color="#3a2a20"/>
</linearGradient>
<radialGradient id="wat-glow" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#c08038" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wat" cx="50%" cy="55%" r="60%">
<stop offset="40%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.88"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wat-wall)"/>
<polygon points="0,0 0,180 60,180 110,80 210,80 260,180 320,180 320,0" fill="#0a0604"/>
<rect y="80" width="320" height="50" fill="#100808"/>
<rect y="130" width="320" height="50" fill="url(#wat-floor)"/>
<g stroke="#080402" stroke-width="0.5" opacity="0.85">
<line x1="0" y1="146" x2="320" y2="146"/><line x1="0" y1="162" x2="320" y2="162"/>
<line x1="40" y1="130" x2="40" y2="180"/><line x1="110" y1="130" x2="110" y2="180"/>
<line x1="180" y1="130" x2="180" y2="180"/><line x1="250" y1="130" x2="250" y2="180"/>
</g>
<polygon points="60,180 110,80 110,180" fill="#0a0604" opacity="0.6"/>
<polygon points="210,80 260,180 210,180" fill="#0a0604" opacity="0.6"/>
<ellipse cx="160" cy="120" rx="120" ry="40" fill="url(#wat-glow)"/>
<g transform="translate(40, 110)">
<rect x="0" y="0" width="76" height="10" fill="url(#wat-bed)"/>
<rect x="0" y="10" width="76" height="20" fill="url(#wat-sheet)" opacity="0.92"/>
<rect x="4" y="12" width="26" height="8" rx="3" fill="#e0d4b8" opacity="0.7"/>
<rect x="0" y="30" width="76" height="4" fill="#1a0a04"/>
<line x1="2" y1="0" x2="2" y2="-8" stroke="#1a0a04" stroke-width="2"/>
<line x1="74" y1="0" x2="74" y2="-8" stroke="#1a0a04" stroke-width="2"/>
</g>
<g transform="translate(240, 120)">
<ellipse cx="0" cy="22" rx="10" ry="2" fill="#0a0402" opacity="0.55"/>
<ellipse cx="0" cy="0" rx="8" ry="9" fill="#c8b89c" opacity="0.85"/>
<path d="M -8 0 Q -10 14 0 16 Q 10 14 8 0 Z" fill="#5a2818"/>
<g fill="#3a2010"><rect x="-4" y="14" width="3" height="6"/><rect x="1" y="14" width="3" height="6"/></g>
<g stroke="#3a2010" stroke-width="0.6" opacity="0.7" fill="none">
<path d="M -7 -7 Q -10 -10 -10 -4"/><path d="M 7 -7 Q 10 -10 10 -4"/>
</g>
<line x1="-8" y1="-2" x2="-2" y2="-1" stroke="#100804" stroke-width="0.8" opacity="0.6"/>
<line x1="8" y1="-2" x2="2" y2="-1" stroke="#100804" stroke-width="0.8" opacity="0.6"/>
</g>
<g transform="translate(150, 158)">
<rect x="-12" y="-2" width="24" height="14" fill="#e0d4b8" opacity="0.85" stroke="#3a2010" stroke-width="0.4"/>
<rect x="-12" y="-2" width="24" height="14" fill="none" stroke="#0a0604" stroke-width="0.3"/>
<line x1="0" y1="-2" x2="0" y2="12" stroke="#3a2010" stroke-width="0.3"/>
<g fill="#080404">
<circle cx="-6" cy="3" r="0.8"/><circle cx="-3" cy="5" r="0.8"/><circle cx="0" cy="3" r="0.8"/><circle cx="3" cy="5" r="0.8"/><circle cx="6" cy="3" r="0.8"/>
<circle cx="-6" cy="7" r="0.8"/><circle cx="-3" cy="9" r="0.8"/><circle cx="3" cy="9" r="0.8"/><circle cx="6" cy="7" r="0.8"/>
</g>
</g>
<g transform="translate(160, 92)" stroke="#3a2010" stroke-width="0.5">
<rect x="-1.2" y="-12" width="2.4" height="22" fill="#3a2010" transform="rotate(180)"/>
<rect x="-6" y="-3" width="12" height="2" fill="#3a2010" transform="rotate(180)"/>
</g>
<g stroke="#3a2008" stroke-width="0.4" opacity="0.5" fill="none">
<path d="M 0 80 L 320 80"/>
<path d="M 60 100 L 80 102 L 100 100"/>
</g>
<rect width="320" height="180" fill="url(#vign-wat)"/>
`;

// ─── chapel ──────────────────────────────────────────────────────────────
// Altar with white linen and a purple stole; two pews; lectern with typewriter;
// brass plaque on side wall.
ROOM_SVG.wm_chapel = `
<defs>
<linearGradient id="wch-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1818"/><stop offset="100%" stop-color="#080606"/>
</linearGradient>
<linearGradient id="wch-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#100c08"/><stop offset="100%" stop-color="#040201"/>
</linearGradient>
<linearGradient id="wch-altar" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#e8e0c8"/><stop offset="100%" stop-color="#5a5240"/>
</linearGradient>
<linearGradient id="wch-stole" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#5a2860"/><stop offset="100%" stop-color="#2a0c30"/>
</linearGradient>
<radialGradient id="wch-glow" cx="50%" cy="35%" r="50%">
<stop offset="0%" stop-color="#e8b070" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wch" cx="50%" cy="55%" r="65%">
<stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.8"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wch-wall)"/>
<polygon points="100,0 220,0 230,40 90,40" fill="#0a0604"/>
<path d="M 160 8 Q 168 14 168 22 L 168 36 L 152 36 L 152 22 Q 152 14 160 8 Z" fill="#0a121c" stroke="#3a2a1c" stroke-width="0.8"/>
<rect x="158" y="10" width="4" height="22" fill="#3a2a1c"/>
<rect x="150" y="20" width="20" height="3" fill="#3a2a1c"/>
<rect y="120" width="320" height="60" fill="url(#wch-floor)"/>
<g stroke="#080404" stroke-width="0.4" opacity="0.7">
<line x1="0" y1="138" x2="320" y2="138"/><line x1="0" y1="152" x2="320" y2="152"/>
<line x1="0" y1="166" x2="320" y2="166"/>
</g>
<ellipse cx="160" cy="76" rx="120" ry="40" fill="url(#wch-glow)"/>
<rect x="98" y="62" width="124" height="58" fill="#1a1410" stroke="#0a0604" stroke-width="0.8"/>
<rect x="98" y="58" width="124" height="6" fill="url(#wch-altar)"/>
<rect x="96" y="56" width="128" height="4" fill="#3a3020"/>
<path d="M 110 60 L 116 96 L 132 60 Z" fill="url(#wch-stole)"/>
<path d="M 210 60 L 204 96 L 188 60 Z" fill="url(#wch-stole)"/>
<g stroke="#c8a060" stroke-width="0.4" opacity="0.7" fill="none">
<path d="M 116 70 L 126 70"/><path d="M 116 78 L 126 78"/>
<path d="M 194 70 L 204 70"/><path d="M 194 78 L 204 78"/>
</g>
<g transform="translate(160, 36)" stroke="#c8a060" stroke-width="1.2" fill="none">
<line x1="0" y1="0" x2="0" y2="22"/><line x1="-7" y1="8" x2="7" y2="8"/>
</g>
<g transform="translate(40, 142)">
<rect x="0" y="0" width="80" height="8" fill="#3a2010"/>
<rect x="0" y="8" width="80" height="14" fill="#2a1808"/>
<line x1="4" y1="0" x2="4" y2="22" stroke="#1a0c08" stroke-width="0.6"/>
<line x1="76" y1="0" x2="76" y2="22" stroke="#1a0c08" stroke-width="0.6"/>
</g>
<g transform="translate(200, 142)">
<rect x="0" y="0" width="80" height="8" fill="#3a2010"/>
<rect x="0" y="8" width="80" height="14" fill="#2a1808"/>
<line x1="4" y1="0" x2="4" y2="22" stroke="#1a0c08" stroke-width="0.6"/>
<line x1="76" y1="0" x2="76" y2="22" stroke="#1a0c08" stroke-width="0.6"/>
</g>
<g transform="translate(282, 80)">
<rect x="-12" y="0" width="24" height="3" fill="#1a0c08"/>
<rect x="-10" y="3" width="20" height="14" fill="#0a0604" stroke="#3a2820" stroke-width="0.4"/>
<rect x="-3" y="-12" width="6" height="14" fill="#1a0c08"/>
<g fill="#c8a060" font-family="Cinzel,serif" font-size="3" text-anchor="middle">
<text x="0" y="10">BEATRICE</text><text x="0" y="14" font-size="2.5">1957–1962</text>
</g>
</g>
<g transform="translate(20, 84)">
<rect x="0" y="0" width="22" height="14" fill="#1a0c08" stroke="#3a2820" stroke-width="0.5"/>
<rect x="2" y="2" width="18" height="6" fill="#2a1810"/>
<g fill="#3a2820"><rect x="4" y="10" width="2" height="2"/><rect x="7" y="10" width="2" height="2"/><rect x="10" y="10" width="2" height="2"/><rect x="13" y="10" width="2" height="2"/><rect x="16" y="10" width="2" height="2"/></g>
<rect x="3" y="-4" width="16" height="4" fill="#e8d8b0"/>
<line x1="0" y1="14" x2="22" y2="14" stroke="#1a0c08" stroke-width="0.6"/>
</g>
<rect width="320" height="180" fill="url(#vign-wch)"/>
`;

// ─── boathouse ───────────────────────────────────────────────────────────
// Cedar interior; rowboat in slings; lantern on a peg; black water with pale
// shape just beneath.
ROOM_SVG.wm_boathouse = `
<defs>
<linearGradient id="wb-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1208"/><stop offset="100%" stop-color="#0a0604"/>
</linearGradient>
<pattern id="wb-planks" x="0" y="0" width="320" height="14" patternUnits="userSpaceOnUse">
<rect width="320" height="14" fill="#1a1208"/>
<line x1="0" y1="13" x2="320" y2="13" stroke="#080402" stroke-width="0.5"/>
<path d="M 60 4 Q 80 6 100 4 M 180 8 Q 200 10 220 8" stroke="#2a1c10" stroke-width="0.3" fill="none" opacity="0.6"/>
</pattern>
<linearGradient id="wb-water" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#040608"/><stop offset="100%" stop-color="#01020a"/>
</linearGradient>
<radialGradient id="wb-pale" cx="50%" cy="50%" r="45%">
<stop offset="0%" stop-color="#586878" stop-opacity="0.55"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="wb-lantern" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#e8b070" stop-opacity="0.45"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wb" cx="50%" cy="55%" r="65%">
<stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wb-wall)"/>
<rect y="0" width="320" height="14" fill="url(#wb-planks)"/>
<rect y="14" width="320" height="14" fill="url(#wb-planks)" transform="translate(20,0)"/>
<rect y="28" width="320" height="14" fill="url(#wb-planks)"/>
<rect y="42" width="320" height="14" fill="url(#wb-planks)" transform="translate(20,0)"/>
<rect y="56" width="320" height="14" fill="url(#wb-planks)"/>
<rect y="70" width="320" height="14" fill="url(#wb-planks)" transform="translate(20,0)"/>
<rect y="100" width="320" height="80" fill="url(#wb-water)"/>
<rect y="92" width="320" height="10" fill="#1a1208"/>
<ellipse cx="200" cy="146" rx="50" ry="14" fill="url(#wb-pale)"/>
<path d="M 188 140 Q 200 138 212 140 L 220 152 L 180 152 Z" fill="#202830" opacity="0.55"/>
<g stroke="#101820" stroke-width="0.4" opacity="0.55" fill="none">
<path d="M 0 124 Q 80 122 160 124 T 320 124"/>
<path d="M 0 136 Q 80 134 160 136 T 320 136"/>
<path d="M 0 158 Q 80 156 160 158 T 320 158"/>
<path d="M 0 170 Q 80 168 160 170 T 320 170"/>
</g>
<g transform="translate(80, 76)">
<path d="M 0 0 Q 60 -8 120 0 L 110 18 Q 60 22 10 18 Z" fill="#3a2818" stroke="#0a0402" stroke-width="0.8"/>
<path d="M 8 2 Q 60 -4 112 2 L 106 14 Q 60 18 14 14 Z" fill="#2a1808"/>
<line x1="60" y1="-6" x2="60" y2="18" stroke="#1a0c04" stroke-width="0.4"/>
<line x1="-6" y1="-2" x2="-6" y2="40" stroke="#3a2818" stroke-width="2"/>
<line x1="126" y1="-2" x2="126" y2="40" stroke="#3a2818" stroke-width="2"/>
<line x1="-8" y1="22" x2="0" y2="14" stroke="#3a2010" stroke-width="0.8"/>
<line x1="128" y1="22" x2="120" y2="14" stroke="#3a2010" stroke-width="0.8"/>
<line x1="20" y1="-4" x2="20" y2="-30" stroke="#3a2818" stroke-width="1.2"/>
<line x1="100" y1="-4" x2="100" y2="-30" stroke="#3a2818" stroke-width="1.2"/>
</g>
<ellipse cx="38" cy="70" rx="34" ry="22" fill="url(#wb-lantern)"/>
<g transform="translate(28, 62)">
<rect x="-2" y="-12" width="4" height="6" fill="#3a2010"/>
<line x1="0" y1="-6" x2="0" y2="0" stroke="#3a2010" stroke-width="1"/>
<rect x="-6" y="0" width="12" height="14" fill="#1a0c08" stroke="#3a2010" stroke-width="0.5"/>
<rect x="-4" y="2" width="8" height="10" fill="#e8b070" opacity="0.85"/>
<rect x="-3" y="3" width="6" height="6" fill="#fff2c8" opacity="0.7"/>
<path d="M -6 14 L 6 14 L 4 16 L -4 16 Z" fill="#3a2010"/>
</g>
<rect width="320" height="180" fill="url(#vign-wb)"/>
`;

// ─── lake shore ─────────────────────────────────────────────────────────
// Stones along the shore arranged in a row. Lake glassy black. Mist rising.
ROOM_SVG.wm_lakeshore = `
<defs>
<linearGradient id="wls-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0e1a"/><stop offset="100%" stop-color="#06080e"/>
</linearGradient>
<linearGradient id="wls-water" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#06080e"/><stop offset="100%" stop-color="#02030a"/>
</linearGradient>
<linearGradient id="wls-shore" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1408"/><stop offset="100%" stop-color="#080402"/>
</linearGradient>
<radialGradient id="wls-mist" cx="50%" cy="60%" r="50%">
<stop offset="0%" stop-color="#a8b0b8" stop-opacity="0.22"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vign-wls" cx="50%" cy="55%" r="65%">
<stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#wls-sky)"/>
<g fill="#02030a">
<path d="M 0 78 L 32 60 L 60 76 L 86 56 L 116 74 L 148 62 L 180 76 L 214 60 L 246 74 L 280 62 L 320 78 L 320 90 L 0 90 Z"/>
</g>
<rect y="86" width="320" height="50" fill="url(#wls-water)"/>
<g stroke="#1a2028" stroke-width="0.4" opacity="0.55" fill="none">
<path d="M 0 102 Q 80 100 160 102 T 320 102"/>
<path d="M 0 112 Q 80 110 160 112 T 320 112"/>
<path d="M 0 122 Q 80 120 160 122 T 320 122"/>
<path d="M 0 132 Q 80 130 160 132 T 320 132"/>
</g>
<ellipse cx="160" cy="100" rx="160" ry="20" fill="url(#wls-mist)"/>
<rect y="130" width="320" height="50" fill="url(#wls-shore)"/>
<g fill="#080604" stroke="#0a0604" stroke-width="0.4">
<ellipse cx="20" cy="150" rx="10" ry="5"/><ellipse cx="48" cy="158" rx="14" ry="6"/>
<ellipse cx="78" cy="148" rx="8" ry="4"/><ellipse cx="100" cy="160" rx="12" ry="5"/>
<ellipse cx="130" cy="152" rx="9" ry="4"/><ellipse cx="158" cy="160" rx="14" ry="6"/>
<ellipse cx="190" cy="150" rx="10" ry="5"/><ellipse cx="218" cy="158" rx="12" ry="5"/>
<ellipse cx="250" cy="150" rx="9" ry="4"/><ellipse cx="280" cy="160" rx="14" ry="6"/>
<ellipse cx="306" cy="150" rx="10" ry="5"/>
</g>
<g fill="#040201" stroke="#100804" stroke-width="0.3">
<ellipse cx="42" cy="138" rx="6" ry="3"/><ellipse cx="64" cy="138" rx="6" ry="3"/>
<ellipse cx="86" cy="138" rx="6" ry="3"/><ellipse cx="108" cy="138" rx="6" ry="3"/>
<ellipse cx="130" cy="138" rx="6" ry="3"/><ellipse cx="152" cy="138" rx="6" ry="3"/>
<ellipse cx="174" cy="138" rx="6" ry="3"/><ellipse cx="196" cy="138" rx="6" ry="3"/>
<ellipse cx="218" cy="138" rx="6" ry="3"/><ellipse cx="240" cy="138" rx="6" ry="3"/>
<ellipse cx="262" cy="138" rx="6" ry="3"/><ellipse cx="284" cy="138" rx="6" ry="3"/>
</g>
<g stroke="#3a4858" stroke-width="0.4" opacity="0.5" fill="none">
<path d="M 0 96 Q 80 92 160 96 T 320 96"/>
</g>
<rect width="320" height="180" fill="url(#vign-wls)"/>
`;
