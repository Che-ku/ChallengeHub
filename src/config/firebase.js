import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'challengehub-demo.firebaseapp.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'challengehub-demo',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'challengehub-demo.appspot.com',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:demo-app-id',
};
let app = null;
let auth = null;
let db = null;
let storage = null;
export function ensureFirebaseConfigured() {
    return Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
}
export function initializeFirebase() {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    }
    else {
        app = getApps()[0];
    }
    auth = auth ?? getAuth(app);
    db = db ?? getFirestore(app);
    storage = storage ?? getStorage(app);
    return { app, auth, db, storage };
}
export const firebase = initializeFirebase();
export const firebaseAuth = firebase.auth;
export const firestoreDb = firebase.db;
export const firebaseStorage = firebase.storage;
