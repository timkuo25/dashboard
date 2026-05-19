"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = { isAdmin: boolean };

const AuthContext = createContext<AuthContextValue>({ isAdmin: false });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then(({ isAdmin }: { isAdmin: boolean }) => setIsAdmin(isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  return <AuthContext.Provider value={{ isAdmin }}>{children}</AuthContext.Provider>;
}
