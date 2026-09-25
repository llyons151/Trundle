import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Nocturne } from '@/constants/nocturne';

import * as haptic from './haptics';
import { useCompact } from './layout';
import { Reveal } from './motion';
import { NUMBER_FONT } from './rolling-number';
import { Body, PreviewNote, PrimaryButton, TextButton, Voice } from './ui';

export const TEST_STEPS = 10;
/** Web and simulators have no pedometer: the preview walks for them, one step per beat. */
const FAKE_STEP_MS = 420;

type Phase = 'ready' | 'counting' | 'done' | 'denied';

/**
 * The Motion & Fitness screen, as a live test: allow access, stand up, walk ten steps,
 * and watch them count. It proves the morning mechanic works before anyone pays, and
 * asks for the permission at the moment it's needed.
 */
export function useStepTest({ simulate }: { simulate: (message: string, then: () => void) => void }) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [steps, setSteps] = useState(0);
  const [faked, setFaked] = useState(false);
  const stop = useRef<(() => void) | null>(null);
  const counted = useRef(0);

  useEffect(() => () => stop.current?.(), []);

  const count = (value: number) => {
    const capped = Math.min(value, TEST_STEPS);
    if (capped <= counted.current) return;
    counted.current = capped;
    setSteps(capped);
    if (capped < TEST_STEPS) haptic.tick();
    if (capped >= TEST_STEPS) {
      stop.current?.();
      stop.current = null;
      haptic.done();
      setPhase('done');
      AccessibilityInfo.announceForAccessibility(`${TEST_STEPS} steps. It works.`);
    }
  };

  const fakeWalk = () => {
    setFaked(true);
    setPhase('counting');
    let walked = 0;
    const id = setInterval(() => count((walked += 1)), FAKE_STEP_MS);
    stop.current = () => clearInterval(id);
  };

  const start = async () => {
    const available = Platform.OS !== 'web' && (await Pedometer.isAvailableAsync().catch(() => false));
    if (!available) {
      simulate('iOS asks for Motion & Fitness access here. This device has no step counter, so the preview walks for you.', fakeWalk);
      return;
    }
    const { granted } = await Pedometer.requestPermissionsAsync();
    if (!granted) {
      setPhase('denied');
      return;
    }
    setPhase('counting');
    // Steps since subscribing. Core Motion delivers them in batches, a second or two late.
    const subscription = Pedometer.watchStepCount((result) => count(result.steps));
    stop.current = () => subscription.remove();
  };

  /** Stops counting. Leaving mid-test starts it over next time; a finished test stays done. */
  const stopCounting = () => {
    stop.current?.();
    stop.current = null;
    if (phase === 'counting') {
      counted.current = 0;
      setSteps(0);
      setPhase('ready');
    }
  };

  return { phase, steps, faked, start, stop: stopCounting };
}

export function StepTestBody({
  phase,
  steps,
  faked,
  lateNight,
}: {
  phase: Phase;
  steps: number;
  faked: boolean;
  lateNight: boolean;
}) {
  const compact = useCompact();

  if (phase === 'denied') {
    return (
      <View style={styles.center}>
        <Voice text="No steps, no mornings." size={34} header />
        <View style={styles.gap16} />
        <Body>
          Without Motion & Fitness I can’t count your walk, so I can’t wake your apps. Turn it on in Settings, under
          Privacy & Security.
        </Body>
      </View>
    );
  }

  const line =
    phase === 'done'
      ? 'Ten. It works. Unfortunately.'
      : phase === 'counting'
        ? 'Walk. I’m counting. I lag a second.'
        : lateNight
          ? 'Ten steps. Yes, now. Bathroom counts.'
          : 'Stand up. Ten steps. Let’s test me.';

  return (
    <View style={styles.center}>
      <Voice key={line} text={line} size={34} header />
      <View style={styles.gap16} />
      <Body>
        {phase === 'ready'
          ? 'Every morning I count 200. First, ten, so you know it works. Motion & Fitness is all I use it for.'
          : 'Each dot is a step. Tomorrow it’s 200.'}
      </Body>

      <Reveal style={[styles.counter, compact && styles.counterCompact]}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Test steps"
          accessibilityValue={{ min: 0, max: TEST_STEPS, now: steps, text: `${steps} of ${TEST_STEPS} steps` }}
        >
          <Text style={[styles.count, compact && styles.countCompact]} maxFontSizeMultiplier={1.3}>
            {steps}
            <Text style={styles.goal}> / {TEST_STEPS}</Text>
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: TEST_STEPS }, (_, i) => (
              <View key={i} style={[styles.dot, i < steps && styles.dotOn]} />
            ))}
          </View>
        </View>
      </Reveal>

      {faked ? <PreviewNote>No step counter here, so these steps are simulated. On an iPhone they’re yours.</PreviewNote> : null}
    </View>
  );
}

export function StepTestFooter({
  phase,
  start,
  skip,
  next,
}: {
  phase: Phase;
  start: () => void;
  skip: () => void;
  next: () => void;
}) {
  if (phase === 'done') return <PrimaryButton label="Continue" onPress={next} />;
  if (phase === 'denied') {
    return (
      <>
        <PrimaryButton label="Open Settings" onPress={() => Linking.openSettings().catch(() => {})} />
        <TextButton label="Continue without steps" onPress={next} />
      </>
    );
  }
  return (
    <>
      {phase === 'ready' ? (
        <PrimaryButton label="Allow and start" onPress={start} />
      ) : (
        <PrimaryButton label="Keep walking" disabled onPress={() => {}} />
      )}
      <TextButton
        label="I’m in bed. Skip the test"
        onPress={() => {
          skip();
          next();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  gap16: { height: 16 },
  counter: { marginTop: 36, marginBottom: 20 },
  counterCompact: { marginTop: 22, marginBottom: 12 },
  count: { ...NUMBER_FONT, color: Nocturne.accent ?? Nocturne.text, fontSize: 96, lineHeight: 100, fontVariant: ['tabular-nums'] },
  countCompact: { fontSize: 72, lineHeight: 76 },
  goal: { color: Nocturne.text2, fontSize: 26, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 14 },
  dot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Nocturne.track },
  dotOn: { backgroundColor: Nocturne.text },
});
