import { createSharedStyles } from '../../../components/app-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, useSharedStyles } from '../../../components/app-ui';
import { TrundleWordmark } from '../../../components/Brand';
import { ONBOARDING_STEPS, type OnboardingStep } from '../../../state/onboarding-model';
import { useThemedStyles, type Theme, useTheme } from '../../../theme';
import { OnboardingPanel } from './onboarding-panel';

type Props = {
  step: OnboardingStep; title: string; description: string; children: ReactNode;
  action: string; onContinue: () => void; onBack?: () => void; onExplore: () => void;
  busy: boolean; disabled?: boolean; error: string; saving: boolean; onRetry: () => void;
};

export function OnboardingLayout({ step, title, description, children, action, onContinue, onBack, onExplore, busy, disabled, error, saving, onRetry }: Props) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const heading = useRef<Text>(null);
  const index = ONBOARDING_STEPS.indexOf(step);
  const chapter = index < 4 ? 'Your rhythm' : index < 8 ? 'Night & morning' : index < 11 ? 'Your boundaries' : 'Your plan';
  const { compact, small } = useOnboardingSizing();
  const [showError, setShowError] = useState(false);
  useEffect(() => { setShowError(!!error); }, [error]);
  useEffect(() => {
    if (Platform.OS === 'web') heading.current?.focus();
    else AccessibilityInfo.announceForAccessibility(`Step ${index + 1} of ${ONBOARDING_STEPS.length}. ${title}`);
  }, [step, index, title]);

  return <View style={styles.screen}><View
    style={[styles.page, { paddingHorizontal: compact ? ui.space.md : ui.space.lg, paddingTop: insets.top + ui.space.sm, paddingBottom: Math.max(insets.bottom, ui.space.md) }]}
    testID={`onboarding-${step}`}>
    <View style={styles.navigation}>
      {onBack ? <TextAction label="Back" onPress={onBack} disabled={busy} /> : <TrundleWordmark width={100} color={ui.colors.text} />}
      <TextAction label="Explore first" onPress={onExplore} disabled={busy} />
    </View>
    <View style={[styles.progressGroup, compact && { paddingTop: ui.space.xs, paddingBottom: ui.space.md, gap: ui.space.xs }]}>
      <View style={styles.progressLabel}><Text style={shared.caption}>Step {index + 1} of {ONBOARDING_STEPS.length}</Text><Text style={styles.preview}>{chapter}</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel="Setup steps completed" accessibilityValue={{ min: 0, max: ONBOARDING_STEPS.length, now: index, text: `${index} of ${ONBOARDING_STEPS.length} steps completed` }} style={styles.progress}>
        {ONBOARDING_STEPS.map((item, i) => <View key={item} style={[styles.segment, i < index && styles.segmentDone, i === index && styles.segmentCurrent]} />)}
      </View>
    </View>
    <View style={[styles.intro, compact && { marginBottom: ui.space.sm, gap: ui.space.xs }]}>
      <Text ref={heading} accessibilityRole="header" {...(Platform.OS === 'web' ? { tabIndex: -1 } : {})} style={[shared.title, compact && { fontSize: small ? ui.type.heading : ui.type.titleSmall, lineHeight: small ? 28 : 36, letterSpacing: -0.5 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}>{title}</Text>
      <Text style={compact ? shared.caption : shared.body}>{description}</Text>
    </View>
    <View style={[styles.content, { gap: compact ? ui.space.sm : ui.space.md }]}>{children}</View>
    <View style={[styles.footer, compact && { paddingTop: ui.space.sm }]}>
      <Button title={busy ? 'Saving…' : action} disabled={busy || disabled} onPress={onContinue} />
      <Text style={styles.footnote}>{error ? 'Not saved. Try your action again.' : saving ? 'Saving your draft…' : 'On this device. Editable anytime.'}</Text>
    </View>
    <OnboardingPanel visible={showError && !!error} title="Let’s keep your choices safe" onClose={() => setShowError(false)}>
      <Text selectable accessibilityRole="alert" style={shared.body}>{error}</Text><Button title="Retry saving" onPress={onRetry} disabled={busy || saving} />
    </OnboardingPanel>
  </View></View>;
}

export function useOnboardingSizing() {
  const { height, width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usableHeight = height - insets.top - insets.bottom;
  return { compact: usableHeight < 800 || fontScale > 1.2, small: usableHeight < 640 || fontScale > 1.4, height: usableHeight, width, fontScale };
}

export function TextAction({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  const styles = useThemedStyles(createStyles);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.textAction, { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }]}><Text style={styles.link}>{label}</Text></Pressable>;
}

export const createOnboardingStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  stack: { gap: ui.space.md },
  paragraph: { ...shared.caption },
  label: { ...shared.rowTitle },
  inset: { padding: ui.space.md, borderRadius: ui.radius.control, backgroundColor: ui.colors.accentSoft, gap: ui.space.sm },
  illustration: { alignItems: 'center', paddingVertical: ui.space.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: ui.colors.border },
}); };

const createStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.colors.bg },
  page: { flex: 1, minHeight: 0, width: '100%', maxWidth: ui.layout.maxWidth, alignSelf: 'center' },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, gap: ui.space.md },
  textAction: { minHeight: 44, justifyContent: 'center', paddingVertical: ui.space.sm },
  link: { fontSize: ui.type.caption, fontFamily: ui.fonts.medium, fontWeight: '600', color: ui.colors.accentText },
  progressGroup: { gap: ui.space.sm, paddingTop: ui.space.md, paddingBottom: ui.space.lg },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: ui.space.sm, alignItems: 'center' },
  preview: { ...shared.eyebrow, fontSize: ui.type.micro },
  progress: { flexDirection: 'row', gap: ui.space.xs },
  segment: { flex: 1, height: 4, borderRadius: ui.radius.pill, backgroundColor: ui.colors.track },
  segmentDone: { backgroundColor: ui.colors.accentStrong },
  segmentCurrent: { backgroundColor: ui.colors.controlBorder },
  intro: { gap: ui.space.sm, marginBottom: ui.space.lg },
  content: { flex: 1, minHeight: 0, justifyContent: 'center', gap: ui.space.md },
  footer: { paddingTop: ui.space.md, gap: ui.space.xs },
  footnote: { ...shared.caption, fontSize: ui.type.note, textAlign: 'center' },
}); };

export const useOnboardingStyles = () => useThemedStyles(createOnboardingStyles);
