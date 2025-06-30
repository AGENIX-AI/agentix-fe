import { useState } from "react";
import { AdminContextProvider } from "@/contexts/AdminContext";
import AdminLayout from "./components/AdminLayout";

export default function AdminPortal() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <AdminContextProvider>
      <div className="flex h-screen bg-background">
        <AdminLayout
          onSidebarToggle={handleSidebarToggle}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>
    </AdminContextProvider>
  );
}
