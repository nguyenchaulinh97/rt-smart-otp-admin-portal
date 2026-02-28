"use client";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Drawer } from "antd";
import { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <AuthGuard>
        {/* Desktop layout */}
        <div className="hidden md:flex">
          <Sidebar collapsed={sidebarCollapsed} onCollapse={(c) => setSidebarCollapsed(c)} />
          <div className="flex flex-1 flex-col min-h-screen min-w-0">
            <TopBar
              onOpenMobile={() => setDrawerOpen(true)}
              onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
            />
            <main className="flex-1 overflow-auto px-4 py-4 min-w-0">{children}</main>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col md:hidden">
          <TopBar
            onOpenMobile={() => setDrawerOpen(true)}
            onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
          />
          <main className="flex-1 overflow-auto px-4 py-4 min-w-0">{children}</main>
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            className="app-sidebar-drawer"
            rootClassName="app-sidebar-drawer-root"
            closable={false}
            styles={{ body: { padding: 0 } }}
            size={280}
          >
            <Sidebar plain onNavigate={() => setDrawerOpen(false)} />
          </Drawer>
        </div>
      </AuthGuard>
    </div>
  );
}
