import { mockApi } from "@/mock/api";

describe("mockApi", () => {
  it("exposes all list/detail methods and resolves data", async () => {
    const [users, user, apps, app, tokens, token, policies, policy, logs, devices, device, verifyLogs, transactions] =
      await Promise.all([
        mockApi.getUsers({ latencyMs: 0 }),
        mockApi.getUser("unknown", { latencyMs: 0 }),
        mockApi.getApps({ latencyMs: 0 }),
        mockApi.getApp("unknown", { latencyMs: 0 }),
        mockApi.getTokens({ latencyMs: 0 }),
        mockApi.getToken("unknown", { latencyMs: 0 }),
        mockApi.getPolicies({ latencyMs: 0 }),
        mockApi.getPolicy("unknown", { latencyMs: 0 }),
        mockApi.getAuditLogs({ latencyMs: 0 }),
        mockApi.getDevices({ latencyMs: 0 }),
        mockApi.getDevice("unknown", { latencyMs: 0 }),
        mockApi.getVerifyLogs({ latencyMs: 0 }),
        mockApi.getTransactions({ latencyMs: 0 }),
      ]);

    expect(Array.isArray(users.data)).toBe(true);
    expect(user.data).toBeNull();
    expect(Array.isArray(apps.data)).toBe(true);
    expect(app.data).toBeNull();
    expect(Array.isArray(tokens.data)).toBe(true);
    expect(token.data).toBeNull();
    expect(Array.isArray(policies.data)).toBe(true);
    expect(policy.data).toBeNull();
    expect(Array.isArray(logs.data)).toBe(true);
    expect(Array.isArray(devices.data)).toBe(true);
    expect(device.data).toBeNull();
    expect(Array.isArray(verifyLogs.data)).toBe(true);
    expect(Array.isArray(transactions.data)).toBe(true);
  });

  it("returns users data", async () => {
    const result = await mockApi.getUsers({ latencyMs: 0 });
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("returns null for unknown item", async () => {
    const result = await mockApi.getUser("missing-id", { latencyMs: 0 });
    expect(result.data).toBeNull();
  });

  it("returns matched detail records when ids exist", async () => {
    const [user, app, token, policy, device] = await Promise.all([
      mockApi.getUser("u_10234", { latencyMs: 0 }),
      mockApi.getApp("broker", { latencyMs: 0 }),
      mockApi.getToken("tk_0901", { latencyMs: 0 }),
      mockApi.getPolicy("pol_totp_6", { latencyMs: 0 }),
      mockApi.getDevice("dev_a01", { latencyMs: 0 }),
    ]);

    expect(user.data?.id).toBe("u_10234");
    expect(app.data?.id).toBe("broker");
    expect(token.data?.id).toBe("tk_0901");
    expect(policy.data?.id).toBe("pol_totp_6");
    expect(device.data?.id).toBe("dev_a01");
  });

  it("works with default options argument", async () => {
    jest.useFakeTimers();
    const promise = mockApi.getUsers();
    jest.advanceTimersByTime(500);
    const result = await promise;
    expect(Array.isArray(result.data)).toBe(true);
    jest.useRealTimers();
  });

  it("throws error when shouldFail is true", async () => {
    await expect(mockApi.getApps({ latencyMs: 0, shouldFail: true })).rejects.toThrow(
      "Mock API error",
    );
  });
});
