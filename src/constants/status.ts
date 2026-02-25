export const STATUS_LABEL_KEYS = {
  Active: "status.active",
  Locked: "status.locked",
  Inactive: "status.inactive",
  Expired: "status.expired",
  Paused: "status.paused",
  Draft: "status.draft",
  Revoked: "status.revoked",
  SUCCESS: "status.success",
  FAIL: "status.fail",
} as const;

export type StatusKey = keyof typeof STATUS_LABEL_KEYS;
