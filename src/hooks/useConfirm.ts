"use client";

import { useContext } from "react";
import { UiContext } from "@/providers/UiProvider";

export const useConfirm = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useConfirm must be used within UiProvider");
  }
  return context.confirm;
};
