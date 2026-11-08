import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { Typography } from '../../constants/theme';
import { AppText as Text } from '../../components/app-text';
import { getCategoryColor, getDifficultyColor } from '../../data/challenges';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function ChallengeDetailScreen() {
  const { theme, styles } = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams();
  const { challenges, completeChallenge } = useAppStore();
  const challenge = useMemo(() => challenges.find((item) => item.id === id), [challenges, id]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [proofPhotoOptionsVisible, setProofPhotoOptionsVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [clock, setClock] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (timerStartedAt === null) return undefined;
    const intervalId = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [timerStartedAt]);

  const currentMilliseconds = elapsedMilliseconds + (timerStartedAt === null ? 0 : clock - timerStartedAt);
  const elapsedSeconds = Math.floor(currentMilliseconds / 1000);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Challenge not found</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleChoosePhoto = async () => {
    setProofPhotoOptionsVisible(false);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photos so you can upload proof.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Could not open photos', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    setProofPhotoOptionsVisible(false);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Allow camera access to take a proof photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Could not open camera', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleTimerToggle = () => {
    if (timerStartedAt === null) {
      const startedAt = Date.now();
      setClock(startedAt);
      setTimerStartedAt(startedAt);
      return;
    }
    const pausedAt = Date.now();
    setElapsedMilliseconds((current) => current + pausedAt - timerStartedAt);
    setTimerStartedAt(null);
    setClock(pausedAt);
  };

  const handleTimerReset = () => {
    setTimerStartedAt(null);
    setElapsedMilliseconds(0);
    setClock(Date.now());
  };

  const handleSubmit = async () => {
    if (elapsedSeconds < 1) {
      Alert.alert('Start the timer first', 'Use the challenge timer to record how long you spend before submitting.');
      return;
    }
    if (!selectedImage) {
      Alert.alert('Proof photo required', 'Take or choose a photo to prove you completed this challenge.');
      return;
    }

    const completedAt = Date.now();
    const finalMilliseconds = elapsedMilliseconds + (timerStartedAt === null ? 0 : completedAt - timerStartedAt);
    const durationSeconds = Math.floor(finalMilliseconds / 1000);
    setElapsedMilliseconds(finalMilliseconds);
    setTimerStartedAt(null);
    setClock(completedAt);
    setSubmitting(true);
    try {
      const response = await completeChallenge({
        challengeId: challenge.id,
        proofPhotoUri: selectedImage,
        notes: notes.trim() || undefined,
        durationSeconds,
      });
      if (!response.success) {
        Alert.alert('Unable to finish challenge', response.message);
        return;
      }
      Alert.alert(
        'Challenge completed!',
        `${response.message} Time recorded: ${formatTime(durationSeconds)}.`,
        [{ text: 'View dashboard', onPress: () => router.replace('/') }],
      );
    } catch (error) {
      Alert.alert('Something went wrong', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹  Back</Text>
        </TouchableOpacity>
        <Image source={{ uri: challenge.imageUrl }} style={styles.image} />
        <View style={styles.header}>
          <Text style={styles.label}>Challenge</Text>
          <Text style={styles.title}>{challenge.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaPill, { backgroundColor: `${getCategoryColor(challenge.category)}22` }]}>{challenge.category}</Text>
            <Text style={[styles.metaPill, { backgroundColor: `${getDifficultyColor(challenge.difficulty)}22` }]}>{challenge.difficulty}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What to do</Text>
          <Text style={styles.description}>{challenge.instructions}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{challenge.duration} min goal</Text>
            <Text style={styles.statText}>{challenge.xpReward} XP</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Challenge timer</Text>
          <Text style={styles.timerDisplay} accessibilityLiveRegion="polite">{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.timerHint}>Start when you begin. The recorded time is saved with your completion.</Text>
          <View style={styles.timerActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleTimerToggle}
              disabled={submitting}
              accessibilityLabel={timerStartedAt === null ? 'Start timer' : 'Pause timer'}
            >
              <Text style={styles.primaryButtonText}>{timerStartedAt === null ? (elapsedSeconds ? 'Resume' : 'Start') : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleTimerReset} disabled={submitting}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Proof submission</Text>
          <TouchableOpacity style={styles.photoButton} onPress={() => setProofPhotoOptionsVisible(true)}>
            <Text style={styles.photoButtonText}>{selectedImage ? 'Change photo' : 'Add proof photo'}</Text>
          </TouchableOpacity>
          {selectedImage
            ? <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            : <View style={styles.placeholderBox}><Text style={styles.placeholderText}>No photo selected yet</Text></View>}
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="How did it feel?"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
          />
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Submitting...' : 'Submit challenge'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={proofPhotoOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProofPhotoOptionsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.photoOptions}>
            <Text style={styles.sectionTitle}>Add proof photo</Text>
            <Text style={styles.description}>Take a new photo or choose one from your library.</Text>
            <TouchableOpacity style={styles.photoOptionButton} onPress={handleTakePhoto}>
              <Text style={styles.photoOptionText}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOptionButton} onPress={handleChoosePhoto}>
              <Text style={styles.photoOptionText}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setProofPhotoOptionsVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backButtonText: { color: theme.secondary, fontWeight: '800', fontSize: 15 },
  image: { width: '100%', height: 210, borderRadius: 22 },
  header: { gap: 9 },
  label: { color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', fontSize: 12 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textPrimary },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaPill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, color: theme.textPrimary },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 12, shadowColor: theme.overlay, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary },
  description: { color: theme.textSecondary, lineHeight: 21 },
  statsRow: { flexDirection: 'row', gap: 14 },
  statText: { fontWeight: '800', color: theme.secondary },
  timerDisplay: { color: theme.textPrimary, fontFamily: Typography.bold, fontSize: 42, fontWeight: '800', fontVariant: ['tabular-nums'], textAlign: 'center', paddingVertical: 6 },
  timerHint: { color: theme.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  timerActions: { flexDirection: 'row', gap: 10 },
  primaryButton: { flex: 1, minHeight: 48, justifyContent: 'center', backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  primaryButtonText: { color: theme.textPrimary, fontWeight: '800', fontSize: 15 },
  resetButton: { flex: 1, minHeight: 48, justifyContent: 'center', backgroundColor: theme.surfaceElevated, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  resetButtonText: { color: theme.secondary, fontWeight: '800', fontSize: 15 },
  photoButton: { minHeight: 48, justifyContent: 'center', backgroundColor: theme.surfaceElevated, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  photoButtonText: { color: theme.secondary, fontWeight: '700' },
  previewImage: { width: '100%', height: 180, borderRadius: 16 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#00000099' },
  photoOptions: { gap: 12, padding: 20, backgroundColor: theme.surface, borderRadius: 16 },
  photoOptionButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surfaceElevated, borderRadius: 12, paddingHorizontal: 16 },
  photoOptionText: { color: theme.textPrimary, fontWeight: '700' },
  cancelButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { color: theme.secondary, fontWeight: '700' },
  placeholderBox: { height: 130, borderRadius: 16, backgroundColor: theme.surfaceElevated, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: theme.textSecondary, fontWeight: '600' },
  fieldLabel: { color: theme.textSecondary, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.surfaceElevated, paddingHorizontal: 14, paddingVertical: 12, color: theme.textPrimary, fontFamily: Typography.body, fontSize: 15 },
  textArea: { minHeight: 90, paddingTop: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  emptyStateTitle: { fontSize: 24, fontWeight: '800', color: theme.textPrimary },
});
