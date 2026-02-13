"use client";

import DataTable from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { Button, Tag, Tooltip } from "antd";
import { useMemo, useState } from "react";

type VerificationSession = {
  id: string;
  userId: string;
  method: "OTP" | "Biometric" | "Multi";
  status: "Pending" | "Verified" | "Locked";
  retries: number;
  lastAttempt: string;
};

const sessionsFixture: VerificationSession[] = [
  {
    id: "vs_1001",
    userId: "u_10234",
    method: "OTP",
    status: "Pending",
    retries: 1,
    lastAttempt: "2024-11-12 09:10",
  },
  {
    id: "vs_1002",
    userId: "u_10412",
    method: "Multi",
    status: "Locked",
    retries: 5,
    lastAttempt: "2024-11-12 09:14",
  },
  {
    id: "vs_1003",
    userId: "u_10988",
    method: "OTP",
    status: "Verified",
    retries: 0,
    lastAttempt: "2024-11-12 09:01",
  },
];

export default function VerificationsPage() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const rows = useMemo(() => sessionsFixture, []);
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.status))).map((value) => ({
        label: value,
        value,
      })),
    [rows],
  );

  const filteredRows = rows.filter((row) => {
    const matchesSearch = searchValue
      ? row.userId.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleResend = async () => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("verifications.confirmResend"),
      confirmLabel: t("ui.confirm"),
    });
    if (!accepted) return;
    toast({ variant: "success", message: t("verifications.toastResend") });
  };

  return (
    <div className="space-y-6">
      <DataTable
        title={t("verifications.title")}
        description={t("verifications.subtitle")}
        enableSearch
        searchPlaceholder={t("verifications.filterUser")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValues={{
          userId: searchValue,
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "userId") setSearchValue(value);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          {
            key: "userId",
            label: t("verifications.filterUser"),
            placeholder: t("placeholders.userId"),
          },
          {
            key: "status",
            label: t("verifications.filterStatus"),
            placeholder: t("placeholders.status"),
            type: "select",
            options: statusOptions,
          },
        ]}
        columns={[
          {
            key: "session",
            header: t("verifications.session"),
            render: (row) => row.id,
            sortValue: (row) => row.id,
          },
          {
            key: "user",
            header: t("verifications.user"),
            render: (row) => row.userId,
            sortValue: (row) => row.userId,
          },
          {
            key: "method",
            header: t("verifications.method"),
            render: (row) => row.method,
            sortValue: (row) => row.method,
          },
          {
            key: "retries",
            header: t("verifications.retries"),
            render: (row) => row.retries,
            sortValue: (row) => row.retries,
          },
          {
            key: "lastAttempt",
            header: t("verifications.lastAttempt"),
            render: (row) => row.lastAttempt,
            sortValue: (row) => row.lastAttempt,
          },
          {
            key: "status",
            header: t("verifications.status"),
            render: (row) => (
              <Tag
                color={
                  row.status === "Locked" ? "red" : row.status === "Verified" ? "green" : "gold"
                }
              >
                {row.status}
              </Tag>
            ),
            sortValue: (row) => row.status,
          },
          {
            key: "actions",
            header: t("verifications.actions"),
            render: () => (
              <Tooltip
                title={
                  !canAccess(role, "verifications:resend") ? t("ui.permissionDenied") : undefined
                }
              >
                <span>
                  <Button
                    type="default"
                    size="small"
                    disabled={!canAccess(role, "verifications:resend")}
                    onClick={handleResend}
                  >
                    {t("verifications.resend")}
                  </Button>
                </span>
              </Tooltip>
            ),
          },
        ]}
        rows={filteredRows}
        defaultSortKey="lastAttempt"
        enablePagination
      />
    </div>
  );
}
