import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Nocturne } from '@/constants/nocturne';
import { NightSky } from '@/features/onboarding/night-sky';

/** The app sits under the same sky and moon as onboarding, with the moon settled. */
export function AppBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.container}>
      <NightSky />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Nocturne.bg },
});
