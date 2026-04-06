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
    const redirectPath = user.role === 'tenant' ? "/tenant/dashboard" : "/home";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

