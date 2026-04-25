import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", roles: ["admin"], end: true },
  { to: "/admin/employees", label: "Employees", roles: ["admin"] },
  { to: "/admin/attendance", label: "Attendance", roles: ["admin"] },
  { to: "/admin/leaves", label: "Leave Approval", roles: ["admin"] },
  { to: "/admin/payroll", label: "Payroll", roles: ["admin"] },
  { to: "/employee/dashboard", label: "My Dashboard", roles: ["employee"], end: true },
  { to: "/employee/profile", label: "Profile", roles: ["employee"] },
  { to: "/employee/attendance", label: "Attendance", roles: ["employee"] },
  { to: "/employee/leaves/apply", label: "Apply Leave", roles: ["employee"] },
  { to: "/employee/leaves/history", label: "Leave History", roles: ["employee"] },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/25"
      : "text-slate-600 hover:bg-white/70 hover:text-primary"
  }`;

export function DashboardLayout() {
  const { user, logout, isAdmin, isEmployee } = useAuth();
  const [logoutMsg, setLogoutMsg] = useState("");
  const role = isEmployee ? "Employee" : "Admin";
  const navItems = nav.filter((item) => item.roles.includes(isEmployee ? "employee" : "admin"));

  function handleLogout() {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;
    setLogoutMsg("Logged out successfully.");
    setTimeout(() => {
      logout();
      setLogoutMsg("");
    }, 350);
  }

  return (
    <div className="min-h-screen lg:flex">
      {logoutMsg ? (
        <div className="fixed right-4 top-4 z-50 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {logoutMsg}
        </div>
      ) : null}
      <aside className="sticky top-0 z-30 border-b border-white/40 bg-white/50 px-4 py-4 backdrop-blur-md lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="mb-8 flex items-center gap-2 px-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-sm font-bold text-white shadow-lg shadow-primary/30">
            PP
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              PayrollPulse
            </p>
            <p className="text-sm font-semibold text-slate-800">{role}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={Boolean(item.end)}>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                {isEmployee ? "My workspace" : "Payroll Management"}
              </h1>
              <p className="text-sm text-slate-500">
                {isAdmin ? "Operations overview and workforce tools" : "Your dashboard, attendance, and leave"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-right shadow-sm backdrop-blur sm:block">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800">
                  {user?.displayName || user?.username || "User"}
                </p>
                <p className="text-xs text-primary">{role}</p>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
