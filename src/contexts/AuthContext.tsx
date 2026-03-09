"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return unsubscribe;
    } catch {
      // Firebase not configured (e.g. production uses Amplify Cognito)
      setLoading(false);
      return undefined;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
