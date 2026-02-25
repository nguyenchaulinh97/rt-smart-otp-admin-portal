"use client";

import { useContext } from "react";
import { UiContext } from "@/providers/UiProvider";

export const useToast = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useToast must be used within UiProvider");
  }
  return context.toast;
};
