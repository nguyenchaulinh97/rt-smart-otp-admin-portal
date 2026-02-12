"use client";

import { useI18n } from "@/hooks/useI18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("dashboard.activeUsers"), value: "1,248" },
          { label: t("dashboard.activeTokens"), value: "3,921" },
          { label: t("dashboard.lockedTokens"), value: "24" },
          { label: t("dashboard.failRate"), value: "1.8%" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">{t("dashboard.recentActivity")}</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{t("dashboard.activity1")}</span>
              <span className="font-medium text-emerald-600">{t("dashboard.success")}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{t("dashboard.activity2")}</span>
              <span className="font-medium text-rose-600">{t("dashboard.fail")}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{t("dashboard.activity3")}</span>
              <span className="font-medium text-emerald-600">{t("dashboard.success")}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">{t("dashboard.pendingActions")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>{t("dashboard.pendingUnlocks")}</li>
            <li>{t("dashboard.pendingPolicy")}</li>
            <li>{t("dashboard.pendingEnroll")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
