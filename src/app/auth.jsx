import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { login, register } = useAppStore();
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
                if (result.message.startsWith('No account exists')) {
                    setMode('register');
                }
                else if (result.message.startsWith('This email or username is already registered')) {
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
    return (_jsx(SafeAreaView, { style: styles.safeArea, children: _jsx(KeyboardAvoidingView, { behavior: Platform.OS === 'ios' ? 'padding' : undefined, style: styles.container, children: _jsxs(View, { style: styles.card, children: [_jsx(Text, { style: styles.eyebrow, children: "Challenge Hub" }), _jsx(Text, { style: styles.title, children: mode === 'login' ? 'Welcome back' : 'Create your account' }), _jsx(Text, { style: styles.subtitle, children: mode === 'login'
                            ? 'Log in to continue your streak and track your progress.'
                            : 'Start your habit streak and unlock new challenges.' }), mode === 'register' && (                            _jsx(TextInput, { value: fullName, onChangeText: setFullName, placeholder: "Username", placeholderTextColor: theme.textSecondary, autoCapitalize: "words", style: styles.input })), _jsx(TextInput, { value: email, onChangeText: setEmail, placeholder: mode === 'login' ? 'Email or username' : 'Email', placeholderTextColor: theme.textSecondary, keyboardType: "email-address", autoCapitalize: "none", style: styles.input }), _jsx(TextInput, { value: password, onChangeText: setPassword, placeholder: "Password", placeholderTextColor: theme.textSecondary, secureTextEntry: true, style: styles.input }), _jsx(TouchableOpacity, { style: styles.primaryButton, onPress: handleSubmit, disabled: loading, children: _jsx(Text, { style: styles.primaryButtonText, children: loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account' }) }), formError ? _jsx(Text, { style: styles.errorText, children: formError }) : null, _jsx(TouchableOpacity, { onPress: () => {
                            setFormError('');
                            setMode(mode === 'login' ? 'register' : 'login');
                        }, children: _jsx(Text, { style: styles.toggleText, children: mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in' }) })] }) }) }));
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
