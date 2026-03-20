import { createChallenge } from "@/server/mockOtpStore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (!username || !password) {
    return NextResponse.json({ message: "username and password are required" }, { status: 400 });
  }

  const challenge = createChallenge(username);
  return NextResponse.json({
    challengeId: challenge.challengeId,
    expiresAt: challenge.expiresAt,
    attemptsRemaining: challenge.attemptsRemaining,
    deliveryHint: "Smart OTP app",
    demoOtp: challenge.otpCode,
  });
}
