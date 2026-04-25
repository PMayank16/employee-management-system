import { useEffect, useMemo, useState } from "react";
import { attendanceApi, employeesApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { onlyEmployeeUsers } from "@/utils/employeeFilter";

const TODAY = new Date().toISOString().slice(0, 10);

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

export default function Attendance() {
  const { isAdmin, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [draft, setDraft] = useState({});
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [historyByEmployee, setHistoryByEmployee] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  function getAttendanceForDate(attRows, date) {
    return (attRows || []).find((r) => String(r.date || "").slice(0, 10) === date);
  }

  function makeDraftRows(list, historyMap, date) {
    const rows = {};
    list.forEach((emp) => {
      const history = historyMap[String(emp.id)] || [];
      const existing = getAttendanceForDate(history, date);
      const status = normalizeStatus(existing?.status || "PRESENT");
      rows[String(emp.id)] = {
        employeeId: emp.id,
        status,
        date,
        alreadyMarked: Boolean(existing),
        initialStatus: status,
        changed: false,
      };
    });
    return rows;
  }

  async function loadAdminRows() {
    setLoading(true);
    setError("");
    try {
      const list = onlyEmployeeUsers(await employeesApi.list());
      const historyList = await Promise.all(
        list.map(async (emp) => ({
          id: String(emp.id),
          rows: await attendanceApi.listByEmployee(emp.id),
        }))
      );
      const map = {};
      historyList.forEach((x) => {
        map[x.id] = x.rows || [];
      });
      setEmployees(list);
      setHistoryByEmployee(map);
      setDraft(makeDraftRows(list, map, selectedDate));
    } catch (e) {
      setError(e.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployeeRows() {
    setLoading(true);
    setError("");
    try {
      const id = user?.id || user?.employeeId;
      const me = await employeesApi.me();
      const history = await attendanceApi.listByEmployee(id);
      const list = [me];
      const map = { [String(id)]: history || [] };
      setEmployees(list);
      setHistoryByEmployee(map);
      setDraft(makeDraftRows(list, map, selectedDate));
    } catch (e) {
      setError(e.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAdminRows();
    } else {
      loadEmployeeRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user?.id, user?.employeeId]);

  useEffect(() => {
    if (!employees.length) return;
    setDraft(makeDraftRows(employees, historyByEmployee, selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function updateRow(employeeId, patch) {
    const key = String(employeeId);
    setDraft((prev) => {
      const current = prev[key];
      if (!current) return prev;
      const next = { ...current, ...patch };
      next.changed = next.status !== next.initialStatus || next.date !== selectedDate;
      return { ...prev, [key]: next };
    });
  }

  async function markSingle(employeeId) {
    const key = String(employeeId);
    const row = draft[key];
    if (!row) return;
    if (row.alreadyMarked) {
      setToast({ type: "ok", text: "Attendance already marked for this date." });
      return;
    }
    if (selectedDate > TODAY) {
      setError("Future date attendance is not allowed.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await attendanceApi.mark({
        employeeId: row.employeeId,
        status: row.status,
        date: row.date,
      });
      setHistoryByEmployee((prev) => {
        const key = String(employeeId);
        const list = [...(prev[key] || [])];
        const idx = list.findIndex((x) => String(x.date || "").slice(0, 10) === selectedDate);
        const nextRow = { ...(idx >= 0 ? list[idx] : {}), date: selectedDate, status: row.status };
        if (idx >= 0) list[idx] = nextRow;
        else list.push(nextRow);
        return { ...prev, [key]: list };
      });
      updateRow(employeeId, { alreadyMarked: true, initialStatus: row.status, changed: false });
      setToast({ type: "ok", text: "Attendance marked." });
    } catch (e) {
      const msg = String(e.message || "");
      if (msg.toLowerCase().includes("already marked")) {
        updateRow(employeeId, { status: row.initialStatus, changed: false, alreadyMarked: true });
        setToast({ type: "ok", text: "Attendance already marked for this date." });
      } else {
        setError(msg || "Could not mark attendance.");
        setToast({ type: "err", text: "Failed to mark attendance." });
      }
    } finally {
      setSaving(false);
    }
  }

  async function markAll(status) {
    if (!isAdmin) return;
    if (selectedDate > TODAY) {
      setError("Future date attendance is not allowed.");
      return;
    }
    const nextStatus = normalizeStatus(status);
    const prepared = employees.reduce((acc, emp) => {
      const key = String(emp.id);
      const row = draft[key];
      if (!row || row.alreadyMarked) return acc;
      acc.push({ employeeId: emp.id, status: nextStatus, date: row.date || selectedDate });
      return acc;
    }, []);

    setDraft((prev) => {
      const copy = { ...prev };
      employees.forEach((emp) => {
        const key = String(emp.id);
        if (!copy[key]) return;
        copy[key] = { ...copy[key], status: nextStatus, changed: true };
      });
      return copy;
    });

    if (!prepared.length) {
      setToast({ type: "ok", text: "Nothing to update." });
      return;
    }

    setSaving(true);
    setError("");
    try {
      await attendanceApi.bulk(prepared);
      setHistoryByEmployee((prev) => {
        const copy = { ...prev };
        prepared.forEach((p) => {
          const key = String(p.employeeId);
          const list = [...(copy[key] || [])];
          const idx = list.findIndex((x) => String(x.date || "").slice(0, 10) === selectedDate);
          const nextRow = { ...(idx >= 0 ? list[idx] : {}), date: selectedDate, status: p.status };
          if (idx >= 0) list[idx] = nextRow;
          else list.push(nextRow);
          copy[key] = list;
        });
        return copy;
      });
      setDraft((prev) => {
        const copy = { ...prev };
        prepared.forEach((p) => {
          const key = String(p.employeeId);
          if (!copy[key]) return;
          copy[key] = {
            ...copy[key],
            status: p.status,
            alreadyMarked: true,
            initialStatus: p.status,
            changed: false,
          };
        });
        return copy;
      });
      setToast({ type: "ok", text: `Marked ${prepared.length} employees ${nextStatus}.` });
    } catch (e) {
      setError(e.message || "Bulk attendance failed.");
      setToast({ type: "err", text: "Bulk attendance failed." });
    } finally {
      setSaving(false);
    }
  }

  const rows = useMemo(
    () =>
      employees.map((emp) => {
        const item = draft[String(emp.id)];
        return {
          employee: emp,
          ...item,
        };
      }),
    [employees, draft]
  );

  const presentCount = rows.filter((r) => normalizeStatus(r.status) === "PRESENT").length;
  const absentCount = rows.filter((r) => normalizeStatus(r.status) === "ABSENT").length;

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-2 text-sm font-medium shadow-lg ${
            toast.type === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader
          title="Attendance Management"
          subtitle={isAdmin ? "Mark individual or bulk attendance for today." : "My attendance (read-only)"}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-600">
            <Spinner className="size-5 border-2" />
            Loading employees…
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 mb-4 rounded-xl border border-white/70 bg-white/80 p-3 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  <Badge tone="success">Present: {presentCount}</Badge>
                  <Badge tone="danger">Absent: {absentCount}</Badge>
                <Badge tone="neutral">Date: {selectedDate}</Badge>
                </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  max={TODAY}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={saving} onClick={() => markAll("PRESENT")}>
                      Mark All Present
                    </Button>
                    <Button variant="danger" disabled={saving} onClick={() => markAll("ABSENT")}>
                      Mark All Absent
                    </Button>
                  </div>
                ) : null}
              </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/60 bg-white/50 shadow-inner">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-gradient-to-r from-primary/5 to-transparent">
                    <th className="px-4 py-3 font-semibold text-slate-600">Employee Name</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.employee?.id}
                      className={`border-b border-slate-100 last:border-0 ${
                        r.changed ? "bg-amber-50/70" : "hover:bg-primary/[0.03]"
                      } transition-colors`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{r.employee?.name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.employee?.role}</td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <select
                            className="w-36 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                            value={r.status || "PRESENT"}
                            disabled={r.alreadyMarked || saving}
                            onChange={(e) => updateRow(r.employee.id, { status: normalizeStatus(e.target.value) })}
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                        ) : (
                          <Badge tone={normalizeStatus(r.status) === "PRESENT" ? "success" : "danger"}>
                            {normalizeStatus(r.status) || "UNKNOWN"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700">{r.date || selectedDate}</span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          r.alreadyMarked ? (
                            <Badge tone="neutral">Already Marked</Badge>
                          ) : (
                            <Button
                              className="!px-3 !py-1.5 text-xs"
                              disabled={saving}
                              onClick={() => markSingle(r.employee.id)}
                            >
                              Mark Attendance
                            </Button>
                          )
                        ) : (
                          <Badge tone="neutral">Read-only</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
