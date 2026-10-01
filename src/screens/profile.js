import { screen } from './common.js';
import { validateAge, MIN_AGE, MAX_AGE } from '../engine/scoring.js';

const ROLES = [
  { id: 'school', label: 'School student' },
  { id: 'university', label: 'University student' },
  { id: 'other', label: 'Other' },
];

export function profileScreen(ctx) {
  const el = screen('profile', `
    <form class="card profile-form" novalidate>
      <h1 data-autofocus>Before you look in the mirror</h1>
      <p class="muted">Your real age becomes your starting maturity age. Your choices will move it up or down.</p>

      <div class="field">
        <label for="age">How old are you?</label>
        <input id="age" name="age" type="text" inputmode="numeric" autocomplete="off" maxlength="2"
          aria-describedby="age-hint age-error" placeholder="e.g. 19">
        <small id="age-hint" class="hint">Ages ${MIN_AGE} to ${MAX_AGE}</small>
        <small id="age-error" class="error" aria-live="polite"></small>
      </div>

      <fieldset class="field">
        <legend>Which fits you best?</legend>
        <div class="chips">
          ${ROLES.map((r, i) => `
            <label class="chip"><input type="radio" name="role" value="${r.id}" ${i === 1 ? 'checked' : ''}><span>${r.label}</span></label>`).join('')}
        </div>
      </fieldset>

      <div class="start-age" aria-live="polite">Starting maturity age: <b>–</b></div>
      <button class="btn btn-primary btn-block" type="submit">Continue</button>
    </form>`);

  const form = el.querySelector('form');
  const input = el.querySelector('#age');
  const error = el.querySelector('#age-error');
  const preview = el.querySelector('.start-age b');

  const showError = (msg) => {
    error.textContent = msg ?? '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
    const check = validateAge(input.value);
    preview.textContent = check.ok ? check.value : '–';
    if (check.ok) showError(null);
  });
  input.addEventListener('blur', () => {
    if (input.value) { const c = validateAge(input.value); showError(c.ok ? null : c.error); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const check = validateAge(input.value);
    if (!check.ok) { showError(check.error); input.focus(); return; }
    ctx.begin({ age: check.value, role: form.role.value });
  });
  return el;
}
