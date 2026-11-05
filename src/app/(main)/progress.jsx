import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GRADIENTS, Typography } from '../../constants/theme';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { AppText as Text } from '../../components/app-text';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';
import { getStreakStats } from '../../services/xp';

function getWeekStart(date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - ((day + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

function getBadgeProgress(badge, completions, weeklyGoal) {
  const categoryIds = {
    'fitness-enthusiast': 'Fitness',
    'knowledge-seeker': 'Learning',
    'creative-mind': 'Creativity',
    'productivity-pro': 'Productivity',
    'wellness-champion': 'Wellbeing',
    'kindness-champion': 'Kindness',
    'sustainability-champion': 'Sustainability',
  };
  const totalTargets = {
    'first-step': 1,
    'getting-started': 5,
    'challenge-explorer': 10,
    'dedicated-learner': 25,
    'challenge-master': 50,
  };
  const streakTargets = { 'streak-3': 3, 'streak-7': 7, 'streak-14': 14, 'streak-30': 30 };
  const category = categoryIds[badge.id];
  if (category) {
    const count = completions.filter((entry) => entry.category === category).length;
    return `${Math.min(count, 10)} / 10 ${category.toLowerCase()} challenges`;
  }
  if (totalTargets[badge.id]) {
    return `${Math.min(completions.length, totalTargets[badge.id])} / ${totalTargets[badge.id]} challenges`;
  }
  if (streakTargets[badge.id]) {
    const longestStreak = getStreakStats(completions).longest;
    return `${Math.min(longestStreak, streakTargets[badge.id])} / ${streakTargets[badge.id]} day streak`;
  }
  if (badge.id === 'goal-getter') {
    const monday = getWeekStart(new Date());
    const count = completions.filter((entry) => new Date(entry.completionDate) >= monday).length;
    return `${Math.min(count, weeklyGoal)} / ${weeklyGoal} this week`;
  }
  return badge.description;
}

export default function ProgressScreen() {
  const { styles } = useThemeStyles(createStyles);
  const { user, completions, badges, equipBadge } = useAppStore();
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);
  const [savingBadge, setSavingBadge] = useState(false);
  const weekStart = getWeekStart(new Date());
  const weeklyCompletions = completions.filter((item) => new Date(item.completionDate) >= weekStart);
  const goal = user?.weeklyGoal ?? 5;
  const progress = goal > 0 ? Math.min(weeklyCompletions.length / goal, 1) : 0;
  const xpIntoLevel = (user?.totalXP ?? 0) % 100;
  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const lockedBadges = badges.filter((badge) => !badge.unlocked);
  const selectedBadge = badges.find((badge) => badge.id === selectedBadgeId) ?? null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your activity</Text>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Small steps add up. Keep your momentum going.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.cardTitle}>Weekly goal</Text>
              <Text style={styles.muted}>Challenges completed this week</Text>
            </View>
            <Text style={styles.goalCount}>{weeklyCompletions.length}/{goal}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.muted}>{progress >= 1 ? 'Goal complete — great work!' : `${Math.max(goal - weeklyCompletions.length, 0)} more to reach your weekly goal`}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.totalXP ?? 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.streakValue}>{user?.currentStreak ?? 0}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements · Unlocked {unlockedBadges.length}</Text>
          {unlockedBadges.length === 0
            ? <Text style={styles.muted}>Complete challenges to earn your first badge.</Text>
            : <View style={styles.badgesRow}>
              {unlockedBadges.map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgePill, user?.equippedBadgeId === badge.id && styles.badgeEquipped]}
                  onPress={() => setSelectedBadgeId(badge.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${badge.name}${user?.equippedBadgeId === badge.id ? ', equipped' : ''}. View details.`}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  {user?.equippedBadgeId === badge.id ? <Text style={styles.badgeState}>Equipped</Text> : null}
                </TouchableOpacity>
              ))}
            </View>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Waiting to unlock · {lockedBadges.length}</Text>
          {lockedBadges.length === 0
            ? <Text style={styles.muted}>You unlocked every badge. Amazing work!</Text>
            : <View style={styles.badgesRow}>
              {lockedBadges.map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgePill, styles.badgeLocked]}
                  onPress={() => setSelectedBadgeId(badge.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${badge.name}. View unlock requirements.`}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeProgress}>{getBadgeProgress(badge, completions, goal)}</Text>
                </TouchableOpacity>
              ))}
            </View>}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.cardTitle}>Level {user?.currentLevel ?? 1}</Text>
              <Text style={styles.muted}>{100 - xpIntoLevel} XP to the next level</Text>
            </View>
            <Text style={styles.levelIcon}>✦</Text>
          </View>
          <View style={styles.track}>
            <LinearGradient
              colors={GRADIENTS.xp}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.xpFill, { width: `${xpIntoLevel}%` }]}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent completions</Text>
          {completions.length === 0 ? (
            <Text style={styles.muted}>Your completed challenges will show here.</Text>
          ) : completions.slice(0, 6).map((item) => (
            <View key={item.id} style={styles.completionRow}>
              <View style={styles.completionIcon}>
                <Text style={styles.completionCheck}>✓</Text>
              </View>
              <View style={styles.completionDetails}>
                <Text style={styles.completionTitle}>{item.challengeTitle}</Text>
                <Text style={styles.muted}>
                  {new Date(item.completionDate).toLocaleDateString()}
                  {Number.isFinite(item.durationSeconds) ? ` · ${formatDuration(item.durationSeconds)}` : ''}
                </Text>
              </View>
              <Text style={styles.xp}>{item.xpEarned} XP</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadgeId(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.badgeModal}
            contentContainerStyle={styles.badgeModalContent}
            accessibilityViewIsModal
          >
            {selectedBadge ? (
              <>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setSelectedBadgeId(null)}
                  accessibilityLabel="Close badge details"
                >
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>
                <Text style={styles.modalBadgeIcon}>{selectedBadge.icon}</Text>
                <Text style={styles.modalTitle}>{selectedBadge.name}</Text>
                <Text style={[styles.modalStatus, selectedBadge.unlocked ? styles.modalUnlocked : styles.modalLocked]}>
                  {selectedBadge.unlocked
                    ? user?.equippedBadgeId === selectedBadge.id ? 'Unlocked · Equipped' : 'Unlocked'
                    : `Waiting to unlock · ${getBadgeProgress(selectedBadge, completions, goal)}`}
                </Text>
                <Text style={styles.modalDescription}>{selectedBadge.description}</Text>
                {selectedBadge.unlocked ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    disabled={savingBadge}
                    onPress={async () => {
                      setSavingBadge(true);
                      try {
                        const nextBadgeId = user?.equippedBadgeId === selectedBadge.id ? null : selectedBadge.id;
                        const result = await equipBadge(nextBadgeId);
                        if (!result.success) {
                          Alert.alert('Could not update badge', result.message);
                        } else {
                          setSelectedBadgeId(null);
                        }
                      } catch (error) {
                        Alert.alert('Could not update badge', error instanceof Error ? error.message : 'Please try again.');
                      } finally {
                        setSavingBadge(false);
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>
                      {savingBadge ? 'Saving...' : user?.equippedBadgeId === selectedBadge.id ? 'Remove equipped badge' : 'Equip badge'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { padding: 20, paddingBottom: 28, gap: 16 },
  header: { gap: 5, marginBottom: 4 },
  eyebrow: { color: theme.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.textPrimary, fontSize: 30, fontWeight: '800' },
  subtitle: { color: theme.textSecondary, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 14, shadowColor: theme.overlay, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: theme.textPrimary, fontSize: 17, fontWeight: '800' },
  muted: { color: theme.textSecondary, fontSize: 13, lineHeight: 18 },
  goalCount: { color: theme.success, fontFamily: Typography.bold, fontSize: 22, fontWeight: '800' },
  track: { height: 10, overflow: 'hidden', borderRadius: 999, backgroundColor: theme.surfaceElevated },
  fill: { height: '100%', borderRadius: 999, backgroundColor: theme.success },
  xpFill: { height: '100%', borderRadius: 999, backgroundColor: theme.primary },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 4, elevation: 2 },
  statValue: { color: theme.primaryLight, fontFamily: Typography.bold, fontSize: 28, fontWeight: '800' },
  streakValue: { color: theme.streak, fontFamily: Typography.bold, fontSize: 28, fontWeight: '800' },
  statLabel: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  levelIcon: { color: theme.achievement, fontSize: 29 },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopColor: theme.border, borderTopWidth: 1, paddingTop: 12 },
  completionIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  completionCheck: { color: theme.success, fontSize: 17, fontWeight: '800' },
  completionDetails: { flex: 1 },
  completionTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: '700' },
  xp: { color: theme.primaryLight, fontFamily: Typography.bold, fontSize: 13, fontWeight: '800' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgePill: { width: '31%', minHeight: 100, backgroundColor: theme.surfaceElevated, borderColor: theme.achievement, borderWidth: 1, borderRadius: 12, padding: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  badgeEquipped: { borderWidth: 2, backgroundColor: theme.surface },
  badgeLocked: { opacity: 0.62 },
  badgeIcon: { fontSize: 20, color: theme.achievement },
  badgeName: { fontSize: 11, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' },
  badgeState: { color: theme.achievement, fontSize: 10, fontWeight: '700' },
  badgeProgress: { color: theme.textSecondary, fontSize: 9, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: `${theme.overlay}E6`, justifyContent: 'center', alignItems: 'center', padding: 20 },
  badgeModal: { width: '100%', maxWidth: 420, maxHeight: '90%', backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16 },
  badgeModalContent: { padding: 24, alignItems: 'center', gap: 12 },
  modalClose: { alignSelf: 'flex-end', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: theme.textSecondary, fontSize: 30, lineHeight: 34 },
  modalBadgeIcon: { fontSize: 48, color: theme.achievement },
  modalTitle: { color: theme.textPrimary, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  modalStatus: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  modalUnlocked: { color: theme.success },
  modalLocked: { color: theme.textSecondary },
  modalDescription: { color: theme.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 8 },
  primaryButton: { width: '100%', minHeight: 48, justifyContent: 'center', backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  primaryButtonText: { color: theme.textPrimary, fontWeight: '800', textAlign: 'center' },
});
