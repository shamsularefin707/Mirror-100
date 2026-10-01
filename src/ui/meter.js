// The maturity meter: a 0-100 track with the player's current mental age and
// a faint marker at their real age.

import { gsap } from 'gsap';
import { h } from './dom.js';
import { AGE_CEILING } from '../engine/scoring.js';

export function createMeter(realAge, age = realAge) {
  const el = h(`
    <div class="meter" role="group" aria-label="Maturity meter">
      <div class="meter-top">
        <span class="meter-label">Maturity age</span>
        <span class="meter-value"><b>${age}</b> yrs</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill"></div>
        <div class="meter-real" title="Your real age"></div>
        <span class="meter-goal">100</span>
      </div>
    </div>`);
  const fill = el.querySelector('.meter-fill');
  const value = el.querySelector('.meter-value b');
  el.querySelector('.meter-real').style.left = `${(realAge / AGE_CEILING) * 100}%`;
  const state = { v: age };
  const render = () => {
    fill.style.width = `${(state.v / AGE_CEILING) * 100}%`;
    value.textContent = Math.round(state.v);
  };
  render();
  return {
    el,
    set(next, { animate = true, delay = 0 } = {}) {
      const up = next >= state.v;
      if (!animate) { state.v = next; render(); return; }
      gsap.to(state, { v: next, duration: 1.1, delay, ease: 'power2.out', onUpdate: render });
      gsap.fromTo(el, { '--flash': up ? '#1E8E5A' : '#C2372B' }, { '--flash': 'transparent', duration: 1.4, delay });
    },
  };
}
