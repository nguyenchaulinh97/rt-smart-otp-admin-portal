"use client";

import LoadingState from "@/components/LoadingState";
import UserForm from "@/components/UserForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { type UserRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { Button } from "antd";
import { useParams, useRouter } from "next/navigation";

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const { role } = useRole();
  const { data, isLoading, error, refetch } = useMockQuery<UserRecord | null>(() =>
    otpService.getUser(String(id)),
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-2 text-sm text-rose-600">
        <p>{t("table.error")}</p>
        <Button type="default" size="small" danger onClick={() => refetch()}>
          {t("table.retry")}
        </Button>
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-slate-500">{t("table.empty")}</div>;
  }

  const canEditUser = canAccess(role, "users:edit");
  const isReadOnly = !canEditUser;

  return (
    <UserForm
      title={t("users.editTitle")}
      disableId
      isReadOnly={isReadOnly}
      disabledReason={t("ui.permissionDenied")}
      initialValues={{
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email,
        cif: data.cif,
        type: data.type ?? "",
      }}
      editableFields={canEditUser ? ["type"] : []}
      onCancel={() => router.push(`/users/${data.id}`)}
      onSubmit={async (values) => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmSave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        if (values.type) {
          await otpService.updateUserType(data.id, values.type);
        }
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push(`/users/${data.id}`);
      }}
    />
  );
}
