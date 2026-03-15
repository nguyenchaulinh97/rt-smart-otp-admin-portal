"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { adminService, type AdminDto, type UpdateAdminInput } from "@/services/adminService";
import { useApiQuery } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const getAdminId = (row: AdminDto) => String(row.id ?? row.admin_id ?? row._id ?? "");

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm] = Form.useForm<UpdateAdminInput>();

  const { data, isLoading, error, refetch } = useApiQuery<AdminDto | null>(
    ["admins", "detail", id],
    `/admin/${encodeURIComponent(String(id))}`,
  );

  const resetMutation = useMutation({
    mutationFn: (input: UpdateAdminInput) => adminService.update(String(id), input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminService.remove(String(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const onResetPassword = async () => {
    const values = await resetForm.validateFields();
    await resetMutation.mutateAsync({ password: values.password });
    toast({ variant: "success", message: t("admins.toastUpdated") });
    setResetOpen(false);
    resetForm.resetFields();
  };

  const onDelete = async () => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("admins.confirmDelete"),
      confirmLabel: t("ui.confirm"),
      variant: "danger",
    });
    if (!accepted) return;
    await deleteMutation.mutateAsync();
    toast({ variant: "success", message: t("admins.toastDeleted") });
    router.push("/admins");
  };

  if (isLoading) return <LoadingState />;
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

  if (!data) return <div className="text-sm text-slate-500">{t("table.empty")}</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("admins.tableTitle"), href: "/admins" },
          { label: data.username ?? getAdminId(data) ?? String(id) },
        ]}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-0!">{t("admins.detailTitle")}</p>
            <p className="text-xs text-slate-500 mb-0!">{t("admins.detailSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setResetOpen(true)}>{t("admins.resetPassword")}</Button>
            <Button danger onClick={onDelete}>
              {t("admins.delete")}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">{t("admins.id")}</p>
            <p className="text-slate-900 mb-0!">{getAdminId(data) || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">{t("admins.username")}</p>
            <p className="text-slate-900 mb-0!">{String(data.username ?? "-")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">{t("admins.createdBy")}</p>
            <p className="text-slate-900 mb-0!">{String(data.created_by ?? "-")}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/admins" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
            {t("ui.back")}
          </Link>
        </div>
      </section>

      <Modal
        title={t("admins.resetTitle")}
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onOk={onResetPassword}
        okText={t("ui.confirm")}
        confirmLoading={resetMutation.isPending}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical">
          <Form.Item
            label={t("admins.newPassword")}
            name="password"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

