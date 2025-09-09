import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./styles/globals.css";
import "@copilotkit/react-ui/styles.css";
import "./i18n"; // Import i18n configuration
import App from "./App";
import * as Sentry from "@sentry/react";
import { CopilotKit } from "@copilotkit/react-core";
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
      publicLicenseKey={import.meta.env.VITE_COPILOT_PUBLIC_LICENSE_KEY}
      properties={getCopilotContext()}
      credentials="include"
      showDevConsole={false}
    >
      <ThemeProvider>
        <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
          <App />
        </Sentry.ErrorBoundary>
      </ThemeProvider>
    </CopilotKit>
  </StrictMode>
);
