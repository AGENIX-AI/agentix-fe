import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Typography } from "./typography";

export interface EmptyPageProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
}

export function EmptyPage({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
  iconClassName,
  contentClassName
}: EmptyPageProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center p-6", className)}>
      {icon && (
        <div className={cn("mb-4 text-muted-foreground", iconClassName)}>
          {icon}
        </div>
      )}
      <div className={cn("flex flex-col items-center text-center", contentClassName)}>
        {title && (
          <Typography variant="h3" className="mb-2">
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="muted" className="mb-4 max-w-md">
            {description}
          </Typography>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
