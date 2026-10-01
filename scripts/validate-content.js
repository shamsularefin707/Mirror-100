// `npm run validate`: checks every scenario folder without starting the app.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateScenario, validateScene } from '../src/engine/validate.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../src/content/scenarios');
let errors = [];
for (const dir of readdirSync(root)) {
  const file = join(root, dir, 'scenario.json');
  if (!existsSync(file)) continue;
  const s = JSON.parse(readFileSync(file, 'utf8'));
  errors = errors.concat(validateScenario(s));
  if (s.video?.type === 'scene') {
    const sceneFile = join(root, dir, s.video.scene);
    if (!existsSync(sceneFile)) errors.push(`${s.id}: missing scene file ${s.video.scene}`);
    else errors = errors.concat(validateScene(JSON.parse(readFileSync(sceneFile, 'utf8')), `${s.id}/${s.video.scene}`));
  }
  console.log(`checked ${dir}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('All scenario content is valid.');
