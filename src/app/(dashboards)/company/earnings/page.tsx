"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, Filter, Download, Wallet, TrendingUp, CheckCircle2, Clock, Building2, ArrowUpRight, Building, Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CompanyEarningsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [bankDetails, setBankDetails] = useState({ bank_name: "", bank_account_name: "", bank_account_number: "" });
  const [payouts, setPayouts] = useState<any[]>([]);
  
  // Dashboard Stats
  const [stats, setStats] = useState({ totalCleared: 0, pendingLGA: 0, lifetimeValue: 0 });

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const cId = profileRes.data.data.organization_id || profileRes.data.data.lga_id;
      setCompanyId(cId);

      // Tunavuta taarifa za Kampuni (Ili tuone kama Bank ipo) na Payouts
      const [companyRes, payoutsRes] = await Promise.all([
        axios.get(`${url}/api/super-admin/organizations/${cId}`, config),
        axios.get(`${url}/api/super-admin/payouts?company_id=${cId}`, config).catch(() => ({ data: { data: [] } }))
      ]);

      const orgData = companyRes.data.data;
      if (orgData) {
        setBankDetails({
          bank_name: orgData.bank_name || "",
          bank_account_name: orgData.bank_account_name || "",
          bank_account_number: orgData.bank_account_number || ""
        });
      }

      const allPayouts = payoutsRes.data.data || [];
      setPayouts(allPayouts);

      // Piga hesabu za Dashboard
      let totalCleared = 0;
      let pendingLGA = 0;
      let lifetimeValue = 0;

      allPayouts.forEach((p: any) => {
        const amt = Number(p.amount);
        lifetimeValue += amt;
        if (p.status === 'Paid' || p.status === 'Cleared') totalCleared += amt;
        else if (p.status === 'Pending' || p.status === 'Processing') pendingLGA += amt;
      });

      setStats({ totalCleared, pendingLGA, lifetimeValue });
    } catch (error) {
      console.error("Error loading earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`${url}/api/super-admin/organizations/${companyId}/bank`, bankDetails, config);
      alert("Taarifa za Benki zimesasishwa kikamilifu.");
      setIsBankModalOpen(false);
    } catch (error: any) {
      alert("Imeshindwa kusave taarifa za benki.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return amount.toString();
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Earnings & Payouts</h2>
          <p className="text-gray-500 text-sm mt-1">Track payments received from contracted LGAs</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-100 transition-colors shadow-sm outline-none">
              <Building size={16} />
              <span>{bankDetails.bank_account_number ? "Update Bank" : "Add Bank Details"}</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border border-gray-200">
              <DialogHeader><DialogTitle className="text-xl font-bold">Bank Details (Payouts)</DialogTitle></DialogHeader>
              <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-xl border border-yellow-100 mb-2">
                Hizi ndizo taarifa ambazo Halmashauri (LGA) itatumia kukufanyia malipo yako ya mwezi. Hakikisha ni sahihi.
              </div>
              <form className="space-y-4" onSubmit={handleUpdateBankDetails}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Bank Name</label>
                  <select required value={bankDetails.bank_name} onChange={e => setBankDetails({...bankDetails, bank_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm outline-none">
                    <option value="">-- Chagua Benki --</option>
                    <option value="CRDB">CRDB Bank</option>
                    <option value="NMB">NMB Bank</option>
                    <option value="NBC">NBC Bank</option>
                    <option value="EXIM">EXIM Bank</option>
                    <option value="KCB">KCB Bank</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Account Name</label>
                  <input required value={bankDetails.bank_account_name} onChange={e => setBankDetails({...bankDetails, bank_account_name: e.target.value})} type="text" placeholder="Jina lililosajiliwa benki" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Account Number</label>
                  <input required value={bankDetails.bank_account_number} onChange={e => setBankDetails({...bankDetails, bank_account_number: e.target.value})} type="text" placeholder="Mfano: 0150XXXXXXX" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm outline-none font-mono" />
                </div>
                <button type="submit" disabled={isSubmitting} className="mt-4 px-5 py-3.5 w-full text-white bg-emerald-600 hover:bg-emerald-700 rounded-full font-bold flex justify-center items-center gap-2 transition-colors">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Bank Details
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm outline-none">
            <Download size={16} />
            <span className="hidden md:inline">Export Statement</span>
          </button>
        </div>
      </div>

      {/* EARNINGS SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Available Balance */}
        <div className="bg-emerald-600 rounded-[1.25rem] p-5 md:p-6 shadow-[0_4px_14px_rgba(5,150,105,0.2)] border border-emerald-500 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Net Balance</span>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-1">Total Cleared Earnings</p>
            <h3 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-200 text-xl font-normal">TZS</span> {formatMoney(stats.totalCleared)}
            </h3>
            <p className="text-xs text-emerald-50 mt-3 flex items-center gap-1">
              <ArrowUpRight size={14} className="text-emerald-200" /> Lifetime Settled
            </p>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-white rounded-[1.25rem] p-5 md:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pending from LGAs</p>
            <h3 className="text-2xl font-bold text-gray-900">TZS {formatMoney(stats.pendingLGA)}</h3>
            <p className="text-xs text-orange-600 mt-2 font-medium">Awaiting clearing</p>
          </div>
        </div>

        {/* Total Processed Routes */}
        <div className="bg-white rounded-[1.25rem] p-5 md:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Lifetime Value (LTV)</p>
            <h3 className="text-2xl font-bold text-gray-900">TZS {formatMoney(stats.lifetimeValue)}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">Gross revenue since joining</p>
          </div>
        </div>
      </div>

      {/* RECENT PAYOUTS TABLE */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden mt-2">
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
          <h3 className="text-base font-bold text-gray-900">Recent Payouts</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search by month or LGA..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            </div>
            <button className="p-2 border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Billing Month</th>
                <th className="px-6 py-4 font-semibold">Paid By (LGA)</th>
                <th className="px-6 py-4 font-semibold">Date Settled</th>
                <th className="px-6 py-4 font-semibold">Amount Received</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {payouts.length > 0 ? payouts.map(payout => (
                <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{payout.billing_month}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="font-semibold text-gray-900">{payout.lga_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : 'Awaiting'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    TZS {Number(payout.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {payout.status === 'Paid' || payout.status === 'Cleared' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
                        <Clock size={12} /> Processing
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No payouts found yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}