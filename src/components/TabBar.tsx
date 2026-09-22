import { Icon } from './icon';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, type Theme } from '../theme';
import { TrundleMark } from './Brand';

export type TabKey = 'home' | 'apps' | 'routine' | 'you';

// Four destinations, with visible labels and generous touch targets.
const SLOTS: { key: TabKey; icon: 'home' | 'grid' | 'clock' | 'user'; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'apps', icon: 'grid', label: 'Apps' },
  { key: 'routine', icon: 'clock', label: 'Routine' },
  { key: 'you', icon: 'user', label: 'You' },
];

export const TAB_BAR_HEIGHT = 72;

const PADDING = 6;
const MAX_SLOT_WIDTH = 84;
const SIDE_MARGIN = 16;

// Native Liquid Glass requires iOS 26 and a compatible build.
const hasLiquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

function Glass({ width, children, opaque }: { width: number; children: ReactNode; opaque: boolean }) {
  const { colors, dark } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.pill, { width }]}>
      {/* Keep the glass behind the controls so a tap doesn't deform the whole bar. */}
      {opaque ? <View style={[StyleSheet.absoluteFill, styles.glassSurface, { backgroundColor: colors.surface }]} /> : hasLiquidGlass ? (
        <GlassView
          pointerEvents="none"
          glassEffectStyle="clear"
          colorScheme={dark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, styles.glassSurface]}
        />
      ) : (
        <BlurView
          pointerEvents="none"
          intensity={40}
          tint={dark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, styles.glassSurface, styles.pillFallback]}
        />
      )}
      {children}
    </View>
  );
}

type Props = {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
};

export function TabBar({ active, onSelect }: Props) {
  const { colors, dark, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [opaque, setOpaque] = useState(true);
  useEffect(() => {
    // React Native Web does not implement this native accessibility API.
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled !== 'function') return;
    let live = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', value => { changed = true; setOpaque(value); });
    AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (live && !changed) setOpaque(value); }).catch(() => {});
    return () => { live = false; subscription.remove(); };
  }, []);
  const { width: screenWidth } = useWindowDimensions();
  const slotWidth = Math.min(
    MAX_SLOT_WIDTH,
    (screenWidth - SIDE_MARGIN * 2 - PADDING * 2) / SLOTS.length,
  );
  const width = slotWidth * SLOTS.length + PADDING * 2;

  const activeIndex = SLOTS.findIndex((slot) => slot.key === active);
  const capsuleX = useSharedValue(activeIndex * slotWidth);

  useEffect(() => {
    // Timing retargets from the current position without spring momentum or overshoot.
    capsuleX.value = withTiming(activeIndex * slotWidth, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [activeIndex, slotWidth, capsuleX]);

  const capsuleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: capsuleX.value }],
  }));

  return (
    <View
      style={[styles.container, { bottom: Math.max(insets.bottom, 16) }]}
      pointerEvents="box-none"
    >
      <Glass width={width} opaque={opaque}>
        <Animated.View
          pointerEvents="none"
          style={[styles.capsule, { width: slotWidth }, capsuleStyle]}
        >
          {hasLiquidGlass && !opaque ? (
            <GlassView
              glassEffectStyle="regular"
              colorScheme={dark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, styles.capsuleSurface]}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, styles.capsuleSurface, styles.capsuleFallback]}
            />
          )}
        </Animated.View>
        <View style={styles.row} accessibilityRole="tablist">
          {SLOTS.map((slot) => {
            const selected = slot.key === active;
            return (
              <Pressable
                key={slot.key}
                onPress={() => {
                  if (!selected) Haptics.selectionAsync().catch(() => {});
                  onSelect(slot.key);
                }}
                accessibilityRole="tab"
                accessibilityShowsLargeContentViewer
                accessibilityLargeContentTitle={slot.label}
                accessibilityLabel={slot.label}
                aria-selected={selected}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.slot,
                  { width: slotWidth },
                  pressed && styles.pressed,
                ]}
              >
                {slot.key === 'home' ? <TrundleMark color={selected ? colors.text : colors.textSoft} /> : <Icon
                  name={slot.icon}
                  size={21}
                  color={selected ? colors.text : colors.textSoft}
                />}
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.medium, fontWeight: '500', fontSize: 12, color: selected ? colors.text : colors.textMuted, marginTop: 4 }}>{slot.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </View>
  );
}

const createStyles = ({ colors, fonts }: Theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    height: TAB_BAR_HEIGHT,
    padding: PADDING,
  },
  glassSurface: {
    borderRadius: TAB_BAR_HEIGHT / 2,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
  pillFallback: {
    overflow: 'hidden',
    backgroundColor: colors.glassFallback,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  capsule: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    bottom: PADDING,
  },
  capsuleSurface: {
    borderRadius: (TAB_BAR_HEIGHT - PADDING * 2) / 2,
  },
  capsuleFallback: {
    backgroundColor: colors.glassSelected,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
