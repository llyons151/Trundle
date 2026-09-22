import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

// Gradients fade into the page instead of enclosing the artwork in a hard disc.
export function SceneBackdrop() {
  const { colors } = useTheme();
  const id = `scene-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 320 270" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={`${id}-haze`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.23" />
            <Stop offset="0.55" stopColor={colors.accentStrong} stopOpacity="0.10" />
            <Stop offset="1" stopColor={colors.bg} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}-light`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.text} stopOpacity="0.06" />
            <Stop offset="1" stopColor={colors.text} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}-shadow`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.bg} stopOpacity="0.15" />
            <Stop offset="0.45" stopColor={colors.bg} stopOpacity="0.07" />
            <Stop offset="1" stopColor={colors.bg} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="160" cy="142" rx="156" ry="115" fill={`url(#${id}-haze)`} />
        <Ellipse cx="143" cy="94" rx="112" ry="88" fill={`url(#${id}-light)`} />
        <Ellipse cx="160" cy="249" rx="84" ry="11" fill={`url(#${id}-shadow)`} />
      </Svg>
    </View>
  );
}
