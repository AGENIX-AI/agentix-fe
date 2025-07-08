import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Small } from "@/components/ui/typography";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/Logo";
import { HistoryComponent } from "./history/history-component";
import { ModifiedResizableLayout } from "./resizeable-layout";
import { ResizableSidebar } from "./sidebar/resizable-sidebar";
import { ChatComponent } from "./chat/ChatComponent";

export default function LeftPanel() {
  // Add local state for history visibility to prevent automatic expansion
  const [localHistoryVisible, setLocalHistoryVisible] = useState(true);

  // Use local state instead of StudentContext for layout control
  const isHistoryVisible = localHistoryVisible;

  // Local toggle function for history visibility
  const toggleLocalHistory = () => {
    setLocalHistoryVisible((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen max-h-[100vh] overflow-auto">
      <header className="flex h-18 items-center border border-r-0 bg-background z-30 px-3">
        {/* Left section */}
        <div className="flex items-center cursor-pointer">
          <Logo className="w-30 h-15" />
        </div>

        {/* Middle section - navigation */}
        <nav className="flex gap-4 text-sm mx-auto font-semibold mt-1">
          <Link to="#" className="text-[#007E85] hover:text-foreground/80">
            <Small>Student</Small>
          </Link>
          <Separator orientation="vertical" className="h-6 w-0.5 p-0" />
          <Link
            to="/instructor"
            className="transition-colors hover:text-foreground/80"
          >
            <Small>Instructor</Small>
          </Link>
          <Separator orientation="vertical" className="h-6 w p-0" />
          <Link to="#" className="transition-colors hover:text-foreground/80">
            <Small>Blogs</Small>
          </Link>
          <Separator orientation="vertical" className="h-6 w p-0" />
          <Link to="#" className="transition-colors hover:text-foreground/80">
            <Small>About</Small>
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 text-muted-foreground" />
            <Input
              className="h-8 pl-8 w-full transition-all duration-300 md:w-[12vw] lg:w-[15vw]"
              type="search"
              placeholder="Search"
            />
          </div>
        </div>
      </header>

      <div className="flex w-full" style={{ height: "calc(100vh - 4.5rem)" }}>
        {/* Layout container with resizable sidebar and content */}
        <div className="flex w-full h-full">
          {/* Sidebar */}
          <ResizableSidebar className="bg-transparent h-[calc(100vh-4.5rem)]" />
          {/* Main content area */}
          <div className="flex-1 h-full overflow-hidden">
            <div className="flex h-full overflow-hidden">
              <ModifiedResizableLayout
                leftPane={
                  <HistoryComponent
                    isHistoryVisible={isHistoryVisible}
                    toggleHistory={toggleLocalHistory}
                  />
                }
                rightPane={<ChatComponent />}
                initialLeftWidth={30}
                minLeftWidth={30}
                maxLeftWidth={40}
                storageKey="edvara-history-width"
                isHistoryVisible={isHistoryVisible}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
