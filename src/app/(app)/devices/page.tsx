"use client";

import DataTable from "@/components/DataTable";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { type DeviceRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Tag } from "antd";
import Link from "next/link";
import { useState } from "react";

type DeviceRow = DeviceRecord;

export default function DevicesPage() {
  const { t } = useI18n();
  const [isError, setIsError] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const {
    data,
    error,
    isLoading: isFetching,
    refetch,
  } = useMockQuery<DeviceRow[]>(() => otpService.getDevices());
  const rows = data ?? [];
  const resolvedLoading = isFetching;
  const resolvedError = isError ? t("table.error") : error ? t("table.error") : undefined;
  const filteredRows = rows.filter((row) => {
    const matchesSearch = searchValue
      ? row.id.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesUser = selectedUser ? row.userId === selectedUser : true;
    const matchesApp = selectedApp ? row.appId === selectedApp : true;
    const matchesPlatform = selectedPlatform ? row.platform === selectedPlatform : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesUser && matchesApp && matchesPlatform && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <DataTable
        title={t("devices.tableTitle")}
        description={t("devices.tableSubtitle")}
        enableSearch
        searchPlaceholder={t("devices.filterDevice")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValues={{
          deviceId: searchValue,
          userId: selectedUser ?? "",
          appId: selectedApp ?? "",
          platform: selectedPlatform ?? "",
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "deviceId") setSearchValue(value);
          if (key === "userId") setSelectedUser(value ? value : null);
          if (key === "appId") setSelectedApp(value ? value : null);
          if (key === "platform") setSelectedPlatform(value ? value : null);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          {
            key: "deviceId",
            label: t("devices.filterDevice"),
            placeholder: t("placeholders.deviceId"),
          },
          {
            key: "userId",
            label: t("devices.filterUser"),
            placeholder: t("placeholders.userId"),
          },
          {
            key: "appId",
            label: t("devices.filterApp"),
            placeholder: t("placeholders.appId"),
          },
          {
            key: "platform",
            label: t("devices.filterPlatform"),
            placeholder: t("placeholders.platform"),
          },
          {
            key: "status",
            label: t("devices.filterStatus"),
            placeholder: t("placeholders.status"),
          },
        ]}
        columns={[
          {
            key: "deviceId",
            header: t("devices.device"),
            render: (row) => (
              <Link
                href={`/devices/${row.id}`}
                className="font-medium text-slate-900 hover:text-slate-700"
              >
                {row.id}
              </Link>
            ),
            className: "font-medium text-slate-900",
            sortValue: (row) => row.id,
          },
          {
            key: "userId",
            header: t("devices.user"),
            render: (row) => row.userId,
            sortValue: (row) => row.userId,
          },
          {
            key: "appId",
            header: t("devices.app"),
            render: (row) => row.appId,
            sortValue: (row) => row.appId,
          },
          {
            key: "platform",
            header: t("devices.platform"),
            render: (row) => row.platform,
            sortValue: (row) => row.platform,
          },
          {
            key: "status",
            header: t("devices.status"),
            render: (row) => (
              <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
            ),
            sortValue: (row) => row.status,
          },
          {
            key: "lastSeen",
            header: t("devices.lastSeen"),
            render: (row) => row.lastSeen,
            sortValue: (row) => row.lastSeen,
          },
        ]}
        rows={filteredRows}
        defaultSortKey="deviceId"
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
