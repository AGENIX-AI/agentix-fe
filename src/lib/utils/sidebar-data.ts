import {
  AudioWaveform,
  CheckSquare,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
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
        {
          title: "AI Assistant",
          url: "/",
          icon: CheckSquare,
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
