// src/__tests__/services/http.test.ts
import { request } from "@/services/http";

describe("request", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should build URL and return parsed JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true })),
    });

    const result = await request("/test");

    expect(fetch).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("should attach auth token if present", async () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "abc123"),
      },
      writable: true,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("{}"),
    });

    await request("/secure");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
        }),
      }),
    );
  });

  it("should throw error with message from body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ error: "Server error" })),
    });

    await expect(request("/fail")).rejects.toThrow("Server error");
  });

  it("should fallback to status message when no body message", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("{}"),
    });

    await expect(request("/notfound")).rejects.toThrow("Request failed: 404");
  });

  it("should handle non-json response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("plain text"),
    });

    const result = await request("/text");
    expect(result).toBe("plain text");
  });
});
