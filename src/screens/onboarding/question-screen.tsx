import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedStyles } from '../../components/app-ui';
import { Icon, type IconName } from '../../components/icon';
import type { SetupAnswers } from '../../state/onboarding-model';
import { useThemedStyles, type Theme, useTheme } from '../../theme';
import { TextAction, useOnboardingSizing } from './components/onboarding-layout';
import { goalLabels, habitLabels, ritualLabels } from './personalization';

const questions = {
  goal: [{ value: 'rest', label: goalLabels.rest, icon: 'moon' }, { value: 'morning', label: goalLabels.morning, icon: 'sun' }, { value: 'present', label: goalLabels.present, icon: 'heart' }],
  habit: [{ value: 'bedtime', label: habitLabels.bedtime, icon: 'moon' }, { value: 'morning', label: habitLabels.morning, icon: 'sun' }, { value: 'both', label: habitLabels.both, icon: 'clock' }],
  ritual: [{ value: 'read', label: ritualLabels.read, icon: 'heart' }, { value: 'stretch', label: ritualLabels.stretch, icon: 'activity' }, { value: 'quiet', label: ritualLabels.quiet, icon: 'moon' }],
} as const;

export function QuestionScreen({ field, answers, onChange, disabled }: { field: keyof SetupAnswers; answers: SetupAnswers; onChange: (patch: SetupAnswers) => void; disabled: boolean }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { small } = useOnboardingSizing();
  return <View style={{ gap: small ? ui.space.sm : ui.space.md }}>
    {questions[field].map(option => {
      const selected = answers[field] === option.value;
      return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected, disabled }} aria-checked={selected} disabled={disabled}
        onPress={() => onChange({ [field]: option.value })}
        style={({ pressed }) => [styles.choice, small && { padding: ui.space.sm, minHeight: 52 }, selected && styles.selected, pressed && { opacity: 0.65 }]}>
        <Icon name={option.icon as IconName} color={ui.colors.accentText} /><Text style={[shared.rowTitle, { flex: 1 }]}>{option.label}</Text>
        <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <Icon name="check" size={16} color={ui.colors.onAccent} />}</View>
      </Pressable>;
    })}
    <TextAction label="I’m not sure yet" onPress={() => onChange({ [field]: undefined })} disabled={disabled} />
  </View>;
}
const createStyles = (ui: Theme) => StyleSheet.create({
  choice: { minHeight: 72, padding: ui.space.md, gap: ui.space.md, flexDirection: 'row', alignItems: 'center', borderRadius: ui.radius.control, borderCurve: 'continuous', borderWidth: 1, borderColor: ui.colors.border, backgroundColor: ui.colors.surface },
  selected: { borderColor: ui.colors.accentStrong, backgroundColor: ui.colors.accentSoft },
  radio: { width: 26, height: 26, borderRadius: ui.radius.pill, borderWidth: 1, borderColor: ui.colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { backgroundColor: ui.colors.accentStrong, borderColor: ui.colors.accentStrong },
});
