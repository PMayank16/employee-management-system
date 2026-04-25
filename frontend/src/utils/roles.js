export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_EMPLOYEE = "ROLE_EMPLOYEE";

export function normalizeRole(input) {
  const raw = String(input || "").trim().toUpperCase();
  if (raw === "ADMIN" || raw === "ROLE_ADMIN") return ROLE_ADMIN;
  if (raw === "EMPLOYEE" || raw === "ROLE_EMPLOYEE") return ROLE_EMPLOYEE;
  return ROLE_EMPLOYEE;
}

export function hasAdminRole(role) {
  return normalizeRole(role) === ROLE_ADMIN;
}

export function hasEmployeeRole(role) {
  return normalizeRole(role) === ROLE_EMPLOYEE;
}
