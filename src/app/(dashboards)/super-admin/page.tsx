"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Wallet, Building2, Truck, Users, MoreHorizontal, Loader2 } from "lucide-react";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    propertiesCount: 0,
    companiesCount: 0,
    lgasCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

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
      
      // HAPA NDIPO NILIPOREKEBISHA - Inasoma ile endpoint yako sahihi
      const res = await axios.get(`${url}/api/super-admin/dashboard-metrics`, config);
      const data = res.data?.data || {}; 
      
      setStats({
        totalRevenue: data.totalRevenue || 0,
        propertiesCount: data.propertiesCount || 0,
        companiesCount: data.companiesCount || 0,
        lgasCount: data.lgasCount || 0
      });
      
      setRecentTransactions(data.recentTransactions || []);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    if (!amount) return "0";
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return amount.toLocaleString();
  };

  const getInitials = (name: string) => {
    if (!name) return "LGA";
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* METRICS CARDS (Namba ndogo, Hakuna vimshale vya asilimia, HAKUNA VIVULI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        
        {/* Card 1: Revenue (Pesa ya SM360) */}
        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600 outline-none"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">SM360 Revenue</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">TZS {formatMoney(stats.totalRevenue)}</h3>
          </div>
        </div>

        {/* Card 2: Active Properties */}
        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600 outline-none"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Active Properties</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stats.propertiesCount.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Contractors */}
        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600 outline-none"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Contractors</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stats.companiesCount.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 4: LGAs */}
        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600 outline-none"><MoreHorizontal size={18}/></button>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Onboarded LGAs</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stats.lgasCount.toLocaleString()}</h3>
          </div>
        </div>

      </div>

      {/* SEHEMU YA CHATI NA MIAMALA - HAKUNA VIVULI */}
      <div className="grid gap-5 md:grid-cols-7">
        
        {/* Graph Placeholder (Col-span 4) */}
        <div className="md:col-span-4 bg-white rounded-[1.5rem] p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
            <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">2026</span>
          </div>
          
          <div className="h-[250px] w-full bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <p className="text-sm font-medium">Interactive Chart Ready for Integration</p>
          </div>
        </div>
        
        {/* Recent Transactions (Col-span 3) */}
        <div className="md:col-span-3 bg-white rounded-[1.5rem] p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Revenue</h3>
            <button className="text-sm font-semibold text-emerald-600 hover:underline outline-none">View All</button>
          </div>
          
          <div className="space-y-5">
            {recentTransactions.length > 0 ? recentTransactions.map((trx, idx) => {
              const bgColors = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700'];
              const colorClass = bgColors[idx % bgColors.length];

              return (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                      <span className="font-bold text-xs">{getInitials(trx.lga_name)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate w-32 md:w-40">{trx.lga_name || "Unknown LGA"}</p>
                      <p className="text-[10px] font-mono text-gray-500">{trx.control_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">+TZS {Number(trx.sm360_fee || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(trx.transaction_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-10 text-sm text-gray-500 font-medium">No revenue collected yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}