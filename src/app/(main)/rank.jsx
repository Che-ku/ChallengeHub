import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { GRADIENTS, Typography } from '../../constants/theme';
import { AppText as Text } from '../../components/app-text';
import { useThemeStyles } from '../../hooks/use-theme';
import { subscribeToLeaderboard } from '../../services/challenge-service';
import { useAppStore } from '../../store/app-store';

export default function RankScreen() {
  const { styles } = useThemeStyles(createStyles);
  const { user } = useAppStore();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((results) => {
      setEntries(results);
      setLoading(false);
      setError('');
    }, (snapshotError) => {
      console.error('Failed to load the leaderboard', snapshotError);
      setError('Could not load the leaderboard. Check your connection and Firestore rules.');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const userRank = entries.findIndex((entry) => entry.uid === user?.id) + 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Compete and grow</Text>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Your score in Challenge Hub</Text>
        </View>

        <View style={styles.rankCard}>
          <LinearGradient colors={GRADIENTS.achievement} style={styles.medal}>
            <Text style={styles.medalText}>♛</Text>
          </LinearGradient>
          <Text style={styles.rankLabel}>YOUR CURRENT SCORE</Text>
          <Text style={styles.score}>{user?.totalXP ?? 0} XP</Text>
          <Text style={styles.rankNote}>
            {userRank ? `You are ranked #${userRank}. Your score updates when you complete a challenge.` : 'Your score updates when you complete a challenge.'}
          </Text>
        </View>

        <View style={styles.leaderboardCard}>
          <Text style={styles.noticeTitle}>Top players</Text>
          {loading ? <Text style={styles.noticeBody}>Loading leaderboard...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error && entries.length === 0 ? (
            <Text style={styles.noticeBody}>No scores yet. Complete a challenge to get on the board.</Text>
          ) : null}
          {entries.map((entry, index) => (
            <View
              key={entry.uid}
              style={[styles.leaderboardRow, entry.uid === user?.id && styles.currentUserRow]}
            >
              <Text style={styles.leaderboardRank}>{index + 1}</Text>
              <Text style={styles.leaderboardName} numberOfLines={1}>
                {entry.fullName || 'Player'}{entry.uid === user?.id ? ' (you)' : ''}
              </Text>
              <Text style={styles.leaderboardScore}>{Number(entry.totalXP) || 0} XP</Text>
            </View>
          ))}
        </View>

        <Link href="/explore" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Find a challenge</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { padding: 20, paddingBottom: 28, gap: 18 },
  header: { gap: 5 },
  eyebrow: { color: theme.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.textPrimary, fontSize: 30, fontWeight: '800' },
  subtitle: { color: theme.textSecondary, fontSize: 14 },
  rankCard: { alignItems: 'center', padding: 26, gap: 10, backgroundColor: theme.surface, borderRadius: 16, elevation: 4 },
  medal: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 26 },
  medalText: { color: theme.overlay, fontSize: 42, fontWeight: '800' },
  rankLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  score: { color: theme.textPrimary, fontFamily: Typography.bold, fontSize: 34, fontWeight: '800' },
  rankNote: { color: theme.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  leaderboardCard: { padding: 18, gap: 12, backgroundColor: theme.surfaceElevated, borderRadius: 16 },
  leaderboardRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  currentUserRow: { backgroundColor: theme.surface, borderRadius: 8, paddingHorizontal: 8 },
  leaderboardRank: { width: 28, color: theme.primaryLight, fontSize: 15, fontWeight: '800' },
  leaderboardName: { flex: 1, color: theme.textPrimary, fontSize: 14, fontWeight: '700' },
  leaderboardScore: { color: theme.textPrimary, fontSize: 13, fontWeight: '800' },
  noticeTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '800' },
  noticeBody: { color: theme.textSecondary, fontSize: 14, lineHeight: 21 },
  errorText: { color: theme.error, fontSize: 14, lineHeight: 21 },
  button: { alignItems: 'center', justifyContent: 'center', minHeight: 48, padding: 15, backgroundColor: theme.primary, borderRadius: 12 },
  buttonText: { color: theme.textPrimary, fontWeight: '800', fontSize: 15 },
});
