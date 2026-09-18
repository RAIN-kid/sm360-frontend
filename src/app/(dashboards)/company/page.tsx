"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Truck, ShieldCheck, Users, Wallet, MoreHorizontal, 
  Building2, Route, CheckCircle2, TrendingUp, Loader2 
} from "lucide-react";

export default function CompanyDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalTrucks: 0,
    contractedLgas: 0,
    activeDrivers: 0,
    totalEarnings: 0
  });
  const [contracts, setContracts] = useState<any[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }

      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Pata Profile/Context ya Company
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const companyId = profileRes.data.data.organization_id;

      // 2. Vuta Data LIVE kutoka kwenye API mpya tuliyotengeneza Backend
      const response = await axios.get(`${url}/api/super-admin/dashboard-metrics?company_id=${companyId}`, config);
      const dashboardData = response.data.data;

      // 3. Weka Data Halisi (Sio Mocks Tena)
      setMetrics({
        totalTrucks: dashboardData.metrics?.totalTrucks || 0,
        activeDrivers: dashboardData.metrics?.activeDrivers || 0,
        contractedLgas: dashboardData.metrics?.contractedLgas || 0,
        totalEarnings: dashboardData.metrics?.totalEarnings || 0
      });

      setContracts(dashboardData.contracts || []);
      setRecentRoutes(dashboardData.recentRoutes || []);

    } catch (error) {
      console.error("Failed to load company dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `TZS ${(amount / 1000000).toFixed(1)}M`;
    return `TZS ${new Intl.NumberFormat('sw-TZ').format(amount)}`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* KICHWA CHA HABARI */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Operations Overview</h2>
        <p className="text-gray-500 text-sm mt-1">High-level summary of your fleet, contracts, and revenue</p>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        
        {/* Card 1: Total Fleet */}
        <div className="bg-white rounded-[1.25rem] p-4 md:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Truck className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Registered Fleet</p>
            <h3 className="text-xl md:text-3xl font-bold text-gray-900">{metrics.totalTrucks}</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1">Active Trucks</p>
          </div>
        </div>

        {/* Card 2: Contracted LGAs */}
        <div className="bg-white rounded-[1.25rem] p-4 md:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Contracted LGAs</p>
            <h3 className="text-xl md:text-3xl font-bold text-gray-900">{metrics.contractedLgas}</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1">Kinondoni & Ilala</p>
          </div>
        </div>

        {/* Card 3: Total Drivers */}
        <div className="bg-white rounded-[1.25rem] p-4 md:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Active Drivers</p>
            <h3 className="text-xl md:text-3xl font-bold text-gray-900">{metrics.activeDrivers}</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1">Ready for deployment</p>
          </div>
        </div>

        {/* Card 4: Total Earnings */}
        <div className="bg-emerald-600 rounded-[1.25rem] p-4 md:p-5 shadow-[0_4px_14px_rgba(5,150,105,0.2)] border border-emerald-500 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-50 text-xs md:text-sm font-medium mb-1">Total Earnings</p>
            <h3 className="text-xl md:text-3xl font-bold text-white">{formatCurrency(metrics.totalEarnings)}</h3>
            <p className="text-[10px] md:text-xs text-emerald-100 mt-1">All time payouts</p>
          </div>
        </div>

      </div>

      {/* SEHEMU YA CHINI: LGA CONTRACS & RECENT ROUTES */}
      <div className="grid gap-5 md:grid-cols-7">
        
        {/* Contracted LGAs (Col-span 4) */}
        <div className="md:col-span-4 bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-primary" size={18} /> Active LGA Contracts
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-white border-b border-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Council Name</th>
                  <th className="px-5 py-3 font-semibold">Assigned Zones</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {contracts.map((contract, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900 flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" /> {contract.lga_name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{contract.zones} Zones</td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{contract.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Completed Routes (Col-span 3) */}
        <div className="md:col-span-3 bg-white rounded-[1.5rem] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Recent Completed Routes</h3>
            <button className="text-xs font-semibold text-primary hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentRoutes.map((route, idx) => (
              <div key={idx} className="flex items-start justify-between group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="text-emerald-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{route.name}</p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Truck size={10} /> {route.truck} • {route.driver}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">{route.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}