import type {
  AppRecord,
  AuditLogRecord,
  DeviceRecord,
  PolicyRecord,
  TokenRecord,
  UserRecord,
  VerifyLogRecord,
} from "@/mock/api";

export type ApiUser = UserRecord;
export type ApiApp = AppRecord;
export type ApiToken = TokenRecord;
export type ApiPolicy = PolicyRecord;
export type ApiAuditLog = AuditLogRecord;
export type ApiVerifyLog = VerifyLogRecord;
export type ApiDevice = DeviceRecord;

export const mapUser = (payload: ApiUser): UserRecord => payload;
export const mapApp = (payload: ApiApp): AppRecord => payload;
export const mapToken = (payload: ApiToken): TokenRecord => payload;
export const mapPolicy = (payload: ApiPolicy): PolicyRecord => payload;
export const mapAuditLog = (payload: ApiAuditLog): AuditLogRecord => payload;
export const mapVerifyLog = (payload: ApiVerifyLog): VerifyLogRecord => payload;
export const mapDevice = (payload: ApiDevice): DeviceRecord => payload;
