import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Flex } from "@/components/layout/flex";
import { H1, P } from "@/components/ui/typography";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { reloadAuth } = useAuth();

  useEffect(() => {
    // Check for access token in query parameters
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      // Store the token in cookies
      Cookies.set("edvara_access_token", accessToken);

      // If refresh token is available, store it too
      if (refreshToken) {
        Cookies.set("edvara_refresh_token", refreshToken);
      }

      // Reload auth state
      reloadAuth();

      // Redirect to dashboard
      navigate("/student");
    }
  }, [location, navigate, reloadAuth]);

  return (
    <div className="p-12">
      <Container>
        <header className="mb-8">
          <Flex justify="between" align="center">
            <H1>{t("app_name")}</H1>
            <Flex gap="sm">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </Flex>
          </Flex>
          <P className="mt-4">{t("home_welcome")}</P>
        </header>

        <div className="flex flex-col items-center justify-center mt-12">
          <div className="max-w-2xl text-center">
            <h2 className="text-4xl font-bold mb-6">{t("home_title")}</h2>
            <p className="text-xl mb-8">{t("home_subtitle")}</p>
            <Flex gap="md" className="justify-center">
              <Button asChild size="lg">
                <Link to="/auth/login">{t("nav_login")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth/signup">{t("nav_signup")}</Link>
              </Button>
            </Flex>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Home;
