import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { AppText as Text } from '../../components/app-text';
import { getCategoryColor, getDifficultyColor } from '../../data/challenges';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

export default function HomeScreen() {
  const { theme, styles } = useThemeStyles(createStyles);
  const { user, dailyChallenge, completions, isReady, isAuthenticated } = useAppStore();
  const mostRecentCompletion = completions.reduce((latest, completion) => (
    !latest || new Date(completion.completionDate) > new Date(latest.completionDate) ? completion : latest
  ), null);

  useEffect(() => {
    if (isReady && (!isAuthenticated || !user)) {
      router.replace('/auth');
    }
  }, [isReady, isAuthenticated, user]);

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authState}>
          <Text style={styles.authTitle}>Challenge Hub</Text>
          <Text style={styles.authCopy}>Track habits, earn XP, and complete proof-based challenges.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/auth')}>
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!dailyChallenge) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <Text style={styles.emptyText}>Challenges are not available right now.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.title}>{user.fullName}</Text>
        </View>

        <View style={styles.heroCard}>
          <Image source={{ uri: dailyChallenge.imageUrl }} style={styles.heroImage} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Daily Challenge</Text>
            <Text style={styles.heroTitle}>{dailyChallenge.title}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.metaPill, { backgroundColor: `${getCategoryColor(dailyChallenge.category)}22` }]}>{dailyChallenge.category}</Text>
              <Text style={[styles.metaPill, { backgroundColor: `${getDifficultyColor(dailyChallenge.difficulty)}22` }]}>{dailyChallenge.difficulty}</Text>
            </View>
            <Text style={styles.heroDescription}>{dailyChallenge.description}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>{dailyChallenge.duration} min</Text>
              <Text style={styles.statText}>{dailyChallenge.xpReward} XP</Text>
            </View>
            <View style={styles.ctaRow}>
              <Link href={{ pathname: '/challenge/[id]', params: { id: dailyChallenge.id } }} asChild>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Complete now</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/explore" asChild>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Explore</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>

        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentLabel}>Most recent completion</Text>
            <Text style={styles.completionMark}>✓</Text>
          </View>
          {mostRecentCompletion ? (
            <>
              <Text style={styles.recentTitle}>{mostRecentCompletion.challengeTitle}</Text>
              <View style={styles.recentMetaRow}>
                <Text style={styles.recentMeta}>{mostRecentCompletion.category}</Text>
                <Text style={styles.recentMeta}>{mostRecentCompletion.xpEarned} XP earned</Text>
              </View>
              {Number.isFinite(mostRecentCompletion.durationSeconds)
                ? <Text style={styles.recentDate}>Time taken: {formatDuration(mostRecentCompletion.durationSeconds)}</Text>
                : null}
              <Text style={styles.recentDate}>{new Date(mostRecentCompletion.completionDate).toLocaleDateString()}</Text>
            </>
          ) : (
            <Text style={styles.emptyText}>Complete a challenge and your latest win will show here.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { padding: 20, gap: 20, paddingBottom: 32 },
  header: { gap: 4 },
  eyebrow: { color: theme.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800', color: theme.textPrimary },
  authState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 18, backgroundColor: theme.background },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authTitle: { fontSize: 36, fontWeight: '800', color: theme.textPrimary },
  authCopy: { textAlign: 'center', color: theme.textSecondary, fontSize: 16, lineHeight: 24 },
  primaryButton: { backgroundColor: theme.primary, minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: theme.textPrimary, fontWeight: '700' },
  secondaryButton: { backgroundColor: theme.surfaceElevated, minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  secondaryButtonText: { color: theme.textPrimary, fontWeight: '700' },
  heroCard: { backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', shadowColor: theme.overlay, shadowOpacity: 0.08, shadowRadius: 18, elevation: 6 },
  recentCard: { backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 8, shadowColor: theme.overlay, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recentLabel: { color: theme.secondary, fontSize: 12, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
  completionMark: { color: theme.secondary, fontSize: 20, fontWeight: '900' },
  recentTitle: { color: theme.textPrimary, fontSize: 19, fontWeight: '800' },
  recentMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  recentMeta: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  recentDate: { color: theme.textSecondary, fontSize: 12 },
  emptyText: { color: theme.textSecondary, lineHeight: 20, textAlign: 'center' },
  heroImage: { width: '100%', height: 180 },
  heroContent: { padding: 18, gap: 10 },
  heroLabel: { fontSize: 12, color: theme.textSecondary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: theme.textPrimary },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 12, color: theme.textPrimary },
  heroDescription: { color: theme.textSecondary, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 14 },
  statText: { color: theme.secondary, fontWeight: '800' },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
