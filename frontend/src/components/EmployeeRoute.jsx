import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function EmployeeRoute() {
  const { isEmployee } = useAuth();
  const location = useLocation();

  if (!isEmployee) {
    return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
