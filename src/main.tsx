import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./styles/globals.css";
import "@copilotkit/react-ui/styles.css";
import "./i18n"; // Import i18n configuration
import App from "./App";
import * as Sentry from "@sentry/react";
import { CopilotKit } from "@copilotkit/react-core";
import Cookies from "js-cookie";
import { getCopilotContext } from "./components/copilot/CopilotIntegrator";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  tunnel: "/sentry-tunnel", // forward events via same-origin proxy
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CopilotKit
      publicLicenseKey="ck_pub_c45823d2382fbfe0cbf5e5d555145ee0"
      properties={getCopilotContext()}
      credentials="include"
      headers={{
        ...(Cookies.get("agentix_access_token")
          ? { Authorization: `Bearer ${Cookies.get("agentix_access_token")}` }
          : {}),
        ...(Cookies.get("agentix_refresh_token")
          ? {
              "X-Refresh-Token": Cookies.get("agentix_refresh_token") as string,
            }
          : {}),
      }}
    >
      <ThemeProvider>
        <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
          <App />
        </Sentry.ErrorBoundary>
      </ThemeProvider>
    </CopilotKit>
  </StrictMode>
);
