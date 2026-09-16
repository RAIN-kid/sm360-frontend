"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Search, Download, Receipt, Wallet, TrendingUp, CheckCircle2, Clock, Zap, Loader2, MoreVertical, MessageSquareWarning, Hash 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LGARevenuePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [adminContext, setAdminContext] = useState<any>(null);
  
  // Tabs for Filtering (all, paid, unpaid)
  const [activeTab, setActiveTab] = useState("all");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }

      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const lgaAdmin = profileRes.data.data;
      setAdminContext(lgaAdmin);

      const invRes = await axios.get(`${url}/api/super-admin/invoices?lga_id=${lgaAdmin.lga_id}`, config);
      setInvoices(invRes.data.data || []);
    } catch (error) {
      console.error("Failed to load invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBills = async () => {
    setIsGenerating(true);
    try {
      const t = localStorage.getItem("sm360_token"); 
      const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/invoices/generate`, { lga_id: adminContext.lga_id }, { headers: { Authorization: `Bearer ${t}` } });
      setIsGenerateModalOpen(false);
      fetchData(); 
      alert("Ankara za mwezi huu zimetengenezwa kikamilifu!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Imeshindwa kutengeneza ankara.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 1. Mark as Paid (Manual)
  const handleMarkAsPaid = async (id: number) => {
    if(!confirm("Una uhakika unataka kusajili hii ankara kama imelipiwa?")) return;
    setIsProcessing(true);
    try {
      const t = localStorage.getItem("sm360_token"); 
      const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/invoices/pay/${id}`, {}, { headers: { Authorization: `Bearer ${t}` } });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Imeshindwa kulipia.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    const pendingIds = invoices.filter(i => i.status === 'Pending').map(i => i.id);
    if(pendingIds.length === 0) return alert("Hakuna wadaiwa wapya.");
    if(!confirm(`Unataka kusajili ankara zote ${pendingIds.length} kama zimelipiwa (Manual)?`)) return;
    
    setIsProcessing(true);
    try {
      const t = localStorage.getItem("sm360_token"); 
      const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/invoices/pay`, { invoice_ids: pendingIds }, { headers: { Authorization: `Bearer ${t}` } });
      fetchData();
      alert("Zote zimesajiliwa kama zimelipiwa.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Imeshindwa.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Send Warning SMS
  const handleSendWarning = async (id: number | null, isBulk: boolean = false) => {
    const msg = isBulk ? "Una uhakika unataka kutuma SMS kwa wadaiwa wote?" : "Tuma SMS ya onyo kwa mteja huyu?";
    if(!confirm(msg)) return;
    
    setIsProcessing(true);
    try {
      const t = localStorage.getItem("sm360_token"); 
      const url = process.env.NEXT_PUBLIC_API_URL;
      const endpoint = id ? `${url}/api/super-admin/invoices/warning/${id}` : `${url}/api/super-admin/invoices/warning`;
      
      await axios.post(endpoint, { lga_id: adminContext.lga_id, bulk: isBulk }, { headers: { Authorization: `Bearer ${t}` } });
      alert("SMS zimetumwa kikamilifu!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Imeshindwa kutuma SMS.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Njia ya ku-copy namba haraka
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Namba ya malipo (${text}) imekuwa copied tayari!`);
  };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingRevenue = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + Number(i.amount), 0);
  
  const filteredInvoices = invoices.filter(i => {
    if (activeTab === "paid") return i.status === 'Paid';
    if (activeTab === "unpaid") return i.status === 'Pending';
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ').format(amount);
  };

  if (isLoading && !adminContext) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & MAGIC BUTTON (Generate Bills) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices & Revenue</h2>
          <p className="text-gray-500 text-sm mt-1">Track payments and generate monthly bills</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm outline-none">
            <Download size={16} />
            <span>Export</span>
          </button>
          
          <button onClick={() => setIsGenerateModalOpen(true)} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 outline-none">
            <Zap size={16} />
            <span>Generate Monthly Bills</span>
          </button>
        </div>
      </div>

      {/* REVENUE SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-600 rounded-[1.25rem] p-5 shadow-lg border border-emerald-500 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">Total Paid</span>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-50 text-sm font-medium mb-1">Total Collected Revenue</p>
            <h3 className="text-2xl font-bold text-white">TZS {formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-[1.25rem] p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Generated Invoices</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(invoices.length)}</h3>
            <p className="text-xs text-gray-400 mt-1">For This Billing Cycle</p>
          </div>
        </div>

        <div className="bg-white rounded-[1.25rem] p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pending Collections (Defaulters)</p>
            <h3 className="text-2xl font-bold text-gray-900">TZS {formatCurrency(pendingRevenue)}</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Overdue Accounts</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by Invoice ID or Owner..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>All Invoices</button>
            <button onClick={() => setActiveTab("paid")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'paid' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>Paid</button>
            <button onClick={() => setActiveTab("unpaid")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'unpaid' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>Unpaid</button>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS (Inatokea tu ukiwa Unpaid) */}
      {activeTab === 'unpaid' && filteredInvoices.length > 0 && (
        <div className="flex justify-end gap-3 animate-in fade-in slide-in-from-top-2">
           <button onClick={handleBulkMarkAsPaid} disabled={isProcessing} className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm outline-none">
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Mark All as Paid
          </button>
          <button onClick={() => handleSendWarning(null, true)} disabled={isProcessing} className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-100 transition-colors shadow-sm outline-none">
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <MessageSquareWarning size={14} />} Send SMS to All Defaulters
          </button>
        </div>
      )}

      {/* DATA TABLE - LATEST TRANSACTIONS */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Invoice No.</th>
                <th className="px-6 py-4 font-semibold">Property & Owner</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Billing Month</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-900">{inv.invoice_no}</td>
                  
                  {/* HAPA NDIPO CONTROL NUMBER IMEONGEZWA KWA UZURI */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{inv.owner_name}</p>
                    <p className="text-[11px] text-gray-400 mb-1.5">{inv.property_code} • {inv.ward_name}</p>
                    
                    {inv.control_number ? (
                      <span 
                        onClick={() => copyToClipboard(inv.control_number)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-1 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors"
                        title="Bonyeza Ku-Copy Namba ya Malipo"
                      >
                        <Hash size={12} /> Pay No: {inv.control_number}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium font-mono bg-gray-50 text-gray-400 border border-gray-100 px-2 py-1 rounded-md">
                        <Hash size={12} /> Pay No: N/A
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 font-semibold text-gray-900">TZS {formatCurrency(inv.amount)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{inv.billing_month}</td>
                  <td className="px-6 py-4">
                    {inv.status === 'Paid' ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none ml-auto flex items-center justify-center">
                        <MoreVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 border-gray-100 shadow-xl">
                        {inv.status === 'Pending' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(inv.id)} className="text-xs font-semibold cursor-pointer rounded-lg hover:bg-emerald-50 text-emerald-600 focus:text-emerald-600 py-2.5">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 py-2.5">
                          <Receipt className="mr-2 h-4 w-4 text-blue-500" /> View Invoice
                        </DropdownMenuItem>
                        
                        {inv.status === 'Pending' && (
                          <DropdownMenuItem onClick={() => handleSendWarning(inv.id, false)} className="text-xs font-semibold cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 py-2.5">
                            <MessageSquareWarning className="mr-2 h-4 w-4" /> Send Warning SMS
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-gray-500">
                    No invoices found. Click "Generate Monthly Bills" to create them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL KWA GENERATE BILLS */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 mb-2">Generate Monthly Bills</DialogTitle>
          </DialogHeader>
          <div className="text-gray-600 text-sm leading-relaxed mt-2">
            Are you sure you want to generate invoices for all registered properties for the current month? 
            This action will prepare bills for collection and sync with the payment gateway.
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <button onClick={() => setIsGenerateModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-full outline-none transition-colors">Cancel</button>
            <button onClick={handleGenerateBills} disabled={isGenerating} className="px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Confirm & Generate
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}