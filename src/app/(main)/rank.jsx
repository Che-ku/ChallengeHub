import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { GRADIENTS, Typography } from '../../constants/theme';
import { AppText as Text } from '../../components/app-text';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

export default function RankScreen() {
  const { styles } = useThemeStyles(createStyles);
  const { user } = useAppStore();

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
          <Text style={styles.rankNote}>Your score updates each time you complete a challenge.</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Community rankings are not connected yet</Text>
          <Text style={styles.noticeBody}>Your personal score is saved on this device. A shared leaderboard will appear when the app is connected to its community service.</Text>
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
  notice: { padding: 18, gap: 8, backgroundColor: theme.surfaceElevated, borderRadius: 16 },
  noticeTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '800' },
  noticeBody: { color: theme.textSecondary, fontSize: 14, lineHeight: 21 },
  button: { alignItems: 'center', justifyContent: 'center', minHeight: 48, padding: 15, backgroundColor: theme.primary, borderRadius: 12 },
  buttonText: { color: theme.textPrimary, fontWeight: '800', fontSize: 15 },
});
