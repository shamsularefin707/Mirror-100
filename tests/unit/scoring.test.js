import { describe, it, expect } from 'vitest';
import {
  validateAge, createSession, recordAnswer, mentalAge, responsiblePercent, buildReport, rankFor,
} from '../../src/engine/scoring.js';

const tag = (label) => ({ label, strength: `${label} strength`, growth: `${label} growth` });
const q = (id, years = [5, -5]) => ({
  id, tag: tag(id), prompt: id,
  options: years.map((y, i) => ({ id: `${id}-${i}`, text: 't', years: y, shift: 's' })),
});

describe('validateAge', () => {
  it('accepts whole numbers in range', () => {
    expect(validateAge('19')).toEqual({ ok: true, value: 19 });
    expect(validateAge(13).ok).toBe(true);
    expect(validateAge(60).ok).toBe(true);
  });
  it('rejects empty, out of range and non-numeric input', () => {
    expect(validateAge('').ok).toBe(false);
    expect(validateAge('12').ok).toBe(false);
    expect(validateAge('61').ok).toBe(false);
    expect(validateAge('19.5').ok).toBe(false);
    expect(validateAge('abc').ok).toBe(false);
  });
});

describe('scoring', () => {
  it('starts mental age at real age', () => {
    const s = createSession({ realAge: 20 });
    expect(mentalAge(s)).toBe(20);
    expect(responsiblePercent(s)).toBe(0);
  });

  it('adds years for responsible answers and removes them for harmful ones', () => {
    const q1 = q('a'); const q2 = q('b');
    let s = createSession({ realAge: 20 });
    s = recordAnswer(s, 'sc', q1, q1.options[0]);
    expect(mentalAge(s)).toBe(25);
    s = recordAnswer(s, 'sc', q2, q2.options[1]);
    expect(mentalAge(s)).toBe(20);
    expect(responsiblePercent(s)).toBe(50);
  });

  it('supports per-option year values like +10 or -8', () => {
    const q1 = q('a', [10, -8]);
    let s = createSession({ realAge: 30 });
    s = recordAnswer(s, 'sc', q1, q1.options[1]);
    expect(mentalAge(s)).toBe(22);
  });

  it('clamps mental age between 0 and 100', () => {
    const big = q('a', [80, -80]);
    let s = createSession({ realAge: 40 });
    s = recordAnswer(s, 'sc', big, big.options[0]);
    expect(mentalAge(s)).toBe(100);
    let t = createSession({ realAge: 13 });
    t = recordAnswer(t, 'sc', big, big.options[1]);
    expect(mentalAge(t)).toBe(0);
  });

  it('does not mutate the previous session', () => {
    const q1 = q('a');
    const s = createSession({ realAge: 20 });
    recordAnswer(s, 'sc', q1, q1.options[0]);
    expect(s.answers).toHaveLength(0);
  });

  it('rejects an option from a different question', () => {
    const q1 = q('a'); const q2 = q('b');
    expect(() => recordAnswer(createSession({ realAge: 20 }), 'sc', q1, q2.options[0])).toThrow();
  });

  it('builds a report with percent, rank, strengths and growth areas', () => {
    const qs = ['a', 'b', 'c', 'd'].map((id) => q(id));
    let s = createSession({ realAge: 19 });
    s = recordAnswer(s, 'sc', qs[0], qs[0].options[0]);
    s = recordAnswer(s, 'sc', qs[1], qs[1].options[0]);
    s = recordAnswer(s, 'sc', qs[2], qs[2].options[0]);
    s = recordAnswer(s, 'sc', qs[3], qs[3].options[1]);
    const r = buildReport(s);
    expect(r).toMatchObject({ realAge: 19, mentalAge: 29, yearsGained: 10, percent: 75, responsibleCount: 3, total: 4 });
    expect(r.rank.id).toBe('responsible');
    expect(r.strengths.map((t) => t.label)).toEqual(['a', 'b', 'c']);
    expect(r.growth.map((t) => t.label)).toEqual(['d']);
  });

  it('maps percentages to ranks', () => {
    expect(rankFor(100).id).toBe('responsible');
    expect(rankFor(75).id).toBe('responsible');
    expect(rankFor(50).id).toBe('growing');
    expect(rankFor(25).id).toBe('training');
    expect(rankFor(0).id).toBe('training');
  });
});
