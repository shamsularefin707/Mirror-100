import { screen, topBar } from './common.js';
import { esc } from '../ui/dom.js';

export function introScreen(ctx) {
  const s = ctx.scenario;
  const total = ctx.state.scenarios.length;
  const el = screen('intro', `
    <section class="card intro-card">
      <p class="eyebrow">Level ${s.level} of ${total} · ${esc(s.theme)}</p>
      <h1 data-autofocus>${esc(s.title)}</h1>
      <p class="lead">${esc(s.setup)}</p>
      ${s.contentNote ? `<p class="note">⚠️ ${esc(s.contentNote)}</p>` : ''}
      <ul class="rules">
        <li><span class="pill pill-good">+ years</span> for responsible choices</li>
        <li><span class="pill pill-bad">− years</span> for harmful ones</li>
        <li>${s.questions.length} questions after the scene</li>
      </ul>
      <button class="btn btn-primary btn-block" type="button" data-watch>Watch the scene</button>
    </section>`);
  el.prepend(topBar(ctx).bar);
  el.querySelector('[data-watch]').addEventListener('click', () => ctx.go('video'));
  return el;
}
