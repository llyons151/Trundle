import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { DisplayFont, Nocturne } from '@/constants/nocturne';

import {
  AGE_DEFAULT,
  AGE_MAX,
  AGE_MIN,
  ALARM,
  ALARM_ECHO,
  initialAnswers,
  LIGHT_OFFER_HEADLINE,
  MORNING_MINUTES,
  NIGHT_MINUTES,
  NIGHTS,
  NIGHTS_ECHO,
  NIGHTS_PER_WEEK,
  OFFER_HEADLINES,
  PREVIEW_APPS,
  PRICES,
  annualSavings,
  money,
  PROGRESS_STEPS,
  STEPS,
  TIME_BACK,
  TRIED,
  TRIED_ECHO,
  type Answers,
  type StepId,
} from './content';
import {
  dateFromToday,
  estimate,
  formatClock,
  formatHalves,
  formatHoursFromMinutes,
  formatWhen,
  isInsideBedtime,
  lifetimeSentence,
  yearSentence,
  weeklyAmount,
  type Estimate,
} from './estimate';
import * as haptic from './haptics';
import { FLIGHT_MS, moonBottom, NightSky } from './night-sky';
import { NUMBER_FONT, RollingNumber } from './rolling-number';
import { Reveal, type TextMotion } from './motion';
import { useCompact } from './layout';
import { fitSquares, RevealGrid } from './reveal-grid';
import {
  Body,
  Chip,
  Eyebrow,
  FooterEnter,
  HoldButton,
  Options,
  PreviewNote,
  PrimaryButton,
  Shell,
  StepEnter,
  TextButton,
  Title,
  Voice,
} from './ui';
import { AgeWheel, TimeWheel } from './time-wheel';
import { TomorrowDemo } from './tomorrow-demo';

const ADVANCE_AFTER_CHOICE_MS = 280;
// Four presets: one row under the time wheel.
const BEDTIME_PRESETS = [22 * 60, 23 * 60, 23 * 60 + 30, 0];
const WAKE_PRESETS = [6 * 60, 7 * 60, 7 * 60 + 30, 8 * 60];
// Night-shift schedules: sleep in the morning, up in the afternoon.
const SHIFT_BEDTIME_PRESETS = [7 * 60, 8 * 60, 9 * 60, 10 * 60];
const SHIFT_WAKE_PRESETS = [14 * 60, 15 * 60, 16 * 60, 17 * 60];

/** Steps that can be edited from the "Tonight's lock is ready" summary. */
const EDITABLE: StepId[] = ['bedtime', 'wake', 'apps'];

/** Screens that move on by themselves. Back steps over them. */
const AUTO_ADVANCE: StepId[] = ['math'];

/** Screens that close the flow in the same moonlit scene it opens with. */
// Quiet moments start their content below the moon in the sky photo.
const MOON_FEATURE: StepId[] = ['intro', 'armed', 'first-morning', 'done', 'under-13', 'declined'];

/** Text entrance per page (see motion.tsx). Anything not listed uses Word Drift. */
const MOTION: Partial<Record<StepId, TextMotion>> = {
  deal: 'moonrise',
};

type Simulated = { message: string; then: () => void };

// Plausible answers for jumping straight to a later screen with `?step=`.
const PREVIEW_ANSWERS: Partial<Answers> = {
  nights: 'one-more',
  nightMinutes: 45,
  morningMinutes: 20,
  nightsPerWeek: 7,
  age: 22,
  alarm: 'groggy',
  tried: 'screen-time',
  timeBack: 'mornings',
  apps: ['TikTok', 'Instagram', 'YouTube'],
};

function isStep(value: string | undefined): value is StepId {
  return value === 'declined' || (STEPS as readonly string[]).includes(value ?? '');
}

function nextStep(step: StepId): StepId {
  if (step === 'declined') return 'plans';
  if (step === 'under-13') return 'alarm';
  const index = STEPS.indexOf(step);
  return STEPS[Math.min(index + 1, STEPS.length - 1)];
}

/** Head start so the bar never opens empty (endowed progress). */
const PROGRESS_START = 0.08;
/** Above 1, early steps fill more than late ones: fast-to-slow, which cuts drop-off. */
const PROGRESS_EASE = 1.3;

/** Fill from 0 to 1, or null on screens that hide the bar. */
function progressFor(step: StepId): number | null {
  const index = PROGRESS_STEPS.indexOf(step === 'under-13' ? 'age' : step);
  if (index < 0) return null;
  const done = (index + 1) / PROGRESS_STEPS.length;
  return PROGRESS_START + (1 - PROGRESS_START) * (1 - (1 - done) ** PROGRESS_EASE);
}

function appSummary(apps: string[]): string {
  if (apps.length === 0) return 'Your apps';
  if (apps.length <= 2) return apps.join(' and ');
  return `${apps[0]}, ${apps[1]} and ${apps.length - 2} more`;
}

export function OnboardingFlow({ initialStep }: { initialStep?: string }) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [history, setHistory] = useState<StepId[]>([isStep(initialStep) ? initialStep : 'hello']);
  const [answers, setAnswers] = useState<Answers>(() => ({
    ...initialAnswers,
    ...(isStep(initialStep) && initialStep !== 'hello' ? PREVIEW_ANSWERS : {}),
  }));
  const [simulated, setSimulated] = useState<Simulated | null>(null);
  // Set while editing a choice from the summary, so Continue returns there.
  const [returnTo, setReturnTo] = useState<StepId | null>(null);
  // The answers before that edit, so Back cancels it instead of keeping half a change.
  const [beforeEdit, setBeforeEdit] = useState<Answers | null>(null);

  const step = history[history.length - 1];
  const numbers = useMemo(
    () =>
      estimate({
        nightMinutes: answers.nightMinutes ?? 0,
        morningMinutes: answers.morningMinutes ?? 0,
        nightsPerWeek: answers.nightsPerWeek ?? 7,
        bedtime: answers.bedtime,
        wake: answers.wake,
        age: answers.age,
      }),
    [answers],
  );

  const go = (to: StepId) => setHistory((stack) => [...stack, to]);
  // After purchase there's no way back to the paywall.
  const purchased = () => setHistory(['armed']);
  const next = () => {
    if (returnTo && EDITABLE.includes(step)) {
      // Pop back to the summary instead of stacking another copy of it.
      setHistory((stack) => stack.slice(0, stack.lastIndexOf(returnTo) + 1));
      setReturnTo(null);
      setBeforeEdit(null);
      return;
    }
    go(nextStep(step));
  };
  const edit = (to: StepId) => {
    setReturnTo(step);
    setBeforeEdit(answers);
    go(to);
  };
  // The age gate can't be re-answered with Back.
  const back = history.length > 1 && step !== 'under-13'
    ? () => {
        cancelAdvance();
        if (returnTo && EDITABLE.includes(step)) {
          if (beforeEdit) setAnswers(beforeEdit);
          setReturnTo(null);
          setBeforeEdit(null);
        }
        // Skip screens that advance on their own, or Back would bounce straight forward again.
        setHistory((stack) => {
          let to = stack.length - 1;
          while (to > 1 && AUTO_ADVANCE.includes(stack[to - 1])) to -= 1;
          return stack.slice(0, to);
        });
      }
    : undefined;
  const exit = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((current) => ({ ...current, [key]: value }));
  // A second tap during the short advance delay must not skip a screen, and Back cancels it.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelAdvance = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };
  useEffect(() => cancelAdvance, []);
  const advanceOnce = (to: () => void) => {
    if (advanceTimer.current) return;
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      to();
    }, ADVANCE_AFTER_CHOICE_MS);
  };
  const choose = <K extends keyof Answers>(key: K) => (value: Answers[K]) => {
    set(key, value);
    advanceOnce(next);
  };
  const simulate = (message: string, then: () => void) => setSimulated({ message, then });

  // While the moon moves to or from the opener, the page waits so text enters once it lands.
  const reducedMotion = useReducedMotion();
  const opening = step === 'hello';
  const [moonWasOpening, setMoonWasOpening] = useState(opening);
  const [moonMoving, setMoonMoving] = useState(false);
  if (moonWasOpening !== opening) {
    setMoonWasOpening(opening);
    if (!reducedMotion) setMoonMoving(true);
  }
  useEffect(() => {
    if (!moonMoving) return;
    const timer = setTimeout(() => setMoonMoving(false), FLIGHT_MS);
    return () => clearTimeout(timer);
  }, [moonMoving, step]);

  const lateNight = isInsideBedtime(answers.bedtime, answers.wake);
  const compact = useCompact();
  const screen = renderStep({
    step,
    answers,
    numbers,
    set,
    choose,
    next,
    go,
    edit,
    exit,
    simulate,
    purchased,
    lateNight,
    compact,
    editing: returnTo !== null,
  });

  return (
    <View style={styles.root}>
      <NightSky opening={opening} />
      <Shell progress={progressFor(step)} onBack={back} onExit={exit} footer={screen.footer && !moonMoving ? <FooterEnter key={`${step}-${history.length}`}>{screen.footer}</FooterEnter> : undefined}
      >
        {moonMoving ? null : (
          <StepEnter key={`${step}-${history.length}`} motion={MOTION[step] ?? 'drift'}>
            {/* Featured-moon screens start below the moon so text never runs across it. */}
            <View style={[styles.fill, MOON_FEATURE.includes(step) && { paddingTop: moonBottom(width) - 40 }]}>
              {screen.body}
            </View>
          </StepEnter>
        )}
      </Shell>
      <SimulatedPrompt
        prompt={simulated}
        onContinue={() => {
          const then = simulated?.then;
          setSimulated(null);
          then?.();
        }}
      />
    </View>
  );
}

type StepContext = {
  step: StepId;
  answers: Answers;
  numbers: Estimate;
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  choose: <K extends keyof Answers>(key: K) => (value: Answers[K]) => void;
  next: () => void;
  go: (to: StepId) => void;
  edit: (to: StepId) => void;
  exit: () => void;
  simulate: (message: string, then: () => void) => void;
  purchased: () => void;
  /** Short phone: layouts tighten so nothing scrolls. */
  compact: boolean;
  /** Onboarding is happening inside the bedtime window, e.g. at 12:40 AM. */
  lateNight: boolean;
  editing: boolean;
};

/**
 * The cold open reacts to the clock. Fixed hours, not the bedtime answer: that
 * isn't set yet on the first screen.
 */
function helloOpener(now = new Date()): { head: string; sub: string } {
  const hour = now.getHours();
  if (hour >= 22 || hour < 5) {
    const clock = `${hour % 12 === 0 ? 12 : hour % 12}:${now.getMinutes().toString().padStart(2, '0')}`;
    return { head: `It’s ${clock}.`, sub: 'Why are we awake.' };
  }
  if (hour < 10) return { head: 'You’re still in bed.', sub: 'I can tell. I’m also still in bed.' };
  return { head: 'No apps until you’re out of bed.', sub: 'I’m Trundle. Raccoon. I don’t do mornings either.' };
}

function renderStep(ctx: StepContext): { body: ReactNode; footer?: ReactNode } {
  const { step, answers, numbers, set, choose, next, go, edit, exit, simulate, purchased, lateNight, compact, editing } = ctx;
  const bed = formatWhen(answers.bedtime);
  const wake = formatClock(answers.wake);
  // "This morning" when it's already the small hours; "Later today" for afternoon wake-ups.
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const wakeDay = lateNight && answers.wake > nowMinutes ? (answers.wake >= 12 * 60 ? 'Later today' : 'This morning') : 'Tomorrow';
  const apps = appSummary(answers.apps);

  switch (step) {
    case 'hello': {
      const opener = helloOpener();
      return {
        body: (
          <View style={styles.bottomStack}>
            <Voice text={opener.head} size={46} />
            <View style={styles.gap16} />
            <Voice text={opener.sub} size={24} delay={800} sub />
          </View>
        ),
        footer: (
          <>
            <PrimaryButton label="Go on" onPress={next} />
            <TextButton
              label="Already subscribed? Restore"
              onPress={() => simulate('Restore Purchases runs here and skips straight to your setup.', () => {})}
            />
          </>
        ),
      };
    }

    case 'deal':
      return {
        body: (
          <View style={styles.top}>
            <Title>Here’s the deal.</Title>
            <View style={styles.beats}>
              <Beat label="Bedtime" text="Your apps go to sleep. So do I." />
              <Beat label="Morning" text="They stay asleep until you’re up. Same as me." />
              <Beat label="200 steps" text="About two minutes of walking. They wake up. I do too, unfortunately." />
            </View>
          </View>
        ),
        footer: <PrimaryButton label="Okay" onPress={next} />,
      };

    case 'intro':
      return {
        body: (
          <View style={styles.top}>
            <Voice text="A few questions. Then I do math on your nights." size={34} />
            <View style={styles.gap16} />
            <Body>About two minutes of questions. Your answers stay on your phone.</Body>
          </View>
        ),
        footer: <PrimaryButton label="Ask away" onPress={next} />,
      };

    case 'nights':
      return question('What happens most nights?', undefined, (
        <Options options={NIGHTS} value={answers.nights} onChoose={choose('nights')} />
      ));

    case 'night-minutes':
      return question('After you get into bed, how long are you on your phone?', 'A rough guess is fine.', (
        <Options options={NIGHT_MINUTES} value={answers.nightMinutes} onChoose={choose('nightMinutes')} />
      ));

    case 'nights-per-week':
      return question('How many nights a week?', undefined, (
        <Options options={NIGHTS_PER_WEEK} value={answers.nightsPerWeek} onChoose={choose('nightsPerWeek')} />
      ));

    case 'bedtime':
      return {
        body: (
          <View style={styles.top}>
            <Title>When do you get into bed?</Title>
            <Body style={styles.sub}>Getting in. Not falling asleep. Those are different.</Body>
            <View style={styles.timeWrap}>
              <TimeWheel
                value={answers.bedtime}
                onChange={(v) => set('bedtime', v)}
                presets={answers.shift ? SHIFT_BEDTIME_PRESETS : BEDTIME_PRESETS}
              />
            </View>
            {/* Wake time isn't set yet here, so only warn when editing a finished schedule. */}
            {editing && !answers.shift && numbers.scheduleLooksWrong ? (
              <Body style={styles.warning}>
                That’s {formatHoursFromMinutes(numbers.timeInBed)} hours in bed. Check AM and PM.
              </Body>
            ) : null}
            <View style={styles.shiftRow}>
              <Chip
                label="I work nights"
                selected={answers.shift === true}
                onPress={() => {
                  const shift = !answers.shift;
                  set('shift', shift);
                  set('bedtime', shift ? 8 * 60 : initialAnswers.bedtime);
                  set('wake', shift ? 15 * 60 : initialAnswers.wake);
                }}
              />
            </View>
            {answers.shift ? <Voice text="Nights are your days. I’ll adjust. Grudgingly." size={22} sub /> : null}
          </View>
        ),
        footer: <PrimaryButton label={editing ? 'Save' : 'Continue'} onPress={next} />,
      };

    case 'wake':
      return {
        body: (
          <View style={styles.top}>
            <Title>When does your alarm go off?</Title>
            <Body style={styles.sub}>The first one. Steps start counting from here.</Body>
            <View style={styles.timeWrap}>
              <TimeWheel
                value={answers.wake}
                onChange={(v) => set('wake', v)}
                presets={answers.shift ? SHIFT_WAKE_PRESETS : WAKE_PRESETS}
              />
            </View>
            {numbers.scheduleLooksWrong ? (
              <Body style={styles.warning}>
                That’s {formatHoursFromMinutes(numbers.timeInBed)} hours in bed. Check AM and PM.
              </Body>
            ) : null}
          </View>
        ),
        footer: <PrimaryButton label={editing ? 'Save' : 'Continue'} onPress={next} />,
      };

    case 'morning-minutes':
      return question('In the morning, how long are you on your phone before you get up?', 'Counting from the first alarm.', (
        <Options options={MORNING_MINUTES} value={answers.morningMinutes} onChoose={choose('morningMinutes')} />
      ));

    case 'stat':
      return {
        body: (
          <View style={styles.center}>
            <Reveal>
              <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
                62%
              </Text>
            </Reveal>
            <Body style={styles.statText}>of U.S. adults under 30 with a smartphone say it hurts how much sleep they get.</Body>
            <View style={styles.gap32} />
            <Voice text={NIGHTS_ECHO[answers.nights ?? ''] ?? 'Not just you, then.'} size={28} delay={600} sub />
          </View>
        ),
        footer: <PrimaryButton label="Continue" onPress={next} />,
      };

    case 'age':
      return {
        ...question(
          'How old are you?',
          'Sleep needs change with age. So does how much time is left to spend.',
          <AgeWheel value={answers.age ?? AGE_DEFAULT} onChange={(age) => set('age', age)} min={AGE_MIN} max={AGE_MAX} />,
          true,
        ),
        footer: (
          <PrimaryButton
            label="Continue"
            onPress={() => {
              const age = answers.age ?? AGE_DEFAULT;
              set('age', age);
              if (age < 13) go('under-13');
              else next();
            }}
          />
        ),
      };

    case 'under-13':
      return {
        body: (
          <View style={styles.center}>
            <Voice text="Thirteen and up. Those are the rules." size={34} header />
            <View style={styles.gap16} />
            <Body>Trundle isn’t for under-13s. Go to bed, though.</Body>
          </View>
        ),
        footer: <PrimaryButton label="Exit" onPress={exit} />,
      };

    case 'alarm':
      return question('How do you feel when your alarm goes off?', undefined, (
        <Options options={ALARM} value={answers.alarm} onChoose={choose('alarm')} />
      ));

    case 'tried':
      return question('What have you tried?', 'Pick the one that lasted longest.', (
        <Options options={TRIED} value={answers.tried} onChoose={choose('tried')} />
      ));

    case 'tried-echo': {
      const echo = TRIED_ECHO[answers.tried ?? ''] ?? TRIED_ECHO.nothing;
      return {
        body: (
          <View style={styles.center}>
            <Voice text={echo.line} size={34} header />
            <View style={styles.gap16} />
            <Body>{echo.body}</Body>
          </View>
        ),
        footer: <PrimaryButton label="Continue" onPress={next} />,
      };
    }

    case 'time-back':
      return question('Say you got those minutes back. What would you do with them?', undefined, (
        <Options options={TIME_BACK} value={answers.timeBack} onChoose={choose('timeBack')} />
      ));

    case 'math':
      return { body: <MathScreen onDone={next} /> };

    case 'reveal':
      return {
        body: <RevealScreen numbers={numbers} />,
        footer: (
          <>
            <PrimaryButton label={numbers.lightUser ? 'Keep it that way' : 'Let’s fix this'} onPress={next} />
            <TextButton
              label="Share this"
              onPress={() => {
                const message = `About ${weeklyAmount(numbers.weeklyMinutes)} a week on my phone in bed. My raccoon is disappointed.`;
                Share.share({ message }).catch(() => simulate(`The share sheet opens here: “${message}”`, () => {}));
              }}
            />
          </>
        ),
      };

    case 'tomorrow':
      return {
        body: <TomorrowDemo when={`${wakeDay}, ${wake}`} clock={wake.replace(/\s?[AP]M$/i, '')} />,
        footer: <PrimaryButton label="Set it up" onPress={next} />,
      };

    case 'screen-time':
      return {
        body: (
          <View style={styles.center}>
            <Voice text="I need Screen Time access." size={34} header />
            <View style={styles.gap16} />
            <Body>It’s how I put apps to sleep. What you use stays on your phone. I never see it.</Body>
            <NextFromApple text="Allow Screen Time access. You can change it later in Settings." />
            <Voice text="Apple’s box is next. It’s boring. So am I." size={22} delay={600} sub />
          </View>
        ),
        footer: (
          <PrimaryButton
            label="Continue"
            onPress={() =>
              simulate('iOS asks for Screen Time access here. The real prompt needs Apple’s Family Controls approval.', next)
            }
          />
        ),
      };

    case 'apps':
      return {
        body: (
          <View style={styles.top}>
            <Title>Which apps keep you up?</Title>
            <Body style={styles.sub}>They sleep at bedtime and wake after your walk. Calls and texts aren’t touched.</Body>
            <View style={styles.appGrid}>
              {PREVIEW_APPS.map((app) => (
                <Chip
                  key={app}
                  label={app}
                  selected={answers.apps.includes(app)}
                  onPress={() =>
                    set('apps', answers.apps.includes(app) ? answers.apps.filter((a) => a !== app) : [...answers.apps, app])
                  }
                />
              ))}
            </View>
            <PreviewNote>The real app uses Apple’s picker, with the apps actually on your phone.</PreviewNote>
          </View>
        ),
        footer: (
          <PrimaryButton
            label={answers.apps.length === 0 ? 'Pick at least one' : editing ? 'Save' : `Put ${answers.apps.length} to sleep`}
            disabled={answers.apps.length === 0}
            onPress={next}
          />
        ),
      };

    case 'motion':
      return {
        body: (
          <View style={styles.center}>
            <Voice text="Motion & Fitness, for the steps." size={34} header />
            <View style={styles.gap16} />
            <Body>I count 200 steps each morning. That’s all I use it for.</Body>
            <NextFromApple text="Allow Motion & Fitness access. You can change it later in Settings." />
          </View>
        ),
        footer: (
          <PrimaryButton label="Continue" onPress={() => simulate('iOS asks for Motion & Fitness access here.', next)} />
        ),
      };

    case 'ready':
      return {
        body: (
          <View style={styles.top}>
            <Title>Tonight’s lock is ready.</Title>
            <View style={styles.plan}>
              <PlanRow when={formatClock(answers.bedtime)} what={`${apps} go to sleep.`} onChange={() => edit('bedtime')} />
              <PlanRow when={wake} what="200 steps and they wake up." onChange={() => edit('wake')} />
              <PlanRow when="Apps" what={`${answers.apps.length} picked.`} onChange={() => edit('apps')} />
            </View>
            <Body>{lateNight ? `It’s already past ${bed}. I start the second you’re in.` : 'It isn’t on yet.'}</Body>
            <View style={styles.gap16} />
            <Voice text="I’m ready. Emotionally, less so." size={22} delay={700} sub />
          </View>
        ),
        footer: <PrimaryButton label="Looks right" onPress={next} />,
      };

    case 'commit':
      return {
        body: (
          <View style={styles.center}>
            <Eyebrow>The deal</Eyebrow>
            <Title style={styles.pledge}>{`Phone down at ${bed}. Up for 200\u00A0steps.`}</Title>
            <View style={styles.gap16} />
            <Body>
              {apps} sleep until you’ve walked. Passes cover sick days and travel. Change anything later.
            </Body>
          </View>
        ),
        footer: <HoldButton label="Hold to agree" doneLabel="Fine. Deal." onComplete={next} />,
      };

    case 'offer': {
      const headline = numbers.lightUser
        ? LIGHT_OFFER_HEADLINE
        : (OFFER_HEADLINES[answers.timeBack ?? 'else'] ?? OFFER_HEADLINES.else);
      return {
        body: (
          <View style={styles.top}>
            <Voice text={headline} size={34} header />
            <View style={styles.gap16} />
            <Body>{ALARM_ECHO[answers.alarm ?? ''] ?? 'I guard them at night. You do the walking.'}</Body>
            <View style={styles.plan}>
              {!numbers.lightUser ? (
                <PlanRow when="Now" what={`About ${weeklyAmount(numbers.weeklyMinutes)} a week on your phone in bed.`} />
              ) : null}
              <PlanRow when="With me" what={`${apps} can’t open from ${bed} until you’ve walked 200 steps.`} />
            </View>
            <Reveal>
              <Text style={styles.reassure}>Only the apps you pick. Emergency unlock, anytime.</Text>
            </Reveal>
          </View>
        ),
        footer: <PrimaryButton label={PRICES.trialEligible ? 'See the free week' : 'See plans'} onPress={next} />,
      };
    }

    case 'plans':
      return plansStep(answers, set, purchased, simulate, lateNight, compact);

    case 'declined':
      return {
        body: (
          <View style={styles.center}>
            <Voice text="Fair." size={34} />
            <View style={styles.gap16} />
            <Body>Your setup is saved. Nothing is locked, and nothing will be unless you start.</Body>
          </View>
        ),
        footer: (
          <>
            <PrimaryButton label="See plans again" onPress={() => go('plans')} />
            <TextButton label="Exit preview" onPress={exit} />
          </>
        ),
      };

    case 'armed':
      return {
        body: (
          <View style={styles.center}>
            <Voice text={lateNight ? 'Armed. Starting now. Put it down.' : `Armed. See you at ${bed}.`} size={34} header />
            <View style={styles.gap16} />
            <Body style={styles.onImage}>
              {answers.plan === 'annual' && PRICES.trialEligible
                ? 'A heads-up before bedtime. And a warning two days before your trial bills, if you let me send notifications.'
                : 'A heads-up before bedtime. That’s it. I’m not chatty.'}
            </Body>
            <View style={styles.gap16} />
            <PreviewNote>
              In the real app, “Armed” only shows once tonight’s schedule is confirmed. If it can’t be set, it says so.
            </PreviewNote>
          </View>
        ),
        footer: (
          <>
            <PrimaryButton
              label="Continue"
              onPress={() =>
                simulate('iOS asks for notification permission here. “Don’t Allow” is always an option.', next)
              }
            />
          </>
        ),
      };

    case 'first-morning':
      return {
        body: (
          <View style={styles.center}>
            <Title>{`${wakeDay}, ${wake}.`}</Title>
            <View style={styles.plan}>
              <PlanRow when="Steps" what={`Count from ${wake}. Bathroom, kitchen, it all counts.`} />
              <PlanRow when="At 200" what="Open a sleeping app and tap Check steps. Or just open me." />
              <PlanRow when="Bad day" what="Use a pass. No walking." />
            </View>
            <Voice text="I’ll be grumpy. Ignore it." size={22} delay={700} sub />
          </View>
        ),
        footer: <PrimaryButton label="Got it" onPress={next} />,
      };

    case 'done':
      return {
        body: (
          <View style={styles.center}>
            <Voice text={lateNight ? 'That’s it. Go to sleep.' : `That’s it. Bed at ${bed}.`} size={34} header />
            <View style={styles.gap16} />
            <Voice text="I’ll be asleep. Don’t wake me." size={22} delay={900} sub />
          </View>
        ),
        footer: <PrimaryButton label="Finish preview" onPress={exit} />,
      };
  }
}

/** Title at the top, answers anchored low where thumbs are. */
function question(title: string, sub: string | undefined, options: ReactNode, centered = false) {
  return {
    body: (
      <View style={styles.question}>
        <View style={styles.questionHead}>
          <Title>{title}</Title>
          {sub ? <Body style={styles.sub}>{sub}</Body> : null}
        </View>
        <View style={centered ? styles.optionsCentered : styles.optionsWrap}>{options}</View>
      </View>
    ),
  };
}

/**
 * The paywall, copied from Blinkist's "How your free trial works" screen: the only paywall
 * with a published A/B result (+23% trial starts, -55% complaints), which Opal and Cal AI
 * both adopted. Yearly with a free trial is the only plan shown; monthly sits behind
 * "See other plans". Restyled to Nocturne. The trial toggle Apple now rejects is left out.
 */
function plansStep(
  answers: Answers,
  set: StepContext['set'],
  purchase: () => void,
  simulate: StepContext['simulate'],
  lateNight: boolean,
  compact: boolean,
): { body: ReactNode; footer: ReactNode } {
  const trial = PRICES.trialEligible;
  const yearly = money(PRICES.annual);
  const perMonth = money(PRICES.annual / 12);
  const link = (label: string, message: string) => (
    <Text accessibilityRole="link" style={styles.link} onPress={() => simulate(message, () => {})}>
      {label}
    </Text>
  );
  return {
    body: (
      <View style={styles.paywall}>
        <Reveal>
          <Text style={[styles.paywallTitle, compact && styles.paywallTitleCompact]} accessibilityRole="header">
            {trial ? 'How your free trial works' : 'How Trundle works'}
          </Text>
        </Reveal>
        <View style={styles.paywallVoice}>
          <Voice
            text={trial ? 'Seven nights free. I’ll sleep through most of them.' : 'Fine. I’ll get up for this.'}
            size={compact ? 18 : 20}
            delay={500}
            sub
            center
          />
        </View>

        <TrialTimeline
          compact={compact}
          rows={[
            {
              icon: 'lock',
              title: 'Today',
              text: lateNight
                ? 'Your apps go to sleep now. 200 steps wake them in the morning.'
                : 'Your apps go to sleep tonight. 200 steps wake them tomorrow.',
            },
            ...(trial
              ? [
                  {
                    icon: 'bell' as const,
                    title: `Day ${PRICES.trialDays - 2}`,
                    text: 'We’ll remind you with a notification that your trial is ending.',
                  },
                  {
                    icon: 'star' as const,
                    title: `Day ${PRICES.trialDays}`,
                    text: `You’ll be charged on ${dateFromToday(PRICES.trialDays)}, cancel anytime before.`,
                  },
                ]
              : [{ icon: 'star' as const, title: 'Every year', text: 'Renews until you cancel in Settings.' }]),
          ]}
        />

        <Reveal>
          <Text style={styles.priceLine}>
            {trial ? `Unlimited free access for ${PRICES.trialDays} days, then ` : ''}
            <Text style={styles.priceStrong}>{yearly} per year</Text>.{' '}
            <Text style={styles.pricePerMonth}>({perMonth}/month)</Text>
          </Text>
        </Reveal>

        <Pressable
          onPress={() => set('plansOpen', true)}
          accessibilityRole="button"
          style={styles.otherPlans}
        >
          <Text style={styles.otherPlansLabel}>See other plans</Text>
        </Pressable>

        {/* Blinkist's "How can I cancel?" card sits below the fold; pages here never scroll, so it's one line. */}
        <Reveal>
          <Text style={styles.cancelLine}>
            <Text style={styles.strong}>Cancel anytime:</Text> Settings, your name, Subscriptions. About 15 seconds.
          </Text>
        </Reveal>

        <PlansSheet
          open={answers.plansOpen === true}
          plan={answers.plan}
          onPlan={(plan) => set('plan', plan)}
          onClose={() => {
            set('plansOpen', false);
            set('plan', 'annual');
          }}
          onBuy={() => {
            set('plansOpen', false);
            purchase();
          }}
        />
      </View>
    ),
    footer: (
      <>
        <TwoLineCta
          title={trial ? 'Start my free trial' : `Subscribe for ${yearly}/year`}
          sub={trial ? 'No payment due now · cancel anytime' : 'Cancel anytime in Settings'}
          onPress={() => {
            set('plan', 'annual');
            purchase();
          }}
        />
        <Text style={styles.paywallFine}>
          {trial ? `${PRICES.trialDays} days free, then ` : ''}
          {yearly}/year. Auto-renews unless cancelled at least 24 hours before renewal. Preview: nothing is charged.{' '}
          {link('Restore', 'Restore Purchases runs here, for anyone who already subscribed.')} ·{' '}
          {link('Terms', 'Your Terms of Use open here.')} · {link('Privacy', 'Your Privacy Policy opens here.')}
        </Text>
      </>
    ),
  };
}

function MathScreen({ onDone }: { onDone: () => void }) {
  const lines = ['Nights in bed with your phone', 'Mornings before you get up', 'Your schedule'];
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const timers = lines.map((_, i) =>
      setTimeout(() => {
        haptic.tick();
        setShown(i + 1);
      }, 500 + i * 650),
    );
    timers.push(setTimeout(onDone, 500 + lines.length * 650 + 300));
    return () => timers.forEach(clearTimeout);
    // Runs once per visit to this step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.center}>
      <Voice text="Counting. Don’t watch me." size={34} header />
      <View style={styles.mathList}>
        {lines.map((line, i) => (
          <Reveal key={line} style={[styles.mathRow, i >= shown && styles.faded]}>
            <View style={[styles.mathDot, i < shown && styles.mathDotDone]} />
            <Text style={styles.mathLabel}>{line}</Text>
          </Reveal>
        ))}
      </View>
    </View>
  );
}

/** Above this many hour-squares the grid switches to one square per day. */
const MAX_HOUR_SQUARES = 1000;
const CAPTION_SPACE = 34;

function RevealScreen({ numbers }: { numbers: Estimate }) {
  const [landed, setLanded] = useState(false);
  const [filled, setFilled] = useState(false);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const compact = useCompact();

  // One year of it. Hours if every hour fits on screen, otherwise days.
  // The caption sits right under the squares, so leave room for it.
  const gridHeight = area.height - CAPTION_SPACE;
  const hourFit =
    numbers.yearlyHours <= MAX_HOUR_SQUARES ? fitSquares(numbers.yearlyHours, area.width, gridHeight) : null;
  const unit: 'hour' | 'day' = hourFit ? 'hour' : 'day';
  const squares = hourFit ? numbers.yearlyHours : Math.max(1, numbers.yearlyDays);
  const fit = hourFit ?? fitSquares(squares, area.width, gridHeight);
  const lifetime = lifetimeSentence(numbers.lifetimeDays);

  if (numbers.lightUser) {
    return (
      <View style={styles.center}>
        <Voice text="You’re barely on it." size={34} />
        <View style={styles.gap16} />
        <Body>
          About {weeklyAmount(numbers.weeklyMinutes)} a week on your phone in bed. So I’ll mostly handle mornings.
          Apps stay asleep until you’re up.
        </Body>
        <View style={styles.gap16} />
        <Voice text="You’re already ahead. I’ll keep it that way." size={22} delay={700} sub />
      </View>
    );
  }

  const onArea = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <View style={styles.revealWrap}>
      <Reveal>
        <Body style={styles.revealLead}>Based on your answers, you spend about…</Body>
      </Reveal>
      <View
        accessible
        accessibilityRole="header"
        accessibilityLabel={`About ${weeklyAmount(numbers.weeklyMinutes)} a week on your phone in bed`}
      >
        <RollingNumber
          value={numbers.weeklyHours}
          format={(v) => `${formatHalves(v)} ${v === 1 ? 'hour' : 'hours'}`}
          onLanded={setLanded}
          rowHeight={compact ? 44 : 60}
          fontSize={compact ? 40 : 54}
        />
      </View>
      <Body style={styles.revealSub}>…a week on your phone in bed.</Body>

      <View style={styles.gridArea} onLayout={onArea}>
        {landed && fit ? (
          <>
            {/* The payoff carries the meaning for VoiceOver; the squares are decoration. */}
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <RevealGrid squares={squares} fit={fit} onFilled={() => setFilled(true)} />
            </View>
            <FadeWhen visible={filled}>
              <Text style={styles.gridCaption}>One year. Each box is 1 {unit}.</Text>
            </FadeWhen>
          </>
        ) : null}
      </View>

      <FadeWhen visible={filled}>
        {/* The year line always matches the boxes; the lifetime line is a separate, smaller beat. */}
        <Text style={styles.payoff}>{yearSentence(squares, unit)}</Text>
        {lifetime ? <Text style={styles.payoffLifetime}>{lifetime}</Text> : null}
      </FadeWhen>
    </View>
  );
}

/** A flat, non-interactive note of what Apple asks next. Not a copy of the system alert. */
function NextFromApple({ text }: { text: string }) {
  return (
    <Reveal style={styles.nextApple}>
      <Text style={styles.nextAppleLabel}>NEXT, FROM APPLE</Text>
      <Text style={styles.nextAppleText}>{text}</Text>
    </Reveal>
  );
}

function FadeWhen({ visible, children }: { visible: boolean; children: ReactNode }) {
  const reduced = useReducedMotion();
  if (!visible) return <View style={styles.hiddenBlock}>{children}</View>;
  if (reduced) return <View>{children}</View>;
  return (
    <Animated.View
      style={{
        animationName: { from: { opacity: 0, transform: [{ translateY: 8 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } },
        animationDuration: '420ms',
        animationTimingFunction: 'ease-out',
      }}
    >
      {children}
    </Animated.View>
  );
}

function Beat({ label, text }: { label: string; text: string }) {
  return (
    <Reveal style={styles.beat}>
      <Text style={styles.beatLabel}>{label}</Text>
      <Text style={styles.beatText}>{text}</Text>
    </Reveal>
  );
}

function PlanRow({ when, what, onChange }: { when: string; what: string; onChange?: () => void }) {
  return (
    <Reveal style={styles.planRow}>
      <Text style={styles.planWhen}>{when}</Text>
      <Text style={styles.planWhat}>{what}</Text>
      {onChange ? (
        <Pressable onPress={onChange} accessibilityRole="button" accessibilityLabel={`Change ${when}`} hitSlop={10}>
          <Text style={styles.change}>Change</Text>
        </Pressable>
      ) : null}
    </Reveal>
  );
}

type TimelineIcon = 'lock' | 'bell' | 'star';

const TIMELINE_SYMBOLS = {
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  bell: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  star: { ios: 'star.fill', android: 'star', web: 'star' },
} as const;

/** Blinkist's timeline: one continuous bar with icons, fading out after the last step. */
function TrialTimeline({
  rows,
  compact,
}: {
  rows: { icon: TimelineIcon; title: string; text: string }[];
  compact?: boolean;
}) {
  return (
    <View style={[styles.trialTimeline, compact && styles.trialTimelineCompact]}>
      {rows.map((row, i) => {
        const last = i === rows.length - 1;
        return (
          <Reveal key={row.title} style={styles.trialRow}>
            <View style={[styles.trialBar, i === 0 && styles.trialBarFirst, last && styles.trialBarLast]}>
              {last ? (
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="trialFade" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={Nocturne.cta} stopOpacity={1} />
                      <Stop offset="0.45" stopColor={Nocturne.cta} stopOpacity={1} />
                      <Stop offset="1" stopColor={Nocturne.cta} stopOpacity={0} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#trialFade)" />
                </Svg>
              ) : null}
              <View style={styles.trialIcon}>
                <SymbolView name={TIMELINE_SYMBOLS[row.icon]} size={12} tintColor={Nocturne.onCta} />
              </View>
            </View>
            <View style={[styles.trialBody, compact && styles.trialBodyCompact]}>
              <Text style={[styles.trialTitle, compact && styles.trialTitleCompact]}>{row.title}</Text>
              <Text style={[styles.trialText, compact && styles.trialTextCompact]}>{row.text}</Text>
            </View>
          </Reveal>
        );
      })}
    </View>
  );
}

/** Blinkist's pinned button: the action on top, the reassurance underneath, in one pill. */
function TwoLineCta({ title, sub, onPress }: { title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => [styles.twoLineCta, pressed && styles.pressedCta]}
    >
      <Text style={styles.twoLineTitle}>{title}</Text>
      <Text style={styles.twoLineSub}>{sub}</Text>
    </Pressable>
  );
}

/**
 * "See other plans": a bottom sheet with the yearly plan still selected and monthly
 * underneath, the way Calm hides its monthly plan. Choosing a plan is not a trial toggle.
 */
function PlansSheet({
  open,
  plan,
  onPlan,
  onClose,
  onBuy,
}: {
  open: boolean;
  plan: Answers['plan'];
  onPlan: (plan: Answers['plan']) => void;
  onClose: () => void;
  onBuy: () => void;
}) {
  // Its preview notes open inside the sheet: a second Modal would open behind it.
  const [note, setNote] = useState<string | null>(null);
  const link = (label: string, message: string) => (
    <Text accessibilityRole="link" style={styles.link} onPress={() => setNote(message)}>
      {label}
    </Text>
  );
  const trial = PRICES.trialEligible;
  const yearly = money(PRICES.annual);
  const monthly = money(PRICES.monthly);
  const annual = plan === 'annual';
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetScrim} onPress={onClose} accessibilityLabel="Close plans" />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle} accessibilityRole="header">
          All plans
        </Text>
        <View accessibilityRole="radiogroup" style={styles.sheetRows}>
          <PlanOption
            selected={annual}
            onPress={() => onPlan('annual')}
            title="Yearly"
            detail={trial ? `${PRICES.trialDays} days free, then ${yearly}/year` : `${yearly}/year`}
            badge={`Save ${annualSavings()}%`}
          />
          <PlanOption
            selected={!annual}
            onPress={() => onPlan('monthly')}
            title="Monthly"
            detail={`${monthly}/month · no free trial`}
          />
        </View>
        <TwoLineCta
          title={annual ? (trial ? 'Start my free trial' : `Subscribe for ${yearly}/year`) : `Subscribe for ${monthly}/month`}
          sub={annual && trial ? 'No payment due now · cancel anytime' : 'Billed today · cancel anytime'}
          onPress={onBuy}
        />
        <Text style={styles.paywallFine}>
          {annual ? `${trial ? `${PRICES.trialDays} days free, then ` : ''}${yearly}/year` : `${monthly}/month`}. Auto-renews
          unless cancelled at least 24 hours before renewal. {link('Terms', 'Your Terms of Use open here.')} ·{' '}
          {link('Privacy', 'Your Privacy Policy opens here.')}
        </Text>
      </View>
      {note ? (
        <View style={StyleSheet.absoluteFill}>
          <PromptCard message={note} onContinue={() => setNote(null)} />
        </View>
      ) : null}
    </Modal>
  );
}

function PlanOption({
  selected,
  onPress,
  title,
  detail,
  badge,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  detail: string;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.planOption, selected && styles.planOptionSelected]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.fill}>
        <Text style={styles.planOptionTitle}>{title}</Text>
        <Text style={styles.planOptionDetail}>{detail}</Text>
      </View>
      {badge ? (
        <View style={styles.badge} accessible accessibilityLabel={badge.replace('%', ' percent')}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function SimulatedPrompt({ prompt, onContinue }: { prompt: Simulated | null; onContinue: () => void }) {
  return (
    <Modal visible={prompt !== null} transparent animationType="fade" onRequestClose={onContinue}>
      <PromptCard message={prompt?.message ?? ''} onContinue={onContinue} />
    </Modal>
  );
}

function PromptCard({ message, onContinue }: { message: string; onContinue: () => void }) {
  return (
    <View style={styles.modalScrim}>
      <View style={styles.modalCard}>
        <Text style={styles.modalLabel}>PREVIEW</Text>
        <Text style={styles.modalText}>{message}</Text>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Nocturne.bg },
  fill: { flex: 1 },
  top: { flex: 1, paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center' },
  bottomStack: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24 },
  gap16: { height: 16 },
  gap32: { height: 32 },
  sub: { marginTop: 10 },
  question: { flex: 1, justifyContent: 'space-between', paddingTop: 20, gap: 28 },
  questionHead: {},
  optionsWrap: { paddingBottom: 8 },
  optionsCentered: { flex: 1, justifyContent: 'center' },
  timeWrap: { marginTop: 28 },
  warning: { marginTop: 28, textAlign: 'center', color: Nocturne.text },
  beats: { marginTop: 32, gap: 26 },
  beat: { gap: 6 },
  beatLabel: { color: Nocturne.text2, fontSize: 12, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  beatText: { ...DisplayFont, color: Nocturne.text, fontSize: 26, lineHeight: 30 },
  // Numbers use the serif upright. Italic serif always means Trundle is talking.
  statNumber: { ...NUMBER_FONT, color: Nocturne.accent ?? Nocturne.text, fontSize: 108, lineHeight: 112, letterSpacing: -1 },
  revealUnit: { color: Nocturne.text, fontSize: 24, fontWeight: '600' },
  statText: { color: Nocturne.text, fontSize: 20, lineHeight: 27, marginTop: 8 },
  mathList: { marginTop: 32, gap: 16 },
  mathRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faded: { opacity: 0.35 },
  mathDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: Nocturne.text2 },
  mathDotDone: { backgroundColor: Nocturne.text, borderColor: Nocturne.text },
  mathLabel: { color: Nocturne.text, fontSize: 17 },
  revealWrap: { flex: 1, paddingTop: 4 },
  revealLead: { textAlign: 'center', color: Nocturne.text, fontSize: 18, lineHeight: 25, marginBottom: 4 },
  revealSub: { marginTop: 2, textAlign: 'center' },
  paywallVoice: { marginTop: 6, marginHorizontal: 24 },
  gridArea: { flex: 1, justifyContent: 'center', marginVertical: 16, minHeight: 80 },
  gridCaption: { color: Nocturne.text2, fontSize: 15, lineHeight: 20, marginTop: 12, textAlign: 'center' },
  strong: { color: Nocturne.text, fontWeight: '600' },
  hiddenBlock: { opacity: 0 },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24, marginBottom: 20, justifyContent: 'space-between' },
  plan: { marginVertical: 28, gap: 14 },
  planRow: { flexDirection: 'row', gap: 14, alignItems: 'baseline' },
  planWhen: { width: 78, color: Nocturne.text2, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  planWhat: { flex: 1, color: Nocturne.text, fontSize: 17, lineHeight: 23 },
  change: { color: Nocturne.text2, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  reassure: { color: Nocturne.text, fontSize: 15, lineHeight: 21, fontWeight: '500' },
  shiftRow: { marginTop: 28, flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  // The user's side of the deal, so sans like every other non-Trundle headline.
  pledge: { fontSize: 32, lineHeight: 37 },
  payoffLifetime: { color: Nocturne.text2, fontSize: 17, lineHeight: 22, marginTop: 6, textAlign: 'center' },
  payoff: { ...NUMBER_FONT, color: Nocturne.accent ?? Nocturne.text, fontSize: 26, lineHeight: 32, letterSpacing: 0.2, textAlign: 'center' },
  nextApple: {
    marginTop: 28,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Nocturne.edge,
    padding: 16,
    gap: 6,
  },
  nextAppleLabel: { color: Nocturne.text2, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  nextAppleText: { color: Nocturne.text, fontSize: 15, lineHeight: 21 },
  maker: { color: Nocturne.text2, fontSize: 13, lineHeight: 18, marginTop: 8, marginBottom: 14 },
  onImage: { color: Nocturne.text },
  plansHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  restoreButton: { minHeight: 44, minWidth: 44, alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: 6 },
  restore: { color: Nocturne.text2, fontSize: 15, fontWeight: '500' },
  timeline: { marginTop: 18 },
  timelineRow: { flexDirection: 'row', gap: 14, minHeight: 58 },
  timelineRail: { width: 14, alignItems: 'center' },
  timelineLine: { flex: 1, width: 2, backgroundColor: Nocturne.track },
  hiddenLine: { backgroundColor: 'transparent' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Nocturne.text2 },
  timelineDotNow: { backgroundColor: Nocturne.text },
  timelineBody: { flex: 1, paddingVertical: 8 },
  timelineLabel: { color: Nocturne.text, fontSize: 15, fontWeight: '600' },
  timelineText: { color: Nocturne.text2, fontSize: 14, lineHeight: 19, marginTop: 2 },
  planCards: { gap: 10, marginTop: 18, marginBottom: 14 },
  planCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: Nocturne.surface,
    borderWidth: 2,
    borderColor: Nocturne.edge,
  },
  planCardSelected: { borderColor: Nocturne.text },
  planCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planCardTitle: { color: Nocturne.text2, fontSize: 14, fontWeight: '600' },
  planCardPrice: { color: Nocturne.text, fontSize: 22, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  planCardDetail: { color: Nocturne.text2, fontSize: 13, marginTop: 3 },
  badge: { backgroundColor: Nocturne.cta, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { color: Nocturne.onCta, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  trust: { color: Nocturne.text, fontSize: 13, textAlign: 'center', fontWeight: '500' },
  finePrint: { color: Nocturne.text2, fontSize: 13, lineHeight: 18, marginBottom: 14 },
  link: { color: Nocturne.text, textDecorationLine: 'underline' },
  moonScrim: { backgroundColor: `${Nocturne.bg}8C` },
  moonScrimDim: { backgroundColor: `${Nocturne.bg}CC` },
  paywall: { flex: 1, paddingTop: 4 },
  paywallTop: { flexDirection: 'row', justifyContent: 'flex-start' },
  paywallTitle: {
    color: Nocturne.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginTop: 8,
    marginHorizontal: 24,
  },
  trialTimeline: { marginTop: 24 },
  trialTimelineCompact: { marginTop: 14 },
  trialBodyCompact: { paddingBottom: 10 },
  trialTitleCompact: { fontSize: 17, lineHeight: 22 },
  trialTextCompact: { fontSize: 14, lineHeight: 19 },
  paywallTitleCompact: { fontSize: 25, lineHeight: 30, marginTop: 0 },
  trialRow: { flexDirection: 'row', gap: 16 },
  trialBar: { width: 22, backgroundColor: Nocturne.cta, alignItems: 'center' },
  trialBarFirst: { borderTopLeftRadius: 11, borderTopRightRadius: 11 },
  trialBarLast: { backgroundColor: 'transparent' },
  trialIcon: { height: 22, width: 22, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  trialBody: { flex: 1, paddingBottom: 18 },
  trialTitle: { color: Nocturne.text, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  trialText: { color: Nocturne.text2, fontSize: 16, lineHeight: 22, marginTop: 2 },
  cancelLine: { color: Nocturne.text2, fontSize: 14, lineHeight: 19, textAlign: 'center', marginTop: 4 },
  priceLine: { color: Nocturne.text, fontSize: 17, lineHeight: 24, textAlign: 'center', marginTop: 8 },
  priceStrong: { fontWeight: '700' },
  // Apple 3.1.2: the billed amount is the most prominent price; the per-month breakdown sits smaller.
  pricePerMonth: { color: Nocturne.text2, fontSize: 14 },
  otherPlans: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, marginTop: 6 },
  otherPlansLabel: { color: Nocturne.text, fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
  faq: { marginTop: 20, marginBottom: 16, borderRadius: 16, backgroundColor: Nocturne.surface, padding: 20, gap: 8 },
  faqTitle: { color: Nocturne.text, fontSize: 17, fontWeight: '700' },
  faqText: { color: Nocturne.text2, fontSize: 16, lineHeight: 22 },
  faqVoice: { ...DisplayFont, color: Nocturne.text, fontSize: 18, marginTop: 4 },
  twoLineCta: {
    minHeight: 60,
    borderRadius: 30,
    backgroundColor: Nocturne.cta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  pressedCta: { opacity: 0.8 },
  twoLineTitle: { color: Nocturne.onCta, fontSize: 18, fontWeight: '700' },
  twoLineSub: { color: Nocturne.onCta, opacity: 0.7, fontSize: 13, fontWeight: '500', marginTop: 1 },
  paywallFine: { color: Nocturne.text2, fontSize: 12, lineHeight: 16, textAlign: 'center' },
  sheetScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Nocturne.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 14,
  },
  sheetHandle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: Nocturne.progressTrack },
  sheetTitle: { color: Nocturne.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  sheetRows: { gap: 10 },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Nocturne.edge,
  },
  planOptionSelected: { borderWidth: 2, borderColor: Nocturne.text },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Nocturne.text2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Nocturne.text, backgroundColor: Nocturne.text },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Nocturne.onCta },
  planOptionTitle: { color: Nocturne.text, fontSize: 17, fontWeight: '700' },
  planOptionDetail: { color: Nocturne.text2, fontSize: 14, marginTop: 2 },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: { backgroundColor: Nocturne.raised, borderRadius: 24, padding: 22, gap: 14 },
  modalLabel: { color: Nocturne.text, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  modalText: { color: Nocturne.text, fontSize: 16, lineHeight: 22 },
});
