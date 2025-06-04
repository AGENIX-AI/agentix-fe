import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages

import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import MagicLink from "./pages/auth/magic-link/MagicLink";
import OAuthCallback from "./pages/auth/callback/OAuthCallback";
import Instructor from "./pages/instructor/Instructor";
import Waitlist from "./pages/auth/waitlist/Waitlist";

// Components
import PrivateRoute from "./pages/PrivateRoute";

// Context
import { AuthProvider } from "./contexts/AuthContext";
import Student from "./pages/student/student";

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

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/instructor" element={<Instructor />} />
            <Route path="/student" element={<Student />} />
            {/* Add more protected routes here */}
          </Route>

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
