import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi, employeesApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/utils/currency";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, bootstrapping } = useAuth();
  const [employeeId, setEmployeeId] = useState(user?.id ?? user?.employeeId ?? null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = user?.id ?? user?.employeeId;
    if (id && id !== employeeId) setEmployeeId(id);
  }, [user?.id, user?.employeeId]);

  useEffect(() => {
    if (bootstrapping) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        let id = employeeId;
        if (!id) {
          const me = await employeesApi.me();
          id = me?.id;
          if (id && !cancelled) setEmployeeId(id);
        }
        if (!id) throw new Error("Unable to load your profile. Please login again.");
        const overview = await dashboardApi.getEmployeeMonthly(id);
        if (!cancelled) setData(overview);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employeeId, bootstrapping]);

  const present = Number(data?.presentDays || 0);
  const absent = Number(data?.absentDays || 0);
  const leave = Number(data?.leaveDays || 0);

  if (bootstrapping) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-600">
        <Spinner className="size-6 border-2" />
        Loading your account…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-600">
        <Spinner className="size-6 border-2" />
        Loading your dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button
            variant="secondary"
            className="self-start sm:self-auto"
            onClick={() => window.location.assign("/login")}
          >
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My dashboard</h2>
        <p className="mt-1 text-slate-500">
          Hello, {user?.displayName || user?.username}. Monthly summary for{" "}
          <span className="font-medium text-slate-700">{data?.monthTitle}</span>.
        </p>
      </div>

      <Card className="border-primary/15">
        <CardHeader
          title="Monthly report"
          subtitle={`${data?.monthTitle ?? "Current month"} attendance summary`}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-50/90 to-white/60 p-5 shadow-inner transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-emerald-900/80">Present</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{present}</p>
            <p className="mt-1 text-xs text-slate-500">Days marked present this month</p>
          </div>
          <div className="group rounded-2xl border border-white/60 bg-gradient-to-br from-red-50/90 to-white/60 p-5 shadow-inner transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-red-900/80">Absent</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{absent}</p>
            <p className="mt-1 text-xs text-slate-500">Days marked absent this month</p>
          </div>
          <div className="group rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/90 to-white/60 p-5 shadow-inner transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-amber-900/80">Leave</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{leave}</p>
            <p className="mt-1 text-xs text-slate-500">Approved leave records this month</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/8 to-white/60 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-800">Estimated salary (this month)</p>
            <p className="text-xs text-slate-500">Preview from attendance rules — connect API for final pay.</p>
          </div>
          <p className="text-2xl font-bold text-primary sm:text-3xl">
            {data?.estimatedSalary != null
              ? formatINR(data.estimatedSalary, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "—"}
          </p>
        </div>
      </Card>

      <Card className="border-primary/15">
        <CardHeader title="Quick actions" subtitle="Jump to common tasks" />
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => navigate("/employee/attendance")}>
            Mark attendance
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/employee/leaves/apply")}>
            Apply leave
          </Button>
        </div>
      </Card>
    </div>
  );
}
