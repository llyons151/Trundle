import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TrundleWordmark } from '../components/Brand';
import { SceneBackdrop } from '../components/SceneBackdrop';
import { RockPlatform } from '../components/RockPlatform';
import { TAB_BAR_HEIGHT } from '../components/TabBar';
import { useSelectedApps } from '../state/apps';
import { useProfile } from '../state/profile';
import { useTheme, useThemedStyles, type Theme } from '../theme';

// A single, explicitly labeled preview dataset. Replace with measured Screen Time
// data when native tracking exists; selected apps do not imply active protection.
const PREVIEW = {
  usualMinutesByNow: 180,
  actualMinutesByNow: 46,
  weeklyMinutes: 700,
  previousWeeklyMinutes: 620,
  trailKm: 2.4,
  destinationKm: 3.2,
  days: [true, true, false, true, true, false, null],
};
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
type Detail = 'time' | 'journey' | 'week';
const DETAIL_TITLES: Record<Detail, string> = {
  time: 'A little more life.',
  journey: 'The long way home.',
  week: 'Small days. Real progress.',
};

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h${remainder ? ` ${remainder}m` : ''}` : `${remainder}m`;
}

export function HomeScreen({ onManageApps, onOpenProfile }: {
  onManageApps: () => void;
  onOpenProfile: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const selectedApps = useSelectedApps();
  const profile = useProfile();
  const profileName = profile?.displayName.trim() || 'You';
  const photoURL = profile?.photoURL?.trim();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState<Detail | null>(null);
  const saved = PREVIEW.usualMinutesByNow - PREVIEW.actualMinutesByNow;
  const progress = Math.round(PREVIEW.trailKm / PREVIEW.destinationKm * 100);
  const goalDays = PREVIEW.days.filter(Boolean).length;

  return (
    <View style={styles.fill}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 18, paddingBottom: Math.max(insets.bottom, 16) + TAB_BAR_HEIGHT + 28 },
      ]}>
        <View style={styles.header}>
          <TrundleWordmark color={colors.text} />
          <Pressable
            onPress={onOpenProfile}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
            style={({ pressed }) => [styles.profile, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={styles.profileName}>{profileName}</Text>
            <View style={styles.avatar}>
              {photoURL && failedPhoto !== photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  style={styles.avatarPhoto}
                  resizeMode="cover"
                  onError={() => setFailedPhoto(photoURL)}
                  accessible={false}
                />
              ) : profile?.displayName.trim() ? (
                <Text style={styles.avatarInitial}>{Array.from(profileName)[0].toUpperCase()}</Text>
              ) : <Feather name="user" size={19} color={colors.text} />}
            </View>
          </Pressable>
        </View>

        <Pressable onPress={onManageApps} accessibilityRole="button" accessibilityLabel="Manage selected apps. Protection is not active in this preview." style={({ pressed }) => [styles.status, pressed && styles.pressed]}>
          <Feather name="shield" size={14} color={colors.textSoft} />
          <Text style={styles.statusText}>{selectedApps.length ? `${selectedApps.length} app${selectedApps.length === 1 ? '' : 's'} selected` : 'Choose your distracting apps'}</Text>
          <Feather name="chevron-right" size={14} color={colors.textMuted} />
        </Pressable>

        <View style={styles.scene}>
          <SceneBackdrop />
          <RockPlatform size={Math.min(width - 72, 250)} />
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel={`${duration(saved)} reclaimed today, sample data. Learn how time saved is estimated.`} onPress={() => setDetail('time')} style={({ pressed }) => [styles.reclaimed, pressed && styles.pressed]}>
          <Text style={styles.eyebrow}>A LITTLE LESS SCROLLING</Text>
          <Text style={styles.hero}>{Math.floor(saved / 60)}<Text style={styles.heroUnit}>h </Text>{saved % 60}<Text style={styles.heroUnit}>m</Text></Text>
          <View style={styles.centerRow}><Text style={styles.heroLabel}>reclaimed today</Text><Feather name="info" size={13} color={colors.textMuted} /></View>
          <Text style={styles.comparison}>Compared with your usual day, by this time</Text>
        </Pressable>

        <Pressable onPress={() => setDetail('journey')} accessibilityRole="button" accessibilityLabel={`Next stop: Old Lighthouse. ${progress}% of the way. View Trundle’s journey.`} style={({ pressed }) => [styles.journey, pressed && styles.pressed]}>
          <View style={styles.cardHeading}>
            <View style={styles.destinationIcon}><Feather name="flag" size={21} color={colors.accent} /></View>
            <View style={styles.grow}><Text style={styles.eyebrow}>NEXT STOP</Text><Text style={styles.destination}>Old Lighthouse</Text></View>
            <Feather name="arrow-up-right" size={20} color={colors.textSoft} />
          </View>
          <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }} accessibilityLabel="Journey to Old Lighthouse">
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.between}><Text style={styles.caption}>Trundle traveled {PREVIEW.trailKm} km</Text><Text style={styles.progressLabel}>{progress}% there</Text></View>
        </Pressable>

        <View style={styles.weekHeading}><Text style={styles.sectionTitle}>Little by little</Text><Text style={styles.caption}>THIS WEEK</Text></View>
        <Pressable onPress={() => setDetail('week')} accessibilityRole="button" accessibilityLabel={`This week: ${duration(PREVIEW.weeklyMinutes)} reclaimed. Goal met on ${goalDays} days. View weekly summary.`} style={({ pressed }) => [styles.weekCard, pressed && styles.pressed]}>
          <View style={styles.weekSummary}>
            <View><Text style={styles.weekNumber}>{duration(PREVIEW.weeklyMinutes)}</Text><Text style={styles.caption}>reclaimed this week</Text></View>
            <View style={styles.improvement}><Feather name="trending-up" size={14} color={colors.accent} /><Text style={styles.improvementText}>+{duration(PREVIEW.weeklyMinutes - PREVIEW.previousWeeklyMinutes)}</Text></View>
          </View>
          <View style={styles.days}>
            {PREVIEW.days.map((met, index) => (
              <View key={DAY_NAMES[index]} style={styles.day} accessible accessibilityLabel={`${DAY_NAMES[index]}: ${met === null ? 'upcoming' : met ? 'goal met' : 'goal not met'}`}>
                <View style={[styles.dayCircle, met && styles.dayComplete, met === null && styles.dayUpcoming]}>
                  {met ? <Feather name="check" size={15} color={colors.onAccent} /> : <View style={styles.dayDot} />}
                </View>
                <Text style={styles.dayLabel}>{DAY_NAMES[index].slice(0, 1)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.encouragement}>{goalDays} days on track. Every little bit counts.</Text>
        </Pressable>

        <Pressable onPress={onManageApps} accessibilityRole="button" style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Feather name="sliders" size={17} color={colors.text} />
          <Text style={styles.actionText}>{selectedApps.length ? 'Manage my apps' : 'Choose my apps'}</Text>
          <Feather name="arrow-right" size={17} color={colors.text} />
        </Pressable>
        <Text style={styles.previewNote}>Sample stats & journey · App blocking isn’t active yet</Text>
      </ScrollView>

      <Modal visible={detail !== null} transparent animationType="fade" onRequestClose={() => setDetail(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close details" onPress={() => setDetail(null)} />
          <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24), maxHeight: '85%' }]}>
            <View style={styles.sheetHeader}><Text style={styles.eyebrow}>TRUNDLE · PREVIEW</Text><Pressable onPress={() => setDetail(null)} accessibilityRole="button" accessibilityLabel="Close details" style={styles.close}><Feather name="x" size={22} color={colors.text} /></Pressable></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text accessibilityRole="header" style={styles.sheetTitle}>{detail ? DETAIL_TITLES[detail] : ''}</Text>
              {detail === 'time' && <>
                <Text style={styles.body}>Time reclaimed is an estimate of how much less you’ve used your selected apps compared with your usual usage by the same time of day.</Text>
                <DetailRow label="Usual usage by now" value={duration(PREVIEW.usualMinutesByNow)} />
                <DetailRow label="Today’s usage by now" value={duration(PREVIEW.actualMinutesByNow)} />
                <DetailRow label="Estimated time reclaimed" value={duration(saved)} accent />
                <Text style={styles.body}>These are sample numbers. Your personal estimate will need Screen Time access and a usage baseline. Time spent with apps blocked is not automatically time saved.</Text>
              </>}
              {detail === 'journey' && <>
                <Text style={styles.body}>A quiet trail, a sea breeze, and a light in the distance. A little less scrolling takes Trundle a little further.</Text>
                <View style={styles.milestone}><Feather name="check-circle" size={21} color={colors.accent} /><View style={styles.grow}><Text style={styles.milestoneTitle}>Mossy Hollow</Text><Text style={styles.caption}>Where the journey began</Text></View></View>
                <View style={styles.milestone}><Feather name="map-pin" size={21} color={colors.accent} /><View style={styles.grow}><Text style={styles.milestoneTitle}>The coastal path</Text><Text style={styles.caption}>Trundle is here · {PREVIEW.trailKm} km</Text></View></View>
                <View style={styles.milestone}><Feather name="flag" size={21} color={colors.textSoft} /><View style={styles.grow}><Text style={styles.milestoneTitle}>Old Lighthouse</Text><Text style={styles.caption}>{(PREVIEW.destinationKm - PREVIEW.trailKm).toFixed(1)} km to go · a new place to discover</Text></View></View>
                <Text style={styles.body}>This is a preview of Trundle’s virtual journey. Distance belongs to Trundle and doesn’t represent your physical steps or walking distance.</Text>
              </>}
              {detail === 'week' && <>
                <Text style={styles.body}>Progress has room for imperfect days. Your weekly view celebrates the days you meet your goal without erasing the ones that came before.</Text>
                <DetailRow label="Reclaimed this week" value={duration(PREVIEW.weeklyMinutes)} accent />
                <DetailRow label="Reclaimed last week" value={duration(PREVIEW.previousWeeklyMinutes)} />
                <DetailRow label="Days meeting the goal" value={`${goalDays} of 6`} />
                <Text style={styles.body}>This sample week runs Monday to Sunday, with six days recorded. Your actual weekly summary will appear once tracking is connected.</Text>
              </>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return <View style={styles.detailRow}><Text style={[styles.body, styles.grow]}>{label}</Text><Text style={[styles.detailValue, accent && { color: colors.accent }]}>{value}</Text></View>;
}

const createStyles = ({ colors, fonts }: Theme) => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  profile: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 9, minHeight: 44, flexShrink: 1 },
  profileName: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, flexShrink: 1 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  avatarPhoto: { width: 32, height: 32, borderRadius: 16 },
  avatarInitial: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44, marginTop: 4 },
  statusText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSoft },
  scene: { alignItems: 'center', paddingTop: 5, paddingBottom: 22 },
  reclaimed: { alignItems: 'center', paddingTop: 8, paddingBottom: 25 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1.7, color: colors.textMuted },
  hero: { fontFamily: fonts.display, fontSize: 64, lineHeight: 82, letterSpacing: -2, color: colors.text },
  heroUnit: { fontSize: 29, color: colors.textSoft },
  centerRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroLabel: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  comparison: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  journey: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  destinationIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1 },
  destination: { fontFamily: fonts.display, fontSize: 23, color: colors.text, marginTop: 2 },
  progressTrack: { height: 5, borderRadius: 5, backgroundColor: colors.track, marginTop: 19, marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 5 },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  caption: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  progressLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.accentText },
  weekHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  weekCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18 },
  weekSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekNumber: { fontFamily: fonts.display, fontSize: 28, color: colors.text, marginBottom: 2 },
  improvement: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 9, backgroundColor: colors.accentSoft, borderRadius: 20 },
  improvementText: { fontFamily: fonts.medium, fontSize: 12, color: colors.accentText },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 19, gap: 4 },
  day: { alignItems: 'center', gap: 7 },
  dayCircle: { width: 29, height: 29, borderRadius: 15, backgroundColor: colors.track, justifyContent: 'center', alignItems: 'center' },
  dayComplete: { backgroundColor: colors.accent },
  dayUpcoming: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  dayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textMuted },
  dayLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  encouragement: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSoft, marginTop: 16, textAlign: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 50, marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  actionText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  previewNote: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 14 },
  pressed: { opacity: 0.65 },
  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, borderWidth: 1, borderColor: colors.border },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontFamily: fonts.display, fontSize: 36, color: colors.text, marginTop: 8, marginBottom: 14 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.textSoft, marginVertical: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 5 },
  detailValue: { fontFamily: fonts.medium, fontSize: 17, color: colors.text },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border },
  milestoneTitle: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, marginBottom: 5 },
});
