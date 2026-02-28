import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import DevicesPage from "@/app/(app)/devices/page";
import LogsPage from "@/app/(app)/logs/page";
import PoliciesPage from "@/app/(app)/policies/page";
import TokensPage from "@/app/(app)/tokens/page";
import UsersPage from "@/app/(app)/users/page";
import VerificationsPage from "@/app/(app)/verifications/page";
import AuditAdvancedPage from "@/app/(app)/audit-advanced/page";
import AppsPage from "@/app/(app)/apps/page";
import RiskPage from "@/app/(app)/risk/page";
import TransactionsPage from "@/app/(app)/transactions/page";
import { useConfirm } from "@/hooks/useConfirm";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { downloadCsv } from "@/lib/csv";
import { useRouter } from "next/navigation";

const routerPush = jest.fn();
const confirmMock = jest.fn(async () => true);
const toastMock = jest.fn();
let roleValue: "admin" | "operator" | "viewer" = "admin";

type MockQueryResult = {
  data: any;
  error: any;
  isLoading: boolean;
  refetch: jest.Mock;
};

let queryByKey: Record<string, MockQueryResult> = {};

const defaultQueryResult: MockQueryResult = {
  data: [],
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const resolveQueryKey = (fetcher: unknown) => {
  const source = String(fetcher);
  if (source.includes("getUsers")) return "users";
  if (source.includes("getTokens")) return "tokens";
  if (source.includes("getDevices")) return "devices";
  if (source.includes("getPolicies")) return "policies";
  if (source.includes("getApps")) return "apps";
  if (source.includes("getVerifyLogs")) return "verifyLogs";
  if (source.includes("getAuditLogs")) return "auditLogs";
  if (source.includes("getTransactions")) return "transactions";
  return "default";
};

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("antd", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick}>
      {children}
    </button>
  ),
  Tag: ({ children }: any) => <span>{children}</span>,
  Tooltip: ({ children }: any) => <>{children}</>,
  Card: ({ children, title }: any) => (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  ),
  Input: ({ value, onChange, ...props }: any) => (
    <input
      {...props}
      value={value ?? ""}
      onChange={(e) => onChange?.({ target: { value: e.target.value } })}
    />
  ),
  Select: ({ value, onChange, options = [], ...props }: any) => (
    <select {...props} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {typeof opt.label === "string" ? opt.label : String(opt.value)}
        </option>
      ))}
    </select>
  ),
  Switch: ({ checked, onChange, ...props }: any) => (
    <input
      {...props}
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  ),
}));

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ locale: "en", t: (key: string) => key }),
}));
jest.mock("@/hooks/useConfirm", () => ({ useConfirm: jest.fn() }));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/hooks/useRole", () => ({ useRole: jest.fn() }));
jest.mock("@/hooks/useMockQuery", () => ({ useMockQuery: jest.fn() }));
jest.mock("@/lib/csv", () => ({ downloadCsv: jest.fn() }));

jest.mock("@/components/DataTable", () => ({
  __esModule: true,
  default: (props: any) => {
    const actionsColumn = props.columns?.find((col: any) => col.key === "actions");
    const firstRow = props.rows?.[0];
    return (
      <div data-testid="data-table-mock">
        {props.ctaLabel ? (
          <button data-testid="cta-btn" onClick={props.onCtaClick}>
            {props.ctaLabel}
          </button>
        ) : null}
        {props.onRetry ? (
          <button data-testid="retry-btn" onClick={props.onRetry}>
            retry
          </button>
        ) : null}
        {(props.bulkActions ?? []).map((action: any) => (
          <button
            key={action.key}
            data-testid={`bulk-${action.key}`}
            onClick={() => action.onClick(["id_1"])}
          >
            {action.label}
          </button>
        ))}
        {actionsColumn && firstRow ? (
          <div data-testid="row-actions">{actionsColumn.render(firstRow)}</div>
        ) : null}
        {firstRow
          ? (props.columns ?? []).map((col: any) => (
              <div key={col.key} data-testid={`col-${col.key}`}>
                {col.render(firstRow)}
              </div>
            ))
          : null}
        {props.onSearchChange ? (
          <button data-testid="search-change" onClick={() => props.onSearchChange("query_1")}>
            search
          </button>
        ) : null}
        {(props.filters ?? []).map((filter: any) => (
          <div key={`filter-wrap-${filter.key}`}>
            <button
              data-testid={`filter-${filter.key}`}
              onClick={() => props.onFilterChange?.(filter.key, "value_1")}
            >
              filter-{filter.key}
            </button>
            <button
              data-testid={`filter-empty-${filter.key}`}
              onClick={() => props.onFilterChange?.(filter.key, "")}
            >
              filter-empty-{filter.key}
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

describe("large pages interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    queryByKey = {};
    roleValue = "admin";
    (useRouter as jest.Mock).mockReturnValue({ push: routerPush });
    (useConfirm as jest.Mock).mockReturnValue(confirmMock);
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (useRole as jest.Mock).mockImplementation(() => ({ role: roleValue }));
    (useMockQuery as jest.Mock).mockImplementation((fetcher: unknown) => {
      const key = resolveQueryKey(fetcher);
      return queryByKey[key] ?? defaultQueryResult;
    });
  });

  it("users page handles cta, bulk action confirm and retry", async () => {
    jest.useFakeTimers();
    const refetch = jest.fn();
    queryByKey.users = {
      data: [
        {
          id: "u_1",
          appId: "broker",
          group: "ops",
          status: "Active",
          lastActivity: "now",
        },
      ],
      error: null,
      isLoading: false,
      refetch,
    };
    render(<UsersPage />);
    fireEvent.click(screen.getByTestId("cta-btn"));
    expect(routerPush).toHaveBeenCalledWith("/users/new");
    fireEvent.click(screen.getByTestId("filter-appId"));
    fireEvent.click(screen.getByTestId("filter-empty-appId"));
    fireEvent.click(screen.getByTestId("filter-group"));
    fireEvent.click(screen.getByTestId("filter-empty-group"));
    fireEvent.click(screen.getByTestId("filter-status"));
    fireEvent.click(screen.getByTestId("filter-empty-status"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("bulk-lock"));
    });
    expect(confirmMock).toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "success", message: "ui.toastBulk" }),
      ),
    );
    jest.useRealTimers();

    queryByKey.users = { data: [], error: new Error("fail"), isLoading: false, refetch };
    render(<UsersPage />);
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetch).toHaveBeenCalled();
  });

  it("tokens page triggers cta, bulk and row actions", async () => {
    jest.useFakeTimers();
    queryByKey.tokens = {
      data: [
        {
          id: "tk_1",
          appId: "broker",
          userId: "u_1",
          status: "Locked",
          lastUsed: "recent",
        },
      ],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    render(<TokensPage />);
    fireEvent.click(screen.getByTestId("cta-btn"));
    expect(routerPush).toHaveBeenCalledWith("/tokens/provision");
    fireEvent.click(screen.getByTestId("filter-tokenId"));
    fireEvent.click(screen.getByTestId("filter-empty-tokenId"));
    fireEvent.click(screen.getByTestId("filter-appId"));
    fireEvent.click(screen.getByTestId("filter-empty-appId"));
    fireEvent.click(screen.getByTestId("filter-status"));
    fireEvent.click(screen.getByTestId("filter-empty-status"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("bulk-export"));
    });
    expect(confirmMock).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getAllByText("tokens.actionUnlock")[0]);
      fireEvent.click(screen.getAllByText("tokens.actionReset")[0]);
      fireEvent.click(screen.getAllByText("tokens.actionExport")[0]);
    });
    expect(confirmMock).toHaveBeenCalledTimes(4);
    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    act(() => {
      jest.advanceTimersByTime(500);
    });
    jest.useRealTimers();
  });

  it("devices page triggers row actions and retry", async () => {
    const refetch = jest.fn();
    queryByKey.devices = {
      data: [
        {
          id: "dev_1",
          userId: "u_1",
          appId: "broker",
          platform: "iOS",
          status: "Active",
          lastSeen: "now",
        },
      ],
      error: null,
      isLoading: false,
      refetch,
    };
    render(<DevicesPage />);
    fireEvent.click(screen.getByTestId("filter-userId"));
    fireEvent.click(screen.getByTestId("filter-empty-userId"));
    fireEvent.click(screen.getByTestId("filter-appId"));
    fireEvent.click(screen.getByTestId("filter-empty-appId"));
    fireEvent.click(screen.getByTestId("filter-status"));
    fireEvent.click(screen.getByTestId("filter-empty-status"));
    await act(async () => {
      fireEvent.click(screen.getAllByText("devices.actionBlock")[0]);
      fireEvent.click(screen.getAllByText("devices.actionUnbind")[0]);
    });
    expect(confirmMock).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "success", message: "devices.actionToast" }),
      ),
    );

    queryByKey.devices = { data: [], error: new Error("fail"), isLoading: false, refetch };
    render(<DevicesPage />);
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetch).toHaveBeenCalled();
  });

  it("policies page triggers cta and retry", () => {
    const refetch = jest.fn();
    queryByKey.policies = {
      data: [
        {
          id: "pol_1",
          name: "Standard",
          type: "TOTP",
          digits: 6,
          stepSeconds: 30,
          algorithm: "SHA1",
          status: "Active",
        },
      ],
      error: null,
      isLoading: false,
      refetch,
    };
    render(<PoliciesPage />);
    fireEvent.click(screen.getByTestId("cta-btn"));
    expect(routerPush).toHaveBeenCalledWith("/policies/new");
    fireEvent.click(screen.getByTestId("filter-name"));
    fireEvent.click(screen.getByTestId("filter-empty-name"));
    fireEvent.click(screen.getByTestId("filter-type"));
    fireEvent.click(screen.getByTestId("filter-empty-type"));
    fireEvent.click(screen.getByTestId("filter-status"));
    fireEvent.click(screen.getByTestId("filter-empty-status"));

    queryByKey.policies = { data: [], error: new Error("fail"), isLoading: false, refetch };
    render(<PoliciesPage />);
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetch).toHaveBeenCalled();
  });

  it("apps page handles cta, filters, bulk actions and retry", async () => {
    jest.useFakeTimers();
    const refetch = jest.fn();
    queryByKey.apps = {
      data: [
        { id: "broker", policy: "Standard", status: "Active", tokens: 3 },
        { id: "wallet", policy: "Strict", status: "Locked", tokens: 4 },
      ],
      error: null,
      isLoading: false,
      refetch,
    };

    render(<AppsPage />);
    fireEvent.click(screen.getByTestId("cta-btn"));
    expect(routerPush).toHaveBeenCalledWith("/apps/new");

    fireEvent.click(screen.getByTestId("search-change"));
    fireEvent.click(screen.getByTestId("filter-appId"));
    fireEvent.click(screen.getByTestId("filter-empty-appId"));
    fireEvent.click(screen.getByTestId("filter-policy"));
    fireEvent.click(screen.getByTestId("filter-empty-policy"));
    fireEvent.click(screen.getByTestId("filter-status"));
    fireEvent.click(screen.getByTestId("filter-empty-status"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("bulk-pause"));
    });
    expect(confirmMock).toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => expect(toastMock).toHaveBeenCalled());

    confirmMock.mockResolvedValueOnce(false);
    await act(async () => {
      fireEvent.click(screen.getByTestId("bulk-activate"));
    });

    queryByKey.apps = { data: [], error: new Error("fail"), isLoading: false, refetch };
    render(<AppsPage />);
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetch).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("logs page handles export for verify/admin tabs", () => {
    const refetchVerify = jest.fn();
    const refetchAudit = jest.fn();
    queryByKey.verifyLogs = {
      data: [
        {
          userId: "u_1",
          appId: "broker",
          tokenId: "tk_1",
          result: "SUCCESS",
          createdAt: "2024-01-01",
        },
      ],
      error: null,
      isLoading: false,
      refetch: refetchVerify,
    };
    queryByKey.auditLogs = {
      data: [
        {
          actor: "admin",
          action: "LOCK",
          target: "u_1",
          status: "SUCCESS",
          createdAt: "2024-01-01",
        },
      ],
      error: null,
      isLoading: false,
      refetch: refetchAudit,
    };
    render(<LogsPage />);
    fireEvent.click(screen.getByTestId("search-change"));
    fireEvent.click(screen.getByTestId("filter-userId"));
    fireEvent.click(screen.getByTestId("filter-empty-userId"));
    fireEvent.click(screen.getByTestId("filter-appId"));
    fireEvent.click(screen.getByTestId("filter-empty-appId"));
    fireEvent.click(screen.getByTestId("filter-result"));
    fireEvent.click(screen.getByTestId("filter-empty-result"));
    fireEvent.click(screen.getByText("logs.export"));
    expect(downloadCsv).toHaveBeenCalledWith("logs.verifyCsvFile", expect.any(Array));

    fireEvent.click(screen.getByText("logs.adminTab"));
    fireEvent.click(screen.getByTestId("search-change"));
    fireEvent.click(screen.getByTestId("filter-actor"));
    fireEvent.click(screen.getByTestId("filter-empty-actor"));
    fireEvent.click(screen.getByTestId("filter-action"));
    fireEvent.click(screen.getByTestId("filter-empty-action"));
    fireEvent.click(screen.getByText("logs.export"));
    expect(downloadCsv).toHaveBeenCalledWith("logs.adminCsvFile", expect.any(Array));
  });

  it("logs page renders row columns on verify and admin tabs", () => {
    queryByKey.verifyLogs = {
      data: [
        {
          userId: "u_2",
          appId: "wallet",
          tokenId: "tk_2",
          result: "FAIL",
          createdAt: "2024-02-01",
        },
      ],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    queryByKey.auditLogs = {
      data: [
        {
          actor: "ops",
          action: "RESET",
          target: "u_2",
          status: "SUCCESS",
          createdAt: "2024-02-01",
        },
      ],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };

    render(<LogsPage />);
    expect(screen.getByTestId("col-createdAt")).toBeInTheDocument();
    fireEvent.click(screen.getByText("logs.adminTab"));
    expect(screen.getByTestId("col-target")).toBeInTheDocument();
  });

  it("logs page verify retry branch calls refetch", () => {
    const refetchVerify = jest.fn();
    const refetchAudit = jest.fn();
    queryByKey.verifyLogs = {
      data: [],
      error: new Error("verify fail"),
      isLoading: false,
      refetch: refetchVerify,
    };
    queryByKey.auditLogs = { data: [], error: null, isLoading: false, refetch: refetchAudit };
    render(<LogsPage />);
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetchVerify).toHaveBeenCalled();
  });

  it("logs page admin retry branch calls refetch", () => {
    const refetchVerify = jest.fn();
    const refetchAudit = jest.fn();
    queryByKey.verifyLogs = { data: [], error: null, isLoading: false, refetch: refetchVerify };
    queryByKey.auditLogs = {
      data: [],
      error: new Error("audit fail"),
      isLoading: false,
      refetch: refetchAudit,
    };
    render(<LogsPage />);
    fireEvent.click(screen.getByText("logs.adminTab"));
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetchAudit).toHaveBeenCalled();
  });

  it("risk page handles search and filter callbacks", () => {
    render(<RiskPage />);
    fireEvent.click(screen.getByTestId("search-change"));
    fireEvent.click(screen.getByTestId("filter-userId"));
    fireEvent.click(screen.getByTestId("filter-empty-userId"));
    fireEvent.click(screen.getByTestId("filter-type"));
    fireEvent.click(screen.getByTestId("filter-empty-type"));
    fireEvent.click(screen.getByTestId("filter-action"));
    fireEvent.click(screen.getByTestId("filter-empty-action"));
    expect(screen.getByTestId("data-table-mock")).toBeInTheDocument();
  });

  it("transactions page handles filters and retry", () => {
    const refetch = jest.fn();
    queryByKey.transactions = {
      data: [
        {
          id: "txn_1",
          userId: "u_1",
          deviceId: "dev_1",
          status: "SUCCESS",
          createdAt: "2024-01-01",
          expiredAt: "2024-01-02",
        },
      ],
      error: null,
      isLoading: false,
      refetch,
    };
    render(<TransactionsPage />);
    fireEvent.click(screen.getByTestId("search-change"));
    fireEvent.click(screen.getByTestId("filter-transactionId"));
    fireEvent.click(screen.getByTestId("filter-empty-transactionId"));
    fireEvent.click(screen.getByTestId("filter-userId"));
    fireEvent.click(screen.getByTestId("filter-empty-userId"));
    fireEvent.click(screen.getByTestId("filter-deviceId"));
    fireEvent.click(screen.getByTestId("filter-empty-deviceId"));
    fireEvent.click(screen.getByTestId("filter-status"));
    fireEvent.click(screen.getByTestId("filter-empty-status"));
    expect(screen.getByTestId("data-table-mock")).toBeInTheDocument();

    queryByKey.transactions = { data: [], error: new Error("fail"), isLoading: false, refetch };
    render(<TransactionsPage />);
    fireEvent.click(screen.getByTestId("retry-btn"));
    expect(refetch).toHaveBeenCalled();
  });

  it("verifications page triggers resend action and supports confirm reject", async () => {
    roleValue = "admin";
    render(<VerificationsPage />);
    await act(async () => {
      fireEvent.click(screen.getAllByText("verifications.resend")[0]);
    });
    expect(confirmMock).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", message: "verifications.toastResend" }),
    );

    confirmMock.mockResolvedValueOnce(false);
    cleanup();
    render(<VerificationsPage />);
    await act(async () => {
      fireEvent.click(screen.getAllByText("verifications.resend")[0]);
    });
    expect(toastMock).toHaveBeenCalledTimes(1);
  });

  it("audit advanced page handles save with confirm accept/reject", async () => {
    render(<AuditAdvancedPage />);
    await act(async () => {
      fireEvent.click(screen.getByText("auditAdvanced.generate"));
    });
    expect(confirmMock).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", message: "auditAdvanced.toastSaved" }),
    );

    confirmMock.mockResolvedValueOnce(false);
    cleanup();
    render(<AuditAdvancedPage />);
    await act(async () => {
      fireEvent.click(screen.getAllByText("auditAdvanced.save")[0]);
    });
    expect(toastMock).toHaveBeenCalledTimes(1);
  });
});
