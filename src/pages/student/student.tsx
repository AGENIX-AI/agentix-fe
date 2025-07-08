import { useState, useCallback } from "react";
import { StudentContextProvider } from "@/contexts/StudentContext";
import { ResizableLayout } from "@/components/custom/ResizableLayout/ResizableLayout";
import LeftPanel from "./components/left-panel";
import RightPanel from "./components/right-panel";

export default function AppStartPage() {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  const handleRightPanelToggle = useCallback((isCollapsed: boolean) => {
    setIsRightPanelCollapsed(isCollapsed);
  }, []);

  // Always use ResizableLayout to maintain consistent component tree
  return (
    <StudentContextProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <ResizableLayout
          leftPane={<LeftPanel />}
          rightPane={
            <RightPanel
              onToggle={handleRightPanelToggle}
              isCollapsed={isRightPanelCollapsed}
            />
          }
          // Width settings only apply when expanded (not disabled)
          initialLeftWidth={55}
          minLeftWidth={50}
          maxLeftWidth={65}
          storageKey="edvara-mainpage-width"
          disabled={isRightPanelCollapsed}
        />
      </div>
    </StudentContextProvider>
  );
}
