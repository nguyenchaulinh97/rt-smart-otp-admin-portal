"use client";

import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useProfile } from "@/hooks/useProfile";
import { Button, Card, Descriptions } from "antd";

export default function AdminProfilePage() {
  const { t } = useI18n();
  const { data, isLoading, error, refetch } = useProfile();

  if (isLoading) return <LoadingState rows={2} />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p>{t("profile.error")}</p>
        <p className="mt-1">{String(error)}</p>
        <Button className="mt-3" size="small" danger onClick={() => refetch()}>
          {t("table.retry")}
        </Button>
      </div>
    );
  }

  const username = String(data?.username ?? data?.user ?? "-");
  const adminId = String(data?.admin_id ?? data?.id ?? "-");

  return (
    <div className="space-y-4">
      <Card
        title={t("profile.title")}
        extra={
          <Button size="small" onClick={() => refetch()}>
            {t("profile.refresh")}
          </Button>
        }
      >
        <p className="mb-4 text-sm text-slate-500">{t("profile.subtitle")}</p>
        {data ? (
          <Descriptions
            size="small"
            column={1}
            items={[
              { key: "username", label: t("profile.username"), children: username },
              { key: "adminId", label: t("profile.adminId"), children: adminId },
            ]}
          />
        ) : (
          <p className="text-sm text-slate-500">{t("table.empty")}</p>
        )}
      </Card>
    </div>
  );
}
