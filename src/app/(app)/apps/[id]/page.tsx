"use client";

import ActivityTimeline from "@/components/ActivityTimeline";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { type AppRecord, type PolicyRecord, type TokenRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatDate, formatNumber, formatPolicyStep, getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions, Tooltip, Typography } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const { data, isLoading, error, refetch } = useMockQuery<AppRecord | null>(() =>
    otpService.getApp(String(id)),
  );
  const { data: policies } = useMockQuery<PolicyRecord[]>(() => otpService.getPolicies());
  const { data: tokens } = useMockQuery<TokenRecord[]>(() => otpService.getTokens());
  const selectedPolicy = useMemo(
    () => policies?.find((policy) => policy.name === data?.policy),
    [policies, data?.policy],
  );
  const appTokens = useMemo(
    () => (tokens ?? []).filter((token) => token.appId === data?.id),
    [tokens, data?.id],
  );

  const handleTokenAction = async (message: string) => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message,
      confirmLabel: t("ui.confirm"),
    });
    if (!accepted) return;
    toast({ variant: "success", message: t("tokens.actionToast") });
  };

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

        <Card
          title={t("policies.details")}
          extra={
            selectedPolicy ? (
              <Button type="default" onClick={() => router.push(`/policies/${selectedPolicy.id}`)}>
                {t("policies.view")}
              </Button>
            ) : null
          }
        >
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
        </Card>

        <Card title={t("apps.tokens")}>
          {appTokens.length === 0 ? (
            <Typography.Text type="secondary">{t("table.empty")}</Typography.Text>
          ) : (
            <div className="space-y-3">
              {appTokens.map((token) => {
                const isLocked = token.status === "Locked";
                const canLock = canAccess(role, "tokens:lock");
                const canUnlock = canAccess(role, "tokens:unlock");
                const canReset = canAccess(role, "tokens:reset");
                const lockDisabled = isLocked ? !canUnlock : !canLock;
                const lockLabel = isLocked ? t("tokens.actionUnlock") : t("tokens.actionLock");
                return (
                  <div
                    key={token.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <Link
                        href={`/tokens/${token.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                      >
                        {token.id}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {t("tokens.user")}: {token.userId}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Typography.Text type="secondary">
                        {getStatusLabel(token.status, t)}
                      </Typography.Text>
                      <Tooltip title={lockDisabled ? t("ui.permissionDenied") : undefined}>
                        <span>
                          <Button
                            type="default"
                            size="small"
                            disabled={lockDisabled}
                            onClick={() =>
                              handleTokenAction(
                                isLocked ? t("tokens.confirmUnlock") : t("tokens.confirmLock"),
                              )
                            }
                          >
                            {lockLabel}
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title={!canReset ? t("ui.permissionDenied") : undefined}>
                        <span>
                          <Button
                            type="default"
                            size="small"
                            disabled={!canReset}
                            onClick={() => handleTokenAction(t("tokens.confirmReset"))}
                          >
                            {t("tokens.actionReset")}
                          </Button>
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
