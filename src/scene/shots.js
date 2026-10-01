// Shot builders. Each turns one shot from a scene file into a DOM element plus
// a GSAP timeline. New scenarios reuse these four shot types with new data.

import { gsap } from 'gsap';
import { characterSVG, avatarSVG, groupAvatarSVG, EXPRESSIONS } from './characters.js';
import { background } from './backgrounds.js';
import { play } from './sfx.js';
import { esc, h } from '../ui/dom.js';

const sound = (tl, name, at) => tl.call(play, [name], at);

function avatarFor(scene, key) {
  if (key === 'group' || !scene.cast[key]) return groupAvatarSVG();
  return avatarSVG(scene.cast[key].look);
}

// ---------- room ----------

function roomShot(shot, scene) {
  const actor = scene.cast[shot.actor];
  const bg = background(shot.background);
  const notes = (shot.events ?? []).filter((e) => e.do === 'notify');
  const el = h(`
    <div class="shot shot-room">
      <div class="layer">${bg.back}</div>
      <div class="actor">${characterSVG(actor.look, { expression: shot.expression, pose: 'phone' })}</div>
      <div class="layer">${bg.front}</div>
      <div class="dim"></div>
      ${shot.caption ? `<div class="caption-chip">${esc(shot.caption)}</div>` : ''}
      ${notes.map((n) => `
        <div class="notification">
          <span class="notification-app">💬</span>
          <span><b>${esc(n.title)}</b><span>${esc(n.text)}</span></span>
        </div>`).join('')}
      <div class="thought"></div>
    </div>`);

  const tl = gsap.timeline();
  const actorEl = el.querySelector('.actor');
  const head = el.querySelector('.head');
  const eyes = el.querySelectorAll('.eye');
  const mouth = el.querySelector('.mouth');
  const browL = el.querySelector('.brow-l');
  const browR = el.querySelector('.brow-r');
  const screen = el.querySelector('.phone-screen');
  const caption = el.querySelector('.caption-chip');

  tl.fromTo(actorEl, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0);
  if (caption) tl.fromTo(caption, { y: -12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.3);

  // Idle life: a slow head sway and regular blinks.
  const swings = Math.max(1, Math.floor(shot.duration / 2.4));
  tl.to(head, { rotation: -2.5, svgOrigin: '100 180', duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: swings * 2 - 1 }, 0.4);
  for (let t = 1.4; t < shot.duration; t += 2.7) {
    tl.to(eyes, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.07, yoyo: true, repeat: 1 }, t);
  }
  // Phone screen flicker.
  if (screen) tl.to(screen, { fill: '#D7E8FF', duration: 0.3, yoyo: true, repeat: 3 }, 1);

  // Notifications replace each other in one slot so they never cover the face.
  const noteEls = el.querySelectorAll('.notification');
  let noteIndex = 0;
  for (const ev of shot.events ?? []) {
    if (ev.do === 'notify') {
      const n = noteEls[noteIndex];
      const prev = noteEls[noteIndex - 1];
      noteIndex += 1;
      if (prev) tl.to(prev, { autoAlpha: 0, y: 40, scale: 0.94, duration: 0.3 }, ev.at - 0.05);
      tl.fromTo(n, { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.7)' }, ev.at);
      tl.fromTo(actorEl, { x: 0 }, { x: 3, duration: 0.05, yoyo: true, repeat: 5 }, ev.at);
      sound(tl, 'buzz', ev.at);
    } else if (ev.do === 'expression') {
      const ex = EXPRESSIONS[ev.value] ?? EXPRESSIONS.neutral;
      tl.to(mouth, { attr: { d: ex.mouth }, duration: 0.45, ease: 'power2.inOut' }, ev.at);
      tl.to(browL, { attr: { d: ex.browL }, duration: 0.45 }, ev.at);
      tl.to(browR, { attr: { d: ex.browR }, duration: 0.45 }, ev.at);
      if (ev.value === 'sad') {
        tl.fromTo(el.querySelector('.tear'), { opacity: 0, y: 0 }, { opacity: 0.9, y: 26, duration: 1.8, ease: 'power1.in' }, ev.at + 0.8);
        tl.to(el.querySelector('.dim'), { opacity: 0.35, duration: 1.5 }, ev.at);
      }
    } else if (ev.do === 'thought') {
      const bubble = el.querySelector('.thought');
      bubble.textContent = ev.text;
      tl.fromTo(bubble, { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, ev.at);
    } else if (ev.do === 'phone-down') {
      tl.to(el.querySelector('.phone'), { y: 60, opacity: 0, duration: 0.7, ease: 'power2.in' }, ev.at);
      tl.to(noteEls, { autoAlpha: 0, duration: 0.6 }, ev.at);
      tl.to(head, { rotation: 4, y: 6, svgOrigin: '100 180', duration: 1 }, ev.at + 0.3);
      tl.to(el.querySelector('.dim'), { opacity: 0.55, duration: 1.2 }, ev.at + 0.3);
    }
  }
  return { el, tl };
}

// ---------- phone chat (shared by "phone" and "split") ----------

function chatMarkup(shot, scene, { compact = false } = {}) {
  const msgs = shot.messages ?? [];
  const rows = msgs.map((m, i) => {
    const me = m.from === 'me';
    const who = scene.cast[m.from];
    const name = !me && shot.chat.avatar === 'group' && who ? `<b class="sender" style="color:${who.color ?? '#1F4FA3'}">${esc(who.name)}</b>` : '';
    let body;
    if (m.meme) {
      body = `
        <div class="meme" role="img" aria-label="An edited photo of Nusrat, hidden by Mirror 100">
          <div class="meme-blur"><span>😂</span><span>🤡</span><span>😂</span></div>
          <div class="meme-label">🔒 Photo hidden by Mirror 100</div>
        </div>`;
    } else if (m.typing) {
      body = '<span class="typing"><i></i><i></i><i></i></span>';
    } else {
      body = `<span class="text">${esc(m.text)}</span>`;
    }
    return `
      <div class="msg ${me ? 'msg-me' : 'msg-them'}" data-i="${i}">
        ${!me && !compact ? `<span class="msg-avatar">${avatarFor(scene, m.from)}</span>` : ''}
        <div class="bubble">${name}${body}<span class="reactions"></span></div>
      </div>`;
  }).join('');
  return `
    <div class="chat ${compact ? 'chat-compact' : ''}">
      <header class="chat-head">
        <span class="chat-back" aria-hidden="true">‹</span>
        <span class="avatar">${avatarFor(scene, shot.chat.avatar)}</span>
        <span class="chat-title"><b>${esc(shot.chat.title)}</b><small>${esc(shot.chat.subtitle ?? '')}</small></span>
      </header>
      <div class="chat-body">${rows}</div>
      ${compact ? '' : '<footer class="chat-input"><span>Message</span><span class="chat-send">➤</span></footer>'}
    </div>`;
}

function animateMessages(tl, el, shot) {
  const nodes = el.querySelectorAll('.msg');
  (shot.messages ?? []).forEach((m, i) => {
    const node = nodes[i];
    if (m.at <= 0) { tl.set(node, { autoAlpha: 1 }, 0); return; }
    tl.fromTo(node, { autoAlpha: 0, y: 14, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }, m.at);
    if (m.typing) {
      const dots = node.querySelectorAll('.typing i');
      tl.to(dots, { y: -4, duration: 0.25, stagger: 0.12, yoyo: true, repeat: Math.ceil(m.typing * 2) }, m.at + 0.2);
      for (let t = m.at + 0.2; t < m.at + m.typing; t += 0.35) sound(tl, 'type', t);
      tl.to(node, { autoAlpha: 0, duration: 0.3 }, m.at + m.typing);
    } else {
      sound(tl, 'pop', m.at);
    }
  });
  return nodes;
}

function scrollToNewest(tl, el, shot) {
  const body = el.querySelector('.chat-body');
  // Measured when the message appears, because the shot is in the DOM by then.
  (shot.messages ?? []).forEach((m, i) => {
    if (m.at <= 0) return;
    tl.add(() => {
      const node = el.querySelectorAll('.msg')[i];
      const overflow = node.offsetTop + node.offsetHeight - body.clientHeight + 12;
      gsap.to(body, { scrollTop: Math.max(0, overflow), duration: 0.35, overwrite: true });
    }, m.at);
  });
}

function phoneShot(shot, scene) {
  const fw = shot.forward;
  const el = h(`
    <div class="shot shot-phone">
      ${chatMarkup(shot, scene)}
      ${fw ? `
        <div class="forward-sheet">
          <div class="sheet-handle"></div>
          <b class="sheet-title">Forward to…</b>
          ${[fw.target, ...(fw.others ?? [])].map((name, i) => `
            <div class="sheet-row ${i === 0 ? 'is-target' : ''}">
              <span class="avatar">${groupAvatarSVG()}</span><span>${esc(name)}</span><span class="check"></span>
            </div>`).join('')}
          <div class="sheet-send">Send ➤</div>
        </div>
        <div class="finger" aria-hidden="true">👆</div>` : ''}
      ${shot.heartbeat ? '<div class="vignette"></div>' : ''}
    </div>`);
  const tl = gsap.timeline();
  animateMessages(tl, el, shot);
  scrollToNewest(tl, el, shot);

  const r = shot.reactions;
  if (r) {
    const chip = el.querySelectorAll('.reactions')[r.message];
    const count = { n: 0 };
    tl.call(() => { chip.textContent = ''; }, [], 0);
    tl.to(count, {
      n: r.count, duration: 4, ease: 'power1.out',
      onUpdate: () => { chip.textContent = `${r.emojis.join('')} ${Math.round(count.n)}`; },
    }, r.at);
  }

  if (fw) {
    const sheet = el.querySelector('.forward-sheet');
    const check = el.querySelector('.is-target .check');
    const finger = el.querySelector('.finger');
    tl.fromTo(sheet, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, fw.at);
    tl.to(check, { backgroundColor: '#1E8E5A', borderColor: '#1E8E5A', duration: 0.2 }, fw.at + 1.4);
    tl.call(() => { check.textContent = ''; }, [], 0);
    tl.call(() => { check.textContent = '✓'; }, [], fw.at + 1.4);
    tl.fromTo(finger, { autoAlpha: 0, x: 60, y: 120 }, { autoAlpha: 1, x: 0, y: 0, duration: 1.2, ease: 'power2.out' }, fw.at + 2);
    tl.to(finger, { x: '+=3', y: '-=4', duration: 0.12, yoyo: true, repeat: Math.floor((shot.duration - fw.at - 3.5) / 0.12) }, fw.at + 3.2);
    sound(tl, 'tick', fw.at + 1.4);
  }
  if (shot.heartbeat) {
    const vignette = el.querySelector('.vignette');
    for (let t = 1.5; t < shot.duration - 0.4; t += 1.1) {
      tl.fromTo(vignette, { opacity: 0.25 }, { opacity: 0.75, duration: 0.18, yoyo: true, repeat: 1 }, t);
      sound(tl, 'heartbeat', t);
    }
  }
  return { el, tl };
}

// ---------- split: chat on top, a rising view counter below ----------

function splitShot(shot, scene) {
  const c = shot.counter;
  const faces = Object.keys(scene.cast).filter((k) => !scene.cast[k].player);
  const el = h(`
    <div class="shot shot-split">
      <div class="split-top">${chatMarkup(shot, scene, { compact: true })}</div>
      <div class="split-bottom">
        <div class="counter-eye" aria-hidden="true">👁</div>
        <div class="counter-num">${c.from}</div>
        <div class="counter-label">${esc(c.label)}</div>
        <div class="counter-faces">${Array.from({ length: 10 }, (_, i) =>
          `<span class="avatar">${avatarFor(scene, faces[i % faces.length])}</span>`).join('')}</div>
        ${shot.caption ? `<div class="split-caption">${esc(shot.caption)}</div>` : ''}
      </div>
    </div>`);
  const tl = gsap.timeline();
  animateMessages(tl, el, shot);
  const num = el.querySelector('.counter-num');
  const state = { v: c.from };
  tl.set(state, { v: c.from }, 0);
  tl.to(state, {
    v: c.to, duration: shot.duration - 2, ease: 'power2.in',
    onUpdate: () => { num.textContent = Math.round(state.v); },
  }, 0.5);
  tl.fromTo(el.querySelectorAll('.counter-faces .avatar'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.7, ease: 'back.out(2)' }, 0.8);
  for (let t = 1; t < shot.duration - 1; t += 0.9) sound(tl, 'tick', t);
  const cap = el.querySelector('.split-caption');
  if (cap) tl.fromTo(cap, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, shot.duration - 3.2);
  return { el, tl };
}

// ---------- freeze: the mirror cracks ----------

function freezeShot(shot) {
  const el = h(`
    <div class="shot shot-freeze">
      <svg class="freeze-mirror" viewBox="0 0 200 260" aria-hidden="true">
        <ellipse cx="100" cy="130" rx="86" ry="118" fill="#0E1530" stroke="#C9D6F5" stroke-width="6"/>
        <ellipse cx="100" cy="130" rx="74" ry="106" fill="url(#fz)"/>
        <defs><linearGradient id="fz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2D3E78"/><stop offset="1" stop-color="#121A3A"/></linearGradient></defs>
        <path d="M100 210 C70 210 62 180 64 168 C66 150 84 150 86 140 C74 132 74 100 100 96 C126 100 126 132 114 140 C116 150 134 150 136 168 C138 180 130 210 100 210 Z" fill="#06091A" opacity="0.85"/>
        <g class="cracks" stroke="#FAF7F2" stroke-width="1.6" fill="none" stroke-linecap="round">
          <path d="M112 112 L132 70 L140 52"/><path d="M112 112 L150 120 L178 116"/><path d="M112 112 L124 160 L120 200"/>
          <path d="M112 112 L80 140 L46 150"/><path d="M112 112 L88 84 L70 46"/><path d="M132 70 L150 84"/><path d="M124 160 L146 176"/>
        </g>
      </svg>
      <h2 class="freeze-text">${esc(shot.text)}</h2>
      ${shot.sub ? `<p class="freeze-sub">${esc(shot.sub)}</p>` : ''}
    </div>`);
  const tl = gsap.timeline();
  const cracks = el.querySelectorAll('.cracks path');
  cracks.forEach((p) => { p.style.strokeDasharray = '200'; });
  tl.fromTo(el.querySelector('.freeze-mirror'), { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6 }, 0);
  tl.fromTo(cracks, { strokeDashoffset: 200 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, 0.8);
  tl.fromTo(el.querySelector('.freeze-mirror'), { x: 0 }, { x: 4, duration: 0.05, yoyo: true, repeat: 5 }, 0.8);
  sound(tl, 'crack', 0.8);
  tl.fromTo(el.querySelector('.freeze-text'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.6);
  const sub = el.querySelector('.freeze-sub');
  if (sub) tl.fromTo(sub, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 2.4);
  return { el, tl };
}

export const SHOT_BUILDERS = {
  room: roomShot,
  phone: phoneShot,
  split: splitShot,
  freeze: freezeShot,
};

export function buildShot(shot, scene) {
  const builder = SHOT_BUILDERS[shot.type];
  if (!builder) throw new Error(`Unknown shot type "${shot.type}"`);
  const out = builder(shot, scene);
  // Pad every shot to its declared length so the master timeline stays in sync.
  out.tl.set({}, {}, shot.duration);
  return out;
}
