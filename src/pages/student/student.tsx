import { useState } from "react";

import { StudentContextProvider } from "@/contexts/StudentContext";
import { ResizableLayoutWithToggle } from "@/components/custom/ResizableLayoutWithToggle";
import LeftPanel from "./components/left-panel";
import RightPanel from "./components/right-panel";

// Will be used in future implementations
// interface CharacterInfo {
//   id: string;
//   name: string;
//   image: string;
//   tagline: string;
// }
export default function AppStartPage() {
  const [isMiniappVisible, setIsMiniappVisible] = useState(true);
  // These will be used in future implementations
  // const [selectedCharacterInfo, setSelectedCharacterInfo] =
  //   useState<CharacterInfo | null>(null);

  const handleMiniappToggle = (isVisible: boolean) => {
    setIsMiniappVisible(isVisible);
  };

  return (
    <StudentContextProvider>
      <div className="flex h-screen">
        <ResizableLayoutWithToggle
          leftPane={<LeftPanel onMiniappToggle={handleMiniappToggle} />}
          rightPane={<RightPanel />}
          initialLeftWidth={55}
          minLeftWidth={55}
          maxLeftWidth={65}
          storageKey="edvara-mainpage-width"
          isRightPaneVisible={isMiniappVisible}
        />
      </div>
    </StudentContextProvider>
  );
}
