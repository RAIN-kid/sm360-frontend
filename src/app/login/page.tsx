"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; 
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMsg("Tafadhali weka namba ya simu na nenosiri.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        phoneNumber: cleanIdentifier, 
        password: password
      });

      const { token, data: user } = response.data;

      if (token && user) {
        localStorage.setItem("sm360_token", token);
        localStorage.setItem("sm360_user", JSON.stringify(user));

        // 🔥 HAPA TUNATUMIA JINA LA CHEO MOJA KWA MOJA, HAKUNA KUKARIRI NAMBA!
        const roleStr = String(user.role || user.role_name || "").toUpperCase();
        const roleId = Number(user.role_id || user.roleId);

        // Tunaweka conditions ambazo ni bulletproof (zinashika kila variations)
        if (roleStr.includes("SUPER_ADMIN") || roleId === 1) {
          router.push("/super-admin/dashboard");
        } 
        else if (roleStr.includes("LGA") || roleStr.includes("MUNICIPAL")) {
          router.push("/lga/dashboard");
        } 
        else if (roleStr.includes("COMPANY_ADMIN") || roleStr.includes("PRIVATE")) {
          router.push("/company/dashboard");
        } 
        else if (roleStr.includes("AGENT") || roleStr.includes("FIELD")) {
          router.push("/agent"); // <--- Agent ataelekea hapa kwa usahihi!
        } 
        else if (roleStr.includes("DRIVER")) {
          router.push("/driver");
        } 
        else {
          // Kama cheo bado kinagoma, angalau Mfumo utatuambia ni cheo gani hicho
          setErrorMsg(`Cheo chako (${roleStr || 'ID: ' + roleId}) hakijatengenezewa ukurasa.`);
          localStorage.clear();
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else if (error.request) {
        setErrorMsg("Imeshindwa kuunganisha na Server. Angalia mtandao wako.");
      } else {
        setErrorMsg("Kuna hitilafu imetokea. Jaribu tena.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <ShieldCheck size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-900 tracking-tight">
          Welcome to SM360
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to access your portal
        </p>

        <div className="mt-8 bg-white py-8 px-4 sm:rounded-3xl sm:px-10 border border-gray-200">
          
          <form className="space-y-5" onSubmit={handleLogin}>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium text-center animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 outline-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Authenticating...</>
              ) : ("Sign In")}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}