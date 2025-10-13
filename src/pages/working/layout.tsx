import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SimpleSidebar } from "./components/SimpleSidebar";
import { MessagesPanel } from "./components/MessagesPanel";
import { ChatPanel } from "./components/ChatPanel";
import RightPanel from "@/pages/student/components/right-panel";
import { StudentLayoutProvider } from "@/contexts/StudentLayoutContext";
import { cn } from "@/lib/utils";

// Resizable separator component for the 4-panel layout
interface ResizableSeparatorProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  className?: string;
  onToggle?: () => void;
  isCollapsed?: boolean;
  toggleDirection?: "left" | "right";
}

const ResizableSeparator: React.FC<ResizableSeparatorProps> = ({
  onMouseDown,
  onTouchStart,
  className,
  onToggle,
  isCollapsed = false,
  toggleDirection = "right",
}) => (
  <div
    className={cn(
      "w-1 bg-border hover:bg-border/80 transition-colors cursor-col-resize group relative",
      className
    )}
    onMouseDown={onMouseDown}
    onTouchStart={onTouchStart}
  >
    <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="w-0.5 h-8 bg-primary rounded-full" />
    </div>

    {/* Toggle Button */}
    {onToggle && (
      <div className="absolute top-17 left-1/2 transform -translate-x-1/2 z-50">
        <button
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

// Main 4-panel layout component
export default function FourPanelLayout() {
  // Saved panel widths in state
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [messagesWidth, setMessagesWidth] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(500);
  // Chat width is calculated dynamically: 100vw - (sidebar + messages + rightPanel)

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMessagesCollapsed, setIsMessagesCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Panel width constraints
  const constraints = {
    sidebar: { min: 180, max: 200 },
    messages: { min: 250, max: 500 },
    chat: { min: 300 }, // Only minimum, no maximum since it fills remaining space
    rightPanel: { min: 200, max: 500 },
  };

  // Calculate panel widths with chat filling remaining space
  const getPanelWidths = () => {
    const totalWidth = containerRef.current?.clientWidth || 1200;
    const sidebarW = isSidebarCollapsed ? 88 : sidebarWidth;
    const messagesW = isMessagesCollapsed ? 88 : messagesWidth;
    const rightPanelW = isRightPanelCollapsed ? 64 : rightPanelWidth;

    // Ensure right panel has minimum width if not loaded from localStorage yet
    const finalRightPanelW = isLocalStorageLoaded
      ? rightPanelW
      : Math.max(rightPanelWidth, constraints.rightPanel.min);

    // Calculate chat width as remaining space
    const chatW = totalWidth - sidebarW - messagesW - finalRightPanelW;

    // Ensure chat has minimum width
    const finalChatW = Math.max(constraints.chat.min, chatW);

    // If chat needs more space, adjust messages width
    let finalMessagesW = messagesW;
    if (finalChatW > chatW) {
      finalMessagesW = Math.max(
        constraints.messages.min,
        messagesW - (finalChatW - chatW)
      );
    }

    const result = {
      sidebar: sidebarW,
      messages: finalMessagesW,
      chat: finalChatW,
      rightPanel: finalRightPanelW,
    };

    // Debug: verify total width
    const totalUsed =
      result.sidebar + result.messages + result.chat + result.rightPanel;
    console.log(
      "Panel widths:",
      result,
      "Total used:",
      totalUsed,
      "Container width:",
      totalWidth,
      "Chat calculated as:",
      totalWidth - sidebarW - finalMessagesW - finalRightPanelW,
      "localStorage loaded:",
      isLocalStorageLoaded
    );

    return result;
  };

  const panelWidths = getPanelWidths();

  // Load saved widths from localStorage
  useEffect(() => {
    try {
      const savedSidebarWidth = localStorage.getItem(
        "four-panel-sidebar-width"
      );
      const savedMessagesWidth = localStorage.getItem(
        "four-panel-messages-width"
      );
      const savedRightPanelWidth = localStorage.getItem(
        "four-panel-right-panel-width"
      );

      if (savedSidebarWidth) {
        const parsed = Number.parseFloat(savedSidebarWidth);
        if (
          !isNaN(parsed) &&
          parsed >= constraints.sidebar.min &&
          parsed <= constraints.sidebar.max
        ) {
          setSidebarWidth(parsed);
        }
      }

      if (savedMessagesWidth) {
        const parsed = Number.parseFloat(savedMessagesWidth);
        if (
          !isNaN(parsed) &&
          parsed >= constraints.messages.min &&
          parsed <= constraints.messages.max
        ) {
          setMessagesWidth(parsed);
        }
      }

      if (savedRightPanelWidth) {
        const parsed = Number.parseFloat(savedRightPanelWidth);
        if (
          !isNaN(parsed) &&
          parsed >= constraints.rightPanel.min &&
          parsed <= constraints.rightPanel.max
        ) {
          setRightPanelWidth(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load saved panel widths:", error);
    }
    setIsLocalStorageLoaded(true);
  }, []);

  // Save widths to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("four-panel-sidebar-width", sidebarWidth.toString());
    } catch (error) {
      console.error("Failed to save sidebar width:", error);
    }
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "four-panel-messages-width",
        messagesWidth.toString()
      );
    } catch (error) {
      console.error("Failed to save messages width:", error);
    }
  }, [messagesWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "four-panel-right-panel-width",
        rightPanelWidth.toString()
      );
    } catch (error) {
      console.error("Failed to save right panel width:", error);
    }
  }, [rightPanelWidth]);

  // Handle window resize to maintain full width
  useEffect(() => {
    const handleResize = () => {
      // Force re-calculation of panel widths when window resizes
      getPanelWidths();
      // Update state to trigger re-render with new widths
      setSidebarWidth((prev) => prev);
      setMessagesWidth((prev) => prev);
      setRightPanelWidth((prev) => prev);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    isSidebarCollapsed,
    isMessagesCollapsed,
    isRightPanelCollapsed,
    sidebarWidth,
    messagesWidth,
    rightPanelWidth,
    isLocalStorageLoaded,
  ]);

  // Mouse/touch event handlers for resizing
  const handleMouseDown = useCallback(
    (panel: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(panel);
    },
    []
  );

  const handleTouchStart = useCallback(
    (panel: string) => (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(panel);
    },
    []
  );

  const updateWidth = useCallback((panel: string, newWidth: number) => {
    const constraint = constraints[panel as keyof typeof constraints];
    const constrainedWidth = Math.max(
      constraint.min,
      "max" in constraint ? Math.min(constraint.max, newWidth) : newWidth
    );

    switch (panel) {
      case "sidebar":
        setSidebarWidth(constrainedWidth);
        break;
      case "messages":
        setMessagesWidth(constrainedWidth);
        break;
      case "rightPanel":
        setRightPanelWidth(constrainedWidth);
        break;
      // Chat width is calculated dynamically, no need to handle it here
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;

        switch (isDragging) {
          case "sidebar":
            updateWidth("sidebar", mouseX);
            break;
          case "messages":
            const sidebarW = isSidebarCollapsed ? 88 : sidebarWidth;
            updateWidth("messages", mouseX - sidebarW);
            break;
          case "rightPanel":
            updateWidth("rightPanel", containerRect.width - mouseX);
            break;
          // Chat panel resizing is handled by adjusting messages panel
        }

        rafRef.current = null;
      });
    },
    [
      isDragging,
      isSidebarCollapsed,
      isRightPanelCollapsed,
      sidebarWidth,
      rightPanelWidth,
      updateWidth,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Event listeners for mouse/touch events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove as any);
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove as any);
      document.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove as any);
      document.removeEventListener("touchend", handleMouseUp);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <StudentLayoutProvider>
      <div
        ref={containerRef}
        className="flex h-screen w-full bg-background overflow-hidden"
        style={{ cursor: isDragging ? "col-resize" : "auto" }}
      >
        {/* Sidebar Panel */}
        <div
          className="flex-shrink-0 bg-background border-r border-border"
          style={{ width: `${panelWidths.sidebar}px` }}
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

        {/* Messages Panel */}
        <div
          className="flex-shrink-0 bg-background border-r border-border overflow-hidden"
          style={{ width: `${panelWidths.messages}px` }}
        >
          <MessagesPanel
            className="h-full"
            onConversationSelect={setSelectedConversationId}
            selectedConversationId={selectedConversationId}
            isCollapsed={isMessagesCollapsed}
            onToggleCollapse={() =>
              setIsMessagesCollapsed(!isMessagesCollapsed)
            }
          />
        </div>

        {/* Messages Resizer */}
        <ResizableSeparator
          onMouseDown={handleMouseDown("messages")}
          onTouchStart={handleTouchStart("messages")}
          onToggle={() => setIsMessagesCollapsed(!isMessagesCollapsed)}
          isCollapsed={isMessagesCollapsed}
          toggleDirection="right"
          className="relative"
        />

        {/* Chat Panel */}
        <div
          className="flex-shrink-0 bg-background border-r border-border overflow-hidden"
          style={{ width: `${panelWidths.chat}px` }}
        >
          <ChatPanel
            className="h-full"
            conversationId={selectedConversationId}
            isMessagesCollapsed={isMessagesCollapsed}
          />
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
          style={{ width: `${panelWidths.rightPanel}px` }}
        >
          <RightPanel
            isCollapsed={isRightPanelCollapsed}
            onToggle={setIsRightPanelCollapsed}
          />
        </div>
      </div>
    </StudentLayoutProvider>
  );
}
