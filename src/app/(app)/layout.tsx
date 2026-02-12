import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import UiProvider from "@/providers/UiProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AuthGuard>
          <UiProvider>
            <Sidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <TopBar />
              <main className="flex-1 px-4 py-4">{children}</main>
            </div>
          </UiProvider>
        </AuthGuard>
      </div>
    </div>
  );
}
