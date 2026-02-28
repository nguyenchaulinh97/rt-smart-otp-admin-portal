import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "@/constants/rbac";

describe("constants/rbac", () => {
  it("exports expected roles", () => {
    expect(ROLES).toEqual(["admin", "operator", "viewer"]);
  });

  it("contains all permissions in admin role", () => {
    expect(ROLE_PERMISSIONS.admin).toEqual(PERMISSIONS);
  });

  it("defines viewer role as read-only/no permissions", () => {
    expect(ROLE_PERMISSIONS.viewer).toEqual([]);
  });
});
