"use client";

import DataTable from "@/components/DataTable";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { downloadCsv } from "@/lib/csv";
import { type AuditLogRecord, type VerifyLogRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { formatDateTime, getStatusColor, getStatusLabel } from "@/utils/formatters";
import { Button } from "antd";
import { Tag } from "antd";
import { useMemo, useState } from "react";

type VerifyRow = VerifyLogRecord;

type AuditRow = AuditLogRecord;

export default function LogsPage() {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<"verify" | "admin">("verify");
  const [searchValue, setSearchValue] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const {
    data: verifyData,
    error: verifyError,
    isLoading: verifyLoading,
    refetch: refetchVerify,
  } = useMockQuery<VerifyRow[]>(() => otpService.getVerifyLogs());
  const {
    data: auditData,
    error: auditError,
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useMockQuery<AuditRow[]>(() => otpService.getAuditLogs());

  const verifyRows = useMemo(() => verifyData ?? [], [verifyData]);
  const auditRows = useMemo(() => auditData ?? [], [auditData]);

  const filteredVerifyRows = verifyRows.filter((row) => {
    const matchesSearch = searchValue
      ? row.userId.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesApp = selectedApp ? row.appId === selectedApp : true;
    const matchesResult = selectedResult ? row.result === selectedResult : true;
    return matchesSearch && matchesApp && matchesResult;
  });

  const filteredAuditRows = auditRows.filter((row) => {
    const matchesSearch = searchValue
      ? row.actor.toLowerCase().includes(searchValue.toLowerCase())
      : true;
    const matchesActor = selectedActor ? row.actor === selectedActor : true;
    const matchesAction = selectedAction ? row.action === selectedAction : true;
    return matchesSearch && matchesActor && matchesAction;
  });

  const handleExportVerify = () =>
    downloadCsv(
      t("logs.verifyCsvFile"),
      filteredVerifyRows.map((row) => ({
        [t("csv.userId")]: row.userId,
        [t("csv.appId")]: row.appId,
        [t("csv.tokenId")]: row.tokenId,
        [t("csv.result")]: getStatusLabel(row.result, t),
        [t("csv.createdAt")]: formatDateTime(row.createdAt, locale),
      })),
    );

  const handleExportAudit = () =>
    downloadCsv(
      t("logs.adminCsvFile"),
      filteredAuditRows.map((row) => ({
        [t("csv.actor")]: row.actor,
        [t("csv.action")]: row.action,
        [t("csv.target")]: row.target,
        [t("csv.status")]: getStatusLabel(row.status, t),
        [t("csv.createdAt")]: formatDateTime(row.createdAt, locale),
      })),
    );

  return (
    <div className="space-y-6 grid gap-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 mb-0">
        <h1 className="text-2xl font-semibold text-slate-900">{t("logs.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("logs.subtitle")}</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-0">
        <div className="flex flex-wrap gap-2">
          {["verify", "admin"].map((tab) => (
            <Button
              key={tab}
              type={activeTab === tab ? "primary" : "default"}
              size="small"
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab === "verify" ? t("logs.verifyTab") : t("logs.adminTab")}
            </Button>
          ))}
        </div>
        <Button
          size="small"
          onClick={activeTab === "verify" ? handleExportVerify : handleExportAudit}
        >
          {t("logs.export")}
        </Button>
      </div>

      {activeTab === "verify" ? (
        <div className="space-y-3">
          <DataTable
            title={t("logs.verifyTableTitle")}
            enableSearch
            searchPlaceholder={t("logs.filterUser")}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filterValues={{
              userId: searchValue,
              appId: selectedApp ?? "",
              result: selectedResult ?? "",
            }}
            onFilterChange={(key, value) => {
              if (key === "userId") setSearchValue(value);
              if (key === "appId") setSelectedApp(value ? value : null);
              if (key === "result") setSelectedResult(value ? value : null);
            }}
            filters={[
              { key: "userId", label: t("logs.filterUser"), placeholder: t("placeholders.userId") },
              { key: "appId", label: t("logs.filterApp"), placeholder: t("placeholders.appId") },
              {
                key: "result",
                label: t("logs.filterResult"),
                placeholder: t("placeholders.result"),
                type: "select",
                options: [
                  { label: getStatusLabel("SUCCESS", t), value: "SUCCESS" },
                  { label: getStatusLabel("FAIL", t), value: "FAIL" },
                ],
              },
            ]}
            columns={[
              {
                key: "userId",
                header: t("logs.user"),
                render: (row) => row.userId,
                sortValue: (row) => row.userId,
              },
              {
                key: "appId",
                header: t("logs.app"),
                render: (row) => row.appId,
                sortValue: (row) => row.appId,
              },
              {
                key: "tokenId",
                header: t("logs.token"),
                render: (row) => row.tokenId,
                sortValue: (row) => row.tokenId,
              },
              {
                key: "result",
                header: t("logs.result"),
                render: (row) => (
                  <Tag color={getStatusColor(row.result)}>{getStatusLabel(row.result, t)}</Tag>
                ),
                sortValue: (row) => row.result,
              },
              {
                key: "createdAt",
                header: t("logs.createdAt"),
                render: (row) => formatDateTime(row.createdAt, locale),
                sortValue: (row) => row.createdAt,
              },
            ]}
            rows={filteredVerifyRows}
            defaultSortKey="createdAt"
            isLoading={verifyLoading}
            errorMessage={verifyError ? t("table.error") : undefined}
            onRetry={verifyError ? () => refetchVerify() : undefined}
            pageSize={5}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <DataTable
            title={t("logs.adminTableTitle")}
            enableSearch
            searchPlaceholder={t("logs.filterActor")}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filterValues={{
              actor: selectedActor ?? "",
              action: selectedAction ?? "",
            }}
            onFilterChange={(key, value) => {
              if (key === "actor") setSelectedActor(value ? value : null);
              if (key === "action") setSelectedAction(value ? value : null);
            }}
            filters={[
              { key: "actor", label: t("logs.filterActor"), placeholder: t("placeholders.actor") },
              {
                key: "action",
                label: t("logs.filterAction"),
                placeholder: t("placeholders.action"),
              },
            ]}
            columns={[
              {
                key: "actor",
                header: t("logs.actor"),
                render: (row) => row.actor,
                sortValue: (row) => row.actor,
              },
              {
                key: "action",
                header: t("logs.action"),
                render: (row) => row.action,
                sortValue: (row) => row.action,
              },
              {
                key: "target",
                header: t("logs.target"),
                render: (row) => row.target,
                sortValue: (row) => row.target,
              },
              {
                key: "status",
                header: t("logs.result"),
                render: (row) => (
                  <Tag color={getStatusColor(row.status)}>{getStatusLabel(row.status, t)}</Tag>
                ),
                sortValue: (row) => row.status,
              },
              {
                key: "createdAt",
                header: t("logs.createdAt"),
                render: (row) => formatDateTime(row.createdAt, locale),
                sortValue: (row) => row.createdAt,
              },
            ]}
            rows={filteredAuditRows}
            defaultSortKey="createdAt"
            isLoading={auditLoading}
            errorMessage={auditError ? t("table.error") : undefined}
            onRetry={auditError ? () => refetchAudit() : undefined}
            pageSize={5}
          />
        </div>
      )}
    </div>
  );
}
