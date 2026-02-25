"use client";

import { useProfile } from "@/hooks/useProfile";

export default function AdminProfilePage() {
  const { data, isLoading, error, refetch } = useProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 rounded-xl border bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Admin Profile</h2>
      {data ? (
        <div>
          <p className="text-sm">
            Username: {String((data as any).username ?? (data as any).user)}
          </p>
          <p className="text-sm">
            Admin ID: {String((data as any).admin_id ?? (data as any).id ?? "-")}
          </p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-sky-600">
            Refresh
          </button>
        </div>
      ) : (
        <pre className="bg-slate-100 p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
