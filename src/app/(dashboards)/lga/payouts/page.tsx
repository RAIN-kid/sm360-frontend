"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Wallet, Search, Building2, CheckCircle2, ArrowRight, Loader2, Landmark, AlertCircle, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function LGAPayoutsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contractors, setContractors] = useState<any[]>([]);
  const [totalExpectedPayout, setTotalExpectedPayout] = useState(0);
  
  // Payment Modal States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }
      
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const lgaId = profileRes.data.data.lga_id || profileRes.data.data.organization_id;

      // HAPA TUNAVUTA ZONES, KAMPUNI NA PAYOUTS ZA HUU MWEZI
      const [zonesRes, companiesRes, payoutsRes] = await Promise.all([
        axios.get(`${url}/api/super-admin/company-zones?lga_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/companies`, config),
        axios.get(`${url}/api/super-admin/payouts?lga_id=${lgaId}`, config).catch(() => ({ data: { data: [] } }))
      ]);

      const zones = zonesRes.data.data || [];
      const companiesList = companiesRes.data.data || [];
      const allPayouts = payoutsRes.data.data || [];

      const groupedData: any = {};
      let totalAmount = 0;

      zones.forEach((zone: any) => {
        const cId = zone.company_id;
        const amount = Number(zone.agreed_amount || 0);

        if (!groupedData[cId]) {
          const compInfo = companiesList.find((c: any) => c.id === cId) || {};
          
          // Tafuta kama kuna payout imeanzishwa kwa kampuni hii mwezi huu
          const currentMonthPayout = allPayouts.find((p: any) => p.company_id === cId && p.billing_month === currentMonth);

          groupedData[cId] = {
            company_id: cId,
            company_name: zone.company_name,
            total_amount: 0,
            wards_count: 0,
            bank_name: compInfo.bank_name || "N/A",
            bank_account_name: compInfo.bank_account_name || "N/A",
            bank_account_number: compInfo.bank_account_number || "N/A",
            payout_status: currentMonthPayout ? currentMonthPayout.status : 'Unpaid' // HII NDIO LOGIC YA STATUS
          };
        }
        
        groupedData[cId].total_amount += amount;
        groupedData[cId].wards_count += 1;
        totalAmount += amount;
      });

      setContractors(Object.values(groupedData));
      setTotalExpectedPayout(totalAmount);

    } catch (error) {
      console.error("Failed to load settlements", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentModal = (company: any) => {
    setSelectedCompany(company);
    setIsPayModalOpen(true);
  };

  const handleApproveAndPay = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // HII INAPIGA API YETU YA KULE BACKEND KUSUKUMA PESA CLICKPESA
      await axios.post(`${url}/api/super-admin/payouts/trigger`, { 
        company_id: selectedCompany.company_id, 
        amount: selectedCompany.total_amount 
      }, config);
      
      alert(`Malipo ya TZS ${selectedCompany.total_amount.toLocaleString()} yameidhinishwa kwa ${selectedCompany.company_name} na yanachakatwa!`);
      setIsPayModalOpen(false);
      
      // Refresh Data ili UI ibadilishe kitufe kuwa "Processing"
      fetchSettlements();
    } catch (error: any) {
      alert(error.response?.data?.message || "Imeshindwa kufanya malipo. Jaribu tena.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-[#004d2e]" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Contractor Settlements</h2>
          <p className="text-gray-500 text-sm mt-1">Approve and disburse monthly payments to private waste companies</p>
        </div>
      </div>

      {/* SUMMARY CARDS - BOXES ZIMEFANYWA NDOGO NA FLAT (HAKUNA SHADOWS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#004d2e] rounded-[1.25rem] p-5 border border-[#004d2e] text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md">{currentMonth}</span>
          </div>
          <div>
            <p className="text-emerald-100 text-xs font-medium mb-1">Total Expected Payout</p>
            <h3 className="text-2xl font-bold text-white flex items-center gap-1.5">
              <span className="text-emerald-200 text-lg font-normal">TZS</span> {totalExpectedPayout.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Active Contractors</p>
            <h3 className="text-2xl font-bold text-gray-900">{contractors.length} Companies</h3>
          </div>
        </div>
      </div>

      {/* PAYOUT TABLE - HAKUNA SHADOW */}
      <div className="bg-white rounded-[1.25rem] border border-gray-200 overflow-hidden mt-4">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-sm font-bold text-gray-900">Pending Settlements ({currentMonth})</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search contractor..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs outline-none transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Contractor</th>
                <th className="px-6 py-4 font-semibold">Zones (Wards)</th>
                <th className="px-6 py-4 font-semibold">Monthly Amount</th>
                <th className="px-6 py-4 font-semibold">Bank Details</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {contractors.length > 0 ? contractors.map((contractor, idx) => {
                
                // LOGIC YA KUFUNGIA KITUFE KAMA HELA TAYARI IMETUMWA
                const isProcessing = contractor.payout_status === 'Processing';
                const isPaid = contractor.payout_status === 'Paid' || contractor.payout_status === 'Cleared';
                const hasNoBank = contractor.bank_account_number === "N/A";
                const isZeroAmount = contractor.total_amount === 0;
                const isDisabled = isProcessing || isPaid || hasNoBank || isZeroAmount;

                return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Building2 size={14} className="text-blue-600"/>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{contractor.company_name}</p>
                          <p className="text-[11px] text-gray-500">ID: {contractor.company_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs">
                        {contractor.wards_count} Wards
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 text-base">
                      TZS {contractor.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {hasNoBank ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center w-fit gap-1">
                          <AlertCircle size={10} /> Not Provided
                        </span>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-900 text-xs flex items-center gap-1"><Landmark size={12} className="text-gray-400"/> {contractor.bank_name}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{contractor.bank_account_number}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openPaymentModal(contractor)}
                        disabled={isDisabled}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors outline-none border-none shadow-sm
                          ${isPaid ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed' : 
                            isProcessing ? 'bg-orange-50 text-orange-600 cursor-not-allowed' :
                            isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            'bg-[#004d2e] hover:bg-[#004d2e]/90 text-white'
                          }`}
                      >
                        {isPaid ? <><CheckCircle2 size={14} /> Settled</> :
                         isProcessing ? <><Clock size={14} /> Processing...</> :
                         <><Wallet size={14} /> Approve & Pay <ArrowRight size={14} /></>}
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">No active contracts found for payout.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT APPROVAL MODAL - HAKUNA SHADOW */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6 border border-gray-200 shadow-none">
          <DialogHeader>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Wallet size={24} />
            </div>
            <DialogTitle className="text-xl font-black text-center text-gray-900 mb-2">Authorize Payout</DialogTitle>
            <DialogDescription className="text-center text-gray-500 text-sm">
              You are about to disburse funds to <span className="font-bold text-gray-900">{selectedCompany?.company_name}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 rounded-2xl p-4 mt-2 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-xs text-gray-500 font-medium">Total Amount</span>
              <span className="text-base font-black text-gray-900">TZS {selectedCompany?.total_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-xs text-gray-500 font-medium">Receiving Bank</span>
              <span className="text-xs font-bold text-gray-900">{selectedCompany?.bank_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Account No.</span>
              <span className="text-xs font-bold text-gray-900 font-mono">{selectedCompany?.bank_account_number}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button 
              onClick={handleApproveAndPay} 
              disabled={isProcessing} 
              className="w-full py-3 text-sm font-bold text-white bg-[#004d2e] hover:bg-[#004d2e]/90 rounded-full flex justify-center items-center gap-2 transition-all outline-none border-none"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} 
              {isProcessing ? "Processing Transfer..." : "Confirm & Transfer"}
            </button>
            <button 
              onClick={() => setIsPayModalOpen(false)} 
              disabled={isProcessing}
              className="w-full py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-full outline-none transition-colors border-none"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}