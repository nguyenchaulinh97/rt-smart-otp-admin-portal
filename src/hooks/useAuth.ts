"use client";

import { useApiMutation } from "@/services/api";

export function useLogin() {
  const mutation = useApiMutation<
    { token: string; username: string; admin_id: number },
    { username: string; password: string }
  >("/admin/login", "POST");

  const login = async (username: string, password: string) => {
    const data = await mutation.mutateAsync({ username, password });
    // store token and notify other windows
    try {
      localStorage.setItem("auth:token", data.token);
      window.dispatchEvent(new Event("auth:state-change"));
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
