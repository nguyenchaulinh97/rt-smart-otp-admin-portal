# Smart OTP Admin – Sitemap & Wireflow Draft

## Sitemap (Draft)

```
Admin Portal
├─ Login
├─ Dashboard
├─ Users
│  ├─ Users List
│  ├─ User Detail
│  │  ├─ Profile & Status
│  │  ├─ Tokens
│  │  ├─ Devices
│  │  └─ Activity Log
│  └─ Create / Edit User
├─ Apps
│  ├─ Apps List
│  ├─ App Detail
│  │  ├─ App Settings
│  │  ├─ OTP Policy
│  │  └─ Tokens (by App)
│  └─ Create / Edit App
├─ Tokens
│  ├─ Tokens List
│  ├─ Token Detail
│  │  ├─ Status & Metadata
│  │  ├─ Enrollment Info (QR/URI)
│  │  └─ Usage History
│  └─ Provision / Reset / Lock / Unlock
├─ Transactions
│  ├─ Transactions List
│  └─ Transaction Detail (optional)
├─ Devices
│  ├─ Devices List
│  └─ Device Detail
├─ Logs & Audit
│  ├─ OTP Verify Logs
│  └─ Admin Actions
```

## Wireflow (Draft)

### 1) Users

```
Users List
  ├─ Search/Filter (status, app, group)
  ├─ Row Actions: View Detail | Lock/Unlock | Reset OTP
  └─ CTA: Create User

User Detail
  ├─ Tabs: Profile | Tokens | Devices | Activity
  ├─ Profile: status, role, group, createdAt
  ├─ Tokens: list + actions (reset, lock/unlock, re-enroll)
  ├─ Devices: list + unbind
  └─ Activity: OTP verify logs + admin actions

Create/Edit User
  ├─ Form: user_id, name, email, group, role
  └─ Save → success toast → back to detail
```

### 2) Apps

```
Apps List
  ├─ Search/Filter (status, policy)
  ├─ Row Actions: View Detail | Edit | Deactivate
  └─ CTA: Create App

App Detail
  ├─ Sections: App Settings | OTP Policy | Tokens
  ├─ App Settings: app_id, name, status
  ├─ OTP Policy: digits, step, algo, window
  └─ Tokens (by app): list + actions

Create/Edit App
  ├─ Form: app_id, name, status, policy
  └─ Save → success toast → back to detail
```

### 3) Tokens

```
Tokens List
  ├─ Search/Filter (user_id, app_id, status)
  ├─ Row Actions: View Detail | Lock/Unlock | Reset | Export QR
  └─ CTA: Provision Token

Token Detail
  ├─ Status: active/locked/revoked + timestamps
  ├─ Enrollment: QR / otpauth URI (view once)
  └─ Usage: last_used, fail_count, lock_threshold

Provision Token Flow
  ├─ Select user_id + app_id
  ├─ Choose policy (digits, step, algo)
  ├─ Generate secret → show QR/URI → confirm delivery

### 4) Transactions

```

Transactions List
├─ Search/Filter (transaction_id, user_id, device_id, status)
├─ Columns: status, created_at, expired_at
└─ (Optional) Drilldown to transaction detail

```

```

## Notes / Assumptions

- Tabs can be replaced with segmented controls on small screens.
- Sensitive data (secretKey/QR) shown once with explicit confirmation.
- All actions include confirmation modals and audit logging.
