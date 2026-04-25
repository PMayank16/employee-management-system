import { useEffect, useState } from "react";
import { dashboardApi } from "@/services/api";
import { StatCard } from "@/components/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import EmployeeDashboard from "@/components/EmployeeDashboard";

export default function AdminDashboard({ isAdmin = true }) {
  if (!isAdmin) return <EmployeeDashboard />;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await dashboardApi.getAdminStats();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-600">
        <Spinner className="size-6 border-2" />
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin dashboard</h2>
        <p className="mt-1 text-slate-500">Key metrics for today and pending actions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees ?? "—"}
          hint="Active profiles in the system"
          icon="👥"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday ?? "—"}
          hint="Marked present for today"
          icon="✓"
        />
        <StatCard
          title="Absent Today"
          value={stats?.absentToday ?? "—"}
          hint="Marked absent for today"
          icon="−"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaves ?? "—"}
          hint="Awaiting approval"
          icon="◷"
        />
      </div>
    </div>
  );
}
