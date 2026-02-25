"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { Button, Card, Input, Select, Switch } from "antd";
import { useState } from "react";

export default function AuditAdvancedPage() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const [retentionDays, setRetentionDays] = useState("90");
  const [anonymize, setAnonymize] = useState(true);
  const [template, setTemplate] = useState("Monthly Compliance");

  const handleSave = async () => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("auditAdvanced.confirmSave"),
      confirmLabel: t("ui.confirm"),
    });
    if (!accepted) return;
    toast({ variant: "success", message: t("auditAdvanced.toastSaved") });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("auditAdvanced.title")}</h1>
        <p className="text-sm text-slate-500">{t("auditAdvanced.subtitle")}</p>
      </div>

      <div className="grid gap-4">
        <Card title={t("auditAdvanced.alertsTitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("auditAdvanced.alertRule")}</p>
              <Input className="mt-2" placeholder="FAILED_VERIFY > 10 / 10m" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("auditAdvanced.notify")}</p>
              <Select
                className="mt-2 w-full"
                value="Slack"
                options={[
                  { value: "Slack", label: "Slack" },
                  { value: "Email", label: "Email" },
                  { value: "Webhook", label: "Webhook" },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card title={t("auditAdvanced.reportsTitle")}>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("auditAdvanced.template")}</p>
              <Select
                className="mt-2 w-full"
                value={template}
                onChange={(value) => setTemplate(value)}
                options={[
                  { value: "Monthly Compliance", label: "Monthly Compliance" },
                  { value: "PCI DSS", label: "PCI DSS" },
                  { value: "SOC2", label: "SOC2" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("auditAdvanced.schedule")}</p>
              <Select
                className="mt-2 w-full"
                value="Monthly"
                options={[
                  { value: "Daily", label: "Daily" },
                  { value: "Weekly", label: "Weekly" },
                  { value: "Monthly", label: "Monthly" },
                ]}
              />
            </div>
          </div>
          <Button type="default" className="mt-4" onClick={handleSave}>
            {t("auditAdvanced.generate")}
          </Button>
        </Card>

        <Card title={t("auditAdvanced.retentionTitle")}>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {t("auditAdvanced.retentionDays")}
              </p>
              <Input
                className="mt-2"
                value={retentionDays}
                onChange={(event) => setRetentionDays(event.target.value)}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("auditAdvanced.anonymize")}</p>
              <div className="mt-2">
                <Switch checked={anonymize} onChange={(checked) => setAnonymize(checked)} />
              </div>
            </div>
          </div>
          <Button type="primary" className="mt-4" onClick={handleSave}>
            {t("auditAdvanced.save")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
