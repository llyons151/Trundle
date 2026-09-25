import { useLocalSearchParams } from 'expo-router';

import { OnboardingFlow } from '@/features/onboarding/onboarding-flow';

export default function OnboardingScreen() {
  // `?step=<id>` jumps straight to a screen while reviewing the draft.
  const { step } = useLocalSearchParams<{ step?: string }>();
  return <OnboardingFlow initialStep={step} />;
}
