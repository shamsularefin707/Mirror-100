// Checks a scenario's content so a broken content file fails loudly in tests
// and in `npm run validate`, never silently in front of a player.

const SHOT_TYPES = new Set(['room', 'phone', 'split', 'freeze']);

export function validateScenario(s) {
  const errors = [];
  const where = s?.id ? `scenario "${s.id}"` : 'scenario';
  const need = (cond, msg) => { if (!cond) errors.push(`${where}: ${msg}`); };

  need(typeof s?.id === 'string' && s.id, 'needs an id');
  need(typeof s?.title === 'string' && s.title, 'needs a title');
  need(Number.isInteger(s?.order), 'needs an integer order');
  need(['scene', 'mp4'].includes(s?.video?.type), 'video.type must be "scene" or "mp4"');
  if (s?.video?.type === 'mp4') need(typeof s.video.src === 'string', 'mp4 video needs a src');
  need(Array.isArray(s?.questions) && s.questions.length > 0, 'needs at least one question');

  const qIds = new Set();
  for (const q of s?.questions ?? []) {
    const qw = `question "${q.id}"`;
    need(q.id && !qIds.has(q.id), `${qw} needs a unique id`);
    qIds.add(q.id);
    need(typeof q.prompt === 'string' && q.prompt, `${qw} needs a prompt`);
    need(q.tag && q.tag.label && q.tag.strength && q.tag.growth, `${qw} needs tag.label, tag.strength and tag.growth`);
    need(Array.isArray(q.options) && q.options.length >= 2, `${qw} needs at least two options`);
    const oIds = new Set();
    for (const o of q.options ?? []) {
      need(o.id && !oIds.has(o.id), `${qw} option "${o.id}" needs a unique id`);
      oIds.add(o.id);
      need(typeof o.text === 'string' && o.text, `${qw} option "${o.id}" needs text`);
      need(Number.isInteger(o.years) && o.years !== 0, `${qw} option "${o.id}" needs non-zero whole years`);
      need(typeof o.shift === 'string' && o.shift, `${qw} option "${o.id}" needs a perspective shift line`);
    }
    need((q.options ?? []).some((o) => o.years > 0), `${qw} needs at least one responsible option`);
  }
  return errors;
}

export function validateScene(scene, sceneId = 'scene') {
  const errors = [];
  const need = (cond, msg) => { if (!cond) errors.push(`${sceneId}: ${msg}`); };
  need(scene && typeof scene.cast === 'object', 'needs a cast');
  need(Array.isArray(scene?.shots) && scene.shots.length > 0, 'needs at least one shot');
  for (const [i, shot] of (scene?.shots ?? []).entries()) {
    need(SHOT_TYPES.has(shot.type), `shot ${i} has unknown type "${shot.type}"`);
    need(typeof shot.duration === 'number' && shot.duration > 0, `shot ${i} needs a positive duration`);
    for (const who of [shot.actor, ...(shot.messages ?? []).map((m) => m.from)].filter(Boolean)) {
      need(who === 'me' || who in (scene?.cast ?? {}), `shot ${i} refers to unknown cast member "${who}"`);
    }
  }
  return errors;
}
