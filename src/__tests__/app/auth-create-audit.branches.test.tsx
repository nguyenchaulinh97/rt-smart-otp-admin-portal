import AuditAdvancedPage from "@/app/(app)/audit-advanced/page";
import UserCreatePage from "@/app/(app)/users/new/page";
import LoginPage from "@/app/(auth)/login/page";
import { useLogin } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";

const routerPush = jest.fn();
const routerReplace = jest.fn();
const confirmMock = jest.fn();
const toastMock = jest.fn();
const loginMock = jest.fn();
const userFormSpy = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: "en" }),
}));

jest.mock("@/hooks/useConfirm", () => ({ useConfirm: jest.fn() }));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/hooks/useAuth", () => ({ useLogin: jest.fn() }));

jest.mock("@/components/UserForm", () => ({
  __esModule: true,
  default: (props: any) => {
    userFormSpy(props);
    return (
      <div>
        <button data-testid="user-cancel" onClick={props.onCancel}>
          cancel
        </button>
        <button data-testid="user-submit" onClick={() => props.onSubmit()}>
          submit
        </button>
      </div>
    );
  },
}));

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
  const Input = ({ value, onChange, placeholder, ...props }: any) => (
    <input
      {...props}
      value={value ?? ""}
      placeholder={placeholder}
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
  const Switch = ({ checked, onChange, ...props }: any) => (
    <input
      {...props}
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
  const Card = ({ children, title }: any) => (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  );
  const Checkbox = ({ children }: any) => <label>{children}</label>;
  const Form: any = ({ children, onFinish }: any) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFinish?.({ username: "admin", password: "password", remember: true });
      }}
    >
      {children}
    </form>
  );
  Form.displayName = "MockAuthForm";
  const FormItem = ({ children, label }: any) => (
    <div>
      {label}
      {children}
    </div>
  );
  FormItem.displayName = "MockAuthFormItem";
  Form.Item = FormItem;
  Form.useForm = () => [{}];

  return { Button, Input, Select, Switch, Card, Checkbox, Form };
});

describe("users/new branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: routerPush, replace: routerReplace });
    (useConfirm as jest.Mock).mockReturnValue(confirmMock);
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (useLogin as jest.Mock).mockReturnValue({ login: loginMock, isPending: false });
  });

  it("covers cancel and submit reject/accept flows", async () => {
    confirmMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<UserCreatePage />);

    expect(userFormSpy).toHaveBeenCalled();
    expect(userFormSpy.mock.calls[0][0].title).toBe("users.createTitle");

    fireEvent.click(screen.getByTestId("user-cancel"));
    expect(routerPush).toHaveBeenCalledWith("/users");

    fireEvent.click(screen.getByTestId("user-submit"));
    await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(1));
    expect(toastMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("user-submit"));
    await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(2));
    expect(toastMock).toHaveBeenCalledWith({ variant: "success", message: "ui.toastSaved" });
    expect(routerPush).toHaveBeenCalledWith("/users");
  });
});

describe("audit-advanced branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: routerPush, replace: routerReplace });
    (useConfirm as jest.Mock).mockReturnValue(confirmMock);
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (useLogin as jest.Mock).mockReturnValue({ login: loginMock, isPending: false });
  });

  it("covers state updates and save accept path", async () => {
    confirmMock.mockResolvedValue(true);
    render(<AuditAdvancedPage />);

    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "SOC2" } });
    fireEvent.change(screen.getByDisplayValue("90"), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "auditAdvanced.generate" }));
    fireEvent.click(screen.getByRole("button", { name: "auditAdvanced.save" }));

    await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(2));
    expect(toastMock).toHaveBeenCalledWith({
      variant: "success",
      message: "auditAdvanced.toastSaved",
    });
  });

  it("covers save reject branch", async () => {
    confirmMock.mockResolvedValue(false);
    render(<AuditAdvancedPage />);

    fireEvent.click(screen.getByRole("button", { name: "auditAdvanced.save" }));
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(toastMock).not.toHaveBeenCalled();
  });
});

describe("auth/login branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({ push: routerPush, replace: routerReplace });
    (useConfirm as jest.Mock).mockReturnValue(confirmMock);
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (useLogin as jest.Mock).mockReturnValue({ login: loginMock, isPending: false });
  });

  it("covers success login path with storage and navigation", async () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "login.button" }));

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/"));
    expect(localStorage.getItem("auth:token")).toBe("dev-bypass-token");
    expect(localStorage.getItem("auth:loggedIn")).toBe("true");
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("covers catch branch when navigation fails", async () => {
    routerReplace.mockImplementationOnce(() => {
      throw new Error("nav-failed");
    });

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "login.button" }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({ message: "nav-failed", variant: "error" }),
    );
  });
});
