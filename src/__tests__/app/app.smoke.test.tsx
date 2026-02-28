import { fireEvent, render, screen } from "@testing-library/react";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

let mockPathname = "/";
let mockParams: Record<string, string> = { id: "u_10234" };
let mockQuery = "";
let queryMode: "data" | "loading" | "error" = "data";
let profileMode: "data" | "loading" | "error" = "data";
let healthMode: "data" | "loading" | "error" = "data";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useParams: () => mockParams,
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

jest.mock("@ant-design/icons", () => new Proxy({}, { get: () => () => <span>icon</span> }));

jest.mock("antd", () => {
  const Button = ({ children, onClick, htmlType, ...props }: any) => (
    <button
      {...props}
      onClick={(e) => {
        if (htmlType !== "submit") {
          onClick?.(e);
        }
      }}
    >
      {children}
    </button>
  );
  const Input = ({ value, onChange, ...props }: any) => (
    <input
      {...props}
      value={value ?? ""}
      onChange={(e) => onChange?.({ target: { value: e.target.value } })}
    />
  );
  const Select = ({ value, onChange, options = [], ...props }: any) => (
    <select
      {...props}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      data-testid="antd-select"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {typeof opt.label === "string" ? opt.label : String(opt.value)}
        </option>
      ))}
    </select>
  );
  const Checkbox = ({ children }: any) => <label>{children}</label>;
  const Switch = ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onChange?.(e.target.checked)}
      data-testid="antd-switch"
    />
  );
  const Tooltip = ({ children }: any) => <>{children}</>;
  const Card = ({ children, title, extra }: any) => (
    <section>
      {title}
      {extra}
      {children}
    </section>
  );
  const Descriptions = ({ items = [] }: any) => (
    <div>
      {items.map((item: any) => (
        <div key={item.key}>{String(item.children ?? "")}</div>
      ))}
    </div>
  );
  const Timeline = ({ items = [] }: any) => (
    <div>
      {items.map((item: any, idx: number) => (
        <div key={idx}>{item.content}</div>
      ))}
    </div>
  );
  const Breadcrumb = ({ items = [] }: any) => (
    <nav>
      {items.map((item: any, idx: number) => (
        <span key={idx}>{item.title}</span>
      ))}
    </nav>
  );
  const Table = ({ dataSource = [] }: any) => (
    <div data-testid="antd-table">{dataSource.length}</div>
  );
  const Drawer = ({ children, open }: any) => (open ? <aside>{children}</aside> : null);
  const Menu = ({ items = [], onClick }: any) => (
    <div>
      {items.map((item: any) => (
        <button key={item.key} onClick={() => onClick?.({ key: item.key })}>
          {item.label}
        </button>
      ))}
    </div>
  );
  const Skeleton = () => <div>loading</div>;
  const Spin = () => <div>spin</div>;
  const Layout = { Sider: ({ children }: any) => <aside>{children}</aside> };
  const Typography = {
    Text: ({ children }: any) => <span>{children}</span>,
  };
  const ConfigProvider = ({ children }: any) => <>{children}</>;
  const FormComponent: any = ({ children, onFinish }: any) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFinish?.({
          username: "admin",
          password: "password",
          id: "id_1",
          name: "name_1",
          appId: "broker",
          policy: "Standard",
          group: "ops",
          email: "a@test.com",
          status: "Active",
          userId: "u_10234",
        });
      }}
    >
      {children}
    </form>
  );

  const FormItem = ({ children, label }: any) => (
    <div>
      {label}
      {children}
    </div>
  );
  FormComponent.displayName = "MockForm";
  FormItem.displayName = "MockFormItem";
  FormComponent.Item = FormItem;
  FormComponent.useForm = () => [{}];

  return {
    Button,
    Input,
    Select,
    Checkbox,
    Switch,
    Tooltip,
    Card,
    Descriptions,
    Timeline,
    Breadcrumb,
    Table,
    Drawer,
    Menu,
    Skeleton,
    Spin,
    Layout,
    Typography,
    ConfigProvider,
    Form: FormComponent,
    theme: { darkAlgorithm: {}, defaultAlgorithm: {} },
  };
});

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    QueryClientProvider: ({ children }: any) => <>{children}</>,
  };
});

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ locale: "en", setLocale: jest.fn(), t: (key: string) => key }),
}));
jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn(), toggleTheme: jest.fn() }),
}));
jest.mock("@/hooks/useRole", () => ({
  useRole: () => ({ role: "admin", setRole: jest.fn() }),
}));
jest.mock("@/hooks/useConfirm", () => ({
  useConfirm: () => jest.fn(async () => true),
}));
jest.mock("@/hooks/useToast", () => ({
  useToast: () => jest.fn(),
}));
jest.mock("@/hooks/useHealth", () => ({
  useHealth: () =>
    healthMode === "loading"
      ? {
          data: null,
          isLoading: true,
          error: null,
          isSyncing: false,
          triggerSync: jest.fn(async () => true),
        }
      : healthMode === "error"
        ? {
            data: null,
            isLoading: false,
            error: new Error("health error"),
            isSyncing: false,
            triggerSync: jest.fn(async () => true),
          }
        : {
            data: { status: "ok" },
            isLoading: false,
            error: null,
            isSyncing: false,
            triggerSync: jest.fn(async () => true),
          },
}));
jest.mock("@/hooks/useProfile", () => ({
  useProfile: () =>
    profileMode === "loading"
      ? { data: null, isLoading: true, error: null, refetch: jest.fn() }
      : profileMode === "error"
        ? { data: null, isLoading: false, error: new Error("profile error"), refetch: jest.fn() }
        : {
            data: { id: "admin-1", username: "admin" },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
          },
}));
jest.mock("@/hooks/useAuth", () => ({
  useLogin: () => ({ login: jest.fn(async () => ({})), isPending: false, error: null }),
}));

const mockData = {
  users: [
    {
      id: "u_10234",
      email: "u@example.com",
      group: "ops",
      status: "Active",
      createdAt: "2024-01-01",
      appId: "broker",
      lastActivity: "now",
    },
  ],
  apps: [
    {
      id: "broker",
      name: "Broker",
      policy: "Standard",
      status: "Active",
      tokens: 3,
      createdAt: "2024-01-01",
    },
  ],
  tokens: [
    {
      id: "tk_0901",
      userId: "u_10234",
      appId: "broker",
      status: "Active",
      createdAt: "2024-01-01",
      policy: "Standard",
    },
  ],
  policies: [
    {
      id: "pol_totp_6",
      name: "Standard",
      type: "TOTP",
      digits: 6,
      stepSeconds: 30,
      window: 1,
      algorithm: "SHA1",
      status: "Active",
      createdAt: "2024-01-01",
    },
  ],
  logs: [{ id: "log_1001", target: "u_10234", status: "SUCCESS", createdAt: "2024-01-01" }],
  devices: [{ id: "dev_a01", userId: "u_10234", status: "Active" }],
  verifyLogs: [
    { id: "verify_2001", userId: "u_10234", status: "SUCCESS", createdAt: "2024-01-01" },
  ],
  transactions: [
    {
      id: "txn_12001",
      userId: "u_10234",
      deviceId: "dev_a01",
      status: "SUCCESS",
      createdAt: "2024-01-01",
      expiredAt: "2024-01-01",
    },
  ],
};

jest.mock("@/hooks/useMockQuery", () => ({
  useMockQuery: (fetcher: any) => {
    if (queryMode === "loading") {
      return { data: null, isLoading: true, error: null, refetch: jest.fn() };
    }
    if (queryMode === "error") {
      return { data: null, isLoading: false, error: "query error", refetch: jest.fn() };
    }
    const str = String(fetcher);
    if (str.includes("getUser("))
      return { data: mockData.users[0], isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getUsers("))
      return { data: mockData.users, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getApp("))
      return { data: mockData.apps[0], isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getApps("))
      return { data: mockData.apps, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getToken("))
      return { data: mockData.tokens[0], isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getTokens("))
      return { data: mockData.tokens, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getPolicy("))
      return { data: mockData.policies[0], isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getPolicies("))
      return { data: mockData.policies, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getAuditLogs("))
      return { data: mockData.logs, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getDevices("))
      return { data: mockData.devices, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getDevice("))
      return { data: mockData.devices[0], isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getVerifyLogs("))
      return { data: mockData.verifyLogs, isLoading: false, error: null, refetch: jest.fn() };
    if (str.includes("getTransactions("))
      return { data: mockData.transactions, isLoading: false, error: null, refetch: jest.fn() };
    return { data: [], isLoading: false, error: null, refetch: jest.fn() };
  },
}));

describe("app smoke render", () => {
  const modules = [
    "@/app/layout",
    "@/app/(auth)/layout",
    "@/app/(auth)/login/page",
    "@/app/(app)/layout",
    "@/app/(app)/page",
    "@/app/(app)/admin/profile/page",
    "@/app/(app)/apps/page",
    "@/app/(app)/apps/new/page",
    "@/app/(app)/apps/[id]/page",
    "@/app/(app)/apps/[id]/edit/page",
    "@/app/(app)/audit-advanced/page",
    "@/app/(app)/devices/page",
    "@/app/(app)/devices/[id]/page",
    "@/app/(app)/health/page",
    "@/app/(app)/logs/page",
    "@/app/(app)/policies/page",
    "@/app/(app)/policies/new/page",
    "@/app/(app)/policies/[id]/page",
    "@/app/(app)/policies/[id]/edit/page",
    "@/app/(app)/risk/page",
    "@/app/(app)/tokens/page",
    "@/app/(app)/tokens/provision/page",
    "@/app/(app)/tokens/[id]/page",
    "@/app/(app)/transactions/page",
    "@/app/(app)/transactions/[id]/page",
    "@/app/(app)/users/page",
    "@/app/(app)/users/new/page",
    "@/app/(app)/users/[id]/page",
    "@/app/(app)/users/[id]/edit/page",
    "@/app/(app)/verifications/page",
  ];

  beforeEach(() => {
    mockPathname = "/";
    mockParams = { id: "u_10234" };
    mockQuery = "";
    queryMode = "data";
    profileMode = "data";
    healthMode = "data";
    Object.defineProperty(global.URL, "createObjectURL", {
      configurable: true,
      value: jest.fn(() => "blob:test"),
    });
    Object.defineProperty(global.URL, "revokeObjectURL", {
      configurable: true,
      value: jest.fn(),
    });
    localStorage.clear();
  });

  it.each(modules)("renders %s without crashing", async (modulePath) => {
    const mod = await import(modulePath);
    const Component = mod.default;
    if (modulePath === "@/app/layout") {
      const out = Component({ children: "child" });
      expect(out).toBeTruthy();
      return;
    }
    const isLayout = modulePath.endsWith("/layout");
    render(isLayout ? <Component>child</Component> : <Component />);
    if (
      !isLayout &&
      !["@/app/(app)/logs/page", "@/app/(app)/tokens/[id]/page"].includes(modulePath)
    ) {
      const buttons = Array.from(document.querySelectorAll("button"));
      buttons.forEach((button) => fireEvent.click(button));
    }
    expect(document.body).toBeInTheDocument();
  });

  it("renders user detail tokens tab path", async () => {
    mockPathname = "/users/u_10234";
    mockParams = { id: "u_10234" };
    mockQuery = "tab=tokens";
    const mod = await import("@/app/(app)/users/[id]/page");
    const Component = mod.default;
    render(<Component />);
    expect(screen.getByText("tokens.actionReset")).toBeInTheDocument();
  });

  const queryDrivenPages = [
    "@/app/(app)/apps/page",
    "@/app/(app)/apps/new/page",
    "@/app/(app)/apps/[id]/page",
    "@/app/(app)/apps/[id]/edit/page",
    "@/app/(app)/devices/page",
    "@/app/(app)/devices/[id]/page",
    "@/app/(app)/logs/page",
    "@/app/(app)/policies/page",
    "@/app/(app)/policies/[id]/page",
    "@/app/(app)/policies/[id]/edit/page",
    "@/app/(app)/tokens/page",
    "@/app/(app)/tokens/provision/page",
    "@/app/(app)/tokens/[id]/page",
    "@/app/(app)/transactions/page",
    "@/app/(app)/transactions/[id]/page",
    "@/app/(app)/users/page",
    "@/app/(app)/users/[id]/page",
    "@/app/(app)/users/[id]/edit/page",
  ];

  it.each(queryDrivenPages)("renders loading state for %s", async (modulePath) => {
    queryMode = "loading";
    const mod = await import(modulePath);
    const Component = mod.default;
    render(<Component />);
    expect(document.body).toBeInTheDocument();
  });

  it.each(queryDrivenPages)("renders error state for %s", async (modulePath) => {
    queryMode = "error";
    const mod = await import(modulePath);
    const Component = mod.default;
    render(<Component />);
    expect(document.body).toBeInTheDocument();
  });

  it("renders health and profile loading/error branches", async () => {
    const healthMod = await import("@/app/(app)/health/page");
    const profileMod = await import("@/app/(app)/admin/profile/page");
    const Health = healthMod.default;
    const Profile = profileMod.default;

    healthMode = "loading";
    render(<Health />);
    healthMode = "error";
    render(<Health />);

    profileMode = "loading";
    render(<Profile />);
    profileMode = "error";
    render(<Profile />);
    expect(document.body).toBeInTheDocument();
  });
});
