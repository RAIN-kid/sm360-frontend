"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, MoreVertical, Truck, CheckCircle2, Wrench, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CompanyFleetPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [truckForm, setTruckForm] = useState({ plate_number: "", capacity: "" });

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

      const trucksRes = await axios.get(`${apiUrl}/api/super-admin/trucks?organization_id=${cId}`, config);
      setTrucks(trucksRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/super-admin/trucks`, {
        ...truckForm,
        organization_id: companyId
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsAddOpen(false);
      setTruckForm({ plate_number: "", capacity: "" });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add truck");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTruck = async (id: number) => {
    if (!confirm("Are you sure you want to remove this truck?")) return;
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${apiUrl}/api/super-admin/trucks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: number, currentPlate: string, currentCap: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("sm360_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.put(`${apiUrl}/api/super-admin/trucks/${id}`, {
        plate_number: currentPlate,
        capacity: currentCap,
        status: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTrucks = trucks.filter(t => 
    t.plate_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Fleet Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your garbage collection trucks</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors w-fit shadow-md shadow-emerald-600/20 outline-none">
            <Plus size={18} />
            <span>Register Truck</span>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Register New Truck</DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Add a new vehicle to your fleet for waste collection.
              </DialogDescription>
            </DialogHeader>
            
            <form className="space-y-4 mt-4" onSubmit={handleAddTruck}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Plate Number</label>
                  <input required value={truckForm.plate_number} onChange={e=>setTruckForm({...truckForm, plate_number: e.target.value})} type="text" placeholder="e.g. T 123 ABC" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Capacity (Tons)</label>
                  <input required value={truckForm.capacity} onChange={e=>setTruckForm({...truckForm, capacity: e.target.value})} type="number" placeholder="e.g. 7" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-md shadow-emerald-600/20 outline-none flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Truck
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
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search plate number..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Truck Details</th>
                <th className="px-6 py-4 font-semibold">Capacity</th>
                <th className="px-6 py-4 font-semibold">Assigned Driver</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="animate-spin text-emerald-600 mx-auto" size={24} /></td></tr>
              ) : filteredTrucks.length > 0 ? (
                filteredTrucks.map(truck => (
                  <tr key={truck.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${truck.status === 'Active' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                          <Truck className={`h-5 w-5 ${truck.status === 'Active' ? 'text-blue-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{truck.plate_number}</p>
                          <p className="text-[11px] text-gray-400">ID: {truck.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{truck.capacity} Tons</p>
                    </td>
                    <td className="px-6 py-4">
                      {/* Driver relation is loaded from the backend if it exists. If not, it says unassigned */}
                      <p className={`text-sm ${truck.driver_id ? 'font-bold text-gray-900' : 'italic text-gray-400'}`}>
                        {truck.driver_id ? 'Assigned' : 'Unassigned'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {truck.status === 'Active' ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <Wrench size={12} /> Maintenance
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors outline-none flex items-center justify-center ml-auto">
                          <MoreVertical size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-lg border-gray-100">
                          {truck.status === 'Active' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(truck.id, truck.plate_number, truck.capacity, 'Maintenance')} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-orange-50 text-orange-600 focus:text-orange-600">
                              <Wrench className="mr-2 h-4 w-4" /> Send to Garage
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(truck.id, truck.plate_number, truck.capacity, 'Active')} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-emerald-50 text-emerald-600 focus:text-emerald-600">
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteTruck(truck.id)} className="text-xs font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Truck
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-500">No trucks found.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}