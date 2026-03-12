"use client";

import { useCallback, useState } from "react";
import { getRealAuth, signInWithEmailAndPassword, signOut } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminAuth() {
  const { user, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setLoginError(null);

        const AUTH_TIMEOUT_MS = 10000;
        const realAuth = getRealAuth();
        const authPromise = signInWithEmailAndPassword(realAuth, email, password);
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          setTimeout(
            () => reject(new Error("Authentication timed out. Please try again.")),
            AUTH_TIMEOUT_MS,
          );
        });

        await Promise.race([authPromise, timeoutPromise]);
        return true;
      } catch (err: unknown) {
        const code =
          err instanceof Error && "code" in err
            ? (err as { code: string }).code
            : "";
        const errMsg = err instanceof Error ? err.message : "";
        const messages: Record<string, string> = {
          "auth/invalid-credential": "Invalid email or password",
          "auth/user-not-found": "No account found with this email",
          "auth/wrong-password": "Incorrect password",
          "auth/too-many-requests":
            "Too many failed attempts. Please try again later.",
          "auth/user-disabled": "This account has been disabled",
          "auth/network-request-failed":
            "Network error. Please check your connection.",
          "auth/operation-not-allowed":
            "Email/password sign-in is not enabled. Enable it in Firebase Console.",
        };

        // Handle reCAPTCHA config error (Firebase Email Enumeration Protection)
        const isRecaptchaError = errMsg.includes("_getRecaptchaConfig");
        if (isRecaptchaError) {
          setLoginError(
            "Firebase reCAPTCHA not configured. Disable Email Enumeration Protection in Firebase Console → Authentication → Settings.",
          );
        } else {
          setLoginError(
            messages[code] ??
              (errMsg || "Login failed. Please try again."),
          );
        }
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(getRealAuth());
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
    login,
    logout,
    loginError,
  };
}
