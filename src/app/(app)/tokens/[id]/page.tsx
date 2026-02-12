"use client";

import ActivityTimeline from "@/components/ActivityTimeline";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { type TokenRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatDate, formatDateTime, getStatusLabel } from "@/utils/formatters";
import { Button, Card, Descriptions, Typography } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function TokenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const [isRevealed, setIsRevealed] = useState(false);
  const { data, isLoading, error, refetch } = useMockQuery<TokenRecord | null>(() =>
    otpService.getToken(String(id)),
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

  const secret = `SECRET-${data.id.toUpperCase()}`;
  const otpUri = `otpauth://totp/${data.userId}?secret=${secret}&issuer=SmartOTP`;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: t("breadcrumbs.tokens"), href: "/tokens" }, { label: data.id }]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.id}</h1>
          <p className="text-sm text-slate-500">
            {t("tokens.user")}: {data.userId}
          </p>
        </div>
        <Link href="/tokens" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
          ← {t("breadcrumbs.tokens")}
        </Link>
      </div>

      <Card>
        <Descriptions
          size="small"
          column={{ xs: 1, sm: 2, lg: 3 }}
          items={[
            { key: "app", label: t("tokens.app"), children: data.appId },
            { key: "status", label: t("tokens.status"), children: getStatusLabel(data.status, t) },
            {
              key: "createdAt",
              label: t("logs.createdAt"),
              children: formatDate(data.createdAt, locale),
            },
          ]}
        />
      </Card>

      <Card title={t("tokens.lastUsed")}>
        <Typography.Text type="secondary">{data.lastUsed}</Typography.Text>
      </Card>

      <Card title={t("logs.timelineTitle")}>
        <ActivityTimeline
          items={[
            {
              label: `${t("logs.createdAt")} • ${formatDate(data.createdAt, locale)}`,
              time: formatDate(data.createdAt, locale),
            },
            {
              label: `${t("tokens.lastUsed")} • ${data.lastUsed}`,
              time: formatDateTime(data.lastUsed, locale),
            },
          ]}
        />
      </Card>

      <Card
        title={t("tokens.enrollmentTitle")}
        extra={
          <Button
            type="default"
            size="small"
            onClick={() => setIsRevealed(true)}
            disabled={isRevealed}
          >
            {isRevealed ? t("tokens.revealed") : t("tokens.reveal")}
          </Button>
        }
      >
        <Typography.Text type="secondary">{t("tokens.enrollmentHint")}</Typography.Text>

        {isRevealed ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card size="small" className="bg-slate-50">
              <Typography.Text className="text-slate-800" strong>
                {t("tokens.qrPlaceholder")}
              </Typography.Text>
              <Typography.Paragraph className="mt-2 text-xs text-slate-600">
                {otpUri}
              </Typography.Paragraph>
            </Card>
            <Card size="small">
              <Typography.Text className="text-slate-800" strong>
                {t("tokens.secretLabel")}
              </Typography.Text>
              <Typography.Paragraph className="mt-2 font-mono text-sm text-slate-900">
                {secret}
              </Typography.Paragraph>
              <Button
                type="default"
                size="small"
                onClick={() => navigator.clipboard.writeText(secret)}
              >
                {t("tokens.copySecret")}
              </Button>
            </Card>
          </div>
        ) : (
          <Typography.Text className="mt-4" type="secondary">
            {t("tokens.secretHidden")}
          </Typography.Text>
        )}
      </Card>
    </div>
  );
}
