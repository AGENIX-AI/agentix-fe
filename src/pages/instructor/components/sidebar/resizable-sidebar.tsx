import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Menu, X, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sidebarData } from "@/lib/utils/instructor-sidebar-data";
import { Separator } from "@/components/ui/separator";
import { useInstructor } from "@/contexts/InstructorContext";
import { UserMenu } from "../userMenu/user-menu";
import { useCreditsPolling } from "@/hooks/useCreditsPolling";
import { NotificationCenter } from "@/components/custom/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";

export interface ResizableSidebarProps {
  className?: string;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
}

export function ResizableSidebar({
  className,
  initialWidth = 260,
  minWidth = 180,
  maxWidth = 400,
  storageKey = "edvara-sidebar-width",
}: ResizableSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  // For notification center
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [width, setWidth] = useState<number>(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastWidthRef = useRef<number>(initialWidth);
  const { setRightPanel } = useInstructor();
  const { } = useAuth();
  // Poll credits every 5 seconds
  const { credits, error: creditsError } = useCreditsPolling(5000);

  // Store the last expanded width to restore when uncollapsing
  const lastExpandedWidthRef = useRef<number>(initialWidth);

  // Update lastExpandedWidthRef when width changes and not collapsed
  useEffect(() => {
    if (!isCollapsed && width > minWidth) {
      lastExpandedWidthRef.current = width;
    }
  }, [width, isCollapsed, minWidth]);

  // Handle collapse state changes
  useEffect(() => {
    if (isCollapsed) {
      setWidth(minWidth);
    } else {
      setWidth(lastExpandedWidthRef.current);
    }
  }, [isCollapsed, minWidth]);

  // Load saved width from localStorage after component mounts
  useEffect(() => {
    if (initializedRef.current) return;

    try {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsed = Number.parseFloat(savedWidth);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          setWidth(isCollapsed ? minWidth : parsed);
          lastWidthRef.current = parsed;
          lastExpandedWidthRef.current = parsed;
        }
      }
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }

    initializedRef.current = true;
  }, [storageKey, minWidth, maxWidth, isCollapsed]);

  // Save width to localStorage when it changes, debounced
  useEffect(() => {
    if (!initializedRef.current || isCollapsed) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, width.toString());
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [width, storageKey, isCollapsed]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleExpandItem = (itemTitle: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  const isItemExpanded = (itemTitle: string) =>
    expandedItems[itemTitle] === true;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) return; // Prevent resizing when collapsed
      e.preventDefault();
      setIsDragging(true);
    },
    [isCollapsed]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isCollapsed) return; // Prevent resizing when collapsed
      e.preventDefault();
      setIsDragging(true);
    },
    [isCollapsed]
  );

  const updateWidth = useCallback((newWidth: number) => {
    // Only update if the change is significant (more than 0.5px)
    if (Math.abs(newWidth - lastWidthRef.current) < 0.5) return;

    setWidth(newWidth);
    lastWidthRef.current = newWidth;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sidebarRef.current) return;

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule a new animation frame
      rafRef.current = requestAnimationFrame(() => {
        if (!sidebarRef.current) return;

        const newWidth = e.clientX;

        // Apply constraints
        const constrainedWidth = Math.max(
          minWidth,
          Math.min(maxWidth, newWidth)
        );

        updateWidth(constrainedWidth);
        rafRef.current = null;
      });
    },
    [isDragging, minWidth, maxWidth, updateWidth]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !sidebarRef.current || !e.touches[0]) return;

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule a new animation frame
      rafRef.current = requestAnimationFrame(() => {
        if (!sidebarRef.current || !e.touches[0]) return;

        const newWidth = e.touches[0].clientX;

        // Apply constraints
        const constrainedWidth = Math.max(
          minWidth,
          Math.min(maxWidth, newWidth)
        );

        updateWidth(constrainedWidth);
        rafRef.current = null;
      });
    },
    [isDragging, minWidth, maxWidth, updateWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove as any);
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove as any);
      document.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove as any);
      document.removeEventListener("touchend", handleMouseUp);

      // Clean up any animation frame on unmount
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Custom Badge component to match NavBadge styling
  const NavBadge = ({ children }: { children: React.ReactNode }) => (
    <Badge className="rounded-full px-1 py-0 text-xs bg-secondary text-secondary-foreground">
      {children}
    </Badge>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar container */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-background border-r border-border transition-transform duration-300 ease-in-out",
          isDragging ? "" : "transition-width duration-150",
          "md:translate-x-0 md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed && "sidebar-collapsed",
          className
        )}
        style={{ width: isCollapsed ? "64px" : `${width}px` }}
      >
        {/* Navigation groups */}
        <div
          className="p-2 overflow-y-auto no-scrollbar"
          style={{ maxHeight: "calc(100vh - 240px)" }}
        >
          {sidebarData.navGroups.map((navGroup, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <ul className="space-y-1 mt-1">
                {navGroup.items.map((navItem, itemIndex) => {
                  const Icon = navItem.icon;
                  const hasSubItems =
                    "items" in navItem &&
                    navItem.items &&
                    navItem.items.length > 0;
                  const isExpanded =
                    hasSubItems && isItemExpanded(navItem.title);

                  return (
                    <li key={itemIndex}>
                      {hasSubItems ? (
                        <>
                          <button
                            className={cn(
                              "flex items-center w-full px-3 py-2 text-sm rounded-md cursor-pointer",
                              "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                              isExpanded &&
                                "bg-secondary text-secondary-foreground",
                              isCollapsed && "justify-center px-2"
                            )}
                            onClick={() => toggleExpandItem(navItem.title)}
                            title={isCollapsed ? navItem.title : undefined}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            {!isCollapsed && (
                              <span className="ml-2 flex-1 truncate text-left">
                                {navItem.title}
                              </span>
                            )}
                            {!isCollapsed && navItem.badge && (
                              <NavBadge>{navItem.badge}</NavBadge>
                            )}
                            {!isCollapsed &&
                              (isExpanded ? (
                                <ChevronDown className="h-4 w-4 ml-auto" />
                              ) : (
                                <ChevronRight className="h-4 w-4 ml-auto" />
                              ))}
                          </button>

                          {isExpanded && !isCollapsed && (
                            <ul className="pl-6 mt-1 space-y-1">
                              {(navItem as any).items.map(
                                (subItem: any, subIndex: number) => {
                                  const SubIcon = subItem.icon;
                                  return (
                                    <li key={subIndex}>
                                      <Link
                                        to={subItem.url || "#"}
                                        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200"
                                      >
                                        {SubIcon && (
                                          <SubIcon className="h-4 w-4" />
                                        )}
                                        <span className="ml-2 flex-1 text-left text-xs  ">
                                          {subItem.title}
                                        </span>
                                        {subItem.badge && (
                                          <NavBadge>{subItem.badge}</NavBadge>
                                        )}
                                      </Link>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          to={(navItem as any).url || "#"}
                          className={cn(
                            "flex items-center px-2 py-2 text-xs rounded-md transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                            isCollapsed && "justify-center px-2"
                          )}
                          title={isCollapsed ? navItem.title : undefined}
                          onClick={() => {
                            if (navItem.title === "Knowledge Base") {
                              setRightPanel("addDocument");
                            }
                            if (navItem.title === "Dashboard") {
                              setRightPanel("dashboard");
                            }
                            if (navItem.title === "Knowledge Components") {
                              setRightPanel("topicKnowledge");
                            }
                            if (navItem.title === "Toggle") {
                              setIsCollapsed(!isCollapsed);
                            }
                          }}
                        >
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 ${
                                !isCollapsed ? "ml-2" : ""
                              }`}
                            />
                          )}
                          {!isCollapsed && (
                            <span className="ml-2 flex-1 truncate text-left">
                              {navItem.title}
                            </span>
                          )}
                          {!isCollapsed && navItem.badge && (
                            <NavBadge>{navItem.badge}</NavBadge>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Separator className="my-2" />
            </div>
          ))}
        </div>

        {/* Footer with Credits and UserMenu */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 border-border p-2 space-y-1"
          )}
        >
          {/* Notification Center */}
          <div
            className={cn(
              "flex items-center px-4 py-2 text-xs rounded-md transition-colors duration-200 hover:bg-accent hover:text-accent-foreground cursor-pointer",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Notifications" : undefined}
            style={{ zIndex: 9999 }}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <div className="relative">
              <NotificationCenter
                position={{
                  bottom: "120px",
                  left: isCollapsed ? "70px" : `${width + 10}px`,
                }}
                onToggle={() => setNotificationsOpen(!notificationsOpen)}
                isOpen={notificationsOpen}
              />
            </div>
            {!isCollapsed && (
              <span className="ml-2 flex-1 truncate text-left">
                Notifications
              </span>
            )}
          </div>
          {/* Credits Display */}
          {credits && !creditsError && (
            <div
              className={cn(
                "flex items-center px-4 py-2 text-xs rounded-md transition-colors duration-200",
                isCollapsed && "justify-center px-2"
              )}
              title={
                isCollapsed
                  ? `Credits: ${credits.balance.toLocaleString()}`
                  : undefined
              }
            >
              <div className="relative">
                <Gem className="h-4 w-4" />
                {isCollapsed && (
                  <span>
                    {credits.balance > 999
                      ? `${Math.floor(credits.balance / 1000)}k`
                      : credits.balance.toString()}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="ml-2 flex-1 truncate text-left">
                  {credits.balance.toLocaleString()} Credits
                </span>
              )}
            </div>
          )}
          <UserMenu
            showUserName={!isCollapsed}
            className={cn("w-full", isCollapsed ? "justify-center" : "")}
          />
        </div>

        {/* Resize handle */}
        {!isCollapsed && (
          <div
            className={cn(
              "absolute top-0 bottom-0 right-0 w-1 cursor-col-resize transition-colors group"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute inset-y-0 right-0 flex items-center justify-center"></div>
          </div>
        )}
      </aside>
    </>
  );
}
