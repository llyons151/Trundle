import { createSharedStyles } from '../components/app-ui';
import { NapEditor } from '../components/nap-editor';
import { napFits } from '../state/routine';
import { TimePicker } from '../components/time-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Screen, Heading, Surface, SectionLabel, PreviewNotice, Row, Button, useSharedStyles } from '../components/app-ui';
import { DetailSheet } from '../components/detail-sheet';
import { Icon } from '../components/icon';
import { usePreferences, savePreferences, formatTime } from '../state/preferences';
import { useThemedStyles, type Theme, useTheme } from '../theme';

export function RoutineScreen({ onManageApps }: { onManageApps: (list: 'scheduled' | 'always') => void }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { values, saving, error } = usePreferences();
  const { width, fontScale } = useWindowDimensions();
  const stackTimes = width < 360 || fontScale > 1.2;
  const [editing, setEditing] = useState<'bedtime' | 'morning' | null>(null);
  const [draft, setDraft] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const edit = (key: 'bedtime' | 'morning') => { setDraft(values[key]); setEditing(key); };
  const proposed = { ...values, ...(editing ? { [editing]: draft } : {}) };
  const invalid = proposed.bedtime === proposed.morning || proposed.naps.some(nap => !napFits(nap, proposed));
  const hours = ((values.morning - values.bedtime + 1440) % 1440) / 60;
  return <><Screen>
    <Heading eyebrow="A LITTLE REST GOES A LONG WAY" title="Routine" subtitle="Rest well. Start fresh." />
    <Surface style={styles.schedule}>
      <View style={styles.scheduleLabel}><Icon name="moon" size={16} color={ui.colors.accent} /><Text style={styles.overline}>EVERY DAY</Text><Text style={styles.preview}>PREVIEW</Text></View>
      <View style={[styles.times, stackTimes && { flexDirection: 'column', gap: 24 }]}>{(['bedtime', 'morning'] as const).map(key => <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${key === 'bedtime' ? 'bedtime' : 'morning start'}, ${formatTime(values[key])}`} key={key} onPress={() => edit(key)} style={({ pressed }) => [styles.timeButton, pressed && { opacity: 0.6 }]}>
        <Text style={shared.caption}>{key === 'bedtime' ? 'Tuck him in' : 'Morning walk'}</Text><Text style={styles.time}>{formatTime(values[key])}</Text><View style={styles.editHint}><Icon name={key === 'bedtime' ? 'moon' : 'sun'} size={16} color={ui.colors.accent} /><Text style={styles.editText}>Tap to edit</Text></View>
      </Pressable>)}</View>

      <Text style={styles.restText}>{Math.floor(hours)}h{Math.round((hours % 1) * 60) ? ` ${Math.round((hours % 1) * 60)}m` : ''} set aside for the night</Text>
    </Surface>
    <SectionLabel>Daily naps</SectionLabel>
    <NapEditor />
    <SectionLabel>App lists</SectionLabel>
    <Surface><Row icon="moon" title="Bedtime apps" detail={`${values.scheduled.length} selected · follow bedtime and naps`} onPress={() => onManageApps('scheduled')} /><Row icon="shield" title="Always blocked" detail={`${values.always.length} selected · stay blocked after waking`} onPress={() => onManageApps('always')} last /></Surface>
    <Row icon="info" title="How your routine works" onPress={() => setShowGuide(true)} last />
    <PreviewNotice>Your preferences are saved. Trundle follows bedtime and naps here. App blocking and morning step tracking aren’t connected in this preview.</PreviewNotice>
  </Screen>
  <DetailSheet visible={showGuide} title="A gentler daily rhythm" onClose={() => setShowGuide(false)}>
    <View>
      <Row icon="moon" title="Tuck him in for the night" detail={`At ${formatTime(values.bedtime)}, your bedtime apps will block.`} />
      <Row icon="activity" title="A 200-step good morning" detail={`From ${formatTime(values.morning)}, a short walk will wake Trundle and unlock your bedtime apps.`} />
      <Row icon="sun" title="The day is yours" detail="Between naps, bedtime apps stay available until the next bedtime." last />
    </View>
<Button title="Got it" onPress={() => setShowGuide(false)} /></DetailSheet>
  <DetailSheet visible={editing !== null} closeLabel="Cancel editing" onClose={() => setEditing(null)} title={editing === 'bedtime' ? 'Time to wind down' : 'A fresh start'}>
    <Text style={[shared.body, { marginBottom: 24 }]}>{editing === 'bedtime' ? 'When should Trundle rest for the night?' : 'When should your morning walk begin counting?'}</Text>
    <TimePicker minutes={draft} onChange={setDraft} disabled={saving} />
    <Text style={[shared.caption, { marginTop: 16 }]}>Changes apply when you tap Save time.</Text>
    {invalid && <Text accessibilityRole="alert" style={[shared.caption, { marginVertical: 16 }]}>Bedtime and morning must differ, and the night must leave room for your naps.</Text>}
    {!!error && <Text accessibilityRole="alert" style={[shared.caption, { marginVertical: 16 }]}>{error}</Text>}
    <View style={{ marginTop: 24 }}><Button title={saving ? 'Saving…' : 'Save time'} disabled={saving || invalid} onPress={async () => { if (editing && await savePreferences({ [editing]: draft })) setEditing(null); }} /></View>
  </DetailSheet></>;
}
const createStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  schedule: { paddingVertical: 12 },
  scheduleLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  overline: { ...shared.eyebrow, color: ui.colors.accentText, flex: 1 },
  preview: { ...shared.eyebrow, fontSize: ui.type.micro },
  times: { flexDirection: 'row', gap: 12, marginTop: 28 },
  timeButton: { flex: 1, gap: 8 },
  time: { fontFamily: ui.fonts.display, fontWeight: '700', fontSize: 34, letterSpacing: -1.2, color: ui.colors.text, fontVariant: ['tabular-nums'] },
  period: { fontSize: 12, letterSpacing: 0, color: ui.colors.textSoft },
  editHint: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  editText: { ...shared.caption, fontSize: ui.type.caption },
  nightTrack: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28 },
  trackStart: { width: 8, height: 8, borderRadius: 4, backgroundColor: ui.colors.accent },
  trackLine: { flex: 1, height: 2, backgroundColor: ui.colors.accent, opacity: 0.3 },
  restText: { ...shared.caption, marginTop: 20, fontSize: 13 },
}); };
