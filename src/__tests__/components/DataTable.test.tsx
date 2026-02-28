import DataTable from "@/components/DataTable";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    setLanguage: jest.fn(),
  }),
}));

jest.mock("antd", () => {
  const Button = ({ children, onClick, disabled, ...props }: any) => (
    <button {...props} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
  const Input = ({ value, onChange, placeholder, id, ...props }: any) => (
    <input
      {...props}
      id={id}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange?.({ target: { value: e.target.value } })}
    />
  );
  const Select = ({ value, onChange, options = [], id, ...props }: any) => (
    <select id={id} {...props} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">all</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {typeof opt.label === "string" ? opt.label : String(opt.value)}
        </option>
      ))}
    </select>
  );
  const Tooltip = ({ children }: any) => <>{children}</>;
  const Table = ({
    dataSource = [],
    columns = [],
    locale,
    onChange,
    pagination,
    rowSelection,
    rowKey,
  }: any) => (
    <div>
      {rowSelection && dataSource.length > 0 ? (
        <button
          data-testid="select-first"
          onClick={() => rowSelection.onChange?.([rowKey(dataSource[0])])}
        >
          select
        </button>
      ) : null}
      {pagination && typeof pagination === "object" ? (
        <button data-testid="paginate" onClick={() => pagination.onChange?.(2, 20)}>
          paginate
        </button>
      ) : null}
      <button
        data-testid="table-change-sort-array"
        onClick={() =>
          onChange?.({ current: 3, pageSize: 50 }, {}, [{ columnKey: "value", order: "descend" }])
        }
      >
        sort-array
      </button>
      <button
        data-testid="table-change-sort-object"
        onClick={() =>
          onChange?.({ current: 1, pageSize: 10 }, {}, { columnKey: "value", order: "ascend" })
        }
      >
        sort-object
      </button>
      <button
        data-testid="table-change-clear-sort"
        onClick={() => onChange?.({ current: 1, pageSize: 10 }, {}, { columnKey: "value" })}
      >
        sort-clear
      </button>
      {dataSource.length === 0 ? (
        <div data-testid="empty-area">{locale?.emptyText}</div>
      ) : (
        dataSource.map((row: any, idx: number) => (
          <div data-testid={`row-${idx}`} key={String(rowKey?.(row) ?? idx)}>
            {columns.map((col: any) => (
              <span key={col.key}>{col.render?.(undefined, row)}</span>
            ))}
          </div>
        ))
      )}
    </div>
  );
  return { Button, Input, Select, Tooltip, Table };
});

type Row = { id?: string; key?: string; name: string; value: number; status?: string };

const columns = [
  { key: "name", header: "Name", render: (r: Row) => r.name, sortValue: (r: Row) => r.name },
  {
    key: "value",
    header: "Value",
    render: (r: Row) => r.value.toString(),
    sortValue: (r: Row) => r.value,
  },
];

const rows: Row[] = [
  { id: "1", name: "Alice", value: 10, status: "active" },
  { id: "2", name: "Bob", value: 20, status: "locked" },
  { id: "3", name: "Carl", value: 30, status: "active" },
];

describe("DataTable", () => {
  test("renders search, filters, cta and clear filter callbacks", () => {
    const onCtaClick = jest.fn();
    const onSearchChange = jest.fn();
    const onFilterChange = jest.fn();

    render(
      <DataTable<Row>
        title="Test"
        description="Desc"
        ctaLabel="Create"
        onCtaClick={onCtaClick}
        columns={columns as any}
        rows={rows}
        enablePagination={false}
        enableSearch
        searchValue=""
        onSearchChange={onSearchChange}
        filters={[
          { key: "name", label: "Name", placeholder: "search name" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [{ label: "Active", value: "active" }],
          },
        ]}
        filterValues={{ name: "", status: "" }}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onCtaClick).toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("table.search"), { target: { value: "ali" } });
    expect(onSearchChange).toHaveBeenCalledWith("ali");

    fireEvent.change(screen.getByPlaceholderText("search name"), { target: { value: "bob" } });
    expect(onFilterChange).toHaveBeenCalledWith("name", "bob");

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "active" } });
    expect(onFilterChange).toHaveBeenCalledWith("status", "active");

    fireEvent.click(screen.getByRole("button", { name: "table.clearFilters" }));
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith("name", "");
    expect(onFilterChange).toHaveBeenCalledWith("status", "");
  });

  test("supports sort change, pagination callbacks and selection bulk actions", () => {
    const onBulk = jest.fn();
    render(
      <DataTable<Row>
        title="Bulk"
        columns={columns as any}
        rows={rows}
        defaultSortKey="name"
        enableSelection
        getRowId={(row) => row.id ?? ""}
        bulkActions={[
          {
            key: "lock",
            label: "Lock",
            onClick: onBulk,
          },
          {
            key: "danger",
            label: "Danger",
            variant: "danger",
            onClick: jest.fn(),
            disabled: true,
            disabledReason: "no permission",
          },
        ]}
      />,
    );

    // default sort by name asc
    expect(screen.getByTestId("row-0")).toHaveTextContent("Alice");

    fireEvent.click(screen.getByTestId("table-change-sort-array"));
    expect(screen.getByTestId("row-0")).toHaveTextContent("Carl");

    fireEvent.click(screen.getByTestId("table-change-sort-object"));
    expect(screen.getByTestId("row-0")).toHaveTextContent("Alice");

    fireEvent.click(screen.getByTestId("table-change-clear-sort"));
    fireEvent.click(screen.getByTestId("paginate"));

    fireEvent.click(screen.getByTestId("select-first"));
    expect(screen.getByText("1 table.selected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lock" }));
    expect(onBulk).toHaveBeenCalledWith(["1"]);

    fireEvent.click(screen.getByRole("button", { name: "table.clearSelection" }));
    expect(screen.queryByText("1 table.selected")).not.toBeInTheDocument();
  });

  test("uses retry empty state and fallback row keys", () => {
    const onRetry = jest.fn();
    render(
      <>
        <DataTable<Row>
          title="Error"
          columns={columns as any}
          rows={[]}
          errorMessage="boom"
          onRetry={onRetry}
          enablePagination={false}
        />
        <DataTable<Row>
          title="Fallback key"
          columns={columns as any}
          rows={[{ key: "k1", name: "KeyRow", value: 9 }]}
          enablePagination={false}
        />
      </>,
    );

    expect(screen.getByText("boom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "table.retry" }));
    expect(onRetry).toHaveBeenCalled();
    expect(screen.getByText("KeyRow")).toBeInTheDocument();
  });
});
