import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Lazy-init: Firebase app only initializes once, on first access
let _app: FirebaseApp | undefined;
function getApp(): FirebaseApp {
  if (!_app) {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

// Auth can run in Node.js — safe to init eagerly on first import in browser,
// but lazy-init to avoid issues during static page generation.
let _auth: Auth | undefined;
function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getApp());
  }
  return _auth;
}

// Proxy object so `auth.currentUser` etc. works transparently
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirebaseAuth(), prop, receiver);
  },
});

export { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User };

// Messaging requires browser APIs — lazy-load only when called
export async function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  const { getMessaging } = await import("firebase/messaging");
  return getMessaging(getApp());
}

export async function getFCMToken(vapidKey?: string) {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;
  const { getToken } = await import("firebase/messaging");
  const resolvedKey = vapidKey ?? process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  return getToken(
    messaging,
    resolvedKey !== undefined ? { vapidKey: resolvedKey } : {},
  );
}

export function onMessageListener() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return;
    void getMessagingInstance().then((messaging) => {
      if (!messaging) return;
      void import("firebase/messaging").then(({ onMessage }) => {
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      });
    });
  });
}

export { getApp as getFirebaseApp };
