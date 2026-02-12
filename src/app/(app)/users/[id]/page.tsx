"use client";

import ActivityTimeline from "@/components/ActivityTimeline";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
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
import { Button, Card, Descriptions, List, Typography } from "antd";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
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
                span: 3,
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
            <List
              dataSource={userTokens}
              renderItem={(token) => (
                <List.Item>
                  <div className="flex w-full items-center justify-between">
                    <Typography.Text>{token.id}</Typography.Text>
                    <Typography.Text type="secondary">
                      {getStatusLabel(token.status, t)}
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

      {activeTab === "devices" && (
        <Card title={t("users.tabDevices")}>
          {userDevices.length === 0 ? (
            <Typography.Text type="secondary">{t("table.empty")}</Typography.Text>
          ) : (
            <List
              dataSource={userDevices}
              renderItem={(device) => (
                <List.Item>
                  <div className="flex w-full items-center justify-between">
                    <Typography.Text>
                      {device.id} • {device.platform}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {getStatusLabel(device.status, t)}
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
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
                <List
                  dataSource={userVerifyLogs}
                  renderItem={(log) => (
                    <List.Item>
                      <div className="flex w-full items-center justify-between">
                        <Typography.Text>
                          {getStatusLabel(log.result, t)} • {log.appId}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {formatDateTime(log.createdAt, locale)}
                        </Typography.Text>
                      </div>
                    </List.Item>
                  )}
                />
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
