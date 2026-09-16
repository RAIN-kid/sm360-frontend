"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Search, Plus, MoreVertical, Building, Edit, Trash2, Eye, Truck, Loader2, Phone, KeyRound } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState(""); // Nimeongeza hii kutunza Password iliyozalishwa

  // States for Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Forms and Selection
  const [companyForm, setCompanyForm] = useState({ name: "", email: "", phone_number: "", lga_id: "" });
  const [companyToEdit, setCompanyToEdit] = useState<any>(null);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [resCompanies, resLgas] = await Promise.allSettled([
        axios.get(`${apiUrl}/api/super-admin/companies`, config),
        axios.get(`${apiUrl}/api/super-admin/organizations?type=LGA`, config)
      ]);

      if (resCompanies.status === "fulfilled") setCompanies(resCompanies.value.data.data || []);
      if (resLgas.status === "fulfilled") setLgas(resLgas.value.data.data || []);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ====== ADD COMPANY ======
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg(""); setGeneratedPassword("");
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.post(`${apiUrl}/api/super-admin/companies`, companyForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMsg(res.data.message || "Company Registered Successfully!");
      // Nimeichukua password (ambayo kule backend tulisema Default ni 123456)
      setGeneratedPassword("123456"); 
      
      // HAPA SIFUNGI MODAL HARAKA ILI ADMIN ASOME PASSWORD YA KAMPUNI KWANZA
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to register company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kufunga Add Modal & Kusafisha fomu baada ya kusoma Password
  const closeAddModal = () => {
    setIsAddOpen(false);
    setCompanyForm({ name: "", email: "", phone_number: "", lga_id: "" });
    setSuccessMsg("");
    setGeneratedPassword("");
  };

  // ====== EDIT COMPANY ======
  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg("");
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.put(`${apiUrl}/api/super-admin/companies/${companyToEdit.id}`, 
        { name: companyToEdit.name, is_active: companyToEdit.is_active }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditOpen(false); setCompanyToEdit(null); fetchData();
    } catch (err: any) {
      setErrorMsg("Failed to update company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== DELETE COMPANY ======
  const handleDeleteCompany = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${apiUrl}/api/super-admin/companies/${companyToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteOpen(false); setCompanyToDelete(null); fetchData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.contact_phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Waste Companies</h2>
          <p className="text-gray-500 text-sm mt-1">Manage private waste collection companies across LGAs</p>
        </div>
        
        <button 
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors w-fit outline-none"
        >
          <Plus size={18} />
          <span>Register Company</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-[1.5rem] p-3 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search companies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Company Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Registered Fleet</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  </td>
                </tr>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{company.name}</p>
                          <p className="text-[10px] text-gray-400">ID: {company.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                        <Phone size={14} className="text-gray-400" /> {company.contact_phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                        <Truck size={14} className="text-gray-400" /> {company.trucks_count || 0} Trucks
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {company.is_active !== false ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none flex items-center justify-center ml-auto">
                          <MoreVertical size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-gray-100">
                          
                          <Link href={`/super-admin/companies/${company.id}`} passHref>
                            <DropdownMenuItem className="text-xs font-semibold cursor-pointer rounded-lg hover:bg-gray-50 outline-none py-2.5">
                              <Eye className="mr-2 h-4 w-4 text-gray-500" /> View Profile
                            </DropdownMenuItem>
                          </Link>

                          <DropdownMenuItem onClick={() => { setCompanyToEdit(company); setIsEditOpen(true); }} className="text-xs font-semibold cursor-pointer rounded-lg hover:bg-gray-50 outline-none py-2.5">
                            <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => { setCompanyToDelete(company); setIsDeleteOpen(true); }} className="text-xs font-bold cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 outline-none py-2.5">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-gray-500">
                    No waste companies found. Click "Register Company" to add one.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODALS ZA CRUD
          ========================================= */}
      
      {/* 1. ADD COMPANY MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Register New Company</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Enter the details of the waste collection company.
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-4 mt-2" onSubmit={handleAddCompany}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center font-medium">{errorMsg}</div>}
            
            {/* SUCCESS MESSAGE INAYOONYESHA PASSWORD WAZI */}
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-center space-y-2 animate-in slide-in-from-top-2">
                <p className="text-sm font-bold flex justify-center items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">✓</span> 
                  {successMsg}
                </p>
                {generatedPassword && (
                  <div className="bg-white rounded-lg p-3 border border-emerald-100 mt-2">
                    <p className="text-xs text-emerald-600 mb-1">Company Login Credentials:</p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="font-semibold text-gray-700">{companyForm.phone_number}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm mt-1">
                      <KeyRound size={14} className="text-gray-400" />
                      <span className="font-bold text-emerald-600 text-lg tracking-widest">{generatedPassword}</span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-gray-500 mt-2">Please share these credentials with the company admin.</p>
              </div>
            )}

            {/* Ficha Fomu kama imesajiliwa kikamilifu */}
            {!successMsg && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Company Name</label>
                  <input required value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} type="text" placeholder="e.g. GreenWaste Ltd" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Assign to LGA</label>
                  <select required value={companyForm.lga_id} onChange={e => setCompanyForm({...companyForm, lga_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">-- Select LGA --</option>
                    {lgas.map(lga => (
                      <option key={lga.id} value={lga.id}>{lga.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Contact Email</label>
                    <input required value={companyForm.email} onChange={e => setCompanyForm({...companyForm, email: e.target.value})} type="email" placeholder="info@company.co.tz" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Phone Number (Login ID)</label>
                    <input required value={companyForm.phone_number} onChange={e => setCompanyForm({...companyForm, phone_number: e.target.value})} type="text" placeholder="07XX XXX XXX" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </>
            )}
            
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-4">
              <button type="button" onClick={closeAddModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none transition-colors">
                {successMsg ? "Close" : "Cancel"}
              </button>
              
              {!successMsg && (
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2 transition-all shadow-md shadow-primary/20 outline-none">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Company
                </button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. EDIT COMPANY MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Company Details</DialogTitle>
          </DialogHeader>
          {companyToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditCompany}>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Company Name</label>
                <input required value={companyToEdit.name} onChange={e => setCompanyToEdit({...companyToEdit, name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Account Status</label>
                <select value={companyToEdit.is_active ? "true" : "false"} onChange={e => setCompanyToEdit({...companyToEdit, is_active: e.target.value === "true"})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="true">Active (Operating)</option>
                  <option value="false">Inactive (Suspended)</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 outline-none">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update Changes
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. DELETE COMPANY MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Company</DialogTitle>
          </DialogHeader>
          <div className="text-gray-600 text-sm leading-relaxed mt-2">
            Are you sure you want to permanently delete <span className="font-bold text-gray-900">{companyToDelete?.name}</span>? This action is irreversible and will remove all their associated fleet, drivers, and route history.
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none transition-colors">Cancel</button>
            <button onClick={handleDeleteCompany} disabled={isSubmitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-2 transition-all shadow-md shadow-red-600/20 outline-none">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete Permanently
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}