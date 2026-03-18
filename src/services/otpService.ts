import { mockApi, type TransactionRecord } from "@/mock/api";
import { API_BASE, endpoints } from "@/services/endpoints";
import { request } from "@/services/http";
import {
  mapApp,
  mapAuditLog,
  mapDevice,
  mapPolicy,
  mapToken,
  mapUser,
  mapVerifyLog,
  type ApiApp,
  type ApiAuditLog,
  type ApiDevice,
  type ApiPolicy,
  type ApiToken,
  type ApiUser,
  type ApiVerifyLog,
} from "@/services/mappers";

const isMockEnabled = () => !API_BASE;

type TokenEventPayload = Record<string, unknown>;

const listKeys = [
  "data",
  "result",
  "items",
  "rows",
  "list",
  "events",
  "tokenEvents",
  "token_events",
];

const normalizeList = <T>(input: unknown): T[] => {
  if (Array.isArray(input)) return input as T[];
  if (!input || typeof input !== "object") return [];
  for (const key of listKeys) {
    const value = (input as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
    if (value && typeof value === "object") {
      for (const nestedKey of listKeys) {
        const nested = (value as Record<string, unknown>)[nestedKey];
        if (Array.isArray(nested)) return nested as T[];
      }
    }
  }
  return [];
};

const normalizeRecord = <T>(input: unknown): T | null => {
  if (!input) return null;
  if (Array.isArray(input)) return (input[0] as T | undefined) ?? null;
  if (typeof input !== "object") return null;
  const candidateKeys = ["data", "result", "item", "user", "payload"];
  for (const key of candidateKeys) {
    const value = (input as Record<string, unknown>)[key];
    if (value && typeof value === "object") return value as T;
  }
  return input as T;
};

const toText = (value: unknown) => (value === undefined || value === null ? "" : String(value));

const toResult = (value: unknown): "SUCCESS" | "FAIL" => {
  const upper = toText(value).toUpperCase();
  if (upper === "SUCCESS" || upper === "OK" || upper === "PASSED" || upper === "PASS") {
    return "SUCCESS";
  }
  if (upper === "FAIL" || upper === "FAILED" || upper === "ERROR") {
    return "FAIL";
  }
  return "SUCCESS";
};

const mapTokenEventToVerifyLog = (row: TokenEventPayload): ApiVerifyLog => ({
  id: toText(row.id ?? row.event_id ?? row.token_id ?? row.tokenId ?? row.uuid),
  userId: toText(row.user_id ?? row.userId ?? row.username),
  appId: toText(row.app_id ?? row.appId),
  tokenId: toText(row.token_id ?? row.tokenId ?? row.id ?? row.event_id),
  result: toResult(row.result ?? row.status ?? row.event_type ?? row.type),
  createdAt: toText(row.created_at ?? row.createdAt ?? row.timestamp ?? row.time),
});

export const otpService = {
  getUsers: async () => {
    if (isMockEnabled()) return (await mockApi.getUsers()).data;
    const data = await request<unknown>(endpoints.users());
    return normalizeList<ApiUser>(data).map(mapUser);
  },
  getUser: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getUser(id)).data;
    const data = await request<unknown>(endpoints.user(id));
    const record = normalizeRecord<ApiUser>(data);
    return record ? mapUser(record) : null;
  },
  createUser: async (payload: {
    user_id: string;
    cif: string;
    username: string;
    email: string;
    name: string;
  }) => {
    if (isMockEnabled()) return (await mockApi.createUser(payload)).data;
    return request<ApiUser>(endpoints.users(), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  lockUser: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.lockUser(id)).data;
    return request<void>(endpoints.userLock(id), { method: "PUT" });
  },
  unlockUser: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.unlockUser(id)).data;
    return request<void>(endpoints.userUnlock(id), { method: "PUT" });
  },
  deleteUser: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.deleteUser(id)).data;
    return request<void>(endpoints.user(id), { method: "DELETE" });
  },
  updateUserType: async (id: string, type: string) => {
    if (isMockEnabled()) return (await mockApi.updateUserType(id, type)).data;
    return request<void>(endpoints.userType(id), {
      method: "PUT",
      body: JSON.stringify({ type }),
    });
  },
  getUserSessions: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getUserSessions(id)).data;
    const data = await request<unknown>(endpoints.userSessions(id));
    return normalizeList<Record<string, unknown>>(data);
  },
  bulkUserAction: async (action: "lock" | "unlock" | "reset", userIds: string[]) => {
    if (isMockEnabled()) return (await mockApi.bulkUserAction(action, userIds)).data;
    return request<void>(endpoints.usersBulkAction(), {
      method: "POST",
      body: JSON.stringify({ action, user_ids: userIds }),
    });
  },
  getApps: async () => {
    if (isMockEnabled()) return (await mockApi.getApps()).data;
    const data = await request<ApiApp[]>(endpoints.apps());
    return data.map(mapApp);
  },
  getApp: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getApp(id)).data;
    const data = await request<ApiApp | null>(endpoints.app(id));
    return data ? mapApp(data) : null;
  },
  getTokens: async () => {
    const tokens = isMockEnabled()
      ? (await mockApi.getTokens()).data
      : (await request<ApiToken[]>(endpoints.tokens())).map(mapToken);
    const map = new Map<string, (typeof tokens)[number]>();
    tokens.forEach((token) => {
      const key = `${token.userId}::${token.appId}`;
      if (!map.has(key)) {
        map.set(key, token);
      }
    });
    return Array.from(map.values());
  },
  getToken: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getToken(id)).data;
    const data = await request<ApiToken | null>(endpoints.token(id));
    return data ? mapToken(data) : null;
  },
  getPolicies: async () => {
    if (isMockEnabled()) return (await mockApi.getPolicies()).data;
    const data = await request<ApiPolicy[]>(endpoints.policies());
    return data.map(mapPolicy);
  },
  getPolicy: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getPolicy(id)).data;
    const data = await request<ApiPolicy | null>(endpoints.policy(id));
    return data ? mapPolicy(data) : null;
  },
  getAuditLogs: async () => {
    if (isMockEnabled()) return (await mockApi.getAuditLogs()).data;
    const data = await request<unknown>(endpoints.auditLogs());
    return normalizeList<ApiAuditLog>(data).map(mapAuditLog);
  },
  getVerifyLogs: async () => {
    if (isMockEnabled()) return (await mockApi.getVerifyLogs()).data;
    const data = await request<unknown>(endpoints.tokenEvents());
    return normalizeList<TokenEventPayload>(data).map((row) =>
      mapVerifyLog(mapTokenEventToVerifyLog(row)),
    );
  },
  getTransactions: async () => {
    if (isMockEnabled()) return (await mockApi.getTransactions()).data;
    const data = await request<TransactionRecord[]>(endpoints.transactions());
    return data;
  },
  getDevices: async () => {
    if (isMockEnabled()) return (await mockApi.getDevices()).data;
    const data = await request<ApiDevice[]>(endpoints.devices());
    return data.map(mapDevice);
  },
  getDevice: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getDevice(id)).data;
    const data = await request<ApiDevice | null>(endpoints.device(id));
    return data ? mapDevice(data) : null;
  },
};
