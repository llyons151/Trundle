import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedStyles } from '../../components/app-ui';
import { Icon, type IconName } from '../../components/icon';
import { APPS } from '../../state/apps';
import { formatTime } from '../../state/preferences';
import { type OnboardingStep, type SetupDraft } from '../../state/onboarding-model';
import { useThemedStyles, type Theme, useTheme } from '../../theme';
import { useOnboardingSizing } from './components/onboarding-layout';

export function ReadyScreen({ draft, onEdit, disabled, validation }: { draft: SetupDraft; onEdit: (step: OnboardingStep) => void; disabled: boolean; validation: string }) {
  const shared = useSharedStyles();
  const names = (ids: string[]) => ids.length ? `${ids.length} selected · ${ids.map(id => APPS.find(app => app.id === id)?.name ?? id).join(', ')}` : 'None · choose later';
  return <>
    <View>
      <ReviewRow icon="moon" label="Bedtime" value={`${formatTime(draft.bedtime)}, every day`} onEdit={() => onEdit('schedule')} disabled={disabled} />
      <ReviewRow icon="sun" label="Morning starts" value={`${formatTime(draft.morning)} · 200 steps`} onEdit={() => onEdit('morning-time')} disabled={disabled} />
      <ReviewRow icon="grid" label="Bedtime apps" value={names(draft.scheduled)} onEdit={() => onEdit('apps')} disabled={disabled} />
      <ReviewRow icon="shield" label="Always-blocked apps" value={names(draft.always)} onEdit={() => onEdit('always')} disabled={disabled} />
    </View>
    <Text accessibilityRole={validation ? 'alert' : undefined} style={shared.caption}>{validation ? 'Edit your times to resolve a schedule conflict.' : 'Saves your plan. App blocking and real step counting aren’t connected.'}</Text>
  </>;
}

function ReviewRow({ icon, label, value, onEdit, disabled }: { icon: IconName; label: string; value: string; onEdit: () => void; disabled: boolean }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { compact } = useOnboardingSizing();
  return <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${label.toLowerCase()}. ${value}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onEdit} style={({ pressed }) => [styles.row, compact && { paddingVertical: ui.space.xs, minHeight: 52 }, pressed && { opacity: 0.6 }]}>
    <Icon name={icon} color={ui.colors.accentText} size={22} /><View style={styles.text}><Text style={[shared.caption, compact && { fontSize: ui.type.note, lineHeight: 18 }]}>{label}</Text><Text numberOfLines={1} style={[shared.rowTitle, compact && { fontSize: ui.type.caption }]}>{value}</Text></View><Icon name="edit" color={ui.colors.accentText} size={18} />
  </Pressable>;
}
const createStyles = (ui: Theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: ui.space.md, paddingVertical: ui.space.md, minHeight: 80, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.colors.border },
  text: { flex: 1, gap: ui.space.xs },
});
