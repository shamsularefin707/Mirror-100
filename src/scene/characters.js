// Flat 2D characters drawn as SVG strings. Every character shares one rig
// (head, brows, eyes, mouth, torso, arms) so any scenario can reuse them by
// passing a different "look" from its scene file.

// Mouth and brow shapes keep the same path commands across expressions so
// GSAP can tween between them smoothly.
export const EXPRESSIONS = {
  neutral: {
    mouth: 'M90 126 Q100 129 110 126',
    browL: 'M78 88 Q85 85 92 88',
    browR: 'M108 88 Q115 85 122 88',
  },
  smile: {
    mouth: 'M88 122 Q100 135 112 122',
    browL: 'M78 86 Q85 82 92 86',
    browR: 'M108 86 Q115 82 122 86',
  },
  curious: {
    mouth: 'M92 127 Q100 127 108 125',
    browL: 'M78 85 Q85 80 92 86',
    browR: 'M108 88 Q115 86 122 88',
  },
  worried: {
    mouth: 'M91 128 Q100 124 109 128',
    browL: 'M78 89 Q85 84 92 84',
    browR: 'M108 84 Q115 84 122 89',
  },
  sad: {
    mouth: 'M89 131 Q100 121 111 131',
    browL: 'M78 90 Q86 85 92 83',
    browR: 'M108 83 Q114 85 122 90',
  },
};

function hairBack(look) {
  switch (look.hairStyle) {
    case 'long':
      return `<path fill="${look.hair}" d="M54 100 C48 44 152 44 146 100 L152 205 C128 218 72 218 48 205 Z"/>`;
    case 'hijab':
      return `<path fill="${look.hijab}" d="M50 104 C44 40 156 40 150 104 C152 140 150 160 170 190 C150 205 50 205 30 190 C50 160 48 140 50 104 Z"/>`;
    default:
      return '';
  }
}

function hairFront(look) {
  switch (look.hairStyle) {
    case 'short':
      return `<path fill="${look.hair}" d="M58 98 C52 50 88 40 104 44 C130 42 152 60 142 98 C138 78 122 66 100 70 C82 68 66 78 58 98 Z"/>`;
    case 'quiff':
      return `<path fill="${look.hair}" d="M58 96 C54 56 80 34 112 36 C140 38 154 62 142 96 C140 80 128 70 106 66 C120 60 100 52 90 62 C76 66 64 78 58 96 Z"/>`;
    case 'buzz':
      return `<path fill="${look.hair}" opacity="0.92" d="M60 92 C60 58 84 50 100 50 C118 50 140 58 140 92 C134 74 120 66 100 66 C80 66 66 74 60 92 Z"/>`;
    case 'curly':
      return `<g fill="${look.hair}"><circle cx="66" cy="78" r="14"/><circle cx="80" cy="62" r="15"/><circle cx="100" cy="56" r="16"/><circle cx="120" cy="62" r="15"/><circle cx="134" cy="78" r="14"/></g>`;
    case 'long':
      return `<path fill="${look.hair}" d="M58 100 C52 52 90 44 104 46 C134 46 150 64 142 100 C132 76 112 68 100 72 C92 82 76 90 58 100 Z"/>`;
    case 'hijab':
      return `<path fill="${look.hijab}" opacity="0.95" d="M60 92 C62 60 86 52 100 52 C114 52 138 60 140 92 C132 72 118 66 100 66 C82 66 68 72 60 92 Z"/>`;
    default:
      return '';
  }
}

function arms(look, pose) {
  if (pose === 'down') {
    return `
      <path class="arm" fill="${look.shirt}" d="M48 220 C40 260 40 300 46 320 L70 320 C68 290 70 258 74 232 Z"/>
      <path class="arm" fill="${look.shirt}" d="M152 220 C160 260 160 300 154 320 L130 320 C132 290 130 258 126 232 Z"/>`;
  }
  // Holding a phone in front of the chest.
  return `
    <path fill="${look.shirt}" d="M50 222 C40 260 60 282 92 270 L96 254 C78 256 70 246 74 228 Z"/>
    <path fill="${look.shirt}" d="M150 222 C160 260 140 282 108 270 L104 254 C122 256 130 246 126 228 Z"/>
    <g class="phone">
      <rect x="84" y="222" width="32" height="54" rx="6" fill="#111827"/>
      <rect class="phone-screen" x="87" y="226" width="26" height="44" rx="3" fill="#9CC8FF"/>
    </g>
    <circle cx="90" cy="266" r="8" fill="${look.skin}"/>
    <circle cx="110" cy="266" r="8" fill="${look.skin}"/>`;
}

// Returns an SVG string for a half-body character. `pose` is "phone" or "down".
export function characterSVG(look, { expression = 'neutral', pose = 'phone' } = {}) {
  const ex = EXPRESSIONS[expression] ?? EXPRESSIONS.neutral;
  const neckColor = look.hairStyle === 'hijab' ? look.hijab : look.skin;
  return `
<svg class="character" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="body">
    <path fill="${look.shirt}" d="M36 320 C36 226 58 176 100 170 C142 176 164 226 164 320 Z"/>
    <path fill="${look.accent}" opacity="0.85" d="M84 172 L100 194 L116 172 Z"/>
    ${arms(look, pose)}
  </g>
  <g class="head">
    ${hairBack(look)}
    <rect x="88" y="136" width="24" height="44" rx="8" fill="${neckColor}"/>
    <circle cx="60" cy="106" r="9" fill="${look.skin}"/>
    <circle cx="140" cy="106" r="9" fill="${look.skin}"/>
    <ellipse cx="100" cy="102" rx="40" ry="46" fill="${look.skin}"/>
    ${hairFront(look)}
    <path class="brow brow-l" d="${ex.browL}" stroke="#1B1410" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path class="brow brow-r" d="${ex.browR}" stroke="#1B1410" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <g class="eyes">
      <ellipse class="eye" cx="85" cy="102" rx="4.6" ry="5.2" fill="#1B1410"/>
      <ellipse class="eye" cx="115" cy="102" rx="4.6" ry="5.2" fill="#1B1410"/>
    </g>
    <path d="M98 108 Q100 116 103 114" stroke="#00000033" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path class="mouth" d="${ex.mouth}" stroke="#5B2A1E" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <circle class="tear" cx="80" cy="112" r="3.2" fill="#8FC9FF" opacity="0"/>
  </g>
</svg>`;
}

// A round avatar crop of the same character, for chat headers and bubbles.
export function avatarSVG(look) {
  return `
<svg class="avatar-svg" viewBox="44 40 112 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="44" y="40" width="112" height="112" fill="${look.accent}" opacity="0.35"/>
  ${hairBack(look)}
  <ellipse cx="100" cy="102" rx="40" ry="46" fill="${look.skin}"/>
  ${hairFront(look)}
  <ellipse cx="85" cy="102" rx="4.6" ry="5.2" fill="#1B1410"/>
  <ellipse cx="115" cy="102" rx="4.6" ry="5.2" fill="#1B1410"/>
  <path d="${EXPRESSIONS.neutral.mouth}" stroke="#5B2A1E" stroke-width="3.4" fill="none" stroke-linecap="round"/>
</svg>`;
}

export function groupAvatarSVG() {
  return `
<svg class="avatar-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="40" height="40" fill="#3B5BA9"/>
  <circle cx="14" cy="16" r="5" fill="#DCE6FF"/><circle cx="26" cy="16" r="5" fill="#DCE6FF"/>
  <path d="M5 32 C6 24 22 24 23 32 Z" fill="#DCE6FF"/><path d="M17 32 C18 24 34 24 35 32 Z" fill="#BFD0FF"/>
</svg>`;
}
