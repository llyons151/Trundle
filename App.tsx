import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TabBar, type TabKey } from './src/components/TabBar';
import { AppsScreen } from './src/screens/AppsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RoutineScreen } from './src/screens/RoutineScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { loadPreferences, usePreferences } from './src/state/preferences';
import { Button, useSharedStyles } from './src/components/app-ui';
import { TrundleWordmark } from './src/components/Brand';
import { loadAppearance, useTheme } from './src/theme';
import { onboarding, useOnboarding } from './src/state/onboarding';
import { OnboardingFlow } from './src/screens/onboarding/onboarding-flow';

export default function App() {
  const shared = useSharedStyles();
  const { colors, dark } = useTheme();
  const preferences = usePreferences();
  const setup = useOnboarding();
  useEffect(() => { void loadPreferences(); void loadAppearance(); }, []);
  useEffect(() => {
    if (preferences.ready && !preferences.loadFailed) void onboarding.load(preferences.values);
  }, [preferences.ready, preferences.loadFailed, preferences.values]);
  const [appList, setAppList] = useState<'scheduled' | 'always'>('scheduled');
  const openApps = (list: 'scheduled' | 'always' = 'scheduled') => { setAppList(list); setTab('apps'); };
  const [tab, setTab] = useState<TabKey>('home');
  useEffect(() => {
    // Finishing or deferring setup should land on the dashboard, including replay.
    if (setup.record?.status === 'in-progress') setTab('home');
  }, [setup.record?.status]);

  if (!preferences.ready || (!preferences.loadFailed && !setup.ready)) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}><TrundleWordmark color={colors.accent} /></View>;
  }

  if (preferences.loadFailed) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 32, gap: 24 }}><Text accessibilityRole="alert" style={shared.body}>{preferences.error}</Text><Button title="Try again" onPress={() => { void loadPreferences(); }} /></View>;

  if (!setup.record) return <SafeAreaProvider><View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 32, gap: 24 }}><Text accessibilityRole="alert" style={shared.body}>{setup.error}</Text><Button title="Retry loading setup" disabled={setup.busy} onPress={() => { void onboarding.load(preferences.values); }} /><Button title="Start setup again" secondary disabled={setup.busy} onPress={() => { void onboarding.restart(preferences.values); }} /></View></SafeAreaProvider>;

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? "light" : "dark"} />
      {setup.record.status === 'in-progress' ? <OnboardingFlow /> :
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>
        <View style={{ flex: 1, display: tab === 'home' ? 'flex' : 'none' }} accessibilityElementsHidden={tab !== 'home'} importantForAccessibility={tab === 'home' ? 'auto' : 'no-hide-descendants'}><HomeScreen active={tab === 'home'} onManageApps={openApps} onOpenProfile={() => setTab('you')} onRoutine={() => setTab('routine')} /></View>
        <View style={{ flex: 1, display: tab === 'apps' ? 'flex' : 'none' }} accessibilityElementsHidden={tab !== 'apps'} importantForAccessibility={tab === 'apps' ? 'auto' : 'no-hide-descendants'}><AppsScreen list={appList} onListChange={setAppList} /></View>
        <View style={{ flex: 1, display: tab === 'routine' ? 'flex' : 'none' }} accessibilityElementsHidden={tab !== 'routine'} importantForAccessibility={tab === 'routine' ? 'auto' : 'no-hide-descendants'}><RoutineScreen onManageApps={openApps} /></View>
        <View style={{ flex: 1, display: tab === 'you' ? 'flex' : 'none' }} accessibilityElementsHidden={tab !== 'you'} importantForAccessibility={tab === 'you' ? 'auto' : 'no-hide-descendants'}><ProfileScreen onRoutine={() => setTab('routine')} onApps={() => openApps('scheduled')} /></View>
        <TabBar active={tab} onSelect={setTab} />
      </View>}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
