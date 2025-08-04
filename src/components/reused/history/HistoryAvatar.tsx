import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface HistoryAvatarProps {
  imageSrc: string;
  alt?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function HistoryAvatar({
  imageSrc,
  alt = "Avatar",
  isActive = false,
  onClick,
  className,
}: HistoryAvatarProps) {
  return (
    <Avatar
      className={cn(
        "h-5 w-5 cursor-pointer border overflow-hidden",
        isActive ? "border-primary" : "border-accent",
        className
      )}
      onClick={onClick}
    >
      <AvatarImage src={imageSrc} alt={alt} />
    </Avatar>
  );
}

interface DualAvatarProps {
  primaryImageSrc: string;
  secondaryImageSrc: string;
  primaryAlt?: string;
  secondaryAlt?: string;
  onClick?: () => void;
}

export function DualAvatar({
  primaryImageSrc,
  secondaryImageSrc,
  primaryAlt = "Primary",
  secondaryAlt = "Secondary",
  onClick,
}: DualAvatarProps) {
  return (
    <div
      className="relative flex items-center justify-center h-8 w-8 cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-5 w-5 absolute left-0 bottom-0 border border-accent overflow-hidden">
        <AvatarImage src={primaryImageSrc} alt={primaryAlt} />
      </Avatar>
      <Avatar className="h-5 w-5 absolute right-0 top-0 border border-accent overflow-hidden">
        <AvatarImage src={secondaryImageSrc} alt={secondaryAlt} />
      </Avatar>
    </div>
  );
}
