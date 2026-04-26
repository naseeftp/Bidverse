import React, { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../services/admin.service";
import type { UserResponseDTO } from "../../types/auth.type";
import toast from "react-hot-toast";

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponseDTO | null>(null);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <div className="w-10 h-10 border-4 border-[#111827] border-t-[#D4AF37] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← Back to Registry
        </button>


        <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest border ${user?.isActive
          ? "bg-[#16A34A] text-white border-[#16A34A]"
          : "bg-[#DC2626] text-white border-[#DC2626]"
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
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#D4AF37]  leading-none">
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
          </div>



          <div className="col-span-full pt-10 mt-4 border-t border-[#E5E7EB] flex justify-end">
            <button className="px-8 py-3 bg-[#111827] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#111827]/90 hover:border-[#D4AF37] border border-transparent transition-all shadow-lg">
              Manage User Permissions
            </button>
          </div>
        </div>
      </div>
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