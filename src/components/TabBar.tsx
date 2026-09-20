import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
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

type FeatherName = keyof typeof Feather.glyphMap;

export type TabKey = 'home' | 'apps' | 'trail' | 'you';

// The lock sits in the middle slot. It's an action, not a tab, so it never gets the
// selected capsule.
const SLOTS: ({ key: TabKey; icon: FeatherName; label: string } | 'lock')[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'apps', icon: 'grid', label: 'Apps' },
  'lock',
  { key: 'trail', icon: 'map', label: 'Trail' },
  { key: 'you', icon: 'user', label: 'You' },
];

export const TAB_BAR_HEIGHT = 62;

const PADDING = 6;
const MAX_SLOT_WIDTH = 62;
const SIDE_MARGIN = 16;

// Native Liquid Glass requires iOS 26 and a compatible build.
const hasLiquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

function Glass({ width, children }: { width: number; children: ReactNode }) {
  const { colors, dark } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.pill, { width }]}>
      {/* Keep the glass behind the controls so a tap doesn't deform the whole bar. */}
      {hasLiquidGlass ? (
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
  onLockPress: () => void;
};

export function TabBar({ active, onSelect, onLockPress }: Props) {
  const { colors, dark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const slotWidth = Math.min(
    MAX_SLOT_WIDTH,
    (screenWidth - SIDE_MARGIN * 2 - PADDING * 2) / SLOTS.length,
  );
  const width = slotWidth * SLOTS.length + PADDING * 2;

  const activeIndex = SLOTS.findIndex((slot) => slot !== 'lock' && slot.key === active);
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
      <Glass width={width}>
        <Animated.View
          pointerEvents="none"
          style={[styles.capsule, { width: slotWidth }, capsuleStyle]}
        >
          {hasLiquidGlass ? (
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
            if (slot === 'lock') {
              return (
                <Pressable
                  key="lock"
                  onPress={() => {
                    // Haptics can be unavailable (web, Low Power Mode); never worth surfacing.
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    onLockPress();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Lock my apps"
                  style={({ pressed }) => [
                    styles.slot,
                    { width: slotWidth },
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather name="lock" size={24} color={colors.accent} />
                </Pressable>
              );
            }
            const selected = slot.key === active;
            return (
              <Pressable
                key={slot.key}
                onPress={() => {
                  if (!selected) Haptics.selectionAsync().catch(() => {});
                  onSelect(slot.key);
                }}
                accessibilityRole="tab"
                accessibilityLabel={slot.label}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.slot,
                  { width: slotWidth },
                  pressed && styles.pressed,
                ]}
              >
                {slot.key === 'home' ? <TrundleMark color={selected ? colors.text : colors.textSoft} /> : <Feather
                  name={slot.icon}
                  size={23}
                  color={selected ? colors.text : colors.textSoft}
                />}
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
