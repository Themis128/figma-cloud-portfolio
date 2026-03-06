"use client";

import { useCallback, useState } from "react";
import { auth, signInWithEmailAndPassword, signOut } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminAuth() {
  const { user, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setLoginError(null);
        await signInWithEmailAndPassword(auth, email, password);
        return true;
      } catch (err: unknown) {
        const code =
          err instanceof Error && "code" in err
            ? (err as { code: string }).code
            : "";
        const messages: Record<string, string> = {
          "auth/invalid-credential": "Invalid email or password",
          "auth/user-not-found": "No account found with this email",
          "auth/wrong-password": "Incorrect password",
          "auth/too-many-requests":
            "Too many failed attempts. Please try again later.",
          "auth/user-disabled": "This account has been disabled",
        };
        setLoginError(messages[code] ?? "Login failed. Please try again.");
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
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
