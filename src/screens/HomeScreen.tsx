import { useState } from 'react';
import { DetailSheet } from '../components/detail-sheet';
import { useRoutine } from '../state/use-routine';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { TrundleWordmark } from '../components/Brand';
import { SceneBackdrop } from '../components/SceneBackdrop';
import { RockPlatform } from '../components/RockPlatform';
import { Icon } from '../components/icon';
import { Screen, Row, Surface, SectionLabel, Button, useSharedStyles } from '../components/app-ui';
import { usePreferences, formatTime, savePreferences } from '../state/preferences';
import { useThemedStyles, type Theme, useTheme } from '../theme';
import { onboarding, useOnboarding } from '../state/onboarding';
import { ritualCue } from './onboarding/personalization';
import { DayNightToggle } from './day-night-toggle';

export function HomeScreen({ onManageApps, onOpenProfile, onRoutine, active = true }: {
  onRoutine: () => void;
  onManageApps: (list: 'scheduled' | 'always') => void;
  onOpenProfile: () => void;
  active?: boolean;
}) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { values, saving, error } = usePreferences();
  const setup = useOnboarding();
  const rest = useRoutine();
  const sleeping = rest.kind !== 'awake';
  const [previewSheet, setPreviewSheet] = useState(false);
  const [napSheet, setNapSheet] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  return <><Screen>
    <View style={styles.header}>
      <TrundleWordmark color={ui.colors.text} />
      <Pressable accessibilityRole="button" accessibilityLabel="Open your profile" onPress={onOpenProfile} style={({ pressed }) => [styles.profile, { opacity: pressed ? 0.6 : 1 }]}>
        <Icon name="user" size={24} color={ui.colors.text} />
      </Pressable>
    </View>
    <View style={styles.scene}>
      <SceneBackdrop />
      <RockPlatform size={Math.min(width - 72, 240)} active={active} sleeping={sleeping} />
      <DayNightToggle active={active} />
    </View>
    <View style={styles.welcome}>
      <Text accessibilityRole="header" style={styles.title}>{rest.kind === 'bedtime' ? 'Sweet dreams, Trundle.' : rest.kind === 'nap' ? 'Shh. Trundle’s napping.' : 'Put your phone down.\nLet Trundle rest.'}</Text>
      <Text style={[shared.body, styles.center]}>{rest.kind === 'bedtime' ? `All settled in. His morning walk starts at ${formatTime(values.morning)}.` : rest.kind === 'nap' ? rest.end === values.bedtime ? `A nap until bedtime at ${formatTime(rest.end)}, then tucked in for the night.` : `He’ll wake at ${formatTime(rest.end)}. A little quiet time for both of you.` : 'Make time for his naps, share a bedtime, and start the morning with a little walk.'}</Text>
    </View>
    {!sleeping && <Button title="Tuck him in for a nap" onPress={() => setNapSheet(true)} />}
    <Pressable accessibilityRole="button" accessibilityLabel="Preview: app blocking is not connected. Learn more." onPress={() => setPreviewSheet(true)} style={({ pressed }) => [styles.previewLink, { opacity: pressed ? 0.6 : 1 }]}>
      <Icon name="info" size={15} color={ui.colors.textMuted} /><Text style={shared.note}>Preview · app blocking isn’t connected</Text><Icon name="chevron-right" size={13} color={ui.colors.textMuted} />
    </Pressable>
    <View style={[styles.routineStrip, fontScale > 1.2 && { flexDirection: 'column' }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit bedtime, ${formatTime(values.bedtime)}`} onPress={onRoutine} style={({ pressed }) => [styles.routineTime, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={styles.timeLabel}><Icon name="moon" size={16} color={ui.colors.accentText} /><Text style={shared.caption}>Bedtime</Text></View><Text style={styles.time}>{formatTime(values.bedtime)}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit morning start, ${formatTime(values.morning)}`} onPress={onRoutine} style={({ pressed }) => [styles.routineTime, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={styles.timeLabel}><Icon name="sun" size={16} color={ui.colors.accentText} /><Text style={shared.caption}>Morning</Text></View><Text style={styles.time}>{formatTime(values.morning)}</Text>
      </Pressable>
    </View>
    <Row icon="moon" title={values.naps.length ? `${values.naps.length} daily ${values.naps.length === 1 ? 'nap' : 'naps'}` : 'Add a daily nap'} detail="A quiet break · wakes automatically" onPress={onRoutine} last />
    {setup.record?.status === 'completed' && setup.record.answers?.ritual && <Pressable accessibilityRole="button" accessibilityLabel="Edit evening ritual" accessibilityState={{ disabled: setup.busy }} disabled={setup.busy} onPress={() => { void onboarding.resume(values, 'ritual'); }} style={({ pressed }) => [{ gap: ui.space.xs, marginTop: ui.space.md, paddingVertical: ui.space.sm }, pressed && { opacity: 0.6 }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: ui.space.sm }}><Text style={shared.eyebrow}>YOUR EVENING RITUAL</Text><Icon name="edit" size={16} color={ui.colors.accentText} /></View><Text style={shared.body}>{ritualCue(setup.record.answers)}</Text>{!!setup.error && <Text accessibilityRole="alert" style={shared.caption}>{setup.error}</Text>}</Pressable>}
    <SectionLabel>App lists</SectionLabel>
    <Surface>
      <Row icon="moon" title="Bedtime apps" detail={values.scheduled.length ? `${values.scheduled.length} selected · follow bedtime and naps` : 'Choose which apps rest with him'} onPress={() => onManageApps('scheduled')} />
      <Row icon="shield" title="Always blocked" detail={values.always.length ? `${values.always.length} selected · stay blocked after waking` : 'Keep a separate list, any time of day'} onPress={() => onManageApps('always')} last />
    </Surface>

  </Screen>
    <DetailSheet visible={previewSheet} title="A look at what’s ahead" onClose={() => setPreviewSheet(false)}><Text style={[shared.body, { marginBottom: 24 }]}>Trundle follows your sleep schedule here. Your preferences are saved, but app blocking and the 200-step morning wake-up aren’t connected yet.</Text><Button title="Got it" onPress={() => setPreviewSheet(false)} /></DetailSheet>
    <DetailSheet visible={napSheet} title="Time for a little nap" closeLabel="Cancel nap" onClose={() => { if (!saving) setNapSheet(false); }}>
      <View style={{ gap: ui.space.md }}>
        <Text style={shared.body}>Choose how long he rests. He’ll wake automatically; if bedtime arrives first, he’ll settle in for the night.</Text>
        <Text style={shared.caption}>Preview only — your apps will remain available.</Text>
        {[15, 30, 60].map(minutes => <Button key={minutes} title={`${minutes}-minute nap`} disabled={saving} onPress={async () => {
          if (await savePreferences({ napUntil: Date.now() + minutes * 60000 })) setNapSheet(false);
        }} />)}
        {!!error && <Text accessibilityRole="alert" style={shared.caption}>{error}</Text>}
      </View>
    </DetailSheet>
  </>;
}

const createStyles = (ui: Theme) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ui.space.md },
  profile: { width: 48, height: 48, borderRadius: ui.radius.pill, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  scene: { alignItems: 'center', paddingTop: ui.space.lg, paddingBottom: 12, marginTop: ui.space.sm },
  welcome: { alignItems: 'center', gap: ui.space.sm, marginTop: ui.space.sm, marginBottom: ui.space.lg },
  title: { fontFamily: ui.fonts.display, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.7, color: ui.colors.text, textAlign: 'center' },
  center: { textAlign: 'center' },
  previewLink: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, marginTop: 4 },
  routineStrip: { flexDirection: 'row', gap: 24, paddingVertical: 24, marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: ui.colors.border },
  routineTime: { flex: 1, gap: 8, minHeight: 64 },
  timeLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  time: { fontFamily: ui.fonts.display, fontWeight: '600', fontSize: 25, letterSpacing: -0.6, color: ui.colors.text, fontVariant: ['tabular-nums'] },
});
