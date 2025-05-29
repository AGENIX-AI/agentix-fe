import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  withLabel?: boolean;
}

export function Logo({ withLabel = true, className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Use a default initial state that matches server rendering
  const [logoSrc, setLogoSrc] = useState("/images/logo/head-logo-light.png");
  console.log(withLabel);

  // Only update the logo source after component has mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (mounted) {
      setLogoSrc(
        resolvedTheme === "dark"
          ? "https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/edvara-image/head-logo-dark.png"
          : "https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/edvara-image/head-logo-light.png"
      );
    }
  }, [resolvedTheme, mounted]);

  return (
    <span
      className={cn(
        "flex items-center font-semibold text-foreground leading-none w-30",
        className
      )}
    >
      <img src={logoSrc} alt="Edvara Logo" />
    </span>
  );
}
