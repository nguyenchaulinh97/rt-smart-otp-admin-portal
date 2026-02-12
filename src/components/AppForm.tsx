"use client";

import { useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import { z } from "zod";
import { useI18n } from "@/hooks/useI18n";

export type AppFormValues = {
  id: string;
  name: string;
  policy: string;
  status: "Active" | "Paused";
};

type AppFormProps = {
  title: string;
  initialValues: AppFormValues;
  policyOptions: string[];
  onCancel: () => void;
  onSubmit: (values: AppFormValues) => Promise<void> | void;
  disableId?: boolean;
  isReadOnly?: boolean;
  disabledReason?: string;
};

export default function AppForm({
  title,
  initialValues,
  policyOptions,
  onCancel,
  onSubmit,
  disableId,
  isReadOnly,
  disabledReason,
}: AppFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<AppFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    id: z.string().min(3, t("forms.minLength")),
    name: z.string().min(3, t("forms.minLength")),
    policy: z.string().min(1, t("forms.required")),
    status: z.enum(["Active", "Paused"]),
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
            <label className="text-xs font-semibold text-slate-600">{t("apps.appId")}</label>
            <Input
              value={values.id}
              disabled={disableId || isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, id: event.target.value }))}
              className="mt-2"
            />
            {errors.id ? <p className="mt-1 text-xs text-rose-600">{errors.id}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("apps.name")}</label>
            <Input
              value={values.name}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2"
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("apps.policy")}</label>
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
            <label className="text-xs font-semibold text-slate-600">{t("apps.status")}</label>
            <Select
              value={values.status}
              disabled={isReadOnly}
              onChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  status: value as AppFormValues["status"],
                }))
              }
              className="mt-2 w-full"
              options={[
                { value: "Active", label: t("apps.statusActive") },
                { value: "Paused", label: t("apps.statusPaused") },
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
              {isSubmitting ? t("table.loading") : t("apps.save")}
            </Button>
          </span>
        </Tooltip>
      </div>
    </form>
  );
}
