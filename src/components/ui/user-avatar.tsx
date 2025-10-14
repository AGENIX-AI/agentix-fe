import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { forwardRef, useMemo } from "react";

export const UserAvatar = forwardRef<
  HTMLSpanElement,
  {
    name: string;
    avatarUrl?: string | null;
    className?: string;
    onClick?: () => void;
  }
>(({ name, avatarUrl, className, onClick }, ref) => {
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join(""),
    [name]
  );

  const avatarSrc = useMemo(
    () =>
      avatarUrl
        ? avatarUrl.startsWith("http")
          ? avatarUrl
          : avatarUrl
        : undefined,
    [avatarUrl]
  );

  return (
    <Avatar ref={ref} className={cn(className)} onClick={onClick}>
      <AvatarImage src={avatarSrc} />
      <AvatarFallback className="bg-secondary/10 text-secondary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
});

UserAvatar.displayName = "UserAvatar";
