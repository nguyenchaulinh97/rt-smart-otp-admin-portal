import { getChallenge, rotateChallengeOtp } from "../../../../../server/mockOtpStore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { challengeId?: string };
  const challengeId = body.challengeId?.trim() ?? "";

  if (!challengeId) {
    return NextResponse.json({ message: "challengeId is required" }, { status: 400 });
  }

  const existing = getChallenge(challengeId);
  if (!existing) {
    return NextResponse.json({ message: "challenge not found" }, { status: 404 });
  }

  const challenge = rotateChallengeOtp(challengeId);
  if (!challenge) {
    return NextResponse.json({ message: "failed to resend otp" }, { status: 500 });
  }

  return NextResponse.json({
    challengeId: challenge.challengeId,
    expiresAt: challenge.expiresAt,
    attemptsRemaining: challenge.attemptsRemaining,
    demoOtp: challenge.otpCode,
  });
}
