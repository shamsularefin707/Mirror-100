// Plays a scene file as a "video": builds every shot, chains them on one
// GSAP master timeline, and wires up play, pause, seek, replay and mute.

import { gsap } from 'gsap';
import { buildShot } from './shots.js';
import { unlockAudio, setMuted, isMuted, setSuppressed } from './sfx.js';
import { sceneDuration } from './transcript.js';
import { h } from '../ui/dom.js';

const STAGE_W = 360;
const STAGE_H = 640;
const FADE = 0.45;

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

export function createScenePlayer(container, scene, { onEnd } = {}) {
  const total = sceneDuration(scene);
  const root = h(`
    <div class="player">
      <div class="stage-wrap">
        <div class="stage" style="width:${STAGE_W}px;height:${STAGE_H}px"></div>
        <button class="big-play" type="button" aria-label="Play the scene">▶</button>
      </div>
      <div class="controls">
        <button class="ctl ctl-play" type="button" aria-label="Play">▶</button>
        <input class="ctl-seek" type="range" min="0" max="${total}" step="0.1" value="0" aria-label="Scene position">
        <span class="ctl-time">0:00 / ${fmt(total)}</span>
        <button class="ctl ctl-mute" type="button" aria-label="Mute sound">🔊</button>
      </div>
    </div>`);
  container.append(root);

  const stage = root.querySelector('.stage');
  const wrap = root.querySelector('.stage-wrap');
  const playBtn = root.querySelector('.ctl-play');
  const bigPlay = root.querySelector('.big-play');
  const seek = root.querySelector('.ctl-seek');
  const time = root.querySelector('.ctl-time');
  const muteBtn = root.querySelector('.ctl-mute');

  // Scale the fixed 360x640 stage to whatever space the layout gives it.
  const fit = () => {
    const s = Math.min(wrap.clientWidth / STAGE_W, wrap.clientHeight / STAGE_H) || 1;
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  };
  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  fit();

  const master = gsap.timeline({ paused: true });
  let t = 0;
  scene.shots.forEach((shot, i) => {
    const { el, tl } = buildShot(shot, scene);
    stage.append(el);
    gsap.set(el, { autoAlpha: 0 });
    master.to(el, { autoAlpha: 1, duration: i === 0 ? 0.3 : FADE }, Math.max(0, t - (i === 0 ? 0 : FADE)));
    master.add(tl, t);
    if (i < scene.shots.length - 1) master.to(el, { autoAlpha: 0, duration: FADE }, t + shot.duration - FADE / 2);
    t += shot.duration;
  });

  // Show a real frame behind the play button instead of a black box.
  setSuppressed(true);
  master.seek(Math.min(5.8, total), false);
  setSuppressed(false);

  let started = false;
  let ended = false;
  const sync = () => {
    seek.value = started ? master.time().toFixed(1) : 0;
    time.textContent = `${fmt(started ? master.time() : 0)} / ${fmt(total)}`;
    const playing = master.isActive() && !master.paused();
    playBtn.textContent = playing ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    root.classList.toggle('is-playing', playing);
  };
  master.eventCallback('onUpdate', sync);
  master.eventCallback('onComplete', () => {
    sync();
    root.classList.add('is-ended');
    playBtn.textContent = '↺';
    playBtn.setAttribute('aria-label', 'Replay');
    if (!ended) { ended = true; onEnd?.(); }
  });

  const play = async () => {
    await unlockAudio();
    root.classList.add('has-started');
    root.classList.remove('is-ended');
    if (!started || master.progress() >= 1) { started = true; master.restart(); }
    else master.play();
    sync();
  };
  const pause = () => { master.pause(); sync(); };
  const toggle = () => (master.isActive() && !master.paused() ? pause() : play());

  playBtn.addEventListener('click', toggle);
  bigPlay.addEventListener('click', play);
  stage.addEventListener('click', () => { if (root.classList.contains('has-started')) toggle(); });
  seek.addEventListener('input', () => {
    started = true;
    root.classList.add('has-started');
    master.pause();
    // Run callbacks while seeking so counters and checkmarks show the right state.
    setSuppressed(true);
    master.seek(Number(seek.value), false);
    setSuppressed(false);
    sync();
  });
  muteBtn.addEventListener('click', () => {
    setMuted(!isMuted());
    muteBtn.textContent = isMuted() ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', isMuted() ? 'Unmute sound' : 'Mute sound');
  });

  return {
    play,
    pause,
    get time() { return master.time(); },
    duration: total,
    destroy() { master.kill(); ro.disconnect(); root.remove(); },
  };
}

// Same controls contract for teams that prefer a rendered MP4 file.
export function createVideoPlayer(container, src, { onEnd } = {}) {
  const root = h(`<div class="player player-mp4"><video src="${src}" controls playsinline preload="metadata"></video></div>`);
  container.append(root);
  const video = root.querySelector('video');
  video.addEventListener('ended', () => onEnd?.());
  return {
    play: () => video.play(),
    pause: () => video.pause(),
    get time() { return video.currentTime; },
    duration: video.duration,
    destroy() { video.pause(); root.remove(); },
  };
}
