import { useTranslation } from "react-i18next";

interface LoginModeSwitchProps {
  activeMode: "password" | "magic-link";
  onChange: (mode: string) => void;
}

export function LoginModeSwitch({
  activeMode,
  onChange,
}: LoginModeSwitchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex mb-4 border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("password")}
        className={`flex-1 py-2 text-center ${
          activeMode === "password"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        {t("auth.login.password")}
      </button>
      <button
        type="button"
        onClick={() => onChange("magic-link")}
        className={`flex-1 py-2 text-center ${
          activeMode === "magic-link"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        {t("auth.login.magicLink")}
      </button>
    </div>
  );
}
