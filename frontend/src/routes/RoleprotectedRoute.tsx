import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux.hooks";

interface Props {
  allowedRole: "user" | "tenant";
}

const RoleProtectedRoute = ({ allowedRole }: Props) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user?.role !== allowedRole) {
    
    return <Navigate to={user?.role === "tenant" ? "/tenant/dashboard" : "/home"} />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;