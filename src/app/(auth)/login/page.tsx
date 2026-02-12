"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Checkbox, Form, Input } from "antd";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [form] = Form.useForm();

  const handleLogin = (values: { email: string; password: string; remember?: boolean }) => {
    const { email, password } = values;
    if (!email || !password) return; // validation enforced by Form rules but keep guard
    // simple auth mock: accept any non-empty values
    localStorage.setItem("auth:loggedIn", "true");
    // optionally trigger storage event for sync
    try {
      window.dispatchEvent(new Event("auth:state-change"));
    } catch {
      // ignore
    }
    router.replace("/");
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
            OTP
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("login.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleLogin} className="space-y-4">
          <Form.Item
            label={t("login.email")}
            name="email"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input type="email" placeholder="admin@company.com" />
          </Form.Item>

          <Form.Item
            label={t("login.password")}
            name="password"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input type="password" placeholder="••••••••" />
          </Form.Item>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t("login.remember")}</Checkbox>
            </Form.Item>
            <Button type="link" size="small">
              {t("login.forgot")}
            </Button>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              {t("login.button")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
