import { consumeAttempt, getChallenge, removeChallenge } from "../../../../../server/mockOtpStore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { challengeId?: string; otpCode?: string };
  const challengeId = body.challengeId?.trim() ?? "";
  const otpCode = body.otpCode?.trim() ?? "";

  if (!challengeId || !otpCode) {
    return NextResponse.json({ message: "challengeId and otpCode are required" }, { status: 400 });
  }

  const challenge = getChallenge(challengeId);
  if (!challenge) {
    return NextResponse.json({ message: "challenge not found" }, { status: 404 });
  }

  if (Date.now() > challenge.expiresAt) {
    removeChallenge(challengeId);
    return NextResponse.json(
      { success: false, message: "OTP expired. Please request a new code.", attemptsRemaining: 0 },
      { status: 400 },
    );
  }

  if (challenge.otpCode !== otpCode) {
    const updated = consumeAttempt(challengeId);
    if (!updated || updated.attemptsRemaining <= 0) {
      removeChallenge(challengeId);
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please login again.", attemptsRemaining: 0 },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Incorrect OTP code.",
        attemptsRemaining: updated.attemptsRemaining,
      },
      { status: 400 },
    );
  }

  removeChallenge(challengeId);
  return NextResponse.json({
    success: true,
    token: `mock-token-${Math.random().toString(36).slice(2)}`,
    message: "OTP verified successfully",
  });
}
