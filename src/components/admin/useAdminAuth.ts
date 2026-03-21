"use client";

import { signIn, signOut } from "aws-amplify/auth";
import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminAuth() {
  const { user, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setLoginError(null);

        const AUTH_TIMEOUT_MS = 10000;
        // Clear any stale Amplify auth session before attempting login.
        // A previous failed SRP attempt can leave cached state that
        // causes subsequent USER_PASSWORD_AUTH calls to fail.
        try {
          await signOut();
        } catch {
          // Ignore — no session to clear
        }
        // Use USER_PASSWORD_AUTH instead of default SRP.
        // SRP breaks when passwords are set via admin-set-user-password.
        const authPromise = signIn({
          username: email,
          password,
          options: { authFlowType: "USER_PASSWORD_AUTH" },
        });
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          setTimeout(
            () => reject(new Error("Authentication timed out. Please try again.")),
            AUTH_TIMEOUT_MS,
          );
        });

        const result = await Promise.race([authPromise, timeoutPromise]);
        if (result.isSignedIn) {
          return true;
        }

        // Handle challenges (e.g., NEW_PASSWORD_REQUIRED)
        if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
          setLoginError("Account not confirmed. Please check your email.");
        } else if (result.nextStep?.signInStep) {
          setLoginError(`Additional step required: ${result.nextStep.signInStep}`);
        }
        return false;
      } catch (err: unknown) {
        const name =
          err instanceof Error && "name" in err ? err.name : "";
        const errMsg = err instanceof Error ? err.message : "";
        const messages: Record<string, string> = {
          NotAuthorizedException: "Invalid email or password",
          UserNotFoundException: "No account found with this email",
          UserNotConfirmedException: "Account not confirmed. Please check your email.",
          LimitExceededException:
            "Too many failed attempts. Please try again later.",
          InvalidParameterException: "Invalid email format",
        };

        setLoginError(
          messages[name] ?? (errMsg || "Login failed. Please try again."),
        );
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut();
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
