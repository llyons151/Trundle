import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../../components/AppIcon';
import { Icon } from '../../../components/icon';
import { useSharedStyles } from '../../../components/app-ui';
import { APPS } from '../../../state/apps';
import { useThemedStyles, type Theme, useTheme } from '../../../theme';
import { useState } from 'react';
import { TextAction, useOnboardingSizing } from './onboarding-layout';

export function AppChoices({ selected, always = [], onChange, disabled, list }: { selected: string[]; always?: string[]; onChange: (ids: string[]) => void; disabled: boolean; list: 'bedtime' | 'always blocked' }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { compact, small, fontScale } = useOnboardingSizing();
  const pageSize = fontScale > 1.4 ? 1 : small ? 2 : compact ? 3 : 4;
  const [requestedPage, setPage] = useState(0);
  const pages = Math.ceil(APPS.length / pageSize);
  const page = Math.min(requestedPage, pages - 1);
  return <View><View>{APPS.slice(page * pageSize, (page + 1) * pageSize).map(app => {
    const checked = selected.includes(app.id);
    return <Pressable key={app.id} accessibilityRole="checkbox" accessibilityLabel={`${app.name}, ${list} list`} aria-checked={checked} accessibilityState={{ checked, disabled }} disabled={disabled}
      onPress={() => onChange(checked ? selected.filter(id => id !== app.id) : [...selected, app.id])}
      style={({ pressed }) => [styles.row, compact && { minHeight: 54, paddingVertical: ui.space.xs }, { backgroundColor: pressed ? ui.colors.track : 'transparent' }]}>
      <AppIcon id={app.id} size={36} />
      <View style={{ flex: 1, gap: ui.space.xs }}><Text style={shared.rowTitle}>{app.name}</Text>{always.includes(app.id) && <Text style={[shared.caption, { fontSize: ui.type.note }]}>Always-blocked priority</Text>}</View>
      <View style={[styles.check, checked && styles.checked]}>{checked && <Icon name="check" size={16} color={ui.colors.onAccent} />}</View>
    </Pressable>;
  })}</View><View style={styles.pager}><TextAction label="Previous" disabled={disabled || page === 0} onPress={() => setPage(page - 1)} /><Text accessibilityLiveRegion="polite" style={shared.caption}>{page + 1} / {pages}</Text><TextAction label="More apps" disabled={disabled || page === pages - 1} onPress={() => setPage(page + 1)} /></View></View>;
}
const createStyles = (ui: Theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: ui.space.md, minHeight: 64, paddingVertical: ui.space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.colors.border },
  check: { width: 26, height: 26, borderRadius: ui.radius.pill, borderWidth: 1, borderColor: ui.colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: ui.colors.accentStrong, borderColor: ui.colors.accentStrong },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ui.space.sm },
});
