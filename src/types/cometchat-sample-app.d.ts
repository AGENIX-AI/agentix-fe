declare module "../../../sample-app/src/context/AppContext" {
  import type { ReactNode, FC } from "react";
  export const AppContextProvider: FC<{ children: ReactNode }>;
}

declare module "../../../sample-app/src/context/AppContext.jsx" {
  import type { ReactNode, FC } from "react";
  export const AppContextProvider: FC<{ children: ReactNode }>;
}

declare module "../../../sample-app/src/components/CometChatHome/CometChatHome" {
  import type { FC } from "react";
  export const CometChatHome: FC<{
    theme?: string;
    onToggleCollapse?: () => void;
    isMessagesCollapsed?: boolean;
  }>;
}

// Type the wrapper barrel so downstream imports see the extended props
declare module "@/thirdparty/cometchat-sample" {
  import type { FC, ReactNode } from "react";
  export const AppContextProvider: FC<{ children: ReactNode }>;
  export const CometChatHome: FC<{
    theme?: string;
    onToggleCollapse?: () => void;
    isMessagesCollapsed?: boolean;
  }>;
  export function setupLocalization(language?: string): void;
  export const metaInfo: any;
  export const COMETCHAT_CONSTANTS: {
    APP_ID: string;
    REGION: string;
    AUTH_KEY: string;
  };
}

declare module "../../../sample-app/src/utils/utils" {
  export function setupLocalization(language?: string): void;
}

declare module "../../../sample-app/src/metaInfo" {
  export const metaInfo: any;
}

declare module "../../../sample-app/src/AppConstants" {
  export const COMETCHAT_CONSTANTS: {
    APP_ID: string;
    REGION: string;
    AUTH_KEY: string;
  };
}
