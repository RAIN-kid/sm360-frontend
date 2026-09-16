"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Home, Users, Truck, Receipt, Settings, LogOut, Menu, Wallet 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const lgaMenuItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/lga" },
  { name: "Properties", icon: Home, path: "/lga/properties" },
  { name: "Field Agents", icon: Users, path: "/lga/agents" },
  { name: "Routes & Zones", icon: Truck, path: "/lga/routes" },
  { name: "Invoices & Revenue", icon: Receipt, path: "/lga/revenue" },
  { name: "Settlements & Payouts", icon: Wallet, path: "/lga/payouts" }, // <-- Nimeongeza hii tu
  { name: "Settings", icon: Settings, path: "/lga/settings" },
];

export default function LGALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);

  // Vuta taarifa za mtu aliyelogin
  useEffect(() => {
    const userStr = localStorage.getItem("sm360_user");
    if (!userStr) {
      router.push("/login");
    } else {
      setUserContext(JSON.parse(userStr));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "LG";
    return name.substring(0, 2).toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#004d2e] text-white w-64 p-6">
      {/* LGA Branding */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <span className="text-[#004d2e] font-bold text-xl">SM</span>
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight truncate w-32">{userContext?.lga_name || "LGA"}</h2>
          <p className="text-[10px] text-white/60 uppercase tracking-widest">Municipal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {lgaMenuItems.map((item) => {
          // ACTIVE STATE LOGIC ILIYOBORESHWA
          const isActive = item.path === "/lga" 
            ? pathname === "/lga" 
            : pathname.startsWith(item.path);

          return (
            <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}>
              <span className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
              }`}>
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={isActive ? "text-white" : "text-white/60"} />
                  <span>{item.name}</span>
                </div>
                {/* DOT YA KIJANI MBELE */}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start gap-3 bg-transparent text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl outline-none border-none font-bold"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 p-0 md:p-4 gap-4 overflow-hidden">
      <aside className="hidden md:block rounded-3xl overflow-hidden shadow-xl">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col bg-white rounded-none md:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <header className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="p-2 text-[#004d2e] hover:bg-gray-100 rounded-md transition-colors outline-none flex items-center justify-center">
                  <Menu size={24} />
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-none w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-gray-900">LGA Portal</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your municipal waste ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-2">
              <p className="text-sm font-bold text-gray-900">{userContext?.full_name || "Mkurugenzi"}</p>
              <p className="text-xs text-emerald-600 font-medium">LGA Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#004d2e]/10 flex items-center justify-center text-[#004d2e] font-bold border border-[#004d2e]/20 shadow-sm">
              {getInitials(userContext?.full_name)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/30 text-gray-900 relative">
          {children}
        </div>
      </main>
    </div>
  );
}