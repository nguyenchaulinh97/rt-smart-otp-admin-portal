describe("services/endpoints", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("builds all resource paths", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const { API_BASE, endpoints } = await import("@/services/endpoints");

    expect(API_BASE).toBe("https://api.example.com");
    expect(endpoints.users()).toBe("https://api.example.com/users");
    expect(endpoints.user("u1")).toBe("https://api.example.com/users/u1");
    expect(endpoints.apps()).toBe("https://api.example.com/apps");
    expect(endpoints.app("a1")).toBe("https://api.example.com/apps/a1");
    expect(endpoints.tokens()).toBe("https://api.example.com/tokens");
    expect(endpoints.token("t1")).toBe("https://api.example.com/tokens/t1");
    expect(endpoints.policies()).toBe("https://api.example.com/policies");
    expect(endpoints.policy("p1")).toBe("https://api.example.com/policies/p1");
    expect(endpoints.auditLogs()).toBe("https://api.example.com/logs/audit");
    expect(endpoints.verifyLogs()).toBe("https://api.example.com/logs/verify");
    expect(endpoints.transactions()).toBe("https://api.example.com/transactions");
    expect(endpoints.devices()).toBe("https://api.example.com/devices");
    expect(endpoints.device("d1")).toBe("https://api.example.com/devices/d1");
  });
});
