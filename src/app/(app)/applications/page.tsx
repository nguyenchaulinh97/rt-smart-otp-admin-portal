"use client";

import DataTable from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import {
  applicationService,
  type ApplicationDto,
  type CreateApplicationInput,
  type UpdateApplicationInput,
} from "@/services/applicationService";
import { useApiQuery } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Select, Space } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";

const getAppId = (row: ApplicationDto) => String(row.id ?? row.app_id ?? row._id ?? "");

export default function ApplicationsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<ApplicationDto | null>(null);

  const [createForm] = Form.useForm<CreateApplicationInput>();
  const [editForm] = Form.useForm<UpdateApplicationInput>();

  const { data, isLoading, error, refetch } = useApiQuery<ApplicationDto[]>(
    ["applications", "list"],
    "/application?limit=200&offset=0",
  );
  const rows = useMemo(() => data ?? [], [data]);

  const filteredRows = rows.filter((row) => {
    if (!searchValue) return true;
    const id = getAppId(row);
    const version = String(row.version ?? "");
    return (
      id.toLowerCase().includes(searchValue.toLowerCase()) ||
      version.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateApplicationInput) => applicationService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateApplicationInput }) =>
      applicationService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const onCreate = async () => {
    const values = await createForm.validateFields();
    await createMutation.mutateAsync(values);
    toast({ variant: "success", message: t("applications.toastCreated") });
    setCreateOpen(false);
    createForm.resetFields();
  };

  const onOpenEdit = (row: ApplicationDto) => {
    setSelected(row);
    editForm.setFieldsValue({
      version: row.version ?? "",
      aid_type: row.aid_type ?? "",
      status: row.status ?? "",
    });
    setEditOpen(true);
  };

  const onEdit = async () => {
    const values = await editForm.validateFields();
    const id = selected ? getAppId(selected) : "";
    if (!id) return;
    await updateMutation.mutateAsync({ id, input: values });
    toast({ variant: "success", message: t("applications.toastUpdated") });
    setEditOpen(false);
    setSelected(null);
    editForm.resetFields();
  };

  const onDelete = async (row: ApplicationDto) => {
    const id = getAppId(row);
    if (!id) return;
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("applications.confirmDelete"),
      confirmLabel: t("ui.confirm"),
      variant: "danger",
    });
    if (!accepted) return;
    await deleteMutation.mutateAsync(id);
    toast({ variant: "success", message: t("applications.toastDeleted") });
  };

  return (
    <div className="space-y-6">
      <DataTable
        title={t("applications.tableTitle")}
        description={t("applications.tableSubtitle")}
        ctaLabel={t("applications.create")}
        onCtaClick={() => setCreateOpen(true)}
        enableSearch
        searchPlaceholder={t("applications.search")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        columns={[
          {
            key: "id",
            header: t("applications.id"),
            render: (row) => (
              <Link
                href={`/applications/${getAppId(row)}`}
                className="font-medium text-slate-900 hover:text-slate-700"
              >
                {getAppId(row) || "-"}
              </Link>
            ),
            sortValue: (row) => getAppId(row),
          },
          {
            key: "version",
            header: t("applications.version"),
            render: (row) => String(row.version ?? "-"),
            sortValue: (row) => String(row.version ?? ""),
          },
          {
            key: "aid_type",
            header: t("applications.aidType"),
            render: (row) => String(row.aid_type ?? "-"),
            sortValue: (row) => String(row.aid_type ?? ""),
          },
          {
            key: "status",
            header: t("applications.status"),
            render: (row) => String(row.status ?? "-"),
            sortValue: (row) => String(row.status ?? ""),
          },
          {
            key: "actions",
            header: t("applications.actions"),
            render: (row) => (
              <Space size="middle">
                <Button size="small" onClick={() => onOpenEdit(row)} disabled={!getAppId(row)}>
                  {t("applications.edit")}
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onDelete(row)}
                  disabled={!getAppId(row)}
                >
                  {t("applications.delete")}
                </Button>
              </Space>
            ),
          },
        ]}
        rows={filteredRows}
        defaultSortKey="version"
        isLoading={isLoading}
        errorMessage={error ? t("table.error") : undefined}
        onRetry={error ? () => refetch() : undefined}
        enablePagination
        pageSize={10}
      />

      <Modal
        title={t("applications.createTitle")}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={onCreate}
        okText={t("ui.confirm")}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ status: "active", aid_type: "web" }}
        >
          <Form.Item
            label={t("applications.version")}
            name="version"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input placeholder="1.0.0" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={t("applications.aidType")}
            name="aid_type"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input placeholder="web" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={t("applications.status")}
            name="status"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Select
              options={[
                { label: "active", value: "active" },
                { label: "inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("applications.editTitle")}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        onOk={onEdit}
        okText={t("ui.confirm")}
        confirmLoading={updateMutation.isPending}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label={t("applications.id")}>
            <Input value={getAppId((selected ?? {}) as ApplicationDto)} disabled />
          </Form.Item>
          <Form.Item
            label={t("applications.version")}
            name="version"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input placeholder="1.0.1" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={t("applications.aidType")}
            name="aid_type"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Input placeholder="web" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={t("applications.status")}
            name="status"
            rules={[{ required: true, message: t("forms.required") }]}
          >
            <Select
              options={[
                { label: "active", value: "active" },
                { label: "inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
