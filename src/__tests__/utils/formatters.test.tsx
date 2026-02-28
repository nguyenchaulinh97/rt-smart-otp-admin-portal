import {
  formatDate,
  formatDateTime,
  formatNumber,
  getStatusLabel,
  getStatusColor,
  formatPolicyStep,
} from "@/utils/formatters";

describe("formatters", () => {
  test("formatDate handles ISO date and returns localized string", () => {
    const out = formatDate("2021-12-31", "en-US");
    expect(typeof out).toBe("string");
    expect(out).toContain("2021");
  });

  test("formatDate returns original value for invalid input", () => {
    expect(formatDate("not-a-date", "en-US")).toBe("not-a-date");
  });

  test("formatDateTime includes time in output", () => {
    const out = formatDateTime("2021-12-31 13:45:00", "en-US");
    expect(typeof out).toBe("string");
    expect(out).toContain("2021");
  });

  test("formatNumber formats with locale", () => {
    const out = formatNumber(1234567.89, "en-US");
    expect(out).toBe("1,234,567.89");
  });

  test("getStatusColor returns expected color for known statuses", () => {
    expect(getStatusColor("Active")).toBe("green");
    expect(getStatusColor("FAIL")).toBe("red");
    expect(getStatusColor("Paused")).toBe("gold");
    expect(getStatusColor("Unknown")).toBe("default");
  });

  test("getStatusLabel resolves known keys and falls back to raw value", () => {
    const t = (key: string) => `translated:${key}`;
    expect(getStatusLabel("Active", t)).toBe("translated:status.active");
    expect(getStatusLabel("Unknown", t)).toBe("Unknown");
  });

  test("formatPolicyStep returns HOTP label and seconds label", () => {
    const t = (key: string) => key;
    expect(formatPolicyStep("HOTP", undefined, t)).toBe("policies.stepCounter");
    expect(formatPolicyStep("TOTP", 60, t)).toBe("60 units.seconds");
  });
});
