import React, { useEffect, useState } from "react";
import type {AdminAuctionHouseDetailDTO} from '../../types/auctionHouse.type'
import { Link } from "react-router-dom";

import {
  Gavel,
  Users,
  TrendingUp,
  Clock,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import auctionHouseService from "../../services/auctionHouse.service";

const TenantDashboard: React.FC = () => {
  const [house,setHouse]=useState<AdminAuctionHouseDetailDTO|null>(null)
  
  // const { status, loading, reason } = useAppSelector((state) => state.auctionHouse);

  // useEffect(() => {
  //   if (isAuthenticated && status == null) {
  //     dispatch(fetchAuctionProfile());
  //   }
  // }, [dispatch, status, isAuthenticated]);

  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F7FB]">
  //       <Loader2 className="animate-spin text-[#2F6FED]" size={40} />
  //       <p className="mt-4 text-[#475569] font-semibold tracking-wide uppercase text-[10px]">Syncing House Data...</p>
  //     </div>
  //   );
  // }

 const fetchAuctionProfile=async ()=>{
  const response=await auctionHouseService.getProfile();
  if(response.success&&response.data){
    setHouse(response.data)
  }
 }
 const status=house?.status
 useEffect(()=>{
  fetchAuctionProfile()
 },[])
  if (status !== "approved") {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2rem] p-12 text-center shadow-sm">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500
            ${status === "rejected" ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#F5F7FB] text-[#2F6FED]"}`}
          >
            {status === "rejected" ? <AlertCircle size={36} /> : <Lock size={36} />}
          </div>

          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4">
            {status === "pending" && "Review in Progress"}
            {status === "rejected" && "Action Required"}
            {status === null && "Verify Your Account"}
          </h1>

          <div className="text-[#475569] text-base font-medium leading-relaxed mb-10">
            {status === "pending" && (
              
              <p>Our compliance team is reviewing your documents. You&apos;ll receive full access shortly.</p>
            )}

            {status === "rejected" && (
              <div className="space-y-4">
                <p className="text-sm">Your application was not approved. Please review the feedback below:</p>
                {house?.rejectionReason&& (
                  <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-5 text-left">
                    <p className="text-[#991B1B] text-sm font-semibold italic">&ldquo;{house.rejectionReason}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {status === null && (
              <p>To start hosting live auctions, please complete your business verification profile.</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            {status === "pending" ? (
              <div className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#166534] px-8 py-4 rounded-xl font-bold border border-[#DCFCE7]">
                <ShieldCheck size={18} />
                Under Review
              </div>
            ) : (
              <Link 
                to={status === "rejected" ? "/tenant/resubmit-verification" : "/tenant/verification-form"}
                className="w-full sm:w-auto"
              >
                <button
                  className="group px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 w-full shadow-lg shadow-[#2F6FED]/20 bg-[#2F6FED] text-white hover:bg-[#2557C8]"
                >
                  {status === "rejected" ? (
                    <>
                      <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                      Update & Resubmit
                    </>
                  ) : (
                    <>
                      Begin Verification
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }


  const cardStyle = "bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:border-[#2F6FED]/30 transition-all";
  const statLabel = "text-[10px] font-black text-[#475569] uppercase tracking-[0.15em]";
  const statValue = "text-2xl font-black text-[#0F172A] mt-1";

  const stats = [
    { label: "Active Auctions", value: "12", icon: <Gavel size={18} />, trend: "+2" },
    { label: "Total Bidders", value: "1,284", icon: <Users size={18} />, trend: "+15%" },
    { label: "Net Revenue", value: "$45,200", icon: <TrendingUp size={18} />, trend: "+8.2%" },
    { label: "Avg. Bid Time", value: "4m 12s", icon: <Clock size={18} />, trend: "-30s" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] pt-8 pb-16 px-6 lg:px-12 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
        
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">House Console</h1>
            <p className="text-[#475569] text-sm font-medium">Overview of your auction house performance.</p>
          </div>
          <button className="bg-[#0F172A] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10">
            <Gavel size={14} />
            Launch Auction
          </button>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={cardStyle}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#F5F7FB] text-[#2F6FED] rounded-xl border border-[#E2E8F0]">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black text-[#166534] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#DCFCE7]">
                  {stat.trend}
                </span>
              </div>
              <p className={statLabel}>{stat.label}</p>
              <p className={statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${cardStyle} lg:col-span-2 min-h-[400px]`}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F5F7FB]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Live Events</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#2F6FED] hover:underline">
                View All
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#F5F7FB] rounded-3xl">
               <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">Queue is empty</p>
            </div>
          </div>

          <div className="space-y-6">
           
            <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/60">House Standing</h3>
                <p className="text-white font-bold text-lg mt-1">Verified Partner</p>
                
                <div className="mt-12 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl border-4 border-[#2F6FED] flex items-center justify-center text-xl font-black italic">
                    A+
                  </div>
                  <div>
                    <p className="font-black text-2xl">98%</p>
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Trust Index</p>
                  </div>
                </div>
              </div>
              {/* SaaS Decorative Glow */}
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#2F6FED] rounded-full blur-[90px] opacity-20"></div>
            </div>

            {/* Quick Actions */}
            <div className={`${cardStyle} bg-[#F5F7FB]/50`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#475569] mb-4">Quick Links</h3>
              <div className="space-y-2">
                {['Billing & Invoices', 'Security Settings', 'API Documentation'].map((link) => (
                  <button key={link} className="w-full text-left px-4 py-3 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#0F172A] hover:border-[#2F6FED] transition-all flex justify-between items-center group">
                    {link}
                    <ArrowRight size={14} className="text-[#94A3B8] group-hover:text-[#2F6FED] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;