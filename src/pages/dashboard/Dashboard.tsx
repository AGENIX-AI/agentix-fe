import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { Flex } from "@/components/layout/flex";
import { H1, P } from "@/components/ui/typography";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserData(user);
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="p-12">
      <Container>
        <header className="mb-8">
          <Flex justify="between" align="center">
            <H1>{t("nav_dashboard")}</H1>
            <Flex gap="md" align="center">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button variant="outline" onClick={handleLogout}>
                {t("nav_logout")}
              </Button>
            </Flex>
          </Flex>
          <P className="mt-4">{t("dashboard_welcome")}</P>
        </header>

        {loading ? (
          <P>{t("loading_data")}</P>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("user_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              {userData && (
                <div className="space-y-2">
                  <P>
                    <strong>{t("user_name")}:</strong> {userData.name}
                  </P>
                  <P>
                    <strong>{t("user_email")}:</strong> {userData.email}
                  </P>
                  <P>
                    <strong>{t("user_id")}:</strong> {userData.id}
                  </P>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
