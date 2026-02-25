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

export const otpService = {
  getUsers: async () => {
    if (isMockEnabled()) return (await mockApi.getUsers()).data;
    const data = await request<ApiUser[]>(endpoints.users());
    return data.map(mapUser);
  },
  getUser: async (id: string) => {
    if (isMockEnabled()) return (await mockApi.getUser(id)).data;
    const data = await request<ApiUser | null>(endpoints.user(id));
    return data ? mapUser(data) : null;
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
    const data = await request<ApiAuditLog[]>(endpoints.auditLogs());
    return data.map(mapAuditLog);
  },
  getVerifyLogs: async () => {
    if (isMockEnabled()) return (await mockApi.getVerifyLogs()).data;
    const data = await request<ApiVerifyLog[]>(endpoints.verifyLogs());
    return data.map(mapVerifyLog);
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
