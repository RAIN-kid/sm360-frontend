import React from "react";
import { Building, Bell, Save, Mail, Phone } from "lucide-react";

export default function LGASettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto md:mx-0">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Council Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage municipal contact details and notifications</p>
      </div>

      <div className="grid gap-6">
        
        {/* Profile Info */}
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Council Profile</h3>
          </div>
          
          <div className="p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Council Name</label>
                <input type="text" disabled defaultValue="Kinondoni Municipal Council" className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
                <p className="text-[11px] text-gray-400">Only Super Admin can change the council name.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Phone size={14}/> Support Phone</label>
                <input type="text" defaultValue="0800 111 222" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail size={14}/> Official Email</label>
                <input type="email" defaultValue="admin@kinondoni.go.tz" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Alert Preferences</h3>
          </div>
          
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-900">Daily Revenue Report</p>
                <p className="text-[11px] text-gray-500">Receive an email every evening with total collections.</p>
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" defaultChecked className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-primary cursor-pointer transition-colors" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2 pb-10">
          <button className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 outline-none">
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
}