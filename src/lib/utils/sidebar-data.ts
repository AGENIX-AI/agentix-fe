import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  UserSearch,
  FileText,
} from "lucide-react";
import type { SidebarData } from "./types/sidebar";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        // {
        //   title: "AI Assistant",
        //   url: "/",
        //   icon: CheckSquare,
        // },
        {
          title: "Find Instructor",
          url: "/student",
          icon: UserSearch,
        },
        {
          title: "Posts",
          url: "/student",
          icon: FileText,
        },
      ],
    },

    {
      title: "Other",
      items: [
        {
          title: "Help Center",
          url: "/student/",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
