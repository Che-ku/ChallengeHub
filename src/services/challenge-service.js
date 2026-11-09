import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { firestoreDb } from '../config/firebase';
import { buildChallengeLibrary, DEFAULT_BADGES, DEFAULT_SEASONS, DEFAULT_TEAM } from '../data/challenges';
export const challengeLibrary = buildChallengeLibrary();
export async function getChallengeLibrary() {
    return challengeLibrary;
}
export async function saveCustomChallenge(userId, challenge) {
    if (!firestoreDb)
        return;
    await setDoc(doc(firestoreDb, 'users', userId, 'customChallenges', challenge.id), {
        ...challenge,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
}
export async function getUserProfile(userId) {
    if (!firestoreDb)
        return null;
    const snapshot = await getDoc(doc(firestoreDb, 'users', userId));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
export async function saveCompletion(userId, completion) {
    if (!firestoreDb)
        return;
    const completionRef = doc(firestoreDb, 'users', userId, 'completions', completion.id);
    await setDoc(completionRef, completion);
}
export async function getWeeklyGoal(userId) {
    if (!firestoreDb) {
        return { id: 'default-week', target: 5, completedCount: 0, weekStartDate: new Date().toISOString(), weekEndDate: new Date().toISOString(), isCompleted: false };
    }
    const snapshot = await getDoc(doc(firestoreDb, 'users', userId, 'weeklyGoals', 'current'));
    if (snapshot.exists()) {
        return snapshot.data();
    }
    const defaultGoal = {
        id: 'current',
        target: 5,
        completedCount: 0,
        weekStartDate: new Date().toISOString(),
        weekEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
    };
    await setDoc(doc(firestoreDb, 'users', userId, 'weeklyGoals', 'current'), defaultGoal);
    return defaultGoal;
}
export async function getBadges(userId) {
    if (!firestoreDb)
        return DEFAULT_BADGES.map((badge) => ({ ...badge, unlockedAt: undefined }));
    const snapshot = await getDocs(collection(firestoreDb, 'users', userId, 'badges'));
    return snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        unlocked: Boolean(docSnapshot.data().unlockedAt),
    }));
}
export async function getCurrentTeam() {
    return DEFAULT_TEAM;
}
export async function getSeasonalChallenges() {
    return DEFAULT_SEASONS;
}
export async function createAchievementBadge(userId, badge) {
    if (!firestoreDb)
        return;
    await setDoc(doc(firestoreDb, 'users', userId, 'badges', badge.id), {
        ...badge,
        unlockedAt: badge.unlockedAt ?? new Date().toISOString(),
        unlocked: true,
    });
}
export async function updateUserProfile(userId, update) {
    if (!firestoreDb)
        return;
    const userRef = doc(firestoreDb, 'users', userId);
    const leaderboardRef = doc(firestoreDb, 'leaderboard', userId);
    const batch = writeBatch(firestoreDb);
    const leaderboardUpdate = { uid: userId, updatedAt: new Date().toISOString() };
    for (const field of ['fullName', 'totalXP', 'currentLevel']) {
        if (update[field] !== undefined)
            leaderboardUpdate[field] = update[field];
    }
    batch.update(userRef, {
        ...update,
        updatedAt: new Date().toISOString(),
    });
    if (Object.keys(leaderboardUpdate).length > 2)
        batch.set(leaderboardRef, leaderboardUpdate, { merge: true });
    await batch.commit();
}
export async function getCompletionHistory(userId) {
    if (!firestoreDb)
        return [];
    const q = query(collection(firestoreDb, 'users', userId, 'completions'), orderBy('completionDate', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function subscribeToLeaderboard(onUpdate, onError) {
    const leaderboardQuery = query(collection(firestoreDb, 'leaderboard'), orderBy('totalXP', 'desc'), limit(50));
    return onSnapshot(
        leaderboardQuery,
        (snapshot) => onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        onError,
    );
}
