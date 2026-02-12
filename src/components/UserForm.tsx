"use client";

import { useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import { z } from "zod";
import { useI18n } from "@/hooks/useI18n";

export type UserFormValues = {
  id: string;
  name: string;
  email: string;
  appId: string;
  group: string;
  status: "Active" | "Locked";
};

type UserFormProps = {
  title: string;
  initialValues: UserFormValues;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  disableId?: boolean;
  isReadOnly?: boolean;
  disabledReason?: string;
};

export default function UserForm({
  title,
  initialValues,
  onCancel,
  onSubmit,
  disableId,
  isReadOnly,
  disabledReason,
}: UserFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<UserFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    id: z.string().min(3, t("forms.minLength")),
    name: z.string().min(3, t("forms.minLength")),
    email: z.string().email(t("forms.email")),
    appId: z.string().min(2, t("forms.minLength")),
    group: z.string().min(2, t("forms.minLength")),
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
            <label className="text-xs font-semibold text-slate-600">{t("users.filterUser")}</label>
            <Input
              value={values.id}
              disabled={disableId || isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, id: event.target.value }))}
              className="mt-2"
            />
            {errors.id ? <p className="mt-1 text-xs text-rose-600">{errors.id}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("users.name")}</label>
            <Input
              value={values.name}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2"
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("users.email")}</label>
            <Input
              type="email"
              value={values.email}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-2"
            />
            {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("users.appId")}</label>
            <Input
              value={values.appId}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, appId: event.target.value }))}
              className="mt-2"
            />
            {errors.appId ? <p className="mt-1 text-xs text-rose-600">{errors.appId}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("users.group")}</label>
            <Input
              value={values.group}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, group: event.target.value }))}
              className="mt-2"
            />
            {errors.group ? <p className="mt-1 text-xs text-rose-600">{errors.group}</p> : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">{t("users.status")}</label>
            <Select
              value={values.status}
              disabled={isReadOnly}
              onChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  status: value as UserFormValues["status"],
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
              {isSubmitting ? t("table.loading") : t("users.save")}
            </Button>
          </span>
        </Tooltip>
      </div>
    </form>
  );
}
