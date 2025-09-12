import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import Cookies from "js-cookie";

const OAuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { reloadAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for tokens in both hash and query parameters
        let accessToken = null;
        let refreshToken = null;

        // Get the hash fragment from the URL (without the '#' character)
        const hash = window.location.hash.substring(1);

        // Check URL hash first
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get("access_token");
          refreshToken = hashParams.get("refresh_token");
        }

        // If no tokens found in hash, check query parameters
        if (!accessToken) {
          const queryParams = new URLSearchParams(window.location.search);
          accessToken = queryParams.get("access_token");
          refreshToken = queryParams.get("refresh_token");
        }

        if (!accessToken || !refreshToken) {
          setError("Required authentication tokens are missing");
          setLoading(false);
          return;
        }

        Cookies.set("agentix_access_token", accessToken);
        Cookies.set("agentix_refresh_token", refreshToken);
        await reloadAuth();

        // Workspace selection is handled by PrivateRoute + StudentContext

        // Redirect to dashboard after successful authentication
        navigate("/home");
      } catch (error) {
        console.error("OAuth callback error:", error);
        setError("Authentication failed. Please try again.");
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, reloadAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Authentication Error</div>
          <p>{error}</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
