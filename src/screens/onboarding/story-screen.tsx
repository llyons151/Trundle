import { Text, View } from 'react-native';
import { RockPlatform } from '../../components/RockPlatform';
import { useSharedStyles } from '../../components/app-ui';
import { Icon, type IconName } from '../../components/icon';
import { useTheme } from '../../theme';
import { useOnboardingStyles, useOnboardingSizing } from './components/onboarding-layout';

export function StoryScreen({ body, detail, sleeping = false, icon = 'heart' }: { body: string; detail: string; sleeping?: boolean; icon?: IconName }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const onboardingStyles = useOnboardingStyles();
  const { width, height, small, compact } = useOnboardingSizing();
  return <>
    <View style={{ flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' }}>
      <RockPlatform sleeping={sleeping} size={Math.min(width - ui.space.xxl * 2, height * (small ? 0.19 : compact ? 0.25 : 0.29))} />
    </View>
    <Text style={compact ? shared.caption : shared.body}>{body}</Text>
    <View style={[onboardingStyles.inset, { flexDirection: 'row', alignItems: 'center' }, small && { padding: ui.space.sm }]}>
      <Icon name={icon} color={ui.colors.accentText} size={20} /><Text style={[shared.caption, { flex: 1 }]}>{detail}</Text>
    </View>
  </>;
}
