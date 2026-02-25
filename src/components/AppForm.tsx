"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Form, Input, Select, Tooltip } from "antd";
import { useState } from "react";

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
  const [form] = Form.useForm<AppFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (vals: AppFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(vals);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      initialValues={initialValues}
      layout="vertical"
      onFinish={handleFinish}
      className="space-y-6"
    >
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            name="id"
            label={t("apps.appId")}
            rules={[{ required: true, min: 3, message: t("forms.minLength") }]}
          >
            <Input disabled={disableId || isReadOnly} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="name"
            label={t("apps.name")}
            rules={[{ required: true, min: 3, message: t("forms.minLength") }]}
          >
            <Input disabled={isReadOnly} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="policy"
            label={t("apps.policy")}
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Select
              disabled={isReadOnly}
              className="mt-2 w-full"
              options={[
                { value: "", label: t("table.all") },
                ...policyOptions.map((option) => ({ value: option, label: option })),
              ]}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={t("apps.status")}
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Select
              disabled={isReadOnly}
              className="mt-2 w-full"
              options={[
                { value: "Active", label: t("apps.statusActive") },
                { value: "Paused", label: t("apps.statusPaused") },
              ]}
            />
          </Form.Item>
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
    </Form>
  );
}
