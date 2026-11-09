import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';
import { DEFAULT_BADGES, buildChallengeLibrary, DEFAULT_SEASONS } from '../data/challenges';
import {
    ensureFirebaseUserProfile,
    getFirebaseAuthErrorMessage,
    registerWithFirebase,
    signInWithFirebase,
    signOutFromFirebase,
} from '../services/auth-service';
import { getCompletionHistory, updateUserProfile } from '../services/challenge-service';
import { getTodayKey } from '../services/streak';
import { awardCompletion, computeBadgeUnlocks, getStreakStats } from '../services/xp';
const ACCOUNTS_KEY = 'challenge-hub-accounts-v1';
const LEGACY_STORAGE_KEY = 'challenge-hub-state-v1';
const AppStoreContext = createContext(undefined);
const challengeLibrary = buildChallengeLibrary();
let legacyCredentialCleanup;

function clearLegacyCredentials() {
    if (!legacyCredentialCleanup) {
        legacyCredentialCleanup = (async () => {
            const rawAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
            if (rawAccounts) {
                const accounts = JSON.parse(rawAccounts);
                await Promise.all((Array.isArray(accounts) ? accounts : [])
                    .filter((account) => typeof account.credentialKey === 'string')
                    .map((account) => SecureStore.deleteItemAsync(account.credentialKey)));
            }
            await AsyncStorage.multiRemove([ACCOUNTS_KEY, 'challenge-hub-state-v2', LEGACY_STORAGE_KEY]);
        })();
    }
    return legacyCredentialCleanup;
}

function getBadgesForCompletions(completions, weeklyGoal) {
    const stats = getStreakStats(completions);
    const unlockedIds = new Set(computeBadgeUnlocks(
        completions,
        stats.longest,
        hasReachedWeeklyGoal(completions, weeklyGoal),
    ).map((badge) => badge.id));
    return DEFAULT_BADGES.map((badge) => ({
        ...badge,
        unlocked: unlockedIds.has(badge.id),
    }));
}
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
    const [challenges] = useState(initialState.challenges);
    const [completions, setCompletions] = useState(initialState.completions);
    const [badges, setBadges] = useState(initialState.badges);
    const [team] = useState(initialState.team);
    const [seasonChallenges] = useState(initialState.seasonChallenges);
    const [dailyChallengeState, setDailyChallengeState] = useState({ id: null, date: null, history: [] });
    const [onboardingComplete, setOnboardingComplete] = useState(initialState.onboardingComplete);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState('');
    const hydrateFirebaseAccount = useCallback(async (authUser) => {
        const profile = await ensureFirebaseUserProfile(authUser);
        const savedCompletions = await getCompletionHistory(authUser.uid);
        if (firebaseAuth.currentUser?.uid !== authUser.uid)
            return null;
        const streakStats = getStreakStats(savedCompletions);
        setUser({
            ...profile,
            id: authUser.uid,
            email: authUser.email,
            currentStreak: streakStats.current,
            longestStreak: streakStats.longest,
        });
        setCompletions(savedCompletions);
        setBadges(getBadgesForCompletions(savedCompletions, profile.weeklyGoal ?? 5));
        setOnboardingComplete(Boolean(profile.interests?.length));
        setIsAuthenticated(true);
        return profile;
    }, []);
    useEffect(() => {
        let mounted = true;
        if (!firebaseAuth) {
            clearLegacyCredentials().then(() => {
                if (!mounted)
                    return;
                setAuthError('Firebase is not configured. Add your Firebase web app settings to the project .env file and restart Expo.');
                setIsReady(true);
            }).catch((error) => {
                console.error('Failed to clear legacy local credentials', error);
                if (mounted) {
                    setAuthError(getFirebaseAuthErrorMessage(error));
                    setIsReady(true);
                }
            });
            return () => {
                mounted = false;
            };
        }
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
            try {
                await clearLegacyCredentials();
                if (!authUser) {
                    setUser(null);
                    setCompletions([]);
                    setBadges(initialState.badges);
                    setIsAuthenticated(false);
                    setAuthError('');
                    return;
                }
                await hydrateFirebaseAccount(authUser);
                setAuthError('');
            }
            catch (error) {
                console.error('Failed to load the Firebase account', error);
                if (!authUser || firebaseAuth.currentUser?.uid === authUser.uid) {
                    setUser(null);
                    setIsAuthenticated(false);
                    setAuthError(getFirebaseAuthErrorMessage(error));
                }
            }
            finally {
                if (mounted)
                    setIsReady(true);
            }
        });
        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [hydrateFirebaseAccount]);
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
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
            return { success: false, message: 'Enter your email and password.' };
        }
        setAuthError('');
        try {
            const credential = await signInWithFirebase(normalizedEmail, password);
            const profile = await hydrateFirebaseAccount(credential.user);
            if (!profile)
                return { success: false, message: 'Your sign-in changed. Please try again.' };
            return {
                success: true,
                message: 'Signed in successfully.',
                needsOnboarding: !Array.isArray(profile.interests) || profile.interests.length === 0,
            };
        } catch (error) {
            return { success: false, message: getFirebaseAuthErrorMessage(error) };
        }
    }, [hydrateFirebaseAccount]);
    const register = useCallback(async (fullName, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = fullName.trim();
        if (!normalizedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || password.length < 6) {
            return { success: false, message: 'Enter your name, a valid email, and a password with at least 6 characters.' };
        }
        setAuthError('');
        try {
            const profile = await registerWithFirebase(normalizedName, normalizedEmail, password);
            const authUser = firebaseAuth.currentUser;
            if (authUser) {
                await hydrateFirebaseAccount(authUser);
            } else {
                setUser(profile);
                setCompletions([]);
                setBadges(initialState.badges);
                setOnboardingComplete(false);
                setIsAuthenticated(true);
            }
            return { success: true, message: 'Your account is ready.', needsOnboarding: true };
        }
        catch (error) {
            return { success: false, message: getFirebaseAuthErrorMessage(error) };
        }
    }, [hydrateFirebaseAccount]);
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
        const nextUser = {
            ...user,
            fullName: normalizedName,
            interests: normalizedInterests,
            profilePictureUri: profilePictureUri ?? user.profilePictureUri ?? null,
            updatedAt: new Date().toISOString(),
        };
        await updateUserProfile(user.id, {
            fullName: nextUser.fullName,
            interests: nextUser.interests,
            profilePictureUri: nextUser.profilePictureUri,
            updatedAt: nextUser.updatedAt,
        });
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
        if (!user) {
            return { success: false, message: 'Sign in again before completing a challenge.' };
        }
        const xpEarned = challenge.xpReward;
        const completionDate = new Date().toISOString();
        const completionDay = getTodayKey(new Date(completionDate));
        const completion = {
            id: `completion-${encodeURIComponent(challengeId)}-${completionDay}`,
            challengeId,
            challengeTitle: challenge.title,
            category: challenge.category,
            difficulty: challenge.difficulty,
            proofPhotoUrl: proofPhotoUri,
            notes: notes ?? '',
            duration: durationSeconds / 60,
            durationSeconds,
            xpEarned,
            completionDate,
            createdAt: new Date().toISOString(),
        };
        const duplicate = completions.some((entry) => (
            entry.challengeId === challengeId && getTodayKey(new Date(entry.completionDate)) === completionDay
        ));
        if (duplicate) {
            return { success: false, message: 'This challenge was already completed today.' };
        }
        const scoreUpdate = await awardCompletion(user, completion);
        if (scoreUpdate.duplicate) {
            return { success: false, message: 'This challenge was already completed today.' };
        }
        const streakStats = getStreakStats([completion, ...completions]);
        const nextCompletions = [completion, ...completions];
        setCompletions(nextCompletions);
        setUser({
            ...user,
            totalXP: scoreUpdate.totalXP,
            currentLevel: scoreUpdate.currentLevel,
            currentStreak: streakStats.current,
            longestStreak: streakStats.longest,
            lastCompletionDate: completion.completionDate,
            updatedAt: new Date().toISOString(),
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
        return { success: true, message: 'Challenge completed! XP and leaderboard updated.', xpEarned };
    }, [badges, challenges, completions, user]);
    const equipBadge = useCallback(async (badgeId) => {
        if (badgeId !== null && !badges.some((badge) => badge.id === badgeId && badge.unlocked)) {
            return { success: false, message: 'Unlock this badge before equipping it.' };
        }
        if (!user) {
            return { success: false, message: 'Sign in again before changing your equipped badge.' };
        }
        const nextUser = { ...user, equippedBadgeId: badgeId, updatedAt: new Date().toISOString() };
        await updateUserProfile(user.id, { equippedBadgeId: badgeId });
        setUser(nextUser);
        return { success: true, message: badgeId ? 'Badge equipped.' : 'Equipped badge removed.' };
    }, [badges, user]);
    const logout = useCallback(async () => {
        await signOutFromFirebase();
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
        authError,
        login,
        register,
        updateProfile,
        setOnboardingComplete: () => setOnboardingComplete(true),
        completeChallenge,
        equipBadge,
        logout,
    }), [user, challenges, completions, badges, team, seasonChallenges, onboardingComplete, dailyChallenge, isReady, isAuthenticated, authError, completeChallenge, equipBadge, login, register, updateProfile, logout]);
    return _jsx(AppStoreContext.Provider, { value: value, children: children });
}
export function useAppStore() {
    const context = useContext(AppStoreContext);
    if (!context) {
        throw new Error('useAppStore must be used within AppProvider');
    }
    return context;
}
