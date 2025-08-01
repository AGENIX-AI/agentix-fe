import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  Users,
  Settings,
  DollarSign,
  Package,
  Ticket,
  HelpCircle,
  FileText,
} from "lucide-react";
import type { SidebarData } from "./types/sidebar";

export const adminSidebarData: SidebarData = {
  user: {
    name: "EduAI Admin",
    email: "admin@eduai.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "EduAI",
      logo: Bot,
      plan: "Admin Portal",
    },
  ],
  navGroups: [
    {
      title: "Administration",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Assistants",
          url: "/admin/assistants",
          icon: Bot,
        },
        {
          title: "Instructors",
          url: "/admin/instructors",
          icon: GraduationCap,
        },
        {
          title: "Students",
          url: "/admin/students",
          icon: Users,
        },
        {
          title: "Revenue",
          url: "/admin/revenue",
          icon: DollarSign,
        },
        {
          title: "Packages",
          url: "/admin/packages",
          icon: Package,
        },
        {
          title: "Vouchers",
          url: "/admin/vouchers",
          icon: Ticket,
        },
        {
          title: "Help Center",
          url: "/admin/help-center",
          icon: HelpCircle,
        },
        {
          title: "Blogs",
          url: "/admin/blogs",
          icon: FileText,
        },
        {
          title: "Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
};
