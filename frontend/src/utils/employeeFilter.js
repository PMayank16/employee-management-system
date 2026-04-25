function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

export function isEmployeeUser(user) {
  return normalizeRole(user?.role) === "EMPLOYEE";
}

export function onlyEmployeeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.filter(isEmployeeUser);
}

