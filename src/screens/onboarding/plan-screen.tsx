import { Text, View } from 'react-native';
import { useSharedStyles } from '../../components/app-ui';
import { Icon } from '../../components/icon';
import type { OnboardingStep, SetupAnswers, SetupDraft } from '../../state/onboarding-model';
import { formatTime } from '../../state/preferences';
import { useTheme } from '../../theme';
import { TextAction, useOnboardingStyles, useOnboardingSizing } from './components/onboarding-layout';
import { goalLabels, ritualCue } from './personalization';

export function PlanScreen({ answers, draft, onEdit, disabled }: { answers: SetupAnswers; draft: SetupDraft; onEdit: (step: OnboardingStep) => void; disabled: boolean }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const onboardingStyles = useOnboardingStyles();
  const { compact, small } = useOnboardingSizing();
  return <>
    <View style={[onboardingStyles.inset, small && { padding: ui.space.sm }]}>
      <Text style={shared.eyebrow}>{answers.goal ? goalLabels[answers.goal] : 'A little space for you'}</Text>
      <Text style={compact ? shared.caption : shared.body}>{ritualCue(answers)}</Text>
    </View>
    <View style={{ gap: ui.space.sm }}>
      <View style={{ flexDirection: 'row', gap: ui.space.sm, alignItems: 'center' }}><Icon name="moon" color={ui.colors.accentText} /><Text style={[shared.caption, { flex: 1 }]}>{formatTime(draft.bedtime)} · {draft.scheduled.length === 0 ? 'Choose bedtime apps later.' : `${draft.scheduled.length} bedtime ${draft.scheduled.length === 1 ? 'app rests' : 'apps rest'}.`}</Text></View>
      <View style={{ flexDirection: 'row', gap: ui.space.sm, alignItems: 'center' }}><Icon name="sun" color={ui.colors.accentText} /><Text style={[shared.caption, { flex: 1 }]}>From {formatTime(draft.morning)} · walk 200 steps to wake him.</Text></View>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: ui.space.sm }}><TextAction label="Edit goal" onPress={() => onEdit('goal')} disabled={disabled} /><TextAction label="Edit ritual" onPress={() => onEdit('ritual')} disabled={disabled} /></View>
  </>;
}
