"use client";

import { useState } from "react";
import type { Role } from "@/lib/rbac";

const STORAGE_KEY = "admin:role";

export const useRole = () => {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window === "undefined") return "admin";
    const stored = localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored) return stored;
    localStorage.setItem(STORAGE_KEY, "admin");
    return "admin";
  });

  const updateRole = (next: Role) => {
    setRole(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return { role, setRole: updateRole };
};
