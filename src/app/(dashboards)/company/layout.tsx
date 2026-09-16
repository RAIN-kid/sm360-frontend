"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { 
  LayoutDashboard, Truck, Users, Route, Wallet, Settings, LogOut, Menu 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const companyMenuItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/company" },
  { name: "Fleet (Trucks)", icon: Truck, path: "/company/fleet" },
  { name: "Drivers", icon: Users, path: "/company/drivers" },
  { name: "Active Routes", icon: Route, path: "/company/routes" },
  { name: "Earnings", icon: Wallet, path: "/company/earnings" },
  { name: "Settings", icon: Settings, path: "/company/settings" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<{name: string, company: string}>({ name: "Admin", company: "Company Name" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) return;
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const data = res.data.data;
      setProfile({
        name: data.full_name,
        company: data.lga_name || "Private Company" // Inaweka jina la Kampuni (au LGA) hapa
      });
    } catch (error) {
      console.log("Error loading profile", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sm360_token");
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 p-6">
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-white font-bold text-xl">
            {profile.company.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight truncate w-36" title={profile.company}>
            {profile.company}
          </h2>
          <p className="text-[10px] text-white/60 uppercase tracking-widest">Operations</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {companyMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}>
              <span className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "text-white font-bold" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={isActive ? "text-white" : "text-white/60"} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl outline-none"
        >
          <LogOut size={16} />
          <span className="font-semibold text-sm">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background p-0 md:p-4 gap-4 overflow-hidden">
      <aside className="hidden md:block rounded-3xl overflow-hidden shadow-xl">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col bg-card rounded-none md:rounded-3xl shadow-xl overflow-hidden">
        <header className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="p-2 text-primary hover:bg-gray-100 rounded-md transition-colors outline-none flex items-center justify-center">
                  <Menu size={24} />
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-none w-64 bg-sidebar">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-gray-900">Operations Desk</h1>
              <p className="text-gray-500 text-sm mt-1">Manage fleet, drivers, and daily routes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-2">
              <p className="text-sm font-bold text-gray-900">{profile.name}</p>
              <p className="text-xs text-blue-600 font-medium">Company Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
              {profile.name.substring(0, 2)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-card text-card-foreground">
          {children}
        </div>
      </main>
    </div>
  );
}