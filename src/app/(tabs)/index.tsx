import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PlaceholderScreen } from '@/components/placeholder-screen';
import { Nocturne } from '@/constants/nocturne';

export default function HomeScreen() {
  return (
    <PlaceholderScreen title="Home" description="Is Trundle asleep or awake, what's blocked, and what happens next.">
      <Link href="/onboarding" asChild>
        <Pressable style={styles.button} accessibilityRole="button">
          <Text style={styles.label}>Preview onboarding</Text>
        </Pressable>
      </Link>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 26,
    backgroundColor: Nocturne.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: Nocturne.onCta, fontSize: 16, fontWeight: '600' },
});
