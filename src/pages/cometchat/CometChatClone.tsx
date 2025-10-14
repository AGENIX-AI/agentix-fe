import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CometChatUIKit,
  CometChatUIKitLoginListener,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Sample app providers and UI
import {
  AppContextProvider,
  CometChatHome,
  setupLocalization,
  metaInfo,
  COMETCHAT_CONSTANTS,
} from "@/thirdparty/cometchat-sample";
// Sample app base styles copied locally
import "./styles/App.css";
import { SimpleSidebar } from "@/pages/working/components/SimpleSidebar";
import RightPanel from "@/pages/student/components/right-panel";
import { cn } from "@/lib/utils";

// Ensure we only initialize the UI Kit once per app lifecycle
let uiKitInitialized = false;

const getBrowserTheme = (): "light" | "dark" => {
  return "light";
};

export default function CometChatClone() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const initInFlightRef = useRef(false);
  const theme = useMemo(getBrowserTheme, []);

  // 3-panel layout state (sidebar | cometchat | right panel)
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isMessagesCollapsed, setIsMessagesCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState<null | "sidebar" | "rightPanel">(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const constraints = {
    sidebar: { min: 180, max: 320 },
    chat: { min: 360 },
    rightPanel: { min: 240, max: 560 },
  } as const;

  const getPanelWidths = () => {
    // Match working layout.tsx: compute based on container width
    const totalWidth = containerRef.current?.clientWidth || 1200;
    const sidebarW = isSidebarCollapsed ? 88 : sidebarWidth;
    const rightW = isRightPanelCollapsed
      ? 64
      : Math.max(rightPanelWidth, constraints.rightPanel.min);
    // Center chat panel width is remaining space with a minimum
    const chatW = Math.max(
      constraints.chat.min,
      totalWidth - sidebarW - rightW
    );
    return { sidebar: sidebarW, chat: chatW, rightPanel: rightW } as const;
  };

  const [panelWidths, setPanelWidths] = useState(getPanelWidths());

  const recalcPanelWidths = useCallback(() => {
    setPanelWidths(getPanelWidths());
  }, [
    isSidebarCollapsed,
    isRightPanelCollapsed,
    sidebarWidth,
    rightPanelWidth,
  ]);

  // Persist widths
  useEffect(() => {
    try {
      const s = localStorage.getItem("cometchat-sidebar-width");
      const r = localStorage.getItem("cometchat-rightpanel-width");
      if (s) {
        const v = Number.parseFloat(s);
        if (!Number.isNaN(v))
          setSidebarWidth(
            Math.min(
              constraints.sidebar.max,
              Math.max(constraints.sidebar.min, v)
            )
          );
      }
      if (r) {
        const v = Number.parseFloat(r);
        if (!Number.isNaN(v))
          setRightPanelWidth(
            Math.min(
              constraints.rightPanel.max,
              Math.max(constraints.rightPanel.min, v)
            )
          );
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cometchat-sidebar-width", String(sidebarWidth));
    } catch {}
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "cometchat-rightpanel-width",
        String(rightPanelWidth)
      );
    } catch {}
  }, [rightPanelWidth]);

  // Recalculate computed widths whenever inputs change
  useEffect(() => {
    recalcPanelWidths();
  }, [recalcPanelWidths]);

  // Handle window resize to keep layout responsive
  useEffect(() => {
    const onResize = () => recalcPanelWidths();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recalcPanelWidths]);

  const updateWidth = useCallback(
    (panel: "sidebar" | "rightPanel", newWidth: number) => {
      if (panel === "sidebar") {
        const v = Math.max(
          constraints.sidebar.min,
          Math.min(constraints.sidebar.max, newWidth)
        );
        setSidebarWidth(v);
      } else {
        const v = Math.max(
          constraints.rightPanel.min,
          Math.min(constraints.rightPanel.max, newWidth)
        );
        setRightPanelWidth(v);
      }
    },
    []
  );

  const handleMouseDown = useCallback(
    (panel: "sidebar" | "rightPanel") => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(panel);
    },
    []
  );

  const handleTouchStart = useCallback(
    (panel: "sidebar" | "rightPanel") => (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(panel);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX =
          "touches" in e && e.touches[0]
            ? e.touches[0].clientX
            : (e as MouseEvent).clientX;
        const x = clientX - rect.left;
        if (isDragging === "sidebar") {
          updateWidth("sidebar", x);
        } else if (isDragging === "rightPanel") {
          updateWidth("rightPanel", rect.width - x);
        }
        rafRef.current = null;
      });
    },
    [isDragging, updateWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      // Improve UX while dragging: prevent text selection globally
      const previousUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove as any);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove as any, {
        passive: false,
      });
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove as any);
      document.removeEventListener("touchend", handleMouseUp);
      // Restore text selection when not dragging
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove as any);
      document.removeEventListener("touchend", handleMouseUp);
      // Ensure we always restore on unmount
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const ResizableSeparator = ({
    onMouseDown,
    onTouchStart,
    className,
    onToggle,
    isCollapsed = false,
    toggleDirection = "right",
  }: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    className?: string;
    onToggle?: () => void;
    isCollapsed?: boolean;
    toggleDirection?: "left" | "right";
  }) => (
    <div
      className={cn(
        "w-1 bg-border hover:bg-border/80 transition-colors cursor-col-resize group relative z-20",
        className
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
    >
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-0.5 h-8 bg-primary rounded-full" />
      </div>
      {onToggle && (
        <div className="absolute top-17 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-6 h-6 bg-background border border-border rounded-sm flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
            aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {toggleDirection === "right" ? (
              isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )
            ) : isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    async function init() {
      if (initInFlightRef.current) return;
      initInFlightRef.current = true;

      const appID =
        COMETCHAT_CONSTANTS.APP_ID || localStorage.getItem("appId") || "";
      const region =
        COMETCHAT_CONSTANTS.REGION || localStorage.getItem("region") || "";
      const authKey =
        COMETCHAT_CONSTANTS.AUTH_KEY || localStorage.getItem("authKey") || "";

      if (!uiKitInitialized) {
        const settings = new UIKitSettingsBuilder()
          .setAppId(appID)
          .setRegion(region)
          .setAuthKey(authKey)
          .subscribePresenceForAllUsers()
          .build();

        setupLocalization();
        try {
          CometChat.setDemoMetaInfo(metaInfo);
        } catch (_) {}
        await CometChatUIKit.init(settings);
        uiKitInitialized = true;
      }

      // Login with our app user if available
      if (user && !CometChatUIKitLoginListener.getLoggedInUser()) {
        const uid = user.id || user.email || user.phone;
        if (uid) {
          try {
            await CometChatUIKit.login(uid);
          } catch (_) {
            // Ignore login error; UI Kit will handle auth screens if needed
          }
        }
      }

      setReady(true);
    }
    init();
  }, [user]);
  console.log("isSidebarCollapsed", isSidebarCollapsed);
  console.log("isRightPanelCollapsed", isRightPanelCollapsed);
  console.log("isMessagesCollapsed", isMessagesCollapsed);
  console.log("panelWidths", panelWidths);
  console.log("sidebarWidth", sidebarWidth);
  console.log("rightPanelWidth", rightPanelWidth);
  console.log("isDragging", isDragging);

  if (!ready) return null;

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-full bg-background overflow-hidden"
      style={{ cursor: isDragging ? "col-resize" : "auto" }}
    >
      {/* Sidebar */}
      <div
        className="flex-shrink-0 bg-background border-r border-border"
        style={{
          width: `${panelWidths.sidebar}px`,
          transition: isDragging ? "none" : "width 150ms ease-out",
          willChange: isDragging ? ("width" as any) : undefined,
        }}
      >
        <SimpleSidebar
          isCollapsed={isSidebarCollapsed}
          className="h-full w-full"
        />
      </div>

      {/* Sidebar Resizer */}
      <ResizableSeparator
        onMouseDown={handleMouseDown("sidebar")}
        onTouchStart={handleTouchStart("sidebar")}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCollapsed={isSidebarCollapsed}
        toggleDirection="right"
        className="relative"
      />

      {/* CometChat UI as center panel */}
      <div
        className="flex-shrink-0 bg-background border-r border-border overflow-hidden min-w-0 max-w-full"
        style={{
          width: `${panelWidths.chat}px`,
          maxWidth: `${panelWidths.chat}px`,
          transition: isDragging ? "none" : "width 150ms ease-out",
          willChange: isDragging ? ("width" as any) : undefined,
        }}
      >
        <div className="App h-full w-full overflow-hidden">
          <AppContextProvider>
            <CometChatHome
              theme={theme}
              onToggleCollapse={() =>
                setIsMessagesCollapsed(!isMessagesCollapsed)
              }
              isMessagesCollapsed={isMessagesCollapsed}
            />
          </AppContextProvider>
        </div>
      </div>

      {/* Right Panel Resizer */}
      <ResizableSeparator
        onMouseDown={handleMouseDown("rightPanel")}
        onTouchStart={handleTouchStart("rightPanel")}
        onToggle={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        isCollapsed={isRightPanelCollapsed}
        toggleDirection="left"
        className="relative"
      />

      {/* Right Panel */}
      <div
        className="flex-shrink-0 bg-background overflow-hidden relative z-10"
        style={{
          width: `${panelWidths.rightPanel}px`,
          transition: isDragging ? "none" : "width 150ms ease-out",
          willChange: isDragging ? ("width" as any) : undefined,
        }}
      >
        <RightPanel
          isCollapsed={isRightPanelCollapsed}
          onToggle={setIsRightPanelCollapsed}
        />
      </div>
    </div>
  );
}
