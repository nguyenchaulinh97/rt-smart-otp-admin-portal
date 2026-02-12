"use client";

import { useRouter } from "next/navigation";
import UserForm from "@/components/UserForm";
import { useI18n } from "@/hooks/useI18n";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

export default function UserCreatePage() {
  const { t } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();

  return (
    <UserForm
      title={t("users.createTitle")}
      initialValues={{
        id: "",
        name: "",
        email: "",
        appId: "",
        group: "",
        status: "Active",
      }}
      onCancel={() => router.push("/users")}
      onSubmit={async () => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmSave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push("/users");
      }}
    />
  );
}
