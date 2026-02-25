"use client";

import { Breadcrumb } from "antd";
import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb
      items={items.map((item) => ({
        title: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
      }))}
    />
  );
}
