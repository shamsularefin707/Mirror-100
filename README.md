# Mirror 100

**Live the other side of your online choices.**

Mirror 100 is a web game about responsible digital citizenship, built as a team demo for the Digital Khichuri Challenge 2026 (Theme: Digital Literacy & Responsible Digital Citizenship).

The player enters their age, which becomes their starting maturity age. They watch a short animated scene, answer questions about what they would do, and see a Perspective Shift after each answer. Responsible choices add years and harmful ones take years away. The Mirror Report at the end shows their mental age and how responsible a digital citizen they are.

This demo contains **Level 1: The Cyberbullying Dilemma**.

## Run it

Needs Node 18 or newer.

```bash
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the build at http://localhost:4173
```

The build is a static site. `dist/` can be hosted anywhere (GitHub Pages, Netlify, any web server) and works from a sub-folder.

## Test it

```bash
npm test           # unit tests: scoring rules and content checks
npm run validate   # checks every scenario file
npm run test:e2e   # plays the whole game in a real browser (Playwright)
```

## How scoring works

- Starting maturity age = the player's real age (13 to 60).
- Each option has a `years` value. Scenario 1 uses +5 for the responsible option and −5 for the others. Other scenarios can use any whole number, for example +10 or −8.
- Mental age = real age + all the years earned, kept between 0 and 100.
- "You are X% responsible digital citizen" = responsible answers ÷ all answers.
- Ranks: 75% and above is a Responsible Digital Citizen, 50 to 74% is a Growing Digital Citizen, and below 50% is a Digital Citizen in Training.

The rules live in `src/engine/scoring.js` and do not touch the page, so they are easy to test or reuse.

## Project layout

```
src/
  engine/       scoring rules, shuffling, content validation (no DOM)
  content/      scenarios: one folder per level, picked up automatically
  scene/        the animated "video": characters, backgrounds, shot types, player, sound effects
  screens/      home, profile, intro, video, question, perspective shift, report
  ui/           shared helpers and the maturity meter
  styles/       CSS
tests/
  unit/         Vitest
  e2e/          Playwright
```

## Adding a new scenario

No code changes are needed. Create a folder in `src/content/scenarios/`, for example `phishing/`, with:

1. **`scenario.json`**: the title, `order`, setup line, questions, options, years and Perspective Shift lines. Copy `cyberbullying/scenario.json` as a template.
2. **`scene.json`**: the animated scene, built from four reusable shot types:
   - `room`: a character in a room, with timed notifications, expression changes, thought bubbles, and the phone being put down
   - `phone`: a chat screen with timed messages, typing, reactions, a hidden photo, and an optional "Forward to" sheet with a heartbeat effect
   - `split`: a chat on top and a rising view counter below
   - `freeze`: the cracked mirror with "What will you do?"

   Cast members reuse one character rig. Change `skin`, `hair`, `hairStyle` (`short`, `quiff`, `buzz`, `curly`, `long`, `hijab`), `shirt` and `accent` to make new people.

   To use a rendered video instead, set `"video": { "type": "mp4", "src": "videos/phishing.mp4" }` and put the file in `public/videos/`.

3. Run `npm run validate` and `npm test`. Levels appear in the game in `order`.

An optional `"audiences": ["school", "university"]` list limits a scenario to players who picked those roles.

## Accessibility and low bandwidth

- The whole scene can be read as text ("Read the scene instead"), generated from the scene file.
- Sound effects are synthesized in the browser, so there are no audio files to download. They can be muted.
- Respects "reduce motion" settings, works by keyboard, and is built for phones first.
- The edited photo in the story is never shown. It always appears blurred and hidden.

## Before showing this to real players

- Check the help lines on the report (999, and 109 for violence against women and children) and add any official cyber-harassment contacts you want to recommend.
- Option C in Question 1 says spreading edited photos is a crime. Confirm the exact wording against Bangladesh's current cyber law before you cite it by name.
