import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";

// Firebase configuration — all env vars are optional; Firebase features
// degrade gracefully when credentials are not provided (e.g. production
// where Amplify Cognito is used instead).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

// Lazy-init: Firebase app only initializes once, on first access
let _app: FirebaseApp | undefined;
function getApp(): FirebaseApp {
  if (!_app) {
    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase is not configured — set NEXT_PUBLIC_FIREBASE_* env vars",
      );
    }
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

// Auth can run in Node.js — safe to init eagerly on first import in browser,
// but lazy-init to avoid issues during static page generation.
let _auth: Auth | undefined;
function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (!_auth) {
    if (typeof window !== "undefined") {
      // Use initializeAuth with explicit dependencies to avoid
      // the _getRecaptchaConfig error in Firebase v10+.
      // Falls back to getAuth if auth was already initialized elsewhere.
      try {
        _auth = initializeAuth(getApp(), {
          persistence: browserLocalPersistence,
          popupRedirectResolver: browserPopupRedirectResolver,
        });
      } catch {
        _auth = getAuth(getApp());
      }
    } else {
      _auth = getAuth(getApp());
    }
  }
  return _auth;
}

// Proxy object so `auth.currentUser` etc. works transparently.
// Returns null/undefined for properties when Firebase is not configured.
// Uses realAuth (not proxy) as receiver so internal Firebase methods
// like _getRecaptchaConfig resolve correctly via prototype chain.
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const realAuth = getFirebaseAuth();
    if (!realAuth) {
      // Return safe defaults when Firebase is not configured
      if (prop === "currentUser") return null;
      if (prop === "onAuthStateChanged") {
        return (_cb: (user: User | null) => void) => {
          _cb(null);
          return () => {};
        };
      }
      return undefined;
    }
    const value = Reflect.get(realAuth, prop, realAuth);
    // Bind functions to the real auth instance so `this` works correctly
    if (typeof value === "function") {
      return value.bind(realAuth);
    }
    return value;
  },
});

// Export the real Auth instance getter so callers that need the unwrapped
// auth (e.g. signInWithEmailAndPassword which accesses internal reCAPTCHA
// methods) can bypass the Proxy.
export function getRealAuth(): Auth {
  const real = getFirebaseAuth();
  if (!real) {
    throw new Error(
      "Firebase is not configured — set NEXT_PUBLIC_FIREBASE_* env vars",
    );
  }
  return real;
}

export { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User };

// Messaging requires browser APIs — lazy-load only when called
export async function getMessagingInstance() {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
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
