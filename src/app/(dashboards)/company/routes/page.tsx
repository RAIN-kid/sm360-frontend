"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, Plus, Truck, Clock, Route as RouteIcon, Filter, Loader2, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export default function CompanyRoutesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [assignedWards, setAssignedWards] = useState<any[]>([]); 
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  const [routeForm, setRouteForm] = useState({ ward_id: "", name: "", truck_id: "", driver_id: "", collection_day: "" });
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);

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
      const cId = profileRes.data.data.lga_id || profileRes.data.data.organization_id; 
      setCompanyId(cId);

      const [wardsRes, trucksRes, driversRes, routesRes] = await Promise.all([
        axios.get(`${url}/api/super-admin/my-assigned-wards?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/trucks?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/drivers?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/routes?organization_id=${cId}`, config)
      ]);

      setAssignedWards(wardsRes.data.data || []);
      setTrucks(trucksRes.data.data || []);
      setDrivers(driversRes.data.data || []);
      setRoutes(routesRes.data.data || []);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${url}/api/super-admin/routes`, {
        company_id: companyId, ward_id: routeForm.ward_id, name: routeForm.name,
        truck_id: routeForm.truck_id, driver_id: routeForm.driver_id, collection_day: routeForm.collection_day
      }, { headers: { Authorization: `Bearer ${token}` } });

      setIsAddOpen(false);
      setRouteForm({ ward_id: "", name: "", truck_id: "", driver_id: "", collection_day: "" });
      fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Imeshindwa kusave Ruti."); } 
    finally { setIsSubmitting(false); }
  };

  const openEditModal = (route: any) => {
    setRouteForm({
      ward_id: route.ward_id, name: route.name, 
      truck_id: route.truck_id || "", driver_id: route.driver_id || "", collection_day: route.collection_day || ""
    });
    setEditingRouteId(route.id);
    setIsEditOpen(true);
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.put(`${url}/api/super-admin/routes/${editingRouteId}`, routeForm, { headers: { Authorization: `Bearer ${token}` } });

      setIsEditOpen(false);
      setRouteForm({ ward_id: "", name: "", truck_id: "", driver_id: "", collection_day: "" });
      fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Imeshindwa kusasisha Ruti."); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteRoute = async (id: number) => {
    if(!confirm("Una uhakika unataka kufuta ruti hii?")) return;
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${url}/api/super-admin/routes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error: any) { alert("Imeshindwa kufuta ruti."); }
  };

  // KU-CLEAR MANUALLY - TUNATUMA DATE HALISI YA KISWAHILI/LOCAL
  const handleManualClear = async (id: number) => {
    if(!confirm("Unaidhinisha kuwa ruti hii imesafishwa leo?")) return;
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localTodayStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

      await axios.put(`${url}/api/super-admin/routes/${id}/clear`, { cleared_date: localTodayStr }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(); 
    } catch (error: any) { alert("Imeshindwa ku-clear ruti."); }
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;
  
  // LOGIC YA TAREHE SALAMA 100%
  const today = new Date();
  const todayDayNum = today.getDate().toString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Route & Fleet Management</h2>
          <p className="text-gray-500 text-sm mt-1">Panga Ruti, Tarehe za Kuzoa na Vituo.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 outline-none">
            <Plus size={18} /> <span>Create New Route</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200">
            <DialogHeader><DialogTitle>Create New Route</DialogTitle></DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={handleAddRoute}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Zone (Ward)</label>
                <select required value={routeForm.ward_id} onChange={e => setRouteForm({...routeForm, ward_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none">
                  <option value="">-- Chagua Kata --</option>
                  {assignedWards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Route Name</label>
                <input required value={routeForm.name} onChange={e => setRouteForm({...routeForm, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Collection Dates (Kila Mwezi)</label>
                <input required value={routeForm.collection_day} onChange={e => setRouteForm({...routeForm, collection_day: e.target.value})} type="text" placeholder="Mfano: 7, 15, 24" className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Default Truck</label>
                  <select required value={routeForm.truck_id} onChange={e => setRouteForm({...routeForm, truck_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none">
                    <option value="">-- Gari --</option>
                    {trucks.map(t => <option key={t.id} value={t.id}>{t.plate_number}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Default Driver</label>
                  <select required value={routeForm.driver_id} onChange={e => setRouteForm({...routeForm, driver_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none">
                    <option value="">-- Dereva --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name.split(' ')[0]}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 w-full text-white bg-emerald-600 rounded-full font-bold">Save</button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200">
            <DialogHeader><DialogTitle>Edit Route</DialogTitle></DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={handleUpdateRoute}>
              {/* OMITTED REPETITIVE FORM FOR BREVITY, SAME AS ABOVE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Zone (Ward)</label>
                <select required value={routeForm.ward_id} onChange={e => setRouteForm({...routeForm, ward_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none">
                  <option value="">-- Chagua Kata --</option>
                  {assignedWards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Route Name</label>
                <input required value={routeForm.name} onChange={e => setRouteForm({...routeForm, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Collection Dates</label>
                <input required value={routeForm.collection_day} onChange={e => setRouteForm({...routeForm, collection_day: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Default Truck</label>
                  <select required value={routeForm.truck_id} onChange={e => setRouteForm({...routeForm, truck_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none">
                    <option value="">-- Gari --</option>
                    {trucks.map(t => <option key={t.id} value={t.id}>{t.plate_number}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Default Driver</label>
                  <select required value={routeForm.driver_id} onChange={e => setRouteForm({...routeForm, driver_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none">
                    <option value="">-- Dereva --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name.split(' ')[0]}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 w-full text-white bg-blue-600 rounded-full font-bold">Update Route</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[1.5rem] p-4 md:p-5 border border-gray-200 flex flex-col md:flex-row justify-between">
        <div className="flex gap-6">
          <button onClick={() => setActiveTab("all")} className={`text-sm font-bold transition-colors ${activeTab === "all" ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}>All Routes</button>
          <button onClick={() => setActiveTab("pending")} className={`text-sm font-bold transition-colors ${activeTab === "pending" ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}>Pending (Today)</button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-200 overflow-hidden">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/80 border-b text-gray-600 text-[11px] uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Route Info</th>
              <th className="px-6 py-4">Collection Dates</th>
              <th className="px-6 py-4">Assigned Fleet</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {routes.length > 0 ? routes.map(route => {
              const routeDates = route.collection_day ? route.collection_day.toString().split(',').map((d:string)=>d.trim()) : [];
              const isToday = routeDates.includes(todayDayNum);
              
              // === UCHAWI WA TAREHE ULIOSAHIHISHWA 100% ===
              let isClearedToday = false;
              if (route.last_cleared_date) {
                const clearedDate = new Date(route.last_cleared_date);
                // Tunalinganisha Mwaka, Mwezi, na Siku moja kwa moja kuepuka Timezones
                if (
                  clearedDate.getFullYear() === today.getFullYear() &&
                  clearedDate.getMonth() === today.getMonth() &&
                  clearedDate.getDate() === today.getDate()
                ) {
                  isClearedToday = true;
                }
              }

              const isPending = isToday && !isClearedToday;

              if (activeTab === "pending" && !isPending) return null;

              return (
                <tr key={route.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><RouteIcon size={16}/> {route.name}</p>
                    <p className="text-[11px] text-gray-500 ml-6">{route.ward_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">Dates: {route.collection_day}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-gray-400"/><span className="text-xs font-semibold">{trucks.find(t=>t.id===route.truck_id)?.plate_number||'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isPending ? 
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 flex items-center w-fit">
                        Action Required
                      </span> : 
                    isClearedToday ? 
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} className="inline"/> Cleared Today
                      </span> : 
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1 w-fit">
                        <Clock size={12} className="inline"/> Scheduled
                      </span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    {isPending && (
                      <button onClick={() => handleManualClear(route.id)} className="text-[10px] font-bold text-emerald-600 hover:text-white border border-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-full transition-colors outline-none mr-2">
                        Mark Cleared
                      </button>
                    )}
                    <button onClick={() => openEditModal(route)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteRoute(route.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"><Trash2 size={16}/></button>
                    <button onClick={() => router.push(`/company/routes/${route.id}`)} className="text-xs font-bold text-white bg-emerald-600 px-4 py-1.5 rounded-full ml-2">GIS Map</button>
                  </td>
                </tr>
              )
            }) : <tr><td colSpan={5} className="text-center py-10">No routes found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}