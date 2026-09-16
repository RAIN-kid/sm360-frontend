import React from "react";
import { Shield, Key, History, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export default function PrivacyRolesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto md:mx-0">
      
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Privacy & Roles</h2>
        <p className="text-gray-500 text-sm mt-1">Manage system access, security protocols, and audit logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Roles & Security Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. System Administrators (Roles) */}
          <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">System Administrators</h3>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline">Add New Admin</button>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Role Level</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      Rain James <span className="block text-xs text-gray-500 font-normal">admin@sm360.co.tz</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">Owner (God Mode)</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      System Support <span className="block text-xs text-gray-500 font-normal">support@sm360.co.tz</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">Support (Read Only)</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Security Protocols */}
          <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/30">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <Key className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Security Protocols</h3>
            </div>
            
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-gray-500">Require code from Authenticator App for all Admins.</p>
                </div>
                <div className="relative inline-block w-10 h-5">
                  <input type="checkbox" defaultChecked className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-emerald-500 cursor-pointer transition-colors" />
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Strict Data Masking</p>
                  <p className="text-[11px] text-gray-500">Hide full phone numbers and IDs from Support Roles.</p>
                </div>
                <div className="relative inline-block w-10 h-5">
                  <input type="checkbox" defaultChecked className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-emerald-500 cursor-pointer transition-colors" />
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm"></span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: System Audit Logs */}
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <History className="h-4 w-4 text-gray-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Audit Logs</h3>
            </div>
          </div>
          
          <div className="p-5 flex-1 overflow-auto">
            {/* Timeline of events */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              
              {/* Log Item 1 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                <div className="ml-10 md:ml-0 md:w-1/2 md:pr-10 md:text-right">
                  <p className="text-sm font-bold text-gray-900">LGA Commission Updated</p>
                  <p className="text-xs text-gray-500 mt-0.5">Platform fee set to 5%.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Today, 10:45 AM • by Rain James</p>
                </div>
              </div>

              {/* Log Item 2 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                <div className="ml-10 md:ml-0 md:w-1/2 md:pl-10 md:ml-auto">
                  <p className="text-sm font-bold text-gray-900">New LGA Registered</p>
                  <p className="text-xs text-gray-500 mt-0.5">Kinondoni Municipal onboarded.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Yesterday, 14:20 PM • by System</p>
                </div>
              </div>

              {/* Log Item 3 (Warning) */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white"></div>
                <div className="ml-10 md:ml-0 md:w-1/2 md:pr-10 md:text-right">
                  <div className="flex items-center gap-1 md:justify-end">
                    <ShieldAlert size={14} className="text-red-500" />
                    <p className="text-sm font-bold text-red-600">Failed Login Attempt</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Invalid credentials for admin account.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Sep 07 • IP: 197.250.x.x</p>
                </div>
              </div>

            </div>
            
            <button className="w-full mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition-colors border border-gray-200">
              Load More Logs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}