import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { UserAvatar } from "../../../../components/ui/user-avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  BookIcon,
  CreditCardIcon,
  GlobeIcon,
  HardDriveIcon,
  HomeIcon,
  LogOutIcon,
  MoonIcon,
  MoreVerticalIcon,
  Notebook,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/contexts/StudentContext";
import { UserIcon } from "lucide-react";

export function UserMenu({
  showUserName,
  className,
}: {
  showUserName?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const { userInfo } = useAuth();
  const { setTheme: setCurrentTheme, theme: currentTheme } = useTheme();
  const [theme, setTheme] = useState<string>(currentTheme ?? "system");
  const [language, setLanguage] = useState<string>(i18n.language);
  const { signOut } = useAuth();
  const { setRightPanel } = useStudent();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current mode based on URL path
  const [currentMode, setCurrentMode] = useState<string>(
    location.pathname.includes("/instructor") ? "instructor" : "student"
  );

  const colorModeOptions = [
    {
      value: "system",
      label: "System",
      icon: HardDriveIcon,
    },
    {
      value: "light",
      label: "Light",
      icon: SunIcon,
    },
    {
      value: "dark",
      label: "Dark",
      icon: MoonIcon,
    },
  ];

  const languageOptions = [
    {
      value: "en",
      label: t("language_en", "English"),
    },
    {
      value: "vi",
      label: t("language_vi", "Vietnamese"),
    },
  ];

  const modeOptions = [
    {
      value: "student",
      label: "Student",
      icon: UserIcon,
    },
    {
      value: "instructor",
      label: "Instructor",
      icon: UserIcon,
    },
  ];

  const onLogout = () => {
    localStorage.removeItem("student_state");
    localStorage.removeItem("student_rightPanel");
    localStorage.removeItem("instructor_state");
    localStorage.removeItem("chat-input");
    signOut();
  };

  if (!userInfo) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex cursor-pointer w-full items-center gap-2 outline-hidden focus-visible:ring-2 focus-visible:ring-primary md:py-1.5",
            showUserName ? "justify-between" : "justify-center",
            className
          )}
          aria-label="User menu"
        >
          {showUserName ? (
            <>
              <span className="flex items-center gap-1 flex-1 min-w-0">
                <UserAvatar
                  name={userInfo.metadata.full_name ?? ""}
                  avatarUrl={userInfo.metadata.avatar_url}
                  className="ml-[14px]"
                />
                <span className="text-left leading-tight flex-1 min-w-0 ml-[2px]">
                  <span className="font-medium text-xs block truncate">
                    {userInfo.metadata.full_name}
                  </span>
                  <span className="block text-xs opacity-70 truncate">
                    {userInfo.metadata.email}
                  </span>
                </span>
              </span>
              <MoreVerticalIcon className="size-4" />
            </>
          ) : (
            <UserAvatar
              name={userInfo.metadata.full_name ?? ""}
              avatarUrl={userInfo.metadata.avatar_url}
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[320px] p-3 ml-2 z-150">
        <DropdownMenuLabel className="text-xs">
          {userInfo.metadata.full_name}
          <span className="block font-normal text-xs break-words">
            {userInfo.metadata.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs py-2 cursor-pointer">
            <UserIcon className="mr-2 size-5" />
            <span className="text-xs ml-2">
              {t("app.userMenu.mode", "Mode")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-[280px] ml-2">
              <DropdownMenuRadioGroup
                value={currentMode}
                onValueChange={(value) => {
                  setCurrentMode(value);
                  if (value === "student") {
                    navigate("/student");
                  } else {
                    navigate("/instructor");
                  }
                }}
              >
                {modeOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="text-xs py-2"
                  >
                    <option.icon className="mr-2 size-5 opacity-50" />
                    <span className="text-xs mr-2">{option.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Color mode selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs py-2 cursor-pointer">
            <SunIcon className="mr-2 size-5" />
            <span className="text-xs ml-2">
              {t("app.userMenu.colorMode", "Color Mode")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-[280px] ml-2">
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => {
                  setTheme(value);
                  setCurrentTheme(value);
                }}
              >
                {colorModeOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="text-xs py-2"
                  >
                    <option.icon className="mr-2 size-5 opacity-50" />
                    <span className="text-xs mr-2">{option.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Language selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs py-2 cursor-pointer">
            <GlobeIcon className="mr-2 size-5" />
            <span className="text-xs ml-2">
              {t("app.userMenu.language", "Language")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-[200px] ml-2">
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  i18n.changeLanguage(value);
                }}
              >
                {languageOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="text-xs py-2"
                  >
                    <span className="text-xs mr-2">{option.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="text-xs py-2 cursor-pointer">
          <Link to="/settings/general">
            <SettingsIcon className="mr-2 size-5" />
            <span className="text-xs">
              {t("app.userMenu.accountSettings", "Account Settings")}
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setRightPanel("buyCredits")}
          className="text-xs py-2 cursor-pointer"
        >
          <CreditCardIcon className="mr-2 size-5" />
          <span className="text-xs">
            {t("app.userMenu.buyCredits", "Buy Credits")}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="text-xs py-2 cursor-pointer">
          <a href="https://edvara.net">
            <BookIcon className="mr-2 size-5" />
            <span className="text-xs">
              {t("app.userMenu.documentation", "Documentation")}
            </span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs py-2 cursor-pointer">
          <div
            onClick={() => {
              setRightPanel("blogs");
            }}
          >
            <Notebook className="mr-2 size-5" />
            <span className="text-xs">{t("app.userMenu.blogs", "Blogs")}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs py-2 cursor-pointer">
          <Link to="/">
            <HomeIcon className="mr-2 size-5" />
            <span className="text-xs">{t("app.userMenu.home", "Home")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onLogout}
          className="text-xs py-2 cursor-pointer"
        >
          <LogOutIcon className="mr-2 size-5" />
          <span className="text-xs">{t("app.userMenu.logout", "Logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
