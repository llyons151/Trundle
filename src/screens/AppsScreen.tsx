import { createSharedStyles } from '../components/app-ui';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { APPS } from '../state/apps';
import { usePreferences, savePreferences } from '../state/preferences';
import { AppIcon } from '../components/AppIcon';
import { Screen, Heading, SectionLabel, Surface, PreviewNotice, useSharedStyles } from '../components/app-ui';
import { Icon } from '../components/icon';
import { useThemedStyles, type Theme, useTheme } from '../theme';

export function AppsScreen({ list, onListChange: setList }: { list: 'scheduled' | 'always'; onListChange: (list: 'scheduled' | 'always') => void }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { values, saving, error } = usePreferences();
  const [query, setQuery] = useState('');
  const selected = values[list];
  const visible = APPS.filter(app => `${app.name} ${app.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (id: string) => { void savePreferences({ [list]: selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id] }); };
  return <Screen>
    <Heading eyebrow="MAKE A LITTLE SPACE" title="Apps" subtitle="A little less distraction." />
    <View style={{ paddingVertical: 6 }}><SegmentedControl values={['Bedtime', 'Always blocked']} selectedIndex={list === 'scheduled' ? 0 : 1} onChange={event => setList(event.nativeEvent.selectedSegmentIndex === 0 ? 'scheduled' : 'always')} appearance="light" style={{ minHeight: 36 }} /></View>
    <View style={styles.listIntro}><Text style={styles.introTitle}>{list === 'scheduled' ? 'Rest when he rests.' : 'Out of the everyday.'}</Text><Text style={shared.caption}>{list === 'scheduled' ? 'These apps will rest during bedtime and naps. Naps end automatically; mornings begin with your walk.' : 'These apps will stay blocked, even when Trundle is awake. Edit this list anytime.'}</Text></View>
    <View style={styles.search}><Icon name="search" size={18} color={ui.colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search apps" placeholderTextColor={ui.colors.textMuted} accessibilityLabel="Search apps" autoCorrect={false} autoCapitalize="none" style={styles.input} />{query !== '' && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={({ pressed }) => [styles.clear, { opacity: pressed ? 0.6 : 1 }]}><Icon name="x" size={18} color={ui.colors.textSoft} /></Pressable>}</View>
    <SectionLabel right={<Text accessibilityLiveRegion="polite" style={styles.count}>{selected.length} selected</Text>}>Choose apps</SectionLabel>
    <Surface>{visible.map((app, index) => {
      const checked = selected.includes(app.id);
      return <Pressable key={app.id} accessibilityRole="checkbox" accessibilityLabel={`${app.name}, ${list === 'scheduled' ? 'bedtime list' : 'always blocked list'}`} aria-checked={checked} accessibilityState={{ checked, disabled: saving }} disabled={saving} onPress={() => toggle(app.id)} style={({ pressed }) => [styles.appRow, index > 0 && styles.divider, pressed && { backgroundColor: ui.colors.track }]}>
        <AppIcon id={app.id} /><View style={{ flex: 1, gap: 3 }}><Text style={styles.appName}>{app.name}</Text><Text style={shared.caption}>{list === 'scheduled' && values.always.includes(app.id) ? 'Always-blocked list takes priority' : app.category}</Text></View><View style={[styles.check, checked && styles.checked]}>{checked && <Icon name="check" size={16} color={ui.colors.onAccent} />}</View>
      </Pressable>;
    })}</Surface>
    {!visible.length && <View style={styles.empty}><Icon name="search" size={28} color={ui.colors.textMuted} /><Text style={styles.introTitle}>No apps found</Text><Text style={shared.caption}>Try an app name or category.</Text></View>}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <PreviewNotice>Selections save on this device. This is an example catalog; native app blocking isn’t connected yet.</PreviewNotice>
  </Screen>;
}
const createStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  segments: { flexDirection: 'row', padding: 4, borderRadius: ui.radius.control, backgroundColor: ui.colors.surface, gap: 4 },
  segment: { flex: 1, minHeight: 46, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 12, flexWrap: 'wrap' },
  segmentActive: { backgroundColor: ui.colors.accentSoft },
  segmentText: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: ui.type.caption, color: ui.colors.textMuted },
  listIntro: { gap: 6, paddingVertical: 24 },
  introTitle: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: 20, color: ui.colors.text, letterSpacing: -0.4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, backgroundColor: ui.colors.track, borderRadius: 12 },
  input: { minHeight: 50, flex: 1, minWidth: 0, color: ui.colors.text, fontFamily: ui.fonts.regular, fontSize: 15 },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: ui.fonts.medium, fontWeight: '500', fontSize: ui.type.caption, color: ui.colors.accentText },
  appRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: ui.colors.border },
  appName: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: 16, color: ui.colors.text },
  check: { width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: ui.colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: ui.colors.accentStrong, borderColor: ui.colors.accentStrong },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  error: { ...shared.note, marginTop: 16, color: ui.colors.text },
}); };
