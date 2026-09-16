"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Download, Filter, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Loader2 } from "lucide-react";

export default function FinancialReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    platformRevenue: 0,
    pendingLgaPayouts: 0
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }
      
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Hii API tutaitengeneza kule Backend
      const res = await axios.get(`${url}/api/super-admin/platform-revenues`, config);
      const data = res.data.data || [];
      
      setTransactions(data);

      let volume = 0;
      let revenue = 0;
      let pendingLga = 0;

      data.forEach((trx: any) => {
        volume += Number(trx.total_collected);
        revenue += Number(trx.sm360_fee);
        pendingLga += Number(trx.lga_amount);
      });

      setStats({
        totalVolume: volume,
        platformRevenue: revenue,
        pendingLgaPayouts: pendingLga
      });

    } catch (error) {
      console.error("Failed to load reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return amount.toString();
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Reports</h2>
          <p className="text-gray-500 text-sm mt-1">Platform revenue, commissions, and transaction logs</p>
        </div>
        <div className="flex items-center gap-3">
          {/* HAKUNA SHADOWS HAPA */}
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors outline-none">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 transition-colors outline-none border-none">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards - HAKUNA SHADOWS KABISA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Processed Volume */}
        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Total Volume Processed</p>
          <h3 className="text-2xl font-bold text-gray-900">TZS {formatMoney(stats.totalVolume)}</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> System Lifetime Gross
          </p>
        </div>

        {/* SM360 Commission (The 10%) */}
        <div className="bg-emerald-600 rounded-[1.25rem] p-5 border border-emerald-600 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">10% Platform Fee</span>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-50 text-sm font-medium mb-1">SM360 Revenue (Commission)</p>
            <h3 className="text-2xl font-bold text-white">TZS {formatMoney(stats.platformRevenue)}</h3>
            <p className="text-xs text-emerald-100 mt-2 font-medium">Auto-deducted at source</p>
          </div>
        </div>

        {/* Pending Payouts to LGAs */}
        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">LGA Gross Allocation (90%)</p>
          <h3 className="text-2xl font-bold text-gray-900">TZS {formatMoney(stats.pendingLgaPayouts)}</h3>
          <p className="text-xs text-orange-600 font-bold mt-2">
            Funds routed to LGAs
          </p>
        </div>

      </div>

      {/* Transaction Log Table - HAKUNA SHADOW */}
      <div className="bg-white rounded-[1.25rem] border border-gray-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900">Recent Platform Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Control / Ref No.</th>
                <th className="px-5 py-3 font-semibold">Source (LGA)</th>
                <th className="px-5 py-3 font-semibold">Total Amount</th>
                <th className="px-5 py-3 font-semibold">SM360 Cut (10%)</th>
                <th className="px-5 py-3 font-semibold">Date & Time</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              
              {transactions.length > 0 ? transactions.map((trx, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{trx.control_number}</td>
                  <td className="px-5 py-3 text-gray-600 font-medium">{trx.lga_name}</td>
                  <td className="px-5 py-3 text-gray-900 font-bold">TZS {Number(trx.total_collected).toLocaleString()}</td>
                  <td className="px-5 py-3 text-emerald-600 font-black">+TZS {Number(trx.sm360_fee).toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(trx.transaction_date).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">Cleared</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 font-medium">
                    No transactions collected yet.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}