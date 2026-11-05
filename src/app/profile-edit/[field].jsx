import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../../components/app-pressable';
import { AppText as Text } from '../../components/app-text';
import { Typography } from '../../constants/theme';
import { CHALLENGE_CATEGORIES, getCategoryColor } from '../../data/challenges';
import { useThemeStyles } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

const fieldTitles = {
  name: 'Edit username',
  categories: 'Edit categories',
};

export default function ProfileEditScreen() {
  const { theme, styles } = useThemeStyles(createStyles);
  const { field: routeField } = useLocalSearchParams();
  const field = Array.isArray(routeField) ? routeField[0] : routeField;
  const { user, updateProfile } = useAppStore();
  const [name, setName] = useState(user?.fullName ?? '');
  const [categories, setCategories] = useState(user?.interests ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await updateProfile({
        fullName: field === 'name' ? name : user.fullName,
        interests: field === 'categories' ? categories : user.interests ?? [],
        profilePictureUri: user.profilePictureUri,
      });
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category) => {
    setCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
    setError('');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.subtitle}>Sign in to edit your profile.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/auth')}>
            <Text style={styles.primaryButtonText}>Go to login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!fieldTitles[field]) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.subtitle}>This profile setting is not available.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backButtonText}>‹  Back to profile</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>Profile settings</Text>
          <Text style={styles.title}>{fieldTitles[field]}</Text>

          {field === 'name' ? (
            <View style={styles.card}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                maxLength={40}
                autoFocus
                style={styles.input}
              />
            </View>
          ) : null}

          {field === 'categories' ? (
            <View style={styles.card}>
              <Text style={styles.subtitle}>Choose at least one category that you want to focus on.</Text>
              <View style={styles.options}>
                {CHALLENGE_CATEGORIES.map((category) => {
                  const selected = categories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleCategory(category)}
                      style={[styles.categoryOption, selected && styles.categorySelected, selected && { borderColor: getCategoryColor(category) }]}
                    >
                      <View style={[styles.marker, selected && styles.markerSelected]}>
                        {selected ? <Text style={styles.check}>✓</Text> : null}
                      </View>
                      <Text style={styles.categoryText}>{category}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={save} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 20, paddingBottom: 36, gap: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12 },
  backButtonText: { color: theme.secondary, fontSize: 16, fontWeight: '800' },
  eyebrow: { color: theme.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.textPrimary, fontSize: 30, fontWeight: '800' },
  subtitle: { color: theme.textSecondary, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 16, elevation: 3 },
  label: { color: theme.textPrimary, fontSize: 15, fontWeight: '800' },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 17, fontFamily: Typography.body, color: theme.textPrimary, backgroundColor: theme.surfaceElevated },
  options: { gap: 10 },
  categoryOption: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 14 },
  categorySelected: { backgroundColor: theme.surfaceElevated, borderColor: theme.primary },
  marker: { width: 22, height: 22, borderWidth: 1, borderColor: theme.border, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  markerSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  check: { color: theme.textPrimary, fontWeight: '800' },
  categoryText: { color: theme.textPrimary, fontSize: 15, fontWeight: '700' },
  error: { color: theme.error, fontSize: 14 },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 15, paddingHorizontal: 20 },
  primaryButtonText: { color: theme.textPrimary, fontWeight: '800' },
});
