import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { adminSidebarData } from "@/lib/utils/admin-sidebar-data";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const [, setHoveredItem] = useState<string | null>(null);

  const isActiveItem = (url: string) => {
    if (url === "/admin/dashboard") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard"
      );
    }
    return location.pathname.startsWith(url);
  };

  const toggleSidebar = () => {
    onToggle(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300 h-screen",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-18">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Logo />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {adminSidebarData.navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                {group.title}
              </h3>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveItem(item.url);

              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    isCollapsed && "justify-center"
                  )}
                  onMouseEnter={() => setHoveredItem(item.title)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? item.title : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Menu */}
    </div>
  );
}
