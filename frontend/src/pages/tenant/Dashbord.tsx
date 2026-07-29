import React, { useEffect, useState } from "react";
import type { AdminAuctionHouseDetailDTO } from '../../types/auctionHouse.type'
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
  Plus,
  MessageSquare,
} from "lucide-react";
import chatService from "../../services/chat.service";
import auctionHouseService from "../../services/auctionHouse.service";

const TenantDashboard: React.FC = () => {
  const [house, setHouse] = useState<AdminAuctionHouseDetailDTO | null>(null)
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const navigate = useNavigate()
  const handleInitiateChat = async () => {
    setIsChatLoading(true)
    try {
      const payload = {
        receiverId: '',
        receiverRole: 'admin'
      }
      const response = await chatService.getOrCreateConversation(payload)
      if (response.success && response.data) {
        navigate('/tenant/chat')
      }
      else {
        toast.error(response.message)
      }
    } catch {
      toast.error('failed to start conversation')
    } finally {
      setIsChatLoading(false)
    }
  }



  const fetchAuctionProfile = async () => {
    const response = await auctionHouseService.getProfile();
    if (response.success && response.data) {
      setHouse(response.data)
    }
  }
  const status = house?.status
  useEffect(() => {
    fetchAuctionProfile()
  }, [])

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

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-8 relative">

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#475569] font-medium mt-1">Manage and create auctions for your business</p>
        </div>

        <Link to='/tenant/create-auction'>
          <button className="group px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-[#2F6FED] text-white hover:bg-[#2557C8] shadow-md shadow-[#2F6FED]/20 transition-all flex items-center gap-2">
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            Create Auction
          </button>
        </Link>
      </div>


      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleInitiateChat}
          disabled={isChatLoading}
          className="relative group flex items-center gap-3 bg-[#0F172A] text-white px-5 py-4 rounded-full shadow-xl hover:bg-[#2F6FED] transition-all duration-300"
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