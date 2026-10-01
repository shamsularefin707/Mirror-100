// Content registry. Every folder in ./scenarios with a scenario.json is picked
// up automatically, so adding a level means adding a folder, not code.

import { validateScenario, validateScene } from '../engine/validate.js';

const scenarioFiles = import.meta.glob('./scenarios/*/scenario.json', { eager: true, import: 'default' });
const jsonFiles = import.meta.glob('./scenarios/*/*.json', { eager: true, import: 'default' });

export function loadScenarios(files = scenarioFiles, allJson = jsonFiles) {
  return Object.entries(files)
    .map(([path, s]) => {
      const dir = path.slice(0, path.lastIndexOf('/') + 1);
      const scene = s.video?.type === 'scene' ? allJson[dir + s.video.scene] : null;
      return { ...s, scene };
    })
    .sort((a, b) => a.order - b.order);
}

export const scenarios = loadScenarios();

export function scenariosFor(role) {
  return scenarios.filter((s) => !s.audiences || s.audiences.includes(role));
}

export function contentErrors(list = scenarios) {
  return list.flatMap((s) => [
    ...validateScenario(s),
    ...(s.video?.type === 'scene' ? (s.scene ? validateScene(s.scene, `${s.id}/${s.video.scene}`) : [`${s.id}: scene file "${s.video.scene}" not found`]) : []),
  ]);
}
