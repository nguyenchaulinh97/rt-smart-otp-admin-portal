import AuthGuard from "@/components/AuthGuard";
import PolicyForm from "@/components/PolicyForm";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
let mockPathname = "/";
const mockSetLocale = jest.fn();
const mockToggleTheme = jest.fn();

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ locale: "en", setLocale: mockSetLocale, t: (key: string) => key }),
}));

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: mockToggleTheme }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
}));

jest.mock("@ant-design/icons", () => new Proxy({}, { get: () => () => <span>icon</span> }));

jest.mock("antd", () => {
  const Button = ({ children, onClick, htmlType, ...props }: any) => (
    <button
      {...props}
      onClick={(e) => {
        if (htmlType !== "submit") onClick?.(e);
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
    <select {...props} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {typeof opt.label === "string" ? opt.label : String(opt.value)}
        </option>
      ))}
    </select>
  );
  const Tooltip = ({ children }: any) => <>{children}</>;
  const Spin = () => <div>spin</div>;
  const Menu = ({ items = [], onClick }: any) => (
    <div>
      {items.map((item: any) => (
        <button key={item.key} onClick={() => onClick?.({ key: item.key })}>
          {item.label}
        </button>
      ))}
    </div>
  );
  const Typography = { Text: ({ children }: any) => <span>{children}</span> };
  const Layout = {
    Sider: ({ children, onCollapse, collapsed }: any) => (
      <aside>
        <button data-testid="collapse-toggle" onClick={() => onCollapse?.(!collapsed)}>
          toggle
        </button>
        {children}
      </aside>
    ),
  };
  return { Button, Input, Select, Tooltip, Spin, Menu, Typography, Layout };
});

describe("components interactions", () => {
  beforeEach(() => {
    mockPathname = "/";
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("TopBar toggles theme, sets locale and logs out", () => {
    localStorage.setItem("auth:loggedIn", "true");
    render(<TopBar />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "vi" } });
    expect(mockSetLocale).toHaveBeenCalledWith("vi");

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(mockToggleTheme).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(localStorage.getItem("auth:loggedIn")).toBeNull();
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("TopBar resolves dashboard title when pathname is empty", () => {
    mockPathname = "";
    render(<TopBar />);
    expect(screen.getByText("dashboard.title")).toBeInTheDocument();
  });

  it("Sidebar routes click in plain mode", () => {
    const onNavigate = jest.fn();
    mockPathname = "/users";
    render(<Sidebar plain onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("button", { name: "nav.dashboard" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
    expect(onNavigate).toHaveBeenCalled();
  });

  it("Sidebar calls onCollapse in desktop mode", () => {
    const onCollapse = jest.fn();
    render(<Sidebar collapsed={false} onCollapse={onCollapse} />);
    fireEvent.click(screen.getByTestId("collapse-toggle"));
    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it("AuthGuard allows public route and blocks private unauth route", async () => {
    mockPathname = "/login";
    render(
      <AuthGuard>
        <div>public-child</div>
      </AuthGuard>,
    );
    expect(screen.getByText("public-child")).toBeInTheDocument();

    mockPathname = "/users";
    localStorage.setItem("auth:loggedIn", "false");
    render(
      <AuthGuard>
        <div>private-child</div>
      </AuthGuard>,
    );
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/login"));
  });

  it("PolicyForm validates and submits valid payload", async () => {
    const onSubmit = jest.fn(async () => undefined);
    const { container } = render(
      <PolicyForm
        title="Policy"
        initialValues={{
          name: "",
          type: "TOTP",
          digits: "",
          stepSeconds: "",
          window: "",
          algorithm: "SHA1",
          status: "Active",
        }}
        onCancel={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "policies.save" }));
    expect(screen.getAllByText("policies.validationRequired").length).toBeGreaterThan(0);

    const [nameInput, digitsInput, stepInput, windowInput] = Array.from(
      container.querySelectorAll("input"),
    );
    fireEvent.change(nameInput, { target: { value: "Policy A" } });
    fireEvent.change(digitsInput, { target: { value: "6" } });
    fireEvent.change(stepInput, { target: { value: "30" } });
    fireEvent.change(windowInput, { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "policies.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
