import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";

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
} from "@/components/ui/dropdown-menu";
import {
  BookIcon,
  CreditCardIcon,
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
import { useInstructor } from "@/contexts/InstructorContext";
declare const __BUILD_NUMBER__: string;

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
  const { setRightPanel } = useInstructor();

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

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex cursor-pointer w-full items-center justify-between gap-2 outline-hidden focus-visible:ring-2 focus-visible:ring-primary md:py-1.5",
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

      <DropdownMenuContent align="end" className="w-[280px] p-3 ml-3 z-150">
        <DropdownMenuLabel className="text-sm">
          {userInfo.metadata.full_name}
          <span className="block font-normal text-xs truncate">
            {userInfo.metadata.email}
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
            <DropdownMenuSubContent className="w-[200px] ml-2">
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

        <DropdownMenuItem
          onClick={() => setRightPanel("editProfile")}
          className="text-xs py-2 cursor-pointer"
        >
          <SettingsIcon className="mr-2 size-5" />
          <span className="text-xs">
            {t("app.userMenu.accountSettings", "Account Settings")}
          </span>
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
          <a href="https://edvara.net/">
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
