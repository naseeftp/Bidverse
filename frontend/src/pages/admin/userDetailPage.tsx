import React, { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../services/admin.service";
import type { UserResponseDTO } from "../../types/auth.type";
import { updateUserStatusSchema } from '../../types/admin.dto'
import toast from "react-hot-toast";
import * as Yup from "yup";

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"BLOCK" | "UNBLOCK">("BLOCK");
  const [blockReason, setBlockReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    const response = await adminService.getUserById(id);
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      toast.error(response.message || "User not found");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleOpenModal = (mode: "BLOCK" | "UNBLOCK") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!id) return;

    const targetActiveState = modalMode === "UNBLOCK";
    const payload = {
      isActive: targetActiveState,
      reason: targetActiveState ? undefined : blockReason,
    };

    try {
      await updateUserStatusSchema.validate(payload);

      setIsSubmitting(true);
      const response = await adminService.updateUserStatus(id, payload);

      if (response.success && response.data) {
        setUser(response.data);
        toast.success(`User ${targetActiveState ? "unblocked" : "blocked"} successfully`);
        setIsModalOpen(false);
        setBlockReason("");
      } else {
        toast.error(response.message || "Action failed");
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <div className="w-10 h-10 border-4 border-[#111827] border-t-[#D4AF37] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 lg:p-12 font-sans relative">

      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← Back to Registry
        </button>

        <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest border ${user?.isActive ? "bg-[#16A34A] text-white border-[#16A34A]" : "bg-[#DC2626] text-white border-[#DC2626]"
          }`}>
          {user?.isActive ? 'Authorized Access' : 'Access Revoked'}
        </span>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-[#E5E7EB] shadow-sm">

        <div className="h-40 bg-[#111827] relative px-8">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="w-32 h-32 bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center text-[#111827]/20 font-black text-4xl">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="mb-2 pb-1">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#D4AF37] leading-none">
                {user?.name}
              </h1>
              <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mt-1">
                {user?.email}
              </p>
            </div>
          </div>
        </div>


        <div className="pt-20 pb-12 px-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
          <DetailSection label="Database ID" value={user?.id} isMono />
          <DetailSection label="Contact Number" value={user?.phone || "Not Provided"} />

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#6B7280] font-black mb-1">Account Status</span>
            <p className={`text-sm font-bold uppercase ${user?.isActive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {user?.isActive ? "Active" : "Blocked"}
            </p>
            {!user?.isActive && user?.BlockingReson && (
              <p className="text-[10px] text-[#DC2626] mt-1 font-medium italic">Reason: {user.BlockingReson}</p>
            )}
          </div>

          <div className="col-span-full pt-10 mt-4 border-t border-[#E5E7EB] flex justify-end gap-4">
            {user?.isActive ? (
              <button
                onClick={() => handleOpenModal("BLOCK")}
                className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all shadow-md"
              >
                Block User
              </button>
            ) : (
              <button
                onClick={() => handleOpenModal("UNBLOCK")}
                className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white transition-all shadow-md"
              >
                Unblock User
              </button>
            )}
          </div>
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/80 backdrop-blur-sm p-4">
          <div className={`bg-white w-full max-w-md p-8 border-t-4 shadow-2xl ${modalMode === 'BLOCK' ? 'border-[#DC2626]' : 'border-[#16A34A]'}`}>
            <h2 className="text-xl font-black uppercase tracking-tighter text-[#111827] mb-2">
              {modalMode === "BLOCK" ? "Restrict Access" : "Restore Access"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-6">
              {modalMode === "BLOCK"
                ? "Enter the official reason for blocking this account."
                : "Are you sure you want to re-authorize this user to the BidVerse platform?"}
            </p>

            {modalMode === "BLOCK" && (
              <textarea
                className="w-full h-32 bg-[#F3F4F6] border border-[#E5E7EB] p-4 text-xs font-bold text-[#111827] focus:outline-none focus:border-[#D4AF37] transition-all resize-none mb-6"
                placeholder="Minimum 5 characters required..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => { setIsModalOpen(false); setBlockReason(""); }}
                className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleToggleStatus}
                className={`px-6 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${modalMode === "BLOCK" ? "bg-[#111827] hover:bg-[#DC2626]" : "bg-[#16A34A] hover:bg-[#16A34A]/90"
                  }`}
              >
                {isSubmitting ? "Processing..." : modalMode === "BLOCK" ? "Confirm Block" : "Confirm Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailSection = ({ label, value, isMono = false }: { label: string, value?: string, isMono?: boolean }) => (
  <div className="flex flex-col group">
    <span className="text-[9px] uppercase tracking-[0.2em] text-[#6B7280] font-black mb-1 group-hover:text-[#D4AF37] transition-colors">
      {label}
    </span>
    <p className={`text-sm font-bold text-[#0F172A] ${isMono ? 'font-mono text-[11px] text-[#6B7280]' : ''}`}>
      {value || "—"}
    </p>
  </div>
);

export default UserDetailPage;