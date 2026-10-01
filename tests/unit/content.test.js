import { describe, it, expect } from 'vitest';
import { scenarios, contentErrors, scenariosFor } from '../../src/content/index.js';
import { validateScenario } from '../../src/engine/validate.js';
import { sceneTranscript, sceneDuration } from '../../src/scene/transcript.js';
import { shuffle } from '../../src/engine/shuffle.js';

describe('scenario content', () => {
  it('loads the cyberbullying scenario first', () => {
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios[0].id).toBe('cyberbullying');
    expect(scenarios[0].scene).toBeTruthy();
  });

  it('has no content errors', () => {
    expect(contentErrors()).toEqual([]);
  });

  it('gives every question exactly one responsible option worth +5 in scenario 1', () => {
    for (const q of scenarios[0].questions) {
      const good = q.options.filter((o) => o.years > 0);
      expect(good).toHaveLength(1);
      expect(good[0].years).toBe(5);
      q.options.filter((o) => o.years < 0).forEach((o) => expect(o.years).toBe(-5));
    }
  });

  it('runs about 60 to 75 seconds', () => {
    const d = sceneDuration(scenarios[0].scene);
    expect(d).toBeGreaterThanOrEqual(60);
    expect(d).toBeLessThanOrEqual(75);
  });

  it('produces a readable transcript', () => {
    const lines = sceneTranscript(scenarios[0].scene);
    expect(lines.some((l) => l.text.includes('make it viral'))).toBe(true);
    expect(lines.some((l) => l.text.includes('Who made this?'))).toBe(true);
  });

  it('shows scenarios with no audience list to every role', () => {
    for (const role of ['school', 'university', 'other']) expect(scenariosFor(role).length).toBe(scenarios.length);
  });
});

describe('validateScenario', () => {
  it('reports broken content clearly', () => {
    const errors = validateScenario({
      id: 'x', title: 'X', order: 2, video: { type: 'scene' },
      questions: [{ id: 'q', prompt: 'p', tag: { label: 'l', strength: 's', growth: 'g' }, options: [
        { id: 'a', text: 'a', years: -5, shift: 's' }, { id: 'a', text: '', years: 0, shift: '' },
      ] }],
    });
    expect(errors.join('\n')).toMatch(/unique id/);
    expect(errors.join('\n')).toMatch(/non-zero/);
    expect(errors.join('\n')).toMatch(/at least one responsible option/);
  });
});

describe('shuffle', () => {
  it('keeps every item and does not change the input', () => {
    const list = [1, 2, 3, 4];
    const out = shuffle(list, () => 0.3);
    expect([...out].sort()).toEqual(list);
    expect(list).toEqual([1, 2, 3, 4]);
  });
});
