// Kept independent of React/native APIs so storage and interruption behavior can be tested.
export const ONBOARDING_KEY = 'trundle.onboarding.v1';
export const ONBOARDING_STEPS = ['welcome', 'goal', 'habit', 'insight', 'bedtime', 'schedule', 'morning-time', 'morning', 'apps', 'always', 'access', 'ritual', 'plan', 'review'] as const;
export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export const ANSWER_OPTIONS = {
  goal: ['rest', 'morning', 'present'],
  habit: ['bedtime', 'morning', 'both'],
  ritual: ['read', 'stretch', 'quiet'],
} as const;
export type SetupAnswers = { [K in keyof typeof ANSWER_OPTIONS]?: typeof ANSWER_OPTIONS[K][number] };
export type SetupDraft = { bedtime: number; morning: number; scheduled: string[]; always: string[] };
export type OnboardingRecord = {
  version: 1;
  status: 'in-progress' | 'deferred' | 'completed';
  step: OnboardingStep;
  draft: SetupDraft;
  base: SetupDraft;
  // Optional for migration from the original five-page preview; kept out of app restrictions.
  answers?: SetupAnswers;
};
type Storage = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void> };
type Snapshot = { record: OnboardingRecord | null; ready: boolean; busy: boolean; saving: boolean; dirty: boolean; error: string };
const copy = (seed: SetupDraft): SetupDraft => ({ bedtime: seed.bedtime, morning: seed.morning, scheduled: [...seed.scheduled], always: [...seed.always] });
const fresh = (seed: SetupDraft): OnboardingRecord => ({ version: 1, status: 'in-progress', step: 'welcome', draft: copy(seed), base: copy(seed) });

function validDraft(value: unknown): value is SetupDraft {
  if (!value || typeof value !== 'object') return false;
  const data = value as SetupDraft;
  return [data.bedtime, data.morning].every(time => Number.isInteger(time) && time >= 0 && time < 1440)
    && [data.scheduled, data.always].every(list => Array.isArray(list) && list.every(id => typeof id === 'string'));
}

export function parseOnboarding(raw: string | null, seed: SetupDraft): OnboardingRecord {
  if (raw === null) return fresh(seed);
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Invalid setup');
  const data = value as OnboardingRecord;
  if (data.version !== 1 || !['in-progress', 'deferred', 'completed'].includes(data.status)
    || !ONBOARDING_STEPS.includes(data.step) || !validDraft(data.draft) || !validDraft(data.base)) throw new Error('Invalid setup');
  const answers: SetupAnswers = {};
  if (data.answers && typeof data.answers === 'object') {
    for (const key of Object.keys(ANSWER_OPTIONS) as (keyof SetupAnswers)[]) {
      const answer = data.answers[key];
      if (typeof answer === 'string' && (ANSWER_OPTIONS[key] as readonly string[]).includes(answer)) Object.assign(answers, { [key]: answer });
    }
  }
  return { version: 1, status: data.status, step: data.step, draft: copy(data.draft), base: copy(data.base), answers };
}

// Changes made in the main app after “Explore first” win over an older setup draft.
export function reconcileDraft(record: OnboardingRecord, seed: SetupDraft): OnboardingRecord {
  const draft = copy(record.draft);
  for (const key of ['bedtime', 'morning'] as const) {
    if (seed[key] !== record.base[key]) draft[key] = seed[key];
  }
  for (const key of ['scheduled', 'always'] as const) {
    if (JSON.stringify(seed[key]) !== JSON.stringify(record.base[key])) draft[key] = [...seed[key]];
  }
  return { ...record, draft, base: copy(seed) };
}

export function createOnboardingStore(storage: Storage) {
  let snapshot: Snapshot = { record: null, ready: false, busy: false, saving: false, dirty: false, error: '' };
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<Snapshot>) => { snapshot = { ...snapshot, ...patch }; listeners.forEach(listener => listener()); };
  let revision = 0;
  let writing: Promise<boolean> | null = null;
  let loading: Promise<void> | null = null;

  const flush = (): Promise<boolean> => {
    if (writing) return writing;
    if (!snapshot.record) return Promise.resolve(false);
    if (!snapshot.dirty) return Promise.resolve(true);
    publish({ saving: true, error: '' });
    writing = Promise.resolve().then(async () => {
      try {
        // Coalesce rapid selections, but never let an older async write win.
        while (snapshot.dirty) {
          const savedRevision = revision;
          await storage.setItem(ONBOARDING_KEY, JSON.stringify(snapshot.record));
          if (savedRevision === revision) publish({ dirty: false });
        }
        return true;
      } catch {
        publish({ error: 'Your latest changes haven’t saved. Keep this screen open and try again.' });
        return false;
      } finally {
        writing = null;
        publish({ saving: false });
      }
    });
    return writing;
  };

  const writeTransition = async (next: OnboardingRecord) => {
    try {
      await storage.setItem(ONBOARDING_KEY, JSON.stringify(next));
      revision++;
      publish({ record: next, ready: true, dirty: false, error: '' });
      return true;
    } catch {
      publish({ error: 'Couldn’t save your place. Your choices are still here. Please try again.' });
      return false;
    }
  };

  const transition = async (next: (record: OnboardingRecord) => OnboardingRecord) => {
    if (snapshot.busy || !snapshot.record) return false;
    publish({ busy: true, error: '' });
    try {
      if (!await flush()) return false;
      return await writeTransition(next(snapshot.record!));
    } finally { publish({ busy: false }); }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load(seed: SetupDraft) {
      if (loading) return loading;
      if (snapshot.ready && snapshot.record) return Promise.resolve();
      loading = Promise.resolve().then(async () => {
        try {
          const record = parseOnboarding(await storage.getItem(ONBOARDING_KEY), seed);
          publish({ record: reconcileDraft(record, seed), ready: true, error: '' });
        } catch { publish({ ready: true, error: 'Couldn’t read your setup progress. Retry, or start setup again. Your saved routine is safe.' }); }
        finally { loading = null; }
      });
      return loading;
    },
    updateDraft(patch: Partial<SetupDraft>) {
      if (!snapshot.record || snapshot.busy) return;
      revision++;
      publish({ record: { ...snapshot.record, draft: copy({ ...snapshot.record.draft, ...patch }) }, dirty: true, error: '' });
      void flush();
    },
    updateAnswers(patch: SetupAnswers) {
      if (!snapshot.record || snapshot.busy) return;
      revision++;
      publish({ record: { ...snapshot.record, answers: { ...snapshot.record.answers, ...patch } }, dirty: true, error: '' });
      void flush();
    },
    flush,
    goTo: (step: OnboardingStep) => transition(record => ({ ...record, step })),
    defer: () => transition(record => ({ ...record, status: 'deferred' })),
    resume: (seed: SetupDraft, step?: OnboardingStep) => transition(record => ({ ...reconcileDraft(record, seed), step: step ?? record.step, status: 'in-progress' })),
    async restart(seed: SetupDraft) {
      if (snapshot.busy) return false;
      publish({ busy: true, error: '' });
      try {
        if (writing) await writing;
        return await writeTransition(fresh(seed));
      } finally { publish({ busy: false }); }
    },
    async complete(apply: (draft: SetupDraft) => Promise<boolean>) {
      if (snapshot.busy || !snapshot.record) return false;
      publish({ busy: true, error: '' });
      try {
        if (!await flush()) return false;
        const record = snapshot.record!;
        if (!await apply(copy(record.draft))) {
          publish({ error: 'Couldn’t save this routine. Check the details below, then try again.' });
          return false;
        }
        // Commit preferences first. If this marker fails, retrying is safe and idempotent.
        return await writeTransition({ ...record, status: 'completed', base: copy(record.draft) });
      } catch {
        publish({ error: 'Couldn’t finish saving your routine. Your setup is still here. Please try again.' });
        return false;
      } finally { publish({ busy: false }); }
    },
  };
}
