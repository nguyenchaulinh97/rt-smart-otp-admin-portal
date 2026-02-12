"use client";

import DataTable from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { type UserRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Tag } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type UserRow = UserRecord;

export default function UsersPage() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const {
    data,
    error,
    isLoading: isFetching,
    refetch,
  } = useMockQuery<UserRow[]>(() => otpService.getUsers());
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
  const appOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.appId))).map((value) => ({ label: value, value })),
    [rows],
  );
  const groupOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.group))).map((value) => ({ label: value, value })),
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
    const matchesApp = selectedApp ? row.appId === selectedApp : true;
    const matchesGroup = selectedGroup ? row.group === selectedGroup : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesApp && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t("users.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("users.subtitle")}</p>
      </header>

      <DataTable
        title={t("users.tableTitle")}
        description={t("users.tableSubtitle")}
        ctaLabel={canAccess(role, "users:create") ? t("users.create") : undefined}
        onCtaClick={() => router.push("/users/new")}
        enableSearch
        searchPlaceholder={t("users.filterUser")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        enableSelection
        getRowId={(row) => row.id}
        bulkActions={[
          {
            key: "lock",
            label: t("users.bulkLock"),
            variant: "danger",
            onClick: handleBulkAction("lock", t("users.bulkLock"), "danger"),
            disabled: !canAccess(role, "users:lock"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "unlock",
            label: t("users.bulkUnlock"),
            variant: "secondary",
            onClick: handleBulkAction("unlock", t("users.bulkUnlock")),
            disabled: !canAccess(role, "users:unlock"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "reset",
            label: t("users.bulkReset"),
            onClick: handleBulkAction("reset", t("users.bulkReset")),
            disabled: !canAccess(role, "users:reset"),
            disabledReason: t("ui.permissionDenied"),
          },
        ]}
        filterValues={{
          userId: searchValue,
          appId: selectedApp ?? "",
          group: selectedGroup ?? "",
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "userId") setSearchValue(value);
          if (key === "appId") setSelectedApp(value ? value : null);
          if (key === "group") setSelectedGroup(value ? value : null);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          {
            key: "userId",
            label: t("users.filterUser"),
            placeholder: t("placeholders.userId"),
          },
          {
            key: "appId",
            label: t("users.filterApp"),
            placeholder: t("placeholders.appId"),
            type: "select",
            options: appOptions,
          },
          {
            key: "group",
            label: t("users.filterGroup"),
            placeholder: t("placeholders.group"),
            type: "select",
            options: groupOptions,
          },
          {
            key: "status",
            label: t("users.filterStatus"),
            placeholder: t("placeholders.status"),
            type: "select",
            options: statusOptions,
          },
        ]}
        columns={[
          {
            key: "userId",
            header: t("users.user"),
            render: (row) => (
              <Link
                href={`/users/${row.id}`}
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
            header: t("users.app"),
            render: (row) => row.appId,
            sortValue: (row) => row.appId,
          },
          {
            key: "group",
            header: t("users.group"),
            render: (row) => row.group,
            sortValue: (row) => row.group,
          },
          {
            key: "status",
            header: t("users.status"),
            render: (row) => (
              <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
            ),
            sortValue: (row) => row.status,
          },
          {
            key: "lastActivity",
            header: t("users.lastActivity"),
            render: (row) => row.lastActivity,
            sortValue: (row) => row.lastActivity,
          },
        ]}
        rows={filteredRows}
        defaultSortKey="userId"
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
