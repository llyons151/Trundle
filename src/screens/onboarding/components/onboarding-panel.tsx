import { BottomSheet, Host } from '@expo/ui';
import { type ReactNode } from 'react';
import { Platform, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../../components/icon';
import { useSharedStyles } from '../../../components/app-ui';
import { useTheme } from '../../../theme';

// Optional details use a native sheet, with a bounded body and no scrolling.
export function OnboardingPanel({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const panelHeight = Math.min(520, height - insets.top - insets.bottom - 48);
  if (!visible) return null;
  return <Host colorScheme={ui.dark ? 'dark' : 'light'}><BottomSheet isPresented={visible} onDismiss={onClose} containerColor={ui.colors.sheet} contentPadding={0} snapPoints={Platform.OS === 'ios' ? [{ height: panelHeight + 24 }] : undefined}>
    <View accessibilityViewIsModal style={{ ...(Platform.OS === 'ios' ? { minHeight: panelHeight } : {}), width: Math.min(width, ui.layout.maxWidth), maxWidth: ui.layout.maxWidth, alignSelf: 'center', maxHeight: height - insets.top - ui.space.md, padding: ui.space.lg, paddingBottom: Math.max(insets.bottom, ui.space.lg), gap: ui.space.md }}>
      <View style={{ flexDirection: 'row', gap: ui.space.md, alignItems: 'center' }}><Text accessibilityRole="header" style={[shared.sectionTitle, { flex: 1 }]}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Close ${title.toLowerCase()}`} onPress={onClose} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="x" color={ui.colors.text} /></Pressable></View>
      {children}
    </View>
  </BottomSheet></Host>;
}
