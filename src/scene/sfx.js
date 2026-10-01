// Tiny synthesized sound effects (no audio files to download).
// The AudioContext only starts after a user gesture, as browsers require.

let ctx = null;
let muted = false;
let suppressed = false;

export function unlockAudio() {
  if (ctx) return ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return Promise.resolve();
  ctx = new AC();
  return Promise.resolve();
}

export const setMuted = (value) => { muted = value; };
export const isMuted = () => muted;
// While the player seeks, timeline callbacks replay; this keeps them silent.
export const setSuppressed = (value) => { suppressed = value; };

function tone({ freq = 440, to = freq, type = 'sine', dur = 0.12, gain = 0.12, delay = 0 }) {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ dur = 0.3, gain = 0.2, delay = 0, cutoff = 1800 }) {
  const t = ctx.currentTime + delay;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = cutoff;
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start(t);
}

const SOUNDS = {
  pop: () => tone({ freq: 880, to: 620, dur: 0.08, gain: 0.08 }),
  buzz: () => { tone({ freq: 140, type: 'square', dur: 0.12, gain: 0.03 }); tone({ freq: 140, type: 'square', dur: 0.12, gain: 0.03, delay: 0.18 }); },
  type: () => noise({ dur: 0.04, gain: 0.05, cutoff: 3000 }),
  heartbeat: () => { tone({ freq: 70, to: 45, dur: 0.14, gain: 0.35 }); tone({ freq: 65, to: 40, dur: 0.16, gain: 0.28, delay: 0.22 }); },
  crack: () => { noise({ dur: 0.5, gain: 0.35, cutoff: 900 }); tone({ freq: 220, to: 60, dur: 0.4, type: 'sawtooth', gain: 0.05 }); },
  good: () => { tone({ freq: 523, dur: 0.14, gain: 0.1 }); tone({ freq: 784, dur: 0.22, gain: 0.1, delay: 0.12 }); },
  bad: () => { tone({ freq: 311, to: 233, dur: 0.18, type: 'triangle', gain: 0.12 }); tone({ freq: 233, to: 155, dur: 0.3, type: 'triangle', gain: 0.12, delay: 0.16 }); },
  tick: () => tone({ freq: 1600, dur: 0.03, gain: 0.04, type: 'square' }),
};

export function play(name) {
  if (muted || suppressed || !ctx || ctx.state !== 'running') return;
  try { SOUNDS[name]?.(); } catch { /* sound is optional */ }
}
