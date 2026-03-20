export const downloadCsv = (filename: string, rows: Array<Record<string, string | number>>) => {
  if (globalThis.window === undefined) return;
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => {
    const raw = String(value ?? "");
    return `"${raw.replaceAll('"', '""')}"`;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
