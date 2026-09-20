import { useMemo } from 'react';

// Shared Ink palette and Nunito typography for every screen.
const theme = {
  fonts: {
    display: 'Nunito_700Bold', regular: 'Nunito_400Regular',
    medium: 'Nunito_500Medium', semibold: 'Nunito_700Bold',
  },
  id: 'ink', name: 'Ink', dark: false,
  colors: {
    bg: '#F4F3EF', surface: '#FFFFFF', accent: '#4C5260', text: '#222630',
    textSoft: '#56535B', textMuted: '#68646D', line: '#19131C26',
    border: '#19131C20', accentSoft: '#4C526018', accentText: '#4C5260',
    track: '#19131C16', onAccent: '#FFFFFF', glassFallback: '#FFFFFFED',
    glassBorder: '#19131C24', glassSelected: '#19131C0E',
  },
};
export type Theme = typeof theme;

export function useTheme() {
  return theme;
}
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  return useMemo(() => factory(theme), [factory]);
}

// Illustration colors belong to the artwork, independently of the UI palette.
export const colors = {
  planetSea: '#173F4A', planetSeaLit: '#1B4B57', planetLand: '#7E9E36',
  planetLandLit: '#9BB841', planetLandShade: '#698432',
};
export const radius = { pill: 999 };
