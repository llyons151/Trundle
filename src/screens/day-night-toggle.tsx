import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CelestialIcon } from '../components/celestial-icon';
import { useAccessibilityMotion } from '../state/use-accessibility';
import { APPEARANCE_DURATION, finishAppearanceTransition, setNightMode, useTheme } from '../theme';

export function DayNightToggle({ active }: { active: boolean }) {
  const ui = useTheme();
  const { reduceMotion, isAppActive } = useAccessibilityMotion();
  const progress = useSharedValue(1);
  const [skyWidth, setSkyWidth] = useState(390);

  useEffect(() => {
    if (reduceMotion || !active || !isAppActive || !ui.transitioning) {
      progress.value = 1;
      finishAppearanceTransition();
    } else {
      progress.value = 0;
      // The live accessibility hook above also handles preference changes mid-flight.
      progress.value = withTiming(1, { duration: APPEARANCE_DURATION, easing: Easing.linear, reduceMotion: ReduceMotion.Never });
    }
    return () => cancelAnimation(progress);
  }, [ui.dark, ui.transitioning, reduceMotion, active, isAppActive, progress]);

  const dark = ui.dark;
  const sunStyle = useAnimatedStyle(() => orbitStyle(progress.value, !dark, skyWidth));
  const moonStyle = useAnimatedStyle(() => orbitStyle(progress.value, dark, skyWidth));

  return <>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.sky} onLayout={event => setSkyWidth(event.nativeEvent.layout.width)}>
      <Animated.View testID="day-sun" style={[styles.orb, sunStyle]}><CelestialIcon kind="sun" size={56} /></Animated.View>
      <Animated.View testID="night-moon" style={[styles.orb, moonStyle]}><CelestialIcon kind="moon" size={56} /></Animated.View>
    </View>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ui.dark ? 'Switch to day mode' : 'Switch to night mode'}
      accessibilityHint="Changes the app’s appearance. Your routine stays the same."
      accessibilityState={{ disabled: ui.transitioning, busy: ui.transitioning }}
      disabled={ui.transitioning}
      onPress={() => setNightMode(!ui.dark, !reduceMotion && active && isAppActive)}
      style={({ pressed }) => [styles.toggle, { backgroundColor: ui.colors.accentSoft, opacity: pressed ? 0.65 : 1 }]}
    >
      <CelestialIcon kind={ui.dark ? 'moon' : 'sun'} size={22} />
      <Text maxFontSizeMultiplier={1.5} style={{ fontFamily: ui.fonts.medium, fontSize: ui.type.note, fontWeight: '600', color: ui.colors.text }}>{ui.dark ? 'Night' : 'Day'}</Text>
    </Pressable>
  </>;
}

// Keep the shared-value read directly in the animated-style worklets so web
// subscribes to progress without depending on React renders to move the orbit.
function orbitStyle(progress: number, incoming: boolean, skyWidth: number) {
  'worklet';
  const phase = Math.max(0, Math.min(1, incoming ? (progress - 0.55) / 0.45 : progress / 0.45));
  // Give the exit weight and the entrance momentum instead of using the same
  // slow ease-in/ease-out for both halves of the orbit.
  const eased = incoming ? 1 - Math.pow(1 - phase, 2) : phase * phase;
  const angle = incoming ? -3.5 + eased * 1.45 : -2.05 + eased * 2.4;
  return {
    opacity: incoming ? Math.min(1, phase / 0.15) : Math.min(1, (1 - phase) / 0.15),
    transform: [
      { translateX: skyWidth / 2 + (skyWidth / 2 + 60) * Math.cos(angle) },
      { translateY: 150 + 125 * Math.sin(angle) },
      { rotate: `${incoming ? -8 * (1 - phase) : 12 * phase}deg` },
    ],
  };
}

const styles = StyleSheet.create({
  sky: { position: 'absolute', top: -16, left: -24, right: -24, height: 210, overflow: 'hidden' },
  orb: { position: 'absolute', top: -28, left: -28, width: 56, height: 56 },
  toggle: { position: 'absolute', right: 0, top: 0, minHeight: 44, paddingHorizontal: 12, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
