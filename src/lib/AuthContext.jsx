import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  /**
   * Check the current Supabase session.
   */
  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setAuthChecked(true);
    } catch (error) {
      console.error("Supabase auth check failed:", error);

      setUser(null);
      setIsAuthenticated(false);
      setAuthError({
        type: "auth_error",
        message: error.message || "Authentication check failed",
      });
      setAuthChecked(true);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  /**
   * Check authentication when the application starts.
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoadingAuth(true);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }

        setAuthChecked(true);
      } catch (error) {
        console.error("Supabase initialization failed:", error);

        if (!mounted) return;

        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "auth_error",
          message: error.message || "Failed to initialize authentication",
        });
        setAuthChecked(true);
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    initializeAuth();

    /**
     * Listen for Supabase authentication changes:
     *
     * SIGNED_IN
     * SIGNED_OUT
     * TOKEN_REFRESHED
     * USER_UPDATED
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setAuthChecked(true);
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Compatibility function.
   *
   * Some existing components call checkAppState().
   * We no longer need Base44 public settings,
   * because authentication is handled by Supabase.
   */
  const checkAppState = useCallback(async () => {
    setIsLoadingPublicSettings(false);
    return true;
  }, []);

  /**
   * Log out from Supabase.
   */
  const logout = async (shouldRedirect = true) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);

      if (shouldRedirect) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);

      setAuthError({
        type: "logout_error",
        message: error.message || "Logout failed",
      });
    }
  };

  /**
   * Navigate to our own login page.
   */
  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
