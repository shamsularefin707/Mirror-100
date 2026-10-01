// The game flow. Screens are plain functions that get a context and return
// an element; this file decides which screen comes next.

import { gsap } from 'gsap';
import { createSession, recordAnswer, mentalAge } from './engine/scoring.js';
import { shuffle } from './engine/shuffle.js';
import { scenariosFor } from './content/index.js';
import { prefersReducedMotion } from './ui/dom.js';
import { homeScreen } from './screens/home.js';
import { profileScreen } from './screens/profile.js';
import { introScreen } from './screens/intro.js';
import { videoScreen } from './screens/video.js';
import { questionScreen } from './screens/question.js';
import { shiftScreen } from './screens/shift.js';
import { reportScreen } from './screens/report.js';

const SCREENS = {
  home: homeScreen,
  profile: profileScreen,
  intro: introScreen,
  video: videoScreen,
  question: questionScreen,
  shift: shiftScreen,
  report: reportScreen,
};

export function startApp(root) {
  const state = {
    session: null,
    scenarios: [],
    scenarioIndex: 0,
    questionIndex: 0,
    lastAnswer: null,
  };
  let current = null;

  const ctx = {
    state,
    get scenario() { return state.scenarios[state.scenarioIndex]; },
    get question() { return ctx.scenario.questions[state.questionIndex]; },
    get age() { return state.session ? mentalAge(state.session) : 0; },

    go(name) {
      const next = SCREENS[name](ctx);
      next.dataset.screen = name;
      const prev = current;
      current = next;
      root.append(next);
      window.scrollTo({ top: 0 });
      const focusTarget = next.querySelector('[data-autofocus]') ?? next.querySelector('h1, h2');
      if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus({ preventScroll: true }); }
      if (prev) {
        prev._cleanup?.();
        prev.remove();
      }
      if (!prefersReducedMotion()) {
        gsap.fromTo(next, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' });
      }
    },

    begin({ age, role }) {
      state.session = createSession({ realAge: age, role });
      state.scenarios = scenariosFor(role);
      state.scenarioIndex = 0;
      state.questionIndex = 0;
      ctx.go('intro');
    },

    shuffledOptions() {
      return shuffle(ctx.question.options);
    },

    answer(option) {
      const before = ctx.age;
      state.session = recordAnswer(state.session, ctx.scenario.id, ctx.question, option);
      state.lastAnswer = { option, question: ctx.question, before, after: ctx.age };
      ctx.go('shift');
    },

    next() {
      if (state.questionIndex < ctx.scenario.questions.length - 1) {
        state.questionIndex += 1;
        ctx.go('question');
      } else if (state.scenarioIndex < state.scenarios.length - 1) {
        state.scenarioIndex += 1;
        state.questionIndex = 0;
        ctx.go('intro');
      } else {
        ctx.go('report');
      }
    },

    restart() {
      state.session = null;
      ctx.go('home');
    },
  };

  ctx.go('home');
  return ctx;
}
