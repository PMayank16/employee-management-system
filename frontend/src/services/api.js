import axios from "axios";
import { monthRangeISO } from "@/utils/date";
import { onlyEmployeeUsers } from "@/utils/employeeFilter";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("payrollpulse_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      const base = apiClient.defaults.baseURL || "http://localhost:8000";
      const hint =
        "Network error: backend unreachable or CORS blocked. " +
        `Check Spring Boot is running on ${base} and allows origin http://localhost:5173.`;
      const e = new Error(hint);
      e.status = 0;
      return Promise.reject(e);
    }
    const status = err.response?.status;
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Request failed";
    const hint403 =
      status === 403
        ? "You do not have permission to access this resource. (403) " +
          "This usually means your JWT does not contain ROLE_EMPLOYEE/ROLE_ADMIN or Spring Security is not mapping roles correctly."
        : null;
    const e = new Error(hint403 || message);
    e.status = status;
    e.data = err.response?.data;
    return Promise.reject(e);
  }
);

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

export const authApi = {
  async login({ email, password }) {
    const { data } = await apiClient.post("/api/auth/login", { email, password });
    return data;
  },
};

export const employeesApi = {
  async create(payload) {
    const { data } = await apiClient.post("/api/employees", payload);
    return data;
  },
  async list() {
    const { data } = await apiClient.get("/api/employees");
    return data;
  },
  async me() {
    const { data } = await apiClient.get("/api/employees/me");
    return data;
  },
};

export const attendanceApi = {
  async mark({ employeeId, date, status }) {
    const { data } = await apiClient.post("/api/attendance", {
      employeeId: Number(employeeId),
      date,
      status: normalizeStatus(status),
    });
    return data;
  },
  async bulk(entries) {
    const { data } = await apiClient.post(
      "/api/attendance/bulk",
      entries.map((e) => ({
        employeeId: Number(e.employeeId),
        date: e.date,
        status: normalizeStatus(e.status),
      }))
    );
    return data;
  },
  async listByEmployee(employeeId) {
    const { data } = await apiClient.get(`/api/attendance/${employeeId}`);
    return data;
  },
};

export const leaveApi = {
  async apply({ employeeId, fromDate, toDate }) {
    const { data } = await apiClient.post("/api/leaves", {
      employeeId: Number(employeeId),
      fromDate,
      toDate,
    });
    return data;
  },
  async setStatus(id, status) {
    const { data } = await apiClient.put(`/api/leaves/${id}/status`, {
      status: normalizeStatus(status),
    });
    return data;
  },
  async listByEmployee(employeeId) {
    const { data } = await apiClient.get(`/api/leaves/employee/${employeeId}`);
    return data;
  },
  async listAllForAdmin(employeeIds) {
    const chunks = await Promise.all(employeeIds.map((id) => leaveApi.listByEmployee(id)));
    return chunks.flat();
  },
};

export const payrollApi = {
  async getByEmployee(employeeId) {
    const { data } = await apiClient.get(`/api/payroll/${employeeId}`);
    return data;
  },
};

function formatMonthTitle(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export const dashboardApi = {
  async getAdminStats() {
    const employees = onlyEmployeeUsers(await employeesApi.list());
    const employeeIds = employees.map((e) => e.id);
    const allAttendance = await Promise.all(employeeIds.map((id) => attendanceApi.listByEmployee(id)));
    const today = new Date().toISOString().slice(0, 10);

    let presentToday = 0;
    let absentToday = 0;
    allAttendance.flat().forEach((a) => {
      if ((a.date || "").slice(0, 10) !== today) return;
      const status = normalizeStatus(a.status);
      if (status === "PRESENT") presentToday += 1;
      if (status === "ABSENT") absentToday += 1;
    });

    const leaves = await leaveApi.listAllForAdmin(employeeIds);
    const pendingLeaves = leaves.filter((l) => normalizeStatus(l.status) === "PENDING").length;

    return {
      totalEmployees: employees.length,
      presentToday,
      absentToday,
      pendingLeaves,
    };
  },

  async getEmployeeMonthly(employeeId) {
    const attendance = await attendanceApi.listByEmployee(employeeId);
    const leaves = await leaveApi.listByEmployee(employeeId);
    const me = await employeesApi.me();

    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const { from, to } = monthRangeISO(year, monthIndex);

    const monthAttendance = attendance.filter((a) => {
      const d = (a.date || "").slice(0, 10);
      return d >= from && d <= to;
    });
    const presentDays = monthAttendance.filter((a) => normalizeStatus(a.status) === "PRESENT").length;
    const absentDays = monthAttendance.filter((a) => normalizeStatus(a.status) === "ABSENT").length;
    const leaveDays = leaves.filter((l) => normalizeStatus(l.status) === "APPROVED").length;
    const salaryType = String(me?.salaryType || "").toUpperCase();
    const salaryAmount = Number(me?.salaryAmount || 0);
    const estimatedSalary =
      salaryType === "DAILY" ? presentDays * salaryAmount : Math.max(0, salaryAmount);

    return {
      monthTitle: formatMonthTitle(year, monthIndex),
      presentDays,
      absentDays,
      leaveDays,
      estimatedSalary,
    };
  },
};
