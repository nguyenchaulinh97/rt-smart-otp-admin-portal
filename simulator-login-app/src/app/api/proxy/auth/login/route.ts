import { NextResponse } from "next/server";

/**
 * Proxy đăng nhập → backend thật (tránh CORS).
 * Body client: JSON { username, password }
 * Upstream: Content-Type text/plain; body JSON string (theo curl backend).
 */
export async function POST(request: Request) {
  const base = process.env.AUTH_UPSTREAM_BASE?.trim();
  if (!base) {
    return NextResponse.json(
      { message: "Thiếu biến môi trường AUTH_UPSTREAM_BASE (URL backend, ví dụ http://159.89.203.207:8082)" },
      { status: 500 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ message: "Body JSON không hợp lệ" }, { status: 400 });
  }

  const upstreamUrl = `${base.replace(/\/$/, "")}/api/v1/auth/login`;

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      username: body.username ?? "",
      password: body.password ?? "",
    }),
  });

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}
