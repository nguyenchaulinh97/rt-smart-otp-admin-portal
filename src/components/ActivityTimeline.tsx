"use client";

import { Timeline } from "antd";

export type TimelineItem = {
  label: string;
  time: string;
};

type ActivityTimelineProps = {
  items: TimelineItem[];
};

export default function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) return null;
  return (
    <Timeline
      items={items.map((item) => ({
        content: (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-500">{item.time}</p>
          </div>
        ),
      }))}
    />
  );
}
