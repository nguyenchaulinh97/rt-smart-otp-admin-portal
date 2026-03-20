import type {
  AppRecord,
  AuditLogRecord,
  DeviceRecord,
  PolicyRecord,
  TokenRecord,
  UserRecord,
  VerifyLogRecord,
} from "@/mock/api";

export type ApiUser = Partial<
  UserRecord & {
    user_id: string;
    user_type: string;
    created_at: string;
    last_activity: string;
  }
>;
export type ApiApp = AppRecord;
export type ApiToken = TokenRecord;
export type ApiPolicy = PolicyRecord;
export type ApiAuditLog = AuditLogRecord;
export type ApiVerifyLog = VerifyLogRecord;
export type ApiDevice = DeviceRecord;

const normalizeStatus = (value: unknown): UserRecord["status"] => {
  const status = String(value ?? "").toLowerCase();
  if (status === "locked" || status === "lock") return "Locked";
  if (status === "active" || status === "unlock") return "Active";
  return undefined;
};

export const mapUser = (payload: ApiUser): UserRecord => ({
  id: String((payload as Record<string, unknown>).user_id ?? payload.id ?? ""),
  username: String((payload as Record<string, unknown>).username ?? ""),
  name: String((payload as Record<string, unknown>).name ?? ""),
  email: String((payload as Record<string, unknown>).email ?? ""),
  cif: String((payload as Record<string, unknown>).cif ?? ""),
  status: normalizeStatus((payload as Record<string, unknown>).status),
  type:
    ((payload as Record<string, unknown>).type as string | undefined) ??
    ((payload as Record<string, unknown>).user_type as string | undefined),
  createdAt:
    ((payload as Record<string, unknown>).created_at as string | undefined) ??
    ((payload as Record<string, unknown>).createdAt as string | undefined),
  lastActivity:
    ((payload as Record<string, unknown>).last_activity as string | undefined) ??
    ((payload as Record<string, unknown>).lastActivity as string | undefined),
});
export const mapApp = (payload: ApiApp): AppRecord => payload;
export const mapToken = (payload: ApiToken): TokenRecord => payload;
export const mapPolicy = (payload: ApiPolicy): PolicyRecord => payload;
export const mapAuditLog = (payload: ApiAuditLog): AuditLogRecord => payload;
export const mapVerifyLog = (payload: ApiVerifyLog): VerifyLogRecord => payload;
export const mapDevice = (payload: ApiDevice): DeviceRecord => payload;
