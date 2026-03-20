export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResult = {
  challengeId: string;
  expiresAt: number;
  attemptsRemaining: number;
  deliveryHint: string;
  demoOtp?: string;
  /** Nếu true: đăng nhập đã có token, không cần bước OTP */
  skipOtp?: boolean;
  /** Token trả về khi skipOtp (HTTP API) */
  directToken?: string;
};

export type VerifyPayload = {
  challengeId: string;
  otpCode: string;
};

export type VerifyResult = {
  success: boolean;
  token?: string;
  message: string;
  attemptsRemaining?: number;
};

export type ResendPayload = {
  challengeId: string;
};

export type ResendResult = {
  challengeId: string;
  expiresAt: number;
  attemptsRemaining: number;
  demoOtp?: string;
};

export type AuthAdapter = {
  startLogin(payload: LoginPayload): Promise<LoginResult>;
  verifyOtp(payload: VerifyPayload): Promise<VerifyResult>;
  resendOtp(payload: ResendPayload): Promise<ResendResult>;
};
