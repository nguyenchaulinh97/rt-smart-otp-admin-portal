"use client";

import { useRouter } from "next/navigation";
import UserForm from "@/components/UserForm";
import { useI18n } from "@/hooks/useI18n";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { otpService } from "@/services/otpService";

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
        username: "",
        name: "",
        email: "",
        cif: "",
        type: "",
      }}
      onCancel={() => router.push("/users")}
      onSubmit={async (values) => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmSave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        await otpService.createUser({
          user_id: values.id,
          cif: values.cif,
          username: values.username,
          email: values.email,
          name: values.name,
        });
        if (values.type) {
          await otpService.updateUserType(values.id, values.type);
        }
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push("/users");
      }}
    />
  );
}
