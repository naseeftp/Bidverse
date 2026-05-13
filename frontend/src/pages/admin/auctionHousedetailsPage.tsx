import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { FaArrowLeft, FaSearchPlus, FaUserShield, FaStoreAlt, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import { VerificationStatus } from '../../types/auctionHouse.type';
import type { TVerificationStatus, AdminAuctionHouseDetailDTO } from '../../types/auctionHouse.type';
import type { updateAuctionHouseStatusRequestDTO } from '../../types/admin.dto';
import toast from 'react-hot-toast';

const AuctionHouseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [house, setHouse] = useState<AdminAuctionHouseDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

  
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [blockModalMode, setBlockModalMode] = useState<"BLOCK" | "UNBLOCK">("BLOCK");
    const [blockReason, setBlockReason] = useState("");
    const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        const res = await adminService.getAuctionHouseById(id!);
        if (res.success) {
            setHouse(res.data!);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id, fetchDetails]);

   
    const handleStatusUpdate = async (status: TVerificationStatus) => {
        if(!house?.houseId) return
        if (status === VerificationStatus.REJECTED) {
            if (!showRejectInput) {
                setShowRejectInput(true);
                return;
            }
            if (!rejectionReason || rejectionReason.trim().length < 5) {
                toast.error("Please provide a valid reason for rejection.");
                return;
            }
        }

        const updateData: updateAuctionHouseStatusRequestDTO = {
            status,
            reason: status === VerificationStatus.REJECTED ? rejectionReason : null
        };

        setActionLoading(true);
        try {
            const res = await adminService.updateHouseStatus(house?.houseId, updateData);
            if (res.success) {
                setHouse((prev) => prev ? ({ ...prev, status }) : null);
                setShowRejectInput(false);
                setRejectionReason('');
                toast.success(`Protocol updated to ${status}`);
            }
        } catch {
            toast.error("Protocol update failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenBlockModal = (mode: "BLOCK" | "UNBLOCK") => {
        setBlockModalMode(mode);
        setIsBlockModalOpen(true);
    };

    const handleToggleUserStatus = async () => {
        if (!house?.userId) return;

        const targetActiveState = blockModalMode === "UNBLOCK";
        const payload = {
            isActive: targetActiveState,
            reason: targetActiveState ? undefined : blockReason,
        };

        setIsStatusSubmitting(true);
        try {
            
            const response = await adminService.updateUserStatus(house.userId, payload);

            if (response.success) {
                
                setHouse(prev => prev ? ({ ...prev, isAccountBlocked: !targetActiveState }) : null);
                toast.success(`Owner ${targetActiveState ? "unblocked" : "blocked"} successfully`);
                setIsBlockModalOpen(false);
                setBlockReason("");
            } else {
                toast.error(response.message || "Action failed");
            }
        } catch {
            toast.error("An unexpected error occurred during status sync.");
        } finally {
            setIsStatusSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center text-[#111827] font-black tracking-[0.4em] animate-pulse">
            DECRYPTING REGISTRY...
        </div>
    );

    if (!house) return <div className="p-20 text-center text-[#DC2626] font-black uppercase tracking-widest">Record Null.</div>;

    const isSubmitted = house.status !== 'not_submitted';

    return (
        <div className="min-h-screen bg-[#F3F4F6] p-6 lg:p-12 text-[#0F172A] font-sans">

            
            {selectedImg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/95 p-6 cursor-zoom-out" onClick={() => setSelectedImg(null)}>
                    <img src={selectedImg} className="max-w-full max-h-full rounded shadow-2xl border border-[#D4AF37]" alt="Preview" />
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#E5E7EB] pb-8 gap-6">
                    <div className="space-y-4">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-all uppercase text-[10px] font-black tracking-widest">
                            <FaArrowLeft /> Return to Global Registry
                        </button>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111827]">
                                {isSubmitted ? house.businessName : house.userName}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-[#D4AF37] font-mono text-[11px] font-bold tracking-widest uppercase">
                                    Status: {house.status}
                                </p>
                                <span className="text-[#E5E7EB]">|</span>
                                <p className="text-[#6B7280] font-mono text-[11px] uppercase">OWNER ID: {house.userId}</p>
                            </div>
                        </div>
                    </div>

                    {isSubmitted && house.status === VerificationStatus.PENDING && (
                        <div className="flex gap-3">
                            <button onClick={() => handleStatusUpdate(VerificationStatus.APPROVED)} disabled={actionLoading} className="px-8 py-3 bg-[#111827] text-[#D4AF37] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                {actionLoading ? 'Processing...' : 'Authorize House'}
                            </button>
                            <button onClick={() => setShowRejectInput(true)} className="px-8 py-3 border border-[#DC2626] text-[#DC2626] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                                Flag Documents
                            </button>
                        </div>
                    )}
                </header>

                
                {showRejectInput && (
                    <section className="bg-white border-l-4 border-[#DC2626] p-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
                        <h3 className="text-[11px] font-black text-[#DC2626] uppercase tracking-widest mb-4">Rejection Protocol</h3>
                        <textarea
                            placeholder="Specify detailed reason for rejection..."
                            className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-4 text-sm outline-none focus:border-[#DC2626] mb-4 h-32"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button onClick={() => handleStatusUpdate(VerificationStatus.REJECTED)} className="bg-[#DC2626] text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest">Confirm Rejection</button>
                            <button onClick={() => setShowRejectInput(false)} className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest">Abort</button>
                        </div>
                    </section>
                )}

               
                <section className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden rounded-sm">
                    <div className="bg-[#111827] px-8 py-4 flex items-center gap-3">
                        <FaUserShield className="text-[#D4AF37]" />
                        <h2 className="text-white text-[11px] font-black uppercase tracking-[0.3em]">Owner Intelligence</h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-10 items-center">
                        <div>
                            <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-1">Account Holder</label>
                            <p className="text-sm font-bold text-[#111827]">{house.userName}</p>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-1">Auth Email</label>
                            <p className="text-sm text-[#111827]">{house.userEmail}</p>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-1">Account State</label>
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${house.isAccountBlocked ? 'bg-red-50 text-[#DC2626]' : 'bg-emerald-50 text-[#16A34A]'}`}>
                                {house.isAccountBlocked ? 'Restricted' : 'Active'}
                            </span>
                        </div>
                        <div className="md:text-right">
                            <button 
                                onClick={() => handleOpenBlockModal(house.isAccountBlocked ? "UNBLOCK" : "BLOCK")}
                                className={`px-6 py-2 text-[10px] font-black uppercase border transition-all ${house.isAccountBlocked ? 'border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white' : 'border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white'}`}
                            >
                                {house.isAccountBlocked ? 'Unblock Owner' : 'Block Owner'}
                            </button>
                        </div>
                    </div>
                </section>

               
                <section className="space-y-6">
                    {!isSubmitted ? (
                        <div className="bg-white border border-[#E5E7EB] p-20 text-center rounded-sm">
                            <FaInfoCircle className="mx-auto text-[#E5E7EB] text-4xl mb-4" />
                            <h3 className="text-lg font-black uppercase tracking-widest text-[#111827]">Documentation Missing</h3>
                            <p className="text-[#6B7280] text-sm mt-2 font-medium">Tenant has not initiated the verification protocol.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-sm overflow-hidden">
                            <div className="bg-[#111827] px-8 py-4 flex items-center gap-3">
                                <FaStoreAlt className="text-[#D4AF37]" />
                                <h2 className="text-white text-[11px] font-black uppercase tracking-[0.3em]">Business Registry</h2>
                            </div>
                            
                            <div className="p-8 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest block mb-2">Executive Summary</label>
                                            <p className="text-sm leading-relaxed text-[#111827] font-medium italic border-l-2 border-[#E5E7EB] pl-4">{house.briefDescription}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 pt-4">
                                            <div>
                                                <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-1">Establishment Year</label>
                                                <p className="text-sm font-bold">{house.yearEstablished}</p>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-1">Tax / Registration ID</label>
                                                <p className="text-sm font-mono font-bold text-[#111827]">{house.documents?.taxId || house.documents?.registerNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6 bg-[#F3F4F6] p-6 rounded-sm">
                                        <div>
                                            <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Location Context</label>
                                            <p className="text-xs font-bold uppercase">{house.address?.fullAddress}</p>
                                            <p className="text-xs text-[#6B7280] mt-1">{house.address?.city}, {house.address?.state}, {house.address?.country}</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Contact Protocol</label>
                                            <p className="text-xs font-bold uppercase">{house.contact?.primaryContactName}</p>
                                            <p className="text-xs text-[#111827] font-bold underline decoration-[#D4AF37] underline-offset-4 mt-1">{house.contact?.businessEmail}</p>
                                            <p className="text-[10px] text-[#6B7280] mt-1 font-mono">{house.contact?.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-[#F3F4F6]">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111827] mb-6 flex items-center gap-2">
                                        <FaFileAlt className="text-[#D4AF37]" /> Document Inspection
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Registration Certificate', url: house.documents?.registrationCertificateUrl },
                                            { label: 'Identity Proof', url: house.documents?.identityProofUrl }
                                        ].map((doc, idx) => (
                                            doc.url && (
                                                <div key={idx} className="group relative">
                                                    <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-3">{doc.label}</p>
                                                    <div 
                                                        className="relative aspect-video bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden cursor-zoom-in group-hover:border-[#D4AF37] transition-all"
                                                        onClick={() => setSelectedImg(doc.url!)}
                                                    >
                                                        <img src={doc.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={doc.label} />
                                                        <div className="absolute inset-0 bg-[#111827]/0 group-hover:bg-[#111827]/10 flex items-center justify-center transition-all">
                                                            <FaSearchPlus className="text-white opacity-0 group-hover:opacity-100" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <footer className="text-center pt-10">
                    <p className="text-[9px] font-black text-[#E5E7EB] uppercase tracking-[0.5em]">
                        System Generated Entry: {house.createdAt ? new Date(house.createdAt).toLocaleString() : 'N/A'}
                    </p>
                </footer>
            </div>

            
            {isBlockModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#111827]/80 backdrop-blur-sm p-4">
                    <div className={`bg-white w-full max-w-md p-8 border-t-4 shadow-2xl ${blockModalMode === 'BLOCK' ? 'border-[#DC2626]' : 'border-[#16A34A]'}`}>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-[#111827] mb-2">
                            {blockModalMode === "BLOCK" ? "Restrict Access" : "Restore Access"}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-6">
                            {blockModalMode === "BLOCK"
                                ? "Enter the official reason for blocking this account."
                                : "Are you sure you want to re-authorize this user to the platform?"}
                        </p>

                        {blockModalMode === "BLOCK" && (
                            <textarea
                                className="w-full h-32 bg-[#F3F4F6] border border-[#E5E7EB] p-4 text-xs font-bold text-[#111827] focus:outline-none focus:border-[#D4AF37] transition-all resize-none mb-6"
                                placeholder="Minimum 5 characters required..."
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                            />
                        )}

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => { setIsBlockModalOpen(false); setBlockReason(""); }}
                                className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#111827]"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isStatusSubmitting}
                                onClick={handleToggleUserStatus}
                                className={`px-6 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${blockModalMode === "BLOCK" ? "bg-[#111827] hover:bg-[#DC2626]" : "bg-[#16A34A] hover:bg-[#16A34A]/90"
                                    }`}
                            >
                                {isStatusSubmitting ? "Processing..." : blockModalMode === "BLOCK" ? "Confirm Block" : "Confirm Unblock"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuctionHouseDetails;