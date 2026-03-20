export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const LOGS_API_BASE = process.env.NEXT_PUBLIC_LOGS_API_BASE_URL ?? API_BASE;

export const endpoints = {
  users: () => `${API_BASE}/admin/users`,
  user: (id: string) => `${API_BASE}/admin/users/${id}`,
  userLock: (id: string) => `${API_BASE}/admin/users/${id}/lock`,
  userUnlock: (id: string) => `${API_BASE}/admin/users/${id}/unlock`,
  userType: (id: string) => `${API_BASE}/admin/users/${id}/type`,
  userSessions: (id: string) => `${API_BASE}/admin/users/${id}/sessions`,
  usersBulkAction: () => `${API_BASE}/admin/users/bulk-action`,
  apps: () => `${API_BASE}/apps`,
  app: (id: string) => `${API_BASE}/apps/${id}`,
  tokens: () => `${API_BASE}/tokens`,
  token: (id: string) => `${API_BASE}/tokens/${id}`,
  policies: () => `${API_BASE}/policies`,
  policy: (id: string) => `${API_BASE}/policies/${id}`,
  auditLogs: () => `${LOGS_API_BASE}/logs/audit`,
  verifyLogs: () => `${LOGS_API_BASE}/logs/verify`,
  tokenEvents: (limit = 200) => `${LOGS_API_BASE}/token-events?limit=${limit}`,
  transactions: () => `${API_BASE}/transactions`,
  devices: () => `${API_BASE}/devices`,
  device: (id: string) => `${API_BASE}/devices/${id}`,
};
