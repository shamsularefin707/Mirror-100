import { h } from '../ui/dom.js';
import { createMeter } from '../ui/meter.js';

// Top bar shown on every screen after the opening one.
export function topBar(ctx, { age = ctx.age } = {}) {
  const bar = h(`
    <header class="topbar">
      <button class="brand" type="button" aria-label="Mirror 100, back to the opening screen">MIRROR <span>100</span></button>
    </header>`);
  bar.querySelector('.brand').addEventListener('click', () => {
    if (confirm('Leave this game and go back to the start? Your answers will be lost.')) ctx.restart();
  });
  const meter = createMeter(ctx.state.session.realAge, age);
  bar.append(meter.el);
  return { bar, meter };
}

export function screen(name, html) {
  return h(`<main class="screen screen-${name}">${html}</main>`);
}
