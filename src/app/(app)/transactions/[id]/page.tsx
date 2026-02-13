"use client";

import ActivityTimeline from "@/components/ActivityTimeline";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { otpService } from "@/services/otpService";
import { formatDateTime, getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions, Typography } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const { data, isLoading, error, refetch } = useMockQuery(() => otpService.getTransactions());

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

  const record = (data ?? []).find((item) => item.id === id);
  if (!record) {
    return <div className="text-sm text-slate-500">{t("table.empty")}</div>;
  }

  const signature = {
    signer: `key_${record.userId}`,
    method: "HSM",
    hash: `hash_${record.id}`,
    proof: `proof_${record.id}`,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: t("transactions.title"), href: "/transactions" }, { label: record.id }]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{record.id}</h1>
          <p className="text-sm text-slate-500">{t("transactions.detailTitle")}</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          ← {t("transactions.title")}
        </Link>
      </div>

      <div className="grid gap-4">
        <Card>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={[
              { key: "user", label: t("transactions.user"), children: record.userId },
              { key: "device", label: t("transactions.device"), children: record.deviceId },
              {
                key: "status",
                label: t("transactions.status"),
                children: getStatusLabel(record.status, t),
              },
              {
                key: "createdAt",
                label: t("transactions.createdAt"),
                children: formatDateTime(record.createdAt, locale),
              },
              {
                key: "expiredAt",
                label: t("transactions.expiredAt"),
                children: formatDateTime(record.expiredAt, locale),
              },
            ]}
          />
        </Card>

        <Card title={t("transactions.proofTitle")}>
          <div className="grid gap-2 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("transactions.hashLabel")}</p>
              <p className="mt-1 font-mono text-slate-900">{signature.hash}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{t("transactions.proofLabel")}</p>
              <p className="mt-1 font-mono text-slate-900">{signature.proof}</p>
            </div>
          </div>
        </Card>

        <Card title={t("transactions.signatureTitle")}>
          <div className="grid gap-2 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {t("transactions.signerLabel")}
              </p>
              <p className="mt-1 font-medium text-slate-900">{signature.signer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {t("transactions.methodLabel")}
              </p>
              <p className="mt-1 font-medium text-slate-900">{signature.method}</p>
            </div>
          </div>
        </Card>

        <Card title={t("logs.timelineTitle")}>
          <ActivityTimeline
            items={[
              {
                label: `${t("transactions.createdAt")} • ${record.userId}`,
                time: formatDateTime(record.createdAt, locale),
              },
              {
                label: `${t("transactions.status")} • ${getStatusLabel(record.status, t)}`,
                time: formatDateTime(record.expiredAt, locale),
              },
            ]}
          />
          <Typography.Text type="secondary">{t("transactions.timelineHint")}</Typography.Text>
        </Card>
      </div>
    </div>
  );
}
