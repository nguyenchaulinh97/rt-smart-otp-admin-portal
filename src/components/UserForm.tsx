"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Form, Input, Select, Tooltip } from "antd";
import { useState } from "react";

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
  const [form] = Form.useForm<UserFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (vals: UserFormValues) => {
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
            label={t("users.filterUser")}
            rules={[{ required: true, min: 3, message: t("forms.minLength") }]}
          >
            <Input disabled={disableId || isReadOnly} className="mt-2" />
          </Form.Item>
          <Form.Item
            name="name"
            label={t("users.name")}
            rules={[{ required: true, min: 3, message: t("forms.minLength") }]}
          >
            <Input disabled={isReadOnly} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("users.email")}
            rules={[{ required: true, type: "email", message: t("forms.email") }]}
          >
            <Input type="email" disabled={isReadOnly} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="appId"
            label={t("users.appId")}
            rules={[{ required: true, min: 2, message: t("forms.minLength") }]}
          >
            <Input disabled={isReadOnly} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="group"
            label={t("users.group")}
            rules={[{ required: true, min: 2, message: t("forms.minLength") }]}
          >
            <Input disabled={isReadOnly} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="status"
            label={t("users.status")}
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Select
              disabled={isReadOnly}
              className="mt-2 w-full"
              options={[
                { value: "Active", label: t("users.statusActive") },
                { value: "Locked", label: t("users.statusLocked") },
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
              {isSubmitting ? t("table.loading") : t("users.save")}
            </Button>
          </span>
        </Tooltip>
      </div>
    </Form>
  );
}
