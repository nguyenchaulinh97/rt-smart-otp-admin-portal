"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { canAccess } from "@/lib/rbac";
import { otpService } from "@/services/otpService";
import { formatDate, formatPolicyStep, getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions, Typography } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const { role } = useRole();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useMockQuery(() => otpService.getPolicy(String(id)));

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

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: t("policies.title"), href: "/policies" }, { label: data.name }]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.name}</h1>
          <p className="text-sm text-slate-500">{data.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="default"
            size="small"
            disabled={!canAccess(role, "policies:edit")}
            title={!canAccess(role, "policies:edit") ? t("ui.permissionDenied") : undefined}
            onClick={() => router.push(`/policies/${data.id}/edit`)}
          >
            {t("policies.editTitle")}
          </Button>
          <Link
            href="/policies"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            ← {t("policies.title")}
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={[
              { key: "type", label: t("policies.type"), children: data.type },
              { key: "digits", label: t("policies.digits"), children: data.digits },
              {
                key: "step",
                label: t("policies.step"),
                children: formatPolicyStep(data.type, data.stepSeconds, t),
              },
              {
                key: "window",
                label: t("policies.window"),
                children: data.window ?? "-",
              },
              {
                key: "algorithm",
                label: t("policies.algorithm"),
                children: data.algorithm,
              },
              {
                key: "status",
                label: t("policies.status"),
                children: getStatusLabel(data.status, t),
              },
            ]}
          />
        </Card>

        <Card title={t("logs.createdAt")}>
          <Typography.Text type="secondary">{formatDate(data.createdAt, locale)}</Typography.Text>
        </Card>
      </div>
    </div>
  );
}
