# Smart OTP Login Simulator

Mini Next.js app để giả lập đăng nhập + Smart OTP (mock) hoặc **ghép API đăng nhập thật** qua proxy.

## Chạy local

```bash
pnpm install
pnpm dev
```

Mặc định: `http://localhost:3001`

## Luồng

1. `/login` — nhập username/password  
2. `/otp` — nhập OTP (mock) **hoặc** bỏ qua nếu API trả token ngay  
3. `/result` — kết quả  

## Mock (mặc định)

Trong `.env.local` (hoặc không set gì):

- `NEXT_PUBLIC_AUTH_PROVIDER=mock`

## API đăng nhập thật (backend có sẵn)

Backend mẫu:

`POST http://159.89.203.207:8082/api/v1/auth/login`  
Header: `Content-Type: text/plain`  
Body: chuỗi JSON `{"username":"...","password":"..."}`  

Trình duyệt không gọi trực tiếp IP đó được (CORS). Simulator dùng **Route Handler proxy** cùng origin:

1. Tạo `simulator-login-app/.env.local`:

```bash
NEXT_PUBLIC_AUTH_PROVIDER=http
NEXT_PUBLIC_AUTH_API_BASE_URL=
NEXT_PUBLIC_AUTH_LOGIN_PATH=/api/proxy/auth/login
NEXT_PUBLIC_AUTH_LOGIN_CONTENT_TYPE=application/json

# Chỉ server đọc — URL gốc backend
AUTH_UPSTREAM_BASE=http://159.89.203.207:8082
```

2. Khởi động lại `pnpm dev`.

Client gửi JSON tới `/api/proxy/auth/login` → server forward tới backend với `Content-Type: text/plain` đúng như curl.

### Phản hồi đăng nhập

Adapter map JSON thành:

- Có `access_token` / `token` / `accessToken` / … → coi như **đăng nhập xong**, chuyển thẳng `/result` (bỏ bước OTP).  
- Có `challengeId` / `session_id` / … → vào màn OTP; verify/resend vẫn dùng **mock** trừ khi bạn cấu hình endpoint thật.

### Gọi trực tiếp backend (chỉ khi backend bật CORS)

```bash
NEXT_PUBLIC_AUTH_API_BASE_URL=http://159.89.203.207:8082
NEXT_PUBLIC_AUTH_LOGIN_PATH=/api/v1/auth/login
NEXT_PUBLIC_AUTH_LOGIN_CONTENT_TYPE=text/plain
```

## Auth provider

| Biến | Ý nghĩa |
|------|--------|
| `NEXT_PUBLIC_AUTH_PROVIDER` | `mock` \| `http` |
| `NEXT_PUBLIC_AUTH_LOGIN_PATH` | Đường dẫn login (mặc định proxy) |
| `AUTH_UPSTREAM_BASE` | URL backend cho proxy (server-only) |

Chi tiết thêm: xem `.env.example`.
