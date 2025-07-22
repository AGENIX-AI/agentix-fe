import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { InstructorContextProvider } from "@/contexts/InstructorContext";
import LeftPanel from "./components/left-panel";
import RightPanel from "./components/right-panel";
import { getInstructorProfile } from "@/api/instructor";
import { ResizableLayout } from "@/components/custom/ResizableLayout/ResizableLayout";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructorSignupDialog } from "./components/InstructorSignupDialog";
import { InstructorPendingDialog } from "./components/InstructorPendingDialog";

// Profile status types
type ProfileStatus = "loading" | "not_found" | "pending" | "approved";



export default function AppStartPage() {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("loading");

  // Remove unused refs and commented-out state/handlers

  const fetchProfile = async () => {
    try {
      setProfileStatus("loading");
      const profileData = await getInstructorProfile();
      if (profileData.accepted === true) {
        setProfileStatus("approved");
      } else {
        setProfileStatus("pending");
      }
    } catch (error: any) {
      console.error("Error fetching instructor profile:", error);
      if (
        error.message?.includes("Instructor profile not found") ||
        error.message?.includes("404")
      ) {
        setProfileStatus("not_found");
      } else {
        setProfileStatus("not_found");
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRefreshStatus = () => {
    fetchProfile();
  };

  // Skeleton UI with overlay dialogs - wrapped with React.memo to prevent re-renders
  const SkeletonWithDialog = React.memo(
    ({ children }: { children: React.ReactNode }) => {
      return (
        <InstructorContextProvider>
          <div className="flex h-screen w-full overflow-hidden relative">
            {/* Skeleton Background */}
            <div className="flex-1 opacity-30">
              <ResizableLayout
                leftPane={
                  <div className="h-full p-4 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  </div>
                }
                rightPane={
                  <div className="h-full p-4 space-y-4">
                    <Skeleton className="h-8 w-2/3" />
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                }
                initialLeftWidth={55}
                minLeftWidth={50}
                maxLeftWidth={65}
                storageKey="edvara-mainpage-width"
                disabled={isRightPanelCollapsed}
              />
            </div>

            {/* Overlay Dialog */}
            {children}
          </div>
        </InstructorContextProvider>
      );
    },
    () => {
      return true;
    }
  );

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

  // Not found - show skeleton with signup dialog
  if (profileStatus === "not_found") {
    return (
      <SkeletonWithDialog>
        <Dialog open={true} onOpenChange={() => {}}>
          <InstructorSignupDialog onSubmitted={() => fetchProfile()} />
        </Dialog>
      </SkeletonWithDialog>
    );
  }

  // Pending approval - show skeleton with pending dialog
  if (profileStatus === "pending") {
    return (
      <SkeletonWithDialog>
        <Dialog open={true} onOpenChange={() => {}}>
          <InstructorPendingDialog onRefreshStatus={handleRefreshStatus} />
        </Dialog>
      </SkeletonWithDialog>
    );
  }

  // Approved - show main instructor interface
  return (
    <InstructorContextProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <ResizableLayout
          leftPane={<LeftPanel isRightPanelCollapsed={isRightPanelCollapsed} />}
          rightPane={
            <RightPanel
              onToggle={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
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
