"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, MoreVertical, Map, Truck, MapPin, CheckCircle2, Route as RouteIcon, Trash2, Loader2, Navigation, Building2, Edit, DollarSign 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LGAZonesPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [adminContext, setAdminContext] = useState<any>(null);
  const [wards, setWards] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]); // Hizi ndio company_zones

  // States: Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // States: CRUD Logic
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<any>(null);
  const [zoneToView, setZoneToView] = useState<any>(null);

  const [zoneForm, setZoneForm] = useState({ ward_id: "", company_id: "", agreed_amount: "" });

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
      const lgaId = lgaAdmin.lga_id || lgaAdmin.organization_id;

      const [resWards, resCompanies, resZones] = await Promise.all([
        axios.get(`${url}/api/super-admin/wards?organization_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/companies`, config), 
        axios.get(`${url}/api/super-admin/company-zones?lga_id=${lgaId}`, config)
      ]);

      setWards(resWards.data.data || []);
      setCompanies(resCompanies.data.data || []);
      setZones(resZones.data.data || []);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingZoneId(null);
    setZoneForm({ ward_id: "", company_id: "", agreed_amount: "" });
    setErrorMsg("");
    setIsAddOpen(true);
  };

  const openEditModal = (zone: any) => {
    setIsEditMode(true);
    setEditingZoneId(zone.id);
    setZoneForm({ 
      ward_id: zone.ward_id, 
      company_id: zone.company_id, 
      agreed_amount: zone.agreed_amount || "" 
    });
    setErrorMsg("");
    setIsAddOpen(true);
  };

  const handleSubmitZone = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); 
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${t}` } };
      
      const payload = { 
        company_id: zoneForm.company_id, 
        ward_id: zoneForm.ward_id,
        agreed_amount: Number(zoneForm.agreed_amount)
      };

      if (isEditMode && editingZoneId) {
        await axios.put(`${url}/api/super-admin/company-zones/${editingZoneId}`, payload, config);
      } else {
        await axios.post(`${url}/api/super-admin/company-zones`, payload, config);
      }

      setIsAddOpen(false); 
      fetchData();
    } catch (err: any) { 
      setErrorMsg(err.response?.data?.message || "Imeshindwa kukabidhi Kata kwa Kampuni."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDeleteZone = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); 
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${url}/api/super-admin/company-zones/${zoneToDelete.id}`, { headers: { Authorization: `Bearer ${t}` } });
      setIsDeleteOpen(false); setZoneToDelete(null); fetchData();
    } catch (err: any) { 
      console.error(err); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const openMap = (zone: any) => {
    setZoneToView(zone);
    setIsMapOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Contracted Zones</h2>
          <p className="text-gray-500 text-sm mt-1">Assign wards to private waste collection companies</p>
        </div>
        
        {/* KITUFE KIPO NJE YA DIALOG */}
        <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors w-fit shadow-md shadow-primary/20 outline-none">
          <Plus size={18} />
          <span>Assign Zone</span>
        </button>

        {/* DIALOG INAFUNGUKA KWA STATE TU */}
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) setErrorMsg(""); }}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit Contract Terms" : "Assign Ward to Company"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Select a ward, the contractor company, and the agreed monthly payment.
              </DialogDescription>
            </DialogHeader>
            
            <form className="space-y-4 mt-4" onSubmit={handleSubmitZone}>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{errorMsg}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Ward (Zone)</label>
                <select required value={zoneForm.ward_id} onChange={e => setZoneForm({...zoneForm, ward_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">-- Chagua Kata --</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Assign Company</label>
                <select required value={zoneForm.company_id} onChange={e => setZoneForm({...zoneForm, company_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">-- Chagua Kampuni --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Monthly Contract Value (TZS)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input required type="number" min="0" value={zoneForm.agreed_amount} onChange={e => setZoneForm({...zoneForm, agreed_amount: e.target.value})} placeholder="e.g. 2500000" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-full transition-colors shadow-md shadow-primary/20 outline-none flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} 
                  {isEditMode ? "Save Changes" : "Assign Zone"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search zones or companies..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><MapPin size={16} className="text-primary"/> Active Contracted Zones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Ward (Zone Area)</th>
                <th className="px-6 py-4 font-semibold">Assigned Company</th>
                <th className="px-6 py-4 font-semibold">Contract Value</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><RouteIcon size={16} className="text-gray-400"/> {zone.ward_name}</p>
                    <p className="text-[11px] text-gray-500 ml-6">Contract ID: #{zone.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Building2 size={14} className="text-blue-600"/></div>
                      <span className="text-sm font-semibold text-gray-900">{zone.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      TZS {Number(zone.agreed_amount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none flex items-center justify-center ml-auto">
                        <MoreVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-lg border-gray-100">
                        <DropdownMenuItem onClick={() => openEditModal(zone)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 py-2">
                          <Edit className="mr-2 h-4 w-4 text-gray-500" /> Edit Contract
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMap(zone)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 py-2">
                          <Map className="mr-2 h-4 w-4 text-gray-500" /> View Map Extent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setZoneToDelete(zone); setIsDeleteOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 py-2">
                          <Trash2 className="mr-2 h-4 w-4" /> Revoke Contract
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {zones.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-sm text-gray-500 font-medium">
                    No Zones assigned yet. Click "Assign Zone" to allocate wards to companies.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAP MODAL */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
          <div className="bg-white p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MapPin className="text-primary"/> Ward Boundary Map</h2>
              <p className="text-gray-500 text-sm">Viewing boundaries for <span className="font-bold">{zoneToView?.ward_name}</span> managed by {zoneToView?.company_name}</p>
            </div>
          </div>
          <div className="h-[60vh] w-full relative bg-gray-100 flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            <div className="z-10 text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-gray-200">
              <Navigation className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">GIS Integration Ready</h3>
              <p className="text-gray-500 text-sm max-w-sm">Hapa ndipo Ramani kamili itawekwa kuonyesha mipaka ya Kata ya <span className="font-bold text-gray-900">{zoneToView?.ward_name}</span>. LGA anaona eneo zima.</p>
            </div>
          </div>
          <div className="bg-white p-4 flex justify-end">
             <button onClick={() => setIsMapOpen(false)} className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">Close Map</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE ROUTE MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black text-red-600 mb-2">Revoke Contract</DialogTitle></DialogHeader>
          <div className="text-gray-600 text-base leading-relaxed">Are you sure you want to remove <span className="font-black text-gray-900">{zoneToDelete?.company_name}</span> from operating in <span className="font-black text-gray-900">{zoneToDelete?.ward_name}</span>?</div>
          <div className="pt-6 flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-full outline-none transition-colors">Cancel</button>
            <button onClick={handleDeleteZone} disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-red-500/20">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Revoke Contract
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}