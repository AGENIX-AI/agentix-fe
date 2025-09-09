import api from "./api";
import type { OAuthProvider } from "../pages/auth/constants/oauth-providers";
import Cookies from "js-cookie";
import axios from "axios";

// Enable credentials with axios (needed for cookies)
api.defaults.withCredentials = true;

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  metadata: {
    avatar_url: string;
    email: string;
    full_name: string;
    picture: string;
  };
}

interface Session {
  provider_token: null;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

interface AuthSessionResponse {
  user: User;
  session: Session;
}

interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MagicLinkOptions {
  email: string;
  callbackURL?: string;
}

interface ErrorResponse {
  code: string;
  message: string;
}

interface WaitlistFormValues {
  role: string;
  field: string;
  business: string;
}

// Simulated auth client for compatibility with provided code
export const authClient = {
  // Method to get user data from an access token
  getUser: async (
    token: string
  ): Promise<{
    data?: { user: User; session?: Session };
    error?: ErrorResponse;
  }> => {
    try {
      // Make an API call to get the user data using the provided token
      const response = await axios.get(
        import.meta.env.VITE_API_URL + "/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        data: response.data,
        error: undefined,
      };
    } catch (err: any) {
      console.error("Error getting user from token:", err);
      return {
        error: {
          code: err.response?.data?.code || "auth/invalid-token",
          message:
            err.response?.data?.message || "Invalid authentication token",
        },
        data: undefined,
      };
    }
  },
  signIn: {
    email: async ({
      email,
      password,
    }: LoginCredentials): Promise<{
      error?: ErrorResponse;
      data?: AuthSessionResponse;
    }> => {
      try {
        // Make a real API call that will set HttpOnly cookies on the response
        const response = await api.post<AuthSessionResponse>(
          "/auth/login-with-email",
          { email, password }
        );

        // Return the data from the response (cookies are automatically handled by the browser)
        return {
          error: undefined,
          data: response.data,
        };
      } catch (err: any) {
        return {
          error: {
            code: err.response?.data?.code || "auth/unknown-error",
            message: err.response?.data?.message || "Login failed",
          },
          data: undefined,
        };
      }
    },

    magicLink: async ({
      email,
      callbackURL,
    }: MagicLinkOptions): Promise<{ error?: ErrorResponse }> => {
      try {
        // Make a real API call to send a magic link
        await api.post("/auth/sign_in_with_otp", {
          email: email,
          redirect_to: callbackURL,
        });
        return { error: undefined };
      } catch (err: any) {
        return {
          error: {
            code: err.response?.data?.code || "auth/magic-link-failed",
            message: err.response?.data?.message || "Failed to send magic link",
          },
        };
      }
    },

    passkey: async (): Promise<void> => {
      // Call a real WebAuthn API endpoint that will set HttpOnly cookies
      await api.post("/auth/passkey");
      // The cookie is set by the server response, no need to store anything locally
    },
  },
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Make a real API call that will set HttpOnly cookies on the response

    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    // Make a real API call that will set HttpOnly cookies on the response
    const response = await api.post<AuthResponse>("/auth/signup", credentials);
    // After signup, ensure default workspace
    // After signup, redirect to onboarding to let user name the workspace (no auto-create)
    window.location.href = "/onboarding/workspace";
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Make a logout API call to clear the HttpOnly cookies
    await api.post("/auth/logout");
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      // Check auth status from server using the HttpOnly cookie
      const accessToken = Cookies.get("agentix_access_token");
      const refreshToken = Cookies.get("agentix_refresh_token");
      const url = import.meta.env.VITE_API_URL + "/auth/me";
      await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  getCurrentUser: async (): Promise<any> => {
    try {
      // Use the configured API instance which should already have the right headers
      // from the AuthContext setup
      const accessToken = Cookies.get("agentix_access_token");
      const refreshToken = Cookies.get("agentix_refresh_token");
      const url = import.meta.env.VITE_API_URL + "/auth/me";
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  ensureDefaultWorkspace: async (userId: string): Promise<void> => {
    const accessToken = Cookies.get("agentix_access_token");
    const refreshToken = Cookies.get("agentix_refresh_token");
    const ensureUrl = `${
      import.meta.env.VITE_API_URL
    }/workspaces/ensure-default`;
    await axios.post(
      ensureUrl,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken,
        },
      }
    );
  },

  socialLogin: async (provider: OAuthProvider): Promise<void> => {
    try {
      // For OAuth, we initiate the flow which will redirect to the provider
      // The OAuth callback endpoint on your server will set the HttpOnly cookie
      // const uri = import.meta.env.VITE_API_URL + `/auth/login/${provider}`;
      // const response = await axios.post(uri, {
      //   provider,
      //   token,
      // });

      // If this returns a URL, we need to redirect to it
      // if (response.data && response.data.url) {
      //   window.location.href = response.data.url;
      // }
      window.location.href =
        import.meta.env.VITE_API_URL + `/auth/login/${provider}`;
    } catch (error) {
      console.error(`Failed to authenticate with ${provider}`, error);
      throw error;
    }
  },

  submitWaitlistForm: async (formData: WaitlistFormValues): Promise<void> => {
    try {
      const accessToken = Cookies.get("agentix_access_token");
      const refreshToken = Cookies.get("agentix_refresh_token");
      const url = import.meta.env.VITE_API_URL + "/auth/submit_waitlist";
      const response = await axios.put(url, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      throw error;
    }
  },
};
