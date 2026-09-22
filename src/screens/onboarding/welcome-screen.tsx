import { Text, View } from 'react-native';
import { RockPlatform } from '../../components/RockPlatform';
import { useSharedStyles } from '../../components/app-ui';
import { useTheme } from '../../theme';
import { useOnboardingStyles, useOnboardingSizing } from './components/onboarding-layout';

export function WelcomeScreen() {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useOnboardingStyles();
  const { width, height, compact } = useOnboardingSizing();
  return <>
    <View style={[styles.illustration, { flex: 1, justifyContent: 'center', minHeight: 0 }]}><RockPlatform size={Math.min(width - ui.space.xxl * 2, compact ? height * 0.3 : 300)} sleeping /></View>
    <View style={[styles.inset, compact && { padding: ui.space.sm }]}><Text style={shared.caption}>Meet Trundle. This preview saves your routine, but doesn’t block apps or count steps yet.</Text></View>
  </>;
}
