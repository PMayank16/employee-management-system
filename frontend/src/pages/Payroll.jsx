import { useEffect, useState } from "react";
import { employeesApi, payrollApi } from "@/services/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import PayrollBreakdown from "@/components/PayrollBreakdown";
import { onlyEmployeeUsers } from "@/utils/employeeFilter";

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [boot, setBoot] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = onlyEmployeeUsers(await employeesApi.list());
        setEmployees(list);
        if (list[0]) setEmployeeId(list[0].id);
      } catch (e) {
        setError(e.message);
      } finally {
        setBoot(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await payrollApi.getByEmployee(employeeId);
        if (!cancelled) setSummary(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (boot) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-600">
        <Spinner className="size-5 border-2" />
        Loading…
      </div>
    );
  }

  if (!employees.length) {
    return (
      <Card>
        <CardHeader title="Payroll" subtitle="Add employees first to run payroll previews." />
        <p className="text-sm text-slate-500">No employees in the directory yet.</p>
      </Card>
    );
  }

  const selectedEmployee =
    employees.find((e) => String(e.id) === String(employeeId)) || null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Payroll dashboard"
          subtitle="Select an employee to view salary calculation and breakdown."
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-slate-600">
              <Spinner className="size-5 border-2" />
              Computing payroll…
            </div>
          ) : summary ? (
            <PayrollBreakdown
              payroll={summary}
              employee={selectedEmployee}
              title="Salary calculation"
            />
          ) : null}
        </div>
      </Card>
    </div>
  );
}
