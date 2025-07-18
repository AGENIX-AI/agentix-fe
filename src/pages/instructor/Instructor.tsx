import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { InstructorContextProvider } from "@/contexts/InstructorContext";
import LeftPanel from "./components/left-panel";
import RightPanel from "./components/right-panel";
import { InstructorSignupForm } from "./components/InstructorSignupForm";
import { InstructorPendingApproval } from "./components/InstructorPendingApproval";
import { getInstructorProfile } from "@/api/instructor";
import { ResizableLayout } from "@/components/custom/ResizableLayout/ResizableLayout";

// Profile status types
type ProfileStatus = "loading" | "not_found" | "pending" | "approved";

// Will be used in future implementations
// interface CharacterInfo {
//   id: string;
//   name: string;
//   image: string;
//   tagline: string;
// }
export default function AppStartPage() {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("loading");
  // These will be used in future implementations
  // const [selectedCharacterInfo, setSelectedCharacterInfo] =
  //   useState<CharacterInfo | null>(null);

  const handleRightPanelToggle = (isCollapsed: boolean) => {
    setIsRightPanelCollapsed(isCollapsed);
  };

  const fetchProfile = async () => {
    try {
      setProfileStatus("loading");
      const profileData = await getInstructorProfile();

      // Check if the profile has the accepted field and its value
      if (profileData.accepted === true) {
        setProfileStatus("approved");
      } else {
        setProfileStatus("pending");
      }
    } catch (error: any) {
      console.error("Error fetching instructor profile:", error);

      // Check if the error is "Instructor profile not found"
      if (
        error.message?.includes("Instructor profile not found") ||
        error.message?.includes("404")
      ) {
        setProfileStatus("not_found");
      } else {
        // For other errors, assume profile doesn't exist
        setProfileStatus("not_found");
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignupSuccess = () => {
    // After successful signup, refresh the profile status
    fetchProfile();
  };

  const handleRefreshStatus = () => {
    fetchProfile();
  };

  // Loading state
  if (profileStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs">Loading instructor profile...</span>
        </div>
      </div>
    );
  }

  // Not found - show signup form
  if (profileStatus === "not_found") {
    return <InstructorSignupForm onSuccess={handleSignupSuccess} />;
  }

  // Pending approval - show pending state
  if (profileStatus === "pending") {
    return <InstructorPendingApproval onRefresh={handleRefreshStatus} />;
  }

  // Approved - show main instructor interface
  return (
    <InstructorContextProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <ResizableLayout
          leftPane={<LeftPanel isRightPanelCollapsed={isRightPanelCollapsed} />}
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
    </InstructorContextProvider>
  );
}
