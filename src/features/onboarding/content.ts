/**
 * Onboarding copy and choices. Voice rules: docs/VOICE.md (brief, deadpan, no
 * exclamation points, no guilt, no statistics in Trundle's mouth).
 * Flow and evidence: docs/ONBOARDING_CONVERSION.md.
 */

export type Choice<T> = { label: string; value: T };

export type Answers = {
  nights?: string;
  nightMinutes?: number;
  nightsPerWeek?: number;
  /** The nights picked on the day circles, Monday = 0. Their count is `nightsPerWeek`. */
  scrollDays?: number[];
  bedtime: number;
  wake: number;
  morningMinutes?: number;
  /** Years. */
  age?: number;
  alarm?: string;
  /** What they've tried before. Only feeds his reply on the next screen. */
  tried?: string;
  timeBack?: string;
  apps: string[];
  plan: 'annual' | 'monthly' | 'lifetime';
  /** Works nights: the schedule is a block window, not a sleep window. */
  shift?: boolean;
  /** "Remind me before the trial ends" on the paywall. On by default: the reminder is a promise. */
  remindTrial: boolean;
};

export const initialAnswers: Answers = {
  bedtime: 23 * 60 + 30,
  wake: 7 * 60,
  apps: [],
  plan: 'annual',
  remindTrial: true,
};

export const STEPS = [
  'hello',
  'deal',
  'intro',
  'nights',
  'night-minutes',
  'nights-per-week',
  'morning-minutes',
  'stat',
  'age',
  'alarm',
  'tried',
  'tried-echo',
  'time-back',
  'math',
  'reveal',
  'bedtime',
  'wake',
  'tomorrow',
  'screen-time',
  'apps',
  'motion',
  'ready',
  'commit',
  'offer',
  'plans',
  'armed',
  'first-morning',
] as const;

export type StepId = (typeof STEPS)[number] | 'declined' | 'under-13';

/**
 * Steps that show the progress bar: the quiz and setup only. Welcome, offer and
 * post-purchase screens hide it, so the paywall never reads as one more step.
 */
export const PROGRESS_STEPS: StepId[] = [
  'intro',
  'nights',
  'night-minutes',
  'nights-per-week',
  'morning-minutes',
  'stat',
  'age',
  'alarm',
  'tried',
  'tried-echo',
  'time-back',
  'math',
  'reveal',
  'bedtime',
  'wake',
  'tomorrow',
  'screen-time',
  'apps',
  'motion',
  'ready',
];

// Values are deliberately at or below each bucket's midpoint, so the number never overstates.
export const NIGHTS: Choice<string>[] = [
  { label: 'One more video. Then twelve more.', value: 'one-more' },
  { label: "I can't sleep, so I scroll.", value: 'cant-sleep' },
  { label: 'I lose track of time.', value: 'lose-track' },
  { label: 'Honestly, all of it.', value: 'all' },
];

export const NIGHT_MINUTES: Choice<number>[] = [
  { label: 'Under 10 minutes', value: 5 },
  { label: '10–30 minutes', value: 20 },
  { label: '30–60 minutes', value: 45 },
  { label: '1–2 hours', value: 90 },
  { label: '2+ hours', value: 150 },
];

/**
 * His line on the math loader, echoing "What happens most nights?". Deadpan, and never
 * a health claim: "can't sleep" gets sympathy, not advice.
 */
export const NIGHTS_ECHO: Record<string, string> = {
  'one-more': '“One more video.” Counting all of them.',
  'cant-sleep': 'Can’t sleep, you said. Same. Counting anyway.',
  'lose-track': 'You lose track of time. I don’t. Counting.',
  all: 'All of it, you said. Counting all of it.',
};

export const MORNING_MINUTES: Choice<number>[] = [
  { label: 'Under 5 minutes', value: 3 },
  { label: '5–15 minutes', value: 10 },
  { label: '15–30 minutes', value: 20 },
  { label: '30–60 minutes', value: 45 },
  { label: '1+ hour', value: 75 },
];

/** The age wheel's range and starting point. Under 13 leads to the age gate. */
export const AGE_MIN = 10;
export const AGE_MAX = 99;
export const AGE_DEFAULT = 22;

export const ALARM: Choice<string>[] = [
  { label: 'Wrecked', value: 'wrecked' },
  { label: 'Groggy', value: 'groggy' },
  { label: "Fine (I'm lying)", value: 'lying' },
  { label: 'Fine (really)', value: 'fine' },
];

/** His reply to the alarm answer, on the page before the paywall. Deadpan, never a health claim. */
export const ALARM_ECHO: Record<string, string> = {
  wrecked: 'Wrecked, you said. Same. We walk anyway.',
  groggy: 'Groggy, you said. So am I. We walk anyway.',
  lying: '“Fine,” you said. Sure. We walk anyway.',
  fine: 'Fine mornings, you said. Let’s keep them.',
};

// Single choice, so the question asks for the one that lasted longest.
export const TRIED: Choice<string>[] = [
  { label: 'Screen Time limits', value: 'screen-time' },
  { label: 'Another blocker app', value: 'blocker' },
  { label: 'Willpower', value: 'willpower' },
  { label: 'Phone in another room', value: 'other-room' },
  { label: 'Nothing yet', value: 'nothing' },
];

/**
 * His reply to "what have you tried?": the objection, then how Trundle differs. The
 * body stays literal, and never claims there's no way out (emergency unlock exists).
 */
export const TRIED_ECHO: Record<string, { line: string; body: string }> = {
  'screen-time': {
    line: 'Screen Time has an Ignore button. I don’t.',
    body: 'Its limits end with one tap. Mine end after 200 steps. There’s an emergency unlock, but it takes more than a tap.',
  },
  blocker: {
    line: 'Clocks don’t check if you’re up. I do.',
    body: 'Most blockers switch off at a set time, even if you’re still in bed. Your apps stay asleep until you’ve walked 200 steps.',
  },
  willpower: {
    line: 'Willpower goes to bed before you do.',
    body: 'So I don’t ask for any. The apps are asleep until you’ve walked 200 steps.',
  },
  'other-room': {
    line: 'And the alarm’s in there with it.',
    body: 'Keep the phone by the bed. The apps stay asleep either way, until you’ve walked 200 steps.',
  },
  nothing: {
    line: 'I’m your first, then. Be gentle.',
    body: 'The apps you pick sleep at bedtime. 200 steps in the morning wakes them up.',
  },
};

export const TIME_BACK: Choice<string>[] = [
  { label: 'Sleep more', value: 'sleep' },
  { label: 'Read', value: 'read' },
  { label: 'Work out', value: 'workout' },
  { label: 'Slow mornings', value: 'mornings' },
  { label: 'Something else', value: 'else' },
];

/** Paywall headline, echoing the answer to "what would you do with them?" */
export const OFFER_HEADLINES: Record<string, string> = {
  sleep: 'Earlier nights. For both of us.',
  read: 'Reading, then. Books don’t autoplay.',
  workout: 'Workouts, then. I’ll count the first 200.',
  mornings: 'Slow mornings. My favorite kind.',
  else: 'Your nights back. Mine too.',
};

/** For people who barely use their phone in bed: the pitch is mornings, not a cost. */
export const LIGHT_OFFER_HEADLINE = 'Mornings, then. Mine too.';

/** His reaction on the statistic screen, echoing "how long are you on your phone before you get up?" */
export const MORNING_ECHO: Record<number, string> = {
  3: 'Under five? We’ll see tomorrow.',
  10: 'You said ten minutes. I said nothing.',
  20: 'You said twenty minutes. I said nothing.',
  45: 'You said forty-five minutes. I said nothing.',
  75: 'You said an hour. I said nothing. Loudly.',
};

/**
 * Preview prices. In the real app these come from StoreKit (localized display prices),
 * and every trial string is gated on intro-offer eligibility.
 */
export const PRICES = {
  annual: 39.99,
  monthly: 9.99,
  /** One-time purchase, no trial. In line with Jomo ($99.99) and AppBlock ($89.99). */
  lifetime: 99.99,
  trialDays: 7,
  trialEligible: true,
} as const;

export const money = (value: number) => `$${value.toFixed(2)}`;

/** "Save 66%": the annual plan against twelve months of the monthly plan. */
export const annualSavings = () => Math.floor((1 - PRICES.annual / (PRICES.monthly * 12)) * 100);
