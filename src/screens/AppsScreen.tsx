import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '../components/TabBar';
import { APPS, APP_FEATURES, getAppRule, saveAppRule, setSelectedApps, useAppRules, useSelectedApps, type AppId } from '../state/apps';
import { AppIcon } from '../components/AppIcon';
import { IOSSwitch } from '../components/IOSSwitch';
import { useTheme, useThemedStyles, type Theme } from '../theme';

export function AppsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const selected = useSelectedApps();
  const rules = useAppRules();
  const [expanded, setExpanded] = useState<AppId | null>(null);
  const [query, setQuery] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);
  const visible = APPS.filter(app =>
    (!onlySelected || selected.includes(app.id)) &&
    `${app.name} ${app.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[styles.content, {
        paddingTop: insets.top + 24,
        paddingBottom: Math.max(insets.bottom, 16) + TAB_BAR_HEIGHT + 24,
      }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>A LITTLE LESS SCROLLING</Text>
      <Text style={styles.title}>Your apps.</Text>
      <Text style={styles.subtitle}>Choose what to put aside. Make room for your day.</Text>

      <View style={styles.summary}>
        <View style={styles.summaryTop}>
          <View style={styles.shield}><Feather name="shield" size={24} color={colors.accent} /></View>
          <View style={styles.grow}>
            <Text style={styles.summaryTitle} accessibilityLiveRegion="polite">
              {selected.length} {selected.length === 1 ? 'app' : 'apps'} selected
            </Text>
            <Text style={styles.caption}>Your block list, your call.</Text>
          </View>
          <Text style={styles.badge}>PREVIEW</Text>
        </View>
        <Text style={styles.preview}>Try your block list with example apps. Device blocking isn’t connected yet.</Text>
      </View>

      <View style={styles.search}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Find an app"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search apps"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.input}
        />
        {query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}>
          <Feather name="x" size={18} color={colors.textSoft} />
        </Pressable>}
      </View>

      <View style={styles.filters} accessibilityRole="tablist">
        {[false, true].map(value => (
          <Pressable
            key={String(value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: onlySelected === value }}
            onPress={() => setOnlySelected(value)}
            style={[styles.filter, onlySelected === value && styles.filterActive]}
          >
            <Text style={[styles.filterText, onlySelected === value && styles.filterTextActive]}>
              {value ? `Selected (${selected.length})` : 'All apps'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.eyebrow}>{onlySelected ? 'YOUR BLOCK LIST' : 'EXAMPLE APPS'}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => setSelectedApps(APPS.map(app => app.id))} style={styles.action}>
            <Text style={styles.actionText}>Select all</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={selected.length === 0} onPress={() => setSelectedApps([])} style={[styles.action, selected.length === 0 && styles.disabled]}>
            <Text style={styles.actionText}>Clear all</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.listHint}>Tap an app to customize what you block.</Text>
      <View style={styles.appList}>
      {visible.map((app, index) => {
        const enabled = selected.includes(app.id);
        const rule = getAppRule(rules, app.id);
        const options = APP_FEATURES[app.id];
        const checkedFeatures = rule.mode === 'whole' ? options.map(feature => feature.id) : rule.features;
        const isExpanded = expanded === app.id;
        const summary = checkedFeatures.length === options.length ? 'Whole app' : checkedFeatures.length === 0 ? 'Nothing blocked' : options.filter(feature => checkedFeatures.includes(feature.id)).map(feature => feature.title).join(' · ');
        const updateFeature = (featureId: string) => {
          const next = checkedFeatures.includes(featureId) ? checkedFeatures.filter(id => id !== featureId) : [...checkedFeatures, featureId];
          saveAppRule(app.id, { mode: next.length === options.length ? 'whole' : 'custom', features: next });
          if (next.length === 0) setSelectedApps(selected.filter(id => id !== app.id));
          else if (!enabled) setSelectedApps([...selected, app.id]);
        };
        return (
          <View key={app.id} style={index > 0 && styles.rowDivider}>
          <View style={styles.appRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Customize ${app.name} blocking`}
              aria-expanded={isExpanded} accessibilityState={{ expanded: isExpanded }}
              onPress={() => setExpanded(isExpanded ? null : app.id)} style={({ pressed }) => [styles.appDetails, pressed && { opacity: 0.65 }]}>
              <AppIcon id={app.id} />
              <View style={styles.grow}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text numberOfLines={1} style={[styles.caption, enabled && styles.enabledCaption]}>{summary}</Text>
              </View>
              <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
            </Pressable>
            <IOSSwitch value={enabled}
              onValueChange={value => {
                if (value && checkedFeatures.length === 0) saveAppRule(app.id, { mode: 'whole', features: options.map(feature => feature.id) });
                setSelectedApps(value ? [...selected, app.id] : selected.filter(id => id !== app.id));
              }}
              label={`Select ${app.name} for blocking`} />
          </View>
          {isExpanded && <View style={styles.dropdown}>
            <Text style={styles.dropdownHint}>Uncheck anything you want to keep available.</Text>
            {options.map(feature => {
              const checked = checkedFeatures.includes(feature.id);
              return <Pressable key={feature.id} accessibilityRole="checkbox"
                accessibilityLabel={`Block ${app.name} ${feature.title}`} aria-checked={checked}
                accessibilityState={{ checked }} onPress={() => updateFeature(feature.id)}
                style={({ pressed }) => [styles.featureRow, pressed && { opacity: 0.65 }]}>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Feather name="check" size={15} color={colors.onAccent} />}
                </View>
                <Text style={styles.featureName}>{feature.title}</Text>
                <Text style={styles.featureStatus}>{checked ? 'Block' : 'Keep'}</Text>
              </Pressable>;
            })}
          </View>}
          </View>
        );
      })}
      </View>
      {visible.length === 0 && <View style={styles.empty}>
        <Feather name={query.trim() ? 'search' : 'grid'} size={28} color={colors.textMuted} />
        <Text style={styles.appName}>{query.trim() ? 'No matching apps' : 'A little space starts here.'}</Text>
        <Text style={styles.emptyText}>{query.trim() ? 'Try another app name or category.' : 'Choose apps from All apps to build your block list.'}</Text>
      </View>}
      <Text style={styles.footer}>You can change your selection anytime.</Text>
    </ScrollView>
    </>
  );
}

const createStyles = ({ colors, fonts }: Theme) => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, width: '100%', maxWidth: 600, alignSelf: 'center' },
  eyebrow: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1.5, color: colors.textMuted },
  title: { fontFamily: fonts.display, fontSize: 52, color: colors.text, marginTop: 10 },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.textSoft, marginTop: 6, maxWidth: 310 },
  summary: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, marginVertical: 26, borderWidth: 1, borderColor: colors.border },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  shield: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1 },
  summaryTitle: { fontFamily: fonts.medium, fontSize: 18, color: colors.text },
  caption: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 4 },
  badge: { fontFamily: fonts.medium, fontSize: 9, letterSpacing: 1, color: colors.textSoft },
  preview: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textSoft, marginTop: 16 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder },
  input: { flex: 1, minWidth: 0, height: 48, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  clear: { padding: 14 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 18, marginBottom: 16 },
  filter: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24 },
  filterActive: { backgroundColor: colors.glassSelected },
  filterText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  filterTextActive: { color: colors.text },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  actions: { flexDirection: 'row', gap: 14 },
  action: { minHeight: 44, justifyContent: 'center' },
  actionText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSoft },
  disabled: { opacity: 0.35 },
  listHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  appList: { backgroundColor: colors.surface, borderRadius: 22, borderCurve: 'continuous', paddingHorizontal: 16 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 84 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.glassBorder },
  appDetails: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  dropdown: { paddingBottom: 16, paddingTop: 2 },
  dropdownHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingHorizontal: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  featureName: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  featureStatus: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  enabledCaption: { color: colors.accentText },
  appName: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textSoft, textAlign: 'center' },
  footer: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
