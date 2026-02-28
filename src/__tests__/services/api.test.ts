// src/__tests__/services/api.test.ts

describe("apiFetch", () => {
  beforeEach(() => {
    jest.resetModules(); // VERY IMPORTANT
    jest.clearAllMocks();
  });

  it("should call fetch with built URL", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test.com";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });

    // import AFTER setting env
    const { apiFetch } = await import("@/services/api");

    const result = await apiFetch("/users");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/users",
      expect.objectContaining({
        credentials: "include",
      }),
    );

    expect(result).toEqual({ ok: true });
  });

  it("should use full URL as-is", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("{}"),
    });

    const { apiFetch } = await import("@/services/api");

    await apiFetch("https://external.com/data");

    expect(fetch).toHaveBeenCalledWith("https://external.com/data", expect.any(Object));
  });

  it("should throw error when response not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: "Bad Request" })),
    });

    const { apiFetch } = await import("@/services/api");

    await expect(apiFetch("/fail")).rejects.toThrow("Bad Request");
  });

  it("should keep explicit Authorization header and skip localStorage token", async () => {
    Object.defineProperty(window, "localStorage", {
      value: { getItem: jest.fn(() => "from-storage") },
      writable: true,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("{}"),
    });

    const { apiFetch } = await import("@/services/api");
    await apiFetch("/auth", {
      headers: { Authorization: "Bearer custom" },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer custom" }),
      }),
    );
  });

  it("should return null when response body is empty", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(""),
    });

    const { apiFetch } = await import("@/services/api");
    await expect(apiFetch("/empty")).resolves.toBeNull();
  });

  it("should fallback to plain text if JSON parse fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("not-json"),
    });

    const { apiFetch } = await import("@/services/api");

    const result = await apiFetch("/text");

    expect(result).toBe("not-json");
  });
});
