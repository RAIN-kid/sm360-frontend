"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, Plus, Building2, User, 
  Home, LogOut, CheckCircle2, FileText, ArrowLeft, Crosshair, Loader2, Map, Edit
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AgentAppPage() {
  const router = useRouter();
  
  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState("home"); // "home", "history", "points"
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAddingPoint, setIsAddingPoint] = useState(false); 
  const [editingPoint, setEditingPoint] = useState<any>(null); 
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [agentContext, setAgentContext] = useState<any>(null);
  const [streets, setStreets] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<any[]>([]);

  // Form ya Nyumba (Imesheheni Data Zote Ulizoweka)
  const [formData, setFormData] = useState({
    owner_name: "", phone_number: "", house_number: "",
    property_category: "Residential", building_use: "Single Family", total_units: 1,
    street_id: "", collection_point_id: "", latitude: null as number | null, longitude: null as number | null
  });

  // Form ya Kituo Kipya/Kuedit
  const [pointData, setPointData] = useState({ name: "", latitude: null as number | null, longitude: null as number | null });

  useEffect(() => {
    fetchRealProfileAndData();
  }, []);

  const fetchRealProfileAndData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }

      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const agentData = profileRes.data.data;
      setAgentContext(agentData);

      setFormData(prev => ({ ...prev, street_id: agentData.street_id?.toString() || "" }));

      const [streetsRes, propsRes, pointsRes] = await Promise.all([
        axios.get(`${url}/api/super-admin/streets?lga_id=${agentData.lga_id}`, config),
        axios.get(`${url}/api/super-admin/properties?lga_id=${agentData.lga_id}`, config),
        axios.get(`${url}/api/super-admin/collection-points?ward_id=${agentData.ward_id}`, config)
      ]);

      const filteredStreets = streetsRes.data.data.filter((s: any) => s.ward_id === agentData.ward_id);
      setStreets(filteredStreets);
      setCollectionPoints(pointsRes.data.data || []);

      const myProps = propsRes.data.data.filter((p: any) => p.agent_id === agentData.id);
      setRecentRegistrations(myProps);

    } catch (error) {
      console.error("Failed to load agent profile", error);
      alert("Session imekwisha au Network Error. Tafadhali login upya.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pata GPS ya Nyumba
  const handleGetPropertyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({ ...formData, latitude: position.coords.latitude, longitude: position.coords.longitude });
          setIsLocating(false);
        },
        (error) => { alert("Washa GPS kwenye simu yako."); setIsLocating(false); },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Simu yako haisupport GPS."); setIsLocating(false);
    }
  };

  // Pata GPS ya Kituo
  const handleGetPointLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPointData({ ...pointData, latitude: position.coords.latitude, longitude: position.coords.longitude });
          setIsLocating(false);
        },
        (error) => { alert("Washa GPS kwenye simu yako."); setIsLocating(false); },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Simu yako haisupport GPS."); setIsLocating(false);
    }
  };

  // Save Kituo Kipya au Ku-Update
  const handleSavePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointData.latitude || !pointData.longitude) return alert("Soma GPS kwanza!");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingPoint) {
        await axios.put(`${url}/api/super-admin/collection-points/${editingPoint.id}`, {
          name: pointData.name, latitude: pointData.latitude, longitude: pointData.longitude
        }, config);
        setEditingPoint(null);
      } else {
        const res = await axios.post(`${url}/api/super-admin/collection-points`, {
          ward_id: agentContext.ward_id, name: pointData.name, latitude: pointData.latitude, longitude: pointData.longitude
        }, config);
        setFormData({ ...formData, collection_point_id: res.data.data.id.toString() });
      }
      
      const pointsRes = await axios.get(`${url}/api/super-admin/collection-points?ward_id=${agentContext.ward_id}`, config);
      setCollectionPoints(pointsRes.data.data || []);

      setIsAddingPoint(false);
      setPointData({ name: "", latitude: null, longitude: null });
    } catch (error) {
      alert("Imeshindwa kusave kituo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditPoint = (point: any) => {
    setEditingPoint(point);
    setPointData({ name: point.name, latitude: point.latitude, longitude: point.longitude });
    setIsAddingPoint(true);
  };

  // Save Nyumba
  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) return alert("Tafadhali chukua Location (GPS) ya Nyumba kwanza!");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const payload = {
        ...formData,
        lga_id: agentContext.lga_id,
        ward_id: agentContext.ward_id,
        agent_id: agentContext.id,
        collection_point_id: formData.collection_point_id === "" ? null : formData.collection_point_id
      };

      await axios.post(`${url}/api/super-admin/properties`, payload, { headers: { Authorization: `Bearer ${token}` } });
      
      setFormData({
        owner_name: "", phone_number: "", house_number: "", 
        property_category: "Residential", building_use: "Single Family", total_units: 1, 
        street_id: agentContext.street_id || "", collection_point_id: "", latitude: null, longitude: null
      });
      setIsRegistering(false);
      setActiveNavTab("history"); 
      fetchRealProfileAndData(); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Imeshindwa kusajili nyumba.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !agentContext) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 size={40} className="animate-spin" />
          <p className="font-bold text-sm">Inatambua Wakala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen relative flex flex-col pb-20">
        
        {/* HEADER SECTION */}
        <div className="bg-primary text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shrink-0 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-white/80 text-[11px] font-medium mb-0.5">Wakala Wa {agentContext.lga_name || "LGA"}</p>
              <h2 className="text-xl font-bold">{agentContext.full_name}</h2>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User size={20} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-50">
            <span className="bg-white/20 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 text-xs backdrop-blur-sm">
              <MapPin size={12} /> Kata: {agentContext.ward_name || "Hajapangiwa"}
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 px-5 -mt-10 overflow-y-auto relative z-20">
          
          {/* ================= HOME VIEW ================= */}
          {activeNavTab === "home" && !isRegistering && !isAddingPoint && (
            <div className="animate-in fade-in duration-300 space-y-5">
              <div className="bg-white rounded-3xl p-5 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Jumla Ulizosajili</p>
                  <h3 className="text-3xl font-bold text-gray-900">{recentRegistrations.length}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Building2 size={24} className="text-primary" />
                </div>
              </div>

              <button 
                onClick={() => setIsRegistering(true)} 
                className="w-full py-4 rounded-3xl bg-primary text-white font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 outline-none"
              >
                <Plus size={20} /> Sajili Nyumba Mpya
              </button>
            </div>
          )}

          {/* ================= HISTORY VIEW ================= */}
          {activeNavTab === "history" && !isRegistering && !isAddingPoint && (
            <div className="animate-in fade-in duration-300">
              <h3 className="font-bold text-gray-900 mb-4 px-2">Historia Ya Usajili Yako</h3>
              <div className="space-y-3">
                {recentRegistrations.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-start gap-3">
                    <div className="shrink-0 mt-1"><CheckCircle2 size={20} className="text-emerald-500" /></div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{item.owner_name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Bili Na: {item.property_code} • {item.house_number !== 'N/A' ? item.house_number : 'Haina Namba'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{item.property_category}</span>
                        <span className="text-[10px] font-medium text-primary bg-blue-50 px-2 py-0.5 rounded-md">{item.street_name || "Mtaa Haupo"}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentRegistrations.length === 0 && (
                  <div className="text-center p-8 bg-white border border-gray-100 rounded-3xl text-gray-400 text-sm">
                    Hujasajili nyumba yoyote bado.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= POINTS (VITUO) VIEW ================= */}
          {activeNavTab === "points" && !isRegistering && !isAddingPoint && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-gray-900">Vituo Vya Taka (Kata)</h3>
                <button onClick={() => setIsAddingPoint(true)} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-[0.98]">
                  <Plus size={14}/> Ongeza
                </button>
              </div>
              <div className="space-y-3">
                {collectionPoints.map((point) => (
                  <div key={point.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{point.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Vituo vya Malori</p>
                      </div>
                    </div>
                    <button onClick={() => openEditPoint(point)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-full transition-colors">
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
                {collectionPoints.length === 0 && (
                  <div className="text-center p-8 bg-white border border-gray-100 rounded-3xl text-gray-400 text-sm">
                    Hakuna vituo vilivyosajiliwa.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= REGISTRATION FORM (NYUMBA) ================= */}
          {isRegistering && !isAddingPoint && (
            <div className="bg-white rounded-3xl p-5 border border-gray-100 animate-in slide-in-from-right-4 duration-300 mb-8">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                <button onClick={() => setIsRegistering(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600 outline-none"><ArrowLeft size={18} /></button>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Usajili Mpya Nyumba</h3>
                  <p className="text-[11px] text-gray-400">Jaza taarifa kwa usahihi</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmitProperty}>
                
                {/* LOCATION YA NYUMBA (LAZIMA) */}
                <div className="space-y-2 border-b border-gray-100 pb-4">
                  <label className="text-[11px] font-bold text-gray-800 px-1">Location ya Nyumba Yenyewe (Lazima)</label>
                  <button type="button" onClick={handleGetPropertyLocation} className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 outline-none border ${formData.latitude ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 active:scale-[0.98]"}`}>
                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : formData.latitude ? <CheckCircle2 size={16} /> : <Crosshair size={16} />}
                    {isLocating ? "Inasoma GPS..." : formData.latitude ? "GPS Imechukuliwa" : "Soma GPS ya Nyumba Hapa"}
                  </button>
                </div>

                {/* KITUO CHA TAKA (OPTIONAL) */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <label className="text-[11px] font-semibold text-blue-800 block">Je, inatumia Kituo cha Taka barabarani? (Sio Lazima)</label>
                  <div className="flex gap-2">
                    <select value={formData.collection_point_id} onChange={e => setFormData({...formData, collection_point_id: e.target.value})} className="flex-1 px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm outline-none">
                      <option value="">-- Haina Kituo (Gari linafika hapa) --</option>
                      {collectionPoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* TAARIFA ZA KAWAIDA */}
                {!agentContext.street_id && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 px-1">Mtaa</label>
                    <select required value={formData.street_id} onChange={e => setFormData({...formData, street_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none">
                      <option value="">-- Chagua Mtaa --</option>
                      {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-600 px-1">Jina La Mwenye Nyumba / Msimamizi</label>
                  <input required value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-600 px-1">Namba ya Simu</label>
                  <input required value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none" />
                </div>

                {/* HAPA NDIPO KUNA DATA ZAKO ZOTE ULIZOWEKA MWANZO */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-700 block">Kategoria ya Jengo</label>
                    <select required value={formData.property_category} onChange={e => setFormData({...formData, property_category: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none">
                      <option value="Residential">Makazi (Nyumba Kawaida)</option>
                      <option value="Commercial">Biashara / Duka / Hoteli</option>
                      <option value="Institution">Taasisi / Shule / Hospitali</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-700 block">Matumizi Hasa</label>
                    <select required value={formData.building_use} onChange={e => setFormData({...formData, building_use: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none">
                      {formData.property_category === "Commercial" ? (
                        <><option value="Retail Shop">Duka la Rejareja</option><option value="Hotel/Lodge">Hoteli / Lodge</option><option value="Restaurant/Bar">Mgahawa / Bar</option></>
                      ) : formData.property_category === "Institution" ? (
                        <><option value="School">Shule / Chuo</option><option value="Hospital/Clinic">Hospitali / Zahanati</option></>
                      ) : (
                        <><option value="Single Family">Nyumba Inayojitegemea</option><option value="Multi-Tenant">Nyumba ya Kupanga</option></>
                      )}
                    </select>
                  </div>

                  {formData.building_use === "Multi-Tenant" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-700 block">Idadi ya Vyumba / Kaya za Wapangaji</label>
                      <input required type="number" min="1" value={formData.total_units} onChange={e => setFormData({...formData, total_units: parseInt(e.target.value) || 1})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none" />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 outline-none mt-6 ${formData.latitude ? "bg-primary text-white active:scale-[0.98]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} 
                  {isSubmitting ? "Inasave..." : "Save na Tuma Data"}
                </button>
              </form>
            </div>
          )}

          {/* ================= FORM YA KUTENGENEZA/KUEDIT KITUO ================= */}
          {isAddingPoint && (
            <div className="bg-white rounded-3xl p-5 border border-gray-100 animate-in slide-in-from-right-4 duration-300 mb-8">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                <button type="button" onClick={() => { setIsAddingPoint(false); setEditingPoint(null); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600 outline-none"><ArrowLeft size={18} /></button>
                <div>
                  <h3 className="text-base font-bold text-emerald-700">{editingPoint ? "Edit Kituo" : "Tengeneza Kituo Kipya"}</h3>
                  <p className="text-[11px] text-gray-400">Mahali lori litakaposimama</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSavePoint}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-600 px-1">Jina la Kituo</label>
                  <input required value={pointData.name} onChange={e => setPointData({...pointData, name: e.target.value})} type="text" placeholder="Mf. Kituo cha Njia Panda" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none" />
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-semibold text-gray-600 px-1">Location (GPS) ya Kituo</label>
                  <button type="button" onClick={handleGetPointLocation} className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 outline-none border ${pointData.latitude ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50 active:scale-[0.98]"}`}>
                    {isLocating ? <Loader2 size={18} className="animate-spin" /> : pointData.latitude ? <CheckCircle2 size={18} /> : <Crosshair size={18} />}
                    {isLocating ? "Inasoma GPS..." : pointData.latitude ? "Location Imechukuliwa" : "Soma Location Hapa Uliopo (GPS)"}
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 outline-none mt-6 ${pointData.latitude ? "bg-emerald-600 text-white active:scale-[0.98]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Map size={18} />} 
                  {isSubmitting ? "Inasave..." : "Hifadhi Kituo"}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
          <button onClick={() => { setActiveNavTab("home"); setIsRegistering(false); setIsAddingPoint(false); }} className={`flex flex-col items-center gap-1 transition-colors outline-none w-16 ${activeNavTab === "home" && !isRegistering && !isAddingPoint ? 'text-primary' : 'text-gray-400'}`}>
            <Home size={22} className={activeNavTab === "home" && !isRegistering && !isAddingPoint ? "fill-primary/20" : ""} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          
          <button onClick={() => { setActiveNavTab("points"); setIsRegistering(false); setIsAddingPoint(false); }} className={`flex flex-col items-center gap-1 transition-colors outline-none w-16 ${activeNavTab === "points" || isAddingPoint ? 'text-emerald-600' : 'text-gray-400'}`}>
            <Map size={22} className={activeNavTab === "points" || isAddingPoint ? "fill-emerald-600/20" : ""} />
            <span className="text-[10px] font-semibold">Vituo</span>
          </button>

          <button onClick={() => { setActiveNavTab("history"); setIsRegistering(false); setIsAddingPoint(false); }} className={`flex flex-col items-center gap-1 transition-colors outline-none w-16 ${activeNavTab === "history" && !isRegistering && !isAddingPoint ? 'text-primary' : 'text-gray-400'}`}>
            <FileText size={22} className={activeNavTab === "history" && !isRegistering && !isAddingPoint ? "fill-primary/20" : ""} />
            <span className="text-[10px] font-semibold">Historia</span>
          </button>
          
          <button onClick={() => { localStorage.removeItem("sm360_token"); router.push("/login"); }} className="flex flex-col items-center gap-1 text-red-400 hover:text-red-600 transition-colors outline-none w-16">
            <LogOut size={22} />
            <span className="text-[10px] font-semibold">Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
}