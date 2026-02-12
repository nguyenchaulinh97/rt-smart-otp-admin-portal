"use client";

import { useState } from "react";
import { Button, Select, Tooltip } from "antd";
import { z } from "zod";
import { useI18n } from "@/hooks/useI18n";

export type TokenProvisionValues = {
  userId: string;
  appId: string;
  policy: string;
  status: "Active" | "Locked";
};

type TokenProvisionFormProps = {
  title: string;
  userOptions: string[];
  appOptions: string[];
  policyOptions: string[];
  onCancel: () => void;
  onSubmit: (values: TokenProvisionValues) => Promise<void> | void;
  isReadOnly?: boolean;
  disabledReason?: string;
};

export default function TokenProvisionForm({
  title,
  userOptions,
  appOptions,
  policyOptions,
  onCancel,
  onSubmit,
  isReadOnly,
  disabledReason,
}: TokenProvisionFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<TokenProvisionValues>({
    userId: "",
    appId: "",
    policy: "",
    status: "Active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    userId: z.string().min(1, t("forms.required")),
    appId: z.string().min(1, t("forms.required")),
    policy: z.string().min(1, t("forms.required")),
    status: z.enum(["Active", "Locked"]),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("tokens.filterUser")}</label>
            <Select
              value={values.userId}
              disabled={isReadOnly}
              onChange={(value) => setValues((prev) => ({ ...prev, userId: value }))}
              className="mt-2 w-full"
              options={[
                { value: "", label: t("table.all") },
                ...userOptions.map((option) => ({ value: option, label: option })),
              ]}
            />
            {errors.userId ? <p className="mt-1 text-xs text-rose-600">{errors.userId}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("tokens.filterApp")}</label>
            <Select
              value={values.appId}
              disabled={isReadOnly}
              onChange={(value) => setValues((prev) => ({ ...prev, appId: value }))}
              className="mt-2 w-full"
              options={[
                { value: "", label: t("table.all") },
                ...appOptions.map((option) => ({ value: option, label: option })),
              ]}
            />
            {errors.appId ? <p className="mt-1 text-xs text-rose-600">{errors.appId}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("tokens.policy")}</label>
            <Select
              value={values.policy}
              disabled={isReadOnly}
              onChange={(value) => setValues((prev) => ({ ...prev, policy: value }))}
              className="mt-2 w-full"
              options={[
                { value: "", label: t("table.all") },
                ...policyOptions.map((option) => ({ value: option, label: option })),
              ]}
            />
            {errors.policy ? <p className="mt-1 text-xs text-rose-600">{errors.policy}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("tokens.status")}</label>
            <Select
              value={values.status}
              disabled={isReadOnly}
              onChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  status: value as TokenProvisionValues["status"],
                }))
              }
              className="mt-2 w-full"
              options={[
                { value: "Active", label: t("users.statusActive") },
                { value: "Locked", label: t("users.statusLocked") },
              ]}
            />
            {errors.status ? <p className="mt-1 text-xs text-rose-600">{errors.status}</p> : null}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <Button type="default" onClick={onCancel} disabled={isSubmitting}>
          {t("policies.cancel")}
        </Button>
        <Tooltip title={isReadOnly ? disabledReason : undefined}>
          <span>
            <Button type="primary" htmlType="submit" disabled={isSubmitting || isReadOnly}>
              {isSubmitting ? t("table.loading") : t("tokens.save")}
            </Button>
          </span>
        </Tooltip>
      </div>
    </form>
  );
}
