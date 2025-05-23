import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

interface OrganizationInvitationAlertProps {
  className?: string;
}

export function OrganizationInvitationAlert({ className }: OrganizationInvitationAlertProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("invitationId");
  const email = searchParams.get("email");

  if (!invitationId) {
    return null;
  }

  return (
    <Alert variant="default" className={className}>
      <AlertTitle>{t('organizations.invitation.title')}</AlertTitle>
      <AlertDescription>
        {t('organizations.invitation.message', { email })}
      </AlertDescription>
    </Alert>
  );
}
