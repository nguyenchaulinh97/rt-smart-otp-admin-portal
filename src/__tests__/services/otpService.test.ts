describe("otpService", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("uses mockApi when API_BASE is empty and deduplicates tokens by user/app", async () => {
    const mockApi = {
      getUsers: jest.fn().mockResolvedValue({ data: [{ id: "u1" }] }),
      getUser: jest.fn().mockResolvedValue({ data: { id: "u1" } }),
      getApps: jest.fn().mockResolvedValue({ data: [{ id: "a1" }] }),
      getApp: jest.fn().mockResolvedValue({ data: { id: "a1" } }),
      getTokens: jest.fn().mockResolvedValue({
        data: [
          { id: "t1", userId: "u1", appId: "a1" },
          { id: "t2", userId: "u1", appId: "a1" },
          { id: "t3", userId: "u2", appId: "a1" },
        ],
      }),
      getToken: jest.fn().mockResolvedValue({ data: { id: "t1" } }),
      getPolicies: jest.fn().mockResolvedValue({ data: [{ id: "p1" }] }),
      getPolicy: jest.fn().mockResolvedValue({ data: { id: "p1" } }),
      getAuditLogs: jest.fn().mockResolvedValue({ data: [{ id: "l1" }] }),
      getVerifyLogs: jest.fn().mockResolvedValue({ data: [{ id: "v1" }] }),
      getTransactions: jest.fn().mockResolvedValue({ data: [{ id: "tr1" }] }),
      getDevices: jest.fn().mockResolvedValue({ data: [{ id: "d1" }] }),
      getDevice: jest.fn().mockResolvedValue({ data: { id: "d1" } }),
    };

    jest.doMock("@/services/endpoints", () => ({
      API_BASE: "",
      endpoints: {},
    }));
    jest.doMock("@/mock/api", () => ({ mockApi }));

    const { otpService } = await import("@/services/otpService");

    await expect(otpService.getUsers()).resolves.toEqual([{ id: "u1" }]);
    await expect(otpService.getUser("u1")).resolves.toEqual({ id: "u1" });
    await expect(otpService.getApps()).resolves.toEqual([{ id: "a1" }]);
    await expect(otpService.getApp("a1")).resolves.toEqual({ id: "a1" });
    await expect(otpService.getToken("t1")).resolves.toEqual({ id: "t1" });
    await expect(otpService.getPolicies()).resolves.toEqual([{ id: "p1" }]);
    await expect(otpService.getPolicy("p1")).resolves.toEqual({ id: "p1" });
    await expect(otpService.getAuditLogs()).resolves.toEqual([{ id: "l1" }]);
    await expect(otpService.getVerifyLogs()).resolves.toEqual([{ id: "v1" }]);
    await expect(otpService.getTransactions()).resolves.toEqual([{ id: "tr1" }]);
    await expect(otpService.getDevices()).resolves.toEqual([{ id: "d1" }]);
    await expect(otpService.getDevice("d1")).resolves.toEqual({ id: "d1" });

    const tokens = await otpService.getTokens();
    expect(tokens).toHaveLength(2);
    expect(tokens).toEqual([
      { id: "t1", userId: "u1", appId: "a1" },
      { id: "t3", userId: "u2", appId: "a1" },
    ]);
  });

  it("uses request/endpoints and mappers when API_BASE is provided", async () => {
    const endpoints = {
      users: () => "/users",
      user: (id: string) => `/users/${id}`,
      apps: () => "/apps",
      app: (id: string) => `/apps/${id}`,
      tokens: () => "/tokens",
      token: (id: string) => `/tokens/${id}`,
      policies: () => "/policies",
      policy: (id: string) => `/policies/${id}`,
      auditLogs: () => "/logs/audit",
      verifyLogs: () => "/logs/verify",
      transactions: () => "/transactions",
      devices: () => "/devices",
      device: (id: string) => `/devices/${id}`,
    };
    const request = jest.fn(async (path: string) => {
      const table: Record<string, any> = {
        "/users": [{ id: "u1" }],
        "/users/u1": { id: "u1" },
        "/users/missing": null,
        "/apps": [{ id: "a1" }],
        "/apps/a1": { id: "a1" },
        "/tokens": [{ id: "t1", userId: "u1", appId: "a1" }],
        "/tokens/t1": { id: "t1", userId: "u1", appId: "a1" },
        "/policies": [{ id: "p1" }],
        "/policies/p1": { id: "p1" },
        "/logs/audit": [{ id: "l1" }],
        "/logs/verify": [{ id: "v1" }],
        "/transactions": [{ id: "tr1" }],
        "/devices": [{ id: "d1" }],
        "/devices/d1": { id: "d1" },
      };
      return table[path];
    });

    const mapUser = jest.fn((v: any) => v);
    const mapApp = jest.fn((v: any) => v);
    const mapToken = jest.fn((v: any) => v);
    const mapPolicy = jest.fn((v: any) => v);
    const mapAuditLog = jest.fn((v: any) => v);
    const mapVerifyLog = jest.fn((v: any) => v);
    const mapDevice = jest.fn((v: any) => v);

    jest.doMock("@/services/endpoints", () => ({ API_BASE: "https://api.test", endpoints }));
    jest.doMock("@/services/http", () => ({ request }));
    jest.doMock("@/mock/api", () => ({ mockApi: {} }));
    jest.doMock("@/services/mappers", () => ({
      mapUser,
      mapApp,
      mapToken,
      mapPolicy,
      mapAuditLog,
      mapVerifyLog,
      mapDevice,
    }));

    const { otpService } = await import("@/services/otpService");

    await expect(otpService.getUsers()).resolves.toEqual([{ id: "u1" }]);
    await expect(otpService.getUser("u1")).resolves.toEqual({ id: "u1" });
    await expect(otpService.getUser("missing")).resolves.toBeNull();
    await expect(otpService.getApps()).resolves.toEqual([{ id: "a1" }]);
    await expect(otpService.getApp("a1")).resolves.toEqual({ id: "a1" });
    await expect(otpService.getTokens()).resolves.toEqual([{ id: "t1", userId: "u1", appId: "a1" }]);
    await expect(otpService.getToken("t1")).resolves.toEqual({ id: "t1", userId: "u1", appId: "a1" });
    await expect(otpService.getPolicies()).resolves.toEqual([{ id: "p1" }]);
    await expect(otpService.getPolicy("p1")).resolves.toEqual({ id: "p1" });
    await expect(otpService.getAuditLogs()).resolves.toEqual([{ id: "l1" }]);
    await expect(otpService.getVerifyLogs()).resolves.toEqual([{ id: "v1" }]);
    await expect(otpService.getTransactions()).resolves.toEqual([{ id: "tr1" }]);
    await expect(otpService.getDevices()).resolves.toEqual([{ id: "d1" }]);
    await expect(otpService.getDevice("d1")).resolves.toEqual({ id: "d1" });

    expect(request).toHaveBeenCalled();
    expect(mapUser).toHaveBeenCalled();
    expect(mapApp).toHaveBeenCalled();
    expect(mapToken).toHaveBeenCalled();
    expect(mapPolicy).toHaveBeenCalled();
    expect(mapAuditLog).toHaveBeenCalled();
    expect(mapVerifyLog).toHaveBeenCalled();
    expect(mapDevice).toHaveBeenCalled();
  });
});
