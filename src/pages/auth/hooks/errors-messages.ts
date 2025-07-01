import { useTranslation } from "react-i18next";

export function useAuthErrorMessages() {
  const { t } = useTranslation();

  const getAuthErrorMessage = (code?: string) => {
    switch (code) {
      case "auth/wrong-password":
        return t("auth.errors.wrongPassword");
      case "auth/user-not-found":
        return t("auth.errors.userNotFound");
      case "auth/email-already-in-use":
        return t("auth.errors.emailAlreadyInUse");
      case "auth/weak-password":
        return t("auth.errors.weakPassword");
      case "auth/invalid-email":
        return t("auth.errors.invalidEmail");
      case "auth/expired-action-code":
        return t("auth.errors.expiredLink");
      case "auth/invalid-action-code":
        return t("auth.errors.invalidLink");
      case "auth/too-many-requests":
        return t("auth.errors.tooManyRequests");
      case "auth/magic-link-failed":
        return t("auth.errors.magicLinkFailed");
      case "auth/email-not-confirmed":
      case "400":
        return t("auth.errors.emailNotConfirmed");
      case "401":
      case "403":
        return t("auth.errors.invalidCredentials");
      default:
        return t("auth.errors.defaultError");
    }
  };

  return { getAuthErrorMessage };
}
