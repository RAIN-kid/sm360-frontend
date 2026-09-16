"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, MapPin, Loader2, Route as RouteIcon, 
  Droplet, Activity, User, Truck
} from "lucide-react";

const RealRouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
      <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
      <span className="text-xs text-gray-700 font-bold">GIS Analytics...</span>
    </div>
  )
});

export default function RouteCommandCenterPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]); 
  
  // Real Data zilizovutwa (Truck & Driver) kutoka DB
  const [assignedFleet, setAssignedFleet] = useState<{driver: string, truck: string} | null>(null);

  const [realDistance, setRealDistance] = useState<number | null>(null);
  const [realFuel, setRealFuel] = useState<number | null>(null);

  useEffect(() => {
    if (routeId) fetchRouteData();
  }, [routeId]);

  const fetchRouteData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const cId = profileRes.data.data.organization_id || profileRes.data.data.lga_id; 
      const lgaId = profileRes.data.data.lga_id;
      setCompanyId(cId);

      // Vuta vyote kwa mkupuo (Ruti, Magari, Madereva, Vituo, Nyumba)
      const [routesRes, driversRes, trucksRes, pointsRes, propsRes] = await Promise.all([
        axios.get(`${url}/api/super-admin/routes?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/drivers?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/trucks?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/collection-points`, config), // Tutachuja chini
        axios.get(`${url}/api/super-admin/properties?lga_id=${lgaId}`, config) 
      ]);

      const currentRoute = routesRes.data.data.find((r: any) => r.id.toString() === routeId);
      if (!currentRoute) {
        alert("Route Not Found!"); router.push("/company/routes"); return;
      }
      setRouteDetails(currentRoute);

      // UCHAWI WA KUUNGANISHA DEREVA NA LORI (Tunaangalia ID iliyosaviwa)
      const d = driversRes.data.data.find((d: any) => d.id === currentRoute.driver_id);
      const t = trucksRes.data.data.find((t: any) => t.id === currentRoute.truck_id);
      setAssignedFleet({
        driver: d ? d.full_name.split(' ')[0] : 'No Driver',
        truck: t ? t.plate_number : 'No Truck'
      });

      // Kusanya Vituo Vya Hii Kata Tu
      const standardPoints = (pointsRes.data.data || []).filter((p: any) => p.ward_id === currentRoute.ward_id);
      const standaloneProperties = (propsRes.data.data || []).filter((p: any) => 
        p.ward_id === currentRoute.ward_id && p.latitude && !p.collection_point_id
      ).map((p: any) => ({
        id: `prop_${p.id}`, name: p.owner_name, latitude: p.latitude, longitude: p.longitude
      }));

      setRoutePoints([...standardPoints, ...standaloneProperties]);

    } catch (error) {
      console.error("GIS Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteCalculated = (distanceKm: number) => {
    setRealDistance(Number(distanceKm.toFixed(1)));
    setRealFuel(Number((distanceKm / 3.5).toFixed(1))); // Lita 1 = 3.5km (Mjini)
  };

  const handleInstantDispatch = async () => {
    setIsDispatching(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      await axios.post(`${url}/api/super-admin/dispatch`, {
        company_id: companyId, route_id: routeId,
        truck_id: routeDetails?.truck_id, driver_id: routeDetails?.driver_id,
        dispatch_date: new Date().toISOString().split('T')[0],
        estimated_fuel_liters: realFuel || 0
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("Dispatched Successfully!"); router.push("/company/routes"); 
    } catch (error: any) {
      alert("Failed to Dispatch.");
    } finally {
      setIsDispatching(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
  }

  return (
    // MAP YENYE FULL SCREEN HEIGHT
    <div className="relative w-full h-[calc(100vh-5rem)] bg-gray-100 overflow-hidden flex flex-col">
      
      {/* FLOATING TOP BAR (Imekaa juu ya Ramani kwa uwazi/backdrop blur) */}
      <div className="absolute top-0 left-0 right-0 z-[500] bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/company/routes')} className="text-gray-500 hover:text-gray-900 outline-none">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-tight uppercase">{routeDetails?.name}</h1>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> GIS Routing Mode
            </p>
          </div>
        </div>

        {/* FLOATING STATS CARDS (Mini-Cards Katikati) */}
        <div className="hidden md:flex gap-3">
           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
             <MapPin size={14} className="text-blue-500"/>
             <span className="text-xs font-bold text-gray-800">{routePoints.length} Stops</span>
           </div>
           <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
             <RouteIcon size={14} className="text-emerald-600"/>
             <span className="text-xs font-bold text-emerald-900">
               {realDistance === null ? <Loader2 size={12} className="animate-spin" /> : `${realDistance} km`}
             </span>
           </div>
           <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
             <Droplet size={14} className="text-orange-500"/>
             <span className="text-xs font-bold text-orange-900">
               {realFuel === null ? <Loader2 size={12} className="animate-spin" /> : `${realFuel} L`}
             </span>
           </div>
           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
             <User size={14} className="text-gray-500"/>
             <span className="text-xs font-bold text-gray-800 uppercase">{assignedFleet?.driver} | {assignedFleet?.truck}</span>
           </div>
        </div>

        <button 
          onClick={handleInstantDispatch} 
          disabled={isDispatching || routePoints.length === 0}
          className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors flex items-center gap-2 outline-none disabled:opacity-50"
        >
          {isDispatching ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />} Dispatch
        </button>
      </div>

      {/* RAMANI INACHUKUA ENEO LILILOBAKI BILA KUZUIWA */}
      <div className="flex-1 w-full relative z-[100] mt-[60px]">
        {routePoints.length > 0 ? (
          <RealRouteMap points={routePoints} onRouteCalculated={handleRouteCalculated} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white">
            <MapPin size={40} className="text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-600">No GIS Data Found</p>
            <p className="text-[10px] text-gray-400 mt-1 max-w-xs text-center">Hakuna kituo kilichosajiliwa. Ramani haiwezi kuchora njia wazi.</p>
          </div>
        )}
      </div>

    </div>
  );
}