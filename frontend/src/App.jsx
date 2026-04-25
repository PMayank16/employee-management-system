import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { EmployeeRoute } from "@/components/EmployeeRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Login from "@/pages/Login";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";
import Leave from "@/pages/Leave";
import Payroll from "@/pages/Payroll";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/employees" element={<Employees />} />
                <Route path="/admin/attendance" element={<Attendance />} />
                <Route path="/admin/leaves" element={<Leave />} />
                <Route path="/admin/payroll" element={<Payroll />} />
              </Route>
              <Route element={<EmployeeRoute />}>
                <Route path="/employee/dashboard" element={<Dashboard />} />
                <Route path="/employee/profile" element={<Profile />} />
                <Route path="/employee/attendance" element={<Attendance />} />
                <Route path="/employee/leaves/apply" element={<Leave />} />
                <Route path="/employee/leaves/history" element={<Leave />} />
              </Route>
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
