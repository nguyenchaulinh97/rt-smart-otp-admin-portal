"use client";

import DataTable from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import {
  adminService,
  type AdminDto,
  type CreateAdminInput,
  type UpdateAdminInput,
} from "@/services/adminService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Space } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApiQuery } from "@/services/api";

const getAdminId = (row: AdminDto) => String(row.id ?? row.admin_id ?? row._id ?? "");

export default function AdminsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDto | null>(null);

  const [createForm] = Form.useForm<CreateAdminInput>();
  const [resetForm] = Form.useForm<UpdateAdminInput>();

  const { data, isLoading, error, refetch } = useApiQuery<{
    data?: AdminDto[];
    result?: AdminDto[];
    items?: AdminDto[];
  }>(["admins", "list"], "/admin?limit=200&offset=0");
  const rows = useMemo(() => {
    if (Array.isArray(data)) return data;
    const list = data?.data ?? data?.result ?? data?.items ?? [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const filteredRows = rows.filter((row) => {
    if (!searchValue) return true;
    const username = String(row.username ?? "");
    return username.toLowerCase().includes(searchValue.toLowerCase());
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateAdminInput) => adminService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminInput }) =>
      adminService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const onCreate = async () => {
    const values = await createForm.validateFields();
    await createMutation.mutateAsync({
      username: values.username,
      password: values.password,
      created_by: values.created_by || "admin-portal",
    });
    toast({ variant: "success", message: t("admins.toastCreated") });
    setCreateOpen(false);
    createForm.resetFields();
  };

  const onOpenReset = (row: AdminDto) => {
    setSelectedAdmin(row);
    resetForm.resetFields();
    setResetOpen(true);
  };

  const onResetPassword = async () => {
    const values = await resetForm.validateFields();
    const id = selectedAdmin ? getAdminId(selectedAdmin) : "";
    if (!id) return;
    await resetMutation.mutateAsync({ id, input: { password: values.password } });
    toast({ variant: "success", message: t("admins.toastUpdated") });
    setResetOpen(false);
    setSelectedAdmin(null);
    resetForm.resetFields();
  };

  const onDelete = async (row: AdminDto) => {
    const id = getAdminId(row);
    if (!id) return;
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("admins.confirmDelete"),
      confirmLabel: t("ui.confirm"),
      variant: "danger",
    });
    if (!accepted) return;
    await deleteMutation.mutateAsync(id);
    toast({ variant: "success", message: t("admins.toastDeleted") });
  };

  return (
    <div className="space-y-6">
      <DataTable
        title={t("admins.tableTitle")}
        description={t("admins.tableSubtitle")}
        ctaLabel={t("admins.create")}
        onCtaClick={() => setCreateOpen(true)}
        enableSearch
        searchPlaceholder={t("admins.search")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        columns={[
          {
            key: "id",
            header: t("admins.id"),
            render: (row) => (
              <Link
                href={`/admins/${getAdminId(row)}`}
                className="font-medium text-slate-900 hover:text-slate-700"
              >
                {getAdminId(row) || "-"}
              </Link>
            ),
            sortValue: (row) => getAdminId(row),
          },
          {
            key: "username",
            header: t("admins.username"),
            render: (row) => String(row.username ?? "-"),
            sortValue: (row) => String(row.username ?? ""),
          },
          {
            key: "created_by",
            header: t("admins.createdBy"),
            render: (row) => String(row.created_by ?? "-"),
            sortValue: (row) => String(row.created_by ?? ""),
          },
          {
            key: "actions",
            header: t("admins.actions"),
            render: (row) => (
              <Space size="middle">
                <Button size="small" onClick={() => onOpenReset(row)} disabled={!getAdminId(row)}>
                  {t("admins.resetPassword")}
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onDelete(row)}
                  disabled={!getAdminId(row)}
                >
                  {t("admins.delete")}
                </Button>
              </Space>
            ),
          },
        ]}
        rows={filteredRows}
        defaultSortKey="username"
        isLoading={isLoading}
        errorMessage={error ? t("table.error") : undefined}
        onRetry={error ? () => refetch() : undefined}
        enablePagination
        pageSize={10}
      />

      <Modal
        title={t("admins.createTitle")}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={onCreate}
        okText={t("ui.confirm")}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
        forceRender
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label={t("admins.username")}
            name="username"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input placeholder={t("placeholders.username")} autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={t("admins.password")}
            name="password"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>
          <Form.Item label={t("admins.createdBy")} name="created_by">
            <Input placeholder="admin-portal" autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("admins.resetTitle")}
        open={resetOpen}
        onCancel={() => {
          setResetOpen(false);
          setSelectedAdmin(null);
        }}
        onOk={onResetPassword}
        okText={t("ui.confirm")}
        confirmLoading={resetMutation.isPending}
        destroyOnHidden
        forceRender
      >
        <Form form={resetForm} layout="vertical">
          <Form.Item label={t("admins.username")}>
            <Input value={String(selectedAdmin?.username ?? "")} disabled />
          </Form.Item>
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
