const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const compiled = ts.transpileModule(fs.readFileSync('src/state/onboarding-model.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('exports', 'module', compiled)(mod.exports, mod);
const { createOnboardingStore, parseOnboarding, reconcileDraft, ONBOARDING_KEY } = mod.exports;
const seed = () => ({ bedtime: 1320, morning: 420, scheduled: ['youtube'], always: ['x'] });
function memory() {
  const data = new Map();
  return { data, async getItem(key) { return data.get(key) ?? null; }, async setItem(key, value) { data.set(key, value); } };
}

test('new setup starts with existing preferences without sharing mutable lists', async () => {
  const original = seed(); const store = createOnboardingStore(memory());
  await store.load(original); original.scheduled.push('reddit');
  assert.equal(store.getSnapshot().record.step, 'welcome');
  assert.deepEqual(store.getSnapshot().record.draft.scheduled, ['youtube']);
});

test('invalid, corrupted, or unknown-version records are not silently overwritten', () => {
  for (const raw of ['{', 'null', '{}', JSON.stringify({ ...parseOnboarding(null, seed()), version: 2 }), JSON.stringify({ ...parseOnboarding(null, seed()), draft: { ...seed(), morning: -1 } })]) {
    assert.throws(() => parseOnboarding(raw, seed()));
  }
});

test('read failures retain saved settings and can retry', async () => {
  const storage = memory(); let fail = true;
  storage.getItem = async () => { if (fail) throw new Error('offline'); return null; };
  const store = createOnboardingStore(storage);
  await store.load(seed()); assert.equal(store.getSnapshot().record, null); assert.ok(store.getSnapshot().error);
  fail = false; await store.load(seed()); assert.deepEqual(store.getSnapshot().record.draft, seed());
});

test('rapid draft edits during an in-flight write are coalesced without losing the newest selection', async () => {
  const storage = memory(); let release; let calls = 0;
  const firstWrite = new Promise(resolve => { release = resolve; });
  const originalSet = storage.setItem;
  storage.setItem = async (key, value) => { if (++calls === 1) await firstWrite; await originalSet(key, value); };
  const store = createOnboardingStore(storage); await store.load(seed());
  store.updateDraft({ scheduled: ['instagram'] });
  store.updateDraft({ scheduled: ['instagram', 'youtube'] });
  store.updateDraft({ always: ['x', 'reddit'] });
  release(); assert.equal(await store.flush(), true);
  const saved = JSON.parse(storage.data.get(ONBOARDING_KEY));
  assert.deepEqual(saved.draft.scheduled, ['instagram', 'youtube']);
  assert.deepEqual(saved.draft.always, ['x', 'reddit']);
  assert.equal(store.getSnapshot().dirty, false);
});

test('failed draft writes keep the draft and block navigation until retry succeeds', async () => {
  const storage = memory(); const originalSet = storage.setItem; let fail = true;
  storage.setItem = async (...args) => { if (fail) throw new Error('quota'); await originalSet(...args); };
  const store = createOnboardingStore(storage); await store.load(seed());
  store.updateDraft({ bedtime: 1380 }); await store.flush();
  assert.equal(store.getSnapshot().record.draft.bedtime, 1380); assert.equal(store.getSnapshot().dirty, true);
  assert.equal(await store.goTo('apps'), false); assert.equal(store.getSnapshot().record.step, 'welcome');
  fail = false; assert.equal(await store.goTo('apps'), true);
  assert.equal(JSON.parse(storage.data.get(ONBOARDING_KEY)).draft.bedtime, 1380);
});

test('failed transition does not advance the visible step or claim completion', async () => {
  const storage = memory(); storage.setItem = async () => { throw new Error('quota'); };
  const store = createOnboardingStore(storage); await store.load(seed());
  assert.equal(await store.goTo('schedule'), false);
  assert.equal(store.getSnapshot().record.step, 'welcome');
  assert.equal(await store.defer(), false);
  assert.equal(store.getSnapshot().record.status, 'in-progress');
});

test('step and partially entered answers survive a new app instance', async () => {
  const storage = memory(); const first = createOnboardingStore(storage); await first.load(seed());
  first.updateDraft({ morning: 480 }); await first.goTo('morning');
  const reopened = createOnboardingStore(storage); await reopened.load(seed());
  assert.equal(reopened.getSnapshot().record.step, 'morning');
  assert.equal(reopened.getSnapshot().record.draft.morning, 480);
});

test('exploring preserves the draft and subsequent external settings changes take priority on resume', async () => {
  const storage = memory(); const store = createOnboardingStore(storage); await store.load(seed());
  store.updateDraft({ bedtime: 1380, scheduled: ['instagram'] }); await store.goTo('apps'); await store.defer();
  assert.equal(store.getSnapshot().record.status, 'deferred');
  const changed = { ...seed(), morning: 480, always: ['reddit'] };
  await store.resume(changed);
  assert.deepEqual(store.getSnapshot().record.draft, { bedtime: 1380, morning: 480, scheduled: ['instagram'], always: ['reddit'] });
  assert.equal(store.getSnapshot().record.step, 'apps');
});

test('external edits to the same field win over an older draft', () => {
  const record = parseOnboarding(null, seed()); record.draft.bedtime = 1380;
  assert.equal(reconcileDraft(record, { ...seed(), bedtime: 1260 }).draft.bedtime, 1260);
});

test('unsuccessful preference commit never marks onboarding complete', async () => {
  const storage = memory(); const store = createOnboardingStore(storage); await store.load(seed()); await store.goTo('review');
  assert.equal(await store.complete(async () => false), false);
  assert.equal(store.getSnapshot().record.status, 'in-progress');
  assert.equal(JSON.parse(storage.data.get(ONBOARDING_KEY)).status, 'in-progress');
});

test('completion commits preferences before the marker; failed marker is safely retryable', async () => {
  const storage = memory(); const store = createOnboardingStore(storage); await store.load(seed()); await store.goTo('review');
  let applied = null; let failMarker = true; const originalSet = storage.setItem;
  storage.setItem = async (key, value) => {
    if (JSON.parse(value).status === 'completed') { assert.deepEqual(applied, seed()); if (failMarker) throw new Error('quota'); }
    await originalSet(key, value);
  };
  const apply = async draft => { applied = draft; return true; };
  assert.equal(await store.complete(apply), false);
  assert.equal(store.getSnapshot().record.status, 'in-progress');
  failMarker = false; assert.equal(await store.complete(apply), true);
  const reopened = createOnboardingStore(storage); await reopened.load(applied);
  assert.equal(reopened.getSnapshot().record.status, 'completed');
});

test('double finish taps cannot apply preferences twice concurrently', async () => {
  const store = createOnboardingStore(memory()); await store.load(seed());
  let release; let calls = 0; const wait = new Promise(resolve => { release = resolve; });
  const first = store.complete(async () => { calls++; await wait; return true; });
  const second = await store.complete(async () => { calls++; return true; });
  assert.equal(second, false); release(); await first; assert.equal(calls, 1);
});

test('restart recovers unreadable onboarding without erasing other stored data', async () => {
  const storage = memory(); storage.data.set(ONBOARDING_KEY, '{'); storage.data.set('preferences', 'untouched');
  const store = createOnboardingStore(storage); await store.load(seed());
  assert.equal(await store.restart(seed()), true);
  assert.equal(store.getSnapshot().record.step, 'welcome');
  assert.equal(storage.data.get('preferences'), 'untouched');
});

test('incomplete equal-time drafts remain recoverable for inline correction', async () => {
  const storage = memory(); const store = createOnboardingStore(storage); await store.load(seed());
  store.updateDraft({ bedtime: 420 }); await store.flush();
  const reopened = createOnboardingStore(storage); await reopened.load(seed());
  assert.equal(reopened.getSnapshot().record.draft.bedtime, 420);
});

test('synchronous storage exceptions also leave load and save retryable', async () => {
  const storage = memory(); const originalGet = storage.getItem; const originalSet = storage.setItem;
  storage.getItem = () => { throw new Error('security error'); };
  const store = createOnboardingStore(storage); await store.load(seed());
  storage.getItem = originalGet; await store.load(seed());
  storage.setItem = () => { throw new Error('security error'); };
  store.updateDraft({ morning: 500 }); assert.equal(await store.flush(), false);
  storage.setItem = originalSet; assert.equal(await store.flush(), true);
  assert.equal(JSON.parse(storage.data.get(ONBOARDING_KEY)).draft.morning, 500);
});

test('old five-screen records keep their progress, settings, and completion status', () => {
  for (const status of ['in-progress', 'deferred', 'completed']) {
    const legacy = { version: 1, status, step: 'apps', draft: seed(), base: seed() };
    const migrated = parseOnboarding(JSON.stringify(legacy), seed());
    assert.equal(migrated.step, 'apps');
    assert.equal(migrated.status, status);
    assert.deepEqual(migrated.draft, seed());
    assert.deepEqual(migrated.answers, {});
  }
});

test('personal answers persist through navigation, deferral, restart of app, and completion', async () => {
  const storage = memory(); const store = createOnboardingStore(storage); await store.load(seed());
  store.updateAnswers({ goal: 'morning', habit: 'both', ritual: 'read' });
  await store.goTo('plan'); await store.defer();
  const reopened = createOnboardingStore(storage); await reopened.load(seed());
  assert.deepEqual(reopened.getSnapshot().record.answers, { goal: 'morning', habit: 'both', ritual: 'read' });
  await reopened.resume({ ...seed(), morning: 480 });
  assert.equal(reopened.getSnapshot().record.step, 'plan');
  let applied;
  await reopened.complete(async draft => { applied = draft; return true; });
  assert.equal(applied.morning, 480);
  assert.equal(applied.answers, undefined, 'Personal answers must not leak into restriction settings');
  assert.equal(JSON.parse(storage.data.get(ONBOARDING_KEY)).answers.ritual, 'read');
});

test('failed answer writes block advancing, and retry preserves simultaneous setting edits', async () => {
  const storage = memory(); const write = storage.setItem; let fail = true;
  storage.setItem = async (...args) => { if (fail) throw Error('quota'); await write(...args); };
  const store = createOnboardingStore(storage); await store.load(seed());
  store.updateAnswers({ goal: 'rest' }); store.updateDraft({ bedtime: 1380 });
  assert.equal(await store.goTo('habit'), false);
  fail = false; assert.equal(await store.goTo('habit'), true);
  const saved = JSON.parse(storage.data.get(ONBOARDING_KEY));
  assert.equal(saved.answers.goal, 'rest'); assert.equal(saved.draft.bedtime, 1380);
});

test('unknown personal answers are discarded and a cleared answer stays cleared', async () => {
  const raw = { ...parseOnboarding(null, seed()), answers: { goal: 'unknown', ritual: 'read', habit: ['bedtime'], injected: 'ignored' } };
  assert.deepEqual(parseOnboarding(JSON.stringify(raw), seed()).answers, { ritual: 'read' });
  const storage = memory(); const store = createOnboardingStore(storage); await store.load(seed());
  store.updateAnswers({ ritual: 'read' }); await store.flush();
  store.updateAnswers({ ritual: undefined }); await store.flush();
  const reopened = createOnboardingStore(storage); await reopened.load(seed());
  assert.equal(reopened.getSnapshot().record.answers.ritual, undefined);
  await reopened.restart(seed()); assert.equal(reopened.getSnapshot().record.answers, undefined);
});

test('a completed routine can reopen at its ritual without losing answers or schedule', async () => {
  const store = createOnboardingStore(memory()); await store.load(seed());
  store.updateAnswers({ goal: 'rest', ritual: 'quiet' });
  await store.complete(async () => true);
  assert.equal(await store.resume({ ...seed(), bedtime: 1380 }, 'ritual'), true);
  assert.equal(store.getSnapshot().record.step, 'ritual');
  assert.equal(store.getSnapshot().record.status, 'in-progress');
  assert.equal(store.getSnapshot().record.answers.ritual, 'quiet');
  assert.equal(store.getSnapshot().record.draft.bedtime, 1380);
});
