import { Link } from 'expo-router';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../components/app-pressable';
import { AppText as Text } from '../components/app-text';
import { buildChallengeLibrary, getCategoryColor, getDifficultyColor } from '../data/challenges';
import { useThemeStyles } from '../hooks/use-theme';

const challenges = buildChallengeLibrary();

export default function ExploreScreen() {
  const { styles } = useThemeStyles(createStyles);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore challenges</Text>
      </View>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Link href="/" asChild>
            <TouchableOpacity style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.content}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaPill, { backgroundColor: `${getCategoryColor(item.category)}22` }]}>{item.category}</Text>
                  <Text style={[styles.metaPill, { backgroundColor: `${getDifficultyColor(item.difficulty)}22` }]}>{item.difficulty}</Text>
                </View>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.duration}>{item.duration} min · {item.xpReward} XP</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.overlay,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
    color: theme.textPrimary,
  },
  description: {
    color: theme.textSecondary,
    lineHeight: 20,
  },
  duration: {
    fontWeight: '700',
    color: theme.secondary,
  },
});
