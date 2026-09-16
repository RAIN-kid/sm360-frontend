"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, FileText, Settings, Shield, LogOut, Building2, Truck 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/super-admin" },
  { name: "LGAs", icon: Building2, path: "/super-admin/lgas" }, 
  { name: "Companies", icon: Truck, path: "/super-admin/companies" }, 
  { name: "Reports", icon: FileText, path: "/super-admin/reports" },
  { name: "Settings", icon: Settings, path: "/super-admin/settings" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("sm360_token");
    localStorage.removeItem("sm360_user");
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
          <span className="text-sidebar font-bold text-xl">S</span>
        </div>
        <span className="text-2xl font-bold tracking-wider">SM360</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <span className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? "text-white font-bold" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={isActive ? "text-white" : "text-white/60"} />
                  <span>{item.name}</span>
                </div>
                {isActive && <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Kitufe cha Logout Kimesafishwa (Text tu, hakuna background) */}
      <div className="mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-400 hover:text-red-500 bg-transparent px-4 py-3 transition-colors outline-none font-semibold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 md:bg-background p-0 md:p-4 gap-4 overflow-hidden relative">
      {/* SIDEBAR (Desktop Tu) */}
      <aside className="hidden md:block rounded-3xl overflow-hidden shadow-xl">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col bg-gray-50 md:bg-card rounded-none md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* HEADER (Desktop Tu) - Kwenye simu Header inakaa kwenye page yenyewe */}
        <header className="hidden md:flex items-center justify-between p-8 border-b border-gray-100 sticky top-0 z-20 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Super Admin</h1>
            <p className="text-gray-500 text-sm mt-1">God Mode - System Overview</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            SM
          </div>
        </header>

        {/* CONTENT AREA (Padding kwenye simu ipo sifuri ili rangi ipige mpaka juu) */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-8 md:p-8 hide-scrollbar relative z-10">
          {children}
        </div>

        {/* BOTTOM NAVIGATION (Simu Tu) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 pb-6">
          <Link href="/super-admin"><button className={`flex flex-col items-center gap-1 outline-none ${pathname === '/super-admin' ? 'text-primary' : 'text-gray-400'}`}><LayoutDashboard size={24} /><span className="text-[10px] font-bold">Dash</span></button></Link>
          <Link href="/super-admin/lgas"><button className={`flex flex-col items-center gap-1 outline-none ${pathname === '/super-admin/lgas' ? 'text-primary' : 'text-gray-400'}`}><Building2 size={24} /><span className="text-[10px] font-bold">LGAs</span></button></Link>
          <Link href="/super-admin/companies"><button className={`flex flex-col items-center gap-1 outline-none ${pathname === '/super-admin/companies' ? 'text-primary' : 'text-gray-400'}`}><Truck size={24} /><span className="text-[10px] font-bold">Comps</span></button></Link>
          <Link href="/super-admin/settings"><button className={`flex flex-col items-center gap-1 outline-none ${pathname === '/super-admin/settings' ? 'text-primary' : 'text-gray-400'}`}><Settings size={24} /><span className="text-[10px] font-bold">Settings</span></button></Link>
        </div>

      </main>
    </div>
  );
}