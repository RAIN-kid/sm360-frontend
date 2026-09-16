"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import axios from "axios";
import { 
  ArrowLeft, Truck, MapPin, Search, Plus, MoreHorizontal, 
  Edit, Trash2, Loader2, Navigation, Eye, Phone, Mail, Building, Map as MapIcon, Lock, User
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ================= STATES =================
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  
  const [wards, setWards] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  
  // Interactive Map State
  const [activeRouteMap, setActiveRouteMap] = useState<any>(null);

  // Forms & Modals for Trucks
  const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
  const [isEditTruckOpen, setIsEditTruckOpen] = useState(false);
  const [isDeleteTruckOpen, setIsDeleteTruckOpen] = useState(false);
  const [truckForm, setTruckForm] = useState({ plate_number: "", capacity: "5 Tons", status: "Active" });
  const [truckToEdit, setTruckToEdit] = useState<any>(null);
  const [truckToDelete, setTruckToDelete] = useState<any>(null);

  // Forms & Modals for Drivers
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);
  const [isDeleteDriverOpen, setIsDeleteDriverOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({ full_name: "", phone_number: "", password: "", truck_id: "" });
  const [driverToEdit, setDriverToEdit] = useState<any>(null);
  const [driverToDelete, setDriverToDelete] = useState<any>(null);

  // Forms & Modals for Routes
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isDeleteRouteOpen, setIsDeleteRouteOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({ truck_id: "", ward_id: "", street_id: "" });
  const [routeToDelete, setRouteToDelete] = useState<any>(null);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resC, resT, resD, resR, resW, resS] = await Promise.allSettled([
        axios.get(`${url}/api/super-admin/organizations/${companyId}`, config),
        axios.get(`${url}/api/super-admin/trucks?organization_id=${companyId}`, config),
        axios.get(`${url}/api/super-admin/drivers?organization_id=${companyId}`, config),
        axios.get(`${url}/api/super-admin/routes?organization_id=${companyId}`, config),
        axios.get(`${url}/api/super-admin/wards`, config), // Fetch all wards
        axios.get(`${url}/api/super-admin/streets`, config) // Fetch all streets
      ]);

      if (resC.status === "fulfilled") setCompanyDetails(resC.value.data.data);
      if (resT.status === "fulfilled") setTrucks(resT.value.data.data || []);
      if (resD.status === "fulfilled") setDrivers(resD.value.data.data || []);
      if (resR.status === "fulfilled") setRoutes(resR.value.data.data || []);
      if (resW.status === "fulfilled") setWards(resW.value.data.data || []);
      if (resS.status === "fulfilled") setStreets(resS.value.data.data || []);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [companyId]);

  // ========= TRUCKS HANDLERS =========
  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/trucks`, { ...truckForm, organization_id: companyId }, config);
      setIsAddTruckOpen(false); setTruckForm({ plate_number: "", capacity: "5 Tons", status: "Active" }); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Failed to add truck."); } finally { setIsSubmitting(false); }
  };
  const handleEditTruck = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/trucks/${truckToEdit.id}`, truckToEdit, config);
      setIsEditTruckOpen(false); setTruckToEdit(null); fetchData();
    } catch (err: any) { setErrorMsg("Failed to update truck."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteTruck = async () => {
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/trucks/${truckToDelete.id}`, config);
      setIsDeleteTruckOpen(false); setTruckToDelete(null); fetchData();
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= DRIVERS HANDLERS =========
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/drivers`, { ...driverForm, organization_id: companyId }, config);
      setIsAddDriverOpen(false); setDriverForm({ full_name: "", phone_number: "", password: "", truck_id: "" }); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Failed to add driver."); } finally { setIsSubmitting(false); }
  };
  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/drivers/${driverToEdit.id}`, driverToEdit, config);
      setIsEditDriverOpen(false); setDriverToEdit(null); fetchData();
    } catch (err: any) { setErrorMsg("Failed to update driver."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteDriver = async () => {
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/drivers/${driverToDelete.id}`, config);
      setIsDeleteDriverOpen(false); setDriverToDelete(null); fetchData();
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= ROUTES HANDLERS =========
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/routes`, { ...routeForm, organization_id: companyId }, config);
      setIsAddRouteOpen(false); setRouteForm({ truck_id: "", ward_id: "", street_id: "" }); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Failed to assign route."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteRoute = async () => {
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("sm360_token")}` } };
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/routes/${routeToDelete.id}`, config);
      setIsDeleteRouteOpen(false); setRouteToDelete(null); 
      setActiveRouteMap(null);
      fetchData();
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview & Map" },
    { id: "fleet", label: "Fleet (Magari)" },
    { id: "drivers", label: "Drivers (Madereva)" },
    { id: "routes", label: "Routes (Ruti)" }
  ];

  return (
    <div className="bg-gray-50 md:bg-transparent min-h-screen pb-20 md:pb-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-primary text-white pt-8 pb-20 px-5 rounded-b-[2.5rem] relative shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/super-admin/companies" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors outline-none">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h2 className="text-xl font-bold truncate">{companyDetails?.name || "Loading..."}</h2>
            <p className="text-primary-foreground/70 text-xs flex items-center gap-2 mt-1">
              <Phone size={12} /> {companyDetails?.admin_phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 mt-4">
        <div className="flex items-center gap-2 text-sm mb-3">
          <Link href="/super-admin/companies" className="text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"><ArrowLeft size={16} /> Back to Companies</Link>
          <span className="text-gray-300">/</span><span className="text-primary font-medium">{companyDetails?.name || "Loading..."}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Building size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">{companyDetails?.name || "Loading..."} <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">ACTIVE</span></h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1.5"><Phone size={14} /> {companyDetails?.admin_phone || "No Phone"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-4 md:px-0 mt-6">
        <div className="bg-white rounded-3xl p-2 md:p-0 border border-gray-100 md:border-transparent mb-6">
          <div className="flex items-center gap-4 md:gap-6 md:border-b border-gray-200 overflow-x-auto hide-scrollbar px-2 md:px-0">
            {tabs.map((tab) => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)} 
                className={`text-sm font-bold whitespace-nowrap py-3 md:pb-3 transition-colors relative outline-none ${activeTab === tab.id ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab.label}
                {activeTab === tab.id && <span className="hidden md:block absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 relative z-10">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4"><Truck className="h-5 w-5 text-blue-600" /></div>
                <div><p className="text-gray-500 text-xs font-medium mb-1">Total Fleet</p><h3 className="text-2xl font-bold text-gray-900">{trucks.length}</h3></div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4"><Navigation className="h-5 w-5 text-emerald-600" /></div>
                <div><p className="text-gray-500 text-xs font-medium mb-1">Active Routes</p><h3 className="text-2xl font-bold text-gray-900">{routes.length}</h3></div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-4"><User className="h-5 w-5 text-orange-600" /></div>
                <div><p className="text-gray-500 text-xs font-medium mb-1">Drivers</p><h3 className="text-2xl font-bold text-gray-900">{drivers.length}</h3></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLEET */}
        {activeTab === "fleet" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search trucks..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <button onClick={() => setIsAddTruckOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Add Truck
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase">
                  <tr><th className="px-6 py-4 font-semibold">Plate Number</th><th className="px-6 py-4 font-semibold">Capacity</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trucks.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2"><Truck size={14} className="text-gray-400"/> {t.plate_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.capacity}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full outline-none">
                            <MoreHorizontal size={18} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 border-gray-200">
                            <DropdownMenuItem onClick={() => { setTruckToEdit(t); setIsEditTruckOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-gray-50"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setTruckToDelete(t); setIsDeleteTruckOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {trucks.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-sm text-gray-500">No trucks found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVERS */}
        {activeTab === "drivers" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search drivers..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <button onClick={() => setIsAddDriverOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Add Driver
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase">
                  <tr><th className="px-6 py-4 font-semibold">Driver Name</th><th className="px-6 py-4 font-semibold">Phone</th><th className="px-6 py-4 font-semibold">Assigned Truck</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2"><User size={14} className="text-gray-400"/> {d.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{d.phone_number}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{d.plate_number || "Unassigned"}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full outline-none">
                            <MoreHorizontal size={18} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 border-gray-200">
                            <DropdownMenuItem onClick={() => { setDriverToEdit(d); setIsEditDriverOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-gray-50"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setDriverToDelete(d); setIsDeleteDriverOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {drivers.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-sm text-gray-500">No drivers registered.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ROUTES & MAP */}
        {activeTab === "routes" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search routes..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <button onClick={() => setIsAddRouteOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Assign Route
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase">
                  <tr><th className="px-6 py-4 font-semibold">Coverage Area</th><th className="px-6 py-4 font-semibold">Assigned Truck</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {routes.map((r) => (
                    <tr key={r.id} className={`hover:bg-gray-50/50 transition-colors ${activeRouteMap?.id === r.id ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-gray-900">{r.ward_name}</p>
                        <p className="text-xs text-gray-500">{r.street_name || "Entire Ward Coverage"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{r.plate_number}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          <button onClick={() => setActiveRouteMap(r)} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold outline-none transition-colors flex items-center gap-1.5">
                            <MapIcon size={14}/> View Map
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full outline-none"><MoreHorizontal size={18} /></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 border-gray-200">
                              <DropdownMenuItem onClick={() => { setRouteToDelete(r); setIsDeleteRouteOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Remove Route</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {routes.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-sm text-gray-500">No routes assigned yet.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* DYNAMIC MAP VIEW YA ROUTES */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col mt-6">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Navigation className="text-primary" size={16} /> Live Coverage Map</h3>
              </div>
              <div className="h-[400px] w-full relative bg-blue-50/30 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                
                {activeRouteMap ? (
                  <div className="z-10 text-center p-6 bg-white/90 backdrop-blur-md border border-emerald-200 rounded-3xl max-w-md mx-auto animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><MapIcon size={32} /></div>
                    <h4 className="text-gray-900 font-bold mb-1">Route Active</h4>
                    <p className="text-sm text-gray-700 font-semibold mb-1">Ward Coverage: <span className="text-emerald-600">{activeRouteMap.ward_name}</span></p>
                    <p className="text-sm text-gray-700 mb-3">Street: {activeRouteMap.street_name || "All Streets in Ward"}</p>
                    <span className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 flex items-center justify-center gap-2 w-fit mx-auto">
                      <Truck size={12} className="text-blue-600" /> {activeRouteMap.plate_number}
                    </span>
                  </div>
                ) : (
                  <div className="z-10 text-center p-6 max-w-sm mx-auto">
                    <MapIcon size={48} className="mx-auto text-gray-300 mb-3"/>
                    <p className="text-gray-500 text-sm">Select <b className="text-emerald-600">"View Map"</b> from any route above to display the coverage area and live tracking.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================
          MODALS ZOTE (ADD, EDIT, DELETE)
          ======================================================== */}

      {/* --- TRUCKS MODALS --- */}
      <Dialog open={isAddTruckOpen} onOpenChange={setIsAddTruckOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Add Fleet (Truck)</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddTruck}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Plate Number</label>
              <input required value={truckForm.plate_number} onChange={e => setTruckForm({...truckForm, plate_number: e.target.value.toUpperCase()})} type="text" placeholder="e.g. T 123 ABC" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Capacity</label>
              <select required value={truckForm.capacity} onChange={e => setTruckForm({...truckForm, capacity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="3 Tons">3 Tons</option><option value="5 Tons">5 Tons</option><option value="10 Tons">10 Tons</option>
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddTruckOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Truck</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTruckOpen} onOpenChange={setIsEditTruckOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Truck</DialogTitle></DialogHeader>
          {truckToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditTruck}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Plate Number</label>
                <input required value={truckToEdit.plate_number} onChange={e => setTruckToEdit({...truckToEdit, plate_number: e.target.value.toUpperCase()})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Capacity</label>
                <select required value={truckToEdit.capacity} onChange={e => setTruckToEdit({...truckToEdit, capacity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="3 Tons">3 Tons</option><option value="5 Tons">5 Tons</option><option value="10 Tons">10 Tons</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select required value={truckToEdit.status} onChange={e => setTruckToEdit({...truckToEdit, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="Active">Active</option><option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditTruckOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Update</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteTruckOpen} onOpenChange={setIsDeleteTruckOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Remove Truck</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to remove <span className="font-bold">{truckToDelete?.plate_number}</span>?</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteTruckOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteTruck} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Remove</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- DRIVERS MODALS --- */}
      <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Register Driver</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddDriver}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input required value={driverForm.full_name} onChange={e => setDriverForm({...driverForm, full_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Phone</label>
                <input required value={driverForm.phone_number} onChange={e => setDriverForm({...driverForm, phone_number: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={driverForm.password} onChange={e => setDriverForm({...driverForm, password: e.target.value})} type="password" placeholder="***" className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-semibold text-gray-700">Assign Truck (Optional)</label>
                <select value={driverForm.truck_id} onChange={e => setDriverForm({...driverForm, truck_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">-- Leave Unassigned --</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>{t.plate_number}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddDriverOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Driver</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDriverOpen} onOpenChange={setIsEditDriverOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Driver</DialogTitle></DialogHeader>
          {driverToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditDriver}>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input required value={driverToEdit.full_name} onChange={e => setDriverToEdit({...driverToEdit, full_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Phone</label>
                <input required value={driverToEdit.phone_number} onChange={e => setDriverToEdit({...driverToEdit, phone_number: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Re-assign Truck</label>
                <select value={driverToEdit.truck_id || ""} onChange={e => setDriverToEdit({...driverToEdit, truck_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">-- No Truck Assigned --</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>{t.plate_number}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditDriverOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Update</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDriverOpen} onOpenChange={setIsDeleteDriverOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Remove Driver</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to remove <span className="font-bold">{driverToDelete?.full_name}</span>? This will unassign any truck they have.</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteDriverOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteDriver} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Remove</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ROUTES MODALS --- */}
      <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Assign Route</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddRoute}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Select Truck</label>
              <select required value={routeForm.truck_id} onChange={e => setRouteForm({...routeForm, truck_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">-- Chagua Gari --</option>
                {trucks.map(t => <option key={t.id} value={t.id}>{t.plate_number}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Select Ward</label>
                <select required value={routeForm.ward_id} onChange={e => setRouteForm({...routeForm, ward_id: e.target.value, street_id: ""})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">-- Kata --</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Street (Optional)</label>
                <select disabled={!routeForm.ward_id} value={routeForm.street_id} onChange={e => setRouteForm({...routeForm, street_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none disabled:opacity-50">
                  <option value="">-- Kata Nzima --</option>
                  {streets.filter(s => s.ward_id === parseInt(routeForm.ward_id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddRouteOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Route</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteRouteOpen} onOpenChange={setIsDeleteRouteOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Delete Route</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to remove this route assignment? The truck will no longer cover this area.</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteRouteOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteRoute} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete Route</button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}