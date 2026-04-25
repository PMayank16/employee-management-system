import { useEffect, useMemo, useState } from "react";
import { employeesApi, leaveApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { onlyEmployeeUsers } from "@/utils/employeeFilter";

function statusTone(s) {
  const u = String(s || "").toUpperCase();
  if (u === "APPROVED") return "success";
  if (u === "REJECTED") return "danger";
  return "warning";
}

export default function Leave() {
  const { isAdmin, user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({
    employeeId: String(user?.id || user?.employeeId || ""),
    fromDate: "",
    toDate: "",
  });

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const emps = onlyEmployeeUsers(await employeesApi.list());
        const all = await leaveApi.listAllForAdmin(emps.map((e) => e.id));
        setLeaves(all.sort((a, b) => String(b.fromDate).localeCompare(String(a.fromDate))));
      } else {
        const id = user?.id || user?.employeeId;
        if (!id) throw new Error("Employee profile not found.");
        const mine = await leaveApi.listByEmployee(id);
        setLeaves(mine);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user?.id, user?.employeeId]);

  async function apply(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await leaveApi.apply(form);
      setOkMsg("Leave applied successfully.");
      setForm((f) => ({ ...f, fromDate: "", toDate: "" }));
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function decide(id, status) {
    setBusyId(id + status);
    setError("");
    try {
      await leaveApi.setStatus(id, status);
      setOkMsg(`Leave ${status.toLowerCase()} successfully.`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const columns = useMemo(() => {
    const base = [
      { key: "employeeName", header: "Employee" },
      {
        key: "dates",
        header: "Dates",
        render: (r) => `${String(r.fromDate).slice(0, 10)} → ${String(r.toDate).slice(0, 10)}`,
      },
      ...(isAdmin
        ? [
            {
              key: "reason",
              header: "Reason",
              render: (r) => (r.reason ? String(r.reason) : "—"),
            },
          ]
        : []),
      {
        key: "status",
        header: "Status",
        render: (r) => <Badge tone={statusTone(r.status)}>{String(r.status).toUpperCase()}</Badge>,
      },
    ];
    if (!isAdmin) return base;
    return [
      ...base,
      {
        key: "actions",
        header: "",
        render: (r) =>
          String(r.status).toUpperCase() === "PENDING" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="!px-3 !py-1.5 text-xs"
                disabled={!!busyId}
                onClick={() => decide(r.id, "APPROVED")}
              >
                {busyId === r.id + "APPROVED" ? <Spinner className="size-3 border-2" /> : null}
                Approve
              </Button>
              <Button
                variant="danger"
                className="!px-3 !py-1.5 text-xs"
                disabled={!!busyId}
                onClick={() => decide(r.id, "REJECTED")}
              >
                {busyId === r.id + "REJECTED" ? <Spinner className="size-3 border-2" /> : null}
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
    ];
  }, [isAdmin, busyId]);

  return (
    <div className="space-y-6">
      {!isAdmin ? (
        <Card>
          <CardHeader title="Apply Leave" subtitle="Submit your leave request" />
          {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
          {okMsg ? <p className="mb-3 text-sm text-emerald-700">{okMsg}</p> : null}
          <form onSubmit={apply} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="From Date"
              type="date"
              value={form.fromDate}
              onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
              required
            />
            <Input
              label="To Date"
              type="date"
              value={form.toDate}
              onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
              required
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner className="size-4" /> : null}
                Apply
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title={isAdmin ? "Leave approvals" : "Leave history"}
          subtitle={isAdmin ? "Approve or reject employee leaves" : "Your leave requests"}
        />
        {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
        {okMsg ? <p className="mb-3 text-sm text-emerald-700">{okMsg}</p> : null}
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-600">
            <Spinner className="size-5 border-2" />
            Loading leave…
          </div>
        ) : (
          <DataTable columns={columns} rows={leaves} emptyMessage="No leave requests yet." />
        )}
      </Card>
    </div>
  );
}
