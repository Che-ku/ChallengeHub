import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppPressable as TouchableOpacity } from '../components/app-pressable';
import { AppText as Text } from '../components/app-text';
import { Typography } from '../constants/theme';
import { useThemeStyles } from '../hooks/use-theme';
import { useAppStore } from '../store/app-store';
export default function AuthScreen() {
    const { theme, styles } = useThemeStyles(createStyles);
    const { login, register, authError } = useAppStore();
    const [mode, setMode] = useState('login');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const handleSubmit = async () => {
        setFormError('');
        if (!email.trim() || !password.trim()) {
            setFormError('Please enter your email and password.');
            return;
        }
        if (mode === 'register' && !fullName.trim()) {
            setFormError('Please enter your name to create an account.');
            return;
        }
        setLoading(true);
        try {
            const result = mode === 'login'
                ? await login(email.trim(), password)
                : await register(fullName.trim(), email.trim(), password);
            if (!result.success) {
                setFormError(result.message);
                if (result.message.startsWith('This email is already registered')) {
                    setMode('login');
                }
                return;
            }
            router.replace(result.needsOnboarding ? '/onboarding' : '/');
        }
        catch (error) {
            Alert.alert('Something went wrong', error instanceof Error ? error.message : 'Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Challenge Hub</Text>
            <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Log in to continue your streak and track your progress.'
                : 'Start your habit streak and unlock new challenges.'}
            </Text>
            {mode === 'register' && (
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Username"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                style={styles.input}
              />
            )}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              style={styles.input}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.primaryButtonText}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
              </Text>
            </TouchableOpacity>
            {formError || authError ? (
              <Text style={styles.errorText}>{formError || authError}</Text>
            ) : null}
            <TouchableOpacity
              onPress={() => {
                setFormError('');
                setMode(mode === 'login' ? 'register' : 'login');
              }}
            >
              <Text style={styles.toggleText}>
                {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
const createStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 24,
        shadowColor: theme.overlay,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
        gap: 16,
    },
    eyebrow: {
        color: theme.primaryLight,
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.textPrimary,
    },
    subtitle: {
        color: theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    errorText: {
        color: theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: Typography.body,
        backgroundColor: theme.surfaceElevated,
        color: theme.textPrimary,
    },
    primaryButton: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        minHeight: 48,
        justifyContent: 'center',
        paddingVertical: 15,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: theme.textPrimary,
        fontSize: 16,
        fontWeight: '800',
    },
    toggleText: {
        textAlign: 'center',
        color: theme.primaryLight,
        fontWeight: '700',
        marginTop: 6,
    },
});
