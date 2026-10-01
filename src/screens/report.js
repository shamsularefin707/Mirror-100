import { gsap } from 'gsap';
import { screen } from './common.js';
import { esc, prefersReducedMotion } from '../ui/dom.js';
import { buildReport } from '../engine/scoring.js';

const unique = (tags) => [...new Map(tags.map((t) => [t.label, t])).values()];

export function shareText(r) {
  return `I'm ${r.percent}% responsible digital citizen on Mirror 100. `
    + `Real age ${r.realAge}, mental age ${r.mentalAge}. Can you beat it?`;
}

export function reportScreen(ctx) {
  const r = buildReport(ctx.state.session);
  const strengths = unique(r.strengths);
  const growth = unique(r.growth);
  const help = ctx.state.scenarios.map((s) => s.help).find(Boolean);
  const answers = ctx.state.session.answers;
  const findQ = (a) => ctx.state.scenarios.find((s) => s.id === a.scenarioId).questions.find((q) => q.id === a.questionId);
  const diff = r.yearsGained;
  const diffText = diff > 0 ? `${diff} years more mature than your real age`
    : diff < 0 ? `${-diff} years less mature than your real age`
      : 'the same as your real age';
  const R = 52;
  const C = 2 * Math.PI * R;

  const el = screen('report', `
    <article class="report-card rank-${r.rank.id}" aria-labelledby="report-title">
      <header class="report-head">
        <span class="brand-mini">MIRROR <span>100</span></span>
        <span>REPORT</span>
      </header>
      <h1 id="report-title" class="sr-only">Your Mirror Report</h1>
      <div class="ages">
        <div><small>Real age</small><b>${r.realAge}</b></div>
        <div class="ages-arrow" aria-hidden="true">→</div>
        <div class="ages-mental"><small>Mental age</small><b data-count="${r.mentalAge}">${r.mentalAge}</b></div>
      </div>
      <p class="ages-diff">Your choices made you ${diffText}.</p>

      <div class="score">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="${R}" class="ring-track"/>
          <circle cx="60" cy="60" r="${R}" class="ring-fill" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - r.percent / 100)}"/>
        </svg>
        <div class="score-text">
          <p class="score-big" data-autofocus>You are <b>${r.percent}%</b> responsible digital citizen</p>
          <p class="rank">${esc(r.rank.label)} · ${r.responsibleCount} of ${r.total} responsible choices</p>
        </div>
      </div>

      ${strengths.length ? `<section class="traits traits-good"><h2>Your strength${strengths.length > 1 ? 's' : ''}</h2>
        <ul>${strengths.map((t) => `<li><b>${esc(t.label)}.</b> ${esc(t.strength)}</li>`).join('')}</ul></section>` : ''}
      ${growth.length ? `<section class="traits traits-grow"><h2>To work on</h2>
        <ul>${growth.map((t) => `<li><b>${esc(t.label)}.</b> ${esc(t.growth)}</li>`).join('')}</ul></section>`
      : '<section class="traits traits-grow"><h2>Next step</h2><p>You made every responsible choice. Share Mirror 100 with a friend and compare reports.</p></section>'}
    </article>

    <div class="report-actions">
      <button class="btn btn-primary" type="button" data-share>Share result</button>
      <button class="btn btn-ghost" type="button" data-again>Play again</button>
      <p class="toast" role="status" aria-live="polite"></p>
    </div>

    <details class="review">
      <summary>Review your answers</summary>
      <ol>${answers.map((a) => {
        const q = findQ(a);
        const picked = q.options.find((o) => o.id === a.optionId);
        const best = q.options.filter((o) => o.years > 0).sort((x, y) => y.years - x.years)[0];
        return `<li class="${a.responsible ? 'ok' : 'miss'}">
          <p class="r-q">${esc(q.prompt)}</p>
          <p><span class="pill ${a.responsible ? 'pill-good' : 'pill-bad'}">${a.years > 0 ? '+' : '−'}${Math.abs(a.years)}</span> ${esc(picked.text)}</p>
          ${a.responsible ? '' : `<p class="r-best">Responsible choice: ${esc(best.text)}</p>`}
        </li>`;
      }).join('')}</ol>
    </details>

    ${help ? `<aside class="help"><h2>${esc(help.title)}</h2><ul>${help.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></aside>` : ''}`);

  const toast = el.querySelector('.toast');
  el.querySelector('[data-share]').addEventListener('click', async () => {
    const text = shareText(r);
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) await navigator.share({ title: 'My Mirror 100 Report', text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); toast.textContent = 'Copied to clipboard. Paste it anywhere to share.'; }
    } catch (err) {
      if (err?.name !== 'AbortError') toast.textContent = `Couldn't share automatically. Copy this: ${text}`;
    }
  });
  el.querySelector('[data-again]').addEventListener('click', () => ctx.restart());

  if (!prefersReducedMotion()) {
    const fill = el.querySelector('.ring-fill');
    gsap.from(fill, { strokeDashoffset: C, duration: 1.4, ease: 'power2.out', delay: 0.3 });
    const num = el.querySelector('.ages-mental b');
    const s = { v: r.realAge };
    gsap.to(s, { v: r.mentalAge, duration: 1.4, delay: 0.3, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(s.v); } });
  }
  return el;
}
