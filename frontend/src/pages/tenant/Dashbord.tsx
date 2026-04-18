import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { fetchAuctionProfile } from "../../redux/tenant/auctionHouse.slice";
import { Link } from "react-router-dom";

import {
  Gavel,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

const TenantDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { status, loading, reason } = useAppSelector((state) => state.auctionHouse);

  useEffect(() => {
    if (isAuthenticated && status == null) {
      dispatch(fetchAuctionProfile());
    }
  }, [dispatch, status, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#2F6FED]" size={40} />
        <p className="mt-4 text-[#475569] font-medium">Loading your house details...</p>
      </div>
    );
  }

  if (status !== "approved") {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-xl shadow-slate-200/50">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 
            ${status === "rejected" ? "bg-red-50 text-red-500" : "bg-[#F5F7FB] text-[#2F6FED]"}`}
          >
            {status === "rejected" ? <AlertCircle size={40} /> : <Lock size={40} />}
          </div>

          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4">
            {status === "pending" && "Review in Progress"}
            {status === "rejected" && "Application Rejected"}
            {status === null && "Verification Required"}
          </h1>

          <div className="text-[#475569] text-lg leading-relaxed mb-10">
            {status === "pending" && (
              <p>
                We&apos;ve received your documents. Our team is currently reviewing your business details. 
                You&apos;ll get access to the full dashboard once approved.
              </p>
            )}

            {status === "rejected" && (
              <div className="space-y-4">
                <p>Unfortunately, your application could not be approved at this time.</p>
                {reason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">
                      Reason for Rejection
                    </p>
                    <p className="text-red-700 text-sm font-medium leading-relaxed">{reason}</p>
                  </div>
                )}
                <p className="text-sm">Please update your information based on the feedback above and resubmit for review.</p>
              </div>
            )}

            {status === null && (
              <p>To maintain the integrity of our auctions, all houses must be verified. Complete your business profile to start hosting live events.</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            {status === "pending" ? (
              <div className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#166534] px-6 py-3 rounded-xl font-bold border border-[#DCFCE7]">
                <ShieldCheck size={20} />
                Application Submitted
              </div>
            ) : (
              <Link to="/tenant/verification-form">
                <button
                  className={`group px-10 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 mx-auto shadow-lg 
                    ${status === "rejected"
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-red-500/25"
                      : "bg-[#2F6FED] text-white hover:bg-[#2557C8] shadow-blue-500/25"}`}
                >
                  {status === "rejected" ? (
                    <>
                      <RefreshCcw size={20} /> Update & Resubmit
                    </>
                  ) : (
                    <>
                      <ArrowRight size={20} /> Start Verification
                    </>
                  )}
                </button>
              </Link>
            )}

            {status === "rejected" && (
              <button className="text-[#64748b] text-sm font-bold hover:text-[#0f172a] transition-colors">
                Contact Support
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard styles
  const cardStyle = "bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow";
  const statLabel = "text-[11px] font-bold text-[#475569] uppercase tracking-wider";
  const statValue = "text-2xl font-extrabold text-[#0F172A] mt-1";

  const stats = [
    { label: "Active Auctions", value: "12", icon: <Gavel size={20} />, trend: "+2 this week" },
    { label: "Total Bidders", value: "1,284", icon: <Users size={20} />, trend: "+15% growth" },
    { label: "Current Revenue", value: "$45,200", icon: <TrendingUp size={20} />, trend: "+8.2% vs last month" },
    { label: "Avg. Bid Time", value: "4m 12s", icon: <Clock size={20} />, trend: "-30s improvement" },
  ];

  const recentAuctions = [
    { id: "1", item: "Vintage Rolex Submariner", status: "Live", bids: 42, currentPrice: "$12,400" },
    { id: "2", item: "1964 Fender Stratocaster", status: "Pending", bids: 0, currentPrice: "$5,500" },
    { id: "3", item: "Rare Pokémon Charizard", status: "Closed", bids: 156, currentPrice: "$8,900" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Dashboard</h1>
          <p className="text-[#475569] text-sm mt-1">Welcome back. Here is what’s happening with your house today.</p>
        </div>
        <button className="bg-[#2F6FED] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Gavel size={16} />
          Create New Auction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={cardStyle}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F5F7FB] text-[#2F6FED] rounded-xl">{stat.icon}</div>
              <span className="text-[10px] font-bold text-[#10B981] bg-[#F0FDF4] px-2 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <p className={statLabel}>{stat.label}</p>
            <p className={statValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${cardStyle} lg:col-span-2 overflow-hidden`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#0F172A]">Recent Auctions</h3>
            <button className="text-[12px] font-bold text-[#2F6FED] hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="pb-4 text-[11px] font-bold text-[#475569] uppercase tracking-widest">Item Name</th>
                  <th className="pb-4 text-[11px] font-bold text-[#475569] uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[11px] font-bold text-[#475569] uppercase tracking-widest text-right">Price</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentAuctions.map((auc) => (
                  <tr key={auc.id} className="group hover:bg-[#F5F7FB]/50 transition-colors">
                    <td className="py-4 font-semibold text-[#0F172A] text-sm">{auc.item}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight
                        ${
                          auc.status === "Live"
                            ? "bg-[#F0FDF4] text-[#166534]"
                            : auc.status === "Pending"
                            ? "bg-[#FFFBEB] text-[#92400E]"
                            : "bg-[#F1F5F9] text-[#475569]"
                        }`}
                      >
                        {auc.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-bold text-[#0F172A] text-sm">{auc.currentPrice}</td>
                    <td className="py-4 text-right text-[#94A3B8]">
                      <button className="hover:text-[#2F6FED] transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg">House Standing</h3>
              <p className="text-white/60 text-xs mt-1">KYC Status: Verified</p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#2F6FED] flex items-center justify-center font-bold">
                  A+
                </div>
                <div>
                  <p className="text-sm font-bold">Excellent</p>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Trust Score</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#2F6FED] rounded-full blur-[60px] opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;