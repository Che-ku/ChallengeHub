import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { ensureFirebaseConfigured, firebaseAuth, firestoreDb } from '../config/firebase';

function createProfile(authUser, fullName) {
    const now = new Date().toISOString();
    return {
        id: authUser.uid,
        fullName,
        email: authUser.email,
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

function requireFirebaseConfig() {
    if (!ensureFirebaseConfigured()) {
        throw new Error('Firebase is not configured. Add your Firebase web app settings to the project .env file and restart Expo.');
    }
}

export async function registerWithFirebase(fullName, email, password) {
    requireFirebaseConfig();
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const normalizedName = fullName.trim();
    const profile = createProfile(credential.user, normalizedName);
    const batch = writeBatch(firestoreDb);
    batch.set(doc(firestoreDb, 'users', credential.user.uid), profile);
    batch.set(doc(firestoreDb, 'leaderboard', credential.user.uid), {
        uid: credential.user.uid,
        fullName: normalizedName,
        totalXP: 0,
        currentLevel: 1,
        updatedAt: profile.updatedAt,
    });
    await batch.commit();
    return profile;
}

export async function signInWithFirebase(email, password) {
    requireFirebaseConfig();
    return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function ensureFirebaseUserProfile(authUser) {
    requireFirebaseConfig();
    const userRef = doc(firestoreDb, 'users', authUser.uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
        const profile = { id: snapshot.id, ...snapshot.data() };
        const leaderboardRef = doc(firestoreDb, 'leaderboard', authUser.uid);
        const leaderboardSnapshot = await getDoc(leaderboardRef);
        if (!leaderboardSnapshot.exists()) {
            const batch = writeBatch(firestoreDb);
            batch.set(leaderboardRef, {
                uid: authUser.uid,
                fullName: profile.fullName,
                totalXP: Number(profile.totalXP ?? 0),
                currentLevel: Number(profile.currentLevel ?? 1),
                updatedAt: new Date().toISOString(),
            });
            await batch.commit();
        }
        return profile;
    }

    const profile = createProfile(authUser, authUser.displayName || authUser.email?.split('@')[0] || 'Player');
    const batch = writeBatch(firestoreDb);
    batch.set(userRef, profile);
    batch.set(doc(firestoreDb, 'leaderboard', authUser.uid), {
        uid: authUser.uid,
        fullName: profile.fullName,
        totalXP: 0,
        currentLevel: 1,
        updatedAt: profile.updatedAt,
    });
    await batch.commit();
    return profile;
}

export async function signOutFromFirebase() {
    await signOut(firebaseAuth);
}

export function getFirebaseAuthErrorMessage(error) {
    switch (error?.code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Log in instead.';
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'The email or password is incorrect.';
        case 'auth/invalid-email':
            return 'Enter a valid email address.';
        case 'auth/weak-password':
            return 'Choose a password with at least 6 characters.';
        case 'auth/network-request-failed':
            return 'Could not connect to Firebase. Check your internet connection and try again.';
        case 'permission-denied':
        case 'firestore/permission-denied':
            return 'Firebase denied access. Check that the deployed Firestore rules allow signed-in users.';
        default:
            return error instanceof Error ? error.message : 'Firebase sign-in failed. Please try again.';
    }
}
