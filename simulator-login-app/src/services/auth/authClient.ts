import { httpAuthAdapter } from "@/services/auth/adapters/httpAuthAdapter";
import { mockAuthAdapter } from "@/services/auth/adapters/mockAuthAdapter";
import type { AuthAdapter } from "@/services/auth/types";

const provider = (process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "mock").toLowerCase();

export const authClient: AuthAdapter = provider === "http" ? httpAuthAdapter : mockAuthAdapter;
