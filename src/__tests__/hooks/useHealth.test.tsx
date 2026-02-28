import { renderHook, act } from "@testing-library/react";
import { useHealth } from "@/hooks/useHealth";
import { useApiMutation, useApiQuery } from "@/services/api";

jest.mock("@/services/api", () => ({
  useApiQuery: jest.fn(),
  useApiMutation: jest.fn(),
}));

describe("useHealth", () => {
  it("returns query state and triggers sync mutation", async () => {
    const mutateAsync = jest.fn().mockResolvedValue(null);
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { status: "ok" },
      isLoading: false,
      error: null,
    });
    (useApiMutation as jest.Mock).mockReturnValue({
      mutateAsync,
      isPending: true,
    });

    const { result } = renderHook(() => useHealth());

    expect(result.current.data).toEqual({ status: "ok" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isSyncing).toBe(true);

    await act(async () => {
      await expect(result.current.triggerSync()).resolves.toBe(true);
    });

    expect(mutateAsync).toHaveBeenCalledWith(null);
    expect(useApiQuery).toHaveBeenCalledWith(["health"], "/health");
    expect(useApiMutation).toHaveBeenCalledWith("/health/sync", "POST");
  });
});
