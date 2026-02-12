"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Input, Select, Table, Tooltip } from "antd";
import type { ColumnsType, SorterResult, SortOrder } from "antd/es/table/interface";
import { useEffect, useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
};

export type TableFilter = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "select";
  options?: { label: string; value: string }[];
};

export type BulkAction = {
  key: string;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  onClick: (selectedIds: string[]) => void;
  disabled?: boolean;
  disabledReason?: string;
};

type DataTableProps<T> = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  filters?: TableFilter[];
  columns: Column<T>[];
  rows: T[];
  emptyState?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  defaultSortKey?: string;
  pageSize?: number;
  enablePagination?: boolean;
  enableSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  enableSelection?: boolean;
  getRowId?: (row: T) => string;
  bulkActions?: BulkAction[];
};

export default function DataTable<T>({
  title,
  description,
  ctaLabel,
  onCtaClick,
  filters = [],
  columns,
  rows,
  emptyState,
  isLoading = false,
  errorMessage,
  onRetry,
  defaultSortKey,
  pageSize = 10,
  enablePagination = true,
  enableSearch = false,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filterValues,
  onFilterChange,
  enableSelection = false,
  getRowId,
  bulkActions = [],
}: DataTableProps<T>) {
  const { t } = useI18n();
  const resolvedEmptyState = emptyState ?? t("table.empty");
  // local page size state so changing showSizeChanger updates the table
  const [localPageSize, setLocalPageSize] = useState<number>(pageSize);
  // current page for controlled pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // keep local pageSize in sync if parent prop changes
  useEffect(() => {
    setLocalPageSize(pageSize);
  }, [pageSize]);

  // reset current page when rows or filters change (so config/data changes take effect)
  const serializedFilterValues = filterValues ? JSON.stringify(filterValues) : "";
  useEffect(() => {
    setCurrentPage(1);
  }, [rows, serializedFilterValues, searchValue]);

  const [sortState, setSortState] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(defaultSortKey ? { key: defaultSortKey, direction: "asc" } : null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleClearFilters = () => {
    onSearchChange?.("");
    filters.forEach((filter) => onFilterChange?.(filter.key, ""));
  };

  const sortedRows = useMemo(() => {
    if (!sortState) return rows;
    const column = columns.find((col) => col.key === sortState.key);
    if (!column?.sortValue) return rows;
    const direction = sortState.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const aValue = column.sortValue ? column.sortValue(a) : "";
      const bValue = column.sortValue ? column.sortValue(b) : "";
      if (aValue === bValue) return 0;
      if (aValue > bValue) return direction;
      return -direction;
    });
  }, [columns, rows, sortState]);

  const canSelect = Boolean(enableSelection && getRowId);
  const resolveRowKey = (record: T) => {
    if (getRowId) return getRowId(record);
    const recordAny = record as Record<string, unknown>;
    const candidate =
      recordAny.id ??
      recordAny.key ??
      recordAny.userId ??
      recordAny.tokenId ??
      recordAny.appId ??
      recordAny.deviceId;
    if (candidate !== undefined && candidate !== null) {
      return String(candidate);
    }
    try {
      return JSON.stringify(record);
    } catch {
      return Object.prototype.toString.call(record);
    }
  };
  const handleSortChange = (sorter: SorterResult<T> | SorterResult<T>[]) => {
    if (Array.isArray(sorter)) {
      const first = sorter[0];
      if (!first?.order || !first.columnKey) {
        setSortState(null);
        return;
      }
      setSortState({
        key: String(first.columnKey),
        direction: first.order === "ascend" ? "asc" : "desc",
      });
      return;
    }
    if (!sorter?.order || !sorter.columnKey) {
      setSortState(null);
      return;
    }
    setSortState({
      key: String(sorter.columnKey),
      direction: sorter.order === "ascend" ? "asc" : "desc",
    });
  };

  const tableColumns: ColumnsType<T> = columns.map((column) => {
    const sortable = Boolean(column.sortValue);
    const sortOrder: SortOrder | undefined =
      sortState?.key === column.key
        ? sortState.direction === "asc"
          ? "ascend"
          : "descend"
        : undefined;
    return {
      key: column.key,
      dataIndex: column.key,
      title: column.header,
      sorter: sortable
        ? (a: T, b: T) => {
            const aValue = column.sortValue ? column.sortValue(a) : "";
            const bValue = column.sortValue ? column.sortValue(b) : "";
            if (aValue === bValue) return 0;
            return aValue > bValue ? 1 : -1;
          }
        : undefined,
      sortOrder,
      render: (_value: unknown, record: T) => column.render(record),
      className: column.className,
    };
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {enableSearch ? (
            <Input
              value={searchValue === undefined ? undefined : searchValue}
              placeholder={searchPlaceholder ?? t("table.search")}
              onChange={(event) => onSearchChange?.(event.target.value)}
              size="middle"
              className="w-56"
            />
          ) : null}
          {ctaLabel ? (
            <Button type="primary" onClick={onCtaClick}>
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {(filters.length > 0 || enableSearch) && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="text-xs font-semibold text-slate-600" htmlFor={filter.key}>
                {filter.label}
              </label>
              {filter.type === "select" ? (
                <Select
                  id={filter.key}
                  value={
                    filterValues && filterValues[filter.key] ? filterValues[filter.key] : undefined
                  }
                  placeholder={filter.placeholder ?? t("table.all")}
                  allowClear
                  options={filter.options}
                  onChange={(value) => onFilterChange?.(filter.key, value ?? "")}
                  size="middle"
                  className="mt-2 w-full"
                />
              ) : (
                <Input
                  id={filter.key}
                  placeholder={filter.placeholder}
                  value={filterValues ? (filterValues[filter.key] ?? "") : undefined}
                  onChange={(event) => onFilterChange?.(filter.key, event.target.value)}
                  size="middle"
                  className="mt-2 w-full"
                />
              )}
            </div>
          ))}
          <div className="flex items-end justify-start">
            <Button type="default" danger onClick={handleClearFilters}>
              {t("table.clearFilters")}
            </Button>
          </div>
        </div>
      )}

      {canSelect && selectedIds.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {selectedIds.length} {t("table.selected")}
            </span>
            <Button type="link" onClick={() => setSelectedIds([])}>
              {t("table.clearSelection")}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions.map((action) => {
              const button = (
                <Button
                  key={action.key}
                  type={action.variant === "danger" ? "primary" : "default"}
                  danger={action.variant === "danger"}
                  disabled={action.disabled}
                  onClick={() => action.onClick(selectedIds)}
                >
                  {action.label}
                </Button>
              );
              return action.disabled && action.disabledReason ? (
                <Tooltip key={action.key} title={action.disabledReason}>
                  <span>{button}</span>
                </Tooltip>
              ) : (
                button
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <Table
          size="middle"
          rowKey={(record) => resolveRowKey(record)}
          columns={tableColumns}
          dataSource={sortedRows}
          pagination={
            enablePagination
              ? {
                  current: currentPage,
                  pageSize: localPageSize,
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50, 100],
                  showTotal: (total, range) => {
                    const current = Math.max(1, Math.ceil(range[1] / localPageSize));
                    const totalPages = Math.max(1, Math.ceil(total / localPageSize));
                    return `${t("table.page")} ${current} ${t("table.of")} ${totalPages}`;
                  },
                  onChange: (page: number, newPageSize?: number) => {
                    setCurrentPage(page);
                    if (typeof newPageSize === "number") setLocalPageSize(newPageSize);
                  },
                }
              : false
          }
          loading={isLoading}
          scroll={{ x: "max-content" }}
          onChange={(pagination, _filters, sorter) => {
            if (pagination && typeof (pagination as { current?: unknown }).current === "number") {
              setCurrentPage((pagination as { current?: number }).current ?? 1);
            }
            if (pagination && typeof (pagination as { pageSize?: unknown }).pageSize === "number") {
              setLocalPageSize((pagination as { pageSize?: number }).pageSize ?? localPageSize);
            }
            handleSortChange(sorter as SorterResult<T> | SorterResult<T>[]);
          }}
          locale={{
            emptyText: errorMessage ? (
              <div className="flex flex-col gap-2 text-sm text-rose-600">
                <span>{errorMessage}</span>
                {onRetry ? (
                  <Button type="default" danger onClick={onRetry}>
                    {t("table.retry")}
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-slate-500">{resolvedEmptyState}</div>
            ),
          }}
          rowSelection={
            canSelect
              ? {
                  selectedRowKeys: selectedIds,
                  onChange: (keys) => setSelectedIds(keys as string[]),
                }
              : undefined
          }
        />
      </div>
    </section>
  );
}
