// Turns a scene file into plain text, so the scene can be read instead of
// watched (screen readers, slow connections, or a quick review by the team).

export function sceneTranscript(scene) {
  const name = (key) => (key === 'me' ? 'You' : scene.cast[key]?.name ?? key);
  const lines = [];
  for (const shot of scene.shots) {
    if (shot.caption) lines.push({ kind: 'caption', text: shot.caption });
    if (shot.type === 'room') {
      lines.push({ kind: 'action', text: `${name(shot.actor)} is looking at their phone.` });
      for (const ev of shot.events ?? []) {
        if (ev.do === 'notify') lines.push({ kind: 'notify', text: `Notification from ${ev.title}: ${ev.text}` });
        if (ev.do === 'thought') lines.push({ kind: 'thought', text: `${name(shot.actor)} thinks: "${ev.text}"` });
        if (ev.do === 'phone-down') lines.push({ kind: 'action', text: `${name(shot.actor)} puts the phone face down.` });
      }
    }
    if (shot.type === 'phone' || shot.type === 'split') {
      lines.push({ kind: 'caption', text: `Chat: ${shot.chat.title}` });
      for (const m of shot.messages ?? []) {
        if (m.meme) lines.push({ kind: 'message', text: `${name(m.from)} posts an edited photo of Nusrat (hidden).` });
        else if (m.typing) lines.push({ kind: 'action', text: 'You start typing a reply, then stop.' });
        else lines.push({ kind: 'message', text: `${name(m.from)}: ${m.text}` });
      }
      if (shot.counter) lines.push({ kind: 'action', text: `${shot.counter.to} ${shot.counter.label}.` });
      if (shot.forward) lines.push({ kind: 'action', text: `Your thumb hovers over "Send" to forward the photo to ${shot.forward.target}.` });
    }
    if (shot.type === 'freeze') lines.push({ kind: 'caption', text: shot.text });
  }
  return lines;
}

export const sceneDuration = (scene) => scene.shots.reduce((t, s) => t + s.duration, 0);
