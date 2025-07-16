import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Check, Info, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationsResponse,
} from "@/api/notifications";
import { useAuth } from "@/contexts/AuthContext";

// Notification type definition
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  position: {
    bottom: string;
    left: string;
  };
  onToggle?: () => void;
  isOpen?: boolean; // Optional external control of open state
}

export function NotificationCenter({ position, onToggle, isOpen: externalIsOpen }: NotificationCenterProps) {
  // Use internal state if no external state is provided
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const response: NotificationsResponse = await fetchNotifications(
        userInfo.id,
        1,
        20,
        false
      );

      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count);
      } else {
        console.error("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      // setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleToggle = () => {
    // Only update internal state if no external control is provided
    if (externalIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    }
    // Call external onToggle if provided
    if (onToggle) {
      onToggle();
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!userInfo?.id) return;

    try {
      const response = await markNotificationAsRead(
        userInfo.id,
        notificationId
      );
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userInfo?.id) return;

    try {
      const response = await markAllNotificationsAsRead(userInfo.id);
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Don't render if no user info
  if (!userInfo?.id) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="w-4 h-4 p-0 hover:bg-transparent opacity-50"
          disabled
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Notification Trigger */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="w-4 h-4 p-0 hover:bg-transparent notification-bell-button"
          onClick={handleToggle}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs font-medium bg-primary text-primary-foreground rounded-full px-1 min-w-[16px] text-center leading-4">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              if (externalIsOpen === undefined) {
                setInternalIsOpen(false);
              }
              if (onToggle) {
                onToggle();
              }
            }}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="fixed z-50 w-80 bg-background border border-border rounded-lg shadow-lg"
            style={{
              bottom: position.bottom,
              left: position.left,
              maxHeight: "400px",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="font-medium text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    if (externalIsOpen === undefined) {
                      setInternalIsOpen(false);
                    }
                    if (onToggle) {
                      onToggle();
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="max-h-80">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <div className="text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                        !notification.isRead && "bg-accent/20"
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3 text-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
