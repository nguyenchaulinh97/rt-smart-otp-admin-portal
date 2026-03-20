"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Form, Input, Tooltip } from "antd";
import { useState } from "react";

export type UserFormValues = {
  id: string;
  username: string;
  name: string;
  email: string;
  cif: string;
  type?: string;
};

type UserFormProps = Readonly<{
  title: string;
  initialValues: UserFormValues;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  disableId?: boolean;
  isReadOnly?: boolean;
  disabledReason?: string;
  editableFields?: Array<keyof UserFormValues>;
}>;

export default function UserForm({
  title,
  initialValues,
  onCancel,
  onSubmit,
  disableId,
  isReadOnly,
  disabledReason,
  editableFields,
}: UserFormProps) {
  const { t } = useI18n();
  const [form] = Form.useForm<UserFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFieldDisabled = (field: keyof UserFormValues) =>
    Boolean(isReadOnly || (editableFields && !editableFields.includes(field)));

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
            <Input disabled={disableId || isFieldDisabled("id")} className="mt-2" />
          </Form.Item>
          <Form.Item
            name="username"
            label={t("users.username")}
            rules={[{ required: true, min: 3, message: t("forms.minLength") }]}
          >
            <Input disabled={isFieldDisabled("username")} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="name"
            label={t("users.name")}
            rules={[{ required: true, min: 2, message: t("forms.minLength") }]}
          >
            <Input disabled={isFieldDisabled("name")} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("users.email")}
            rules={[{ required: true, type: "email", message: t("forms.email") }]}
          >
            <Input type="email" disabled={isFieldDisabled("email")} className="mt-2" />
          </Form.Item>

          <Form.Item
            name="cif"
            label={t("users.cif")}
            rules={[{ required: true, min: 2, message: t("forms.minLength") }]}
          >
            <Input disabled={isFieldDisabled("cif")} className="mt-2" />
          </Form.Item>

          <Form.Item name="type" label={t("users.type")}>
            <Input disabled={isFieldDisabled("type")} className="mt-2" />
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
