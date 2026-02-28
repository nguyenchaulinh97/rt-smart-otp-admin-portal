import { renderHook, waitFor, act } from "@testing-library/react";
import { useMockQuery } from "@/hooks/useMockQuery";

describe("useMockQuery", () => {
  it("resolves data from response.data", async () => {
    const fetcher = jest.fn(async () => ({ data: { ok: true } }));
    const { result } = renderHook(() => useMockQuery(fetcher));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ ok: true });
    expect(result.current.error).toBeNull();
  });

  it("handles fetcher rejection", async () => {
    const fetcher = jest.fn(async () => {
      throw new Error("Boom");
    });
    const { result } = renderHook(() => useMockQuery(fetcher));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Boom");
  });

  it("uses fallback unknown error message for non-Error throw", async () => {
    const fetcher = jest.fn(async () => {
      throw "bad";
    });
    const { result } = renderHook(() => useMockQuery(fetcher));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Unknown error");
  });

  it("supports refetch with override options", async () => {
    const fetcher = jest.fn(async () => ({ data: 1 }));
    const { result } = renderHook(() => useMockQuery(fetcher, { latencyMs: 1 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch({ shouldFail: false, latencyMs: 2 });
    });

    expect(fetcher).toHaveBeenNthCalledWith(1, { latencyMs: 1 });
    expect(fetcher).toHaveBeenNthCalledWith(2, { shouldFail: false, latencyMs: 2 });
  });
});
