import TokenDetailPage from "@/app/(app)/tokens/[id]/page";
import UserDetailPage from "@/app/(app)/users/[id]/page";
import { useConfirm } from "@/hooks/useConfirm";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const routerPush = jest.fn();
const routerReplace = jest.fn();
const confirmMock = jest.fn(async () => true);
const toastMock = jest.fn();

let roleValue: "admin" | "operator" | "viewer" = "admin";
let userTab = "";

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
  if (source.includes("getUser")) return "user";
  if (source.includes("getToken(")) return "token";
  if (source.includes("getTokens")) return "tokens";
  if (source.includes("getAuditLogs")) return "auditLogs";
  if (source.includes("getDevices")) return "devices";
  if (source.includes("getVerifyLogs")) return "verifyLogs";
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
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("antd", () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button {...props} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children, title, extra }: any) => (
    <section>
      {title ? <h3>{title}</h3> : null}
      {extra}
      {children}
    </section>
  ),
  Descriptions: ({ items = [] }: any) => (
    <div>
      {items.map((item: any) => (
        <div key={item.key}>{String(item.children ?? "")}</div>
      ))}
    </div>
  ),
  Tooltip: ({ children }: any) => <>{children}</>,
  Typography: {
    Text: ({ children }: any) => <span>{children}</span>,
    Paragraph: ({ children }: any) => <p>{children}</p>,
  },
}));

jest.mock("@/components/LoadingState", () => ({
  __esModule: true,
  default: () => <div>loading-state</div>,
}));

jest.mock("@/components/Breadcrumbs", () => ({
  __esModule: true,
  default: ({ items }: any) => <div>{(items ?? []).map((it: any) => it.label).join(" /")}</div>,
}));

jest.mock("@/components/ActivityTimeline", () => ({
  __esModule: true,
  default: ({ items }: any) => (
    <div data-testid="activity-timeline">{(items ?? []).map((it: any) => it.label).join("|")}</div>
  ),
}));

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ locale: "en", t: (key: string) => key }),
}));
jest.mock("@/hooks/useConfirm", () => ({ useConfirm: jest.fn() }));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/hooks/useRole", () => ({ useRole: jest.fn() }));
jest.mock("@/hooks/useMockQuery", () => ({ useMockQuery: jest.fn() }));

describe("detail pages interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryByKey = {};
    roleValue = "admin";
    userTab = "";
    (useRouter as jest.Mock).mockReturnValue({ push: routerPush, replace: routerReplace });
    (useParams as jest.Mock).mockReturnValue({ id: "u_1" });
    (useSearchParams as jest.Mock).mockImplementation(() => new URLSearchParams(userTab));
    (useConfirm as jest.Mock).mockReturnValue(confirmMock);
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (useRole as jest.Mock).mockImplementation(() => ({ role: roleValue }));
    (useMockQuery as jest.Mock).mockImplementation((fetcher: unknown) => {
      const key = resolveQueryKey(fetcher);
      return queryByKey[key] ?? defaultQueryResult;
    });
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("token detail handles loading, error, empty and reveal/copy/actions", async () => {
    const retry = jest.fn();
    queryByKey.token = { data: null, error: null, isLoading: true, refetch: retry };
    render(<TokenDetailPage />);
    expect(screen.getByText("loading-state")).toBeInTheDocument();

    queryByKey.token = { data: null, error: new Error("boom"), isLoading: false, refetch: retry };
    render(<TokenDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "table.retry" }));
    expect(retry).toHaveBeenCalled();

    queryByKey.token = { data: null, error: null, isLoading: false, refetch: retry };
    render(<TokenDetailPage />);
    expect(screen.getByText("table.empty")).toBeInTheDocument();

    (useParams as jest.Mock).mockReturnValue({ id: "tk_1" });
    queryByKey.token = {
      data: {
        id: "tk_1",
        appId: "broker",
        userId: "u_1",
        status: "Active",
        createdAt: "2024-01-01",
        lastUsed: "2024-01-02",
      },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    queryByKey.verifyLogs = {
      data: [
        { id: "v1", tokenId: "tk_1", result: "SUCCESS", appId: "broker", createdAt: "2024-01-03" },
      ],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };

    render(<TokenDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "tokens.actionLock" }));
    });
    expect(confirmMock).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", message: "tokens.actionToast" }),
    );

    confirmMock.mockResolvedValueOnce(false);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "tokens.actionReset" }));
    });

    fireEvent.click(screen.getByRole("button", { name: "tokens.reveal" }));
    expect(screen.getByText("SECRET-TK_1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "tokens.copySecret" }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("SECRET-TK_1"));
  });

  it("token detail handles locked state permission-disabled action", () => {
    roleValue = "viewer";
    (useParams as jest.Mock).mockReturnValue({ id: "tk_2" });
    queryByKey.token = {
      data: {
        id: "tk_2",
        appId: "broker",
        userId: "u_2",
        status: "Locked",
        createdAt: "2024-01-01",
        lastUsed: "2024-01-02",
      },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    queryByKey.verifyLogs = { data: [], error: null, isLoading: false, refetch: jest.fn() };

    render(<TokenDetailPage />);
    expect(screen.getByRole("button", { name: "tokens.actionUnlock" })).toBeDisabled();
  });

  it("user detail handles profile/tokens/devices/activity tabs and action callbacks", async () => {
    const refetch = jest.fn();
    queryByKey.user = {
      data: {
        id: "u_1",
        appId: "broker",
        group: "ops",
        email: "u1@test.com",
        status: "Active",
        createdAt: "2024-01-01",
        lastActivity: "2024-01-02",
      },
      error: null,
      isLoading: false,
      refetch,
    };
    queryByKey.tokens = {
      data: [
        {
          id: "tk_1",
          userId: "u_1",
          appId: "broker",
          status: "Active",
          createdAt: "2024-01-01",
          lastUsed: "2024-01-02",
        },
        {
          id: "tk_2",
          userId: "u_1",
          appId: "wallet",
          status: "Locked",
          createdAt: "2024-01-01",
          lastUsed: "2024-01-02",
        },
      ],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    queryByKey.devices = {
      data: [
        { id: "d_1", userId: "u_1", appId: "broker", platform: "iOS", status: "Active", lastSeen: "now" },
      ],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    queryByKey.verifyLogs = {
      data: [{ id: "v_1", userId: "u_1", appId: "broker", result: "SUCCESS", createdAt: "2024-01-03" }],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    queryByKey.auditLogs = {
      data: [{ id: "a_1", actor: "admin", action: "LOCK", target: "u_1", status: "SUCCESS", createdAt: "2024-01-04" }],
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };

    render(<UserDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: "users.editTitle" }));
    expect(routerPush).toHaveBeenCalledWith("/users/u_1/edit");

    fireEvent.click(screen.getByRole("button", { name: "users.tabTokens" }));
    expect(routerReplace).toHaveBeenCalledWith("/users/u_1?tab=tokens");

    userTab = "tab=tokens";
    render(<UserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "tokens.actionLock" })[0]);
    });
    expect(confirmMock).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "tokens.actionUnlock" })[0]);
      fireEvent.click(screen.getAllByRole("button", { name: "tokens.actionReset" })[0]);
    });

    userTab = "tab=devices";
    render(<UserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "devices.actionBlock" }));
      fireEvent.click(screen.getByRole("button", { name: "devices.actionUnbind" }));
    });

    userTab = "tab=activity";
    render(<UserDetailPage />);
    expect(screen.getByTestId("activity-timeline")).toBeInTheDocument();
  });

  it("user detail handles loading/error/empty branches", () => {
    const refetch = jest.fn();
    queryByKey.user = { data: null, error: null, isLoading: true, refetch };
    render(<UserDetailPage />);
    expect(screen.getByText("loading-state")).toBeInTheDocument();

    queryByKey.user = { data: null, error: new Error("err"), isLoading: false, refetch };
    render(<UserDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "table.retry" }));
    expect(refetch).toHaveBeenCalled();

    queryByKey.user = { data: null, error: null, isLoading: false, refetch };
    render(<UserDetailPage />);
    expect(screen.getByText("table.empty")).toBeInTheDocument();
  });
});
