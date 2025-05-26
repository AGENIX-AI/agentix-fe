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

const Instructor = () => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="p-12">
      <Container>
        <header className="mb-8">
          <Flex justify="between" align="center">
            <H1>{t("nav_instructor")}</H1>
            <Flex gap="md" align="center">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button variant="secondary" onClick={handleBackToDashboard}>
                {t("nav_dashboard")}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                {t("nav_logout")}
              </Button>
            </Flex>
          </Flex>
          <P className="mt-4">{t("instructor_welcome")}</P>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t("instructor_page_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <P>{t("instructor_content")}</P>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("instructor_courses")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <P>{t("instructor_courses_description")}</P>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("instructor_students")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <P>{t("instructor_students_description")}</P>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Instructor;
