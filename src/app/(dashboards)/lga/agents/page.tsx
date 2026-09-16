"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, MoreVertical, Users, CheckCircle2, ShieldBan, Edit, BarChart, Trash2, MapPin, Loader2, Lock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LGAAgentsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [adminContext, setAdminContext] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  // States: Modals & Forms
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({ full_name: "", phone_number: "", password: "", street_id: "" });
  const [agentToEdit, setAgentToEdit] = useState<any>(null);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  const [selectedWardForAgent, setSelectedWardForAgent] = useState("");

  useEffect(() => {
    fetchAgentsData();
  }, []);

  const fetchAgentsData = async () => {
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

      const [resAgents, resWards, resStreets] = await Promise.allSettled([
        axios.get(`${url}/api/super-admin/agents?lga_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/wards?organization_id=${lgaId}`, config),
        axios.get(`${url}/api/super-admin/streets?lga_id=${lgaId}`, config)
      ]);

      if (resAgents.status === "fulfilled") setAgents(resAgents.value.data.data || []);
      if (resWards.status === "fulfilled") setWards(resWards.value.data.data || []);
      if (resStreets.status === "fulfilled") setStreets(resStreets.value.data.data || []);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${url}/api/super-admin/agents`, { ...agentForm, lga_id: adminContext.lga_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsAddOpen(false); 
      setAgentForm({ full_name: "", phone_number: "", password: "", street_id: "" }); 
      setSelectedWardForAgent(""); 
      fetchAgentsData();
    } catch (err: any) { 
      setErrorMsg(err.response?.data?.message || "Imeshindwa kusajili wakala."); 
    } finally { setIsSubmitting(false); }
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg("");
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${url}/api/super-admin/agents/${agentToEdit.id}`, { full_name: agentToEdit.full_name, phone_number: agentToEdit.phone_number, street_id: agentToEdit.street_id }, { headers: { Authorization: `Bearer ${t}` }});
      setIsEditOpen(false); setAgentToEdit(null); fetchAgentsData(); 
    } catch (err: any) { setErrorMsg(err.response?.data?.message || "Error updating agent."); } finally { setIsSubmitting(false); }
  };

  const handleDeleteAgent = async () => {
    setIsSubmitting(true);
    try {
      const t = localStorage.getItem("sm360_token"); const url = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${url}/api/super-admin/agents/${agentToDelete.id}`, { headers: { Authorization: `Bearer ${t}` }});
      setIsDeleteOpen(false); setAgentToDelete(null); fetchAgentsData();
    } catch (err: any) { console.error(err); } finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Field Agents</h2>
          <p className="text-gray-500 text-sm mt-1">Manage personnel responsible for property registration</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors w-fit shadow-md shadow-primary/20 outline-none">
            <Plus size={18} />
            <span>Add New Agent</span>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Register Field Agent</DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Create an account for a new field agent to access the mobile app.
              </DialogDescription>
            </DialogHeader>
            
            <form className="space-y-4 mt-4" onSubmit={handleAddAgent}>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{errorMsg}</div>}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input required value={agentForm.full_name} onChange={e => setAgentForm({...agentForm, full_name: e.target.value})} type="text" placeholder="e.g. John Doe" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number (Login ID)</label>
                <input required value={agentForm.phone_number} onChange={e => setAgentForm({...agentForm, phone_number: e.target.value})} type="text" placeholder="07XX XXX XXX" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={agentForm.password} onChange={e => setAgentForm({...agentForm, password: e.target.value})} type="password" placeholder="***" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Assigned Ward</label>
                  <select required value={selectedWardForAgent} onChange={e => { setSelectedWardForAgent(e.target.value); setAgentForm({...agentForm, street_id: ""}); }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                    <option value="">-- Kata --</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Assigned Street</label>
                  <select value={agentForm.street_id} onChange={e => setAgentForm({...agentForm, street_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50">
                    <option value="">-- Mtaa (Optional) --</option>
                    {streets.filter(s => String(s.ward_id) === String(selectedWardForAgent)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-full transition-colors shadow-md shadow-primary/20 outline-none">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Agent"}
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
          <input type="text" placeholder="Search agent name or phone..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Agent Details</th>
                <th className="px-6 py-4 font-semibold">Assigned Ward</th>
                <th className="px-6 py-4 font-semibold">Properties Registered</th>
                <th className="px-6 py-4 font-semibold">Account Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{agent.full_name}</p>
                        <p className="text-[11px] text-gray-400">{agent.phone_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {agent.ward_name || 'Hajapangiwa'} <br />
                    <span className="text-[10px] text-gray-400">{agent.street_name || ''}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">0</span>
                    <span className="text-[11px] text-gray-400 ml-2">Properties</span>
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
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50">
                          <BarChart className="mr-2 h-4 w-4 text-gray-500" /> View Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { 
                          setAgentToEdit(agent); 
                          setSelectedWardForAgent(agent.ward_id?.toString() || "");
                          setIsEditOpen(true); 
                        }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50">
                          <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setAgentToDelete(agent); setIsDeleteOpen(true); }} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-sm text-gray-500">
                    No field agents registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT AGENT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">Edit Agent Details</DialogTitle></DialogHeader>
          {agentToEdit && (
            <form className="space-y-4 mt-4" onSubmit={handleEditAgent}>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{errorMsg}</div>}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input required value={agentToEdit.full_name} onChange={e => setAgentToEdit({...agentToEdit, full_name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone</label>
                <input required value={agentToEdit.phone_number} onChange={e => setAgentToEdit({...agentToEdit, phone_number: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Ward / Zone</label>
                  <select required value={selectedWardForAgent} onChange={e => { setSelectedWardForAgent(e.target.value); setAgentToEdit({...agentToEdit, street_id: ""}); }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">-- Kata --</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Street</label>
                  <select value={agentToEdit.street_id || ""} onChange={e => setAgentToEdit({...agentToEdit, street_id: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
                    <option value="">-- Mtaa (Optional) --</option>
                    {streets.filter(s => String(s.ward_id) === String(selectedWardForAgent)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update Agent
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE AGENT MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">Remove Agent</DialogTitle></DialogHeader>
          <div className="text-gray-600 mt-2">Are you sure you want to remove <span className="font-bold">{agentToDelete?.full_name}</span>? They will no longer be able to access the system.</div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full outline-none">Cancel</button>
            <button onClick={handleDeleteAgent} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Confirm Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}