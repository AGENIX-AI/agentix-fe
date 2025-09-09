import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Pages

import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import MagicLink from "./pages/auth/magic-link/MagicLink";
import OAuthCallback from "./pages/auth/callback/OAuthCallback";
import Waitlist from "./pages/auth/waitlist/Waitlist";
import WaitlistForm from "./pages/auth/waitlist/WaitlistForm";
import AdminPortal from "./pages/admin/admin";
import WorkspaceOnboarding from "./pages/workspaces/WorkspaceOnboarding";

// Components
import PrivateRoute from "./pages/PrivateRoute";
import { CopilotIntegrator } from "./components/copilot/CopilotIntegrator";

// Context
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/student/student";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/magic-link" element={<MagicLink />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/waitlist" element={<Waitlist />} />
          <Route path="/auth/waitlist/form" element={<WaitlistForm />} />
          <Route
            path="/onboarding/workspace"
            element={<WorkspaceOnboarding />}
          />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/admin/*" element={<AdminPortal />} />
            {/* Add more protected routes here */}
          </Route>

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        {/* Global Copilot popup so it can navigate and access router context */}
        <CopilotIntegrator />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
