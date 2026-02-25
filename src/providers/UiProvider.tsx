"use client";

import { Button } from "antd";
import { useI18n } from "@/hooks/useI18n";
import { createContext, useCallback, useMemo, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
};

type ToastInput = Omit<ToastItem, "id">;

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
};

type UiContextValue = {
  toast: (input: ToastInput) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type ConfirmState = ConfirmOptions & { id: string };

export const UiContext = createContext<UiContextValue | null>(null);

const toastStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-slate-200 bg-white text-slate-700",
};

export default function UiProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const toast = useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { ...input, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setConfirmState({ ...options, id });
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleResolve = (value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setConfirmState(null);
  };

  const value = useMemo<UiContextValue>(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <UiContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-50 space-y-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto w-72 rounded-lg border px-4 py-3 text-sm shadow ${toastStyles[item.variant]}`}
          >
            {item.title ? <p className="text-xs font-semibold uppercase">{item.title}</p> : null}
            <p className="mt-1 text-sm font-medium">{item.message}</p>
          </div>
        ))}
      </div>

      {confirmState ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-sm font-semibold text-slate-900">
              {confirmState.title ?? t("ui.confirmTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{confirmState.message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="default" onClick={() => handleResolve(false)}>
                {confirmState.cancelLabel ?? t("ui.cancel")}
              </Button>
              <Button
                type="primary"
                danger={confirmState.variant === "danger"}
                onClick={() => handleResolve(true)}
              >
                {confirmState.confirmLabel ?? t("ui.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </UiContext.Provider>
  );
}
