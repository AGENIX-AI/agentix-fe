import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Bot,
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
          url: "/instructor",
          icon: LayoutDashboard,
        },
        // {
        //   title: "Knowledge Base",
        //   url: "/instructor",
        //   icon: FileText,
        // },
        // {
        //   title: "Knowledge Components",
        //   url: "/instructor",
        //   icon: Bot,
        // },
        {
          title: "Knowledge Base",
          url: "/instructor",
          icon: FileText,
        },
        {
          title: "Assistant Management",
          url: "/instructor/",
          icon: Bot,
        },
      ],
    },

    {
      title: "Other",
      items: [
        {
          title: "Help Center",
          url: "/instructor",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
