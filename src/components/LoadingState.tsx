"use client";

import { Skeleton } from "antd";

type LoadingStateProps = {
  rows?: number;
};

export default function LoadingState({ rows = 4 }: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <Skeleton active title paragraph={{ rows }} />
    </div>
  );
}
