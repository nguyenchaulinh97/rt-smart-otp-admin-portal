import { renderHook } from "@testing-library/react";
import { useProfile } from "@/hooks/useProfile";
import { useApiQuery } from "@/services/api";

jest.mock("@/services/api", () => ({
  useApiQuery: jest.fn(),
}));

describe("useProfile", () => {
  beforeEach(() => {
    localStorage.clear();
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { id: "admin-1" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("attaches bearer token when localStorage has auth token", () => {
    localStorage.setItem("auth:token", "token-123");

    renderHook(() => useProfile());

    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin-profile"],
      "/admin/profile",
      expect.objectContaining({
        headers: { Authorization: "Bearer token-123" },
      }),
    );
  });

  it("uses empty headers when token is missing", () => {
    renderHook(() => useProfile());

    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin-profile"],
      "/admin/profile",
      expect.objectContaining({
        headers: {},
      }),
    );
  });
});
