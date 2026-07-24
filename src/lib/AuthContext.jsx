import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AUTH EVENT:", _event);
      console.log("SESSION:", session);

      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function initializeAuth() {
    setIsLoadingAuth(true);

    let {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error(error);
        setIsLoadingAuth(false);
        return;
      }

      session = data.session;
    }

    console.log("SESSION:", session);
    console.log("USER:", session?.user);

    setUser(session?.user ?? null);
    setIsAuthenticated(!!session?.user);
    setIsLoadingAuth(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authChecked: !isLoadingAuth,
        logout,
        checkUserAuth: initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
