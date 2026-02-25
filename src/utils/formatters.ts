import { STATUS_LABEL_KEYS, type StatusKey } from "@/constants/status";

export type Translator = (key: string) => string;

const toDate = (value: string) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  if (/^\d{4}-\d{2}-\d{2} /.test(value)) {
    return new Date(value.replace(" ", "T"));
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const formatDate = (value: string, locale: string) => {
  const date = toDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export const formatDateTime = (value: string, locale: string) => {
  const date = toDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale).format(value);

export const getStatusLabel = (value: string, t: Translator) => {
  const key = STATUS_LABEL_KEYS[value as StatusKey];
  return key ? t(key) : value;
};

export const getStatusColor = (value: string) => {
  switch (value) {
    case "Active":
    case "SUCCESS":
      return "green";
    case "Locked":
    case "FAIL":
    case "Revoked":
    case "Expired":
      return "red";
    case "Inactive":
    case "Paused":
    case "Draft":
      return "gold";
    default:
      return "default";
  }
};

export const formatPolicyStep = (type: string, stepSeconds: number | undefined, t: Translator) => {
  if (type === "HOTP") {
    return t("policies.stepCounter");
  }
  const seconds = stepSeconds ?? 30;
  return `${seconds} ${t("units.seconds")}`;
};
