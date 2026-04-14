import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux.hooks";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {

  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    let redirectPath = "/home";
    if (user.role === 'tenant') {
      redirectPath = "/tenant/dashboard";
    } else if (user.role === 'admin') {
      redirectPath = "/admin/dashboard";
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

