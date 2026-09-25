import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Share,
  Switch,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  MORNING_ECHO,
  OFFER_HEADLINES,
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
import { FLIGHT_MS, moonBottom, NightSky, QUIZ_RISE_MS, quizContentTop } from './night-sky';
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
  MoonSurface,
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
import { AppleAlertPicture } from './apple-alert';
import { AppPickerSheet, AppsCard } from './app-picker';
import { DayPicker } from './day-picker';
import { ScheduleCard } from './schedule-card';
import { StepTestBody, StepTestFooter, useStepTest } from './step-test';
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

/** The two paywall pages. Exit from either goes to `declined` instead of closing. */
const PAYWALL: StepId[] = ['offer', 'plans'];

/** Screens that close the flow in the same moonlit scene it opens with. */
// Quiet moments start their content below the moon in the sky photo.
const MOON_FEATURE: StepId[] = ['intro', 'under-13', 'declined'];

/**
 * The quiz happens on the risen moon: it rises once at the first question and stays up
 * through the last, so it doesn't bob between screens, then sinks for the math.
 */
const MOON_QUIZ: StepId[] = STEPS.slice(STEPS.indexOf('nights'), STEPS.indexOf('time-back') + 1);

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
  scrollDays: [0, 1, 2, 3, 4, 5, 6],
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
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
  // Leaving the paywall lands on one honest "Fair." screen, once. A second exit really exits.
  const leave =
    PAYWALL.includes(step) && !history.includes('declined')
      ? () => go('declined')
      : exit;
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
  const [pickerOpen, setPickerOpen] = useState(false);

  // While the moon moves (to or from the opener, or into and out of the quiz), the page
  // waits so text enters once it lands.
  const reducedMotion = useReducedMotion();
  const opening = step === 'hello';
  const quiz = MOON_QUIZ.includes(step);
  const moonPlace = opening ? 'opener' : quiz ? 'quiz' : 'rest';
  const [lastMoonPlace, setLastMoonPlace] = useState(moonPlace);
  const [moonMoving, setMoonMoving] = useState(0);
  if (lastMoonPlace !== moonPlace) {
    setLastMoonPlace(moonPlace);
    const flying = moonPlace === 'opener' || lastMoonPlace === 'opener';
    if (!reducedMotion) setMoonMoving(flying ? FLIGHT_MS : QUIZ_RISE_MS);
  }
  useEffect(() => {
    if (!moonMoving) return;
    const timer = setTimeout(() => setMoonMoving(0), moonMoving);
    return () => clearTimeout(timer);
  }, [moonMoving, step]);

  const lateNight = isInsideBedtime(answers.bedtime, answers.wake);
  const compact = useCompact();
  // Lives here so the counter survives the page re-rendering; leaving the page stops it.
  const stepTest = useStepTest({ simulate });
  const stopStepTest = stepTest.stop;
  useEffect(() => {
    if (step !== 'motion') stopStepTest();
  }, [step, stopStepTest]);
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
    stepTest,
    openPicker: () => setPickerOpen(true),
  });

  return (
    <View style={styles.root}>
      <NightSky opening={opening} quiz={quiz} />
      <Shell progress={progressFor(step)} onBack={back} onExit={leave} footer={screen.footer && !moonMoving ? <FooterEnter key={`${step}-${history.length}`}>{screen.footer}</FooterEnter> : undefined}
      >
        {moonMoving ? null : (
          <StepEnter key={`${step}-${history.length}`} motion={MOTION[step] ?? 'drift'}>
            {/* Featured-moon screens start below the moon so text never runs across it. */}
            <View
              style={[
                styles.fill,
                MOON_FEATURE.includes(step) && { paddingTop: moonBottom(width) - 40 },
                quiz && { paddingTop: quizContentTop(height, insets.top) },
              ]}
            >
              <MoonSurface value={quiz}>{screen.body}</MoonSurface>
            </View>
          </StepEnter>
        )}
      </Shell>
      <AppPickerSheet
        open={pickerOpen}
        apps={answers.apps}
        onClose={() => setPickerOpen(false)}
        onDone={(picked) => {
          set('apps', picked);
          setPickerOpen(false);
        }}
      />
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
  stepTest: ReturnType<typeof useStepTest>;
  /** Opens the stand-in for Apple's app picker. */
  openPicker: () => void;
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
  const { step, answers, numbers, set, choose, next, go, edit, exit, simulate, purchased, lateNight, compact, editing, stepTest, openPicker } = ctx;
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
      return moonQuestion('What happens most nights?', undefined, (
        <Options options={NIGHTS} value={answers.nights} onChoose={choose('nights')} tone="moon" />
      ));

    case 'night-minutes':
      return moonQuestion('After you get into bed, how long are you on your phone?', 'A rough guess is fine.', (
        <Options options={NIGHT_MINUTES} value={answers.nightMinutes} onChoose={choose('nightMinutes')} tone="moon" />
      ));

    case 'nights-per-week': {
      const days = answers.scrollDays ?? [];
      return {
        ...question(
          'Which nights does that happen?',
          'Tap every one that counts.',
          <DayPicker
            value={days}
            onChange={(picked) => {
              set('scrollDays', picked);
              set('nightsPerWeek', picked.length);
            }}
          />,
        ),
        footer: (
          <PrimaryButton
            label={days.length === 0 ? 'Tap at least one' : 'Continue'}
            disabled={days.length === 0}
            onPress={next}
          />
        ),
      };
    }

    case 'bedtime':
      return {
        body: (
          <View style={styles.fill}>
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
          <View style={styles.fill}>
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
      return moonQuestion('In the morning, how long are you on your phone before you get up?', 'Counting from the first alarm.', (
        <Options options={MORNING_MINUTES} value={answers.morningMinutes} onChoose={choose('morningMinutes')} tone="moon" />
      ));

    case 'stat':
      return {
        body: (
          <View style={styles.center}>
            <Reveal>
              <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
                85%
              </Text>
            </Reveal>
            <Body style={styles.statText}>of U.S. adults check their phone within 10 minutes of waking.</Body>
            <View style={styles.gap32} />
            <Voice text={MORNING_ECHO[answers.morningMinutes ?? -1] ?? 'Not just you, then.'} size={28} delay={600} sub />
          </View>
        ),
        footer: <PrimaryButton label="Continue" onPress={next} />,
      };

    case 'age':
      return {
        ...question(
          'How old are you?',
          'Sleep needs change with age.',
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
      return moonQuestion('How do you feel when your alarm goes off?', undefined, (
        <Options options={ALARM} value={answers.alarm} onChoose={choose('alarm')} tone="moon" />
      ));

    case 'tried':
      return moonQuestion('What have you tried?', 'Pick the one that lasted longest.', (
        <Options options={TRIED} value={answers.tried} onChoose={choose('tried')} tone="moon" />
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
      return moonQuestion('Say you got those minutes back. What would you do with them?', undefined, (
        <Options options={TIME_BACK} value={answers.timeBack} onChoose={choose('timeBack')} tone="moon" />
      ));

    case 'math':
      return { body: <MathScreen line={NIGHTS_ECHO[answers.nights ?? ''] ?? 'Counting. Don’t watch me.'} onDone={next} /> };

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
            <AppleAlertPicture
              title="“Trundle” Would Like to Access Screen Time"
              message="Providing “Trundle” access to Screen Time may allow it to see your activity data, restrict content, and limit the usage of apps and websites."
              buttons={['Continue', 'Don’t Allow']}
              point={0}
            />
            {compact ? null : <Voice text="Apple’s box is boring. So am I." size={22} delay={600} sub />}
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

    case 'apps': {
      const picked = answers.apps.length > 0;
      return {
        body: (
          <View style={styles.top}>
            <Title>Which apps keep you up?</Title>
            <Body style={styles.sub}>They sleep at bedtime and wake after your walk. Calls and texts aren’t touched.</Body>
            <View style={styles.appsCard}>
              <AppsCard apps={answers.apps} onOpen={openPicker} maxRows={compact ? 4 : 6} />
            </View>
          </View>
        ),
        footer: (
          <PrimaryButton
            label={!picked ? 'Add apps' : editing ? 'Save' : `Put ${answers.apps.length} to sleep`}
            onPress={picked ? next : openPicker}
          />
        ),
      };
    }

    case 'motion':
      return {
        body: <StepTestBody phase={stepTest.phase} steps={stepTest.steps} faked={stepTest.faked} lateNight={lateNight} />,
        footer: <StepTestFooter phase={stepTest.phase} start={stepTest.start} skip={stepTest.stop} next={next} />,
      };

    case 'ready':
      return {
        body: (
          <View style={styles.top}>
            <Title>Tonight’s lock is ready.</Title>
            <ScheduleCard
              bedtime={answers.bedtime}
              wake={answers.wake}
              apps={answers.apps}
              compact={compact}
              onChange={edit}
            />
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
      return plansStep(answers, set, purchased, simulate, compact, bed);

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
              {answers.plan === 'annual' && PRICES.trialEligible && answers.remindTrial
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
      // The last screen: what tomorrow looks like, then bed.
      return {
        body: (
          <View style={styles.center}>
            <Title>{`${wakeDay}, ${wake}.`}</Title>
            <View style={styles.plan}>
              <PlanRow when="Steps" what={`Count from ${wake}. Bathroom, kitchen, it all counts.`} />
              <PlanRow when="At 200" what="Open a sleeping app and tap Check steps. Or just open me." />
              <PlanRow when="Bad day" what="Use a pass. No walking." />
            </View>
            <Voice text={lateNight ? 'That’s it. Go to sleep.' : `That’s it. Bed at ${bed}.`} size={28} delay={700} header />
            <View style={styles.gap8} />
            <Voice text="I’ll be asleep. Don’t wake me." size={22} delay={1300} sub />
          </View>
        ),
        footer: <PrimaryButton label="Finish preview" onPress={exit} />,
      };
  }
}

/**
 * A list question on the risen moon, after Headspace's "What's on your mind?": centred
 * title and hint at the top of the moon's surface, black option pills anchored at the
 * bottom where thumbs are.
 */
function moonQuestion(title: string, sub: string | undefined, options: ReactNode) {
  return {
    body: (
      <View style={styles.moonQuestion}>
        <View>
          <Title style={styles.moonTitle}>{title}</Title>
          {sub ? <Body style={[styles.sub, styles.moonSub]}>{sub}</Body> : null}
        </View>
        {options}
      </View>
    ),
  };
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
 * The paywall, after the user's two references: a dark card paywall (title, checklist,
 * radio plan rows) with the plant app's plan list (Lifetime, Annual, Monthly, reminder
 * toggle). Annual is selected by default and shows its per-month price. Apple 3.1.2: the
 * billed amount stays the biggest price on each card, and per-month sits under it.
 * No struck-through "was" prices: there was never a higher price to strike.
 */
function plansStep(
  answers: Answers,
  set: StepContext['set'],
  purchase: () => void,
  simulate: StepContext['simulate'],
  compact: boolean,
  bed: string,
): { body: ReactNode; footer: ReactNode } {
  // One line in the checklist: the first app by name, the rest as a count.
  const [first, ...rest] = answers.apps;
  const apps = !first ? 'Your apps' : rest.length ? `${first} and ${rest.length} more` : first;
  const trial = PRICES.trialEligible;
  const annual = money(PRICES.annual);
  const monthly = money(PRICES.monthly);
  const lifetime = money(PRICES.lifetime);
  const plan = answers.plan;
  const trialPlan = plan === 'annual' && trial;
  const link = (label: string, message: string) => (
    <Text accessibilityRole="link" style={styles.link} onPress={() => simulate(message, () => {})}>
      {label}
    </Text>
  );
  const cta = {
    annual: trial
      ? { title: `Start ${PRICES.trialDays}-day free trial`, sub: 'No payment due now · cancel anytime' }
      : { title: `Subscribe for ${annual}/year`, sub: 'Cancel anytime in Settings' },
    monthly: { title: `Subscribe for ${monthly}/month`, sub: 'Billed today · cancel anytime' },
    lifetime: { title: `Buy lifetime for ${lifetime}`, sub: 'One payment · no subscription' },
  }[plan];
  const summary = {
    annual: trial
      ? `Free until ${dateFromToday(PRICES.trialDays)}, then ${annual}/year.`
      : `${annual}/year. Cancel anytime.`,
    monthly: `${monthly} today, then monthly. Cancel anytime.`,
    lifetime: `${lifetime} once. Nothing renews.`,
  }[plan];
  const terms = {
    annual: `${trial ? `${PRICES.trialDays} days free, then ${annual}/year from ${dateFromToday(PRICES.trialDays)}` : `${annual}/year`}. Auto-renews unless cancelled at least 24 hours before renewal.`,
    monthly: `${monthly}/month. Auto-renews unless cancelled at least 24 hours before renewal.`,
    lifetime: `${lifetime} once. Not a subscription, nothing renews.`,
  }[plan];
  return {
    body: (
      <View style={[styles.paywall, compact && styles.paywallCompact]}>
        <Reveal>
          <Text style={[styles.paywallTitle, compact && styles.paywallTitleCompact]} accessibilityRole="header">
            {trial ? 'Try Trundle free' : 'Pick a plan'}
          </Text>
        </Reveal>
        {compact ? null : (
          <View style={styles.paywallVoice}>
            <Voice
              text={trial ? 'Seven nights free. I’ll sleep through most of them.' : 'Fine. I’ll get up for this.'}
              size={20}
              delay={500}
              sub
              center
            />
          </View>
        )}
        <View style={[styles.checks, compact && styles.checksCompact]}>
          <Check text={`${apps} sleep at ${bed}`} />
          <Check text="Awake again after 200 morning steps" />
          <Check text="Passes for sick days and travel" />
        </View>
        <View accessibilityRole="radiogroup" style={styles.planCards}>
          <PlanCard
            selected={plan === 'lifetime'}
            onPress={() => set('plan', 'lifetime')}
            title="Lifetime"
            price={`${lifetime} once`}
            detail="Pay once. Yours forever."
            compact={compact}
          />
          <PlanCard
            selected={plan === 'annual'}
            onPress={() => set('plan', 'annual')}
            title="Annual"
            price={`${money(PRICES.annual / 12)}/month`}
            detail={`(${money(PRICES.annual)}/year)${trial ? ` · ${PRICES.trialDays} days free` : ''}`}
            badge={`Save ${annualSavings()}%`}
            compact={compact}
          />
          <PlanCard
            selected={plan === 'monthly'}
            onPress={() => set('plan', 'monthly')}
            title="Monthly"
            price={`${monthly}/month`}
            detail="No free trial"
            compact={compact}
          />
        </View>
        {/* One plain sentence about what happens next, at reading size rather than in the fine print. */}
        <Text style={styles.planSummary}>{summary}</Text>
        {/* Only the trial has an end to be reminded about. Keeps its height so the page doesn't jump. */}
        <View style={[styles.remindRow, !trialPlan && styles.hiddenBlock, { pointerEvents: trialPlan ? 'auto' : 'none' }]}>
          <Text style={styles.remindLabel}>Remind me 2 days before it ends</Text>
          <Switch
            value={answers.remindTrial}
            onValueChange={(on) => {
              haptic.tap();
              set('remindTrial', on);
            }}
            trackColor={{ false: Nocturne.track, true: Nocturne.cta }}
            thumbColor={answers.remindTrial ? Nocturne.onCta : Nocturne.text}
            ios_backgroundColor={Nocturne.track}
            // react-native-web colors the "on" thumb teal unless told otherwise.
            {...(Platform.OS === 'web' ? ({ activeThumbColor: Nocturne.onCta } as object) : {})}
            accessibilityLabel="Remind me 2 days before the trial ends"
          />
        </View>
      </View>
    ),
    footer: (
      <>
        <TwoLineCta title={cta.title} sub={cta.sub} onPress={purchase} />
        <Text style={styles.paywallFine}>
          {terms} Preview: nothing is charged.{' '}
          {link('Restore', 'Restore Purchases runs here, for anyone who already subscribed.')} ·{' '}
          {link('Terms', 'Your Terms of Use open here.')} · {link('Privacy', 'Your Privacy Policy opens here.')}
        </Text>
      </>
    ),
  };
}

function Check({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor={Nocturne.text} />
      <Text style={styles.checkText} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

function MathScreen({ line, onDone }: { line: string; onDone: () => void }) {
  // Only what the number is made of: bedtime and wake come after it, in setup.
  const lines = ['Nights in bed with your phone', 'Mornings before you get up', 'Nights a week'];
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
      <Voice text={line} size={34} header />
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

/** One plan on the paywall: radio, name and badge on top, billed price, then the detail line. */
function PlanCard({
  selected,
  onPress,
  title,
  price,
  detail,
  badge,
  compact,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  price: string;
  detail: string;
  badge?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}, ${price}. ${detail}${badge ? `. ${badge.replace('%', ' percent')}` : ''}`}
      style={[styles.planOption, compact && styles.planOptionCompact, selected && styles.planOptionSelected]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.fill}>
        <View style={styles.planOptionTop}>
          <Text style={styles.planOptionTitle}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.planOptionPrice}>{price}</Text>
        <Text style={styles.planOptionDetail}>{detail}</Text>
      </View>
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
  gap8: { height: 8 },
  gap16: { height: 16 },
  gap32: { height: 32 },
  sub: { marginTop: 10 },
  question: { flex: 1, justifyContent: 'space-between', paddingTop: 20, gap: 28 },
  questionHead: {},
  optionsWrap: { paddingBottom: 8 },
  optionsCentered: { flex: 1, justifyContent: 'center' },
  moonQuestion: { flex: 1, justifyContent: 'space-between', gap: 22, paddingBottom: 8 },
  moonTitle: { textAlign: 'center', fontSize: 24, lineHeight: 29 },
  moonSub: { textAlign: 'center', color: Nocturne.text },
  // Bedtime and wake sit under the quiz moon's curve, so they run tight.
  timeWrap: { marginTop: 16 },
  warning: { marginTop: 28, textAlign: 'center', color: Nocturne.text },
  beats: { marginTop: 32, gap: 26 },
  beat: { gap: 6 },
  beatLabel: { color: Nocturne.text2, fontSize: 12, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  beatText: { ...DisplayFont, color: Nocturne.text, fontSize: 26, lineHeight: 30 },
  // Numbers use the serif upright. Italic serif always means Trundle is talking.
  // The stat sits on the quiz moon, centred like the rest of the moon pages.
  statNumber: { ...NUMBER_FONT, color: Nocturne.accent ?? Nocturne.text, fontSize: 108, lineHeight: 112, letterSpacing: -1, textAlign: 'center' },
  revealUnit: { color: Nocturne.text, fontSize: 24, fontWeight: '600' },
  statText: { color: Nocturne.text, fontSize: 20, lineHeight: 27, marginTop: 8, textAlign: 'center' },
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
  hiddenBlock: { opacity: 0 },
  appsCard: { marginTop: 28 },
  plan: { marginVertical: 28, gap: 14 },
  planRow: { flexDirection: 'row', gap: 14, alignItems: 'baseline' },
  planWhen: { width: 78, color: Nocturne.text2, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  planWhat: { flex: 1, color: Nocturne.text, fontSize: 17, lineHeight: 23 },
  change: { color: Nocturne.text2, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  reassure: { color: Nocturne.text, fontSize: 15, lineHeight: 21, fontWeight: '500' },
  shiftRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  // The user's side of the deal, so sans like every other non-Trundle headline.
  pledge: { fontSize: 32, lineHeight: 37 },
  payoffLifetime: { color: Nocturne.text2, fontSize: 17, lineHeight: 22, marginTop: 6, textAlign: 'center' },
  payoff: { ...NUMBER_FONT, color: Nocturne.accent ?? Nocturne.text, fontSize: 26, lineHeight: 32, letterSpacing: 0.2, textAlign: 'center' },
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
  planCards: { gap: 10, marginTop: 18, marginBottom: 12 },
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
  paywall: { flex: 1, justifyContent: 'center', paddingBottom: 8 },
  // Short phones have no spare height to centre in: start at the top so the title never clips.
  paywallCompact: { justifyContent: 'flex-start', paddingBottom: 0 },
  planSummary: { color: Nocturne.text, fontSize: 15, lineHeight: 20, textAlign: 'center', marginBottom: 4 },
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
  paywallTitleCompact: { fontSize: 25, lineHeight: 30, marginTop: 0 },
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
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Nocturne.surface,
    // Always 2 wide, so selecting a plan never nudges the layout.
    borderWidth: 2,
    borderColor: Nocturne.edge,
  },
  planOptionSelected: { borderColor: Nocturne.text, backgroundColor: Nocturne.raised },
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
  planOptionCompact: { paddingVertical: 10 },
  planOptionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  planOptionTitle: { color: Nocturne.text, fontSize: 17, fontWeight: '700' },
  // Apple 3.1.2: the billed price is the largest; the per-month line sits under it, smaller.
  planOptionPrice: { color: Nocturne.text, fontSize: 19, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  planOptionDetail: { color: Nocturne.text, opacity: 0.75, fontSize: 14, marginTop: 1, fontVariant: ['tabular-nums'] },
  checks: { gap: 10, marginTop: 18, alignSelf: 'center' },
  checksCompact: { marginTop: 10, gap: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { color: Nocturne.text, fontSize: 16, flexShrink: 1 },
  remindRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 },
  remindLabel: { color: Nocturne.text, fontSize: 15, flexShrink: 1 },
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
