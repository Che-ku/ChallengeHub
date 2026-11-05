import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { Typography } from '../../constants/theme';
import { AppText as Text } from '../../components/app-text';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

const editRows = [
  { field: 'name', label: 'Username' },
  { field: 'categories', label: 'Categories' },
];

export default function ProfileScreen() {
  const { styles } = useThemeStyles(createStyles);
  const { user, completions, badges, logout, updateProfile } = useAppStore();
  const [profilePictureUri, setProfilePictureUri] = useState(user?.profilePictureUri ?? null);
  const [savingPicture, setSavingPicture] = useState(false);
  const equippedBadge = badges.find((badge) => badge.id === user?.equippedBadgeId && badge.unlocked);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>You are not signed in</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/auth')}>
            <Text style={styles.primaryButtonText}>Go to login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const leaveProfile = () => {
    logout();
    router.replace('/auth');
  };

  const chooseProfilePicture = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow photo library access to choose a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setProfilePictureUri(result.assets[0].uri);
      }
    } catch (pickerError) {
      Alert.alert('Could not open photos', pickerError instanceof Error ? pickerError.message : 'Please try again.');
    }
  };

  const saveProfilePicture = async () => {
    setSavingPicture(true);
    try {
      const result = await updateProfile({
        fullName: user.fullName,
        interests: user.interests ?? [],
        profilePictureUri,
      });
      if (!result.success) {
        Alert.alert('Could not save photo', result.message);
      }
    } catch (saveError) {
      Alert.alert('Could not save photo', saveError instanceof Error ? saveError.message : 'Please try again.');
    } finally {
      setSavingPicture(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your account</Text>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile picture</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.avatarLarge} onPress={chooseProfilePicture} accessibilityLabel="Choose profile picture">
              {profilePictureUri
                ? <Image source={{ uri: profilePictureUri }} style={styles.avatarImage} />
                : <Text style={styles.avatarInitial}>{(user.fullName.trim()[0] || '?').toUpperCase()}</Text>}
            </TouchableOpacity>
            <View style={styles.photoActions}>
              <Text style={styles.helperText}>Add a photo so your profile is yours.</Text>
              <TouchableOpacity onPress={chooseProfilePicture}>
                <Text style={styles.photoAction}>Choose photo</Text>
              </TouchableOpacity>
            </View>
          </View>
          {profilePictureUri !== user.profilePictureUri ? (
            <TouchableOpacity style={styles.savePhotoButton} onPress={saveProfilePicture} disabled={savingPicture}>
              <Text style={styles.savePhotoButtonText}>{savingPicture ? 'Saving...' : 'Save photo'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.card}>
          {editRows.map((row) => (
            <TouchableOpacity
              key={row.field}
              style={styles.editRow}
              onPress={() => router.push({ pathname: '/profile-edit/[field]', params: { field: row.field } })}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${row.label}`}
            >
              <View style={styles.editRowText}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue} numberOfLines={2}>
                  {row.field === 'name' ? user.fullName : user.interests?.join(', ') || 'Choose categories'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressCard}><Text style={styles.statValue}>{user.totalXP}</Text><Text style={styles.statLabel}>XP</Text></View>
            <View style={styles.progressCard}><Text style={styles.statValue}>{user.currentLevel}</Text><Text style={styles.statLabel}>Level</Text></View>
            <View style={styles.progressCard}><Text style={styles.streakValue}>{user.currentStreak}</Text><Text style={styles.statLabel}>Streak</Text></View>
            <View style={styles.progressCard}><Text style={styles.streakValue}>{user.longestStreak ?? 0}</Text><Text style={styles.statLabel}>Longest streak</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Equipped badge</Text>
          {equippedBadge ? (
            <View style={styles.equippedBadge}>
              <Text style={styles.equippedBadgeIcon}>{equippedBadge.icon}</Text>
              <View style={styles.equippedBadgeDetails}>
                <Text style={styles.completionTitle}>{equippedBadge.name}</Text>
                <Text style={styles.helperText}>{equippedBadge.description}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.helperText}>No badge equipped yet. Choose one from Progress → Achievements.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent completions</Text>
          {completions.length === 0
            ? <Text style={styles.helperText}>Your completed challenges will appear here.</Text>
            : completions.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.completionRow}>
                <View style={styles.completionDetails}>
                  <Text style={styles.completionTitle}>{item.challengeTitle}</Text>
                  <Text style={styles.helperText}>
                    {item.category} · {item.xpEarned} XP
                    {Number.isFinite(item.durationSeconds) ? ` · ${formatDuration(item.durationSeconds)}` : ''}
                  </Text>
                </View>
                <Text style={styles.completionDate}>{new Date(item.completionDate).toLocaleDateString()}</Text>
              </View>
            ))}
        </View>

        <View style={styles.accountActions}>
          <TouchableOpacity style={styles.switchButton} onPress={leaveProfile}>
            <Text style={styles.switchButtonText}>Switch profile</Text>
          </TouchableOpacity>
          <Text style={styles.accountActionHint}>Sign in with another account to switch profiles.</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={leaveProfile}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { padding: 20, gap: 16, paddingBottom: 36 },
  header: { gap: 4, marginBottom: 2 },
  eyebrow: { color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', fontSize: 12 },
  title: { fontSize: 30, fontWeight: '800', color: theme.textPrimary },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 12, shadowColor: theme.overlay, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  editRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border },
  editRowText: { flex: 1, gap: 4 },
  rowLabel: { color: theme.textPrimary, fontSize: 15, fontWeight: '800' },
  rowValue: { color: theme.textSecondary, fontSize: 13, lineHeight: 18 },
  chevron: { color: theme.primaryLight, fontSize: 28, lineHeight: 30 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarLarge: { width: 84, height: 84, borderRadius: 42, overflow: 'hidden', backgroundColor: theme.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { color: theme.secondary, fontSize: 34, fontWeight: '800' },
  photoActions: { flex: 1, gap: 8 },
  photoAction: { color: theme.secondary, fontWeight: '800' },
  savePhotoButton: { backgroundColor: theme.primary, borderRadius: 12, minHeight: 48, justifyContent: 'center', paddingVertical: 13, alignItems: 'center' },
  savePhotoButtonText: { color: theme.textPrimary, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary },
  progressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  progressCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: theme.surfaceElevated, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', fontFamily: Typography.bold, color: theme.textPrimary },
  streakValue: { fontSize: 24, fontWeight: '800', fontFamily: Typography.bold, color: theme.streak },
  statLabel: { color: theme.textSecondary, fontWeight: '700', marginTop: 4 },
  helperText: { color: theme.textSecondary, fontSize: 13, lineHeight: 18 },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border },
  completionDetails: { flex: 1 },
  completionTitle: { color: theme.textPrimary, fontWeight: '700' },
  completionDate: { color: theme.textSecondary, fontWeight: '600', marginLeft: 8 },
  equippedBadge: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surfaceElevated, borderColor: theme.achievement, borderWidth: 1, borderRadius: 12, padding: 14 },
  equippedBadgeIcon: { fontSize: 30, color: theme.achievement },
  equippedBadgeDetails: { flex: 1, gap: 4 },
  accountActions: { gap: 10, marginTop: 4 },
  accountActionHint: { color: theme.textSecondary, fontSize: 12, textAlign: 'center' },
  switchButton: { backgroundColor: theme.surfaceElevated, borderRadius: 12, minHeight: 48, justifyContent: 'center', paddingVertical: 15, alignItems: 'center' },
  switchButtonText: { color: theme.secondary, fontWeight: '800' },
  logoutButton: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 12, minHeight: 48, justifyContent: 'center', paddingVertical: 15, alignItems: 'center' },
  logoutButtonText: { color: theme.textPrimary, fontWeight: '800' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
  emptyStateTitle: { fontSize: 26, fontWeight: '800', color: theme.textPrimary },
  primaryButton: { minHeight: 48, justifyContent: 'center', backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20 },
  primaryButtonText: { color: theme.textPrimary, fontWeight: '800', textAlign: 'center' },
});
