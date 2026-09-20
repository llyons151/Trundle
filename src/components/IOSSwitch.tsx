import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '../theme';

export function IOSSwitch({ value, onValueChange, label }: {
  value: boolean; onValueChange: (value: boolean) => void; label: string;
}) {
  const { colors } = useTheme();
  if (Platform.OS === 'ios') return <View style={styles.target}>
    <Switch value={value} onValueChange={onValueChange} style={styles.nativeSwitch}
      accessibilityLabel={label} trackColor={{ false: colors.track, true: colors.accent }} />
  </View>;
  return <Pressable accessibilityRole="switch" accessibilityLabel={label}
    aria-checked={value} accessibilityState={{ checked: value }} onPress={() => onValueChange(!value)}
    style={styles.target}>
    <View style={[styles.track, { backgroundColor: value ? colors.accent : colors.track }]}>
      <View style={[styles.thumb, { transform: [{ translateX: value ? 20 : 0 }] }]} />
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  target: { minHeight: 44, width: 51, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nativeSwitch: { width: 51, height: 31 },
  track: { width: 51, height: 31, borderRadius: 16, padding: 2 },
  thumb: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#FFF', boxShadow: '0 2px 4px rgba(0,0,0,0.22)' },
});
