"use client";

import { useRouter } from "next/navigation";
import AppForm from "@/components/AppForm";
import { useI18n } from "@/hooks/useI18n";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { useMockQuery } from "@/hooks/useMockQuery";
import { type PolicyRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";

export default function AppCreatePage() {
  const { t } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const { data } = useMockQuery<PolicyRecord[]>(() => otpService.getPolicies());
  const policyOptions = (data ?? []).map((policy) => policy.name);

  return (
    <AppForm
      title={t("apps.createTitle")}
      policyOptions={policyOptions}
      initialValues={{
        id: "",
        name: "",
        policy: "",
        status: "Active",
      }}
      onCancel={() => router.push("/apps")}
      onSubmit={async () => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmSave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push("/apps");
      }}
    />
  );
}
