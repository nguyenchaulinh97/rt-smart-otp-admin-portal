"use client";

import DataTable from "@/components/DataTable";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { canAccess } from "@/lib/rbac";
import { type PolicyRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatPolicyStep, getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Tag } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type PolicyRow = PolicyRecord;

export default function PoliciesPage() {
  const { t } = useI18n();
  const { role } = useRole();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data, error, isLoading, refetch } = useMockQuery<PolicyRow[]>(() =>
    otpService.getPolicies(),
  );
  const rows = useMemo(() => data ?? [], [data]);
  const typeOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.type))).map((value) => ({
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
      ? row.name.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesType = selectedType ? row.type === selectedType : true;
    const matchesStatus = selectedStatus ? row.status === selectedStatus : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <DataTable
        title={t("policies.tableTitle")}
        description={t("policies.tableSubtitle")}
        ctaLabel={canAccess(role, "policies:create") ? t("policies.create") : undefined}
        onCtaClick={() => router.push("/policies/new")}
        enableSearch
        searchPlaceholder={t("policies.filterName")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValues={{
          name: searchValue,
          type: selectedType ?? "",
          status: selectedStatus ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "name") setSearchValue(value);
          if (key === "type") setSelectedType(value ? value : null);
          if (key === "status") setSelectedStatus(value ? value : null);
        }}
        filters={[
          {
            key: "name",
            label: t("policies.filterName"),
            placeholder: t("placeholders.policy"),
          },
          {
            key: "type",
            label: t("policies.filterType"),
            placeholder: t("placeholders.type"),
            type: "select",
            options: typeOptions,
          },
          {
            key: "status",
            label: t("policies.filterStatus"),
            placeholder: t("placeholders.status"),
            type: "select",
            options: statusOptions,
          },
        ]}
        columns={[
          {
            key: "name",
            header: t("policies.policy"),
            render: (row) => (
              <Link
                href={`/policies/${row.id}`}
                className="font-medium text-slate-900 hover:text-slate-700"
              >
                {row.name}
              </Link>
            ),
            sortValue: (row) => row.name,
          },
          {
            key: "type",
            header: t("policies.type"),
            render: (row) => row.type,
            sortValue: (row) => row.type,
          },
          {
            key: "digits",
            header: t("policies.digits"),
            render: (row) => row.digits,
            sortValue: (row) => row.digits,
          },
          {
            key: "step",
            header: t("policies.step"),
            render: (row) => formatPolicyStep(row.type, row.stepSeconds, t),
            sortValue: (row) => row.stepSeconds ?? 0,
          },
          {
            key: "algorithm",
            header: t("policies.algorithm"),
            render: (row) => row.algorithm,
            sortValue: (row) => row.algorithm,
          },
          {
            key: "status",
            header: t("policies.status"),
            render: (row) => (
              <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
            ),
            sortValue: (row) => row.status,
          },
        ]}
        rows={filteredRows}
        defaultSortKey="name"
        isLoading={isLoading}
        errorMessage={error ? t("table.error") : undefined}
        onRetry={error ? () => refetch() : undefined}
      />
    </div>
  );
}
