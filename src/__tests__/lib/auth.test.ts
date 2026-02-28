import { isAuthenticated } from "@/lib/auth";

describe("isAuthenticated", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns true when auth flag is true", () => {
    localStorage.setItem("auth:loggedIn", "true");
    expect(isAuthenticated()).toBe(true);
  });

  it("returns false when auth flag is missing", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("returns false when auth flag is not true", () => {
    localStorage.setItem("auth:loggedIn", "false");
    expect(isAuthenticated()).toBe(false);
  });
});
