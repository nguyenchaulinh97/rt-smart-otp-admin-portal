"use client";

import { useRouter } from "next/navigation";
import TokenProvisionForm from "@/components/TokenProvisionForm";
import { useI18n } from "@/hooks/useI18n";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { useMockQuery } from "@/hooks/useMockQuery";
import { type AppRecord, type PolicyRecord, type UserRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";

export default function TokenProvisionPage() {
  const { t } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: users } = useMockQuery<UserRecord[]>(() => otpService.getUsers());
  const { data: apps } = useMockQuery<AppRecord[]>(() => otpService.getApps());
  const { data: policies } = useMockQuery<PolicyRecord[]>(() => otpService.getPolicies());

  const userOptions = (users ?? []).map((user) => user.id);
  const appOptions = (apps ?? []).map((app) => app.id);
  const policyOptions = (policies ?? []).map((policy) => policy.name);

  return (
    <TokenProvisionForm
      title={t("tokens.provisionTitle")}
      userOptions={userOptions}
      appOptions={appOptions}
      policyOptions={policyOptions}
      onCancel={() => router.push("/tokens")}
      onSubmit={async () => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmSave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push("/tokens");
      }}
    />
  );
}
