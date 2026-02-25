"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { useHealth } from "@/hooks/useHealth";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { Button, Card } from "antd";

export default function HealthPage() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();

  const { data, isLoading, error, triggerSync, isSyncing } = useHealth();

  const handleSync = async () => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("health.confirmSync"),
      confirmLabel: t("ui.confirm"),
    });
    if (!accepted) return;
    try {
      await triggerSync();
      toast({ variant: "success", message: t("health.toastSync") });
    } catch {
      toast({ variant: "error", message: t("table.error") });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("health.title")}</h1>
          <p className="text-sm text-slate-500">{t("health.subtitle")}</p>
        </div>
        <Button type="primary" onClick={handleSync} loading={isSyncing}>
          {t("health.sync")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("health.clockDrift"), value: "120ms" },
          { label: t("health.lastSync"), value: "2024-11-12 09:15" },
          { label: t("health.otpEngine"), value: t("health.statusHealthy") },
          { label: t("health.errorRate"), value: "1.2%" },
        ].map((card) => (
          <Card key={card.label} className="rounded-xl">
            <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        <Card title={t("health.timeSyncTitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("health.ntpServer")}</p>
              <p className="mt-1 text-sm text-slate-900">pool.ntp.org</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("health.offset")}</p>
              <p className="mt-1 text-sm text-slate-900">-45ms</p>
            </div>
          </div>
        </Card>
        <Card title={t("health.uptimeTitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("health.service")}</p>
              <p className="mt-1 text-sm text-slate-900">otp-engine</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("health.uptime")}</p>
              <p className="mt-1 text-sm text-slate-900">99.98%</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("health.lastIncident")}</p>
              <p className="mt-1 text-sm text-slate-900">2024-11-10 18:22</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-lg mx-auto mt-8 p-6 rounded-xl border bg-white shadow">
        <h2 className="text-xl font-bold mb-4">Service Health</h2>
        <pre className="bg-slate-100 p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
