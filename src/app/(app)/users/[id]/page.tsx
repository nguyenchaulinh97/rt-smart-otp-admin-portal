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
import {
  type AuditLogRecord,
  type DeviceRecord,
  type TokenRecord,
  type UserRecord,
  type VerifyLogRecord,
} from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatDate, formatDateTime, getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions, Tooltip, Typography } from "antd";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const tabParam = searchParams.get("tab");
  const activeTab = "profile,tokens,devices,activity".split(",").includes(tabParam ?? "")
    ? (tabParam as "profile" | "tokens" | "devices" | "activity")
    : "profile";
  const { data, isLoading, error, refetch } = useMockQuery<UserRecord | null>(() =>
    otpService.getUser(String(id)),
  );
  const { data: tokenData } = useMockQuery<TokenRecord[]>(() => otpService.getTokens());
  const { data: logData } = useMockQuery<AuditLogRecord[]>(() => otpService.getAuditLogs());
  const { data: deviceData } = useMockQuery<DeviceRecord[]>(() => otpService.getDevices());
  const { data: verifyData } = useMockQuery<VerifyLogRecord[]>(() => otpService.getVerifyLogs());

  const userTokens = useMemo(() => {
    const tokens = (tokenData ?? []).filter((token) => token.userId === data?.id);
    const map = new Map<string, TokenRecord>();
    tokens.forEach((token) => {
      const key = token.appId;
      if (!map.has(key)) {
        map.set(key, token);
      }
    });
    return Array.from(map.values());
  }, [tokenData, data?.id]);

  const userLogs = useMemo(
    () => (logData ?? []).filter((log) => log.target.includes(data?.id ?? "")),
    [logData, data?.id],
  );

  const userDevices = useMemo(
    () => (deviceData ?? []).filter((device) => device.userId === data?.id),
    [deviceData, data?.id],
  );

  const userVerifyLogs = useMemo(
    () => (verifyData ?? []).filter((log) => log.userId === data?.id),
    [verifyData, data?.id],
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

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: t("breadcrumbs.users"), href: "/users" }, { label: data.id }]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.id}</h1>
          <p className="text-sm text-slate-500">{data.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="default"
            size="small"
            disabled={!canAccess(role, "users:edit")}
            title={!canAccess(role, "users:edit") ? t("ui.permissionDenied") : undefined}
            onClick={() => router.push(`/users/${data.id}/edit`)}
          >
            {t("users.editTitle")}
          </Button>
          <Link href="/users" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
            ← {t("breadcrumbs.users")}
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "profile", label: t("users.tabProfile") },
          { key: "tokens", label: t("users.tabTokens") },
          { key: "devices", label: t("users.tabDevices") },
          { key: "activity", label: t("users.tabActivity") },
        ].map((tab) => (
          <Button
            key={tab.key}
            type={activeTab === tab.key ? "primary" : "default"}
            size="small"
            onClick={() => {
              const nextTab = tab.key as typeof activeTab;
              router.replace(`/users/${data.id}?tab=${nextTab}`);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "profile" && (
        <Card>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={[
              { key: "group", label: t("users.group"), children: data.group },
              {
                key: "status",
                label: t("users.status"),
                children: getStatusLabel(data.status, t),
              },
              {
                key: "createdAt",
                label: t("logs.createdAt"),
                children: formatDate(data.createdAt, locale),
              },
              { key: "app", label: t("users.app"), children: data.appId },
              {
                key: "lastActivity",
                label: t("users.lastActivity"),
                children: data.lastActivity,
                span: 2,
              },
            ]}
          />
        </Card>
      )}

      {activeTab === "tokens" && (
        <Card title={t("users.tabTokens")}>
          {userTokens.length === 0 ? (
            <Typography.Text type="secondary">{t("table.empty")}</Typography.Text>
          ) : (
            <div className="space-y-2">
              {userTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex w-full flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <Link
                      href={`/tokens/${token.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                    >
                      {token.id}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {t("tokens.app")}: {token.appId}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography.Text type="secondary">
                      {getStatusLabel(token.status, t)}
                    </Typography.Text>
                    <Tooltip
                      title={
                        token.status === "Locked"
                          ? !canAccess(role, "tokens:unlock")
                            ? t("ui.permissionDenied")
                            : undefined
                          : !canAccess(role, "tokens:lock")
                            ? t("ui.permissionDenied")
                            : undefined
                      }
                    >
                      <span>
                        <Button
                          type="default"
                          size="small"
                          disabled={
                            token.status === "Locked"
                              ? !canAccess(role, "tokens:unlock")
                              : !canAccess(role, "tokens:lock")
                          }
                          onClick={async () => {
                            const accepted = await confirm({
                              title: t("ui.confirmTitle"),
                              message:
                                token.status === "Locked"
                                  ? t("tokens.confirmUnlock")
                                  : t("tokens.confirmLock"),
                              confirmLabel: t("ui.confirm"),
                            });
                            if (!accepted) return;
                            toast({ variant: "success", message: t("tokens.actionToast") });
                          }}
                        >
                          {token.status === "Locked"
                            ? t("tokens.actionUnlock")
                            : t("tokens.actionLock")}
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        !canAccess(role, "tokens:reset") ? t("ui.permissionDenied") : undefined
                      }
                    >
                      <span>
                        <Button
                          type="default"
                          size="small"
                          disabled={!canAccess(role, "tokens:reset")}
                          onClick={async () => {
                            const accepted = await confirm({
                              title: t("ui.confirmTitle"),
                              message: t("tokens.confirmReset"),
                              confirmLabel: t("ui.confirm"),
                            });
                            if (!accepted) return;
                            toast({ variant: "success", message: t("tokens.actionToast") });
                          }}
                        >
                          {t("tokens.actionReset")}
                        </Button>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "devices" && (
        <Card title={t("users.tabDevices")}>
          {userDevices.length === 0 ? (
            <Typography.Text type="secondary">{t("table.empty")}</Typography.Text>
          ) : (
            <div className="space-y-2">
              {userDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex w-full flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <Link
                      href={`/devices/${device.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                    >
                      {device.id}
                    </Link>
                    <p className="text-xs text-slate-500">{device.platform}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography.Text type="secondary">
                      {getStatusLabel(device.status, t)}
                    </Typography.Text>
                    <Tooltip
                      title={
                        !canAccess(role, "devices:block") ? t("ui.permissionDenied") : undefined
                      }
                    >
                      <span>
                        <Button
                          type="default"
                          size="small"
                          danger
                          disabled={!canAccess(role, "devices:block")}
                          onClick={async () => {
                            const accepted = await confirm({
                              title: t("ui.confirmTitle"),
                              message: t("devices.confirmBlock"),
                              confirmLabel: t("ui.confirm"),
                            });
                            if (!accepted) return;
                            toast({ variant: "success", message: t("devices.actionToast") });
                          }}
                        >
                          {t("devices.actionBlock")}
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        !canAccess(role, "devices:unbind") ? t("ui.permissionDenied") : undefined
                      }
                    >
                      <span>
                        <Button
                          type="default"
                          size="small"
                          disabled={!canAccess(role, "devices:unbind")}
                          onClick={async () => {
                            const accepted = await confirm({
                              title: t("ui.confirmTitle"),
                              message: t("devices.confirmUnbind"),
                              confirmLabel: t("ui.confirm"),
                            });
                            if (!accepted) return;
                            toast({ variant: "success", message: t("devices.actionToast") });
                          }}
                        >
                          {t("devices.actionUnbind")}
                        </Button>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "activity" && (
        <Card title={t("users.tabActivity")}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card size="small" title={t("logs.verifyTab")}>
              {userVerifyLogs.length === 0 ? (
                <Typography.Text type="secondary">{t("table.empty")}</Typography.Text>
              ) : (
                <div className="space-y-2">
                  {userVerifyLogs.map((log) => (
                    <div
                      key={String(log.createdAt)}
                      className="flex w-full items-center justify-between"
                    >
                      <Typography.Text>
                        {getStatusLabel(log.result, t)} • {log.appId}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {formatDateTime(log.createdAt, locale)}
                      </Typography.Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card size="small" title={t("logs.timelineTitle")}>
              {userVerifyLogs.length === 0 && userLogs.length === 0 ? (
                <Typography.Text type="secondary">{t("table.empty")}</Typography.Text>
              ) : (
                <ActivityTimeline
                  items={[
                    ...userVerifyLogs.map((log) => ({
                      label: `${t("logs.verifyTab")} • ${getStatusLabel(log.result, t)} • ${log.appId}`,
                      time: formatDateTime(log.createdAt, locale),
                    })),
                    ...userLogs.map((log) => ({
                      label: `${t("logs.adminTab")} • ${log.action}`,
                      time: formatDateTime(log.createdAt, locale),
                    })),
                  ]}
                />
              )}
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
}
