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
  agentName = "AI Assistant",
  tagline = "Powered by AI",
  agentImage,
}: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="">
      <div className="flex items-center justify-start h-full py-3 px-4 ">
        <div className="relative w-full flex items-center gap-2 pl-2">
          <Avatar className="h-8 w-8 overflow-hidden flex-shrink-0">
            <AvatarImage src={agentImage} alt={agentName} />
            <AvatarFallback>{agentName[0] || "AI"}</AvatarFallback>
          </Avatar>
          <div className="">
            <H2 className="text-sm font-medium text-foreground">{agentName}</H2>
            <Muted className="text-xs">
              {t("chat.header.powered_by", { name: tagline })}
            </Muted>
          </div>
        </div>
      </div>
    </div>
  );
}
