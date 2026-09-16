"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import axios from "axios";
import { 
  ArrowLeft, Building2, Users, Wallet, MapPin, 
  MoreHorizontal, Map, Plus, Search, Edit, Trash2, Loader2, Navigation, Phone, Lock
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

export default function LGADetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const lgaId = unwrappedParams.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [lgaDetails, setLgaDetails] = useState<any>(null);
  const [wards, setWards] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // Wards States
  const [isAddWardOpen, setIsAddWardOpen] = useState(false);
  const [isEditWardOpen, setIsEditWardOpen] = useState(false);
  const [isDeleteWardOpen, setIsDeleteWardOpen] = useState(false);
  const [wardName, setWardName] = useState("");
  const [wardToEdit, setWardToEdit] = useState<any>(null);
  const [wardToDelete, setWardToDelete] = useState<any>(null);

  // Streets States
  const [isAddStreetOpen, setIsAddStreetOpen] = useState(false);
  const [isEditStreetOpen, setIsEditStreetOpen] = useState(false);
  const [isDeleteStreetOpen, setIsDeleteStreetOpen] = useState(false);
  const [streetForm, setStreetForm] = useState({ name: "", ward_id: "" });
  const [streetToEdit, setStreetToEdit] = useState<any>(null);
  const [streetToDelete, setStreetToDelete] = useState<any>(null);

  // Properties States
  const [isAddPropOpen, setIsAddPropOpen] = useState(false);
  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [isDeletePropOpen, setIsDeletePropOpen] = useState(false);
  const [propToEdit, setPropToEdit] = useState<any>(null);
  const [propToDelete, setPropToDelete] = useState<any>(null);
  const [propForm, setPropForm] = useState({ owner_name: "", phone_number: "", property_category: "Residential", total_units: 1, street_id: "" });
  const [selectedWardForProp, setSelectedWardForProp] = useState("");

  // Agents States
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isEditAgentOpen, setIsEditAgentOpen] = useState(false);
  const [isDeleteAgentOpen, setIsDeleteAgentOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({ full_name: "", phone_number: "", password: "", street_id: "" });
  const [agentToEdit, setAgentToEdit] = useState<any>(null);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  const [selectedWardForAgent, setSelectedWardForAgent] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resLga, resWards, resStreets, resProps, resAgents] = await Promise.allSettled([
        axios.get(`${url}/api/super-admin/organizations/${lgaId}`, config),
        axios.get(`${url}/api/super-admin/wards?organization_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/streets?lga_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/properties?lga_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/agents?lga_id=${lgaId}`, config)
      ]);

      if (resLga.status === "fulfilled") setLgaDetails(resLga.value.data.data);
      if (resWards.status === "fulfilled") setWards(resWards.value.data.data || []);
      if (resStreets.status === "fulfilled") setStreets(resStreets.value.data.data || []);
      if (resProps.status === "fulfilled") setProperties(resProps.value.data.data || []);
      if (resAgents.status === "fulfilled") setAgents(resAgents.value.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [lgaId]);

  // ========= WARD FUNCTIONS =========
  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/wards`, { name: wardName, organization_id: lgaId }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddWardOpen(false); setWardName(""); fetchData(); 
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Imeshindwa."); } finally { setIsSubmitting(false); }
  };
  const handleEditWard = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/wards/${wardToEdit.id}`, { name: wardToEdit.name }, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditWardOpen(false); setWardToEdit(null); fetchData(); 
    } catch (err: any) { setErrorMsg("Error updating."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteWard = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/wards/${wardToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeleteWardOpen(false); setWardToDelete(null); fetchData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= STREET FUNCTIONS =========
  const handleAddStreet = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/streets`, { ...streetForm, lga_id: lgaId }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddStreetOpen(false); setStreetForm({ name: "", ward_id: "" }); fetchData(); 
    } catch (err: any) { setErrorMsg("Imeshindwa kusajili."); } finally { setIsSubmitting(false); }
  };
  const handleEditStreet = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/streets/${streetToEdit.id}`, { name: streetToEdit.name, ward_id: streetToEdit.ward_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditStreetOpen(false); setStreetToEdit(null); fetchData(); 
    } catch (err: any) { setErrorMsg("Error updating."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteStreet = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/streets/${streetToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeleteStreetOpen(false); setStreetToDelete(null); fetchData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= PROPERTY FUNCTIONS =========
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/properties`, { ...propForm, ward_id: selectedWardForProp, lga_id: lgaId }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddPropOpen(false); 
      setPropForm({ owner_name: "", phone_number: "", property_category: "Residential", total_units: 1, street_id: "" }); 
      setSelectedWardForProp(""); fetchData(); 
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Error adding property."); } finally { setIsSubmitting(false); }
  };
  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/properties/${propToEdit.id}`, propToEdit, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditPropOpen(false); setPropToEdit(null); fetchData(); 
    } catch (err: any) { setErrorMsg("Error updating."); } finally { setIsSubmitting(false); }
  };
  const handleDeleteProperty = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/properties/${propToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeletePropOpen(false); setPropToDelete(null); fetchData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  // ========= AGENT FUNCTIONS =========
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/agents`, { ...agentForm, lga_id: lgaId }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddAgentOpen(false); 
      setAgentForm({ full_name: "", phone_number: "", password: "", street_id: "" }); 
      setSelectedWardForAgent(""); 
      fetchData(); // HII NDIYO INAYOSHUSHA AGENT CHINI MOJA KWA MOJA
    } catch (err: any) { 
      setErrorMsg(err.response?.data?.message || "Imeshindwa kusajili wakala."); 
    } finally { setIsSubmitting(false); }
  };
  
  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/agents/${agentToEdit.id}`, { full_name: agentToEdit.full_name, phone_number: agentToEdit.phone_number, street_id: agentToEdit.street_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditAgentOpen(false); setAgentToEdit(null); fetchData(); 
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Error updating agent."); } finally { setIsSubmitting(false); }
  };
  
  const handleDeleteAgent = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/agents/${agentToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeleteAgentOpen(false); setAgentToDelete(null); fetchData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview & Map" },
    { id: "wards", label: "Wards (Kata)" },
    { id: "streets", label: "Streets (Mitaa)" },
    { id: "properties", label: "Properties" },
    { id: "agents", label: "Field Agents" }
  ];

  return (
    <div className="bg-gray-50 md:bg-transparent min-h-screen pb-20 md:pb-10 animate-in fade-in duration-500">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-primary text-white pt-8 pb-20 px-5 rounded-b-[2.5rem] relative shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/super-admin/lgas" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors outline-none">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h2 className="text-xl font-bold truncate">{lgaDetails?.name || "Loading..."}</h2>
            <p className="text-primary-foreground/70 text-xs flex items-center gap-2 mt-1">
              <Phone size={12} /> {lgaDetails?.admin_phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 mt-4">
        <div className="flex items-center gap-2 text-sm mb-3">
          <Link href="/super-admin/lgas" className="text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"><ArrowLeft size={16} /> Back to LGAs</Link>
          <span className="text-gray-300">/</span><span className="text-primary font-medium">{lgaDetails?.name || "Loading..."}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              {lgaDetails?.name || "Loading..."} 
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE
              </span>
            </h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Users size={14} /> {lgaDetails?.admin_name || "No Admin"}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> {lgaDetails?.admin_phone || "N/A"}</span>
            </p>
          </div>
          <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 outline-none transition-colors">
            <Edit size={16} /> Edit Details
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-5 md:px-4 -mt-10 md:mt-6 relative z-10">
        
        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-3xl p-2 md:p-0 border border-gray-100 md:border-transparent mb-6">
          <div className="flex items-center gap-4 md:gap-6 md:border-b border-gray-200 overflow-x-auto hide-scrollbar px-2 md:px-0">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-sm font-bold whitespace-nowrap py-3 md:pb-3 transition-colors relative outline-none ${ activeTab === tab.id ? "text-primary" : "text-gray-400 hover:text-gray-600" }`}>
                {tab.label}
                {activeTab === tab.id && <span className="hidden md:block absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
                {activeTab === tab.id && <span className="md:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OVERVIEW & MAP */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-3xl p-4 border border-gray-200 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mb-4"><Wallet className="h-4 w-4 text-emerald-600" /></div>
                <div><p className="text-gray-400 text-xs font-medium mb-1">Total Revenue</p><h3 className="text-xl font-bold text-gray-900">TZS 4.2M</h3></div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-gray-200 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mb-4"><Map className="h-4 w-4 text-blue-600" /></div>
                <div><p className="text-gray-400 text-xs font-medium mb-1">Total Wards</p><h3 className="text-xl font-bold text-gray-900">{wards.length}</h3></div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-gray-200 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center mb-4"><Building2 className="h-4 w-4 text-purple-600" /></div>
                <div><p className="text-gray-400 text-xs font-medium mb-1">Total Streets</p><h3 className="text-xl font-bold text-gray-900">{streets.length}</h3></div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-gray-200 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mb-4"><Users className="h-4 w-4 text-orange-600" /></div>
                <div><p className="text-gray-400 text-xs font-medium mb-1">Field Agents</p><h3 className="text-xl font-bold text-gray-900">{agents.length}</h3></div>
              </div>
            </div>

            {/* SEHEMU YA MAP */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col mt-6">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Navigation className="text-gray-400" size={16} /> Wards, Streets & Collection Routes</h3>
                <button className="text-sm text-primary hover:underline font-medium outline-none">Expand Map</button>
              </div>
              <div className="h-[300px] md:h-[450px] w-full relative bg-blue-50/50 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="z-10 text-center p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Map size={32} /></div>
                  <h4 className="text-gray-900 font-bold mb-2">Map Integration Ready</h4>
                  <p className="text-gray-500 text-sm mb-4">Ramani itachorwa hapa kuonyesha mipaka ya kata zote, mitaa, na ruti za malori.</p>
                  <button className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors">Connect GIS System</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WARDS */}
        {activeTab === "wards" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Filter by ward name..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <button onClick={() => setIsAddWardOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Add Ward
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              {isLoading ? ( <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : wards.length > 0 ? wards.map((ward) => (
                <div key={ward.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{ward.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500"><span>Ward ID: {ward.id}</span></div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary rounded-full outline-none"><MoreHorizontal size={18} /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-2">
                      <DropdownMenuItem onClick={() => { setWardToEdit(ward); setIsEditWardOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-gray-50 outline-none"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Ward</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setWardToDelete(ward); setIsDeleteWardOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 outline-none"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )) : ( <div className="p-10 text-center"><p className="text-gray-500 text-sm">No wards added.</p></div> )}
            </div>
          </div>
        )}

        {/* TAB 3: STREETS */}
        {activeTab === "streets" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Filter by street name..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <button onClick={() => setIsAddStreetOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Add Street
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              {isLoading ? ( <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : streets.length > 0 ? streets.map((street) => (
                <div key={street.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{street.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <MapPin size={12} className="text-emerald-500"/> <span>Ward: {street.ward_name}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary rounded-full outline-none"><MoreHorizontal size={18} /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-2">
                      <DropdownMenuItem onClick={() => { setStreetToEdit(street); setIsEditStreetOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-gray-50 outline-none"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Street</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setStreetToDelete(street); setIsDeleteStreetOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 outline-none"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )) : ( <div className="p-10 text-center"><p className="text-gray-500 text-sm">No streets added yet.</p></div> )}
            </div>
          </div>
        )}

        {/* TAB 4: PROPERTIES */}
        {activeTab === "properties" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Filter by owner or phone..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <button onClick={() => setIsAddPropOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Add Prop
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              {isLoading ? ( <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : properties.length > 0 ? properties.map((prop) => (
                <div key={prop.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{prop.owner_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{prop.phone_number}</span><span className="w-1 h-1 rounded-full bg-gray-300"></span><span>{prop.property_category}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary rounded-full outline-none"><MoreHorizontal size={18} /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-2">
                      <DropdownMenuItem onClick={() => { setPropToEdit(prop); setIsEditPropOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-gray-50 outline-none"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Prop</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setPropToDelete(prop); setIsDeletePropOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 outline-none"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )) : ( <div className="p-10 text-center"><p className="text-gray-500 text-sm">No properties registered yet.</p></div> )}
            </div>
          </div>
        )}

        {/* TAB 5: AGENTS */}
        {activeTab === "agents" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl p-3 border border-gray-200 flex flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Filter by agent name or phone..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <button onClick={() => setIsAddAgentOpen(true)} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center gap-2 outline-none">
                <Plus size={18} /> Add Agent
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              {isLoading ? ( <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : agents.length > 0 ? agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{agent.full_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Phone size={12} className="text-blue-500"/> <span>{agent.phone_number}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <MapPin size={12} className="text-emerald-500"/> <span>{agent.ward_name || 'Kata Haijapangwa'} {agent.street_name ? `(${agent.street_name})` : ''}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-primary rounded-full outline-none"><MoreHorizontal size={18} /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-2">
                      <DropdownMenuItem onClick={() => { 
                        setAgentToEdit(agent); 
                        setSelectedWardForAgent(agent.ward_id?.toString() || "");
                        setIsEditAgentOpen(true); 
                      }} className="text-xs cursor-pointer rounded-lg hover:bg-gray-50 outline-none"><Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Agent</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setAgentToDelete(agent); setIsDeleteAgentOpen(true); }} className="text-xs cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 outline-none"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )) : ( <div className="p-10 text-center"><p className="text-gray-500 text-sm">No Field Agents registered yet.</p></div> )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          MODALS ZOTE (ADD, EDIT, DELETE)
          ======================================================== */}

      {/* --- WARDS MODALS --- */}
      <Dialog open={isAddWardOpen} onOpenChange={setIsAddWardOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Add Ward (Kata)</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddWard}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Ward Name</label>
              <input required value={wardName} onChange={e => setWardName(e.target.value)} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
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
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Ward</DialogTitle></DialogHeader>
          {wardToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditWard}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Ward Name</label>
                <input required value={wardToEdit.name} onChange={e => setWardToEdit({...wardToEdit, name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
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
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
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


      {/* --- STREETS MODALS --- */}
      <Dialog open={isAddStreetOpen} onOpenChange={setIsAddStreetOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Add Street</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddStreet}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Select Ward (Kata)</label>
              <select required value={streetForm.ward_id} onChange={e => setStreetForm({...streetForm, ward_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">-- Chagua Kata --</option>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Street Name</label>
              <input required value={streetForm.name} onChange={e => setStreetForm({...streetForm, name: e.target.value})} type="text" placeholder="e.g. Mtaa wa Fisi" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
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
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Street</DialogTitle></DialogHeader>
          {streetToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditStreet}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Select Ward (Kata)</label>
                <select required value={streetToEdit.ward_id} onChange={e => setStreetToEdit({...streetToEdit, ward_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Street Name</label>
                <input required value={streetToEdit.name} onChange={e => setStreetToEdit({...streetToEdit, name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
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
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
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


      {/* --- PROPERTIES MODALS --- */}
      <Dialog open={isAddPropOpen} onOpenChange={setIsAddPropOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Add Property</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddProperty}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Select Ward</label>
                <select required value={selectedWardForProp} onChange={e => { setSelectedWardForProp(e.target.value); setPropForm({...propForm, street_id: ""}); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">-- Kata --</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Select Street</label>
                <select value={propForm.street_id} onChange={e => setPropForm({...propForm, street_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none disabled:opacity-50">
                  <option value="">-- Mtaa (Optional) --</option>
                  {streets.filter(s => s.ward_id === parseInt(selectedWardForProp)).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-gray-700">Owner Name</label>
                <input required value={propForm.owner_name} onChange={e => setPropForm({...propForm, owner_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Phone</label>
                <input required value={propForm.phone_number} onChange={e => setPropForm({...propForm, phone_number: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Property Type</label>
                <select required value={propForm.property_category} onChange={e => setPropForm({...propForm, property_category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
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
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Property</DialogTitle></DialogHeader>
          {propToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditProperty}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Owner Name</label>
                  <input required value={propToEdit.owner_name} onChange={e => setPropToEdit({...propToEdit, owner_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Phone</label>
                  <input required value={propToEdit.phone_number} onChange={e => setPropToEdit({...propToEdit, phone_number: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditPropOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeletePropOpen} onOpenChange={setIsDeletePropOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Delete Property</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to delete <span className="font-bold">{propToDelete?.owner_name}</span>'s property?</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeletePropOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteProperty} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- AGENTS MODALS --- */}
      <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Register Field Agent</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleAddAgent}>
            {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{errorMsg}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <input required value={agentForm.full_name} onChange={e => setAgentForm({...agentForm, full_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Phone</label>
                <input required value={agentForm.phone_number} onChange={e => setAgentForm({...agentForm, phone_number: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={agentForm.password} onChange={e => setAgentForm({...agentForm, password: e.target.value})} type="password" placeholder="***" className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Select Ward</label>
                <select required value={selectedWardForAgent} onChange={e => { setSelectedWardForAgent(e.target.value); setAgentForm({...agentForm, street_id: ""}); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">-- Kata --</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Select Street</label>
                <select value={agentForm.street_id} onChange={e => setAgentForm({...agentForm, street_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none disabled:opacity-50">
                  <option value="">-- Mtaa (Optional) --</option>
                  {streets.filter(s => s.ward_id === parseInt(selectedWardForAgent)).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddAgentOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full flex items-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Agent
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAgentOpen} onOpenChange={setIsEditAgentOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Agent</DialogTitle></DialogHeader>
          {agentToEdit && (
            <form className="space-y-4 mt-2" onSubmit={handleEditAgent}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <input required value={agentToEdit.full_name} onChange={e => setAgentToEdit({...agentToEdit, full_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Phone</label>
                <input required value={agentToEdit.phone_number} onChange={e => setAgentToEdit({...agentToEdit, phone_number: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Select Ward</label>
                  <select required value={selectedWardForAgent} onChange={e => { setSelectedWardForAgent(e.target.value); setAgentToEdit({...agentToEdit, street_id: ""}); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Select Street</label>
                  <select value={agentToEdit.street_id || ""} onChange={e => setAgentToEdit({...agentToEdit, street_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                    <option value="">-- Mtaa (Optional) --</option>
                    {streets.filter(s => s.ward_id === parseInt(selectedWardForAgent)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditAgentOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAgentOpen} onOpenChange={setIsDeleteAgentOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Remove Agent</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to remove <span className="font-bold">{agentToDelete?.full_name}</span>?</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteAgentOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteAgent} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}