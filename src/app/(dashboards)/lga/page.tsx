"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Building2, Users, MapPin, Map, Loader2, Navigation 
} from "lucide-react";

export default function LgaDashboardPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);

  // States za Data
  const [adminContext, setAdminContext] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  useEffect(() => {
    fetchLgaData();
  }, []);

  const fetchLgaData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Pata Profile ya Admin anayelogin (Kujua Halmashauri yake)
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const lgaAdmin = profileRes.data.data;
      setAdminContext(lgaAdmin);

      // 2. Vuta Data za Halmashauri Hiyo Tu (Kwa kutumia LGA ID yake)
      const [resProps, resAgents, resWards, resStreets] = await Promise.all([
        axios.get(`${url}/api/super-admin/properties?lga_id=${lgaAdmin.lga_id}`, config),
        axios.get(`${url}/api/super-admin/agents?lga_id=${lgaAdmin.lga_id}`, config),
        axios.get(`${url}/api/super-admin/wards?organization_id=${lgaAdmin.lga_id}`, config),
        axios.get(`${url}/api/super-admin/streets?lga_id=${lgaAdmin.lga_id}`, config)
      ]);

      setProperties(resProps.data.data || []);
      setAgents(resAgents.data.data || []);
      setWards(resWards.data.data || []);
      setStreets(resStreets.data.data || []);

    } catch (error) {
      console.error("Failed to load LGA data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !adminContext) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 size={40} className="animate-spin" />
          <p className="font-bold text-sm">Inapakia taarifa za Halmashauri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-center bg-blue-50/50 p-4 border border-blue-100 rounded-3xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Karibu, {adminContext?.full_name}</h2>
          <p className="text-sm text-gray-600">Muhtasari wa {adminContext?.lga_name} leo.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4"><Building2 className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-gray-500 text-xs font-medium mb-1">Total Properties</p><h3 className="text-2xl font-bold text-gray-900">{properties.length}</h3></div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-4"><Users className="h-5 w-5 text-orange-600" /></div>
          <div><p className="text-gray-500 text-xs font-medium mb-1">Field Agents</p><h3 className="text-2xl font-bold text-gray-900">{agents.length}</h3></div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-4"><MapPin className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-gray-500 text-xs font-medium mb-1">Total Wards</p><h3 className="text-2xl font-bold text-gray-900">{wards.length}</h3></div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-200 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4"><Navigation className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-gray-500 text-xs font-medium mb-1">Total Streets</p><h3 className="text-2xl font-bold text-gray-900">{streets.length}</h3></div>
        </div>
      </div>

      {/* Recent Properties Table (Overview Snippet) */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Registrations</h3>
          <button onClick={() => router.push("/lga/properties")} className="text-xs font-semibold text-primary hover:underline outline-none">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Property Code</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.slice(0, 5).map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-bold text-sm text-gray-900">{prop.property_code}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-gray-700">{prop.owner_name}</p>
                    <p className="text-[10px] text-gray-500">{prop.phone_number}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{prop.ward_name} ({prop.street_name})</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{prop.property_category}</span>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-gray-500">
                    No properties registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}