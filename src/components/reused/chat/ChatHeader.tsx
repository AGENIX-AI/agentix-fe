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
  const displayName = agentName || t('chat.header.default_name', 'AI Assistant');
  const displayTagline = tagline || t('chat.header.tagline', 'Powered by AI');
  
  return (
    <div className="">
      <div className="flex items-center justify-start h-full py-3 px-4">
        <div className="relative w-full flex items-center gap-2 pl-2">
          <Avatar className="h-8 w-8 overflow-hidden flex-shrink-0">
            <AvatarImage src={agentImage} alt={displayName} />
            <AvatarFallback>{displayName[0] || "A"}</AvatarFallback>
          </Avatar>
          <div className="">
            <H2 className="text-sm font-semibold text-foreground">
              {displayName}
            </H2>
            <Muted className="text-xs">{displayTagline}</Muted>
          </div>
        </div>
      </div>
    </div>
  );
}
