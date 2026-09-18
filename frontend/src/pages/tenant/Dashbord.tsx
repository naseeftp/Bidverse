import React, { useCallback, useEffect, useState } from "react";
import type { AdminAuctionHouseDetailDTO } from "../../types/auctionHouse.type";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { TenantDashboardResponseDTO } from "../../types/tenantDashboard.dto";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
  MessageSquare,
  DollarSign,
  ShoppingBag,
  Gavel,
  Layers,
  RotateCcw,
  TrendingUp,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import chatService from "../../services/chat.service";
import auctionHouseService from "../../services/auctionHouse.service";
import dashboardService from "../../services/dashboard.service";

const TenantDashboard: React.FC = () => {
  const [house, setHouse] = useState<AdminAuctionHouseDetailDTO | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<TenantDashboardResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleInitiateChat = async () => {
    setIsChatLoading(true);
    try {
      const payload = {
        receiverId: "",
        receiverRole: "admin",
      };
      const response = await chatService.getOrCreateConversation(payload);
      if (response.success && response.data) {
        navigate("/tenant/chat");
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to start conversation");
    } finally {
      setIsChatLoading(false);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getTenantDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to display dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuctionProfile = async () => {
    const response = await auctionHouseService.getProfile();
    if (response.success && response.data) {
      setHouse(response.data);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAuctionProfile();
  }, [fetchDashboardData]);

  const status = house?.status;

  // Render Verification Status Screen if not approved
  if (status !== "approved") {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2rem] p-12 text-center shadow-sm">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500 ${
              status === "rejected"
                ? "bg-[#FEF2F2] text-[#EF4444]"
                : "bg-[#F5F7FB] text-[#2F6FED]"
            }`}
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
                {house?.rejectionReason && (
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
                <button className="group px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 w-full shadow-lg shadow-[#2F6FED]/20 bg-[#2F6FED] text-white hover:bg-[#2557C8]">
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

  // Calculate max revenue value for scaling trend bars
  const maxRevenue = dashboardData?.revenueTrend?.length
    ? Math.max(...dashboardData.revenueTrend.map((item) => item.revenue), 1)
    : 1;

  // Format numbers to currency format
  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-[#475569] font-medium mt-1">
              Real-time snapshot of your auction business metrics and operations
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F5F7FB] px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {loading && !dashboardData ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#475569]">
            <Loader2 size={36} className="animate-spin text-[#2F6FED] mb-3" />
            <p className="text-sm font-medium">Fetching dashboard insights...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Total Revenue */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">
                  {formatCurrency(dashboardData?.overview?.totalRevenue)}
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#F5F7FB] text-[#0F172A]">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">
                  {dashboardData?.overview?.totalOrders ?? 0}
                </div>
              </div>

              {/* Active Auctions */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Active Auctions
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#059669]">
                    <Gavel size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">
                  {dashboardData?.overview?.activeAuctions ?? 0}
                </div>
              </div>

              {/* Total Listings */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Total Listings
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#F5F7FB] text-[#0F172A]">
                    <Layers size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">
                  {dashboardData?.overview?.totalListings ?? 0}
                </div>
              </div>

              {/* Pending Returns */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Pending Returns
                  </span>
                  <div
                    className={`p-2.5 rounded-xl ${
                      (dashboardData?.overview?.pendingReturnRequests ?? 0) > 0
                        ? "bg-[#FEF2F2] text-[#EF4444]"
                        : "bg-[#F5F7FB] text-[#475569]"
                    }`}
                  >
                    <RotateCcw size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">
                  {dashboardData?.overview?.pendingReturnRequests ?? 0}
                </div>
              </div>
            </div>

            {/* Main Visual Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Revenue Trend Visualizer */}
              <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#2F6FED]" />
                        Revenue Performance
                      </h2>
                      <p className="text-xs text-[#475569] mt-0.5">
                        Daily revenue records over time
                      </p>
                    </div>
                  </div>

                  {/* Visual Bar Graph */}
                  {dashboardData?.revenueTrend && dashboardData.revenueTrend.length > 0 ? (
                    <div className="h-56 flex items-end justify-between gap-4 pt-8 pb-2 px-2 border-b border-[#E2E8F0]">
                      {dashboardData.revenueTrend.map((trend, idx) => {
                        const heightPercentage = Math.round((trend.revenue / maxRevenue) * 100);
                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center h-full justify-end group relative"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-10">
                              {formatCurrency(trend.revenue)}
                            </div>

                            {/* Bar */}
                            <div
                              style={{ height: `${Math.max(heightPercentage, 6)}%` }}
                              className="w-full max-w-[56px] bg-[#2F6FED] rounded-t-lg transition-all duration-500 group-hover:bg-[#2557C8]"
                            />

                            {/* Label */}
                            <span className="text-[11px] font-semibold text-[#475569] mt-3">
                              {new Date(trend.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-[#475569] text-sm">
                      No revenue trends recorded yet.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[#475569]">
                  <span>Sorted chronologically</span>
                  <span className="font-semibold text-[#0F172A]">
                    Peak: {formatCurrency(maxRevenue)}
                  </span>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-[#2F6FED]" />
                    Order Status
                  </h2>
                  <p className="text-xs text-[#475569] mb-6">
                    Distribution of order states
                  </p>

                  <div className="space-y-4">
                    {dashboardData?.orderStatusBreakdown?.map((item, idx) => {
                      const isCompleted = item.status === "COMPLETED";
                      const isRefunded = item.status === "REFUNDED";

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FB]"
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted && <CheckCircle2 size={18} className="text-[#10B981]" />}
                            {isRefunded && <RotateCcw size={18} className="text-[#EF4444]" />}
                            {!isCompleted && !isRefunded && (
                              <Clock size={18} className="text-[#F59E0B]" />
                            )}
                            <span className="text-xs font-bold text-[#0F172A] tracking-wide">
                              {item.status}
                            </span>
                          </div>
                          <span className="text-sm font-black text-[#0F172A] bg-[#FFFFFF] px-3 py-1 rounded-lg border border-[#E2E8F0]">
                            {item.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#475569]">
                  <span>Total Recorded Orders</span>
                  <span className="text-[#0F172A]">
                    {dashboardData?.overview?.totalOrders ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Grid (Listing Status & Return Request Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Listing Status Breakdown */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                  <Package size={20} className="text-[#2F6FED]" />
                  Listing Status Breakdown
                </h2>
                <p className="text-xs text-[#475569] mb-6">
                  Overview of current listing stages
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashboardData?.listingStatusBreakdown?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                          {item.status}
                        </span>
                        <span className="text-xl font-black text-[#0F172A] mt-1">
                          {item.count}
                        </span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FED]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Requests Statistics */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                  <RotateCcw size={20} className="text-[#2F6FED]" />
                  Return Request Stats
                </h2>
                <p className="text-xs text-[#475569] mb-6">
                  Lifecycle status of customer return requests
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {/* Pending */}
                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex flex-col items-center text-center">
                    <Clock size={20} className="text-[#D97706] mb-2" />
                    <span className="text-2xl font-black text-[#B45309]">
                      {dashboardData?.returnRequestStats?.pending ?? 0}
                    </span>
                    <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider mt-1">
                      Pending
                    </span>
                  </div>

                  {/* Approved */}
                  <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col items-center text-center">
                    <CheckCircle2 size={20} className="text-[#059669] mb-2" />
                    <span className="text-2xl font-black text-[#047857]">
                      {dashboardData?.returnRequestStats?.approved ?? 0}
                    </span>
                    <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider mt-1">
                      Approved
                    </span>
                  </div>

                  {/* Rejected */}
                  <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col items-center text-center">
                    <XCircle size={20} className="text-[#DC2626] mb-2" />
                    <span className="text-2xl font-black text-[#B91C1C]">
                      {dashboardData?.returnRequestStats?.rejected ?? 0}
                    </span>
                    <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider mt-1">
                      Rejected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Chat Support Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleInitiateChat}
          disabled={isChatLoading}
          className="relative group flex items-center gap-3 bg-[#0F172A] text-white px-5 py-4 rounded-full shadow-xl hover:bg-[#2F6FED] transition-all duration-300 disabled:opacity-50"
          aria-label="Chat with Platform Support"
        >
          <span className="absolute -inset-0.5 rounded-full bg-[#2F6FED] opacity-75 blur animate-pulse group-hover:opacity-100 transition duration-1000"></span>

          <div className="relative flex items-center gap-3">
            <MessageSquare size={20} className="animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-widest pr-1">
              Chat Support
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TenantDashboard;