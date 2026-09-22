const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Keep the expensive web regression measurable: transitions may publish the
// start and finish, but must never drive the React store on animation frames.
const timers = new Map();
let timerId = 0;
let finishCss = 0;
let beginCss = 0;
let notifications = 0;
const saved = new Map();
const mocks = {
  react: {
    useSyncExternalStore(subscribe, snapshot) {
      if (!notifications) subscribe(() => { notifications++; });
      return snapshot();
    },
  },
  'react-native': { Platform: { OS: 'web', select: values => values.default } },
  '@react-native-async-storage/async-storage': { __esModule: true, default: {
    getItem: async key => saved.get(key) ?? null,
    setItem: async (key, value) => { saved.set(key, value); },
  } },
  './state/appearance-transition': { beginAppearanceTransition: () => {
    beginCss++;
    return () => { finishCss++; };
  } },
};
const context = {
  exports: {}, require: name => { assert.ok(mocks[name], name); return mocks[name]; },
  setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
  clearTimeout: id => timers.delete(id),
  requestAnimationFrame: () => assert.fail('Web appearance must not run a React animation-frame loop'),
  cancelAnimationFrame: () => assert.fail('Unexpected animation frame'),
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/theme.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const api = context.exports;
(async () => {
  api.useTheme();
  api.setNightMode(true);
  assert.equal(notifications, 1);
  assert.equal(api.useTheme().transitioning, true);
  assert.equal(beginCss, 1);
  api.setNightMode(false); // Repeated taps cannot restart an active orbit.
  assert.equal(notifications, 1);
  [...timers.values()][0]();
  timers.clear();
  assert.equal(notifications, 2);
  assert.equal(api.useTheme().dark, true);
  assert.equal(api.useTheme().transitioning, false);
  assert.equal(finishCss, 1);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(saved.get('trundle.appearance.v1'), 'night');
  api.setNightMode(false, false);
  assert.equal(api.useTheme().dark, false);
  assert.equal(api.useTheme().transitioning, false);
  assert.equal(beginCss, 1); // Reduced motion doesn't start CSS animation.
  api.setNightMode(true);
  api.finishAppearanceTransition();
  assert.equal(api.useTheme().transitioning, false);
  assert.equal(timers.size, 0);
  assert.equal(beginCss, finishCss);
  console.log('Appearance regression checks passed: two updates per fade, persistence, interruption, and reduced motion.');
})().catch(error => { console.error(error); process.exitCode = 1; });
