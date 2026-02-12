"use client";

import ActivityTimeline from "@/components/ActivityTimeline";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { canAccess } from "@/lib/rbac";
import { type AppRecord, type PolicyRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatDate, formatNumber, formatPolicyStep, getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions, Typography } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { role } = useRole();
  const { data, isLoading, error, refetch } = useMockQuery<AppRecord | null>(() =>
    otpService.getApp(String(id)),
  );
  const { data: policies } = useMockQuery<PolicyRecord[]>(() => otpService.getPolicies());
  const selectedPolicy = useMemo(
    () => policies?.find((policy) => policy.name === data?.policy),
    [policies, data?.policy],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-2 text-sm text-rose-600">
        <p>{t("table.error")}</p>
        <Button type="default" danger onClick={() => refetch()}>
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
      <Breadcrumbs items={[{ label: t("breadcrumbs.apps"), href: "/apps" }, { label: data.id }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.name}</h1>
          <p className="text-sm text-slate-500">
            {t("apps.appId")}: {data.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="default"
            disabled={!canAccess(role, "apps:edit")}
            title={!canAccess(role, "apps:edit") ? t("ui.permissionDenied") : undefined}
            onClick={() => router.push(`/apps/${data.id}/edit`)}
          >
            {t("apps.editTitle")}
          </Button>
          <Link href="/apps" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
            ← {t("breadcrumbs.apps")}
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={[
              { key: "policy", label: t("apps.policy"), children: data.policy },
              {
                key: "status",
                label: t("apps.status"),
                children: getStatusLabel(data.status, t),
              },
              {
                key: "tokens",
                label: t("apps.tokens"),
                children: formatNumber(data.tokens, locale),
              },
            ]}
          />
        </Card>

        <Card title={t("logs.createdAt")}>
          <Typography.Text type="secondary">{formatDate(data.createdAt, locale)}</Typography.Text>
        </Card>

        <Card title={t("logs.timelineTitle")}>
          <ActivityTimeline
            items={[
              {
                label: `${t("apps.policy")} • ${data.policy}`,
                time: formatDate(data.createdAt, locale),
              },
              {
                label: `${t("apps.status")} • ${getStatusLabel(data.status, t)}`,
                time: formatDate(data.createdAt, locale),
              },
            ]}
          />
        </Card>

        <Card title={t("policies.details")}>
          <Typography.Text type="secondary">{t("apps.policyEditorHint")}</Typography.Text>
          {selectedPolicy ? (
            <Descriptions
              className="mt-4"
              size="small"
              column={{ xs: 1, sm: 2 }}
              items={[
                { key: "type", label: t("policies.type"), children: selectedPolicy.type },
                { key: "digits", label: t("policies.digits"), children: selectedPolicy.digits },
                {
                  key: "step",
                  label: t("policies.step"),
                  children: formatPolicyStep(selectedPolicy.type, selectedPolicy.stepSeconds, t),
                },
                {
                  key: "window",
                  label: t("policies.window"),
                  children: selectedPolicy.window ?? "-",
                },
                {
                  key: "algorithm",
                  label: t("policies.algorithm"),
                  children: selectedPolicy.algorithm,
                },
                {
                  key: "status",
                  label: t("policies.status"),
                  children: getStatusLabel(selectedPolicy.status, t),
                },
              ]}
            />
          ) : (
            <Typography.Text className="mt-4" type="secondary">
              {t("table.empty")}
            </Typography.Text>
          )}
          <Button type="default" className="mt-4" disabled>
            {t("policies.save")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
