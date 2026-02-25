import { ROLE_PERMISSIONS, ROLES, type Permission, type Role } from "@/constants/rbac";

export type { Permission, Role };

export const canAccess = (role: Role, permission: Permission) =>
  ROLE_PERMISSIONS[role].includes(permission);

export const allRoles: Role[] = [...ROLES];
