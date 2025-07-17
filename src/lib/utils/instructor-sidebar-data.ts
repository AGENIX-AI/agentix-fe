import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Brain,
  AlignJustify,
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
          title: "Navigation",
          url: "#",
          icon: AlignJustify,
        },
        {
          title: "Dashboard",
          url: "/instructor",
          icon: LayoutDashboard,
        },
        {
          title: "Knowledge Base",
          url: "/instructor",
          icon: FileText,
        },
        {
          title: "Knowledge Components",
          url: "/instructor",
          icon: Brain,
        },
      ],
    },

    {
      title: "Other",
      items: [
        {
          title: "Help Center",
          url: "/",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
