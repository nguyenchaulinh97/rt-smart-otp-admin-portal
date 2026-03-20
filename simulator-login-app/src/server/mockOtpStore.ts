type OtpChallenge = {
  challengeId: string;
  username: string;
  otpCode: string;
  expiresAt: number;
  attemptsRemaining: number;
  maxAttempts: number;
};

const OTP_TTL_MS = 120000;
const MAX_ATTEMPTS = 3;
const challenges = new Map<string, OtpChallenge>();

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const newChallenge = (username: string): OtpChallenge => ({
  challengeId: generateId(),
  username,
  otpCode: generateOtp(),
  expiresAt: Date.now() + OTP_TTL_MS,
  attemptsRemaining: MAX_ATTEMPTS,
  maxAttempts: MAX_ATTEMPTS,
});

export const createChallenge = (username: string) => {
  const challenge = newChallenge(username);
  challenges.set(challenge.challengeId, challenge);
  return challenge;
};

export const getChallenge = (challengeId: string) => challenges.get(challengeId) ?? null;

export const consumeAttempt = (challengeId: string) => {
  const challenge = challenges.get(challengeId);
  if (!challenge) return null;
  challenge.attemptsRemaining -= 1;
  challenges.set(challengeId, challenge);
  return challenge;
};

export const rotateChallengeOtp = (challengeId: string) => {
  const current = challenges.get(challengeId);
  if (!current) return null;
  const updated: OtpChallenge = {
    ...current,
    otpCode: generateOtp(),
    expiresAt: Date.now() + OTP_TTL_MS,
    attemptsRemaining: current.maxAttempts,
  };
  challenges.set(challengeId, updated);
  return updated;
};

export const removeChallenge = (challengeId: string) => {
  challenges.delete(challengeId);
};
