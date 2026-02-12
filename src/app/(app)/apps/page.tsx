"use client";

import DataTable from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { type AppRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatNumber, getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Tag } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type AppRow = AppRecord;

export default function AppsPage() {
  const { t, locale } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const {
    data,
    error,
    isLoading: isFetching,
    refetch,
  } = useMockQuery<AppRow[]>(() => otpService.getApps());
  const rows = useMemo(() => data ?? [], [data]);
  const handleBulkAction =
    (action: string, label: string, variant?: "danger" | "primary") => async (ids: string[]) => {
      if (ids.length === 0) return;
      const accepted = await confirm({
        title: t("ui.confirmTitle"),
        message: t("ui.confirmBulkMessage"),
        confirmLabel: label,
        variant: variant ?? "primary",
      });
      if (!accepted) return;
      setIsLoading(true);
      setIsError(false);
      window.setTimeout(() => {
        setIsLoading(false);
        toast({ variant: "success", message: t("ui.toastBulk") });
      }, 400);
      void action;
      void ids;
    };
  const resolvedLoading = isLoading || isFetching;
  const resolvedError = isError ? t("table.error") : error ? t("table.error") : undefined;
  const policyOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.policy))).map((value) => ({ label: value, value })),
    [rows],
  );
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.status))).map((value) => ({
        label: getStatusLabel(value, t),
        value,
      })),
    [rows, t],
  );
  const filteredRows = rows.filter((row) => {
    const matchesSearch = searchValue
      ? row.id.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesPolicy = selectedPolicy ? row.policy === selectedPolicy : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesPolicy && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t("apps.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("apps.subtitle")}</p>
      </header>

      <DataTable
        title={t("apps.tableTitle")}
        description={t("apps.tableSubtitle")}
        ctaLabel={canAccess(role, "apps:create") ? t("apps.create") : undefined}
        onCtaClick={() => router.push("/apps/new")}
        enableSearch
        searchPlaceholder={t("apps.filterApp")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        enableSelection
        getRowId={(row) => row.id}
        bulkActions={[
          {
            key: "pause",
            label: t("apps.bulkPause"),
            variant: "secondary",
            onClick: handleBulkAction("pause", t("apps.bulkPause")),
            disabled: !canAccess(role, "apps:pause"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "activate",
            label: t("apps.bulkActivate"),
            onClick: handleBulkAction("activate", t("apps.bulkActivate")),
            disabled: !canAccess(role, "apps:activate"),
            disabledReason: t("ui.permissionDenied"),
          },
        ]}
        filterValues={{
          appId: searchValue,
          policy: selectedPolicy ?? "",
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "appId") setSearchValue(value);
          if (key === "policy") setSelectedPolicy(value ? value : null);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          { key: "appId", label: t("apps.filterApp"), placeholder: t("placeholders.appId") },
          {
            key: "policy",
            label: t("apps.filterPolicy"),
            placeholder: t("placeholders.policy"),
            type: "select",
            options: policyOptions,
          },
          {
            key: "status",
            label: t("apps.filterStatus"),
            placeholder: t("placeholders.status"),
            type: "select",
            options: statusOptions,
          },
        ]}
        columns={[
          {
            key: "appId",
            header: t("apps.appId"),
            render: (row) => (
              <Link
                href={`/apps/${row.id}`}
                className="font-medium text-slate-900 hover:text-slate-700"
              >
                {row.id}
              </Link>
            ),
            className: "font-medium text-slate-900",
            sortValue: (row) => row.id,
          },
          {
            key: "policy",
            header: t("apps.policy"),
            render: (row) => row.policy,
            sortValue: (row) => row.policy,
          },
          {
            key: "status",
            header: t("apps.status"),
            render: (row) => (
              <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
            ),
            sortValue: (row) => row.status,
          },
          {
            key: "tokens",
            header: t("apps.tokens"),
            render: (row) => formatNumber(row.tokens, locale),
            sortValue: (row) => row.tokens,
          },
        ]}
        rows={filteredRows}
        defaultSortKey="appId"
        isLoading={resolvedLoading}
        errorMessage={resolvedError}
        onRetry={
          resolvedError
            ? () => {
                setIsError(false);
                refetch();
              }
            : undefined
        }
        pageSize={5}
      />
    </div>
  );
}
