"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Form, Select, Tooltip } from "antd";
import { useState } from "react";

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
  const [form] = Form.useForm<TokenProvisionValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (vals: TokenProvisionValues) => {
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
      initialValues={{ userId: "", appId: "", policy: "", status: "Active" }}
      layout="vertical"
      onFinish={handleFinish}
      className="space-y-6"
    >
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Form.Item
              name="userId"
              label={t("tokens.filterUser")}
              rules={[{ required: true, message: t("forms.required") }]}
            >
              <Select
                disabled={isReadOnly}
                className="mt-2 w-full"
                options={[
                  { value: "", label: t("table.all") },
                  ...userOptions.map((option) => ({ value: option, label: option })),
                ]}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="appId"
              label={t("tokens.filterApp")}
              rules={[{ required: true, message: t("forms.required") }]}
            >
              <Select
                disabled={isReadOnly}
                className="mt-2 w-full"
                options={[
                  { value: "", label: t("table.all") },
                  ...appOptions.map((option) => ({ value: option, label: option })),
                ]}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="policy"
              label={t("tokens.policy")}
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
          </div>
          <div>
            <Form.Item
              name="status"
              label={t("tokens.status")}
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
    </Form>
  );
}
