import { screen, topBar } from './common.js';
import { esc } from '../ui/dom.js';

const LETTERS = 'ABCDEFGH';

export function questionScreen(ctx) {
  const q = ctx.question;
  const n = ctx.state.questionIndex + 1;
  const total = ctx.scenario.questions.length;
  const options = ctx.shuffledOptions();
  const el = screen('question', `
    <section class="question">
      <div class="q-progress" aria-label="Question ${n} of ${total}">
        ${Array.from({ length: total }, (_, i) => `<span class="${i < n ? 'done' : ''}"></span>`).join('')}
      </div>
      <p class="eyebrow">Question ${n} of ${total} · ${esc(q.tag.label)}</p>
      <h1 class="q-prompt" data-autofocus>${esc(q.prompt)}</h1>
      <div class="options" role="list">
        ${options.map((o, i) => `
          <button class="option" type="button" role="listitem" data-id="${esc(o.id)}">
            <span class="option-letter">${LETTERS[i]}</span>
            <span class="option-text">${esc(o.text)}</span>
          </button>`).join('')}
      </div>
    </section>`);
  el.prepend(topBar(ctx).bar);
  el.querySelectorAll('.option').forEach((btn) => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.option').forEach((b) => { b.disabled = true; });
      btn.classList.add('is-picked');
      const option = q.options.find((o) => o.id === btn.dataset.id);
      setTimeout(() => ctx.answer(option), 280);
    });
  });
  return el;
}
