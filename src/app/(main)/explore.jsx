import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { AppText as Text } from '../../components/app-text';
import { Typography } from '../../constants/theme';
import { DEFAULT_TEAM, getCategoryColor, getDifficultyColor } from '../../data/challenges';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

const sections = [
  { id: 'challenges', title: 'Challenges', detail: 'Browse and search all challenges', icon: '▤' },
  { id: 'team', title: 'Team challenges', detail: 'Take on a challenge with your team', icon: '◉' },
  { id: 'seasonal', title: 'Seasonal challenges', detail: 'Explore this week’s and month’s goals', icon: '✦' },
];

function ChallengeRow({ challenge, styles }) {
  return (
    <Link href={{ pathname: '/challenge/[id]', params: { id: challenge.id } }} asChild>
      <TouchableOpacity style={styles.challengeRow}>
        <View style={styles.challengeRowTop}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
        <Text style={styles.description}>{challenge.description}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaPill, { backgroundColor: `${getCategoryColor(challenge.category)}22` }]}>{challenge.category}</Text>
          <Text style={[styles.metaPill, { backgroundColor: `${getDifficultyColor(challenge.difficulty)}22` }]}>{challenge.difficulty}</Text>
          <Text style={styles.duration}>{challenge.duration} min · {challenge.xpReward} XP</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function formatSeasonDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ExploreScreen() {
  const { theme, styles } = useThemeStyles(createStyles);
  const { challenges, seasonChallenges } = useAppStore();
  const [section, setSection] = useState('menu');
  const [search, setSearch] = useState('');
  const teamChallenge = challenges.find((challenge) => challenge.id === DEFAULT_TEAM.challengeId) ?? challenges[0];
  const filteredChallenges = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return challenges;
    return challenges.filter((challenge) => (
      [challenge.title, challenge.description, challenge.category, challenge.difficulty]
        .some((value) => value.toLowerCase().includes(query))
    ));
  }, [challenges, search]);

  const isMenu = section === 'menu';
  const title = isMenu
    ? 'Explore'
    : sections.find((item) => item.id === section)?.title ?? 'Explore';
  const showingChallengeResults = section === 'challenges' || (isMenu && search.trim().length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {!isMenu ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSection('menu');
                setSearch('');
              }}
              accessibilityLabel="Back to Explore"
            >
              <Text style={styles.backButtonText}>‹  Explore</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.eyebrow}>Find your next goal</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        {(isMenu || section === 'challenges') ? (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search challenges"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="search"
            style={styles.searchInput}
            accessibilityLabel="Search challenges"
          />
        ) : null}

        {isMenu ? (
          <View style={styles.sectionList}>
            {sections.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.sectionRow, index === sections.length - 1 && styles.lastRow]}
                onPress={() => {
                  setSearch('');
                  setSection(item.id);
                }}
              >
                <View style={styles.sectionIcon}><Text style={styles.sectionIconText}>{item.icon}</Text></View>
                <View style={styles.sectionCopy}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <Text style={styles.sectionDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {showingChallengeResults ? (
          <View style={styles.results}>
            <Text style={styles.resultsHeading}>
              {search.trim() ? `${filteredChallenges.length} result${filteredChallenges.length === 1 ? '' : 's'}` : 'All challenges'}
            </Text>
            {filteredChallenges.length ? filteredChallenges.map((challenge) => (
              <ChallengeRow key={challenge.id} challenge={challenge} styles={styles} />
            )) : <Text style={styles.emptyText}>No challenges match “{search.trim()}”. Try another search.</Text>}
          </View>
        ) : null}

        {section === 'team' ? (
          <View style={styles.sectionContent}>
            {teamChallenge ? (
              <View style={styles.infoCard}>
                <Text style={styles.cardEyebrow}>Featured team challenge</Text>
                <Text style={styles.teamName}>{DEFAULT_TEAM.name}</Text>
                <Text style={styles.description}>Work together on this shared goal: {teamChallenge.title}.</Text>
                <ChallengeRow challenge={teamChallenge} styles={styles} />
                <Text style={styles.notice}>
                  Team creation, invitations, and shared progress are not connected yet. Completing this challenge records it to your personal profile.
                </Text>
              </View>
            ) : <Text style={styles.emptyText}>There are no team challenges available.</Text>}
          </View>
        ) : null}

        {section === 'seasonal' ? (
          <View style={styles.sectionContent}>
            {seasonChallenges.map((season) => {
              const seasonItems = season.challengeIds
                .map((id) => challenges.find((challenge) => challenge.id === id))
                .filter(Boolean);
              return (
                <View key={season.id} style={styles.infoCard}>
                  <Text style={styles.cardEyebrow}>
                    {formatSeasonDate(season.startDate)} – {formatSeasonDate(season.endDate)}
                  </Text>
                  <Text style={styles.seasonTitle}>{season.title}</Text>
                  <Text style={styles.description}>{season.description}</Text>
                  {seasonItems.map((challenge) => <ChallengeRow key={challenge.id} challenge={challenge} styles={styles} />)}
                  {!seasonItems.length ? <Text style={styles.notice}>Season challenges are being prepared.</Text> : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flexGrow: 1, padding: 20, paddingBottom: 36, gap: 16 },
  header: { gap: 4 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12, marginBottom: 4 },
  backButtonText: { color: theme.secondary, fontSize: 15, fontWeight: '800' },
  eyebrow: { color: theme.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.textPrimary, fontSize: 30, fontWeight: '800' },
  searchInput: { minHeight: 48, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 13, backgroundColor: theme.surfaceElevated, color: theme.textPrimary, fontFamily: Typography.body, fontSize: 15 },
  sectionList: { backgroundColor: theme.surface, borderRadius: 16, paddingHorizontal: 16, shadowColor: theme.overlay, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  sectionRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderColor: theme.border, paddingVertical: 12 },
  lastRow: { borderBottomWidth: 0 },
  sectionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  sectionIconText: { color: theme.secondary, fontSize: 21, fontWeight: '800' },
  sectionCopy: { flex: 1, gap: 4 },
  sectionTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '800' },
  sectionDetail: { color: theme.textSecondary, fontSize: 13, lineHeight: 18 },
  chevron: { color: theme.primaryLight, fontSize: 27 },
  results: { gap: 12 },
  resultsHeading: { color: theme.textPrimary, fontSize: 17, fontWeight: '800' },
  challengeRow: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, gap: 9, borderWidth: 1, borderColor: theme.border },
  challengeRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  challengeTitle: { flex: 1, color: theme.textPrimary, fontSize: 16, fontWeight: '800' },
  description: { color: theme.textSecondary, fontSize: 13, lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  metaPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, color: theme.textPrimary, fontSize: 11, fontWeight: '700' },
  duration: { color: theme.secondary, fontSize: 12, fontWeight: '800' },
  sectionContent: { gap: 14 },
  infoCard: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, gap: 12, elevation: 3 },
  cardEyebrow: { color: theme.primaryLight, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  teamName: { color: theme.textPrimary, fontSize: 20, fontWeight: '800' },
  seasonTitle: { color: theme.textPrimary, fontSize: 19, fontWeight: '800' },
  notice: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
  emptyText: { color: theme.textSecondary, lineHeight: 20 },
});
