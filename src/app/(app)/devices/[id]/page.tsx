"use client";

import LoadingState from "@/components/LoadingState";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useToast } from "@/hooks/useToast";
import { type DeviceRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, isLoading, error, refetch } = useMockQuery<DeviceRecord | null>(() =>
    otpService.getDevice(String(id)),
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-2 text-sm text-rose-600">
        <p>{t("table.error")}</p>
        <Button type="default" size="small" danger onClick={() => refetch()}>
          {t("table.retry")}
        </Button>
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-slate-500">{t("table.empty")}</div>;
  }

  const handleAction = async (message: string) => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message,
      confirmLabel: t("ui.confirm"),
    });
    if (!accepted) return;
    toast({ variant: "success", message: t("devices.actionToast") });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.id}</h1>
          <p className="text-sm text-slate-500">{data.platform}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="default"
            size="small"
            danger
            onClick={() => handleAction(t("devices.confirmBlock"))}
          >
            {t("devices.actionBlock")}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => handleAction(t("devices.confirmUnbind"))}
          >
            {t("devices.actionUnbind")}
          </Button>
          <Link
            href="/devices"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            ← {t("breadcrumbs.devices")}
          </Link>
        </div>
      </div>

      <Card>
        <Descriptions
          size="small"
          column={{ xs: 1, sm: 2, lg: 3 }}
          items={[
            {
              key: "user",
              label: t("devices.user"),
              children: <Link href={`/users/${data.userId}`}>{data.userId}</Link>,
            },
            {
              key: "app",
              label: t("devices.app"),
              children: <Link href={`/apps/${data.appId}`}>{data.appId}</Link>,
            },
            { key: "status", label: t("devices.status"), children: getStatusLabel(data.status, t) },
            { key: "lastSeen", label: t("devices.lastSeen"), children: data.lastSeen },
          ]}
        />
      </Card>
    </div>
  );
}
