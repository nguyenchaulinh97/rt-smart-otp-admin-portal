import {
  mapApp,
  mapAuditLog,
  mapDevice,
  mapPolicy,
  mapToken,
  mapUser,
  mapVerifyLog,
} from "@/services/mappers";

describe("services/mappers", () => {
  it("returns same user payload", () => {
    const payload = { id: "u1" } as any;
    expect(mapUser(payload)).toBe(payload);
  });

  it("returns same app payload", () => {
    const payload = { id: "a1" } as any;
    expect(mapApp(payload)).toBe(payload);
  });

  it("returns same token payload", () => {
    const payload = { id: "t1" } as any;
    expect(mapToken(payload)).toBe(payload);
  });

  it("returns same policy payload", () => {
    const payload = { id: "p1" } as any;
    expect(mapPolicy(payload)).toBe(payload);
  });

  it("returns same audit log payload", () => {
    const payload = { id: "l1" } as any;
    expect(mapAuditLog(payload)).toBe(payload);
  });

  it("returns same verify log payload", () => {
    const payload = { id: "v1" } as any;
    expect(mapVerifyLog(payload)).toBe(payload);
  });

  it("returns same device payload", () => {
    const payload = { id: "d1" } as any;
    expect(mapDevice(payload)).toBe(payload);
  });
});
