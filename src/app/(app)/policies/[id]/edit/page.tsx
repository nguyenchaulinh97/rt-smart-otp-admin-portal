"use client";

import LoadingState from "@/components/LoadingState";
import PolicyForm from "@/components/PolicyForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { canAccess } from "@/lib/rbac";
import { otpService } from "@/services/otpService";
import { Button } from "antd";
import { useParams, useRouter } from "next/navigation";

export default function PolicyEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();
  const { role } = useRole();
  const { data, isLoading, error, refetch } = useMockQuery(() => otpService.getPolicy(String(id)));

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

  const isReadOnly = !canAccess(role, "policies:edit");

  return (
    <PolicyForm
      title={t("policies.editTitle")}
      initialValues={{
        name: data.name,
        type: data.type,
        digits: String(data.digits),
        stepSeconds: data.stepSeconds ? String(data.stepSeconds) : "",
        window: data.window ? String(data.window) : "",
        algorithm: data.algorithm,
        status: data.status,
      }}
      isReadOnly={isReadOnly}
      disabledReason={t("ui.permissionDenied")}
      onCancel={() => router.push(`/policies/${data.id}`)}
      onSubmit={async () => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmPolicySave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push(`/policies/${data.id}`);
      }}
    />
  );
}
