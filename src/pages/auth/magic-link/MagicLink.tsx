import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

const MagicLink = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { reloadAuth } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // Parse the hash parameters
        const hash = location.hash.substring(1); // Remove the '#' character
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresAt = params.get("expires_at");
        const expiresIn = params.get("expires_in");

        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        console.log("Expires At:", expiresAt);
        console.log("Expires In:", expiresIn);

        if (!accessToken || !refreshToken) {
          throw new Error("Invalid magic link: missing required tokens");
        }

        Cookies.set("edvara_access_token", accessToken);
        Cookies.set("edvara_refresh_token", refreshToken);

        reloadAuth();

        // Redirect to dashboard
        navigate("/student", { replace: true });
      } catch (err) {
        console.error("Magic link authentication error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to authenticate with magic link"
        );
        setIsVerifying(false);
      }
    };

    handleMagicLink();
  }, [location, navigate]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {t("auth.magicLink.verifying")}
          </h2>
          <p className="text-muted-foreground">
            {t("auth.magicLink.pleaseWait")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md w-full p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{t("auth.magicLink.authFailed")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              {t("auth.magicLink.returnToLogin")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MagicLink;
