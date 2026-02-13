"use client";

import PolicyForm from "@/components/PolicyForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function PolicyCreatePage() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();

  return (
    <PolicyForm
      title={t("policies.createTitle")}
      initialValues={{
        name: "",
        type: "TOTP",
        digits: "6",
        stepSeconds: "30",
        window: "1",
        algorithm: "SHA1",
        status: "Draft",
      }}
      onCancel={() => router.push("/policies")}
      onSubmit={async () => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmPolicySave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push("/policies");
      }}
    />
  );
}
