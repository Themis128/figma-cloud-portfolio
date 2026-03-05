"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "admin_auth";
const VALID_EMAIL = "tbaltzakis@cloudless.com";
const VALID_PASS = "TH!123789th!";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(sessionStorage.getItem(STORAGE_KEY) === "1");
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === VALID_EMAIL && password === VALID_PASS) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}
