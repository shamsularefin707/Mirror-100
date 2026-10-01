import { screen, topBar } from './common.js';
import { esc } from '../ui/dom.js';
import { play } from '../scene/sfx.js';

export function shiftScreen(ctx) {
  const { option, question, before, after } = ctx.state.lastAnswer;
  const good = option.years > 0;
  const best = question.options.filter((o) => o.years > 0).sort((a, b) => b.years - a.years)[0];
  const isLast = ctx.state.questionIndex === ctx.scenario.questions.length - 1
    && ctx.state.scenarioIndex === ctx.state.scenarios.length - 1;
  const sign = good ? '+' : '−';

  const el = screen(`shift ${good ? 'is-good' : 'is-bad'}`, `
    <section class="shift">
      <p class="eyebrow">Perspective Shift</p>
      <div class="shift-years" aria-hidden="true">${sign}${Math.abs(option.years)}<small>years</small></div>
      <h1 class="shift-line" data-autofocus>${esc(option.shift)}</h1>
      <p class="shift-choice"><span>You chose</span> ${esc(option.text)}</p>
      ${!good && best ? `<p class="shift-better"><span>A more responsible choice</span> ${esc(best.text)}</p>` : ''}
      <p class="sr-only">Your maturity age went from ${before} to ${after}.</p>
      <button class="btn ${good ? 'btn-primary' : 'btn-light'} btn-block" type="button" data-next>
        ${isLast ? 'See your Mirror Report' : 'Next question'}
      </button>
    </section>`);
  const { bar, meter } = topBar(ctx, { age: before });
  el.prepend(bar);
  meter.set(after, { delay: 0.5 });
  play(good ? 'good' : 'bad');
  el.querySelector('[data-next]').addEventListener('click', () => ctx.next());
  return el;
}
