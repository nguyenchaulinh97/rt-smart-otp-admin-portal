"use client";

import DataTable from "@/components/DataTable";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { otpService } from "@/services/otpService";
import { formatDateTime, getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Tag } from "antd";
import { useMemo, useState } from "react";

type TransactionRow = Awaited<ReturnType<typeof otpService.getTransactions>>[number];

export default function TransactionsPage() {
  const { t, locale } = useI18n();
  const [searchValue, setSearchValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useMockQuery<TransactionRow[]>(() =>
    otpService.getTransactions(),
  );
  const rows = useMemo(() => data ?? [], [data]);
  const userOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.userId))).map((value) => ({ label: value, value })),
    [rows],
  );
  const deviceOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.deviceId))).map((value) => ({
        label: value,
        value,
      })),
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
    const matchesUser = selectedUser ? row.userId === selectedUser : true;
    const matchesDevice = selectedDevice ? row.deviceId === selectedDevice : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesUser && matchesDevice && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <DataTable
        title={t("transactions.tableTitle")}
        description={t("transactions.tableSubtitle")}
        enableSearch
        searchPlaceholder={t("transactions.filterTransaction")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValues={{
          transactionId: searchValue,
          userId: selectedUser ?? "",
          deviceId: selectedDevice ?? "",
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "transactionId") setSearchValue(value);
          if (key === "userId") setSelectedUser(value ? value : null);
          if (key === "deviceId") setSelectedDevice(value ? value : null);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          {
            key: "transactionId",
            label: t("transactions.filterTransaction"),
            placeholder: t("placeholders.transactionId"),
          },
          {
            key: "userId",
            label: t("transactions.filterUser"),
            placeholder: t("placeholders.userId"),
            type: "select",
            options: userOptions,
          },
          {
            key: "deviceId",
            label: t("transactions.filterDevice"),
            placeholder: t("placeholders.deviceId"),
            type: "select",
            options: deviceOptions,
          },
          {
            key: "status",
            label: t("transactions.filterStatus"),
            placeholder: t("placeholders.status"),
            type: "select",
            options: statusOptions,
          },
        ]}
        columns={[
          {
            key: "transactionId",
            header: t("transactions.transaction"),
            render: (row) => row.id,
            sortValue: (row) => row.id,
            className: "font-medium text-slate-900",
          },
          {
            key: "userId",
            header: t("transactions.user"),
            render: (row) => row.userId,
            sortValue: (row) => row.userId,
          },
          {
            key: "deviceId",
            header: t("transactions.device"),
            render: (row) => row.deviceId,
            sortValue: (row) => row.deviceId,
          },
          {
            key: "status",
            header: t("transactions.status"),
            render: (row) => (
              <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
            ),
            sortValue: (row) => row.status,
          },
          {
            key: "createdAt",
            header: t("transactions.createdAt"),
            render: (row) => formatDateTime(row.createdAt, locale),
            sortValue: (row) => row.createdAt,
          },
          {
            key: "expiredAt",
            header: t("transactions.expiredAt"),
            render: (row) => formatDateTime(row.expiredAt, locale),
            sortValue: (row) => row.expiredAt,
          },
        ]}
        rows={filteredRows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        errorMessage={error ? t("table.error") : undefined}
        onRetry={error ? () => refetch() : undefined}
      />
    </div>
  );
}
