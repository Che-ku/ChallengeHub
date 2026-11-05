import { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../components/app-pressable';
import { AppText as Text } from '../components/app-text';
import { CHALLENGE_CATEGORIES, getCategoryColor } from '../data/challenges';
import { useThemeStyles } from '../hooks/use-theme';
import { useAppStore } from '../store/app-store';

export default function OnboardingScreen() {
  const { styles } = useThemeStyles(createStyles);
  const { user, updateProfile } = useAppStore();
  const [selected, setSelected] = useState(user?.interests ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleCategory = (category) => {
    setError('');
    setSelected((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  };

  const continueToApp = async () => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!selected.length) {
      setError('Choose at least one category to continue.');
      return;
    }
    setSaving(true);
    try {
      const result = await updateProfile({
        fullName: user.fullName,
        interests: selected,
      });
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.replace('/');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your categories. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Personalize your challenges</Text>
        <Text style={styles.title}>What would you like to work on?</Text>
        <Text style={styles.subtitle}>Choose one or more categories. You can change these anytime in your profile.</Text>
        <View style={styles.options}>
          {CHALLENGE_CATEGORIES.map((category) => {
            const active = selected.includes(category);
            return (
              <TouchableOpacity
                key={category}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                onPress={() => toggleCategory(category)}
                style={[styles.option, active && styles.optionSelected, { borderColor: getCategoryColor(category) }]}
              >
                <View style={[styles.marker, active && { backgroundColor: getCategoryColor(category) }]}>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </View>
                <Text style={styles.optionText}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={continueToApp} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Continue'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  eyebrow: { color: theme.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.textPrimary, fontSize: 30, fontWeight: '800', lineHeight: 36 },
  subtitle: { color: theme.textSecondary, fontSize: 15, lineHeight: 22 },
  options: { gap: 10, marginTop: 8 },
  option: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, backgroundColor: theme.surface },
  optionSelected: { backgroundColor: theme.surfaceElevated },
  marker: { width: 22, height: 22, borderWidth: 1, borderColor: theme.border, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  check: { color: theme.textPrimary, fontWeight: '800' },
  optionText: { color: theme.textPrimary, fontSize: 16, fontWeight: '700' },
  error: { color: theme.error, fontSize: 14 },
  button: { marginTop: 4, minHeight: 48, paddingVertical: 16, alignItems: 'center', backgroundColor: theme.primary, borderRadius: 12 },
  buttonText: { color: theme.textPrimary, fontWeight: '800', fontSize: 16 },
});
