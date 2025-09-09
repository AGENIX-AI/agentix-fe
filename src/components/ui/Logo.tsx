import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  className?: string;
  withLabel?: boolean;
}

export function Logo({ className }: LogoProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Initialize with null to prevent empty src
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  // Only update the logo source after component has mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setLogoSrc(
        resolvedTheme === "dark"
          ? "https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/edvara-image/head-logo-dark.png"
          : "https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/edvara-image/head-logo-light.png"
      );
    }
  }, [resolvedTheme, mounted]);

  // Don't render the image until we have a valid logoSrc
  if (!logoSrc) {
    return (
      <span
        className={cn(
          "flex items-center font-semibold text-foreground leading-none w-30",
          className
        )}
        onClick={() => navigate("/home")}
      >
        {/* Placeholder or loading state */}
        <div className="w-8 h-8" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center font-semibold text-foreground leading-none w-30",
        className
      )}
      onClick={() => navigate("/home")}
    >
      <img src={logoSrc} alt="AgentIX Logo" />
    </span>
  );
}
