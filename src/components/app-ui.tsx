import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles, type Theme } from '../theme';
import { Icon, type IconName } from './icon';

export function Screen({ children }: { children: ReactNode }) {
  const ui = useTheme();
  const insets = useSafeAreaInsets();
  return <ScrollView automaticallyAdjustKeyboardInsets style={{ flex: 1, backgroundColor: ui.colors.bg }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={{ width: '100%', maxWidth: ui.layout.maxWidth, alignSelf: 'center', paddingHorizontal: ui.space.lg, paddingTop: insets.top + ui.space.lg, paddingBottom: Math.max(insets.bottom, 16) + 110 }}>{children}</ScrollView>;
}
export function Heading({ title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const ui = useTheme();
  const shared = useThemedStyles(createSharedStyles);
  return <View style={{ gap: ui.space.sm, marginBottom: ui.space.xl }}><Text accessibilityRole="header" style={shared.title}>{title}</Text><Text style={shared.body}>{subtitle}</Text></View>;
}
export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const shared = useThemedStyles(createSharedStyles);
  return <View style={shared.sectionHeading}><Text accessibilityRole="header" aria-level={2} style={shared.sectionTitle}>{children}</Text>{right}</View>;
}
export function Surface({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const shared = useThemedStyles(createSharedStyles);
  return <View style={[shared.surface, style]}>{children}</View>;
}
export function Button({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  const ui = useTheme();
  const shared = useThemedStyles(createSharedStyles);
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={() => onPress?.()} style={({ pressed }) => [shared.button, secondary && shared.secondaryButton, { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }]}><Text style={[shared.buttonText, secondary && { color: ui.colors.text }]}>{title}</Text></Pressable>;
}
export function PreviewNotice({ children }: { children: ReactNode }) {
  const ui = useTheme();
  const shared = useThemedStyles(createSharedStyles);
  return <View style={shared.notice}><Icon name="info" size={15} color={ui.colors.textMuted} /><Text style={shared.note}>{children}</Text></View>;
}
export function Row({ icon, title, detail, onPress, last = false }: { icon: IconName; title: string; detail?: string; onPress?: () => void; last?: boolean }) {
  const shared = useThemedStyles(createSharedStyles);
  const { colors } = useTheme();
  const content = <><View style={shared.rowIcon}><Icon name={icon} size={20} color={colors.accent} /></View><View style={{ flex: 1, gap: 4 }}><Text style={shared.rowTitle}>{title}</Text>{detail && <Text style={shared.caption}>{detail}</Text>}</View>{onPress && <Icon name="chevron-right" size={17} color={colors.textMuted} />}</>;
  return onPress ? <Pressable accessibilityRole="button" onPress={() => onPress?.()} style={({ pressed }) => [shared.row, !last && shared.divider, pressed && { backgroundColor: colors.track }]}>{content}</Pressable> : <View style={[shared.row, !last && shared.divider]}>{content}</View>;
}
export const createSharedStyles = (ui: Theme) => StyleSheet.create({
  title: { fontFamily: ui.fonts.display, fontWeight: '700', fontSize: ui.type.title, lineHeight: 44, letterSpacing: -1.2, color: ui.colors.text },
  eyebrow: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: ui.type.micro, letterSpacing: 1.1, color: ui.colors.textMuted },
  body: { fontFamily: ui.fonts.regular, fontSize: ui.type.body, lineHeight: 25, color: ui.colors.textSoft },
  caption: { fontFamily: ui.fonts.regular, fontSize: ui.type.caption, lineHeight: 22, color: ui.colors.textMuted },
  note: { flex: 1, fontFamily: ui.fonts.regular, fontSize: ui.type.note, lineHeight: 20, color: ui.colors.textMuted },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: ui.space.xl, marginBottom: ui.space.sm },
  surface: { backgroundColor: 'transparent' },
  sectionTitle: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: 20, letterSpacing: -0.4, color: ui.colors.text },
  button: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 14, borderRadius: ui.radius.pill, borderCurve: 'continuous', backgroundColor: ui.colors.accentStrong, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: ui.type.body, color: ui.colors.onAccent },
  secondaryButton: { backgroundColor: ui.colors.accentSoft },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: ui.space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18, minHeight: 72 },
  rowIcon: { width: 24, height: 28, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: ui.fonts.semibold, fontWeight: '600', fontSize: ui.type.body, color: ui.colors.text },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.colors.border },
});

export const useSharedStyles = () => useThemedStyles(createSharedStyles);
