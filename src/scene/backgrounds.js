// Room backgrounds for "room" shots. Each is a 360x640 SVG plus a foreground
// layer (the bed or desk) drawn in front of the character.

const stars = (n, seed) => {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () =>
    `<circle class="star" cx="${(40 + rnd() * 120).toFixed(1)}" cy="${(60 + rnd() * 120).toFixed(1)}" r="${(0.8 + rnd() * 1.4).toFixed(1)}" fill="#fff"/>`
  ).join('');
};

const BACKGROUNDS = {
  'hall-night': {
    back: `
<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFD58A" stop-opacity="0.55"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="360" height="640" fill="#1C2547"/>
  <rect y="430" width="360" height="210" fill="#141B36"/>
  <rect x="28" y="48" width="150" height="150" rx="6" fill="#0B1230" stroke="#3A4778" stroke-width="6"/>
  <line x1="103" y1="48" x2="103" y2="198" stroke="#3A4778" stroke-width="4"/>
  <circle cx="146" cy="88" r="16" fill="#F5F0D8"/><circle cx="152" cy="83" r="14" fill="#0B1230"/>
  ${stars(14, 7)}
  <path d="M20 40 L60 40 L54 214 L20 214 Z" fill="#2E5D9F" opacity="0.9"/>
  <path d="M186 40 L150 40 L156 214 L186 214 Z" fill="#2E5D9F" opacity="0.9"/>
  <rect x="226" y="70" width="88" height="112" rx="4" fill="#E8481F" opacity="0.85" transform="rotate(4 270 126)"/>
  <text x="270" y="122" text-anchor="middle" font-family="Sora, sans-serif" font-size="13" font-weight="700" fill="#FAF7F2" transform="rotate(4 270 126)">CSE FEST</text>
  <text x="270" y="140" text-anchor="middle" font-family="Sora, sans-serif" font-size="10" fill="#FAF7F2" transform="rotate(4 270 126)">2026</text>
  <circle class="lamp-glow" cx="312" cy="300" r="90" fill="url(#lampGlow)"/>
  <path d="M296 284 L328 284 L320 262 L304 262 Z" fill="#F4C430"/>
  <rect x="309" y="284" width="6" height="60" fill="#5B6488"/>
  <rect x="270" y="340" width="90" height="12" fill="#5B4636"/>
</svg>`,
    front: `
<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M-10 470 C60 440 140 452 200 462 C260 470 320 450 370 456 L370 650 L-10 650 Z" fill="#3D5AA8"/>
  <path d="M-10 500 C80 478 170 494 250 500 C300 504 340 494 370 496" stroke="#5574C4" stroke-width="5" fill="none"/>
  <rect x="-10" y="560" width="380" height="90" fill="#2A3D78"/>
</svg>`,
  },
  'girls-hall': {
    back: `
<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="360" height="640" fill="#2B2350"/>
  <rect y="430" width="360" height="210" fill="#201A3D"/>
  <path d="M0 70 Q90 104 180 70 T360 70" stroke="#6E5BA8" stroke-width="2" fill="none"/>
  ${[20, 60, 100, 140, 180, 220, 260, 300, 340].map((x, i) =>
    `<circle class="fairy" cx="${x}" cy="${70 + (i % 2 ? 12 : 6)}" r="5" fill="#FFD58A"/>`).join('')}
  <rect x="220" y="130" width="110" height="190" rx="4" fill="#3A2F68"/>
  ${[150, 210, 270].map((y) => `<rect x="226" y="${y + 40}" width="98" height="6" fill="#4C3F85"/>`).join('')}
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${232 + i * 16}" y="162" width="12" height="28" fill="${['#E8481F', '#F4C430', '#3AA675', '#9CC8FF', '#E3609B'][i]}"/>`).join('')}
  ${[0, 1, 2, 3].map((i) => `<rect x="${236 + i * 18}" y="${222}" width="14" height="28" fill="${['#9CC8FF', '#E3609B', '#F4C430', '#3AA675'][i]}"/>`).join('')}
  <circle cx="270" cy="296" r="14" fill="#3AA675"/><rect x="262" y="296" width="16" height="18" fill="#B5651D"/>
  <rect x="34" y="132" width="120" height="84" rx="6" fill="#F2EAD8" opacity="0.92"/>
  <text x="94" y="168" text-anchor="middle" font-family="Sora, sans-serif" font-size="11" font-weight="700" fill="#2B2350">LAB EXAM</text>
  <text x="94" y="186" text-anchor="middle" font-family="Sora, sans-serif" font-size="11" fill="#2B2350">TOMORROW 9AM</text>
  <text x="94" y="204" text-anchor="middle" font-family="Sora, sans-serif" font-size="10" fill="#7C5CC4">you got this ✿</text>
</svg>`,
    front: `
<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M-10 470 C70 446 150 458 210 466 C270 474 320 456 370 462 L370 650 L-10 650 Z" fill="#8D6BD6"/>
  <path d="M-10 506 C90 484 170 500 250 506 C300 510 340 500 370 502" stroke="#A88BE6" stroke-width="5" fill="none"/>
  <rect x="-10" y="560" width="380" height="90" fill="#5E479E"/>
</svg>`,
  },
};

export function background(name) {
  return BACKGROUNDS[name] ?? BACKGROUNDS['hall-night'];
}

export const BACKGROUND_NAMES = Object.keys(BACKGROUNDS);
