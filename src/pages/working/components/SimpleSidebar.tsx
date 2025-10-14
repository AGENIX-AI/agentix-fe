import React from "react";
import {
  MessageSquare,
  Bot,
  Search,
  Calendar,
  Settings,
  Gem,
  AlignJustify,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import { useCreditsPolling } from "@/hooks/useCreditsPolling";
import { NotificationCenter } from "@/components/custom/NotificationCenter";
import { UserMenu } from "@/pages/student/components/sidebar/user-menu";
import { useTranslation } from "react-i18next";

interface SimpleSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  className,
  isCollapsed = false,
  onToggle,
}) => {
  const { t } = useTranslation();
  const { setRightPanel } = useStudent();
  const { credits, error: creditsError } = useCreditsPolling(5000);

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-between py-4 bg-background",
          className
        )}
      >
        <div className="flex flex-col items-center gap-8">
          <img
            src="/logo/logo.png"
            alt="AgenIx"
            className="h-12 w-12 rounded-md object-contain"
          />

          <div className="flex flex-col items-center gap-4">
            <Button variant="ghost" size="icon" aria-label="Messages">
              <MessageSquare className="size-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Bots">
              <Bot className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Calendar"
              onClick={() => setRightPanel("taskPanel")}
            >
              <Calendar className="size-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          {/* <NotificationCenter />
          {credits && !creditsError && (
            <div className="flex items-center gap-2">
              <Gem
                className="h-4 w-4 cursor-pointer"
                onClick={() => setRightPanel("buyCredits")}
              />
            </div>
          )} */}
          <UserMenu showUserName={false} className="justify-center" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border h-20">
        <img
          src="/logo/logo.png"
          alt="AgenIx"
          className="h-8 w-8 rounded-md object-contain"
        />
        <h2 className="text-lg font-semibold text-foreground">AgeniX</h2>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setRightPanel("taskPanel")}
          >
            <MessageSquare className="size-4 mr-2" />
            Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Bot className="size-4 mr-2" />
            Bots
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Search className="size-4 mr-2" />
            Search
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setRightPanel("taskPanel")}
          >
            <Calendar className="size-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3">
        {credits && !creditsError && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Credits</span>
            <div className="flex items-center gap-2">
              <Gem
                className="size-4 cursor-pointer"
                onClick={() => setRightPanel("buyCredits")}
              />
              <span className="text-sm font-medium">
                {credits.balance.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <UserMenu showUserName={true} className="w-full" />
      </div>
    </div>
  );
};
