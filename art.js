// art.js — inline SVG room paintings. One iconic scene per room.
"use strict";

function roomSvg(roomId) {
  const S = ROOM_SVG[roomId];
  if (!S) return `<div style="color:#3a3032;font-size:14px;letter-spacing:2px;text-align:center;padding-top:120px">[${ROOMS[roomId]?.floor || ""}]</div>`;
  return `<svg class="room-scene" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">${S}</svg>`;
}

const ROOM_SVG = {};

ROOM_SVG.wine_cellar = `
<defs>
<linearGradient id="wc-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0604"/><stop offset="100%" stop-color="#040202"/>
</linearGradient>
<linearGradient id="wc-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0604"/><stop offset="100%" stop-color="#020100"/>
</linearGradient>
<radialGradient id="wc-lantern" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#ffc850" stop-opacity="0.55"/>
<stop offset="60%" stop-color="#8a3810" stop-opacity="0.18"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<linearGradient id="wc-door" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1808"/><stop offset="100%" stop-color="#0a0402"/>
</linearGradient>
<pattern id="wc-stone" x="0" y="0" width="36" height="14" patternUnits="userSpaceOnUse">
<rect width="36" height="14" fill="#1a100a"/>
<path d="M 0 0 L 36 0 M 0 14 L 36 14 M 18 0 L 18 14" stroke="#08040a" stroke-width="0.6"/>
<path d="M 10 4 L 12 6 M 20 8 L 22 10" stroke="#2a1a10" stroke-width="0.3" opacity="0.4"/>
</pattern>
<pattern id="wc-stone2" x="0" y="0" width="36" height="14" patternUnits="userSpaceOnUse">
<rect width="36" height="14" fill="#14080a"/>
<path d="M 0 0 L 36 0 M 0 14 L 36 14 M 18 0 L 18 14" stroke="#08040a" stroke-width="0.6"/>
</pattern>
</defs>
<rect width="320" height="180" fill="url(#wc-wall)"/>
<rect width="320" height="14" y="0" fill="url(#wc-stone)"/>
<rect width="320" height="14" y="14" fill="url(#wc-stone2)" transform="translate(-18, 0)"/>
<rect width="320" height="14" y="28" fill="url(#wc-stone)"/>
<rect width="320" height="14" y="42" fill="url(#wc-stone2)" transform="translate(-18, 0)"/>
<ellipse cx="72" cy="100" rx="80" ry="30" fill="url(#wc-lantern)"/>
<rect x="0" y="140" width="320" height="40" fill="url(#wc-floor)"/>
<g opacity="0.5" stroke="#08040a" stroke-width="0.4">
<path d="M 0 150 L 40 150 L 80 150 L 120 150"/><path d="M 160 150 L 200 150 L 240 150 L 320 150"/>
<path d="M 20 162 L 60 162 L 100 162 L 140 162"/><path d="M 180 162 L 220 162 L 260 162 L 300 162"/>
<path d="M 40 150 L 40 162 M 80 150 L 80 162 M 120 150 L 120 162 M 160 150 L 160 162 M 200 150 L 200 162 M 240 150 L 240 162 M 280 150 L 280 162"/>
</g>
<rect x="14" y="60" width="126" height="78" fill="#0a0604" stroke="#2a1a08" stroke-width="1"/>
<g stroke="#2a1a08" stroke-width="0.6" fill="none">
<line x1="14" y1="74" x2="140" y2="74"/><line x1="14" y1="90" x2="140" y2="90"/>
<line x1="14" y1="106" x2="140" y2="106"/><line x1="14" y1="122" x2="140" y2="122"/>
<line x1="30" y1="60" x2="30" y2="138"/><line x1="50" y1="60" x2="50" y2="138"/>
<line x1="70" y1="60" x2="70" y2="138"/><line x1="90" y1="60" x2="90" y2="138"/>
<line x1="110" y1="60" x2="110" y2="138"/><line x1="126" y1="60" x2="126" y2="138"/>
</g>
<g fill="#0a0402">
<ellipse cx="22" cy="66" rx="6" ry="3"/><ellipse cx="58" cy="82" rx="6" ry="3"/>
<ellipse cx="78" cy="98" rx="6" ry="3"/><ellipse cx="118" cy="114" rx="6" ry="3"/>
</g>
<path d="M 200 38 L 200 140 L 292 140 L 292 38 Z" fill="url(#wc-door)" stroke="#1a0e08" stroke-width="1.5"/>
<rect x="204" y="42" width="84" height="94" fill="#1a0e06" stroke="#0a0402" stroke-width="0.5"/>
<g stroke="#0a0402" stroke-width="0.8" fill="none">
<line x1="246" y1="42" x2="246" y2="136"/>
<rect x="210" y="48" width="32" height="40"/><rect x="250" y="48" width="32" height="40"/>
<rect x="210" y="92" width="32" height="40"/><rect x="250" y="92" width="32" height="40"/>
</g>
<g fill="#2a1808">
<rect x="202" y="60" width="8" height="6"/><rect x="202" y="88" width="8" height="6"/>
<rect x="202" y="120" width="8" height="6"/>
</g>
<rect x="272" y="84" width="18" height="12" fill="#1a0e06" stroke="#2a1808" stroke-width="0.5"/>
<circle cx="283" cy="90" r="4" fill="#c0a048"/>
<circle cx="283" cy="90" r="2" fill="#4a3418"/>
<rect x="280" y="92" width="6" height="5" fill="#3a2408"/>
<g stroke="#2a1a10" stroke-width="1" fill="none" opacity="0.3">
<path d="M 160 60 Q 168 65 160 70 Q 168 75 160 80 Q 168 85 160 90 Q 168 95 160 100"/>
</g>
<rect width="320" height="180" fill="url(#vign-wc)"/>
<defs><radialGradient id="vign-wc" cx="35%" cy="55%" r="55%"><stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.85"/></radialGradient></defs>
`;

ROOM_SVG.study = `
<defs>
<linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#241a0e"/><stop offset="100%" stop-color="#0c0804"/>
</linearGradient>
<linearGradient id="st-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#12080a"/><stop offset="100%" stop-color="#040202"/>
</linearGradient>
<radialGradient id="st-lamp" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#ffd080" stop-opacity="0.65"/>
<stop offset="50%" stop-color="#c47018" stop-opacity="0.22"/>
<stop offset="100%" stop-color="#3a1004" stop-opacity="0"/>
</radialGradient>
<linearGradient id="st-desk" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a2414"/><stop offset="100%" stop-color="#14080a"/>
</linearGradient>
</defs>
<rect width="320" height="180" fill="url(#st-wall)"/>
<ellipse cx="140" cy="100" rx="180" ry="80" fill="url(#st-lamp)" opacity="0.4"/>
<rect x="0" y="140" width="320" height="40" fill="url(#st-floor)"/>
<g opacity="0.4" stroke="#2a1a0a" stroke-width="0.3">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<rect x="8" y="8" width="54" height="118" fill="#1a1008" stroke="#3a2410" stroke-width="0.5"/>
<g stroke="#3a2410" stroke-width="0.3" fill="none">
<line x1="8" y1="30" x2="62" y2="30"/><line x1="8" y1="54" x2="62" y2="54"/>
<line x1="8" y1="78" x2="62" y2="78"/><line x1="8" y1="102" x2="62" y2="102"/>
</g>
<g>
<rect x="12" y="12" width="4" height="14" fill="#6a3012"/><rect x="18" y="12" width="4" height="14" fill="#4a2010"/>
<rect x="24" y="12" width="3" height="14" fill="#3a1808"/><rect x="29" y="12" width="4" height="14" fill="#2a1408"/>
<rect x="35" y="12" width="4" height="14" fill="#6a3012"/><rect x="41" y="12" width="3" height="14" fill="#4a2010"/>
<rect x="46" y="12" width="4" height="14" fill="#3a1808"/><rect x="52" y="12" width="3" height="14" fill="#6a3012"/>
<rect x="12" y="36" width="3" height="14" fill="#4a2010"/><rect x="17" y="36" width="4" height="14" fill="#6a3012"/>
<rect x="23" y="36" width="4" height="14" fill="#3a1808"/><rect x="29" y="36" width="3" height="14" fill="#2a1408"/>
<rect x="34" y="36" width="4" height="14" fill="#6a3012"/><rect x="40" y="36" width="4" height="14" fill="#4a2010"/>
<rect x="46" y="36" width="3" height="14" fill="#6a3012"/><rect x="51" y="36" width="4" height="14" fill="#3a1808"/>
</g>
<ellipse cx="140" cy="138" rx="70" ry="8" fill="#000" opacity="0.5"/>
<path d="M 72 76 L 72 140 L 208 140 L 208 76 Z" fill="url(#st-desk)" stroke="#4a3020" stroke-width="0.5"/>
<path d="M 72 76 L 208 76 L 208 82 L 72 82 Z" fill="#5a3824"/>
<rect x="76" y="88" width="44" height="32" fill="#1a0e06" stroke="#3a2410" stroke-width="0.5"/>
<circle cx="90" cy="104" r="9" fill="#08040a" stroke="#3a2410" stroke-width="0.5"/>
<circle cx="90" cy="104" r="7" fill="#1a0810"/>
<circle cx="90" cy="104" r="3" fill="#3a1a20"/>
<circle cx="110" cy="104" r="9" fill="#08040a" stroke="#3a2410" stroke-width="0.5"/>
<circle cx="110" cy="104" r="7" fill="#1a0810"/>
<circle cx="110" cy="104" r="3" fill="#3a1a20"/>
<path d="M 92 104 L 108 104" stroke="#4a3020" stroke-width="0.5"/>
<rect x="82" y="118" width="32" height="2" fill="#3a2410"/>
<circle cx="84" cy="119" r="1" fill="#c0a040"/><circle cx="88" cy="119" r="1" fill="#c0a040"/>
<rect x="130" y="94" width="54" height="30" fill="#1a0e06" stroke="#3a2410" stroke-width="0.5"/>
<rect x="133" y="97" width="48" height="24" fill="#0a0604"/>
<rect x="136" y="100" width="42" height="2" fill="#3a2010"/><rect x="136" y="104" width="36" height="2" fill="#3a2010"/>
<rect x="136" y="108" width="40" height="2" fill="#3a2010"/><rect x="136" y="112" width="34" height="2" fill="#3a2010"/>
<circle cx="248" cy="52" r="22" fill="#2a1a08" stroke="#3a2410" stroke-width="0.8"/>
<circle cx="248" cy="52" r="16" fill="url(#st-lamp)"/>
<circle cx="248" cy="52" r="4" fill="#ffe8a0"/>
<rect x="243" y="74" width="10" height="60" fill="#2a1a08" stroke="#3a2410" stroke-width="0.5"/>
<rect x="238" y="128" width="20" height="8" fill="#1a0e06"/>
<g>
<rect x="262" y="94" width="14" height="28" fill="#3a2010" stroke="#1a0e06" stroke-width="0.3"/>
<rect x="278" y="98" width="12" height="24" fill="#5a2418" stroke="#1a0e06" stroke-width="0.3"/>
<rect x="292" y="90" width="14" height="32" fill="#2a1408" stroke="#1a0e06" stroke-width="0.3"/>
</g>
<rect width="320" height="180" fill="url(#vign-st)"/>
<defs><radialGradient id="vign-st" cx="50%" cy="55%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
`;

ROOM_SVG.governess = `
<defs>
<linearGradient id="go-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#221c18"/><stop offset="100%" stop-color="#0e0806"/>
</linearGradient>
<linearGradient id="go-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#120a08"/><stop offset="100%" stop-color="#04020a"/>
</linearGradient>
<radialGradient id="go-moon" cx="50%" cy="40%" r="60%">
<stop offset="0%" stop-color="#a0b8d0" stop-opacity="0.45"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="go-lamp" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#ffc078" stop-opacity="0.55"/>
<stop offset="60%" stop-color="#8a4018" stop-opacity="0.18"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#go-wall)"/>
<ellipse cx="65" cy="50" rx="90" ry="60" fill="url(#go-moon)"/>
<rect x="0" y="140" width="320" height="40" fill="url(#go-floor)"/>
<g opacity="0.4" stroke="#2a2018" stroke-width="0.3">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<rect x="24" y="18" width="78" height="104" fill="#0a0a10" stroke="#4a4038" stroke-width="1.2"/>
<rect x="26" y="20" width="74" height="100" fill="#08081a"/>
<line x1="63" y1="20" x2="63" y2="120" stroke="#4a4038" stroke-width="1"/>
<line x1="26" y1="70" x2="100" y2="70" stroke="#4a4038" stroke-width="1"/>
<rect x="28" y="22" width="34" height="46" fill="#3a4258" opacity="0.35"/>
<rect x="64" y="22" width="34" height="46" fill="#3a4258" opacity="0.35"/>
<rect x="28" y="72" width="34" height="46" fill="#3a4258" opacity="0.3"/>
<rect x="64" y="72" width="34" height="46" fill="#3a4258" opacity="0.3"/>
<g opacity="0.6">
<path d="M 10 16 Q 64 4 120 16 L 120 12 L 10 12 Z" fill="#4a2818"/>
<path d="M 14 16 Q 64 6 118 16" stroke="#1a0608" stroke-width="0.4" fill="none"/>
<path d="M 10 14 Q 16 22 10 30 Q 14 40 10 50 Q 16 60 10 70 Q 14 80 10 90 Q 16 100 10 110 Q 14 120 10 130" stroke="#4a2818" stroke-width="2" fill="none"/>
<path d="M 118 14 Q 112 22 118 30 Q 114 40 118 50 Q 112 60 118 70 Q 114 80 118 90 Q 112 100 118 110 Q 114 120 118 130" stroke="#4a2818" stroke-width="2" fill="none"/>
</g>
<ellipse cx="220" cy="138" rx="50" ry="6" fill="#000" opacity="0.5"/>
<path d="M 176 78 L 176 138 L 264 138 L 264 78 L 260 74 L 180 74 Z" fill="#2a1a10" stroke="#1a0e06" stroke-width="0.5"/>
<rect x="180" y="80" width="80" height="4" fill="#3a2418"/>
<rect x="184" y="86" width="72" height="44" fill="#0a0604"/>
<rect x="188" y="90" width="64" height="36" fill="#8a7050" opacity="0.5"/>
<rect x="188" y="90" width="64" height="36" fill="#6a5038" opacity="0.3"/>
<g stroke="#2a1008" stroke-width="0.8" fill="none">
<circle cx="208" cy="108" r="3.5"/><circle cx="232" cy="108" r="3.5"/>
<line x1="211" y1="108" x2="229" y2="108"/>
<line x1="208" y1="112" x2="208" y2="118"/><line x1="232" y1="112" x2="232" y2="118"/>
<ellipse cx="220" cy="102" rx="1.5" ry="1" fill="#2a1008"/>
</g>
<ellipse cx="290" cy="120" rx="18" ry="20" fill="url(#go-lamp)"/>
<rect x="282" y="102" width="16" height="26" fill="#2a1a10"/>
<rect x="284" y="100" width="12" height="6" fill="#ffc078" opacity="0.85"/>
<circle cx="190" cy="132" r="2" fill="#5a2828"/>
<circle cx="245" cy="134" r="2.5" fill="#6a3030"/>
<rect width="320" height="180" fill="url(#vign-go)"/>
<defs><radialGradient id="vign-go" cx="50%" cy="55%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
`;

ROOM_SVG.nursery = `
<defs>
<linearGradient id="nu-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#241c38"/><stop offset="100%" stop-color="#0c0814"/>
</linearGradient>
<linearGradient id="nu-eastwall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a0a22"/><stop offset="100%" stop-color="#080410"/>
</linearGradient>
<linearGradient id="nu-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#140818"/><stop offset="100%" stop-color="#040210"/>
</linearGradient>
<radialGradient id="nu-nightlight" cx="50%" cy="50%" r="60%">
<stop offset="0%" stop-color="#8a4060" stop-opacity="0.3"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<pattern id="nu-paper" x="0" y="0" width="18" height="24" patternUnits="userSpaceOnUse">
<circle cx="9" cy="12" r="1.5" fill="#4a2838" opacity="0.3"/>
<path d="M 9 6 L 12 12 L 9 18 L 6 12 Z" fill="none" stroke="#4a2838" stroke-width="0.3" opacity="0.35"/>
</pattern>
</defs>
<rect width="320" height="180" fill="url(#nu-wall)"/>
<rect width="320" height="140" fill="url(#nu-paper)"/>
<ellipse cx="160" cy="80" rx="180" ry="80" fill="url(#nu-nightlight)"/>
<rect x="232" y="0" width="88" height="140" fill="url(#nu-eastwall)"/>
<path d="M 232 0 L 232 140" stroke="#050308" stroke-width="2"/>
<g stroke="#7a2838" stroke-width="1" fill="none" opacity="0.85">
<path d="M 240 24 L 258 64"/><path d="M 246 22 L 262 66"/>
<path d="M 252 20 L 266 68"/><path d="M 258 24 L 270 68"/>
<path d="M 272 38 L 286 78"/><path d="M 278 40 L 290 78"/>
<path d="M 284 42 L 294 80"/>
<path d="M 250 88 L 272 124"/><path d="M 256 90 L 278 124"/>
<path d="M 262 92 L 282 124"/>
</g>
<g fill="#2a0a14" opacity="0.6">
<circle cx="248" cy="50" r="1.5"/><circle cx="264" cy="58" r="1.2"/>
<circle cx="278" cy="62" r="1"/><circle cx="260" cy="110" r="1.5"/>
</g>
<rect x="0" y="140" width="320" height="40" fill="url(#nu-floor)"/>
<g opacity="0.4" stroke="#1a0818" stroke-width="0.3">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<ellipse cx="64" cy="142" rx="30" ry="5" fill="#000" opacity="0.55"/>
<!-- nursery rocking chair: tall slatted back, seat, legs, curved rockers -->
<g stroke="#1a0a04" stroke-width="0.5">
<!-- curved back frame -->
<path d="M 50 132 Q 46 100 54 78 Q 64 72 74 78 Q 82 100 78 132 Z" fill="#3a1a08"/>
<!-- vertical back slats -->
<g stroke="#1a0a04" stroke-width="0.6" fill="none">
<path d="M 56 130 Q 53 104 58 82"/>
<path d="M 64 130 Q 64 102 64 80"/>
<path d="M 72 130 Q 75 104 70 82"/>
</g>
<!-- top crest -->
<path d="M 50 80 Q 64 70 78 80 Q 64 84 50 80 Z" fill="#2a1006"/>
<!-- seat -->
<path d="M 44 130 L 84 130 L 80 138 L 48 138 Z" fill="#2a1006"/>
<!-- front + back legs -->
<rect x="48" y="136" width="3" height="10" fill="#2a1006"/>
<rect x="77" y="136" width="3" height="10" fill="#2a1006"/>
</g>
<!-- curved rockers -->
<path d="M 40 148 Q 64 152 88 148" stroke="#3a1a08" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M 40 148 Q 38 144 44 142" stroke="#3a1a08" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M 88 148 Q 90 144 84 142" stroke="#3a1a08" stroke-width="2" fill="none" stroke-linecap="round"/>
<ellipse cx="130" cy="140" rx="14" ry="4" fill="#000" opacity="0.5"/>
<circle cx="130" cy="130" r="10" fill="#6a2830"/>
<circle cx="130" cy="130" r="10" fill="none" stroke="#4a1a20" stroke-width="0.5"/>
<path d="M 130 120 Q 125 116 130 114 Q 135 116 130 120" fill="#8a3848"/>
<ellipse cx="182" cy="140" rx="16" ry="3" fill="#000" opacity="0.5"/>
<rect x="170" y="118" width="24" height="22" fill="#2a1a08" stroke="#1a0e04" stroke-width="0.5"/>
<rect x="172" y="120" width="20" height="18" fill="#1a0e04"/>
<rect x="173" y="121" width="4" height="16" fill="#4a3020"/>
<rect x="181" y="121" width="4" height="16" fill="#4a3020"/>
<rect x="189" y="121" width="4" height="16" fill="#4a3020"/>
<circle cx="208" cy="138" r="2.5" fill="#e8e0c8"/>
<circle cx="208" cy="138" r="2.5" fill="none" stroke="#ffffff" stroke-width="0.4" opacity="0.7"/>
<circle cx="208" cy="138" r="1" fill="#ffffff" opacity="0.8"/>
<rect width="320" height="180" fill="url(#vign-nu)"/>
<defs><radialGradient id="vign-nu" cx="50%" cy="55%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
`;

ROOM_SVG.master = `
<defs>
<linearGradient id="ma-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1c1428"/><stop offset="100%" stop-color="#0a0610"/>
</linearGradient>
<linearGradient id="ma-eastwall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#140816"/><stop offset="100%" stop-color="#060208"/>
</linearGradient>
<linearGradient id="ma-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0612"/><stop offset="100%" stop-color="#020106"/>
</linearGradient>
<radialGradient id="ma-lamp" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#e0a048" stop-opacity="0.5"/>
<stop offset="60%" stop-color="#6a2830" stop-opacity="0.2"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ma-bedframe" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a1a20"/><stop offset="100%" stop-color="#140408"/>
</linearGradient>
<linearGradient id="ma-quilt" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#5a2030"/><stop offset="100%" stop-color="#2a0814"/>
</linearGradient>
</defs>
<rect width="320" height="180" fill="url(#ma-wall)"/>
<rect x="232" y="0" width="88" height="140" fill="url(#ma-eastwall)"/>
<path d="M 232 0 L 232 140" stroke="#06040a" stroke-width="2"/>
<g opacity="0.3" stroke="#1a0a18" stroke-width="0.3">
<rect x="234" y="14" width="80" height="28" fill="none"/><rect x="234" y="44" width="80" height="28" fill="none"/>
<rect x="234" y="74" width="80" height="28" fill="none"/><rect x="234" y="104" width="80" height="28" fill="none"/>
</g>
<rect x="0" y="140" width="320" height="40" fill="url(#ma-floor)"/>
<g opacity="0.4" stroke="#1a0a18" stroke-width="0.3">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<ellipse cx="120" cy="108" rx="100" ry="24" fill="#000" opacity="0.5"/>
<path d="M 28 30 L 28 140 L 34 140 L 34 28 Z" fill="url(#ma-bedframe)"/>
<path d="M 212 30 L 212 140 L 218 140 L 218 28 Z" fill="url(#ma-bedframe)"/>
<path d="M 28 28 L 34 28 L 34 22 L 28 22 Z M 212 28 L 218 28 L 218 22 L 212 22 Z" fill="#5a2830"/>
<circle cx="31" cy="20" r="3" fill="#6a3040"/><circle cx="215" cy="20" r="3" fill="#6a3040"/>
<rect x="28" y="30" width="190" height="6" fill="url(#ma-bedframe)"/>
<path d="M 34 70 L 212 70 L 212 140 L 34 140 Z" fill="url(#ma-quilt)"/>
<path d="M 34 70 L 212 70 L 212 75 L 34 75 Z" fill="#3a0c18"/>
<path d="M 40 78 L 206 78 M 40 92 L 206 92 M 40 106 L 206 106" stroke="#2a0614" stroke-width="0.4" opacity="0.6"/>
<path d="M 60 78 Q 70 90 60 102 Q 80 92 70 105" stroke="#6a2838" stroke-width="0.5" fill="none" opacity="0.5"/>
<path d="M 140 80 Q 150 92 140 104 Q 160 94 150 107" stroke="#6a2838" stroke-width="0.5" fill="none" opacity="0.5"/>
<rect x="34" y="132" width="178" height="14" fill="#1a0610" stroke="#2a0614" stroke-width="0.5"/>
<ellipse cx="260" cy="100" rx="36" ry="44" fill="url(#ma-lamp)"/>
<rect x="250" y="70" width="20" height="60" fill="#3a1a20"/>
<rect x="246" y="66" width="28" height="10" fill="#5a2828"/>
<rect x="254" y="128" width="12" height="10" fill="#2a1418"/>
<g opacity="0.6" stroke="#2a1420" stroke-width="0.3" fill="none">
<path d="M 244 30 Q 254 40 244 50 Q 234 60 244 70"/>
<path d="M 308 30 Q 298 45 308 60 Q 318 75 308 90"/>
</g>
<rect width="320" height="180" fill="url(#vign-ma)"/>
<defs><radialGradient id="vign-ma" cx="50%" cy="50%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.8"/></radialGradient></defs>
`;

ROOM_SVG.upstairs_hall = `
<defs>
<linearGradient id="uh-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1420"/><stop offset="100%" stop-color="#06040c"/>
</linearGradient>
<linearGradient id="uh-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0812"/><stop offset="100%" stop-color="#020206"/>
</linearGradient>
<radialGradient id="uh-sconce" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#ffc870" stop-opacity="0.7"/>
<stop offset="50%" stop-color="#8a4018" stop-opacity="0.2"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="uh-far" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#3a2030" stop-opacity="0.8"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#uh-wall)"/>
<path d="M 0 0 L 320 0 L 280 140 L 40 140 Z" fill="url(#uh-wall)"/>
<path d="M 0 140 L 320 140 L 320 180 L 0 180 Z" fill="url(#uh-floor)"/>
<path d="M 40 140 L 280 140" stroke="#06040c" stroke-width="1.5"/>
<path d="M 134 20 L 186 20 L 180 140 L 140 140 Z" fill="#3a1810" opacity="0.6"/>
<path d="M 138 26 L 182 26 L 178 134 L 142 134 Z" fill="#2a0e08" opacity="0.5"/>
<g fill="#08060c">
<rect x="46" y="36" width="22" height="88"/>
<rect x="88" y="42" width="18" height="82"/>
<rect x="214" y="42" width="18" height="82"/>
<rect x="252" y="36" width="22" height="88"/>
</g>
<g stroke="#2a1828" stroke-width="0.4" fill="none" opacity="0.7">
<rect x="46" y="36" width="22" height="88"/>
<rect x="88" y="42" width="18" height="82"/>
<rect x="214" y="42" width="18" height="82"/>
<rect x="252" y="36" width="22" height="88"/>
</g>
<g fill="#6a4028">
<rect x="54" y="74" width="6" height="3"/><rect x="94" y="78" width="5" height="3"/>
<rect x="220" y="78" width="5" height="3"/><rect x="260" y="74" width="6" height="3"/>
</g>
<ellipse cx="14" cy="68" rx="16" ry="20" fill="url(#uh-sconce)"/>
<rect x="10" y="58" width="8" height="20" fill="#2a1a10"/>
<rect x="12" y="56" width="4" height="5" fill="#ffc870" opacity="0.9"/>
<ellipse cx="306" cy="68" rx="16" ry="20" fill="url(#uh-sconce)"/>
<rect x="302" y="58" width="8" height="20" fill="#2a1a10"/>
<rect x="304" y="56" width="4" height="5" fill="#ffc870" opacity="0.9"/>
<ellipse cx="160" cy="78" rx="30" ry="18" fill="url(#uh-far)"/>
<path d="M 158 78 L 158 95 L 155 110 L 165 110 L 162 95 L 162 78 Z" fill="#1a0e16" opacity="0.6"/>
<circle cx="160" cy="74" r="3" fill="#2a1820" opacity="0.8"/>
<rect width="320" height="180" fill="url(#vign-uh)"/>
<defs><radialGradient id="vign-uh" cx="50%" cy="50%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.85"/></radialGradient></defs>
`;

ROOM_SVG.conservatory = `
<defs>
<linearGradient id="co-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a0e14"/><stop offset="70%" stop-color="#080a10"/>
<stop offset="100%" stop-color="#050608"/>
</linearGradient>
<linearGradient id="co-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0a100c"/><stop offset="100%" stop-color="#040604"/>
</linearGradient>
<radialGradient id="co-moon" cx="50%" cy="40%" r="40%">
<stop offset="0%" stop-color="#d0e0f0" stop-opacity="0.35"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#co-sky)"/>
<ellipse cx="220" cy="30" rx="80" ry="40" fill="url(#co-moon)"/>
<rect x="0" y="140" width="320" height="40" fill="url(#co-floor)"/>
<g opacity="0.6" stroke="#2a3028" stroke-width="0.5">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<g stroke="#3a4438" stroke-width="1.5" fill="none">
<rect x="14" y="14" width="292" height="116"/>
<line x1="14" y1="70" x2="306" y2="70"/>
<line x1="68" y1="14" x2="68" y2="130"/><line x1="122" y1="14" x2="122" y2="130"/>
<line x1="176" y1="14" x2="176" y2="130"/><line x1="230" y1="14" x2="230" y2="130"/>
<line x1="284" y1="14" x2="284" y2="130"/>
</g>
<g fill="#101418" opacity="0.7">
<rect x="15" y="15" width="53" height="55"/><rect x="69" y="15" width="53" height="55"/>
<rect x="123" y="15" width="53" height="55"/><rect x="177" y="15" width="53" height="55"/>
<rect x="231" y="15" width="53" height="55"/>
<rect x="15" y="71" width="53" height="59"/><rect x="69" y="71" width="53" height="59"/>
<rect x="123" y="71" width="53" height="59"/><rect x="177" y="71" width="53" height="59"/>
<rect x="231" y="71" width="53" height="59"/>
</g>
<g opacity="0.4" stroke="#4a5448" stroke-width="0.3" fill="none">
<line x1="15" y1="30" x2="68" y2="30"/><line x1="15" y1="50" x2="68" y2="30"/>
<line x1="69" y1="40" x2="122" y2="25"/><line x1="123" y1="35" x2="176" y2="50"/>
<line x1="177" y1="45" x2="230" y2="30"/><line x1="231" y1="25" x2="284" y2="48"/>
<line x1="15" y1="100" x2="68" y2="85"/><line x1="69" y1="95" x2="122" y2="110"/>
<line x1="123" y1="90" x2="176" y2="108"/><line x1="177" y1="105" x2="230" y2="92"/>
</g>
<path d="M 85 25 L 115 25 L 115 55 L 105 55 L 105 72 L 95 72 L 95 55 L 85 55 Z" fill="#000" opacity="0.5"/>
<path d="M 87 27 L 113 27 L 113 53 L 103 53 L 103 70 L 97 70 L 97 53 L 87 53 Z" fill="#1a0604" opacity="0.6"/>
<g stroke="#1a2a1a" stroke-width="1.2" fill="none" opacity="0.85">
<path d="M 30 135 Q 38 110 32 90 Q 40 105 34 78"/>
<path d="M 34 135 Q 42 115 50 95"/>
<path d="M 88 138 Q 96 115 102 95 Q 108 108 104 85"/>
<path d="M 155 140 Q 162 118 170 100 Q 176 112 172 92"/>
<path d="M 215 138 Q 222 118 230 98"/>
<path d="M 275 138 Q 282 118 290 98 Q 296 110 292 88"/>
</g>
<g fill="#2a1a08" opacity="0.7">
<path d="M 28 138 L 50 138 L 48 148 L 30 148 Z"/>
<path d="M 90 140 L 112 140 L 110 150 L 92 150 Z"/>
<path d="M 160 142 L 182 142 L 180 152 L 162 152 Z"/>
<path d="M 220 140 L 242 140 L 240 150 L 222 150 Z"/>
<path d="M 278 140 L 300 140 L 298 150 L 280 150 Z"/>
</g>
<rect width="320" height="180" fill="url(#vign-co)"/>
<defs><radialGradient id="vign-co" cx="50%" cy="50%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.8"/></radialGradient></defs>
`;

ROOM_SVG.kitchen = `
<defs>
<linearGradient id="ki-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1c1c18"/><stop offset="100%" stop-color="#0c0c08"/>
</linearGradient>
<linearGradient id="ki-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0e0c08"/><stop offset="100%" stop-color="#040402"/>
</linearGradient>
<radialGradient id="ki-range" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#d06818" stop-opacity="0.4"/>
<stop offset="100%" stop-color="#1a0804" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ki-copper" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#8a4818"/><stop offset="100%" stop-color="#4a2408"/>
</linearGradient>
</defs>
<rect width="320" height="180" fill="url(#ki-wall)"/>
<rect x="0" y="140" width="320" height="40" fill="url(#ki-floor)"/>
<g opacity="0.4" stroke="#2a2018" stroke-width="0.4">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
</g>
<g opacity="0.3" stroke="#3a2a1a" stroke-width="0.3">
<line x1="0" y1="30" x2="320" y2="30"/><line x1="0" y1="50" x2="320" y2="50"/>
<line x1="0" y1="80" x2="320" y2="80"/><line x1="0" y1="110" x2="320" y2="110"/>
<line x1="40" y1="0" x2="40" y2="140"/><line x1="100" y1="0" x2="100" y2="140"/>
<line x1="160" y1="0" x2="160" y2="140"/><line x1="220" y1="0" x2="220" y2="140"/>
<line x1="280" y1="0" x2="280" y2="140"/>
</g>
<rect x="0" y="0" width="320" height="14" fill="url(#ki-copper)"/>
<path d="M 0 14 L 320 14" stroke="#1a0a04" stroke-width="1"/>
<g fill="url(#ki-copper)">
<ellipse cx="50" cy="22" rx="12" ry="6"/><ellipse cx="110" cy="22" rx="10" ry="6"/>
<ellipse cx="170" cy="22" rx="12" ry="6"/><ellipse cx="230" cy="22" rx="10" ry="6"/>
<ellipse cx="290" cy="22" rx="11" ry="6"/>
</g>
<ellipse cx="60" cy="115" rx="50" ry="32" fill="url(#ki-range)"/>
<rect x="18" y="58" width="84" height="88" fill="#080806" stroke="#2a2018" stroke-width="1"/>
<rect x="24" y="64" width="72" height="48" fill="#0a0a08" stroke="#1a1a14" stroke-width="0.5"/>
<circle cx="40" cy="82" r="7" fill="#4a2408"/>
<circle cx="40" cy="82" r="4" fill="#c46420" opacity="0.8"/>
<circle cx="80" cy="82" r="7" fill="#4a2408"/>
<circle cx="80" cy="82" r="4" fill="#c46420" opacity="0.8"/>
<circle cx="40" cy="102" r="7" fill="#2a1a08"/>
<circle cx="80" cy="102" r="7" fill="#2a1a08"/>
<rect x="24" y="118" width="72" height="22" fill="#0a0a08" stroke="#1a1a14" stroke-width="0.5"/>
<rect x="28" y="122" width="64" height="14" fill="#1a0a04"/>
<circle cx="36" cy="129" r="1.5" fill="#6a4020"/><circle cx="84" cy="129" r="1.5" fill="#6a4020"/>
<path d="M 140 56 L 140 140 L 280 140 L 280 56 Z" fill="#1a1a14" stroke="#2a2018" stroke-width="0.8"/>
<path d="M 140 56 L 280 56 L 280 62 L 140 62 Z" fill="#3a2a1a"/>
<line x1="210" y1="62" x2="210" y2="140" stroke="#0a0a08" stroke-width="1"/>
<rect x="148" y="70" width="54" height="32" fill="#0a0604" stroke="#1a1410" stroke-width="0.5"/>
<line x1="175" y1="72" x2="175" y2="100" stroke="#1a1410" stroke-width="0.4"/>
<rect x="218" y="70" width="54" height="32" fill="#0a0604" stroke="#1a1410" stroke-width="0.5"/>
<line x1="245" y1="72" x2="245" y2="100" stroke="#1a1410" stroke-width="0.4"/>
<rect x="148" y="108" width="124" height="28" fill="#0a0604" stroke="#1a1410" stroke-width="0.5"/>
<circle cx="196" cy="103" r="1" fill="#6a4020"/><circle cx="204" cy="103" r="1" fill="#6a4020"/>
<circle cx="242" cy="103" r="1" fill="#6a4020"/><circle cx="250" cy="103" r="1" fill="#6a4020"/>
<circle cx="210" cy="111" r="1.5" fill="#6a4020"/>
<rect width="320" height="180" fill="url(#vign-ki)"/>
<defs><radialGradient id="vign-ki" cx="50%" cy="50%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
`;

ROOM_SVG.dining = `
<defs>
<linearGradient id="di-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a1c12"/><stop offset="100%" stop-color="#120a04"/>
</linearGradient>
<linearGradient id="di-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1008"/><stop offset="100%" stop-color="#060402"/>
</linearGradient>
<radialGradient id="di-chand" cx="50%" cy="20%" r="55%">
<stop offset="0%" stop-color="#ffd480" stop-opacity="0.55"/>
<stop offset="50%" stop-color="#c46820" stop-opacity="0.15"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<linearGradient id="di-table" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a2414"/><stop offset="100%" stop-color="#1a0e06"/>
</linearGradient>
</defs>
<rect width="320" height="180" fill="url(#di-wall)"/>
<ellipse cx="160" cy="0" rx="200" ry="100" fill="url(#di-chand)"/>
<rect x="0" y="140" width="320" height="40" fill="url(#di-floor)"/>
<g opacity="0.5" stroke="#3a2010" stroke-width="0.5">
<line x1="0" y1="150" x2="320" y2="150"/><line x1="0" y1="162" x2="320" y2="162"/>
<line x1="0" y1="174" x2="320" y2="174"/>
</g>
<path d="M 40 34 L 280 34 L 278 46 L 42 46 Z" fill="#2a1a10"/>
<line x1="160" y1="34" x2="160" y2="68" stroke="#2a1a10" stroke-width="2"/>
<g fill="#ffd480" opacity="0.9">
<ellipse cx="110" cy="38" rx="5" ry="7"/><ellipse cx="140" cy="38" rx="5" ry="7"/>
<ellipse cx="180" cy="38" rx="5" ry="7"/><ellipse cx="210" cy="38" rx="5" ry="7"/>
</g>
<g fill="#ffffff" opacity="0.95">
<circle cx="110" cy="32" r="1.5"/><circle cx="140" cy="32" r="1.5"/>
<circle cx="180" cy="32" r="1.5"/><circle cx="210" cy="32" r="1.5"/>
</g>
<path d="M 28 86 L 292 90 L 292 108 L 28 104 Z" fill="url(#di-table)" stroke="#4a3018" stroke-width="0.8"/>
<path d="M 28 86 L 292 90 L 296 96 L 26 92 Z" fill="#4a2e18"/>
<rect x="38" y="108" width="6" height="32" fill="#2a1a10"/>
<rect x="278" y="108" width="6" height="32" fill="#2a1a10"/>
<g fill="#1a0e06">
<path d="M 56 76 L 64 76 L 66 88 L 54 88 Z"/><rect x="55" y="88" width="10" height="22"/>
<path d="M 96 76 L 104 76 L 106 88 L 94 88 Z"/><rect x="95" y="88" width="10" height="22"/>
<path d="M 136 76 L 144 76 L 146 88 L 134 88 Z"/><rect x="135" y="88" width="10" height="22"/>
<path d="M 176 76 L 184 76 L 186 88 L 174 88 Z"/><rect x="175" y="88" width="10" height="22"/>
<path d="M 216 76 L 224 76 L 226 88 L 214 88 Z"/><rect x="215" y="88" width="10" height="22"/>
<path d="M 256 76 L 264 76 L 266 88 L 254 88 Z"/><rect x="255" y="88" width="10" height="22"/>
</g>
<g fill="#3a2010" opacity="0.8">
<rect x="54" y="108" width="12" height="30"/><rect x="94" y="108" width="12" height="30"/>
<rect x="134" y="108" width="12" height="30"/><rect x="174" y="108" width="12" height="30"/>
<rect x="214" y="108" width="12" height="30"/><rect x="254" y="108" width="12" height="30"/>
</g>
<g fill="#8a5a20" opacity="0.7">
<circle cx="80" cy="94" r="3"/><circle cx="120" cy="94" r="3"/>
<circle cx="200" cy="94" r="3"/><circle cx="240" cy="94" r="3"/>
</g>
<rect width="320" height="180" fill="url(#vign-di)"/>
<defs><radialGradient id="vign-di" cx="50%" cy="55%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
`;

ROOM_SVG.library = `
<defs>
<linearGradient id="lb-wall" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a2010"/><stop offset="100%" stop-color="#120a04"/>
</linearGradient>
<linearGradient id="lb-floor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a1006"/><stop offset="100%" stop-color="#060402"/>
</linearGradient>
<radialGradient id="lb-lamp" cx="50%" cy="40%" r="55%">
<stop offset="0%" stop-color="#ffd080" stop-opacity="0.7"/>
<stop offset="60%" stop-color="#c47018" stop-opacity="0.2"/>
<stop offset="100%" stop-color="#3a1004" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="320" height="180" fill="url(#lb-wall)"/>
<rect x="0" y="130" width="320" height="50" fill="url(#lb-floor)"/>
<rect x="6" y="14" width="96" height="116" fill="#0a0604" stroke="#3a2410" stroke-width="0.8"/>
<rect x="218" y="14" width="96" height="116" fill="#0a0604" stroke="#3a2410" stroke-width="0.8"/>
<g stroke="#3a2410" stroke-width="0.5" fill="none">
<line x1="6" y1="34" x2="102" y2="34"/><line x1="6" y1="54" x2="102" y2="54"/>
<line x1="6" y1="74" x2="102" y2="74"/><line x1="6" y1="94" x2="102" y2="94"/>
<line x1="6" y1="114" x2="102" y2="114"/>
<line x1="218" y1="34" x2="314" y2="34"/><line x1="218" y1="54" x2="314" y2="54"/>
<line x1="218" y1="74" x2="314" y2="74"/><line x1="218" y1="94" x2="314" y2="94"/>
<line x1="218" y1="114" x2="314" y2="114"/>
</g>
<g>
<rect x="10" y="18" width="4" height="14" fill="#6a3012"/><rect x="16" y="18" width="3" height="14" fill="#4a2010"/>
<rect x="22" y="18" width="5" height="14" fill="#3a1808"/><rect x="30" y="18" width="3" height="14" fill="#6a3012"/>
<rect x="36" y="18" width="4" height="14" fill="#2a1408"/><rect x="44" y="18" width="3" height="14" fill="#4a2010"/>
<rect x="50" y="18" width="5" height="14" fill="#6a3012"/><rect x="58" y="18" width="3" height="14" fill="#3a1808"/>
<rect x="64" y="18" width="4" height="14" fill="#2a1408"/><rect x="72" y="18" width="3" height="14" fill="#6a3012"/>
<rect x="78" y="18" width="5" height="14" fill="#4a2010"/><rect x="86" y="18" width="3" height="14" fill="#3a1808"/>
<rect x="92" y="18" width="4" height="14" fill="#6a3012"/>
<rect x="10" y="38" width="5" height="14" fill="#4a2010"/><rect x="18" y="38" width="3" height="14" fill="#6a3012"/>
<rect x="24" y="38" width="4" height="14" fill="#2a1408"/><rect x="32" y="38" width="3" height="14" fill="#6a3012"/>
<rect x="38" y="38" width="5" height="14" fill="#3a1808"/><rect x="46" y="38" width="3" height="14" fill="#4a2010"/>
<rect x="52" y="38" width="4" height="14" fill="#6a3012"/><rect x="60" y="38" width="3" height="14" fill="#2a1408"/>
<rect x="66" y="38" width="5" height="14" fill="#4a2010"/><rect x="74" y="38" width="3" height="14" fill="#6a3012"/>
<rect x="82" y="38" width="4" height="14" fill="#3a1808"/><rect x="90" y="38" width="3" height="14" fill="#4a2010"/>
<rect x="10" y="58" width="3" height="14" fill="#6a3012"/><rect x="16" y="58" width="5" height="14" fill="#3a1808"/>
<rect x="24" y="58" width="4" height="14" fill="#4a2010"/><rect x="32" y="58" width="3" height="14" fill="#6a3012"/>
<rect x="38" y="58" width="5" height="14" fill="#2a1408"/><rect x="46" y="58" width="3" height="14" fill="#4a2010"/>
<rect x="54" y="58" width="4" height="14" fill="#6a3012"/><rect x="62" y="58" width="3" height="14" fill="#3a1808"/>
<rect x="68" y="58" width="5" height="14" fill="#4a2010"/><rect x="76" y="58" width="3" height="14" fill="#6a3012"/>
<rect x="84" y="58" width="4" height="14" fill="#2a1408"/><rect x="92" y="58" width="3" height="14" fill="#4a2010"/>
<rect x="10" y="78" width="5" height="14" fill="#6a3012"/><rect x="18" y="78" width="3" height="14" fill="#4a2010"/>
<rect x="24" y="78" width="4" height="14" fill="#3a1808"/><rect x="32" y="78" width="3" height="14" fill="#6a3012"/>
<rect x="38" y="78" width="5" height="14" fill="#2a1408"/><rect x="46" y="78" width="3" height="14" fill="#4a2010"/>
<rect x="52" y="78" width="4" height="14" fill="#6a3012"/><rect x="60" y="78" width="3" height="14" fill="#3a1808"/>
<rect x="66" y="78" width="5" height="14" fill="#4a2010"/><rect x="74" y="78" width="3" height="14" fill="#6a3012"/>
<rect x="82" y="78" width="4" height="14" fill="#2a1408"/><rect x="90" y="78" width="3" height="14" fill="#4a2010"/>
<rect x="10" y="98" width="4" height="14" fill="#4a2010"/><rect x="16" y="98" width="3" height="14" fill="#6a3012"/>
<rect x="22" y="98" width="5" height="14" fill="#3a1808"/><rect x="30" y="98" width="3" height="14" fill="#2a1408"/>
<rect x="36" y="98" width="4" height="14" fill="#6a3012"/><rect x="44" y="98" width="3" height="14" fill="#4a2010"/>
<rect x="50" y="98" width="5" height="14" fill="#3a1808"/><rect x="58" y="98" width="3" height="14" fill="#6a3012"/>
<rect x="64" y="98" width="4" height="14" fill="#2a1408"/><rect x="72" y="98" width="3" height="14" fill="#4a2010"/>
<rect x="78" y="98" width="5" height="14" fill="#6a3012"/><rect x="86" y="98" width="3" height="14" fill="#3a1808"/>
<rect x="92" y="98" width="4" height="14" fill="#4a2010"/>
<rect x="222" y="18" width="4" height="14" fill="#6a3012"/><rect x="228" y="18" width="3" height="14" fill="#4a2010"/>
<rect x="234" y="18" width="5" height="14" fill="#3a1808"/><rect x="242" y="18" width="3" height="14" fill="#6a3012"/>
<rect x="248" y="18" width="4" height="14" fill="#2a1408"/><rect x="256" y="18" width="3" height="14" fill="#4a2010"/>
<rect x="262" y="18" width="5" height="14" fill="#6a3012"/><rect x="270" y="18" width="3" height="14" fill="#3a1808"/>
<rect x="276" y="18" width="4" height="14" fill="#2a1408"/><rect x="284" y="18" width="3" height="14" fill="#6a3012"/>
<rect x="290" y="18" width="5" height="14" fill="#4a2010"/><rect x="298" y="18" width="3" height="14" fill="#3a1808"/>
<rect x="304" y="18" width="4" height="14" fill="#6a3012"/>
<rect x="222" y="38" width="5" height="14" fill="#4a2010"/><rect x="230" y="38" width="3" height="14" fill="#6a3012"/>
<rect x="236" y="38" width="4" height="14" fill="#2a1408"/><rect x="244" y="38" width="3" height="14" fill="#6a3012"/>
<rect x="250" y="38" width="5" height="14" fill="#3a1808"/><rect x="258" y="38" width="3" height="14" fill="#4a2010"/>
<rect x="264" y="38" width="4" height="14" fill="#6a3012"/><rect x="272" y="38" width="3" height="14" fill="#2a1408"/>
<rect x="278" y="38" width="5" height="14" fill="#4a2010"/><rect x="286" y="38" width="3" height="14" fill="#6a3012"/>
<rect x="292" y="38" width="4" height="14" fill="#3a1808"/><rect x="300" y="38" width="3" height="14" fill="#4a2010"/>
<rect x="222" y="58" width="3" height="14" fill="#6a3012"/><rect x="228" y="58" width="5" height="14" fill="#3a1808"/>
<rect x="236" y="58" width="4" height="14" fill="#4a2010"/><rect x="244" y="58" width="3" height="14" fill="#6a3012"/>
<rect x="250" y="58" width="5" height="14" fill="#2a1408"/><rect x="258" y="58" width="3" height="14" fill="#4a2010"/>
<rect x="266" y="58" width="4" height="14" fill="#6a3012"/><rect x="274" y="58" width="3" height="14" fill="#3a1808"/>
<rect x="280" y="58" width="5" height="14" fill="#4a2010"/><rect x="288" y="58" width="3" height="14" fill="#6a3012"/>
<rect x="296" y="58" width="4" height="14" fill="#2a1408"/><rect x="304" y="58" width="3" height="14" fill="#4a2010"/>
</g>
<ellipse cx="160" cy="118" rx="70" ry="14" fill="url(#lb-lamp)"/>
<path d="M 118 90 L 202 90 L 210 130 L 110 130 Z" fill="#2a1808" stroke="#3a2010" stroke-width="0.5"/>
<rect x="118" y="90" width="84" height="5" fill="#3a2010"/>
<rect x="140" y="98" width="40" height="28" fill="#1a0e06" stroke="#3a2010" stroke-width="0.5"/>
<ellipse cx="160" cy="102" rx="6" ry="2" fill="#ffd480" opacity="0.5"/>
<path d="M 155 82 L 165 82 L 168 92 L 152 92 Z" fill="#2a1808"/>
<rect x="158" y="70" width="4" height="14" fill="#d4a870"/>
<rect x="157" y="66" width="6" height="6" fill="#ffd480" opacity="0.9"/>
<ellipse cx="160" cy="60" rx="14" ry="10" fill="url(#lb-lamp)"/>
<rect width="320" height="180" fill="url(#vign-lb)"/>
<defs><radialGradient id="vign-lb" cx="50%" cy="60%" r="55%"><stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
<rect width="320" height="180" fill="#1a1408"/>
<rect x="0" y="130" width="320" height="50" fill="#0e0a04"/>
<rect x="10" y="20" width="90" height="110" fill="#0a0604"/>
<rect x="10" y="30" width="90" height="6" fill="#2a1a10"/>
<rect x="10" y="50" width="90" height="6" fill="#2a1a10"/>
<rect x="10" y="70" width="90" height="6" fill="#2a1a10"/>
<rect x="10" y="90" width="90" height="6" fill="#2a1a10"/>
<rect x="10" y="110" width="90" height="6" fill="#2a1a10"/>
<g fill="#6a3a1a">
<rect x="14" y="32" width="4" height="16"/><rect x="20" y="32" width="4" height="16"/><rect x="26" y="32" width="4" height="16"/>
<rect x="14" y="52" width="4" height="16"/><rect x="22" y="52" width="4" height="16"/><rect x="32" y="52" width="4" height="16"/>
<rect x="16" y="72" width="4" height="16"/><rect x="24" y="72" width="4" height="16"/><rect x="38" y="72" width="4" height="16"/>
<rect x="14" y="92" width="4" height="16"/><rect x="22" y="92" width="4" height="16"/><rect x="30" y="92" width="4" height="16"/>
</g>
<rect x="220" y="20" width="90" height="110" fill="#0a0604"/>
<g fill="#5a2a1a">
<rect x="225" y="32" width="4" height="16"/><rect x="233" y="32" width="4" height="16"/>
<rect x="223" y="52" width="4" height="16"/><rect x="235" y="52" width="4" height="16"/>
</g>
<path d="M 140 80 L 140 130 L 200 130 L 200 80 Z" fill="#2a1808"/>
<rect x="145" y="90" width="50" height="4" fill="#0a0604"/>
<circle cx="170" cy="100" r="3" fill="#e8a848" opacity="0.7"/>
`;

ROOM_SVG.parlor = `
<defs>
  <linearGradient id="pa-wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3a1418"/>
    <stop offset="60%" stop-color="#24080c"/>
    <stop offset="100%" stop-color="#140408"/>
  </linearGradient>
  <linearGradient id="pa-wallpaper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5a1a20" stop-opacity="0.1"/>
    <stop offset="100%" stop-color="#3a0c12" stop-opacity="0.3"/>
  </linearGradient>
  <linearGradient id="pa-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1a0608"/>
    <stop offset="100%" stop-color="#080204"/>
  </linearGradient>
  <radialGradient id="pa-candle" cx="50%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#ffd480" stop-opacity="0.85"/>
    <stop offset="50%" stop-color="#d06828" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#3a1008" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="pa-sofa" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5a1a28"/>
    <stop offset="100%" stop-color="#2a0810"/>
  </linearGradient>
  <pattern id="pa-damask" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="2" fill="#5a1a20" opacity="0.2"/>
    <path d="M 10 4 L 14 10 L 10 16 L 6 10 Z" fill="none" stroke="#5a1a20" stroke-width="0.3" opacity="0.25"/>
  </pattern>
</defs>
<rect width="320" height="180" fill="url(#pa-wall)"/>
<rect width="320" height="130" fill="url(#pa-damask)"/>
<rect width="320" height="130" fill="url(#pa-wallpaper)"/>
<rect x="0" y="130" width="320" height="50" fill="url(#pa-floor)"/>
<g opacity="0.4" stroke="#2a0810" stroke-width="0.5">
<line x1="0" y1="144" x2="320" y2="144"/><line x1="0" y1="158" x2="320" y2="158"/>
</g>
<rect x="38" y="38" width="70" height="90" fill="#1a0608" stroke="#3a1a18" stroke-width="1"/>
<rect x="42" y="42" width="62" height="82" fill="#0a0204"/>
<rect x="42" y="42" width="62" height="82" fill="url(#pa-candle)" opacity="0.15"/>
<g opacity="0.5" fill="none" stroke="#6a3020" stroke-width="0.6">
<ellipse cx="73" cy="65" rx="16" ry="20"/>
<circle cx="73" cy="60" r="5"/>
<path d="M 65 85 Q 73 100 81 85"/>
</g>
<rect x="38" y="38" width="70" height="6" fill="#3a1a18"/>
<rect x="38" y="124" width="70" height="5" fill="#3a1a18"/>
<path d="M 170 70 Q 170 60 178 60 L 254 60 Q 262 60 262 70 L 262 130 L 170 130 Z" fill="url(#pa-sofa)"/>
<path d="M 170 70 L 262 70 L 262 130 L 170 130 Z" fill="url(#pa-sofa)" opacity="0.8"/>
<ellipse cx="216" cy="110" rx="40" ry="4" fill="#000" opacity="0.4"/>
<rect x="180" y="100" width="18" height="22" rx="2" fill="#6a2028" stroke="#2a0810" stroke-width="0.5"/>
<rect x="202" y="100" width="18" height="22" rx="2" fill="#6a2028" stroke="#2a0810" stroke-width="0.5"/>
<rect x="224" y="100" width="18" height="22" rx="2" fill="#6a2028" stroke="#2a0810" stroke-width="0.5"/>
<rect x="246" y="100" width="14" height="22" rx="2" fill="#6a2028" stroke="#2a0810" stroke-width="0.5"/>
<rect x="174" y="126" width="6" height="6" fill="#1a0608"/>
<rect x="252" y="126" width="6" height="6" fill="#1a0608"/>
<ellipse cx="135" cy="95" rx="18" ry="22" fill="url(#pa-candle)"/>
<rect x="132" y="78" width="6" height="20" fill="#d4a870"/>
<rect x="133" y="74" width="4" height="6" fill="#ffd480" opacity="0.9"/>
<ellipse cx="135" cy="98" rx="8" ry="2" fill="#1a0608"/>
<rect width="320" height="180" fill="url(#vign-pa)"/>
<defs><radialGradient id="vign-pa" cx="50%" cy="55%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.7"/></radialGradient></defs>
`;

ROOM_SVG.entry_hall = `
<defs>
  <linearGradient id="eh-wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2a1a12"/>
    <stop offset="50%" stop-color="#1a100a"/>
    <stop offset="100%" stop-color="#0e0804"/>
  </linearGradient>
  <linearGradient id="eh-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1a0c06"/>
    <stop offset="100%" stop-color="#060402"/>
  </linearGradient>
  <radialGradient id="eh-chandelier" cx="50%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#e8a848" stop-opacity="0.4"/>
    <stop offset="60%" stop-color="#8a4818" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="eh-sconce" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffc870" stop-opacity="0.9"/>
    <stop offset="60%" stop-color="#c47828" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#3a1808" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="eh-door" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1a0a04"/>
    <stop offset="100%" stop-color="#2a1408"/>
  </linearGradient>
</defs>
<rect width="320" height="180" fill="url(#eh-wall)"/>
<ellipse cx="160" cy="0" rx="180" ry="90" fill="url(#eh-chandelier)"/>
<path d="M 0 130 L 320 130 L 320 180 L 0 180 Z" fill="url(#eh-floor)"/>
<g opacity="0.3" stroke="#3a2820" stroke-width="0.5">
<line x1="0" y1="140" x2="320" y2="140"/><line x1="0" y1="152" x2="320" y2="152"/>
<line x1="0" y1="164" x2="320" y2="164"/>
</g>
<rect x="40" y="30" width="36" height="100" fill="#1a100a" stroke="#3a2820" stroke-width="0.5"/>
<rect x="244" y="30" width="36" height="100" fill="#1a100a" stroke="#3a2820" stroke-width="0.5"/>
<rect x="128" y="28" width="64" height="102" fill="url(#eh-door)" stroke="#3a2820" stroke-width="0.5"/>
<rect x="132" y="32" width="56" height="94" fill="#0a0604"/>
<rect x="134" y="34" width="26" height="42" fill="#1a0c04" stroke="#2a1408" stroke-width="0.5"/>
<rect x="162" y="34" width="26" height="42" fill="#1a0c04" stroke="#2a1408" stroke-width="0.5"/>
<rect x="134" y="78" width="26" height="46" fill="#1a0c04" stroke="#2a1408" stroke-width="0.5"/>
<rect x="162" y="78" width="26" height="46" fill="#1a0c04" stroke="#2a1408" stroke-width="0.5"/>
<circle cx="180" cy="82" r="1.5" fill="#a08068"/>
<ellipse cx="18" cy="70" rx="20" ry="22" fill="url(#eh-sconce)"/>
<rect x="14" y="60" width="10" height="18" fill="#3a2418"/>
<rect x="16" y="58" width="6" height="6" fill="#ffc870" opacity="0.8"/>
<ellipse cx="302" cy="70" rx="20" ry="22" fill="url(#eh-sconce)"/>
<rect x="296" y="60" width="10" height="18" fill="#3a2418"/>
<rect x="298" y="58" width="6" height="6" fill="#ffc870" opacity="0.8"/>
<path d="M 90 130 Q 90 94 125 94 L 125 100 Q 98 100 98 130 Z" fill="#2a1a10"/>
<path d="M 90 130 L 125 130 L 125 100 L 98 100 L 98 130 Z" fill="#1a0e08"/>
<g stroke="#3a2418" stroke-width="0.5" opacity="0.7">
<line x1="92" y1="112" x2="120" y2="112"/>
<line x1="92" y1="120" x2="120" y2="120"/>
</g>
<rect width="320" height="180" fill="url(#vign-eh)"/>
<defs><radialGradient id="vign-eh" cx="50%" cy="55%" r="55%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.7"/></radialGradient></defs>
`;

ROOM_SVG.drive = `
<defs>
  <radialGradient id="drive-moon" cx="50%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#f4e4c0" stop-opacity="0.9"/>
    <stop offset="30%" stop-color="#d4b888" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="#080410" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="drive-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0a0612"/>
    <stop offset="60%" stop-color="#0e0818"/>
    <stop offset="100%" stop-color="#1a0e18"/>
  </linearGradient>
  <linearGradient id="drive-house" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0a0404"/>
    <stop offset="100%" stop-color="#1a0c08"/>
  </linearGradient>
  <radialGradient id="drive-window" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#e8a848" stop-opacity="0.8"/>
    <stop offset="70%" stop-color="#8a4818" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#3a1808" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="drive-porch" cx="50%" cy="60%" r="60%">
    <stop offset="0%" stop-color="#c47828" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#3a1808" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="320" height="180" fill="url(#drive-sky)"/>
<circle cx="235" cy="30" r="36" fill="url(#drive-moon)"/>
<circle cx="235" cy="30" r="10" fill="#f4e4c0" opacity="0.85"/>
<g fill="#e8d0a0" opacity="0.7">
<circle cx="30" cy="20" r="0.8"/><circle cx="80" cy="35" r="0.6"/>
<circle cx="130" cy="18" r="0.9"/><circle cx="180" cy="28" r="0.5"/>
<circle cx="280" cy="55" r="0.7"/><circle cx="60" cy="60" r="0.5"/>
<circle cx="100" cy="12" r="0.5"/><circle cx="200" cy="40" r="0.6"/>
<circle cx="300" cy="25" r="0.4"/>
</g>
<path d="M 0 100 Q 40 80 70 95 Q 100 70 140 85 Q 180 65 220 80 Q 260 70 320 85 L 320 130 L 0 130 Z" fill="#04020a" opacity="0.7"/>
<path d="M 0 130 L 320 130 L 320 180 L 0 180 Z" fill="url(#drive-house)"/>
<path d="M 90 50 L 135 20 L 185 20 L 230 50 L 230 130 L 90 130 Z" fill="url(#drive-house)"/>
<path d="M 85 52 L 135 20 L 185 20 L 235 52" stroke="#2a1a10" stroke-width="1" fill="none"/>
<rect x="110" y="65" width="14" height="24" fill="url(#drive-window)"/>
<rect x="110" y="65" width="14" height="24" fill="none" stroke="#2a1408" stroke-width="0.5"/>
<line x1="117" y1="65" x2="117" y2="89" stroke="#1a0c04" stroke-width="0.5"/>
<line x1="110" y1="77" x2="124" y2="77" stroke="#1a0c04" stroke-width="0.5"/>
<rect x="196" y="65" width="14" height="24" fill="url(#drive-window)"/>
<rect x="196" y="65" width="14" height="24" fill="none" stroke="#2a1408" stroke-width="0.5"/>
<line x1="203" y1="65" x2="203" y2="89" stroke="#1a0c04" stroke-width="0.5"/>
<line x1="196" y1="77" x2="210" y2="77" stroke="#1a0c04" stroke-width="0.5"/>
<ellipse cx="160" cy="120" rx="60" ry="14" fill="url(#drive-porch)"/>
<rect x="152" y="100" width="16" height="30" fill="#1a0a04"/>
<rect x="155" y="103" width="10" height="24" fill="url(#drive-window)" opacity="0.6"/>
<rect x="100" y="120" width="120" height="3" fill="#2a1810"/>
<g stroke="#1a0a08" stroke-width="0.5" fill="none" opacity="0.6">
<line x1="108" y1="123" x2="108" y2="130"/><line x1="118" y1="123" x2="118" y2="130"/>
<line x1="128" y1="123" x2="128" y2="130"/><line x1="200" y1="123" x2="200" y2="130"/>
<line x1="210" y1="123" x2="210" y2="130"/><line x1="220" y1="123" x2="220" y2="130"/>
</g>
<path d="M 130 180 L 160 135 L 190 180 Z" fill="#1a1008" opacity="0.8"/>
<g stroke="#2a1810" stroke-width="1" fill="none" opacity="0.5">
<path d="M 5 135 Q 15 120 10 100 Q 20 115 15 95"/>
<path d="M 300 140 Q 310 125 305 105 Q 315 120 310 100"/>
</g>
<rect width="320" height="180" fill="url(#vignette-drive)"/>
<defs><radialGradient id="vignette-drive" cx="50%" cy="50%" r="60%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.6"/></radialGradient></defs>
`;

