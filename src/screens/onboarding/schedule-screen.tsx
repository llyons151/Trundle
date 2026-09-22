import { createSharedStyles } from '../../components/app-ui';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TimePicker } from '../../components/time-picker';
import { Icon } from '../../components/icon';
import { Button, useSharedStyles } from '../../components/app-ui';
import { formatTime } from '../../state/preferences';
import { type SetupDraft } from '../../state/onboarding-model';
import { useThemedStyles, type Theme, useTheme } from '../../theme';
import { OnboardingPanel } from './components/onboarding-panel';
import { TextAction, useOnboardingSizing } from './components/onboarding-layout';

export function ScheduleScreen({ field, draft, onChange, disabled, validation }: { field: 'bedtime' | 'morning'; draft: SetupDraft; onChange: (patch: Partial<SetupDraft>) => void; disabled: boolean; validation: string }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const [editing, setEditing] = useState<'bedtime' | 'morning' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { compact } = useOnboardingSizing();
  const minutes = (draft.morning - draft.bedtime + 1440) % 1440;
  return <>
    <View>
      {[field].map(key => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Edit ${key === 'bedtime' ? 'bedtime' : 'morning start'}, ${formatTime(draft[key])}`} accessibilityState={{ disabled }} disabled={disabled} onPress={() => setEditing(key)} style={({ pressed }) => [styles.timeRow, compact && { paddingVertical: ui.space.sm }, pressed && { opacity: 0.6 }]}>
        <Icon name={key === 'bedtime' ? 'moon' : 'sun'} color={ui.colors.accentText} size={24} />
        <View style={styles.timeText}><Text style={shared.caption}>{key === 'bedtime' ? 'Bedtime' : 'Morning starts'}</Text><Text style={[styles.time, compact && { fontSize: ui.type.heading, lineHeight: 28 }]}>{formatTime(draft[key])}</Text></View>
        <Icon name="edit" color={ui.colors.accentText} size={20} />
      </Pressable>)}
    </View>
    <Text accessibilityRole={validation ? 'alert' : undefined} style={shared.caption}>{validation || `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''} set aside, every day. Your morning walk starts counting at ${formatTime(draft.morning)}.`}</Text>
    <TextAction label="How do these times work?" onPress={() => setShowHelp(true)} />
    <OnboardingPanel visible={editing !== null} title={editing === 'bedtime' ? 'Choose bedtime' : 'Choose morning start'} onClose={() => setEditing(null)}>
      {editing && <TimePicker minutes={draft[editing]} onChange={time => onChange({ [editing]: time })} disabled={disabled} />}
      <Button title="Done" onPress={() => setEditing(null)} />
    </OnboardingPanel>
    <OnboardingPanel visible={showHelp} title="A rhythm that fits your day" onClose={() => setShowHelp(false)}>
      <Text style={shared.body}>Bedtime begins the overnight block. Morning starts step counting; it isn’t an alarm or an automatic unlock.</Text>
      <Text style={shared.body}>In the full routine, bedtime apps stay blocked until your 200-step walk is complete. You can change both times anytime.</Text>
      <Button title="Got it" onPress={() => setShowHelp(false)} />
    </OnboardingPanel>
  </>;
}

const createStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: ui.space.md, paddingVertical: ui.space.lg, minHeight: 72, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: ui.colors.border },
  timeText: { flex: 1, gap: ui.space.xs },
  time: { ...shared.title, fontVariant: ['tabular-nums'] },
}); };
