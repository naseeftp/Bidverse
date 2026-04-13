import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { FaArrowLeft, FaSearchPlus } from 'react-icons/fa';
import { VerificationStatus } from '../../types/auctionHouse.type';
import type { TVerificationStatus } from '../../types/auctionHouse.type';
import type { updateAuctionHouseStatusRequestDTO } from '../../types/admin.dto';

const AuctionHouseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [house, setHouse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        const res = await adminService.getAuctionHouseById(id!);
        if (res.success && 'data' in res) {
            setHouse(res.data);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (status: TVerificationStatus) => {
        if (status === VerificationStatus.REJECTED) {
            if (!showRejectInput) {
                setShowRejectInput(true);
                return;
            }
            if (!rejectionReason || rejectionReason.trim().length < 5) {
                alert("A valid reason (minimum 5 characters) is required for rejection.");
                return;
            }
        }
        const updateData: updateAuctionHouseStatusRequestDTO = {
            status: status,
            reason: status === VerificationStatus.REJECTED ? rejectionReason : null
        };

        setActionLoading(true);

        try {

            const res = await adminService.updateHouseStatus(id!, updateData);
            if (res.success) {
                setHouse((prev: any) => ({
                    ...prev,
                    status: status
                }));
                setShowRejectInput(false);
                setRejectionReason('');
                console.log("Registry updated successfully");
            } else {
                alert(res.message || "Failed to update registry status.");
            }
        } catch (error) {
            console.error("Critical update error:", error);
            alert("An error occurred. Please check your connection and try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-zinc-400 animate-pulse font-black uppercase tracking-widest">Verifying Registry...</div>;

    if (!house) return <div className="p-20 text-center text-red-500 font-black uppercase">Record not found.</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12 text-zinc-900 font-sans">
            {selectedImg && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
                    onClick={() => setSelectedImg(null)}
                >
                    <img src={selectedImg} className="max-w-full max-h-full rounded shadow-2xl" alt="Preview" />
                    <button className="absolute top-10 right-10 text-white text-3xl">&times;</button>
                </div>
            )}


            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 gap-4">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors uppercase text-[10px] font-black tracking-widest"
                    >
                        <FaArrowLeft /> Back to Registry
                    </button>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight text-zinc-900">{house.name}</h1>
                        <p className="text-zinc-500 font-mono text-xs mt-1 tracking-tighter uppercase">Registry ID: {house._id}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest 
                        ${house.status === VerificationStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                            house.status === VerificationStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                'bg-emerald-100 text-emerald-700'}`}>
                        Status: {house.status}
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                <div className="lg:col-span-8 space-y-8">

                    <section className="bg-white border border-zinc-200 p-8 rounded shadow-sm">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Verification Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Registration Certificate', url: house.legal?.registrationCertificateUrl },
                                { label: 'Identity Proof', url: house.legal?.identityProofUrl }
                            ].map((doc, idx) => (
                                doc.url && (
                                    <div key={idx} className="group">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3 tracking-wide">{doc.label}</p>
                                        <div
                                            className="relative aspect-video bg-zinc-50 border border-zinc-100 rounded overflow-hidden cursor-pointer group-hover:border-zinc-300 transition-all"
                                            onClick={() => setSelectedImg(doc.url)}
                                        >
                                            <img src={doc.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={doc.label} />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                                                <FaSearchPlus className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-zinc-200 p-8 rounded shadow-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-6">Contact Registry</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Representative</label>
                                    <p className="text-sm font-semibold">{house.contact?.primaryContactName}</p>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Official Email</label>
                                    <p className="text-sm text-blue-600 font-medium underline underline-offset-4">{house.contact?.businessEmail}</p>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Phone</label>
                                    <p className="text-sm">{house.contact?.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 p-8 rounded shadow-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-6">Location Details</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Full Address</label>
                                    <p className="text-sm leading-relaxed">{house.address?.fullAddress}</p>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">City/State</label>
                                        <p className="text-sm">{house.address?.city}, {house.address?.state}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Country</label>
                                        <p className="text-sm">{house.address?.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="bg-white border border-zinc-200 p-8 rounded shadow-sm">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4">Brief Narrative</h4>
                        <p className="text-sm text-zinc-600 leading-relaxed italic">"{house.briefDescription}"</p>
                    </section>
                </div>

                {/* Right Side: Decision Box */}
                <aside className="lg:col-span-4">
                    <div className="sticky top-10 space-y-6">
                        <div className="bg-zinc-900 p-8 rounded-lg shadow-xl text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Admin Decision</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => handleStatusUpdate(VerificationStatus.APPROVED)}
                                    disabled={actionLoading || house.status === VerificationStatus.APPROVED}
                                    className="w-full py-4 bg-emerald-500 text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Processing...' : 'Approve House'}
                                </button>

                                {!showRejectInput ? (
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        disabled={house.status === VerificationStatus.REJECTED}
                                        className="w-full py-4 border border-zinc-700 text-red-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-500/10 transition-all disabled:opacity-30"
                                    >
                                        Reject House
                                    </button>
                                ) : (
                                    <div className="space-y-3 pt-4 animate-in slide-in-from-top-2">
                                        <textarea
                                            placeholder="REASON FOR REJECTION (MIN 5 CHARS)..."
                                            className="w-full bg-black border border-zinc-700 p-4 text-[11px] font-mono text-white outline-none focus:border-red-500"
                                            rows={4}
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(VerificationStatus.REJECTED)}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                                            >
                                                {actionLoading ? 'Updating...' : 'Confirm'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowRejectInput(false);
                                                    setRejectionReason('');
                                                }}
                                                className="px-4 py-3 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-100 rounded text-center">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Entry Date</p>
                            <p className="text-xs font-mono font-bold text-zinc-600 mt-1">
                                {house.createdAt ? new Date(house.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default AuctionHouseDetails;