import { useFonts } from 'expo-font';
import { themeFontAssets } from './src/themeFonts';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TabBar, type TabKey } from './src/components/TabBar';
import { AppsScreen } from './src/screens/AppsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { useTheme } from './src/theme';

const PLACEHOLDER_TITLES: Record<Exclude<TabKey, 'home' | 'apps'>, string> = {
  trail: 'Trail',
  you: 'You',
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(themeFontAssets);
  const { colors, dark } = useTheme();
  const [tab, setTab] = useState<TabKey>('home');

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>
        {tab === 'home' ? <HomeScreen onManageApps={() => setTab('apps')} onOpenProfile={() => setTab('you')} /> : tab === 'apps' ? <AppsScreen /> : <PlaceholderScreen title={PLACEHOLDER_TITLES[tab]} />}
        {/* The lock button will start the blocking flow once that exists. */}
        <TabBar active={tab} onSelect={setTab} onLockPress={() => {}} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
