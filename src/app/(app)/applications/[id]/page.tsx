"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingState from "@/components/LoadingState";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { applicationService, type ApplicationDto } from "@/services/applicationService";
import { useApiQuery } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const getAppId = (row: ApplicationDto) => String(row.id ?? row.app_id ?? row._id ?? "");

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useApiQuery<ApplicationDto | null>(
    ["applications", "detail", id],
    `/application/${encodeURIComponent(String(id))}`,
  );

  const deleteMutation = useMutation({
    mutationFn: () => applicationService.remove(String(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const onDelete = async () => {
    const accepted = await confirm({
      title: t("ui.confirmTitle"),
      message: t("applications.confirmDelete"),
      confirmLabel: t("ui.confirm"),
      variant: "danger",
    });
    if (!accepted) return;
    await deleteMutation.mutateAsync();
    toast({ variant: "success", message: t("applications.toastDeleted") });
    router.push("/applications");
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
          { label: t("applications.tableTitle"), href: "/applications" },
          { label: getAppId(data) || String(id) },
        ]}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-0!">
              {t("applications.detailTitle")}
            </p>
            <p className="text-xs text-slate-500 mb-0!">{t("applications.detailSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button danger onClick={onDelete}>
              {t("applications.delete")}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">{t("applications.id")}</p>
            <p className="text-slate-900 mb-0!">{getAppId(data) || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">
              {t("applications.version")}
            </p>
            <p className="text-slate-900 mb-0!">{String(data.version ?? "-")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">
              {t("applications.aidType")}
            </p>
            <p className="text-slate-900 mb-0!">{String(data.aid_type ?? "-")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1!">{t("applications.status")}</p>
            <p className="text-slate-900 mb-0!">{String(data.status ?? "-")}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/applications"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            {t("ui.back")}
          </Link>
        </div>
      </section>
    </div>
  );
}

