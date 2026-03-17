export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const LOGS_API_BASE = process.env.NEXT_PUBLIC_LOGS_API_BASE_URL ?? API_BASE;

export const endpoints = {
  users: () => `${API_BASE}/users`,
  user: (id: string) => `${API_BASE}/users/${id}`,
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
