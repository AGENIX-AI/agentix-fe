import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import Cookies from "js-cookie";
import { authService } from "@/services/auth";

interface Metadata {
  avatar_url: string;
  email: string;
  full_name: string;
  picture: string;
}
// Define types for auth response
interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  metadata: Metadata;
}

interface Session {
  provider_token: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (authResponse: { user: User; session: Session }) => void;
  signOut: () => Promise<void>;
  getUser: () => User | null;
  getSession: () => Session | null;
  refreshAuth: () => Promise<void>;
  reloadAuth: () => Promise<void>;
  userInfo: User | null;
  needsApproval: boolean;
  needsWaitlistForm: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    loading: true,
  });

  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [needsWaitlistForm, setNeedsWaitlistForm] = useState<boolean>(false);

  // Helper function to update API headers with token
  const updateApiAuthHeader = (token: string | null) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Check authentication status from server
  const checkAuthStatus = async () => {
    try {
      // First try to use the current token to get user info
      const response = await authService.getCurrentUser();
      console.log("Auth response:", response);

      if (response && response.user) {
        // If successful, save tokens in cookies (if session exists)
        if (response.session) {
          saveTokenToCookies(response.session);
        }

        setNeedsApproval(false);
        setNeedsWaitlistForm(false);
        setAuthState({
          user: response.user,
          session: response.session || null,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        // If no user returned, try to refresh tokens
        const { refreshToken } = getTokensFromCookies();
        if (refreshToken) {
          // We have refresh token, try to refresh
          refreshAuth();
        } else {
          setNeedsApproval(false);
          setAuthState({
            user: null,
            session: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      }
    } catch (error: any) {
      console.error("Failed to check auth status", error);
      // Check if user needs to fill in waitlist form
      if (
        error?.response?.data?.detail === "Please fill in the waitlist form"
      ) {
        console.log("User needs to fill in waitlist form");
        setNeedsWaitlistForm(true);
        setNeedsApproval(false);
        // Keep the tokens so user remains in a logged-in state, but redirect to waitlist form
        setAuthState({
          user: null,
          session: null,
          isAuthenticated: true, // Keep as true so they don't get redirected to login
          loading: false,
        });
        return;
      }

      // Check if this is a "not approved yet" error
      if (
        error?.response?.data?.detail ===
        "You are not approved yet, please wait for approval"
      ) {
        console.log("User needs approval");
        setNeedsApproval(true);
        // Keep the tokens so user remains in a logged-in state, but redirect to waitlist
        setAuthState({
          user: null,
          session: null,
          isAuthenticated: true, // Keep as true so they don't get redirected to login
          loading: false,
        });
        // Redirect will be handled by the component using this context
        return;
      }

      clearTokenCookies();
      setNeedsApproval(false);
      setNeedsWaitlistForm(false);
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  // Cookie helper functions
  const saveTokenToCookies = (session: Session) => {
    // Set cookies with appropriate expiry
    const expiryDate = new Date(session.expires_at * 1000); // Convert seconds to milliseconds

    // Only store access_token and refresh_token
    Cookies.set("edvara_access_token", session.access_token, {
      expires: expiryDate,
      secure: true,
      sameSite: "strict",
    });
    Cookies.set("edvara_refresh_token", session.refresh_token, {
      expires: 30,
      secure: true,
      sameSite: "strict",
    }); // 30 days for refresh token
  };

  const getTokensFromCookies = () => {
    const accessToken = Cookies.get("edvara_access_token");
    const refreshToken = Cookies.get("edvara_refresh_token");
    return { accessToken, refreshToken };
  };

  const clearTokenCookies = () => {
    console.log("Clearing cookies");
    Cookies.remove("edvara_access_token");
    Cookies.remove("edvara_refresh_token");
  };

  // Check authentication status on component mount, but only once
  useEffect(() => {
    // Check if we have tokens in cookies
    const { accessToken, refreshToken } = getTokensFromCookies();

    if (accessToken && refreshToken) {
      try {
        // Try to validate token by checking auth status
        // Set authorization header with the token
        updateApiAuthHeader(accessToken);
        // Call checkAuthStatus to get user data
        checkAuthStatus();
      } catch (error) {
        console.error("Failed to validate token", error);
        clearTokenCookies();
        // If token validation fails, then check auth status
        checkAuthStatus();
      }
    } else {
      // Only check server auth status if we don't have tokens
      checkAuthStatus();
    }
  }, []);

  const signIn = (authResponse: { user: User; session: Session }) => {
    const { user, session } = authResponse;

    // Store tokens in cookies
    saveTokenToCookies(session);

    // Only store tokens in cookies, not user info

    // Update state
    setAuthState({
      user,
      session,
      isAuthenticated: true,
      loading: false,
    });

    // Update API headers with the new token
    updateApiAuthHeader(session.access_token);
  };

  const signOut = async () => {
    try {
      // Call logout endpoint to clear server-side session
      // await api.post("/auth/logout");
      Cookies.remove("edvara_access_token");
      Cookies.remove("edvara_refresh_token");
      api.defaults.headers.common["Authorization"] = "";
      api.defaults.headers.common["X-Refresh-Token"] = "";
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear cookies
      clearTokenCookies();

      // Clear authorization header
      updateApiAuthHeader(null);

      // Reset state
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  // Refresh authentication from server
  const refreshAuth = async () => {
    try {
      // Try to use refresh token if available
      const { refreshToken } = getTokensFromCookies();

      if (refreshToken) {
        const response = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });
        if (response.data && response.data.session) {
          const { user, session } = response.data;
          signIn({ user, session });
          return;
        }
      }
    } catch (error) {
      console.error("Failed to refresh token", error);
      // Clear cookies on refresh failure
      clearTokenCookies();
    }

    // Fall back to checking auth status if refresh token is invalid or missing
    await checkAuthStatus();
  };

  const getUser = () => {
    return authState.user;
  };

  const getSession = () => {
    return authState.session;
  };

  const reloadAuth = async () => {
    await checkAuthStatus();
  };

  const value = {
    ...authState,
    signIn,
    signOut,
    getUser,
    getSession,
    refreshAuth,
    reloadAuth,
    userInfo: authState.user,
    needsApproval,
    needsWaitlistForm,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
