import { useLogin } from "@/hooks/useAuth";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock the api hook used by useLogin so tests don't call network
jest.mock("@/services/api", () => ({
  useApiMutation: () => ({
    mutateAsync: async () => ({
      token: "fake-token",
      username: "user",
      admin_id: 1,
    }),
    isPending: false,
    error: null,
  }),
}));

function TestComponent() {
  const { login } = useLogin();
  return (
    <button onClick={() => void login("u", "p")} data-testid="login-btn">
      Login
    </button>
  );
}

describe("useLogin", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  test("stores token in localStorage on successful login", async () => {
    render(<TestComponent />);
    const btn = screen.getByTestId("login-btn");

    await fireEvent.click(btn);

    expect(localStorage.getItem("auth:token")).toBe("fake-token");
  });
});
