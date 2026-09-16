import React from "react";
import { User, Bell, Percent, Save, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto md:mx-0">
      
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage global system configurations and personal preferences</p>
      </div>

      <div className="grid gap-6">
        
        {/* 1. Global Platform Configurations (God Mode Settings) */}
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Global Configurations</h3>
          </div>
          
          <div className="p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Commission Rate */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Percent size={14} className="text-gray-400" />
                  Platform Commission Fee (%)
                </label>
                <input 
                  type="number" 
                  defaultValue={5}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <p className="text-[11px] text-gray-400">Asilimia unayokata kwa kila muamala wa taka.</p>
              </div>

              {/* Default Currency */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Default Currency</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                  <option value="TZS">TZS - Tanzanian Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Admin Profile Settings */}
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Profile Information</h3>
          </div>
          
          <div className="p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Rain James"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input 
                  type="text" 
                  defaultValue="0700000000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="admin@sm360.co.tz"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Notifications & Alerts */}
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Notifications & Alerts</h3>
          </div>
          
          <div className="p-5 md:p-6 space-y-4">
            
            {/* Custom Tailwind Toggle 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-900">Email Alerts</p>
                <p className="text-[11px] text-gray-500">Receive daily summary of system activities via email.</p>
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" defaultChecked className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-primary cursor-pointer transition-colors" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm"></span>
              </div>
            </div>

            {/* Custom Tailwind Toggle 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-900">System Errors (SMS)</p>
                <p className="text-[11px] text-gray-500">Get instant SMS when AI routing or payments fail.</p>
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-primary cursor-pointer transition-colors" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm"></span>
              </div>
            </div>

          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2 pb-10">
          <button className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
            <Save size={18} />
            <span>Save All Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
}