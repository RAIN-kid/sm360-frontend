"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Navigation2, CheckCircle2, Truck, LogOut, Loader2 } from "lucide-react";

// Tumeipa ramani kinga ili isi-crash react inapo-refresh
const RealRouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

export default function DriverAppPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [activeRouteInfo, setActiveRouteInfo] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);
  const [routeStarted, setRouteStarted] = useState(false);
  
  useEffect(() => {
    fetchDriverTask();
  }, []);

  const fetchDriverTask = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      if (!token) { router.push("/login"); return; }
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${url}/api/super-admin/my-profile`, config);
      const driverData = profileRes.data.data;
      setDriverProfile(driverData);

      const cId = driverData.organization_id || driverData.lga_id; 
      
      const [routesRes, trucksRes] = await Promise.all([
        axios.get(`${url}/api/super-admin/routes?organization_id=${cId}`, config),
        axios.get(`${url}/api/super-admin/trucks?organization_id=${cId}`, config)
      ]);

      const today = new Date();
      const todayDayNum = today.getDate().toString();
      
      let myRoute = routesRes.data.data.find((r: any) => {
        if (Number(r.driver_id) !== Number(driverData.id)) return false;
        
        const days = r.collection_day ? r.collection_day.toString().split(',').map((d:string)=>d.trim()) : [];
        
        let isClearedToday = false;
        if (r.last_cleared_date) {
          const clearedDate = new Date(r.last_cleared_date);
          if (
            clearedDate.getFullYear() === today.getFullYear() &&
            clearedDate.getMonth() === today.getMonth() &&
            clearedDate.getDate() === today.getDate()
          ) {
            isClearedToday = true;
          }
        }

        return days.includes(todayDayNum) && !isClearedToday;
      });

      if (myRoute) {
        const truckInfo = trucksRes.data.data.find((t: any) => t.id === myRoute.truck_id);
        setActiveRouteInfo({ id: myRoute.id, route_name: myRoute.name, plate_number: truckInfo?.plate_number || 'Default Truck' });
        
        const [pointsRes, propsRes] = await Promise.all([
          axios.get(`${url}/api/super-admin/collection-points?ward_id=${myRoute.ward_id}`, config),
          axios.get(`${url}/api/super-admin/properties?lga_id=${driverData.lga_id}`, config) 
        ]);

        const standardPoints = (pointsRes.data.data || []).filter((p: any) => p.ward_id === myRoute.ward_id);
        const standaloneProperties = (propsRes.data.data || []).filter((p: any) => 
          p.ward_id === myRoute.ward_id && p.latitude && !p.collection_point_id
        ).map((p: any) => ({
          id: `prop_${p.id}`, name: p.owner_name, latitude: p.latitude, longitude: p.longitude, done: false
        }));

        const combined = [...standardPoints, ...standaloneProperties].map(p => ({...p, done: false}));
        setRoutePoints(combined);
      }
    } catch (error) {
      console.error("Driver Load Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = routePoints.filter(p => p.done).length;
  const progress = routePoints.length === 0 ? 0 : Math.round((completedCount / routePoints.length) * 100);

  const handleCollectNext = () => {
    if (!routeStarted) setRouteStarted(true);
    const nextIndex = routePoints.findIndex(p => !p.done);
    if (nextIndex !== -1) {
      const updatedPoints = [...routePoints];
      updatedPoints[nextIndex].done = true;
      setRoutePoints(updatedPoints);
    }
  };

  const handleCompleteRoute = async () => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem("sm360_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localTodayStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
      
      await axios.put(`${url}/api/super-admin/routes/${activeRouteInfo.id}/clear`, { cleared_date: localTodayStr }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      alert("Shift Imekamilika! Kazi njema.");
      window.location.reload(); 
    } catch (error) {
      alert("Imeshindwa kutuma taarifa.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sm360_token");
    router.push("/login");
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] bg-white h-[100dvh] relative shadow-2xl flex flex-col overflow-hidden">
        
        <div className="absolute top-0 w-full z-[500] p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold shadow-black drop-shadow-md">{driverProfile?.full_name}</h2>
                <p className="text-[10px] font-medium text-gray-200">{activeRouteInfo?.plate_number || 'Truck Assigned'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500/80"><LogOut size={14} /></button>
          </div>
        </div>

        <div className="flex-1 w-full bg-gray-100 relative">
          {activeRouteInfo && routePoints.length > 0 ? (
            // KEY IMEONGEZWA HAPA KUZUIA "MAP CONTAINER REUSED ERROR"
            <RealRouteMap key={`map-${activeRouteInfo.id}`} points={routePoints} onRouteCalculated={() => {}} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hakuna Kazi Leo!</h3>
              <p className="text-sm text-gray-500 mt-2">Hujapangiwa ruti yoyote kwa tarehe ya leo, au umeshamaliza kazi zako zote.</p>
            </div>
          )}
        </div>

        {activeRouteInfo && routePoints.length > 0 && (
          <div className="absolute bottom-0 w-full z-[500] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-8 pt-5 px-6">
            <div className="mb-5">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Active Route</p>
                  <h3 className="text-sm font-black text-gray-900">{activeRouteInfo.route_name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            {progress === 100 ? (
              <button onClick={handleCompleteRoute} disabled={isActionLoading} className="w-full py-4 rounded-[1.2rem] bg-gray-900 text-white font-bold flex justify-center items-center gap-2">
                {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />} Shift Imekamilika
              </button>
            ) : !routeStarted ? (
              <button onClick={handleCollectNext} className="w-full py-4 rounded-[1.2rem] bg-emerald-600 text-white font-black flex justify-center gap-2">
                <Navigation2 size={20} /> Anza Safari (Start Route)
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Kituo Kinachofuata</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{routePoints.find(p => !p.done)?.name || "Kinamalizia..."}</p>
                </div>
                <button onClick={handleCollectNext} className="w-[120px] h-[58px] rounded-2xl bg-emerald-600 text-white font-black flex justify-center items-center gap-2">
                  <CheckCircle2 size={18} /> Tumefika
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}