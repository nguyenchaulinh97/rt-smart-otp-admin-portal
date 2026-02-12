"use client";

import DataTable from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { type TokenRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Tag } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TokenRow = TokenRecord;

export default function TokensPage() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const {
    data,
    error,
    isLoading: isFetching,
    refetch,
  } = useMockQuery<TokenRow[]>(() => otpService.getTokens());
  const rows = useMemo(() => data ?? [], [data]);
  const uniqueRows = useMemo(() => {
    const map = new Map<string, TokenRow>();
    rows.forEach((row) => {
      const key = `${row.userId}::${row.appId}`;
      if (!map.has(key)) {
        map.set(key, row);
      }
    });
    return Array.from(map.values());
  }, [rows]);
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
  const appOptions = useMemo(
    () =>
      Array.from(new Set(uniqueRows.map((row) => row.appId))).map((value) => ({
        label: value,
        value,
      })),
    [uniqueRows],
  );
  const userOptions = useMemo(
    () =>
      Array.from(new Set(uniqueRows.map((row) => row.userId))).map((value) => ({
        label: value,
        value,
      })),
    [uniqueRows],
  );
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(uniqueRows.map((row) => row.status))).map((value) => ({
        label: getStatusLabel(value, t),
        value,
      })),
    [uniqueRows, t],
  );
  const filteredRows = uniqueRows.filter((row) => {
    const matchesSearch = searchValue
      ? row.id.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesApp = selectedApp ? row.appId === selectedApp : true;
    const matchesUser = selectedUser ? row.userId === selectedUser : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesApp && matchesUser && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t("tokens.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("tokens.subtitle")}</p>
      </header>

      <DataTable
        title={t("tokens.tableTitle")}
        description={t("tokens.tableSubtitle")}
        ctaLabel={canAccess(role, "tokens:provision") ? t("tokens.provision") : undefined}
        onCtaClick={() => router.push("/tokens/provision")}
        enableSearch
        searchPlaceholder={t("tokens.filterToken")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        enableSelection
        getRowId={(row) => row.id}
        bulkActions={[
          {
            key: "lock",
            label: t("tokens.bulkLock"),
            variant: "danger",
            onClick: handleBulkAction("lock", t("tokens.bulkLock"), "danger"),
            disabled: !canAccess(role, "tokens:lock"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "unlock",
            label: t("tokens.bulkUnlock"),
            variant: "secondary",
            onClick: handleBulkAction("unlock", t("tokens.bulkUnlock")),
            disabled: !canAccess(role, "tokens:unlock"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "reset",
            label: t("tokens.bulkReset"),
            onClick: handleBulkAction("reset", t("tokens.bulkReset")),
            disabled: !canAccess(role, "tokens:reset"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "export",
            label: t("tokens.bulkExport"),
            variant: "secondary",
            onClick: handleBulkAction("export", t("tokens.bulkExport")),
            disabled: !canAccess(role, "tokens:export"),
            disabledReason: t("ui.permissionDenied"),
          },
        ]}
        filterValues={{
          tokenId: searchValue,
          appId: selectedApp ?? "",
          userId: selectedUser ?? "",
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "tokenId") setSearchValue(value);
          if (key === "appId") setSelectedApp(value ? value : null);
          if (key === "userId") setSelectedUser(value ? value : null);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          {
            key: "tokenId",
            label: t("tokens.filterToken"),
            placeholder: t("placeholders.tokenId"),
          },
          {
            key: "appId",
            label: t("tokens.filterApp"),
            placeholder: t("placeholders.appId"),
            type: "select",
            options: appOptions,
          },
          {
            key: "userId",
            label: t("tokens.filterUser"),
            placeholder: t("placeholders.userId"),
            type: "select",
            options: userOptions,
          },
          {
            key: "status",
            label: t("tokens.filterStatus"),
            placeholder: t("placeholders.status"),
            type: "select",
            options: statusOptions,
          },
        ]}
        columns={[
          {
            key: "tokenId",
            header: t("tokens.token"),
            render: (row) => (
              <Link
                href={`/tokens/${row.id}`}
                className="font-medium text-slate-900 hover:text-slate-700"
              >
                {row.id}
              </Link>
            ),
            className: "font-medium text-slate-900",
            sortValue: (row) => row.id,
          },
          {
            key: "appId",
            header: t("tokens.app"),
            render: (row) => row.appId,
            sortValue: (row) => row.appId,
          },
          {
            key: "userId",
            header: t("tokens.user"),
            render: (row) => row.userId,
            sortValue: (row) => row.userId,
          },
          {
            key: "status",
            header: t("tokens.status"),
            render: (row) => (
              <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
            ),
            sortValue: (row) => row.status,
          },
          {
            key: "lastUsed",
            header: t("tokens.lastUsed"),
            render: (row) => row.lastUsed,
            sortValue: (row) => row.lastUsed,
          },
        ]}
        rows={filteredRows}
        defaultSortKey="tokenId"
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
