import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Drawer } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useLogout from "../hooks/useLogout";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useLogout();

  return (
    <div className="flex h-full bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-0 border-r border-solid border-gray-100 lg:block">
        <Sidebar onLogout={logout} />
      </aside>

      {/* Mobile sidebar */}
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="left"
        width={272}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} onLogout={logout} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMenuOpen(true)} onLogout={logout} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
