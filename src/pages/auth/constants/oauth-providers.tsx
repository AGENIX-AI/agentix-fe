import React from "react";

export type OAuthProvider = "google" | "github";

interface OAuthProviderConfig {
  label: string;
  icon: React.ReactNode;
}

export const oAuthProviders: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    label: "auth.providers.google",
    icon: <span className="mr-1.5">G</span>, // Placeholder for Google icon
  },
  github: {
    label: "auth.providers.github",
    icon: <span className="mr-1.5">GH</span>, // Placeholder for GitHub icon
  },
};
