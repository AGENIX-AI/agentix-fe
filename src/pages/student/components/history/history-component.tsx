import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { H5 } from "@/components/ui/typography";
import { useStudent } from "@/contexts/StudentContext";
import { SystemAssistantBlock } from "./SystemAssistantBlock";
import { UserConversationsBlock } from "./UserConversationsBlock";
import { Separator } from "@/components/ui/separator";

interface HistoryComponentProps {
  className?: string;
}

export function HistoryComponent({ className }: HistoryComponentProps) {
  const { setIsChatLoading } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={cn(className, "border-r border-border")}>
      <div className="bg-background text-sm h-[calc(100vh-3.5rem)] p-6 ">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div>
            <div className="flex items-center justify-start h-full p-0 pb-6">
              <H5>Chat History</H5>
            </div>
          </div>

          <div className="relative flex items-center gap-2 pb-4">
            <SearchIcon className="absolute left-4 h-4 text-muted-foreground" />
            <Input
              className="h-8 pl-10"
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col h-full">
            {/* BLOCK 1: System Assistant */}
            <SystemAssistantBlock setIsChatLoading={setIsChatLoading} />

            {/* BLOCK 2: User Conversations */}
            <UserConversationsBlock
              searchQuery={searchQuery}
              setIsChatLoading={setIsChatLoading}
            />
            <Separator orientation="horizontal" className="w-full my-1" />
          </div>

          <div className="text-[10px] text-center mb-1">
            {/* {renderDisclaimerText()} */}
            <span className="text-[9px] block font-normal text-xs truncate">
              v.{import.meta.env.VITE_APP_VERSION}.
              {import.meta.env.VITE_APP_LAST_BUILD_DATE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
