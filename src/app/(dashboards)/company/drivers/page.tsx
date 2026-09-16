"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, MoreVertical, Users, CheckCircle2, ShieldBan, Edit, Truck, Clock, Loader2, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CompanyDriversPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [driverForm, setDriverForm] = useState({ full_name: "", phone_number: "", password: "", truck_id: "" });
  const [editDriverForm, setEditDriverForm] = useState<any>(null); // State ya ku-edit

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const profileRes = await axios.get(`${apiUrl}/api/super-admin/my-profile`, config);
      const cId = profileRes.data.data.lga_id;
      setCompanyId(cId);

      const [driversRes, trucksRes] = await Promise.all([
        axios.get(`${apiUrl}/api/super-admin/drivers?organization_id=${cId}`, config),
        axios.get(`${apiUrl}/api/super-admin/trucks?organization_id=${cId}`, config)
      ]);

      setDrivers(driversRes.data.data || []);
      setTrucks(trucksRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ====== ADD DRIVER ======
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    const passwordToSave = driverForm.password || Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/super-admin/drivers`, {
        ...driverForm,
        password: passwordToSave,
        organization_id: companyId,
        truck_id: driverForm.truck_id === "" ? null : driverForm.truck_id
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSuccessMsg(`Driver Login Password: ${passwordToSave}`);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to register driver.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== EDIT DRIVER ======
  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setEditErrorMsg("");

    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.put(`${apiUrl}/api/super-admin/drivers/${editDriverForm.id}`, {
        full_name: editDriverForm.full_name,
        phone_number: editDriverForm.phone_number,
        truck_id: editDriverForm.truck_id === "" ? null : editDriverForm.truck_id
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsEditOpen(false);
      setEditDriverForm(null);
      fetchData();
    } catch (err: any) {
      setEditErrorMsg(err.response?.data?.message || "Failed to update driver profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (driver: any) => {
    setEditDriverForm({
      id: driver.id,
      full_name: driver.full_name,
      phone_number: driver.phone_number,
      truck_id: driver.truck_id || "" // Kama hakuwa na gari, weka empty string
    });
    setEditErrorMsg("");
    setIsEditOpen(true);
  };

  // ====== DELETE DRIVER ======
  const handleDeleteDriver = async (id: number) => {
    if (!confirm("Are you sure you want to remove this driver?")) return;
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${apiUrl}/api/super-admin/drivers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.phone_number?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Drivers Roster</h2>
          <p className="text-gray-500 text-sm mt-1">Manage driver assignments and availability</p>
        </div>
        
        {/* ADD DRIVER DIALOG */}
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if(!open) { setSuccessMsg(""); setErrorMsg(""); setDriverForm({ full_name: "", phone_number: "", password: "", truck_id: "" }); }
        }}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors w-fit shadow-md shadow-emerald-600/20 outline-none">
            <Plus size={18} />
            <span>Add Driver</span>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Register New Driver</DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Add a new driver to your workforce. They will use their phone number to login.
              </DialogDescription>
            </DialogHeader>
            
            <form className="space-y-4 mt-2" onSubmit={handleAddDriver}>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-center">
                  <p className="text-sm font-bold text-emerald-600 mb-2">Driver Registered Successfully!</p>
                  <div className="flex justify-center items-center gap-2">
                    <KeyRound size={16} /> <span className="text-xl tracking-widest font-black">{successMsg.split(': ')[1]}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Please give this password to the driver.</p>
                </div>
              )}

              {!successMsg && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input required value={driverForm.full_name} onChange={e=>setDriverForm({...driverForm, full_name: e.target.value})} type="text" placeholder="e.g. Ali Juma" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                      <input required value={driverForm.phone_number} onChange={e=>setDriverForm({...driverForm, phone_number: e.target.value})} type="text" placeholder="07XX XXX XXX" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Custom Password</label>
                      <input value={driverForm.password} onChange={e=>setDriverForm({...driverForm, password: e.target.value})} type="text" placeholder="Auto-generated if empty" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Assign Truck</label>
                    <select value={driverForm.truck_id} onChange={e=>setDriverForm({...driverForm, truck_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
                      <option value="">-- Leave Unassigned --</option>
                      {trucks.filter(t => !t.driver_id).map(truck => (
                        <option key={truck.id} value={truck.id}>{truck.plate_number} ({truck.capacity} Tons)</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">{successMsg ? "Close" : "Cancel"}</button>
                {!successMsg && (
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-md shadow-emerald-600/20 outline-none flex items-center gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Driver
                  </button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search driver name or phone..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Driver Info</th>
                <th className="px-6 py-4 font-semibold">Assigned Truck</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {isLoading ? (
                <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="animate-spin text-emerald-600 mx-auto" size={24} /></td></tr>
              ) : filteredDrivers.length > 0 ? (
                filteredDrivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${driver.truck_id ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{driver.full_name}</p>
                          <p className="text-[11px] text-gray-400">{driver.phone_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {driver.truck_id ? (
                        <div className="flex items-center gap-2">
                          <Truck size={14} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-900">{driver.plate_number}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {driver.truck_id ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <Clock size={12} /> Off-Duty
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors outline-none flex items-center justify-center ml-auto">
                          <MoreVertical size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-lg border-gray-100">
                          
                          {/* EDIT MENU ITEM */}
                          <DropdownMenuItem onClick={() => openEditModal(driver)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 outline-none">
                            <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Profile
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleDeleteDriver(driver.id)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 outline-none">
                            <ShieldBan className="mr-2 h-4 w-4" /> Remove Driver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-500">No drivers found.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT DRIVER DIALOG ================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Driver Profile</DialogTitle>
          </DialogHeader>
          
          {editDriverForm && (
            <form className="space-y-4 mt-2" onSubmit={handleEditDriver}>
              {editErrorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{editErrorMsg}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input required value={editDriverForm.full_name} onChange={e=>setEditDriverForm({...editDriverForm, full_name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input required value={editDriverForm.phone_number} onChange={e=>setEditDriverForm({...editDriverForm, phone_number: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Re-assign Truck</label>
                <select value={editDriverForm.truck_id} onChange={e=>setEditDriverForm({...editDriverForm, truck_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
                  <option value="">-- Unassigned (Off-Duty) --</option>
                  
                  {/* Hapa tunaonyesha gari lake la sasa (kama analo) na magari mengine ambayo yapo wazi (hayana madereva) */}
                  {trucks.filter(t => !t.driver_id || t.id === editDriverForm.truck_id).map(truck => (
                    <option key={truck.id} value={truck.id}>{truck.plate_number} ({truck.capacity} Tons)</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-md shadow-emerald-600/20 outline-none flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update Profile
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}