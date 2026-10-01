// Pure scoring rules for Mirror 100. No DOM access, so it is easy to test
// and safe to reuse from any screen or a future backend.

export const MIN_AGE = 13;
export const MAX_AGE = 60;
export const AGE_FLOOR = 0;
export const AGE_CEILING = 100;

export const RANKS = [
  { min: 75, id: 'responsible', label: 'Responsible Digital Citizen' },
  { min: 50, id: 'growing', label: 'Growing Digital Citizen' },
  { min: 0, id: 'training', label: 'Digital Citizen in Training' },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function validateAge(input) {
  const raw = String(input ?? '').trim();
  if (raw === '') return { ok: false, error: 'Enter your age to begin.' };
  if (!/^\d+$/.test(raw)) return { ok: false, error: 'Use whole numbers only, like 19.' };
  const value = Number(raw);
  if (value < MIN_AGE || value > MAX_AGE) {
    return { ok: false, error: `Mirror 100 is made for ages ${MIN_AGE} to ${MAX_AGE}.` };
  }
  return { ok: true, value };
}

export function createSession({ realAge, role = 'other' }) {
  const check = validateAge(realAge);
  if (!check.ok) throw new Error(check.error);
  return { realAge: check.value, role, answers: [] };
}

export function isResponsible(option) {
  return option.years > 0;
}

export function recordAnswer(session, scenarioId, question, option) {
  if (!question.options.some((o) => o.id === option.id)) {
    throw new Error(`Option ${option.id} does not belong to question ${question.id}`);
  }
  const answer = {
    scenarioId,
    questionId: question.id,
    optionId: option.id,
    years: option.years,
    responsible: isResponsible(option),
    tag: question.tag,
  };
  return { ...session, answers: [...session.answers, answer] };
}

export function mentalAge(session) {
  const total = session.answers.reduce((sum, a) => sum + a.years, session.realAge);
  return clamp(total, AGE_FLOOR, AGE_CEILING);
}

export function responsiblePercent(session) {
  const n = session.answers.length;
  if (n === 0) return 0;
  const good = session.answers.filter((a) => a.responsible).length;
  return Math.round((good / n) * 100);
}

export function rankFor(percent) {
  return RANKS.find((r) => percent >= r.min);
}

export function buildReport(session) {
  const age = mentalAge(session);
  const percent = responsiblePercent(session);
  const strengths = session.answers.filter((a) => a.responsible).map((a) => a.tag);
  const growth = session.answers.filter((a) => !a.responsible).map((a) => a.tag);
  return {
    realAge: session.realAge,
    mentalAge: age,
    yearsGained: age - session.realAge,
    percent,
    rank: rankFor(percent),
    responsibleCount: strengths.length,
    total: session.answers.length,
    strengths,
    growth,
  };
}
