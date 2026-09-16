"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // <-- TUMEONGEZA ROUTER
import { Search, Plus, MoreVertical, ShieldCheck, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function LGAsPage() {
  const router = useRouter(); // <-- ROUTER KWA AJILI YA NAVIGATION
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // <-- STATE YA EDIT MODAL
  const [selectedLga, setSelectedLga] = useState<any>(null); // <-- LGA ILIYOCHAGULIWA
  const [lgas, setLgas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [orgName, setOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const fetchLGAs = async () => {
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.get(`${apiUrl}/api/super-admin/organizations?type=LGA`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLgas(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch LGAs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLGAs();
  }, []);

  // KUSAJILI LGA MPYA
  const handleRegisterLGA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/super-admin/organizations`, {
        orgName, orgType: "LGA", adminName, adminPhone, adminPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsAddOpen(false);
      setOrgName(""); setAdminName(""); setAdminPhone(""); setAdminPassword("");
      fetchLGAs();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Imeshindwa kusajili Halmashauri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // KU-EDIT LGA (Hii itahitaji Endpoint ya PUT kule Node.js baadaye)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // HAPA UTAWEKA AXIOS PUT YAKO BAADAYE
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditOpen(false);
      fetchLGAs();
    }, 1000);
  };

  // KU-DEACTIVATE LGA (Hii itahitaji Endpoint ya DELETE/PUT kule Node.js baadaye)
  const handleDeleteLGA = async (lgaId: string) => {
    if(!window.confirm("Una uhakika unataka kusitisha huduma kwa Halmashauri hii?")) return;
    // HAPA UTAWEKA AXIOS DELETE YAKO BAADAYE
    alert(`LGA ID: ${lgaId} deactivated successfully (Mock)`);
  };

  // Kufungua Edit Modal na kuweka data za zamani
  const openEditModal = (lga: any) => {
    setSelectedLga(lga);
    setOrgName(lga.name);
    setAdminName(lga.admin_name || "");
    setAdminPhone(lga.admin_phone || "");
    setIsEditOpen(true);
  };

  return (
    <>
      {/* MOBILE APP VIEW */}
      <div className="md:hidden w-full bg-gray-50 min-h-screen flex flex-col relative">
        <div className="bg-primary text-white pt-10 pb-16 px-6 rounded-b-[2rem] shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wider">God Mode</p>
              <h2 className="text-xl font-bold">LGAs (Councils)</h2>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-foreground">
            <span className="bg-white/20 px-3 py-1 rounded-full font-medium border border-white/10">
              Total Active: {lgas.length}
            </span>
          </div>
        </div>

        <div className="flex-1 px-5 -mt-10 pb-20">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 mb-6">
            <div className="relative w-full mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search councils..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <button onClick={() => setIsAddOpen(true)} className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 outline-none">
              <Plus size={20} /> Register New LGA
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 px-2">Registered Councils</h4>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : lgas.length > 0 ? lgas.map((lga, index) => (
                <div key={`mob-${lga.id}-${index}`} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4" onClick={() => router.push(`/super-admin/lgas/${lga.id}`)}>
                    <div className="shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                       <ShieldCheck size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{lga.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lga.admin_name || "No Admin"}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary rounded-full outline-none">
                      <MoreVertical size={18} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                      <DropdownMenuItem onClick={() => router.push(`/super-admin/lgas/${lga.id}`)} className="text-xs"><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(lga)} className="text-xs"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Council</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteLGA(lga.id)} className="text-xs text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )) : (
                <p className="text-center text-xs text-gray-500 py-6">No LGAs registered yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">LGAs (Councils)</h2>
            <p className="text-gray-500 text-sm mt-1">Manage all registered municipalities and councils</p>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 outline-none">
            <Plus size={18} /><span>Register LGA</span>
          </button>
        </div>

        <div className="bg-white rounded-[1.5rem] p-3 border border-gray-100 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search councils..." className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border-none rounded-full text-sm outline-none transition-all" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-primary"><Loader2 size={32} className="animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Council Name</th>
                    <th className="px-6 py-4 font-semibold">Administrator</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lgas.length > 0 ? lgas.map((lga, index) => (
                    <tr key={`desk-${lga.id}-${index}`} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/super-admin/lgas/${lga.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5 text-purple-600" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 hover:text-primary transition-colors">{lga.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{lga.admin_name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{lga.admin_phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none flex items-center justify-center ml-auto">
                            <MoreVertical size={18} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-lg border-gray-100">
                            <DropdownMenuItem onClick={() => router.push(`/super-admin/lgas/${lga.id}`)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50"><Eye className="mr-2 h-4 w-4 text-gray-500" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(lga)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Council</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteLGA(lga.id)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">No LGAs registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL YA KUSAJILI */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Register New LGA</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">Enter details to create a council and its primary admin account.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleRegisterLGA}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium text-center">{errorMsg}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Council Name</label>
              <input required value={orgName} onChange={e => setOrgName(e.target.value)} type="text" placeholder="e.g. Kinondoni Municipal Council" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Administrator Name</label>
              <input required value={adminName} onChange={e => setAdminName(e.target.value)} type="text" placeholder="e.g. Juma Ali" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Admin Phone</label>
                <input required value={adminPhone} onChange={e => setAdminPhone(e.target.value)} type="text" placeholder="07XX XXX XXX" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Admin Password</label>
                <input required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-full transition-colors outline-none flex items-center gap-2 disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save LGA
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL YA KU-EDIT */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Council Details</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">Update the information for {selectedLga?.name}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleEditSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Council Name</label>
              <input required value={orgName} onChange={e => setOrgName(e.target.value)} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Administrator Name</label>
              <input required value={adminName} onChange={e => setAdminName(e.target.value)} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Admin Phone</label>
              <input required value={adminPhone} onChange={e => setAdminPhone(e.target.value)} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors outline-none flex items-center gap-2 disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update Details
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}