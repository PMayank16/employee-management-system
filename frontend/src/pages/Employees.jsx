import { useEffect, useState } from "react";
import { employeesApi } from "@/services/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/utils/currency";
import { onlyEmployeeUsers } from "@/utils/employeeFilter";

const salaryTypes = ["MONTHLY", "DAILY"];

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    salaryType: "MONTHLY",
    salaryAmount: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await employeesApi.list();
      setRows(onlyEmployeeUsers(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await employeesApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        salaryType: form.salaryType,
        salaryAmount: Number(form.salaryAmount),
      });
      setModalOpen(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        salaryType: "MONTHLY",
        salaryAmount: "",
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "salaryType", header: "Salary Type" },
    {
      key: "salaryAmount",
      header: "Salary Amount",
      render: (r) =>
        String(r.salaryType).toUpperCase() === "MONTHLY"
          ? formatINR(r.salaryAmount, { maximumFractionDigits: 0 })
          : `${formatINR(r.salaryAmount, { maximumFractionDigits: 0 })}/day`,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Employees"
          subtitle="Directory of roles and compensation."
          action={
            <Button type="button" onClick={() => setModalOpen(true)}>
              Add Employee
            </Button>
          }
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
          <DataTable columns={columns} rows={rows} emptyMessage="No employees yet. Add your first hire." />
        )}
      </Card>

      <Modal
        open={modalOpen}
        title="Add Employee"
        onClose={() => !saving && setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" type="button" disabled={saving} onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-employee-form" disabled={saving}>
              {saving ? (
                <>
                  <Spinner className="size-4 border-2" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </>
        }
      >
        <form id="add-employee-form" className="space-y-4" onSubmit={handleAdd}>
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="Full name"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="john@company.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            placeholder="john12345"
          />
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <Select
            label="Salary Type"
            name="salaryType"
            value={form.salaryType}
            onChange={(e) => setForm((f) => ({ ...f, salaryType: e.target.value }))}
          >
            {salaryTypes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Input
            label="Salary Amount"
            name="salaryAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.salaryAmount}
            onChange={(e) => setForm((f) => ({ ...f, salaryAmount: e.target.value }))}
            required
            placeholder={form.salaryType === "MONTHLY" ? "e.g. 50000" : "e.g. 2000"}
          />
        </form>
      </Modal>
    </div>
  );
}
