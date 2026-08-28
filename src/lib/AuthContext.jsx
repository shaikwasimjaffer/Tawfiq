import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // ============================================================
  // AUTH STATE
  // ============================================================

  const [user, setUser] = useState(null);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [isLoadingAuth, setIsLoadingAuth] =
    useState(true);

  const [isLoadingPublicSettings, setIsLoadingPublicSettings] =
    useState(false);

  const [authError, setAuthError] =
    useState(null);

  // ============================================================
  // AUTH INITIALIZATION
  // ============================================================

  useEffect(() => {
    let mounted = true;

    // ----------------------------------------------------------
    // INITIAL SESSION
    // ----------------------------------------------------------

    async function initializeAuth() {
      try {
        console.log(
          "AUTH: Starting authentication initialization..."
        );

        setIsLoadingAuth(true);
        setAuthError(null);

        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "AUTH: getSession error:",
            error
          );

          if (!mounted) return;

          setUser(null);
          setIsAuthenticated(false);

          setAuthError({
            type: "session_error",
            message:
              "We couldn't load your account.",
          });

          return;
        }

        if (!mounted) return;

        const session = data?.session;
        const currentUser =
          session?.user ?? null;

        console.log(
          "AUTH: Initial session:",
          session
        );

        console.log(
          "AUTH: Initial user:",
          currentUser
        );

        setUser(currentUser);

        setIsAuthenticated(
          !!currentUser
        );

        if (currentUser) {
          setAuthError(null);

          console.log(
            "AUTH: User is authenticated:",
            currentUser.email
          );
        } else {
          console.log(
            "AUTH: No existing session."
          );
        }
      } catch (error) {
        console.error(
          "AUTH: Initialization failed:",
          error
        );

        if (!mounted) return;

        setUser(null);
        setIsAuthenticated(false);

        setAuthError({
          type: "session_error",
          message:
            "We couldn't load your account.",
        });
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    initializeAuth();

    // ==========================================================
    // AUTH STATE LISTENER
    // ==========================================================

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "AUTH EVENT:",
          event
        );

        console.log(
          "AUTH SESSION:",
          session
        );

        if (!mounted) return;

        const currentUser =
          session?.user ?? null;

        // ------------------------------------------------------
        // SIGNED IN
        // ------------------------------------------------------

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          if (currentUser) {
            console.log(
              "AUTH: Authenticated user:",
              currentUser.email
            );

            setUser(currentUser);

            setIsAuthenticated(true);

            setAuthError(null);
          }

          return;
        }

        // ------------------------------------------------------
        // INITIAL SESSION
        // ------------------------------------------------------

        if (event === "INITIAL_SESSION") {
          console.log(
            "AUTH: Initial session event received."
          );

          if (currentUser) {
            setUser(currentUser);

            setIsAuthenticated(true);

            setAuthError(null);
          }

          // IMPORTANT:
          // Do NOT call setIsLoadingAuth(false) here.
          //
          // initializeAuth() is responsible for completing
          // the initial loading state.
          return;
        }

        // ------------------------------------------------------
        // SIGNED OUT
        // ------------------------------------------------------

        if (event === "SIGNED_OUT") {
          console.log(
            "AUTH: User signed out."
          );

          setUser(null);

          setIsAuthenticated(false);

          setAuthError(null);

          return;
        }
      }
    );

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  // ============================================================
  // EMAIL / PASSWORD LOGIN
  // ============================================================

  async function login(email, password) {
    setAuthError(null);

    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(
          "LOGIN ERROR:",
          error
        );

        throw error;
      }

      console.log(
        "LOGIN SUCCESS:",
        data?.user
      );

      return data;
    } catch (error) {
      console.error(
        "LOGIN FAILED:",
        error
      );

      throw error;
    }
  }

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  async function loginWithGoogle() {
    setAuthError(null);

    try {
      console.log(
        "GOOGLE AUTH: Starting Google login..."
      );

      const {
        data,
        error,
      } = await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo:
            `${window.location.origin}/today`,
        },
      });

      if (error) {
        console.error(
          "GOOGLE LOGIN ERROR:",
          error
        );

        setAuthError({
          type: "google_login_error",
          message:
            error.message ||
            "Google login failed.",
        });

        throw error;
      }

      console.log(
        "GOOGLE AUTH: Redirect started.",
        data
      );

      return data;
    } catch (error) {
      console.error(
        "GOOGLE LOGIN FAILED:",
        error
      );

      throw error;
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  async function logout() {
    try {
      const {
        error,
      } = await supabase.auth.signOut();

      if (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );

        throw error;
      }

      setUser(null);

      setIsAuthenticated(false);

      setAuthError(null);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "LOGOUT FAILED:",
        error
      );
    }
  }

  // ============================================================
  // NAVIGATE TO LOGIN
  // ============================================================

  function navigateToLogin() {
    navigate("/login", {
      replace: true,
    });
  }

  // ============================================================
  // CHECK USER AUTH
  // ============================================================

  async function checkUserAuth() {
    try {
      setIsLoadingAuth(true);

      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "CHECK AUTH ERROR:",
          error
        );

        setUser(null);

        setIsAuthenticated(false);

        setAuthError({
          type: "session_error",
          message:
            "We couldn't load your account.",
        });

        return null;
      }

      const session = data?.session;

      const currentUser =
        session?.user ?? null;

      setUser(currentUser);

      setIsAuthenticated(
        !!currentUser
      );

      if (currentUser) {
        setAuthError(null);
      }

      return currentUser;
    } catch (error) {
      console.error(
        "CHECK AUTH FAILED:",
        error
      );

      setUser(null);

      setIsAuthenticated(false);

      setAuthError({
        type: "session_error",
        message:
          "We couldn't load your account.",
      });

      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  }

  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        user,

        isAuthenticated,

        isLoadingAuth,

        isLoadingPublicSettings,

        authError,

        authChecked:
          !isLoadingAuth,

        login,

        loginWithGoogle,

        logout,

        checkUserAuth,

        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH
// ============================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}