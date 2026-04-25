import { ROLE_EMPLOYEE, normalizeRole } from "@/utils/roles";

function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const base64 = normalized + (pad ? "=".repeat(4 - pad) : "");
  const json = atob(base64);
  return decodeURIComponent(
    json
      .split("")
      .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );
}

export function decodeJwt(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
}

export function extractRoleFromJwt(token) {
  const payload = decodeJwt(token);
  if (!payload) return ROLE_EMPLOYEE;

  const maybeArray =
    payload.roles ||
    payload.authorities ||
    payload.auth ||
    payload.role ||
    payload.scope;

  if (Array.isArray(maybeArray)) return normalizeRole(maybeArray[0]);
  if (typeof maybeArray === "string") {
    const first = maybeArray.split(/[,\s]+/).find(Boolean);
    return normalizeRole(first);
  }
  return ROLE_EMPLOYEE;
}
