import { Feather } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';

const symbols = {
  'trending-up': 'arrow.up.right', 'trending-down': 'arrow.down.right', 'arrow-up-right': 'arrow.up.right', sliders: 'slider.horizontal.3',
  home: 'house', grid: 'square.grid.2x2', moon: 'moon', sun: 'sun.max', user: 'person.crop.circle',
  clock: 'clock', shield: 'shield.lefthalf.filled', lock: 'lock', check: 'checkmark',
  'arrow-right': 'arrow.right', 'chevron-right': 'chevron.right', 'chevron-down': 'chevron.down',
  info: 'info.circle', search: 'magnifyingglass', x: 'xmark', settings: 'slider.horizontal.3',
  heart: 'heart', activity: 'figure.walk', edit: 'pencil', smartphone: 'iphone',
} as const;
export type IconName = keyof typeof symbols;
export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  return Platform.OS === 'ios' ? <SymbolView accessible={false} aria-hidden name={symbols[name]} tintColor={color} size={size} weight="regular" /> : <Feather accessible={false} aria-hidden name={name} size={size} color={color} />;
}
