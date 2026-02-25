"use client";

import DataTable from "@/components/DataTable";
import { useI18n } from "@/hooks/useI18n";
import { Tag } from "antd";
import { useMemo, useState } from "react";

type RiskEvent = {
  id: string;
  userId: string;
  type: "Velocity" | "Geo" | "Anomaly";
  score: number;
  action: "Allow" | "StepUp" | "Block";
  createdAt: string;
};

const riskFixture: RiskEvent[] = [
  {
    id: "rk_2001",
    userId: "u_10234",
    type: "Velocity",
    score: 82,
    action: "StepUp",
    createdAt: "2024-11-12 09:05",
  },
  {
    id: "rk_2002",
    userId: "u_10412",
    type: "Geo",
    score: 95,
    action: "Block",
    createdAt: "2024-11-12 08:58",
  },
  {
    id: "rk_2003",
    userId: "u_10988",
    type: "Anomaly",
    score: 40,
    action: "Allow",
    createdAt: "2024-11-12 08:43",
  },
];

export default function RiskPage() {
  const { t } = useI18n();
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const rows = useMemo(() => riskFixture, []);
  const typeOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.type))).map((value) => ({ label: value, value })),
    [rows],
  );
  const actionOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.action))).map((value) => ({ label: value, value })),
    [rows],
  );

  const filteredRows = rows.filter((row) => {
    const matchesSearch = searchValue
      ? row.userId.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesType = selectedType ? row.type === selectedType : true;
    const matchesAction = selectedAction ? row.action === selectedAction : true;
    return matchesSearch && matchesType && matchesAction;
  });

  const scoreColor = (score: number) => {
    if (score >= 85) return "red";
    if (score >= 60) return "gold";
    return "green";
  };

  return (
    <div className="space-y-6">
      <DataTable
        title={t("risk.title")}
        description={t("risk.subtitle")}
        enableSearch
        searchPlaceholder={t("risk.filterUser")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValues={{
          userId: searchValue,
          type: selectedType ?? "",
          action: selectedAction ?? "",
        }}
        onFilterChange={(key, value) => {
          if (key === "userId") setSearchValue(value);
          if (key === "type") setSelectedType(value ? value : null);
          if (key === "action") setSelectedAction(value ? value : null);
        }}
        filters={[
          { key: "userId", label: t("risk.filterUser"), placeholder: t("placeholders.userId") },
          {
            key: "type",
            label: t("risk.filterType"),
            placeholder: t("placeholders.type"),
            type: "select",
            options: typeOptions,
          },
          {
            key: "action",
            label: t("risk.filterAction"),
            placeholder: t("placeholders.action"),
            type: "select",
            options: actionOptions,
          },
        ]}
        columns={[
          {
            key: "event",
            header: t("risk.event"),
            render: (row) => row.id,
            sortValue: (row) => row.id,
          },
          {
            key: "user",
            header: t("risk.user"),
            render: (row) => row.userId,
            sortValue: (row) => row.userId,
          },
          {
            key: "type",
            header: t("risk.type"),
            render: (row) => row.type,
            sortValue: (row) => row.type,
          },
          {
            key: "score",
            header: t("risk.score"),
            render: (row) => <Tag color={scoreColor(row.score)}>{row.score}</Tag>,
            sortValue: (row) => row.score,
          },
          {
            key: "action",
            header: t("risk.action"),
            render: (row) => row.action,
            sortValue: (row) => row.action,
          },
          {
            key: "createdAt",
            header: t("risk.createdAt"),
            render: (row) => row.createdAt,
            sortValue: (row) => row.createdAt,
          },
        ]}
        rows={filteredRows}
        defaultSortKey="createdAt"
      />
    </div>
  );
}
