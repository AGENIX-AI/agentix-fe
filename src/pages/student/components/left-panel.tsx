import { useState, useEffect } from "react";
// header controls removed
// import { useTranslation } from "react-i18next";
import { HistoryComponent } from "./history/history-component";
import { ModifiedResizableLayout } from "./resizeable-layout";
import { ResizableSidebar } from "./sidebar/resizable-sidebar";
import { ChatComponent } from "./chat/ChatComponent";
import { useAuth } from "@/contexts/AuthContext";
// import Cookies from "js-cookie";
import { listenPusherChannel } from "@/lib/realtime/listenPusherChannel";
import { StudentLayoutProvider } from "@/contexts/StudentLayoutContext";

// WebSocket message interface for user-based subscription
// type WebSocketMessage = unknown;

// Removed unused WebSocketManager (managed globally elsewhere)

// const wsManager = WebSocketManager.getInstance();

export default function LeftPanel({}: { isRightPanelCollapsed: boolean }) {
  // Add local state for history visibility to prevent automatic expansion
  const [localHistoryVisible, setLocalHistoryVisible] = useState(true);
  const { user } = useAuth();
  // const wsRef = useRef<WebSocket | null>(null); // Keep for cleanup reference only

  // Use local state instead of StudentContext for layout control
  const isHistoryVisible = localHistoryVisible;

  // Local toggle function for history visibility
  const toggleLocalHistory = () => {
    setLocalHistoryVisible((prev) => !prev);
  };

  // Extract user ID to prevent unnecessary re-renders
  const userId = user?.id;

  // Realtime via Pusher is handled globally in GlobalRealtimeSubscriber
  // Avoid creating a parallel manual WebSocket here to prevent duplicates
  useEffect(() => {
    if (!userId) return;
    console.log(
      "[LeftPanel] Skipping manual WebSocket. Using Pusher via GlobalRealtimeSubscriber for user:",
      userId
    );
    // Optional: subscribe to pusher channel logs only
    try {
      listenPusherChannel(`private-user-${userId}`);
    } catch {}
    return () => {
      // No manual WS to cleanup
    };
  }, [userId]);

  // const { t } = useTranslation();

  return (
    <StudentLayoutProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar - tokenized border and full-height */}
        <ResizableSidebar className="bg-background h-screen border-r border-border" />
        {/* Main content area */}
        <div className="flex-1 h-screen overflow-hidden">
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
            storageKey="agentix-history-width"
            isHistoryVisible={isHistoryVisible}
          />
        </div>
      </div>
    </StudentLayoutProvider>
  );
}
