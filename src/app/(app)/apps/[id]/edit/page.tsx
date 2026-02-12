"use client";

import AppForm from "@/components/AppForm";
import LoadingState from "@/components/LoadingState";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useMockQuery } from "@/hooks/useMockQuery";
import { useToast } from "@/hooks/useToast";
import { type AppRecord, type PolicyRecord } from "@/mock/api";
import { otpService } from "@/services/otpService";
import { Button } from "antd";
import { useParams, useRouter } from "next/navigation";

export default function AppEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, isLoading, error, refetch } = useMockQuery<AppRecord | null>(() =>
    otpService.getApp(String(id)),
  );
  const { data: policies } = useMockQuery<PolicyRecord[]>(() => otpService.getPolicies());
  const policyOptions = (policies ?? []).map((policy) => policy.name);

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

  return (
    <AppForm
      title={t("apps.editTitle")}
      disableId
      policyOptions={policyOptions}
      initialValues={{
        id: data.id,
        name: data.name,
        policy: data.policy,
        status: data.status,
      }}
      onCancel={() => router.push(`/apps/${data.id}`)}
      onSubmit={async () => {
        const accepted = await confirm({
          title: t("ui.confirmTitle"),
          message: t("ui.confirmSave"),
          confirmLabel: t("ui.confirm"),
        });
        if (!accepted) return;
        toast({ variant: "success", message: t("ui.toastSaved") });
        router.push(`/apps/${data.id}`);
      }}
    />
  );
}
