import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { createOnboardingStore } from './onboarding-model';

export const onboarding = createOnboardingStore(AsyncStorage);
export const useOnboarding = () => useSyncExternalStore(onboarding.subscribe, onboarding.getSnapshot, onboarding.getSnapshot);
