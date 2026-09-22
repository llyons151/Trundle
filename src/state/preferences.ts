import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { napFits, type Nap } from './routine';

export type Preferences = { displayName: string; bedtime: number; morning: number; scheduled: string[]; always: string[]; naps: Nap[]; napUntil: number | null };
const defaults: Preferences = { displayName: '', bedtime: 22 * 60, morning: 7 * 60, scheduled: [], always: [], naps: [], napUntil: null };
const KEY = 'trundle.preferences.v1';
let snapshot = { values: defaults, ready: false, saving: false, loadFailed: false, error: '' };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const validTime = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 1440;
export async function loadPreferences() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const data = parsed && typeof parsed === 'object' ? parsed : {};
    const naps: Nap[] = [];
    const bedtime = validTime(data.bedtime) ? data.bedtime : defaults.bedtime;
    const morning = validTime(data.morning) && data.morning !== bedtime ? data.morning : (bedtime + 540) % 1440;
    for (const nap of Array.isArray(data.naps) ? data.naps : []) {
      if (nap && typeof nap.id === 'string' && !naps.some(item => item.id === nap.id) && validTime(nap.start) && validTime(nap.end) && napFits(nap, { bedtime, morning, naps })) naps.push({ id: nap.id, start: nap.start, end: nap.end });
    }
    const legacy = !raw ? JSON.parse(await AsyncStorage.getItem('trundle.selected-apps.v1') ?? '[]') : [];
    const list = (value: unknown): string[] => Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))] : [];
    snapshot = { values: { displayName: typeof data.displayName === 'string' ? data.displayName.slice(0, 40) : '', bedtime, morning, naps, napUntil: typeof data.napUntil === 'number' && Number.isFinite(data.napUntil) ? data.napUntil : null, scheduled: list(data.scheduled ?? legacy), always: list(data.always) }, ready: true, saving: false, loadFailed: false, error: '' };
  } catch { snapshot = { ...snapshot, ready: true, loadFailed: true, error: 'Couldn’t load your preferences. Try again before making changes.' }; }
  emit();
}
export async function savePreferences(patch: Partial<Preferences>) {
  if (snapshot.saving) return false;
  const values = { ...snapshot.values, ...patch };
  if (values.bedtime === values.morning || values.naps.some(nap => !napFits(nap, values))) {
    snapshot = { ...snapshot, error: 'Choose non-overlapping naps outside bedtime.' }; emit(); return false;
  }
  snapshot = { ...snapshot, saving: true, error: '' }; emit();
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(values));
    snapshot = { values, ready: true, saving: false, loadFailed: false, error: '' }; emit(); return true;
  } catch {
    snapshot = { ...snapshot, saving: false, error: 'Couldn’t save. Your previous settings are safe. Please try again.' }; emit(); return false;
  }
}
export const usePreferences = () => useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
export function formatTime(minutes: number) {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}
