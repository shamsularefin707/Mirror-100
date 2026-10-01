import { screen, topBar } from './common.js';
import { esc } from '../ui/dom.js';
import { createScenePlayer, createVideoPlayer } from '../scene/player.js';
import { sceneTranscript } from '../scene/transcript.js';

export function videoScreen(ctx) {
  const s = ctx.scenario;
  const el = screen('video', `
    <h1 class="video-title" data-autofocus>Level ${s.level}: ${esc(s.title)}</h1>
    <div class="video-slot"></div>
    <div class="video-actions">
      <button class="btn btn-ghost btn-block" type="button" data-continue>Skip to the questions</button>
      <details class="transcript">
        <summary>Read the scene instead</summary>
        <ol></ol>
      </details>
    </div>`);
  el.prepend(topBar(ctx).bar);
  const btn = el.querySelector('[data-continue]');
  const onEnd = () => {
    btn.textContent = 'Answer the questions';
    btn.classList.replace('btn-ghost', 'btn-primary');
    btn.classList.add('pulse');
  };
  const slot = el.querySelector('.video-slot');
  const player = s.video.type === 'mp4'
    ? createVideoPlayer(slot, s.video.src, { onEnd })
    : createScenePlayer(slot, s.scene, { onEnd });

  const list = el.querySelector('.transcript ol');
  if (s.scene) {
    list.innerHTML = sceneTranscript(s.scene)
      .map((l) => `<li class="t-${l.kind}">${esc(l.text)}</li>`).join('');
  } else {
    el.querySelector('.transcript').remove();
  }

  btn.addEventListener('click', () => ctx.go('question'));
  el._cleanup = () => player.destroy();
  return el;
}
