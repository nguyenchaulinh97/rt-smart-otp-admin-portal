"use client";

import { useEffect, useState } from "react";

export type MockQueryState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

type MockQueryOptions = {
  latencyMs?: number;
  shouldFail?: boolean;
};

export const useMockQuery = <T>(
  fetcher: (options?: MockQueryOptions) => Promise<{ data: T } | T>,
  options?: MockQueryOptions,
) => {
  const [state, setState] = useState<MockQueryState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const run = async (override?: MockQueryOptions) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await fetcher(override ?? options);
      const resolved =
        typeof response === "object" && response !== null && "data" in response
          ? (response as { data: T }).data
          : (response as T);
      setState({ data: resolved, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ data: null, isLoading: false, error: message });
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, refetch: run };
};
