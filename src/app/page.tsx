"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, Leaf, ShieldCheck, Zap, Building2, 
  Search, CheckCircle2, CreditCard, Loader2, Menu, X,
  Globe, Wallet, Truck, Users, ArrowDownCircle
} from "lucide-react";

export default function SM360LandingPage() {
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("lga");

  // Pay Bill States
  const [controlNumber, setControlNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [billDetails, setBillDetails] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleVerifyBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!controlNumber) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setBillDetails({
        owner: "Mzee Juma",
        property: "Kijitonyama, Block A",
        amount: 5000,
        lga: "Kinondoni Municipal"
      });
    }, 1500);
  };

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-100 overflow-x-hidden">
      
      {/* ========================================================
          1. RESPONSIVE NAVBAR (WITH HAMBURGER & DEMO BUTTON)
      ======================================================== */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-gray-900">SM360.</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-500">
            <Link href="#ecosystem" className="hover:text-emerald-600 transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link>
            <Link href="#citizen-pay" className="hover:text-emerald-600 transition-colors">Citizen Pay</Link>
          </div>

          {/* Actions & Hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden lg:block text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors mr-2">
              Login
            </Link>
            <button className="bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-md">
              Request Demo
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link href="#ecosystem" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-700">How it Works</Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-700">Pricing</Link>
            <Link href="#citizen-pay" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-emerald-600">Pay Bill</Link>
            <div className="h-px w-full bg-gray-100 my-2"></div>
            <Link href="/login" className="text-sm font-bold text-gray-700">Login to Portal</Link>
          </div>
        )}
      </nav>

      {/* ========================================================
          2. HERO SECTION (Vibrant, 3D Elements, B2B Focus)
      ======================================================== */}
      <section className="pt-28 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto relative">
        
        {/* Background Decorative Patterns */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white"></div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Hero Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Smart Municipal Software
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-gray-900">
              Transform Waste into <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">
                Digital Revenue.
              </span>
            </h1>
            
            <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 font-medium leading-relaxed">
              The modern operating system for Local Government Authorities. Automate zone allocations, citizen billing, and contractor settlements.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/login" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 sm:py-4 rounded-full text-sm font-bold transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95">
                Launch Platform <ArrowRight size={18} />
              </Link>
              <a href="#ecosystem" className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-3.5 sm:py-4 rounded-full text-sm font-bold transition-all flex items-center justify-center">
                See How it Works
              </a>
            </div>
          </div>

          {/* Hero Visuals (Vibrant / 3D-like Mockups) */}
          <div className="flex-1 w-full relative h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center">
            
            {/* 3D-like Element 1 (Top Left) */}
            <div className="absolute top-10 left-10 sm:left-20 lg:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl sm:rounded-[2rem] shadow-[0_20px_40px_rgba(16,185,129,0.3),inset_0_4px_10px_rgba(255,255,255,0.4)] flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-10">
              <Building2 size={48} className="text-white drop-shadow-md sm:w-16 sm:h-16" />
            </div>
            
            {/* 3D-like Element 2 (Center Right) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-16 lg:right-0 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_40px_rgba(59,130,246,0.3),inset_0_4px_10px_rgba(255,255,255,0.4)] flex items-center justify-center transform rotate-6 hover:rotate-0 transition-all duration-500 delay-150 animate-in fade-in zoom-in slide-in-from-bottom-10">
              <Globe size={56} className="text-white drop-shadow-md sm:w-20 sm:h-20" />
            </div>

            {/* 3D-like Element 3 (Bottom Center) */}
            <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl sm:rounded-[2rem] shadow-[0_20px_40px_rgba(249,115,22,0.3),inset_0_4px_10px_rgba(255,255,255,0.4)] flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-all duration-500 delay-300 animate-in fade-in zoom-in slide-in-from-bottom-10">
              <Zap size={40} className="text-white drop-shadow-md sm:w-14 sm:h-14" />
            </div>

            {/* Decorative Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full -z-10 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 20 20 Q 50 10 80 50 T 50 90" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-emerald-500" />
            </svg>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. THE ECOSYSTEM (Tabs - Beautiful & International)
      ======================================================== */}
      <section id="ecosystem" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">One Unified Ecosystem</h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            We bridge the gap between municipalities, waste collectors, and citizens.
          </p>
        </div>

        {/* Tab Buttons (Responsive) */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12 bg-gray-50 p-1.5 rounded-2xl sm:rounded-full w-full sm:w-fit mx-auto border border-gray-200">
          <button 
            onClick={() => setActiveTab("lga")}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all ${activeTab === "lga" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            For LGAs
          </button>
          <button 
            onClick={() => setActiveTab("contractor")}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all ${activeTab === "contractor" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            For Contractors
          </button>
          <button 
            onClick={() => setActiveTab("citizen")}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all ${activeTab === "citizen" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            For Citizens
          </button>
        </div>

        {/* Tab Content Areas */}
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] min-h-[350px] flex items-center relative overflow-hidden">
          
          {/* Subtle Background glow based on active tab */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${activeTab === 'lga' ? 'bg-emerald-500' : activeTab === 'contractor' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>

          {activeTab === "lga" && (
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center w-full animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <Building2 className="text-emerald-600" size={28} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">Total Municipal Control</h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                  Say goodbye to excel sheets. Map wards, assign them to private contractors, and track citizen payment compliance in real-time. Approve mass payouts securely with integrated APIs.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle2 size={18} className="text-emerald-500"/> Real-time Revenue Dashboard</li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle2 size={18} className="text-emerald-500"/> Automated Contractor Settlements</li>
                </ul>
              </div>
              {/* Abstract UI Representation */}
              <div className="bg-gray-50 rounded-2xl h-64 sm:h-80 border border-gray-200 p-4 sm:p-6 flex flex-col gap-4">
                <div className="h-8 w-1/3 bg-gray-200 rounded-md"></div>
                <div className="flex gap-4 h-24">
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-end"><div className="h-4 w-1/2 bg-emerald-100 rounded"></div></div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-end"><div className="h-4 w-1/2 bg-blue-100 rounded"></div></div>
                </div>
                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm mt-2"></div>
              </div>
            </div>
          )}

          {activeTab === "contractor" && (
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center w-full animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                  <Truck className="text-blue-600" size={28} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">Empowered Contractors</h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                  Focus on collecting waste, not chasing invoices. View your assigned zones, track driver routes via GIS, and watch your earnings accrue securely as citizens pay their bills.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle2 size={18} className="text-blue-500"/> Digital Earnings Wallet</li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle2 size={18} className="text-blue-500"/> Ward & Property Mapping</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-2xl h-64 sm:h-80 border border-gray-200 p-4 sm:p-6 flex items-center justify-center">
                 <div className="w-48 h-full bg-white rounded-[2rem] border-4 border-gray-200 shadow-sm p-3 flex flex-col gap-3">
                   <div className="w-full h-24 bg-blue-50 rounded-xl"></div>
                   <div className="w-full h-8 bg-gray-100 rounded-md"></div>
                   <div className="w-full flex-1 bg-gray-100 rounded-md"></div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "citizen" && (
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center w-full animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
                  <Users className="text-orange-600" size={28} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">Frictionless Payments</h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                  No more queues at the municipal office. Citizens receive their control numbers via SMS and can pay instantly using M-Pesa, Tigo Pesa, or Airtel Money from the comfort of their homes.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle2 size={18} className="text-orange-500"/> Mobile Money Integration</li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle2 size={18} className="text-orange-500"/> Instant SMS Receipts</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-2xl h-64 sm:h-80 border border-gray-200 p-4 sm:p-6 flex items-center justify-center relative">
                 <div className="w-full max-w-[200px] h-12 bg-white rounded-full border border-gray-200 shadow-sm flex items-center px-4 gap-2 absolute top-10 transform -rotate-6">
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div> <div className="h-2 w-16 bg-gray-200 rounded"></div>
                 </div>
                 <div className="w-full max-w-[200px] h-12 bg-white rounded-full border border-gray-200 shadow-sm flex items-center px-4 gap-2 absolute bottom-10 transform rotate-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div> <div className="h-2 w-16 bg-gray-200 rounded"></div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          4. PRICING / REVENUE MODEL (Simple & Transparent)
      ======================================================== */}
      <section id="pricing" className="py-16 sm:py-20 bg-gray-900 text-white px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 to-transparent"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Zero Upfront Costs. <br/> Infinite Value.</h2>
            <p className="text-gray-400 max-w-md mx-auto md:mx-0 text-sm sm:text-base">
              We don't charge LGAs installation or maintenance fees. We only win when you win. Our model is built on absolute transparency.
            </p>
          </div>
          
          <div className="w-full md:w-[400px] bg-white text-gray-900 rounded-[2rem] p-8 shadow-2xl shrink-0">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Wallet className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Platform Fee</p>
                <h3 className="text-4xl font-black text-gray-900">10%</h3>
              </div>
            </div>
            <ul className="space-y-4 mb-8 text-sm font-bold text-gray-600">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Applied strictly per transaction</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Auto-deducted at source</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> Includes Cloud Hosting & SMS</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500"/> 24/7 Technical Support</li>
            </ul>
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-full text-sm font-bold transition-all">
              Request LGA Onboarding
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          5. CITIZEN QUICK PAY PORTAL (Isolated & Clear)
      ======================================================== */}
      <section id="citizen-pay" className="py-20 sm:py-32 px-4 sm:px-6 bg-emerald-50 relative">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 sm:gap-16">
          
          {/* CTA Info for Citizens */}
          <div className="flex-1 text-center md:text-left">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <CreditCard className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Are you a Citizen?</h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Skip the queues. Enter your property's <strong>Control Number</strong> to instantly verify and pay your municipal waste collection bill online via Mobile Money.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <ShieldCheck size={16} className="text-emerald-600" /> Secure Payment Gateway
            </div>
          </div>

          {/* The Payment Widget */}
          <div className="w-full md:w-[400px] shrink-0">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white relative overflow-hidden">
              <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Quick Pay</h3>

              {!billDetails && !paymentSuccess && (
                <form onSubmit={handleVerifyBill} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Control Number</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 99123456789" 
                        value={controlNumber}
                        onChange={(e) => setControlNumber(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isVerifying || !controlNumber}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isVerifying ? <Loader2 size={18} className="animate-spin" /> : "Verify Bill"}
                  </button>
                </form>
              )}

              {/* Bill Details State */}
              {billDetails && !paymentSuccess && (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 space-y-3">
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                      <span className="text-xs text-gray-500">Property Owner</span>
                      <span className="text-sm font-bold text-gray-900">{billDetails.owner}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                      <span className="text-xs text-gray-500">Location</span>
                      <span className="text-xs font-bold text-gray-900">{billDetails.property}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-gray-500">Amount Due</span>
                      <span className="text-lg font-black text-emerald-600">TZS {billDetails.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setBillDetails(null)} className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50">Cancel</button>
                    <button 
                      onClick={handlePay}
                      disabled={isPaying}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {isPaying ? <Loader2 size={18} className="animate-spin" /> : "Pay via ClickPesa"}
                    </button>
                  </div>
                </div>
              )}

              {/* Success State */}
              {paymentSuccess && (
                <div className="text-center animate-in zoom-in duration-500 py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Successful!</h3>
                  <p className="text-sm text-gray-500 mb-6">Your waste collection bill has been cleared successfully.</p>
                  <button onClick={() => { setPaymentSuccess(false); setBillDetails(null); setControlNumber(""); }} className="text-emerald-600 font-bold text-sm hover:underline">
                    Pay Another Bill
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FOOTER
      ======================================================== */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={24} className="text-emerald-600" />
              <span className="font-black text-2xl text-gray-900">SM360.</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">Building the digital backbone for municipal waste management across Tanzania.</p>
          </div>
          
          <div className="flex gap-12 sm:gap-20">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-emerald-600">LGA Portal</a></li>
                <li><a href="#" className="hover:text-emerald-600">Contractor App</a></li>
                <li><a href="#" className="hover:text-emerald-600">Citizen Pay</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-emerald-600">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-600">Contact Support</a></li>
                <li><a href="#" className="hover:text-emerald-600">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-100 pt-8 text-center text-sm font-medium text-gray-400">
          © {new Date().getFullYear()} Smart Municipal Systems. Designed for Tanzania.
        </div>
      </footer>

    </div>
  );
}