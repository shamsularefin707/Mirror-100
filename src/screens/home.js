import { gsap } from 'gsap';
import { screen } from './common.js';
import { prefersReducedMotion } from '../ui/dom.js';

const MIRROR = `
<svg class="home-mirror" viewBox="0 0 240 300" aria-hidden="true">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DCE7FF"/><stop offset="0.55" stop-color="#A9BEEB"/><stop offset="1" stop-color="#6F8CCB"/>
    </linearGradient>
    <clipPath id="oval"><ellipse cx="120" cy="150" rx="88" ry="122"/></clipPath>
  </defs>
  <ellipse cx="120" cy="150" rx="102" ry="136" fill="#1F4FA3"/>
  <ellipse cx="120" cy="150" rx="94" ry="128" fill="#E8481F"/>
  <ellipse cx="120" cy="150" rx="88" ry="122" fill="url(#glass)"/>
  <g clip-path="url(#oval)">
    <g class="reflection">
      <path d="M120 272 C76 272 58 236 62 210 C66 188 92 186 96 172 C80 160 80 120 120 114 C160 120 160 160 144 172 C148 186 174 188 178 210 C182 236 164 272 120 272 Z" fill="#1F4FA3" opacity="0.85"/>
      <text class="reflection-num" x="120" y="250" text-anchor="middle" font-family="Sora, sans-serif" font-weight="800" font-size="34" fill="#FAF7F2">100</text>
    </g>
    <rect class="sheen" x="-120" y="0" width="60" height="300" fill="#fff" opacity="0.35" transform="skewX(-20)"/>
  </g>
  <g class="home-cracks" stroke="#FAF7F2" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M156 70 L140 102 L150 132"/><path d="M140 102 L112 110"/><path d="M150 132 L176 150"/>
  </g>
</svg>`;

export function homeScreen(ctx) {
  const el = screen('home', `
    <div class="home-hero">
      ${MIRROR}
      <p class="eyebrow">Digital Khichuri Challenge 2026 · Team demo</p>
      <h1 class="logo" data-autofocus>MIRROR <span>100</span></h1>
      <p class="tagline">Live the other side of your online choices.</p>
      <button class="btn btn-primary btn-lg" type="button" data-start>Start</button>
      <details class="about">
        <summary>About this game</summary>
        <p>Mirror 100 drops you into real situations young people face online. You watch a short scene, then decide what you'd do.</p>
        <p>Responsible choices add years to your maturity age. Harmful ones take years away. After each choice, a <b>Perspective Shift</b> shows what the other person went through.</p>
        <p>At the end, your <b>Mirror Report</b> shows your mental age and how responsible a digital citizen you are.</p>
      </details>
    </div>
    <footer class="home-foot">Theme: Digital Literacy &amp; Responsible Digital Citizenship</footer>`);
  el.querySelector('[data-start]').addEventListener('click', () => ctx.go('profile'));

  if (!prefersReducedMotion()) {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2 });
    tl.fromTo(el.querySelector('.sheen'), { x: 0 }, { x: 420, duration: 1.6, ease: 'power2.inOut' });
    gsap.to(el.querySelector('.reflection'), { y: -6, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const cracks = el.querySelectorAll('.home-cracks path');
    cracks.forEach((p) => { p.style.strokeDasharray = '80'; });
    gsap.fromTo(cracks, { strokeDashoffset: 80 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15, delay: 0.8 });
    el._cleanup = () => { tl.kill(); gsap.killTweensOf(el.querySelectorAll('*')); };
  }
  return el;
}
