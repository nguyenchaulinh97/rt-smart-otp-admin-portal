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
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const {
    data,
    error,
    isLoading: isFetching,
    refetch,
  } = useMockQuery<UserRow[]>(() => otpService.getUsers());
  const rows = useMemo(() => data ?? [], [data]);
  const handleBulkAction =
    (action: "lock" | "unlock" | "reset", label: string, variant?: "danger" | "primary") =>
    async (ids: string[]) => {
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
      try {
        await otpService.bulkUserAction(action, ids);
        toast({ variant: "success", message: t("ui.toastBulk") });
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
  const runBulkAction = (action: "lock" | "unlock" | "reset", label: string, variant?: "danger" | "primary") => {
    const handler = handleBulkAction(action, label, variant);
    return (ids: string[]) => {
      handler(ids).catch(() => {
        // ignore
      });
    };
  };
  const resolvedLoading = isLoading || isFetching;
  const resolvedError = isError || error ? t("table.error") : undefined;
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.status).filter(Boolean))).map((value) => ({
        label: getStatusLabel(value as "Active" | "Locked", t),
        value: value as string,
      })),
    [rows, t],
  );
  const filteredRows = rows.filter((row) => {
    const query = searchValue.toLowerCase();
    const matchesSearch = searchValue
      ? [row.id, row.username, row.name, row.email, row.cif]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
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
            onClick: runBulkAction("lock", t("users.bulkLock"), "danger"),
            disabled: !canAccess(role, "users:lock"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "unlock",
            label: t("users.bulkUnlock"),
            variant: "secondary",
            onClick: runBulkAction("unlock", t("users.bulkUnlock")),
            disabled: !canAccess(role, "users:unlock"),
            disabledReason: t("ui.permissionDenied"),
          },
          {
            key: "reset",
            label: t("users.bulkReset"),
            onClick: runBulkAction("reset", t("users.bulkReset")),
            disabled: !canAccess(role, "users:reset"),
            disabledReason: t("ui.permissionDenied"),
          },
        ]}
        filterValues={{
          userId: searchValue,
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "userId") setSearchValue(value);
          if (key === "status") setSelectedStatus(value ?? null);
        }}
        filters={[
          {
            key: "userId",
            label: t("users.filterUser"),
            placeholder: t("placeholders.userId"),
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
            key: "username",
            header: t("users.username"),
            render: (row) => row.username,
            sortValue: (row) => row.username,
          },
          {
            key: "name",
            header: t("users.name"),
            render: (row) => row.name,
            sortValue: (row) => row.name,
          },
          {
            key: "email",
            header: t("users.email"),
            render: (row) => row.email,
            sortValue: (row) => row.email,
          },
          {
            key: "cif",
            header: t("users.cif"),
            render: (row) => row.cif,
            sortValue: (row) => row.cif,
          },
          {
            key: "status",
            header: t("users.status"),
            render: (row) =>
              row.status ? (
                <Tag color={getStatusColor(row.status)}>
                  {getStatusLabel(row.status, t)}
                </Tag>
              ) : (
                t("table.empty")
              ),
            sortValue: (row) => row.status ?? "",
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
      />
    </div>
  );
}
