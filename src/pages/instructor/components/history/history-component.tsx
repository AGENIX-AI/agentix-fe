import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { H5 } from "@/components/ui/typography";
import { useInstructor } from "@/contexts/InstructorContext";
import { SystemAssistantBlock } from "./SystemAssistantBlock";
import { UserConversationsBlock } from "./UserConversationsBlock";
import { Separator } from "@/components/ui/separator";

interface HistoryComponentProps {
  className?: string;
}

export function HistoryComponent({ className }: HistoryComponentProps) {
  const { assistantInfo, setIsChatLoading } = useInstructor();
  const [searchQuery, setSearchQuery] = useState("");

  const renderDisclaimerText = () => {
    return `${
      assistantInfo?.name || "The assistant"
    } may be wrong. Please verify.`;
  };

  return (
    <div className={cn(className, "border-r border-border")}>
      <div className="bg-background text-sm h-[calc(100vh-3.5rem)] p-6 overflow-y-auto">
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
          <div className="flex flex-col h-full overflow-y-auto">
            {/* BLOCK 1: System Assistant */}
            <SystemAssistantBlock setIsChatLoading={setIsChatLoading} />
            <Separator orientation="horizontal" className="w-full my-1" />

            {/* BLOCK 2: User Conversations */}
            <UserConversationsBlock
              searchQuery={searchQuery}
              setIsChatLoading={setIsChatLoading}
            />
          </div>

          <div className="text-[10px] text-center mb-2">
            {renderDisclaimerText()}
          </div>
        </div>
      </div>
    </div>
  );
}
