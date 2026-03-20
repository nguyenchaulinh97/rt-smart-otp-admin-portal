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

const createToastId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const scheduleToastRemoval = (id: string, onRemove: (id: string) => void) => {
  globalThis.setTimeout(onRemove, 2800, id);
};

const removeToastById = (
  toastId: string,
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>,
) => setToasts((prev) => prev.filter((item) => item.id !== toastId));

const ToastList = ({ toasts }: { toasts: ToastItem[] }) => (
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
);

type ConfirmDialogProps = {
  state: ConfirmState;
  onResolve: (value: boolean) => void;
  t: (key: string) => string;
};

const ConfirmDialog = ({ state, onResolve, t }: ConfirmDialogProps) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
      <h2 className="text-sm font-semibold text-slate-900">
        {state.title ?? t("ui.confirmTitle")}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{state.message}</p>
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button type="default" onClick={() => onResolve(false)}>
          {state.cancelLabel ?? t("ui.cancel")}
        </Button>
        <Button type="primary" danger={state.variant === "danger"} onClick={() => onResolve(true)}>
          {state.confirmLabel ?? t("ui.confirm")}
        </Button>
      </div>
    </div>
  </div>
);

export default function UiProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const handleRemoveToast = useCallback(
    (toastId: string) => removeToastById(toastId, setToasts),
    [],
  );

  const toast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      setToasts((prev) => [...prev, { ...input, id }]);
      scheduleToastRemoval(id, handleRemoveToast);
    },
    [handleRemoveToast],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    const id = createToastId();
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
      <ToastList toasts={toasts} />
      {confirmState ? <ConfirmDialog state={confirmState} onResolve={handleResolve} t={t} /> : null}
    </UiContext.Provider>
  );
}
