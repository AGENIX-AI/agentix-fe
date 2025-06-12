import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { UserAvatar } from "./user-avatar";

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
} from "./dropdown-menu";
import {
  BookIcon,
  GlobeIcon,
  HardDriveIcon,
  HomeIcon,
  LogOutIcon,
  MoonIcon,
  MoreVerticalIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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

  useEffect(() => {}, []);

  const onLogout = () => {
    signOut();
  };

  if (!userInfo) {
    return null;
  }
  console.log(userInfo.metadata.avatar_url);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex cursor-pointer w-full items-center justify-between gap-2 outline-hidden focus-visible:ring-2 focus-visible:ring-primary md:w-[100%+1rem] md:px-2 md:py-1.5",
            className
          )}
          aria-label="User menu"
        >
          <span className="flex items-center gap-2">
            <UserAvatar
              name={userInfo.metadata.full_name ?? ""}
              avatarUrl={userInfo.metadata.avatar_url}
            />
            {showUserName && (
              <span className="text-left leading-tight">
                <span className="font-medium text-sm">
                  {userInfo.metadata.full_name}
                </span>
                <span className="block text-xs opacity-70 truncate max-w-[150px]">
                  {userInfo.metadata.email}
                </span>
                <span className="text-[9px] block font-normal text-xs truncate">
                  {/* v.{version}.{lastBuildDate} */}
                </span>
              </span>
            )}
          </span>

          {showUserName && <MoreVerticalIcon className="size-4" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-3 ml-2">
        <DropdownMenuLabel className="text-sm">
          {userInfo.metadata.full_name}
          <span className="block font-normal text-xs truncate">
            {userInfo.metadata.email}
          </span>
          <span className="text-[9px] block font-normal text-xs truncate">
            {/* v.{version}.{lastBuildDate} */}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Color mode selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs py-2 cursor-pointer">
            <SunIcon className="mr-2 size-5" />
            <span className="text-xs ml-2">
              {t("app.userMenu.colorMode", "Color Mode")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-56 ml-4">
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
            <DropdownMenuSubContent className="w-56 ml-4">
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

        <DropdownMenuItem asChild className="text-xs py-2 cursor-pointer">
          <a href="https://supastarter.dev/docs/nextjs">
            <BookIcon className="mr-2 size-5" />
            <span className="text-xs">
              {t("app.userMenu.documentation", "Documentation")}
            </span>
          </a>
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
