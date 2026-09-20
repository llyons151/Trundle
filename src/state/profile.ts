import { useSyncExternalStore } from 'react';

export type UserProfile = {
  displayName: string;
  photoURL?: string | null;
};

// Populate from the account provider on sign-in/profile updates; clear on sign-out.
// Account authentication has not been connected in this preview yet.
let currentProfile: UserProfile | null = null;
const listeners = new Set<() => void>();

export function setCurrentProfile(profile: UserProfile | null) {
  currentProfile = profile ? { ...profile } : null;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useProfile() {
  return useSyncExternalStore(subscribe, () => currentProfile, () => null);
}
