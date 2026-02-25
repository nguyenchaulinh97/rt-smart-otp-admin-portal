"use client";

import { useLogin } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { Button, Checkbox, Form, Input } from "antd";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [form] = Form.useForm();

  const { login, isPending } = useLogin();
  const toast = useToast();

  const handleLogin = async (values: {
    username: string;
    password: string;
    remember?: boolean;
  }) => {
    // DEV: bypass real API login for now — set a mock token and navigate in
    try {
      // await login(values.username, values.password);
      // store a temporary token and mark loggedIn so AuthGuard recognizes auth
      try {
        localStorage.setItem("auth:token", "dev-bypass-token");
        localStorage.setItem("auth:loggedIn", "true");
        // notify other windows/listeners
        window.dispatchEvent(new Event("auth:state-change"));
        window.dispatchEvent(new Event("storage"));
      } catch {}
      router.replace("/");
    } catch (err: any) {
      // fallback in case navigation fails
      toast({ message: err?.message || "Login failed", variant: "error" });
    }
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
            label={t("login.username")}
            name="username"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input type="text" placeholder={t("placeholders.username")} />
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
            <Button type="primary" htmlType="submit" className="w-full" loading={isPending}>
              {t("login.button")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
