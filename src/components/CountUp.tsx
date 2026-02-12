"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  end: number | string;
  duration?: number; // ms
  format?: (v: number | string) => string | number;
};

export default function CountUp({ end, duration = 800, format }: CountUpProps) {
  const [value, setValue] = useState<number>(typeof end === "number" ? 0 : 0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const startValue = 0;
  const target = typeof end === "number" ? end : Number(String(end).replace(/,/g, "")) || 0;

  useEffect(() => {
    const id = setTimeout(() => setValue(startValue), 0);
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const current = Math.round(startValue + (target - startValue) * progress);
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      clearTimeout(id);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, target]);

  if (typeof end === "string") {
    // if original was formatted, try to preserve commas
    const formatted = value.toLocaleString();
    return <>{format ? format(formatted) : formatted}</>;
  }

  return <>{format ? format(value) : value}</>;
}
