import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { H2, Muted } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

interface ChatHeaderProps {
  disabled?: boolean;
  agentName?: string;
  tagline?: string;
  agentImage?: string;
}

export function ChatHeader({
  agentName,
  tagline,
  agentImage,
}: ChatHeaderProps) {
  const { t } = useTranslation();

  // Use translation for default values
  const displayName =
    agentName || t("chat.header.default_name", "AI Assistant");
  const displayTagline = tagline || t("chat.header.tagline", "Powered by AI");

  return (
    <div className="">
      <div className="flex items-center justify-between h-20 px-6">
        <div className="relative w-full flex items-center gap-4">
          <Avatar className="h-10 w-10 rounded-[12px] overflow-hidden flex-shrink-0">
            <AvatarImage src={agentImage} alt={displayName} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary rounded-[12px]">
              {displayName[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="">
            <H2 className="text-base font-semibold text-foreground">
              {displayName}
            </H2>
            <Muted className="text-xs flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                {t("chat.header.online", "Online")}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{displayTagline}</span>
            </Muted>
          </div>
        </div>
      </div>
    </div>
  );
}
