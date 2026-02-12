"use client";

import { useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import { useI18n } from "@/hooks/useI18n";

type PolicyFormValues = {
  name: string;
  type: "TOTP" | "HOTP";
  digits: string;
  stepSeconds: string;
  window: string;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  status: "Active" | "Draft";
};

type PolicyFormProps = {
  title: string;
  initialValues: PolicyFormValues;
  onCancel: () => void;
  onSubmit: (values: PolicyFormValues) => Promise<void> | void;
  isReadOnly?: boolean;
  disabledReason?: string;
};

export default function PolicyForm({
  title,
  initialValues,
  onCancel,
  onSubmit,
  isReadOnly,
  disabledReason,
}: PolicyFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<PolicyFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof PolicyFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (next: PolicyFormValues) => {
    const nextErrors: Partial<Record<keyof PolicyFormValues, string>> = {};
    if (!next.name.trim()) nextErrors.name = t("policies.validationRequired");

    const digitsNumber = Number(next.digits);
    if (!next.digits.trim()) {
      nextErrors.digits = t("policies.validationRequired");
    } else if (Number.isNaN(digitsNumber)) {
      nextErrors.digits = t("policies.validationNumber");
    } else if (digitsNumber < 6 || digitsNumber > 8) {
      nextErrors.digits = t("policies.validationDigitsRange");
    }

    if (next.type === "TOTP") {
      const stepNumber = Number(next.stepSeconds);
      const windowNumber = Number(next.window);
      if (!next.stepSeconds.trim()) {
        nextErrors.stepSeconds = t("policies.validationStepRequired");
      } else if (Number.isNaN(stepNumber)) {
        nextErrors.stepSeconds = t("policies.validationNumber");
      }
      if (!next.window.trim()) {
        nextErrors.window = t("policies.validationWindowRequired");
      } else if (Number.isNaN(windowNumber)) {
        nextErrors.window = t("policies.validationNumber");
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
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
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.nameLabel")}
            </label>
            <Input
              value={values.name}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2"
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.typeLabel")}
            </label>
            <Select
              value={values.type}
              disabled={isReadOnly}
              onChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  type: value as PolicyFormValues["type"],
                  stepSeconds: value === "HOTP" ? "" : prev.stepSeconds,
                  window: value === "HOTP" ? "" : prev.window,
                }))
              }
              className="mt-2 w-full"
              options={[
                { value: "TOTP", label: "TOTP" },
                { value: "HOTP", label: "HOTP" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.digitsLabel")}
            </label>
            <Input
              type="number"
              min={6}
              max={8}
              value={values.digits}
              disabled={isReadOnly}
              onChange={(event) => setValues((prev) => ({ ...prev, digits: event.target.value }))}
              className="mt-2"
            />
            {errors.digits ? <p className="mt-1 text-xs text-rose-600">{errors.digits}</p> : null}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.stepLabel")}
            </label>
            <Input
              type="number"
              min={1}
              value={values.stepSeconds}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, stepSeconds: event.target.value }))
              }
              disabled={values.type === "HOTP" || isReadOnly}
              placeholder={values.type === "HOTP" ? "Counter" : "30"}
              className="mt-2"
            />
            {errors.stepSeconds ? (
              <p className="mt-1 text-xs text-rose-600">{errors.stepSeconds}</p>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.windowLabel")}
            </label>
            <Input
              type="number"
              min={0}
              value={values.window}
              onChange={(event) => setValues((prev) => ({ ...prev, window: event.target.value }))}
              disabled={values.type === "HOTP" || isReadOnly}
              placeholder={values.type === "HOTP" ? "-" : "1"}
              className="mt-2"
            />
            {errors.window ? <p className="mt-1 text-xs text-rose-600">{errors.window}</p> : null}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.algorithmLabel")}
            </label>
            <Select
              value={values.algorithm}
              disabled={isReadOnly}
              onChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  algorithm: value as PolicyFormValues["algorithm"],
                }))
              }
              className="mt-2 w-full"
              options={[
                { value: "SHA1", label: "SHA1" },
                { value: "SHA256", label: "SHA256" },
                { value: "SHA512", label: "SHA512" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              {t("policies.statusLabel")}
            </label>
            <Select
              value={values.status}
              disabled={isReadOnly}
              onChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  status: value as PolicyFormValues["status"],
                }))
              }
              className="mt-2 w-full"
              options={[
                { value: "Active", label: "Active" },
                { value: "Draft", label: "Draft" },
              ]}
            />
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
              {isSubmitting ? t("table.loading") : t("policies.save")}
            </Button>
          </span>
        </Tooltip>
      </div>
    </form>
  );
}
