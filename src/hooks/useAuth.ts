"use client";

import { useApiMutation } from "@/services/api";

const pickToken = (data: {
  token?: string;
  access_token?: string;
  accessToken?: string;
  jwt?: string;
  data?: unknown;
  result?: unknown;
  payload?: unknown;
}) => {
  const direct = data.token ?? data.access_token ?? data.accessToken ?? data.jwt;
  if (direct) return direct;
  const nested = [data.data, data.result, data.payload].find(
    (item) => item && typeof item === "object",
  ) as
    | {
        token?: string;
        access_token?: string;
        accessToken?: string;
        jwt?: string;
      }
    | undefined;
  return nested?.token ?? nested?.access_token ?? nested?.accessToken ?? nested?.jwt ?? "";
};

export function useLogin() {
  const mutation = useApiMutation<
    {
      token?: string;
      access_token?: string;
      accessToken?: string;
      jwt?: string;
      data?: unknown;
      result?: unknown;
      payload?: unknown;
      username?: string;
      admin_id?: number;
    },
    { username: string; password: string }
  >("/admin/login", "POST");

  const login = async (username: string, password: string) => {
    const data = await mutation.mutateAsync({ username, password });
    const token = pickToken(data);
    if (!token) {
      throw new Error("Missing token in login response");
    }
    // store token and notify other windows
    try {
      globalThis.localStorage.setItem("auth:token", token);
      globalThis.dispatchEvent(new Event("auth:state-change"));
    } catch {}
    return data;
  };

  return {
    login,
    isPending: mutation.isPending,
    error: mutation.error,
    mutation,
  };
}
