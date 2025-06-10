import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = () => {
  const { isAuthenticated, loading, needsApproval, needsWaitlistForm } = useAuth();
  const location = useLocation();

  // If still loading, don't redirect yet, just show nothing or a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // If user needs approval, redirect to waitlist page
  if (needsApproval) {
    return <Navigate to="/auth/waitlist" replace />;
  }
  
  // If user needs to fill in the waitlist form
  if (needsWaitlistForm) {
    return <Navigate to="/auth/waitlist/form" replace />;
  }

  // Only redirect to login if we've finished loading and the user is not authenticated
  // If authenticated, render the child routes (Outlet)
  // When redirecting to login, add the current path as a redirectPath query parameter
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate 
      to={`/auth/login?redirectPath=${encodeURIComponent(location.pathname)}`} 
      replace 
    />
  );
};

export default PrivateRoute;
