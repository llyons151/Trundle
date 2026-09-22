import { createSharedStyles } from '../components/app-ui';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, Heading, Surface, SectionLabel, Row, Button, PreviewNotice, useSharedStyles } from '../components/app-ui';
import { Icon } from '../components/icon';
import { DetailSheet } from '../components/detail-sheet';
import { usePreferences, savePreferences } from '../state/preferences';
import { useThemedStyles, type Theme, useTheme } from '../theme';
import { onboarding, useOnboarding } from '../state/onboarding';

export function ProfileScreen({ onRoutine, onApps }: { onRoutine: () => void; onApps: () => void }) {
  const ui = useTheme();
  const shared = useSharedStyles();
  const styles = useThemedStyles(createStyles);
  const { values, saving, error } = usePreferences();
  const setup = useOnboarding();
  const [name, setName] = useState(values.displayName);
  const [info, setInfo] = useState<'privacy' | 'about' | null>(null);
  const [saved, setSaved] = useState(false);
  const [editingName, setEditingName] = useState(false);
  useEffect(() => { setName(values.displayName); }, [values.displayName]);
  return <><Screen>
    <Heading eyebrow="YOUR LITTLE CORNER" title="You" subtitle="Your own little corner." />
    <View style={styles.identity}><View style={styles.avatar}>{values.displayName ? <Text style={styles.initial}>{Array.from(values.displayName)[0].toUpperCase()}</Text> : <Icon name="user" size={38} color={ui.colors.accent} />}</View><Text style={styles.name}>{values.displayName || 'Hello, you.'}</Text><Text style={shared.caption}>One small step at a time.</Text></View>
    <Row icon="edit" title="Your name" detail={values.displayName || 'Add a name'} onPress={() => { setName(values.displayName); setSaved(false); setEditingName(true); }} />
    {saved && <Text accessibilityLiveRegion="polite" style={shared.caption}>Your name is saved on this device.</Text>}
    <SectionLabel>Preferences</SectionLabel>
    <Surface><Row icon="clock" title="Your routine" detail="Bedtime, daily naps, and your morning walk" onPress={onRoutine} /><Row icon="grid" title="Your app lists" detail="Decide what to put aside" onPress={onApps} last /></Surface>
    <SectionLabel>About</SectionLabel>
    <Surface><Row icon="shield" title="Your data" detail="What stays on this device" onPress={() => setInfo('privacy')} /><Row icon="heart" title="A little about Trundle" detail="A companion for a gentler routine" onPress={() => setInfo('about')} last /></Surface>
    <PreviewNotice>Local profile · no account or cloud sync is connected.</PreviewNotice>
    {setup.record?.status === 'deferred' && <View style={{ marginTop: ui.space.lg }}><Button title="Continue setup" secondary disabled={setup.busy} onPress={() => { void onboarding.resume(values); }} /></View>}
    {__DEV__ && <View style={{ marginTop: ui.space.lg, gap: ui.space.sm }}><Button title="Replay onboarding" secondary disabled={setup.busy} onPress={() => { void onboarding.restart(values); }} /><Text style={shared.caption}>Development only. Keeps your saved routine and app lists.</Text></View>}
    {!!setup.error && <Text accessibilityRole="alert" style={shared.caption}>{setup.error}</Text>}
    <Text style={styles.version}>TRUNDLE  /  EARLY PREVIEW</Text>
  </Screen><DetailSheet visible={editingName} title="What should we call you?" closeLabel="Cancel name editing" onClose={() => setEditingName(false)}><View style={{ gap: 16 }}><TextInput accessibilityLabel="Your name" value={name} autoFocus onChangeText={value => { setName(value); setSaved(false); }} maxLength={40} placeholder="Your name" placeholderTextColor={ui.colors.textMuted} autoComplete="given-name" returnKeyType="done" style={styles.input} /><Button title={saving ? 'Saving…' : saved ? 'Name saved' : 'Save name'} disabled={saving || name.trim() === values.displayName} onPress={async () => { if (await savePreferences({ displayName: name.trim() })) { setSaved(true); setEditingName(false); } }} />{saved && <Text accessibilityLiveRegion="polite" style={shared.caption}>Your name is saved on this device.</Text>}{!!error && <Text accessibilityRole="alert" style={shared.caption}>{error}</Text>}</View></DetailSheet><DetailSheet visible={info !== null} title={info === 'privacy' ? 'Your space, your data.' : 'Little by little.'} onClose={() => setInfo(null)}><Text style={[shared.body, { marginBottom: 24 }]}>{info === 'privacy' ? 'Your name, routine times, and example app selections are stored locally on this device. There is no connected account, cloud sync, Screen Time tracking, or native blocking in this preview.' : 'Trundle is a small rock companion for a calmer daily rhythm. Put distracting apps to bed in the evening, then take a short morning walk to wake him. No perfect streaks. No punishment. Just another day to begin.'}</Text><Button title="Got it" onPress={() => setInfo(null)} /></DetailSheet></>;
}
const createStyles = (ui: Theme) =>  { const shared = createSharedStyles(ui); return StyleSheet.create({
  identity: { alignItems: 'center', paddingTop: 0, paddingBottom: 20, gap: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: ui.colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  initial: { fontFamily: ui.fonts.display, fontWeight: '700', fontSize: 36, color: ui.colors.accent },
  name: { fontFamily: ui.fonts.display, fontWeight: '700', fontSize: 26, color: ui.colors.text, textAlign: 'center' },
  input: { minHeight: 48, borderBottomWidth: 1, borderColor: ui.colors.border, color: ui.colors.text, fontFamily: ui.fonts.medium, fontWeight: '500', fontSize: 17 },
  version: { ...shared.eyebrow, textAlign: 'center', marginTop: 32, fontSize: ui.type.note },
}); };
