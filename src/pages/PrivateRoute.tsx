import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If still loading, don't redirect yet, just show nothing or a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Only redirect to login if we've finished loading and the user is not authenticated
  // If authenticated, render the child routes (Outlet)
  // When redirecting to login, add the current path as a redirectPath query parameter
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate 
      to={`/login?redirectPath=${encodeURIComponent(location.pathname)}`} 
      replace 
    />
  );
};

export default PrivateRoute;
