"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, MoreVertical, MapPin, Home, CheckCircle2, Edit, Trash2, Map, Loader2 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LGAPropertiesPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("properties");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [adminContext, setAdminContext] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  // States: Properties
  const [isAddPropOpen, setIsAddPropOpen] = useState(false);
  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [isDeletePropOpen, setIsDeletePropOpen] = useState(false);
  const [propToEdit, setPropToEdit] = useState<any>(null);
  const [propToDelete, setPropToDelete] = useState<any>(null);
  const [propForm, setPropForm] = useState({ owner_name: "", phone_number: "", property_category: "Residential", street_id: "" });
  const [selectedWardForProp, setSelectedWardForProp] = useState("");

  // States: Wards
  const [isAddWardOpen, setIsAddWardOpen] = useState(false);
  const [isEditWardOpen, setIsEditWardOpen] = useState(false);
  const [isDeleteWardOpen, setIsDeleteWardOpen] = useState(false);
  const [wardName, setWardName] = useState("");
  const [wardToEdit, setWardToEdit] = useState<any>(null);
  const [wardToDelete, setWardToDelete] = useState<any>(null);

  // States: Streets
  const [isAddStreetOpen, setIsAddStreetOpen] = useState(false);
  const [isEditStreetOpen, setIsEditStreetOpen] = useState(false);
  const [isDeleteStreetOpen, setIsDeleteStreetOpen] = useState(false);
  const [streetForm, setStreetForm] = useState({ name: "", ward_id: "" });
  const [streetToEdit, setStreetToEdit] = useState<any>(null);
  const [streetToDelete, setStreetToDelete] = useState<any>(null);

  useEffect(() => {
    fetchLgaData();
  }, []);

  const fetchLgaData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }

      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const lgaAdmin = profileRes.data.data;
      setAdminContext(lgaAdmin);
      const lgaId = lgaAdmin.lga_id;

      const [resProps, resWards, resStreets] = await Promise.allSettled([
        axios.get(`${url}/api/super-admin/properties?lga_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/wards?organization_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/streets?lga_id=${lgaId}`, config)
      ]);

      if (resProps.status === "fulfilled") setProperties(resProps.value.data.data || []);
      if (resWards.status === "fulfilled") setWards(resWards.value.data.data || []);
      if (resStreets.status === "fulfilled") setStreets(resStreets.value.data.data || []);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========= PROPERTIES CRUD =========
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/properties`, { ...propForm, ward_id: selectedWardForProp, lga_id: adminContext.lga_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddPropOpen(false); 
      setPropForm({ owner_name: "", phone_number: "", property_category: "Residential", street_id: "" }); 
      setSelectedWardForProp(""); fetchLgaData(); 
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Error adding property."); } finally { setIsSubmitting(false); }
  };
  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/properties/${propToEdit.id}`, propToEdit, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditPropOpen(false); setPropToEdit(null); fetchLgaData(); 
    } catch (err: any) { setErrorMsg("Error updating."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteProperty = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/properties/${propToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeletePropOpen(false); setPropToDelete(null); fetchLgaData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= WARDS CRUD =========
  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/wards`, { name: wardName, organization_id: adminContext.lga_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddWardOpen(false); setWardName(""); fetchLgaData(); 
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Imeshindwa."); } finally { setIsSubmitting(false); }
  };
  const handleEditWard = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/wards/${wardToEdit.id}`, { name: wardToEdit.name }, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditWardOpen(false); setWardToEdit(null); fetchLgaData(); 
    } catch (err: any) { setErrorMsg("Error updating."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteWard = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/wards/${wardToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeleteWardOpen(false); setWardToDelete(null); fetchLgaData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= STREETS CRUD =========
  const handleAddStreet = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/streets`, { ...streetForm, lga_id: adminContext.lga_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddStreetOpen(false); setStreetForm({ name: "", ward_id: "" }); fetchLgaData(); 
    } catch (err: any) { setErrorMsg("Imeshindwa kusajili."); } finally { setIsSubmitting(false); }
  };
  const handleEditStreet = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/streets/${streetToEdit.id}`, { name: streetToEdit.name, ward_id: streetToEdit.ward_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditStreetOpen(false); setStreetToEdit(null); fetchLgaData(); 
    } catch (err: any) { setErrorMsg("Error updating."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteStreet = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/streets/${streetToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeleteStreetOpen(false); setStreetToDelete(null); fetchLgaData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & TABS NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Ecosystem Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage Properties, Wards, and Streets in your LGA</p>
        </div>

        <div className="bg-white rounded-2xl p-1.5 border border-gray-200 flex items-center w-fit">
          <button onClick={() => setActiveTab("properties")} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "properties" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900"}`}>Properties</button>
          <button onClick={() => setActiveTab("wards")} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "wards" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900"}`}>Wards</button>
          <button onClick={() => setActiveTab("streets")} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "streets" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900"}`}>Streets</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <>
          {/* ===================== TAB 1: PROPERTIES ===================== */}
          {activeTab === "properties" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search property or owner..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <button onClick={() => setIsAddPropOpen(true)} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors outline-none">
                    <Plus size={18} /> Add Property
                  </button>
                </div>
              </div>

              {/* PROPERTIES TABLE INAONYESHA DATA HALISI */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Property & Owner</th>
                        <th className="px-6 py-4 font-semibold">Location</th>
                        <th className="px-6 py-4 font-semibold">Type</th>
                        <th className="px-6 py-4 font-semibold">Bill Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {properties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Home className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{prop.owner_name}</p>
                                <p className="text-[11px] text-gray-400">ID: {prop.property_code} • {prop.phone_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{prop.ward_name}</p>
                            <p className="text-xs text-gray-500">{prop.street_name || 'Mtaa haujatajwa'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md block w-fit mb-1">{prop.property_category}</span>
                            <span className="text-xs font-bold text-gray-900">TZS {prop.property_category === 'Commercial' ? '15,000' : '5,000'} / mo</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle2 size={12} /> Cleared
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none ml-auto"><MoreVertical size={18} /></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 border-gray-100">
                                <DropdownMenuItem className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50"><Map className="mr-2 h-4 w-4 text-gray-500" /> View on Map</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setPropToEdit(prop); setIsEditPropOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setPropToDelete(prop); setIsDeletePropOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                      {properties.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-16 text-sm font-medium text-gray-400">No properties registered yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: WARDS ===================== */}
          {activeTab === "wards" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Search ward name..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <button onClick={() => setIsAddWardOpen(true)} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors outline-none">
                  <Plus size={18} /> Add Ward
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Ward Name</th>
                        <th className="px-6 py-4 font-semibold">Ward ID</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {wards.map((ward) => (
                        <tr key={ward.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-sm text-gray-900">{ward.name}</td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">#{ward.id}</td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none ml-auto"><MoreVertical size={18} /></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 border-gray-100">
                                <DropdownMenuItem onClick={() => { setWardToEdit(ward); setIsEditWardOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Ward</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setWardToDelete(ward); setIsDeleteWardOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                      {wards.length === 0 && <tr><td colSpan={3} className="text-center py-16 text-sm font-medium text-gray-400">No wards added yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: STREETS ===================== */}
          {activeTab === "streets" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Search street name..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <button onClick={() => setIsAddStreetOpen(true)} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors outline-none">
                  <Plus size={18} /> Add Street
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Street Name</th>
                        <th className="px-6 py-4 font-semibold">Ward (Kata)</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {streets.map((street) => (
                        <tr key={street.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-sm text-gray-900">{street.name}</td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500"><MapPin size={12} className="inline mr-1 text-primary"/>{street.ward_name}</td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors outline-none ml-auto"><MoreVertical size={18} /></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 border-gray-100">
                                <DropdownMenuItem onClick={() => { setStreetToEdit(street); setIsEditStreetOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Street</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setStreetToDelete(street); setIsDeleteStreetOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                      {streets.length === 0 && <tr><td colSpan={3} className="text-center py-16 text-sm font-medium text-gray-400">No streets added yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================== MODALS ZOTE (Add/Edit/Delete) ===================== */}
      
      {/* ADD PROPERTY */}
      <Dialog open={isAddPropOpen} onOpenChange={setIsAddPropOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Register New Property</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleAddProperty}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{errorMsg}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Owner's Name</label>
                <input required value={propForm.owner_name} onChange={e => setPropForm({...propForm, owner_name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input required value={propForm.phone_number} onChange={e => setPropForm({...propForm, phone_number: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ward / Zone</label>
                <select required value={selectedWardForProp} onChange={e => { setSelectedWardForProp(e.target.value); setPropForm({...propForm, street_id: ""}); }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="">-- Select Ward --</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Physical Address / Street</label>
                <select value={propForm.street_id} onChange={e => setPropForm({...propForm, street_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50">
                  <option value="">-- Mtaa (Optional) --</option>
                  {streets.filter(s => String(s.ward_id) === String(selectedWardForProp)).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Property Type</label>
              <select required value={propForm.property_category} onChange={e => setPropForm({...propForm, property_category: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddPropOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Property
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPropOpen} onOpenChange={setIsEditPropOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Property</DialogTitle></DialogHeader>
          {propToEdit && (
            <form className="space-y-4 mt-4" onSubmit={handleEditProperty}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Owner Name</label>
                <input required value={propToEdit.owner_name} onChange={e => setPropToEdit({...propToEdit, owner_name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone</label>
                <input required value={propToEdit.phone_number} onChange={e => setPropToEdit({...propToEdit, phone_number: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditPropOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update Property
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeletePropOpen} onOpenChange={setIsDeletePropOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Delete Property</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to delete property for <span className="font-bold">{propToDelete?.owner_name}</span>?</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeletePropOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteProperty} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WARDS MODALS */}
      <Dialog open={isAddWardOpen} onOpenChange={setIsAddWardOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Add Ward (Kata)</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddWard}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Ward Name</label>
              <input required value={wardName} onChange={e => setWardName(e.target.value)} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddWardOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditWardOpen} onOpenChange={setIsEditWardOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Ward</DialogTitle></DialogHeader>
          {wardToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditWard}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ward Name</label>
                <input required value={wardToEdit.name} onChange={e => setWardToEdit({...wardToEdit, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditWardOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteWardOpen} onOpenChange={setIsDeleteWardOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Delete Ward</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to delete <span className="font-bold">{wardToDelete?.name}</span>?</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteWardOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteWard} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* STREETS MODALS */}
      <Dialog open={isAddStreetOpen} onOpenChange={setIsAddStreetOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Add Street</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddStreet}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Ward</label>
              <select required value={streetForm.ward_id} onChange={e => setStreetForm({...streetForm, ward_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">-- Chagua Kata --</option>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Street Name</label>
              <input required value={streetForm.name} onChange={e => setStreetForm({...streetForm, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddStreetOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditStreetOpen} onOpenChange={setIsEditStreetOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Street</DialogTitle></DialogHeader>
          {streetToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditStreet}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Ward</label>
                <select required value={streetToEdit.ward_id} onChange={e => setStreetToEdit({...streetToEdit, ward_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Street Name</label>
                <input required value={streetToEdit.name} onChange={e => setStreetToEdit({...streetToEdit, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditStreetOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteStreetOpen} onOpenChange={setIsDeleteStreetOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Delete Street</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to delete <span className="font-bold">{streetToDelete?.name}</span>?</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteStreetOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteStreet} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}