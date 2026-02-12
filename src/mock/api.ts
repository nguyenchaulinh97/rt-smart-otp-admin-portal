import {
  appsFixture,
  auditLogsFixture,
  devicesFixture,
  policiesFixture,
  tokensFixture,
  transactionsFixture,
  usersFixture,
  verifyLogsFixture,
  type AppRecord,
  type AuditLogRecord,
  type DeviceRecord,
  type PolicyRecord,
  type TokenRecord,
  type TransactionRecord,
  type UserRecord,
  type VerifyLogRecord,
} from "@/mock/fixtures";

export type MockResponse<T> = {
  data: T;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type MockOptions = {
  latencyMs?: number;
  shouldFail?: boolean;
};

const withMock = async <T>(fn: () => T, options?: MockOptions): Promise<MockResponse<T>> => {
  const { latencyMs = 400, shouldFail = false } = options ?? {};
  await delay(latencyMs);
  if (shouldFail) {
    throw new Error("Mock API error");
  }
  return { data: fn() };
};

export const mockApi = {
  getUsers: (options?: MockOptions) => withMock(() => usersFixture, options),
  getUser: (id: string, options?: MockOptions) =>
    withMock(() => usersFixture.find((user) => user.id === id) ?? null, options),
  getApps: (options?: MockOptions) => withMock(() => appsFixture, options),
  getApp: (id: string, options?: MockOptions) =>
    withMock(() => appsFixture.find((app) => app.id === id) ?? null, options),
  getTokens: (options?: MockOptions) => withMock(() => tokensFixture, options),
  getToken: (id: string, options?: MockOptions) =>
    withMock(() => tokensFixture.find((token) => token.id === id) ?? null, options),
  getPolicies: (options?: MockOptions) => withMock(() => policiesFixture, options),
  getPolicy: (id: string, options?: MockOptions) =>
    withMock(() => policiesFixture.find((policy) => policy.id === id) ?? null, options),
  getAuditLogs: (options?: MockOptions) => withMock(() => auditLogsFixture, options),
  getDevices: (options?: MockOptions) => withMock(() => devicesFixture, options),
  getDevice: (id: string, options?: MockOptions) =>
    withMock(() => devicesFixture.find((device) => device.id === id) ?? null, options),
  getVerifyLogs: (options?: MockOptions) => withMock(() => verifyLogsFixture, options),
  getTransactions: (options?: MockOptions) => withMock(() => transactionsFixture, options),
};

export type {
  AppRecord,
  AuditLogRecord,
  DeviceRecord,
  PolicyRecord,
  TokenRecord,
  TransactionRecord,
  UserRecord,
  VerifyLogRecord,
};
