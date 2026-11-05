import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { DEFAULT_BADGES, buildChallengeLibrary, DEFAULT_SEASONS } from '../data/challenges';
import { getTodayKey } from '../services/streak';
import { computeBadgeUnlocks, getStreakStats } from '../services/xp';
const STORAGE_KEY = 'challenge-hub-state-v2';
const ACCOUNTS_KEY = 'challenge-hub-accounts-v1';
const LEGACY_STORAGE_KEY = 'challenge-hub-state-v1';
const AppStoreContext = createContext(undefined);
const challengeLibrary = buildChallengeLibrary();
function chooseDailyChallenge(challenges, history) {
    const knownIds = new Set(challenges.map((challenge) => challenge.id));
    const recentHistory = history.filter((id) => knownIds.has(id));
    let candidates = challenges.filter((challenge) => !recentHistory.includes(challenge.id));
    if (!candidates.length) {
        const lastId = recentHistory.at(-1);
        candidates = challenges.filter((challenge) => challenge.id !== lastId);
        if (!candidates.length)
            candidates = challenges;
        recentHistory.length = 0;
    }
    if (!candidates.length)
        return { id: null, history: recentHistory };
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    return { id: selected.id, history: [...recentHistory, selected.id] };
}
function hasReachedWeeklyGoal(completions, weeklyGoal) {
    const countsByWeek = new Map();
    for (const completion of completions) {
        const date = new Date(completion.completionDate);
        if (Number.isNaN(date.getTime()))
            continue;
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const count = (countsByWeek.get(key) ?? 0) + 1;
        if (count >= weeklyGoal)
            return true;
        countsByWeek.set(key, count);
    }
    return false;
}
function createUser(id, fullName, email) {
    const now = new Date().toISOString();
    return {
        id,
        fullName,
        email,
        interests: [],
        profilePictureUri: null,
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        weeklyGoal: 5,
        notificationPreferences: {
            enabled: true,
            time: '08:00',
            streakReminders: true,
            weeklyGoalReminders: true,
        },
        createdAt: now,
        updatedAt: now,
    };
}
async function passwordMatches(account, password) {
    if (Platform.OS === 'web') {
        if (!account.passwordSalt || !account.passwordDigest)
            return false;
        const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${account.passwordSalt}:${password}`);
        return digest === account.passwordDigest;
    }
    const storedPassword = await SecureStore.getItemAsync(account.credentialKey);
    return storedPassword !== null && storedPassword === password;
}
const initialState = {
    user: null,
    challenges: challengeLibrary,
    completions: [],
    badges: DEFAULT_BADGES.map((badge) => ({ ...badge, unlocked: false })),
    team: null,
    seasonChallenges: DEFAULT_SEASONS,
    onboardingComplete: false,
    dailyChallenge: challengeLibrary[0],
};
export function AppProvider({ children }) {
    const [user, setUser] = useState(initialState.user);
    const [challenges, setChallenges] = useState(initialState.challenges);
    const [completions, setCompletions] = useState(initialState.completions);
    const [badges, setBadges] = useState(initialState.badges);
    const [team] = useState(initialState.team);
    const [seasonChallenges] = useState(initialState.seasonChallenges);
    const [dailyChallengeState, setDailyChallengeState] = useState({ id: null, date: null, history: [] });
    const [onboardingComplete, setOnboardingComplete] = useState(initialState.onboardingComplete);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        const load = async () => {
            try {
                await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw)
                    return;
                const parsed = JSON.parse(raw);
                if (!parsed.isAuthenticated || !parsed.user)
                    return;
                const savedChallenges = (parsed.challenges ?? []).filter((savedChallenge) => (
                        !challengeLibrary.some((challenge) => challenge.id === savedChallenge.id)
                    ));
                const loadedChallenges = [...challengeLibrary, ...savedChallenges];
                setChallenges(loadedChallenges);
                const savedCompletions = parsed.completions ?? [];
                setCompletions(savedCompletions);
                const challengeIds = new Set(loadedChallenges.map((challenge) => challenge.id));
                const dailyChallengeHistory = (parsed.dailyChallengeHistory ?? [])
                    .filter((id) => challengeIds.has(id));
                const savedDailyChallengeId = challengeIds.has(parsed.dailyChallengeId)
                    ? parsed.dailyChallengeId
                    : null;
                if (savedDailyChallengeId && !dailyChallengeHistory.includes(savedDailyChallengeId))
                    dailyChallengeHistory.push(savedDailyChallengeId);
                setDailyChallengeState({
                    id: savedDailyChallengeId,
                    date: parsed.dailyChallengeDate ?? null,
                    history: dailyChallengeHistory,
                });
                const streakStats = getStreakStats(savedCompletions);
                setUser({
                    ...parsed.user,
                    currentStreak: streakStats.current,
                    longestStreak: streakStats.longest,
                });
                const savedBadges = new Map((parsed.badges ?? []).map((badge) => [badge.id, badge]));
                const unlockedIds = new Set(computeBadgeUnlocks(
                    savedCompletions,
                    streakStats.longest,
                    hasReachedWeeklyGoal(savedCompletions, parsed.user.weeklyGoal ?? 5),
                ).map((badge) => badge.id));
                setBadges(DEFAULT_BADGES.map((badge) => {
                    const saved = savedBadges.get(badge.id);
                    const unlocked = unlockedIds.has(badge.id);
                    return {
                        ...badge,
                        unlocked,
                        unlockedAt: unlocked ? saved?.unlockedAt ?? new Date().toISOString() : undefined,
                    };
                }));
                if (parsed.onboardingComplete !== undefined)
                    setOnboardingComplete(parsed.onboardingComplete);
                setIsAuthenticated(true);
            }
            catch (error) {
                console.warn('Failed to load app state', error);
            }
            finally {
                setIsReady(true);
            }
        };
        load();
    }, []);
    useEffect(() => {
        if (!isReady)
            return;
        if (!user || !isAuthenticated) {
            AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
            return;
        }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
            user,
            challenges,
            completions,
            badges,
            dailyChallengeId: dailyChallengeState.id,
            dailyChallengeDate: dailyChallengeState.date,
            dailyChallengeHistory: dailyChallengeState.history,
            onboardingComplete,
            isAuthenticated,
        })).catch(() => undefined);
    }, [isReady, user, challenges, completions, badges, dailyChallengeState, onboardingComplete, isAuthenticated]);
    useEffect(() => {
        if (!isReady || !isAuthenticated)
            return undefined;
        let timer;
        const refreshDailyChallenge = () => {
            const today = getTodayKey();
            setDailyChallengeState((current) => {
                if (current.date === today && challenges.some((challenge) => challenge.id === current.id))
                    return current;
                const next = chooseDailyChallenge(challenges, current.history);
                return { ...next, date: today };
            });
            const now = new Date();
            const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            timer = setTimeout(refreshDailyChallenge, nextMidnight.getTime() - now.getTime() + 50);
        };
        refreshDailyChallenge();
        return () => clearTimeout(timer);
    }, [isReady, isAuthenticated, challenges]);
    const dailyChallenge = useMemo(
        () => challenges.find((challenge) => challenge.id === dailyChallengeState.id) ?? null,
        [challenges, dailyChallengeState.id],
    );
    const login = useCallback(async (email, password) => {
        const identifier = email.trim().toLowerCase();
        if (!identifier || !password) {
            return { success: false, message: 'Enter your email or username and password.' };
        }
        const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        const account = accounts.find((entry) => (entry.user.email === identifier || entry.user.fullName.trim().toLowerCase() === identifier));
        if (!account) {
            return { success: false, message: 'No account exists for these sign-in details. Please register first.' };
        }
        if (!(await passwordMatches(account, password))) {
            return { success: false, message: 'The email or password is incorrect.' };
        }
        setUser(account.user);
        setIsAuthenticated(true);
        return {
            success: true,
            message: 'Signed in successfully.',
            needsOnboarding: !Array.isArray(account.user.interests) || account.user.interests.length === 0,
        };
    }, []);
    const register = useCallback(async (fullName, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || password.length < 6) {
            return { success: false, message: 'Enter your name, a valid email, and a password with at least 6 characters.' };
        }
        const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        const normalizedUsername = fullName.trim().toLowerCase();
        if (accounts.some((entry) => (entry.user.email === normalizedEmail || entry.user.fullName.trim().toLowerCase() === normalizedUsername))) {
            return { success: false, message: 'This email or username is already registered. Please sign in instead.' };
        }
        const emailDigest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, normalizedEmail);
        const credentialKey = `challenge-hub-credential-${emailDigest}`;
        const nextUser = createUser(`user-${emailDigest.slice(0, 16)}`, fullName.trim(), normalizedEmail);
        let account = { user: nextUser, credentialKey };
        if (Platform.OS === 'web') {
            const passwordSalt = Crypto.randomUUID();
            const passwordDigest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${passwordSalt}:${password}`);
            account = { ...account, passwordSalt, passwordDigest };
        }
        else {
            await SecureStore.setItemAsync(credentialKey, password);
        }
        try {
            await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
        }
        catch (error) {
            if (Platform.OS !== 'web') {
                await SecureStore.deleteItemAsync(credentialKey);
            }
            throw error;
        }
        setCompletions([]);
        setBadges(DEFAULT_BADGES.map((badge) => ({ ...badge, unlocked: false })));
        setUser(nextUser);
        setIsAuthenticated(true);
        return { success: true, message: 'Your account is ready.', needsOnboarding: true };
    }, []);
    const updateProfile = useCallback(async ({ fullName, interests, profilePictureUri }) => {
        const normalizedName = fullName.trim();
        const normalizedInterests = [...new Set(interests)];
        if (!normalizedName) {
            return { success: false, message: 'Enter a username.' };
        }
        if (normalizedInterests.length === 0) {
            return { success: false, message: 'Choose at least one category.' };
        }
        if (!user) {
            return { success: false, message: 'Sign in again before updating your profile.' };
        }
        const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        if (accounts.some((entry) => entry.user.id !== user.id && entry.user.fullName.trim().toLowerCase() === normalizedName.toLowerCase())) {
            return { success: false, message: 'That username is already in use.' };
        }
        const nextUser = {
            ...user,
            fullName: normalizedName,
            interests: normalizedInterests,
            profilePictureUri: profilePictureUri ?? user.profilePictureUri ?? null,
            updatedAt: new Date().toISOString(),
        };
        const nextAccounts = accounts.map((entry) => entry.user.id === user.id ? { ...entry, user: nextUser } : entry);
        if (!nextAccounts.some((entry) => entry.user.id === user.id)) {
            return { success: false, message: 'Your account could not be found. Sign in again and retry.' };
        }
        await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
        setUser(nextUser);
        return { success: true, message: 'Profile updated.' };
    }, [user]);
    const completeChallenge = useCallback(async ({ challengeId, proofPhotoUri, notes, durationSeconds, }) => {
        if (!proofPhotoUri) {
            return { success: false, message: 'A proof photo is required before a challenge can be submitted.' };
        }
        if (!Number.isInteger(durationSeconds) || durationSeconds < 1) {
            return { success: false, message: 'Start the challenge timer before submitting your completion.' };
        }
        const challenge = challenges.find((entry) => entry.id === challengeId) ?? challenges[0];
        if (!challenge) {
            return { success: false, message: 'Challenge not found.' };
        }
        const xpEarned = challenge.xpReward;
        const completion = {
            id: `completion-${Date.now()}`,
            challengeId,
            challengeTitle: challenge.title,
            category: challenge.category,
            difficulty: challenge.difficulty,
            proofPhotoUrl: proofPhotoUri,
            notes: notes ?? '',
            duration: durationSeconds / 60,
            durationSeconds,
            xpEarned,
            completionDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };
        const completionDay = getTodayKey(new Date(completion.completionDate));
        const duplicate = completions.some((entry) => (
            entry.challengeId === challengeId && getTodayKey(new Date(entry.completionDate)) === completionDay
        ));
        if (duplicate) {
            return { success: false, message: 'This challenge was already completed today.' };
        }
        const streakStats = getStreakStats([completion, ...completions]);
        const nextCompletions = [completion, ...completions];
        setCompletions(nextCompletions);
        const nextStreak = streakStats.current;
        setUser((currentUser) => {
            if (!currentUser)
                return currentUser;
            const newXP = (currentUser.totalXP || 0) + xpEarned;
            const level = Math.max(1, Math.floor(newXP / 100) + 1);
            return {
                ...currentUser,
                totalXP: newXP,
                currentLevel: level,
                currentStreak: nextStreak,
                longestStreak: streakStats.longest,
                lastCompletionDate: completion.completionDate,
                updatedAt: new Date().toISOString(),
            };
        });
        const newlyUnlocked = new Set(computeBadgeUnlocks(
            nextCompletions,
            streakStats.longest,
            hasReachedWeeklyGoal(nextCompletions, user?.weeklyGoal ?? 5),
        ).map((badge) => badge.id));
        const previousBadges = new Map(badges.map((badge) => [badge.id, badge]));
        const unlockedAt = new Date().toISOString();
        const nextBadges = DEFAULT_BADGES.map((badge) => {
            const previous = previousBadges.get(badge.id);
            const unlocked = newlyUnlocked.has(badge.id);
            return {
                ...badge,
                unlocked,
                unlockedAt: unlocked ? previous?.unlockedAt ?? unlockedAt : undefined,
            };
        });
        setBadges(nextBadges);
        return { success: true, message: 'Challenge completed! XP awarded and proof saved.', xpEarned };
    }, [badges, challenges, completions, user]);
    const equipBadge = useCallback(async (badgeId) => {
        if (badgeId !== null && !badges.some((badge) => badge.id === badgeId && badge.unlocked)) {
            return { success: false, message: 'Unlock this badge before equipping it.' };
        }
        if (!user) {
            return { success: false, message: 'Sign in again before changing your equipped badge.' };
        }
        const nextUser = { ...user, equippedBadgeId: badgeId, updatedAt: new Date().toISOString() };
        const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        const nextAccounts = accounts.map((entry) => entry.user.id === user.id ? { ...entry, user: nextUser } : entry);
        if (!nextAccounts.some((entry) => entry.user.id === user.id)) {
            return { success: false, message: 'Your account could not be found. Sign in again and retry.' };
        }
        await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
        setUser(nextUser);
        return { success: true, message: badgeId ? 'Badge equipped.' : 'Equipped badge removed.' };
    }, [badges, user]);
    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
    }, []);
    const value = useMemo(() => ({
        user,
        challenges,
        completions,
        badges,
        team,
        seasonChallenges,
        onboardingComplete,
        dailyChallenge,
        isReady,
        isAuthenticated,
        login,
        register,
        updateProfile,
        setOnboardingComplete: () => setOnboardingComplete(true),
        completeChallenge,
        equipBadge,
        logout,
    }), [user, challenges, completions, badges, team, seasonChallenges, onboardingComplete, dailyChallenge, isReady, isAuthenticated, completeChallenge, equipBadge, login, register, updateProfile, logout]);
    return _jsx(AppStoreContext.Provider, { value: value, children: children });
}
export function useAppStore() {
    const context = useContext(AppStoreContext);
    if (!context) {
        throw new Error('useAppStore must be used within AppProvider');
    }
    return context;
}
