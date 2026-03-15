"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser, type AuthUser } from "aws-amplify/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void checkUser();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          void getCurrentUser().then(setUser).catch(() => setUser(null));
          break;
        case "signedOut":
          setUser(null);
          break;
        case "tokenRefresh":
          void getCurrentUser().then(setUser).catch(() => setUser(null));
          break;
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
