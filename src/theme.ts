import { useMemo, useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { beginAppearanceTransition } from './state/appearance-transition';

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' })!;

// Palette supplied by the user; translucent layers derive from these five colors.
const palette = {
  sage: '#A8CBA0', moss: '#6B8E23', stone: '#B0B3B8',
  charcoal: '#4B4E54', frost: '#F0F4F8',
};
const theme = {
  fonts: {
    display: systemFont, regular: systemFont,
    medium: systemFont, semibold: systemFont,
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  type: { micro: 12, note: 13, caption: 15, body: 17, heading: 22, titleSmall: 28, title: 34, hero: 48 },
  radius: { control: 16, card: 24, sheet: 32, pill: 999 },
  layout: { maxWidth: 480 },
  id: 'moss', name: 'Moss & Stone', dark: false, transitioning: false,
  colors: {
    bg: palette.frost, surfaceRaised: '#FFFFFF', sheet: palette.frost,
    surface: '#FFFFFF', accent: palette.moss, accentStrong: '#526F1B',
    text: palette.charcoal, textSoft: '#5C6168', textMuted: '#666C73',
    line: `${palette.charcoal}26`, border: `${palette.charcoal}20`,
    accentSoft: `${palette.sage}40`, accentText: '#526F1B',
    controlBorder: '#7C8389', track: `${palette.stone}38`, onAccent: '#FFFFFF',
    glassFallback: `${palette.frost}F2`, glassBorder: `${palette.charcoal}24`,
    glassSelected: `${palette.sage}40`,
  },
};
export type Theme = typeof theme;
const nightTheme: Theme = {
  ...theme, dark: true,
  colors: {
    bg: '#171D20', surfaceRaised: '#303A3E', sheet: '#242E32',
    surface: '#242E32', accent: '#A8CBA0', accentStrong: '#A8CBA0',
    text: '#EEF2EE', textSoft: '#CDD5D1', textMuted: '#A6B3B0',
    line: '#CDD5D130', border: '#CDD5D126',
    accentSoft: '#A8CBA01F', accentText: '#B8D5AA',
    controlBorder: '#889992', track: '#B0B3B826', onAccent: '#17220F',
    glassFallback: '#242E32F2', glassBorder: '#CDD5D130', glassSelected: '#A8CBA026',
  },
};
const APPEARANCE_KEY = 'trundle.appearance.v1';
export const APPEARANCE_DURATION = 2400;
let currentTheme = theme;
let animationFrame: number | undefined;
let transitionTimer: ReturnType<typeof setTimeout> | undefined;
let endWebTransition: (() => void) | undefined;
let appearanceChanged = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function applyNightMode(night: boolean, animate = false) {
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
  if (transitionTimer !== undefined) clearTimeout(transitionTimer);
  endWebTransition?.();
  endWebTransition = undefined;
  animationFrame = undefined;
  transitionTimer = undefined;
  const destination = night ? nightTheme : theme;
  if (Platform.OS === 'web') {
    // Publish only the start and end states. CSS interpolates the rendered
    // colors without rebuilding every screen and StyleSheet on every frame.
    if (animate) endWebTransition = beginAppearanceTransition(APPEARANCE_DURATION);
    currentTheme = animate ? { ...destination, transitioning: true } : destination;
    listeners.forEach(listener => listener());
    if (animate) transitionTimer = setTimeout(() => {
      endWebTransition?.();
      endWebTransition = undefined;
      transitionTimer = undefined;
      currentTheme = destination;
      listeners.forEach(listener => listener());
    }, APPEARANCE_DURATION);
    return;
  }
  const source = currentTheme.colors;
  const startedAt = performance.now();
  Appearance.setColorScheme(night ? 'dark' : 'light');
  const update = (now: number) => {
    const progress = animate ? Math.min(1, (now - startedAt) / APPEARANCE_DURATION) : 1;
    // Ease the whole palette together while the two celestial bodies take turns.
    const blend = progress * progress * (3 - 2 * progress);
    currentTheme = progress === 1 ? destination : {
      ...destination,
      transitioning: true,
      colors: Object.fromEntries(Object.entries(source).map(([key, value]) => [
        key, blendColor(value, destination.colors[key as keyof Theme['colors']], blend),
      ])) as Theme['colors'],
    };
    listeners.forEach(listener => listener());
    animationFrame = progress < 1 ? requestAnimationFrame(update) : undefined;
  };
  update(startedAt);
}
function blendColor(from: string, to: string, progress: number) {
  const channels = (hex: string) => [1, 3, 5, 7].map((offset) =>
    offset === 7 && hex.length === 7 ? 255 : parseInt(hex.slice(offset, offset + 2), 16));
  const start = channels(from);
  return `#${channels(to).map((end, index) => Math.round(start[index] + (end - start[index]) * progress).toString(16).padStart(2, '0')).join('')}`;
}
export function finishAppearanceTransition() {
  if (currentTheme.transitioning) applyNightMode(currentTheme.dark);
}
export async function loadAppearance() {
  try {
    const saved = await AsyncStorage.getItem(APPEARANCE_KEY);
    if (!appearanceChanged) applyNightMode(saved === 'night');
  } catch { /* Keep the daytime default if local storage is unavailable. */ }
}
let pendingSave = Promise.resolve();
export function setNightMode(night: boolean, animate = true) {
  if (currentTheme.transitioning || currentTheme.dark === night) return;
  appearanceChanged = true;
  applyNightMode(night, animate);
  // Serialize rapid taps so the last selection is the one restored next launch.
  pendingSave = pendingSave.then(() => AsyncStorage.setItem(APPEARANCE_KEY, night ? 'night' : 'day')).catch(() => {});
}

export function useTheme() {
  return useSyncExternalStore(subscribe, () => currentTheme, () => theme);
}
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const current = useTheme();
  return useMemo(() => factory(current), [factory, current]);
}

// Illustration colors belong to the artwork, independently of the UI palette.
export const colors = {
  planetSea: '#173F4A', planetSeaLit: '#1B4B57', planetLand: '#7E9E36',
  planetLandLit: '#9BB841', planetLandShade: '#698432',
};
export const radius = { pill: 999 };
