import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { oAuthProviders, type OAuthProvider } from "./oAuthProviders";

interface SocialSigninButtonProps {
  provider: OAuthProvider;
}

export function SocialSigninButton({ provider }: SocialSigninButtonProps) {
  const { t } = useTranslation();
  const providerConfig = oAuthProviders[provider];

  const handleSignIn = async () => {
    authService.socialLogin(provider);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      <span className="mr-2">
        {providerConfig && <providerConfig.icon className="h-4 w-4" />}
      </span>
      {t(`auth.providers.${providerConfig.name.toLowerCase()}`)}
    </Button>
  );
}
