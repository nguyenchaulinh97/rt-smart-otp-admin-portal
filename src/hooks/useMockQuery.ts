"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useRef } from "react";

export type MockQueryState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

type MockQueryOptions = {
  latencyMs?: number;
  shouldFail?: boolean;
};

const resolveData = <T>(response: { data: T } | T): T =>
  typeof response === "object" && response !== null && "data" in response
    ? (response as { data: T }).data
    : response;

const resolveErrorMessage = (error: unknown): string | null => {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  return "Unknown error";
};

export const useMockQuery = <T>(
  fetcher: (options?: MockQueryOptions) => Promise<{ data: T } | T>,
  options?: MockQueryOptions,
) => {
  const instanceId = useId();
  const queryKey = useMemo(() => ["mock-query", instanceId], [instanceId]);
  const optionsRef = useRef<MockQueryOptions | undefined>(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const query = useQuery<T, Error>({
    queryKey,
    queryFn: async () => resolveData(await fetcher(optionsRef.current)),
  });

  const refetch = async (override?: MockQueryOptions) => {
    optionsRef.current = override ?? optionsRef.current;
    return query.refetch();
  };

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: resolveErrorMessage(query.error),
    refetch,
  } satisfies MockQueryState<T> & { refetch: typeof refetch };
};
