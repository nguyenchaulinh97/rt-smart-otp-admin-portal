import { renderHook, act } from "@testing-library/react";
import { useRole } from "@/hooks/useRole";

describe("useRole", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses admin as default and persists it", () => {
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBe("admin");
    expect(localStorage.getItem("admin:role")).toBe("admin");
  });

  it("reads role from localStorage if present", () => {
    localStorage.setItem("admin:role", "viewer");
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBe("viewer");
  });

  it("updates role and localStorage", () => {
    const { result } = renderHook(() => useRole());

    act(() => {
      result.current.setRole("operator");
    });

    expect(result.current.role).toBe("operator");
    expect(localStorage.getItem("admin:role")).toBe("operator");
  });
});
