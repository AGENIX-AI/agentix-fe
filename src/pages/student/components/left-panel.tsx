import { useState, useEffect, useRef } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/ui/Logo";
import { HistoryComponent } from "./history/history-component";
import { ModifiedResizableLayout } from "./resizeable-layout";
import { ResizableSidebar } from "./sidebar/resizable-sidebar";
import { ChatComponent } from "./chat/ChatComponent";
import { openWsTest } from "./chat/ws-test";
import { useAuth } from "@/contexts/AuthContext";
import { eventBus } from "@/lib/utils/event/eventBus";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import { listenPusherChannel } from "@/lib/realtime/listenPusherChannel";

// WebSocket message interface for user-based subscription
interface WebSocketMessage {
  conversation_id: string;
  content: string;
  sender: string;
  invocation_id?: string;
  timestamp: string;
}

// Global connection manager to ensure only one connection per user
class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocket> = new Map();
  private connecting: Set<string> = new Set();
  private allWebSockets: Map<string, WebSocket[]> = new Map(); // Track all WebSocket objects

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  hasConnection(userId: string): boolean {
    const ws = this.connections.get(userId);
    return ws ? ws.readyState === WebSocket.OPEN : false;
  }

  isConnecting(userId: string): boolean {
    return this.connecting.has(userId);
  }

  hasAnyWebSocket(userId: string): boolean {
    const allWs = this.allWebSockets.get(userId) || [];
    return allWs.some(
      (ws) =>
        ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN
    );
  }

  closeConnection(userId: string): void {
    // Close the active connection
    const ws = this.connections.get(userId);
    if (ws) {
      console.log(
        "WebSocketManager: Closing active connection for user:",
        userId
      );
      ws.close();
      this.connections.delete(userId);
    }

    // Close all WebSocket objects for this user (including connecting ones)
    const allWs = this.allWebSockets.get(userId) || [];
    allWs.forEach((ws, index) => {
      if (
        ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN
      ) {
        console.log(
          `WebSocketManager: Closing WebSocket ${index} for user:`,
          userId
        );
        ws.close();
      }
    });

    // Clear all tracking
    this.allWebSockets.delete(userId);
    this.connecting.delete(userId);
  }

  createConnection(
    userId: string,
    onMessage: (data: any) => void
  ): WebSocket | null {
    // Close any existing connection for this user
    this.closeConnection(userId);

    if (this.connecting.has(userId)) {
      console.log("WebSocketManager: Already connecting for user:", userId);
      return null;
    }

    try {
      this.connecting.add(userId);

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
      const wsUrl = baseUrl
        .replace(/^https:\/\//, "wss://")
        .replace(/^http:\/\//, "ws://");

      const accessToken = Cookies.get("agentix_access_token");
      const refreshToken = Cookies.get("agentix_refresh_token");
      if (!accessToken || !refreshToken) {
        console.error("No access/refresh token found in cookies");
        this.connecting.delete(userId);
        return null;
      }

      const websocketUrl = `${wsUrl}/conversations/ws/user/${userId}?token=${encodeURIComponent(
        accessToken
      )}&refresh_token=${encodeURIComponent(refreshToken)}`;
      const connectionId = Math.random().toString(36).substr(2, 9);
      console.log(
        "WebSocketManager: Creating connection for user:",
        userId,
        "connectionId:",
        connectionId
      );

      const ws = new WebSocket(websocketUrl);

      // Track this WebSocket object immediately
      if (!this.allWebSockets.has(userId)) {
        this.allWebSockets.set(userId, []);
      }
      this.allWebSockets.get(userId)!.push(ws);

      ws.onopen = () => {
        console.log(
          "WebSocketManager: Connected successfully, connectionId:",
          connectionId
        );
        this.connecting.delete(userId);
        this.connections.set(userId, ws);
        ws.send("ping");
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") {
          console.log(
            "WebSocketManager: Ping-pong successful, connectionId:",
            connectionId
          );
          return;
        }
        try {
          const raw = JSON.parse(event.data);
          console.log(
            "WebSocketManager: Received message, connectionId:",
            connectionId
          );

          // Normalize multiple possible payload shapes into WebSocketMessage
          let normalized: WebSocketMessage | null = null;

          // 1) Existing expected shape
          if (
            typeof raw?.conversation_id === "string" &&
            typeof raw?.content === "string"
          ) {
            normalized = {
              conversation_id: raw.conversation_id,
              content: raw.content,
              sender: raw.sender || "agent",
              invocation_id: raw.invocation_id,
              timestamp: raw.timestamp || new Date().toISOString(),
            };
          }

          // 2) New shape from agent backend
          // { convId, payload: { message: { conversation_id, sender_user_id, sender_assistant_id, content, meta: { role } } } }
          if (
            !normalized &&
            raw &&
            typeof raw === "object" &&
            "convId" in raw
          ) {
            const msg = raw?.payload?.message;
            if (msg) {
              const role = msg?.meta?.role as string | undefined;
              const senderFromAssistant = msg?.sender_assistant_id
                ? "agent"
                : undefined;
              let contentStr: string | null = null;
              if (typeof msg.content === "string") {
                contentStr = msg.content;
              } else if (msg.content && typeof msg.content === "object") {
                contentStr =
                  typeof msg.content.reply === "string"
                    ? msg.content.reply
                    : JSON.stringify(msg.content);
              }
              if (typeof contentStr === "string") {
                normalized = {
                  conversation_id:
                    msg.conversation_id || (raw as any).convId || "",
                  content: contentStr,
                  sender: role || senderFromAssistant || "agent",
                  invocation_id: msg.invocation_id,
                  timestamp: new Date().toISOString(),
                };
              }
            }
          }

          if (normalized) {
            onMessage(normalized);
          } else {
            console.warn("WebSocketManager: Unknown message shape", raw);
          }
        } catch (error) {
          console.error("WebSocketManager: Error parsing message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log(
          "WebSocketManager: Connection closed, code:",
          event.code,
          "connectionId:",
          connectionId
        );
        this.connections.delete(userId);
        this.connecting.delete(userId);
        // Remove this WebSocket from tracking
        const allWs = this.allWebSockets.get(userId) || [];
        const index = allWs.indexOf(ws);
        if (index > -1) {
          allWs.splice(index, 1);
        }
      };

      ws.onerror = (error) => {
        console.error(
          "WebSocketManager: Connection error, connectionId:",
          connectionId,
          error
        );
        this.connections.delete(userId);
        this.connecting.delete(userId);
        // Remove this WebSocket from tracking
        const allWs = this.allWebSockets.get(userId) || [];
        const index = allWs.indexOf(ws);
        if (index > -1) {
          allWs.splice(index, 1);
        }
      };

      return ws;
    } catch (error) {
      console.error("WebSocketManager: Error creating connection:", error);
      this.connecting.delete(userId);
      return null;
    }
  }
}

const wsManager = WebSocketManager.getInstance();

export default function LeftPanel({
  isRightPanelCollapsed,
}: {
  isRightPanelCollapsed: boolean;
}) {
  // Add local state for history visibility to prevent automatic expansion
  const [localHistoryVisible, setLocalHistoryVisible] = useState(true);
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null); // Keep for cleanup reference only

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

  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen max-h-[100vh] overflow-auto">
      <header className="flex h-18 items-center border-b bg-background z-30 px-6">
        {/* Left section - Logo */}
        <div className="flex items-center cursor-pointer flex-shrink-0">
          <Logo className="w-30 h-15" />
        </div>

        {/* Right section - Search + Navigation - Pushed to the right */}
        <div className="flex items-center gap-6 ml-auto min-w-0 ">
          {/* Search - Made flexible to resize with header */}
          <div
            className={cn(
              "relative w-full",
              isRightPanelCollapsed ? "min-w-[400px]" : "w-[250px]"
            )}
          >
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 text-muted-foreground" />
            <Input
              className="h-8 pl-8 w-full transition-all duration-300"
              type="search"
              placeholder={t("student.navigation.search")}
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
                storageKey="agentix-history-width"
                isHistoryVisible={isHistoryVisible}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
