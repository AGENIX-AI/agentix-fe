import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminDashboard } from "./AdminDashboard";
import { AdminAssistants } from "./AdminAssistants";
import { AdminInstructors } from "./AdminInstructors";
import { AdminStudents } from "./AdminStudents";
import { AdminRevenue } from "./AdminRevenue";
import { AdminPackages } from "./AdminPackages";
import { AdminVouchers } from "./AdminVouchers";
import { AdminSettings } from "./AdminSettings";
import { AdminHelpCenter } from "./AdminHelpCenter";
import { AdminBlogs } from "./AdminBlogs";
import HelpTopicEditPage from "./HelpTopicEditPage";
import HelpTopicCreatePage from "./HelpTopicCreatePage";
import BlogCreatePage from "./BlogCreatePage";

interface AdminLayoutProps {
  onSidebarToggle: (collapsed: boolean) => void;
  isSidebarCollapsed: boolean;
}

export default function AdminLayout({
  onSidebarToggle,
  isSidebarCollapsed,
}: AdminLayoutProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/assistants")) return "Assistants";
    if (path.includes("/instructors")) return "Instructors";
    if (path.includes("/students")) return "Students";
    if (path.includes("/revenue")) return "Revenue & Transactions";
    if (path.includes("/packages")) return "Package Management";
    if (path.includes("/vouchers")) return "Voucher Management";
    if (path.includes("/help-center")) return "Help Center";
    if (path.includes("/blogs")) return "Blogs";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={onSidebarToggle}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader
          title={getPageTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content */}
        <main className="flex-1 p-6 bg-muted/20 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route
              path="/assistants"
              element={<AdminAssistants searchQuery={searchQuery} />}
            />
            <Route
              path="/instructors"
              element={<AdminInstructors searchQuery={searchQuery} />}
            />
            <Route
              path="/students"
              element={<AdminStudents searchQuery={searchQuery} />}
            />
            <Route path="/revenue" element={<AdminRevenue />} />
            <Route path="/packages" element={<AdminPackages />} />
            <Route
              path="/vouchers"
              element={<AdminVouchers searchQuery={searchQuery} />}
            />
            <Route path="/help-center" element={<AdminHelpCenter />} />
            <Route
              path="/help-center/topics/:topicId/edit"
              element={<HelpTopicEditPage />}
            />
            <Route
              path="/help-center/collections/:mainId/topics/new"
              element={<HelpTopicCreatePage />}
            />
            <Route
              path="/blogs"
              element={<AdminBlogs searchQuery={searchQuery} />}
            />
            <Route path="/blogs/new" element={<BlogCreatePage />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
