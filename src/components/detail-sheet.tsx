import { BottomSheet, Host } from '@expo/ui';
import { type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Icon } from './icon';
import { useSharedStyles } from './app-ui';

export function DetailSheet({ visible, onClose, title, children, closeLabel = 'Close details' }: { visible: boolean; onClose: () => void; title: string; children: ReactNode; closeLabel?: string }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const nativeHeight = Math.min(640, height - insets.top - insets.bottom - 48);
  return <Host colorScheme={ui.dark ? 'dark' : 'light'}><BottomSheet isPresented={visible} onDismiss={onClose} containerColor={ui.colors.sheet} contentPadding={0} snapPoints={Platform.OS === 'ios' ? [{ height: nativeHeight + 24 }] : undefined}>
    <View accessibilityViewIsModal style={{ ...(Platform.OS === 'ios' ? { height: nativeHeight } : { maxHeight: height * 0.8 }), width: Math.min(width, ui.layout.maxWidth), maxWidth: ui.layout.maxWidth, alignSelf: 'center', padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}><Text accessibilityRole="header" style={[shared.rowTitle, { flex: 1, fontSize: ui.type.heading }]}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: ui.colors.track, opacity: pressed ? 0.6 : 1, alignItems: 'center', justifyContent: 'center' })}><Icon name="x" size={20} color={ui.colors.textSoft} /></Pressable></View>
      <ScrollView style={Platform.OS === 'ios' ? { flex: 1 } : undefined} contentContainerStyle={{ paddingBottom: 8 }} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </View>
  </BottomSheet></Host>;
}
