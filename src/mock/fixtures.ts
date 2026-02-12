export type UserRecord = {
  id: string;
  name: string;
  email: string;
  appId: string;
  group: string;
  status: "Active" | "Locked";
  createdAt: string;
  lastActivity: string;
};

export type AppRecord = {
  id: string;
  name: string;
  policy: string;
  status: "Active" | "Paused";
  tokens: number;
  createdAt: string;
};

export type TokenRecord = {
  id: string;
  userId: string;
  appId: string;
  status: "Active" | "Locked" | "Inactive";
  lastUsed: string;
  createdAt: string;
};

export type PolicyRecord = {
  id: string;
  name: string;
  type: "TOTP" | "HOTP";
  digits: number;
  stepSeconds?: number;
  window?: number;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  status: "Active" | "Draft";
  createdAt: string;
};

export type AuditLogRecord = {
  id: string;
  actor: string;
  action: string;
  target: string;
  status: "SUCCESS" | "FAIL";
  createdAt: string;
};

export type DeviceRecord = {
  id: string;
  userId: string;
  appId: string;
  platform: "iOS" | "Android";
  status: "Active" | "Revoked";
  lastSeen: string;
};

export type VerifyLogRecord = {
  id: string;
  userId: string;
  appId: string;
  tokenId: string;
  result: "SUCCESS" | "FAIL";
  createdAt: string;
};

export type TransactionRecord = {
  id: string;
  userId: string;
  deviceId: string;
  status: "Active" | "Locked" | "Inactive" | "Expired";
  createdAt: string;
  expiredAt: string;
};

export const usersFixture: UserRecord[] = [
  {
    id: "u_10234",
    name: "Lan Nguyen",
    email: "lan.nguyen@company.com",
    appId: "fintech",
    group: "Retail",
    status: "Active",
    createdAt: "2024-11-02",
    lastActivity: "2 minutes ago",
  },
  {
    id: "u_10412",
    name: "Minh Tran",
    email: "minh.tran@company.com",
    appId: "broker",
    group: "VIP",
    status: "Locked",
    createdAt: "2024-10-12",
    lastActivity: "10 minutes ago",
  },
  {
    id: "u_10988",
    name: "Huy Pham",
    email: "huy.pham@company.com",
    appId: "partner",
    group: "Partner",
    status: "Active",
    createdAt: "2024-08-19",
    lastActivity: "1 hour ago",
  },
  {
    id: "u_11221",
    name: "Thao Le",
    email: "thao.le@company.com",
    appId: "broker",
    group: "Retail",
    status: "Active",
    createdAt: "2024-09-02",
    lastActivity: "5 hours ago",
  },
  {
    id: "u_11305",
    name: "Khoa Bui",
    email: "khoa.bui@company.com",
    appId: "fintech",
    group: "VIP",
    status: "Locked",
    createdAt: "2024-07-21",
    lastActivity: "1 day ago",
  },
  {
    id: "u_11478",
    name: "Mai Do",
    email: "mai.do@company.com",
    appId: "partner",
    group: "Partner",
    status: "Active",
    createdAt: "2024-06-18",
    lastActivity: "2 days ago",
  },
  {
    id: "u_11890",
    name: "Quang Vu",
    email: "quang.vu@company.com",
    appId: "fintech",
    group: "Retail",
    status: "Active",
    createdAt: "2024-10-05",
    lastActivity: "3 hours ago",
  },
  {
    id: "u_12014",
    name: "Lien Pham",
    email: "lien.pham@company.com",
    appId: "broker",
    group: "VIP",
    status: "Active",
    createdAt: "2024-05-14",
    lastActivity: "4 days ago",
  },
];

export const appsFixture: AppRecord[] = [
  {
    id: "broker",
    name: "Broker Mobile",
    policy: "TOTP-30s-6",
    status: "Active",
    tokens: 1200,
    createdAt: "2024-06-20",
  },
  {
    id: "fintech",
    name: "Fintech SuperApp",
    policy: "TOTP-30s-8",
    status: "Active",
    tokens: 880,
    createdAt: "2024-07-04",
  },
  {
    id: "partner",
    name: "Partner Portal",
    policy: "HOTP-6",
    status: "Paused",
    tokens: 160,
    createdAt: "2024-09-12",
  },
  {
    id: "iboard",
    name: "iBoard",
    policy: "TOTP-30s-6",
    status: "Active",
    tokens: 540,
    createdAt: "2024-04-22",
  },
  {
    id: "ibroker",
    name: "iBroker",
    policy: "TOTP-30s-8",
    status: "Active",
    tokens: 760,
    createdAt: "2024-05-10",
  },
  {
    id: "retail",
    name: "Retail Hub",
    policy: "HOTP-6",
    status: "Paused",
    tokens: 210,
    createdAt: "2024-08-02",
  },
];

export const tokensFixture: TokenRecord[] = [
  {
    id: "tk_0901",
    userId: "u_10234",
    appId: "fintech",
    status: "Active",
    lastUsed: "2 minutes ago",
    createdAt: "2024-11-10",
  },
  {
    id: "tk_1042",
    userId: "u_10412",
    appId: "broker",
    status: "Locked",
    lastUsed: "10 minutes ago",
    createdAt: "2024-10-15",
  },
  {
    id: "tk_2208",
    userId: "u_10988",
    appId: "partner",
    status: "Inactive",
    lastUsed: "1 hour ago",
    createdAt: "2024-08-21",
  },
  {
    id: "tk_3321",
    userId: "u_11221",
    appId: "broker",
    status: "Active",
    lastUsed: "4 minutes ago",
    createdAt: "2024-11-01",
  },
  {
    id: "tk_3405",
    userId: "u_11305",
    appId: "fintech",
    status: "Locked",
    lastUsed: "2 hours ago",
    createdAt: "2024-10-28",
  },
  {
    id: "tk_3560",
    userId: "u_11478",
    appId: "partner",
    status: "Inactive",
    lastUsed: "1 day ago",
    createdAt: "2024-09-05",
  },
  {
    id: "tk_4012",
    userId: "u_11890",
    appId: "fintech",
    status: "Active",
    lastUsed: "25 minutes ago",
    createdAt: "2024-11-06",
  },
  {
    id: "tk_4128",
    userId: "u_12014",
    appId: "broker",
    status: "Active",
    lastUsed: "3 days ago",
    createdAt: "2024-07-30",
  },
];

export const policiesFixture: PolicyRecord[] = [
  {
    id: "pol_totp_6",
    name: "TOTP-30s-6",
    type: "TOTP",
    digits: 6,
    stepSeconds: 30,
    window: 1,
    algorithm: "SHA1",
    status: "Active",
    createdAt: "2024-05-01",
  },
  {
    id: "pol_totp_8",
    name: "TOTP-30s-8",
    type: "TOTP",
    digits: 8,
    stepSeconds: 30,
    window: 2,
    algorithm: "SHA256",
    status: "Active",
    createdAt: "2024-06-15",
  },
  {
    id: "pol_hotp_6",
    name: "HOTP-6",
    type: "HOTP",
    digits: 6,
    window: 1,
    algorithm: "SHA1",
    status: "Draft",
    createdAt: "2024-07-10",
  },
  {
    id: "pol_totp_6_alt",
    name: "TOTP-30s-6-ALT",
    type: "TOTP",
    digits: 6,
    stepSeconds: 30,
    window: 1,
    algorithm: "SHA512",
    status: "Active",
    createdAt: "2024-08-18",
  },
  {
    id: "pol_totp_8_alt",
    name: "TOTP-30s-8-ALT",
    type: "TOTP",
    digits: 8,
    stepSeconds: 60,
    window: 3,
    algorithm: "SHA256",
    status: "Draft",
    createdAt: "2024-09-03",
  },
  {
    id: "pol_hotp_8",
    name: "HOTP-8",
    type: "HOTP",
    digits: 8,
    window: 2,
    algorithm: "SHA1",
    status: "Active",
    createdAt: "2024-10-09",
  },
];

export const auditLogsFixture: AuditLogRecord[] = [
  {
    id: "log_1001",
    actor: "admin_01",
    action: "UNLOCK_TOKEN",
    target: "tk_1042",
    status: "SUCCESS",
    createdAt: "2024-11-10 09:12",
  },
  {
    id: "log_1002",
    actor: "admin_02",
    action: "RESET_SECRET",
    target: "u_10412",
    status: "SUCCESS",
    createdAt: "2024-11-10 10:05",
  },
  {
    id: "log_1003",
    actor: "admin_03",
    action: "LOCK_TOKEN",
    target: "tk_2208",
    status: "FAIL",
    createdAt: "2024-11-10 10:20",
  },
  {
    id: "log_1004",
    actor: "admin_01",
    action: "CREATE_APP",
    target: "iboard",
    status: "SUCCESS",
    createdAt: "2024-11-11 08:45",
  },
  {
    id: "log_1005",
    actor: "admin_02",
    action: "DEACTIVATE_TOKEN",
    target: "tk_3560",
    status: "SUCCESS",
    createdAt: "2024-11-11 09:20",
  },
  {
    id: "log_1006",
    actor: "admin_04",
    action: "UPDATE_POLICY",
    target: "pol_totp_8_alt",
    status: "SUCCESS",
    createdAt: "2024-11-11 10:05",
  },
];

export const devicesFixture: DeviceRecord[] = [
  {
    id: "dev_a01",
    userId: "u_10234",
    appId: "fintech",
    platform: "iOS",
    status: "Active",
    lastSeen: "3 minutes ago",
  },
  {
    id: "dev_b02",
    userId: "u_10412",
    appId: "broker",
    platform: "Android",
    status: "Revoked",
    lastSeen: "1 day ago",
  },
  {
    id: "dev_c03",
    userId: "u_10988",
    appId: "partner",
    platform: "Android",
    status: "Active",
    lastSeen: "2 hours ago",
  },
  {
    id: "dev_d30",
    userId: "u_11221",
    appId: "broker",
    platform: "Android",
    status: "Active",
    lastSeen: "30 minutes ago",
  },
  {
    id: "dev_e07",
    userId: "u_11305",
    appId: "fintech",
    platform: "iOS",
    status: "Revoked",
    lastSeen: "6 hours ago",
  },
  {
    id: "dev_f12",
    userId: "u_11478",
    appId: "partner",
    platform: "Android",
    status: "Active",
    lastSeen: "2 days ago",
  },
  {
    id: "dev_g44",
    userId: "u_11890",
    appId: "fintech",
    platform: "iOS",
    status: "Active",
    lastSeen: "1 hour ago",
  },
  {
    id: "dev_h19",
    userId: "u_12014",
    appId: "broker",
    platform: "Android",
    status: "Revoked",
    lastSeen: "3 days ago",
  },
];

export const verifyLogsFixture: VerifyLogRecord[] = [
  {
    id: "verify_2001",
    userId: "u_10234",
    appId: "fintech",
    tokenId: "tk_0901",
    result: "SUCCESS",
    createdAt: "2024-11-10 10:30",
  },
  {
    id: "verify_2002",
    userId: "u_10412",
    appId: "broker",
    tokenId: "tk_1042",
    result: "FAIL",
    createdAt: "2024-11-10 10:32",
  },
  {
    id: "verify_2003",
    userId: "u_10988",
    appId: "partner",
    tokenId: "tk_2208",
    result: "SUCCESS",
    createdAt: "2024-11-10 10:35",
  },
  {
    id: "ver_2004",
    userId: "u_11221",
    appId: "broker",
    tokenId: "tk_3321",
    result: "SUCCESS",
    createdAt: "2024-11-11 08:55",
  },
  {
    id: "ver_2005",
    userId: "u_11305",
    appId: "fintech",
    tokenId: "tk_3405",
    result: "FAIL",
    createdAt: "2024-11-11 09:05",
  },
  {
    id: "ver_2006",
    userId: "u_11478",
    appId: "partner",
    tokenId: "tk_3560",
    result: "SUCCESS",
    createdAt: "2024-11-11 09:30",
  },
  {
    id: "ver_2007",
    userId: "u_11890",
    appId: "fintech",
    tokenId: "tk_4012",
    result: "SUCCESS",
    createdAt: "2024-11-11 10:15",
  },
  {
    id: "ver_2008",
    userId: "u_12014",
    appId: "broker",
    tokenId: "tk_4128",
    result: "FAIL",
    createdAt: "2024-11-11 10:35",
  },
];

export const transactionsFixture: TransactionRecord[] = [
  {
    id: "txn_12001",
    userId: "u_10234",
    deviceId: "dev_a01",
    status: "Active",
    createdAt: "2026-02-12 08:10",
    expiredAt: "2026-02-12 08:40",
  },
  {
    id: "txn_12002",
    userId: "u_10412",
    deviceId: "dev_b07",
    status: "Expired",
    createdAt: "2026-02-11 14:22",
    expiredAt: "2026-02-11 14:52",
  },
  {
    id: "txn_12003",
    userId: "u_10988",
    deviceId: "dev_c19",
    status: "Locked",
    createdAt: "2026-02-12 09:05",
    expiredAt: "2026-02-12 09:35",
  },
  {
    id: "txn_12004",
    userId: "u_10234",
    deviceId: "dev_a01",
    status: "Inactive",
    createdAt: "2026-02-10 16:40",
    expiredAt: "2026-02-10 17:10",
  },
  {
    id: "txn_12005",
    userId: "u_11002",
    deviceId: "dev_d02",
    status: "Active",
    createdAt: "2026-02-12 07:15",
    expiredAt: "2026-02-12 07:45",
  },
];
