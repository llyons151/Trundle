import { createSharedStyles } from '../../components/app-ui';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Trundle } from '../../components/Trundle';
import { Button, useSharedStyles } from '../../components/app-ui';
import { formatTime } from '../../state/preferences';
import { useThemedStyles, type Theme, useTheme } from '../../theme';
import { OnboardingPanel } from './components/onboarding-panel';
import { TextAction, useOnboardingSizing } from './components/onboarding-layout';

export function MorningWalkScreen({ morning, disabled }: { morning: number; disabled: boolean }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const [demo, setDemo] = useState(0);
  const [panel, setPanel] = useState<'walk' | 'alternative' | null>(null);
  const { compact, small } = useOnboardingSizing();
  const steps = [0, 84, 200][demo];
  return <>
    <View style={[styles.demo, compact && { padding: ui.space.xs, gap: ui.space.xs }]}>
      <Text style={shared.eyebrow}>DEMO · NOT YOUR REAL STEPS</Text>
      <View style={styles.figure}><Trundle size={small ? 64 : compact ? 112 : 150} mode={demo === 1 ? 'walk' : demo === 2 ? 'stand' : 'rest'} sleeping={demo === 0} /></View>
      <View accessibilityLiveRegion="polite" style={styles.demoText}><Text style={[styles.count, compact && { fontSize: ui.type.heading, lineHeight: 28 }]}>{steps} <Text style={styles.target}>/ 200 steps</Text></Text><Text style={shared.caption}>{demo === 2 ? 'Awake. A fresh start.' : demo === 1 ? 'Stirring. Still blocked.' : 'A little walk to start the day.'}</Text></View>
      <Button secondary title={demo === 0 ? 'Try 84 demo steps' : demo === 1 ? 'Preview waking Trundle' : 'Replay the demo'} disabled={disabled} onPress={() => setDemo((demo + 1) % 3)} />
    </View>
    <TextAction label="How it works & walking alternatives" onPress={() => setPanel('walk')} />
    <OnboardingPanel visible={panel !== null} title={panel === 'alternative' ? 'You’re welcome here.' : 'Your morning, explained'} onClose={() => setPanel(null)}>
      {panel === 'walk' ? <>
        <Text style={shared.body}>The plan: count steps from {formatTime(morning)}, including steps before opening Trundle. At 200, bedtime apps unlock until bedtime or a nap.</Text>
        <Text style={shared.caption}>Always-blocked apps stay blocked. Nighttime steps don’t unlock apps. Real counting and motion access aren’t connected yet.</Text>
        <Button secondary title="What if walking doesn’t work for me?" onPress={() => setPanel('alternative')} />
        <Button title="Got it" onPress={() => setPanel(null)} />
      </> : <>
        <Text style={shared.body}>A non-walking option and an emergency bypass still need to be designed. Neither is available yet.</Text>
        <Text style={shared.body}>You can explore this preview without walking or enabling any restrictions. The demo never changes your app access.</Text>
        <Button title="Keep exploring" onPress={() => setPanel(null)} />
      </>}
    </OnboardingPanel>
  </>;
}

const createStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  demo: { padding: ui.space.lg, borderRadius: ui.radius.card, backgroundColor: ui.colors.accentSoft, gap: ui.space.md },
  figure: { alignItems: 'center' },
  demoText: { alignItems: 'center', gap: ui.space.xs },
  count: { ...shared.title, fontVariant: ['tabular-nums'] },
  target: { fontSize: ui.type.body, fontWeight: '400', letterSpacing: 0 },
}); };
