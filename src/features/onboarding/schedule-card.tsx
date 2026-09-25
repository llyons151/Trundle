import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Nocturne } from '@/constants/nocturne';

import { AppTile } from './app-icons';
import { formatClock } from './estimate';
import { Reveal } from './motion';
import { NUMBER_FONT } from './rolling-number';

const MAX_ICONS = 5;

/**
 * Tonight's lock as one finished object: lights out on the left, the alarm on the
 * right, the 200-step walk between them, and the apps that sleep underneath.
 */
export function ScheduleCard({
  bedtime,
  wake,
  apps,
  compact,
  onChange,
}: {
  bedtime: number;
  wake: number;
  apps: string[];
  compact: boolean;
  onChange: (what: 'bedtime' | 'wake' | 'apps') => void;
}) {
  const shown = apps.slice(0, MAX_ICONS);
  const extra = apps.length - shown.length;
  const iconSize = compact ? 34 : 40;

  return (
    <Reveal style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.times}>
        <Time label="Lights out" minutes={bedtime} compact={compact} onChange={() => onChange('bedtime')} />
        <Time label="Alarm" minutes={wake} compact={compact} onChange={() => onChange('wake')} alignEnd />
      </View>

      <View style={styles.walk} accessible accessibilityLabel="Then 200 steps wake your apps">
        <WalkGlyph name={{ ios: 'moon.zzz.fill', android: 'bedtime', web: 'bedtime' }} />
        <View style={styles.dashes}>
          {Array.from({ length: 40 }, (_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <Text style={styles.walkLabel}>200 steps</Text>
        <View style={styles.dashes}>
          {Array.from({ length: 40 }, (_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <WalkGlyph name={{ ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' }} />
      </View>

      <View style={styles.divider} />

      <View style={styles.appsRow}>
        <View style={styles.icons} accessible accessibilityLabel={`Asleep: ${apps.join(', ')}`}>
          {shown.map((app) => (
            <AppTile key={app} name={app} size={iconSize} />
          ))}
          {extra > 0 ? (
            <View style={[styles.more, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.225 }]}>
              <Text style={styles.moreLabel}>+{extra}</Text>
            </View>
          ) : null}
        </View>
        <ChangeLink label="Change apps" onPress={() => onChange('apps')} />
      </View>
      <Text style={styles.appsCaption}>
        {apps.length === 1 ? '1 app sleeps.' : `${apps.length} apps sleep.`} Calls and texts don’t.
      </Text>
    </Reveal>
  );
}

function Time({
  label,
  minutes,
  compact,
  onChange,
  alignEnd,
}: {
  label: string;
  minutes: number;
  compact: boolean;
  onChange: () => void;
  alignEnd?: boolean;
}) {
  const [clock, suffix] = formatClock(minutes).split(' ');
  return (
    <View style={[styles.time, alignEnd && styles.timeEnd]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text
        style={[styles.clock, compact && styles.clockCompact]}
        maxFontSizeMultiplier={1.2}
        accessibilityLabel={`${label}, ${clock} ${suffix}`}
      >
        {clock}
        <Text style={styles.suffix}> {suffix}</Text>
      </Text>
      <ChangeLink label={`Change ${label.toLowerCase()}`} text="Change" onPress={onChange} />
    </View>
  );
}

function ChangeLink({ label, text = 'Change', onPress }: { label: string; text?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={10}>
      <Text style={styles.change}>{text}</Text>
    </Pressable>
  );
}

function WalkGlyph({ name }: { name: SymbolViewProps['name'] }) {
  return <SymbolView name={name} size={18} tintColor={Nocturne.text} />;
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: Nocturne.surface,
    borderWidth: 1,
    borderColor: Nocturne.edge,
    padding: 20,
  },
  cardCompact: { marginTop: 16, marginBottom: 14, padding: 16 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { gap: 4 },
  timeEnd: { alignItems: 'flex-end' },
  label: { color: Nocturne.text2, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  clock: { ...NUMBER_FONT, color: Nocturne.text, fontSize: 40, lineHeight: 46, fontVariant: ['tabular-nums'] },
  clockCompact: { fontSize: 34, lineHeight: 40 },
  suffix: { color: Nocturne.text2, fontSize: 16, fontWeight: '600' },
  change: { color: Nocturne.text2, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  walk: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  // Evenly spaced dashes, clipped to whatever width the row leaves.
  dashes: { flex: 1, flexDirection: 'row', gap: 4, overflow: 'hidden' },
  dash: { width: 4, flexShrink: 0, height: 2, borderRadius: 1, backgroundColor: Nocturne.text2 },
  walkLabel: { color: Nocturne.text, fontSize: 13, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Nocturne.edge, marginVertical: 18 },
  appsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  icons: { flexDirection: 'row', gap: 8, flexShrink: 1 },
  more: { backgroundColor: Nocturne.raised, alignItems: 'center', justifyContent: 'center' },
  moreLabel: { color: Nocturne.text, fontSize: 14, fontWeight: '700' },
  appsCaption: { color: Nocturne.text2, fontSize: 14, lineHeight: 19, marginTop: 10 },
});
