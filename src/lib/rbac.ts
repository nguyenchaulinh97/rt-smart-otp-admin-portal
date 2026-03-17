import { Permission, Role, ROLE_PERMISSIONS, ROLES } from "@/constants/rbac";
export type { Permission, Role } from "@/constants/rbac";

export const canAccess = (role: Role, permission: Permission) =>
  ROLE_PERMISSIONS[role].includes(permission);

export const allRoles: Role[] = [...ROLES];
