"use client";

import { ClipboardEvent, KeyboardEvent, useRef } from "react";

type OtpSixInputsProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function OtpSixInputs({ value, onChange, disabled }: Readonly<OtpSixInputsProps>) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const focusAt = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(5, index))];
    el?.focus();
    el?.select();
  };

  const commitDigits = (chars: string[]) => {
    const next = chars.join("").replaceAll(/\D/g, "").slice(0, 6);
    onChange(next);
  };

  const onDigit = (index: number, raw: string) => {
    const d = raw.replaceAll(/\D/g, "").slice(-1) ?? "";
    const nextChars = [...digits];
    nextChars[index] = d;
    commitDigits(nextChars);
    if (d && index < 5) focusAt(index + 1);
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const nextChars = [...digits];
        nextChars[index] = "";
        commitDigits(nextChars);
      } else if (index > 0) {
        focusAt(index - 1);
        const nextChars = [...digits];
        nextChars[index - 1] = "";
        commitDigits(nextChars);
      }
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && index < 5) {
      focusAt(index + 1);
      e.preventDefault();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replaceAll(/\D/g, "").slice(0, 6);
    onChange(text);
    focusAt(Math.min(text.length, 5));
  };

  return (
    <fieldset className="otp-cells" aria-label="Mã OTP 6 số">
      {digits.map((digit, index) => (
        <input
          key={`otp-digit-${String(index)}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className="otp-cell"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => onDigit(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={index === 0 ? onPaste : undefined}
          onFocus={(e) => e.target.select()}
          aria-label={`Chữ số ${index + 1}`}
        />
      ))}
    </fieldset>
  );
}
