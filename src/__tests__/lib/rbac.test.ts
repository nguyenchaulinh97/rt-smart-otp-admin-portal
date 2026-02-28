import { PERMISSIONS } from "@/constants/rbac";
import { allRoles, canAccess } from "@/lib/rbac";

describe("rbac helpers", () => {
  it("returns all roles", () => {
    expect(allRoles).toEqual(["admin", "operator", "viewer"]);
  });

  it("allows admin to access all permissions", () => {
    for (const permission of PERMISSIONS) {
      expect(canAccess("admin", permission)).toBe(true);
    }
  });

  it("blocks viewer from all permissions", () => {
    for (const permission of PERMISSIONS) {
      expect(canAccess("viewer", permission)).toBe(false);
    }
  });
});
