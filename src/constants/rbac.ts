export const ROLES = ["admin", "operator", "viewer"] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "users:create",
  "users:edit",
  "users:lock",
  "users:unlock",
  "users:reset",
  "apps:create",
  "apps:edit",
  "apps:pause",
  "apps:activate",
  "tokens:provision",
  "tokens:lock",
  "tokens:unlock",
  "tokens:reset",
  "tokens:export",
  "devices:block",
  "devices:unbind",
  "verifications:resend",
  "policies:create",
  "policies:edit",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "users:create",
    "users:edit",
    "users:lock",
    "users:unlock",
    "users:reset",
    "apps:create",
    "apps:edit",
    "apps:pause",
    "apps:activate",
    "tokens:provision",
    "tokens:lock",
    "tokens:unlock",
    "tokens:reset",
    "tokens:export",
    "devices:block",
    "devices:unbind",
    "verifications:resend",
    "policies:create",
    "policies:edit",
  ],
  operator: [
    "users:lock",
    "users:unlock",
    "users:reset",
    "apps:pause",
    "apps:activate",
    "tokens:provision",
    "tokens:lock",
    "tokens:unlock",
    "tokens:reset",
    "tokens:export",
    "devices:block",
    "devices:unbind",
    "verifications:resend",
  ],
  viewer: [],
};
