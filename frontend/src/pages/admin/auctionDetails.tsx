import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuctionItemStatus, updateAuctionStatusSchema, type AuctionItemDetailDTO } from "../../types/auctionItem.dto";
import toast from "react-hot-toast";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import {
    FaChevronLeft,
    FaBuilding,
    FaClock,
    FaTruck,
    FaCoins,
    FaCheckCircle,
    FaTimesCircle,
    FaBan,
    FaSearchPlus,
    FaExclamationTriangle,
    FaHistory
} from "react-icons/fa";

import { ValidationError } from "yup";
const AdminAuctionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null)
    const [activeImage, setActiveImage] = useState<string>('');
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [validationError, setValidationError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const fetchAuction = useCallback(async () => {
        setLoading(true);

        try {
            const result = await auctionItemMangementService.getAuction(id!);

            if (result.success && result.data) {
                setAuction(result.data);

                const primaryImage =
                    result.data.images.find(img => img.isPrimary)?.url ||
                    result.data.images?.[0]?.url;

                setActiveImage(primaryImage);
            } else {
                toast.error(result.message);
                navigate("/admin/auctions");
            }
        } catch {
            toast.error("Failed to fetch auction details");
            navigate("/admin/auctions");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchAuction();
        }
    }, [id, fetchAuction]);
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { // creating an arrow fn that accept react mouse event bound to  specifally bound to html div element
        // its allow us to access active mouse co ordinates (e.pagex e.pagey)
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect(); // identifying where the image located in the screen and how big it is
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y });
    };
    const openStatusModal = (type: 'APPROVE' | 'REJECT') => {
        setModalType(type);
        setRejectionReason('');
        setValidationError('');
        setModalOpen(true)
    }

    const handleUpdateStatus = async () => {
        if (!auction) return;
        const targetStatus = modalType === 'APPROVE' ? AuctionItemStatus.SCHEDULED : AuctionItemStatus.REJECTED;
        const payload = {
            itemId: auction.auctionItemId,
            status: targetStatus,
            reason: modalType == 'REJECT' ? rejectionReason : null
        }
        try {
            await updateAuctionStatusSchema.validate(payload, { abortEarly: false });
            setValidationError("");
        } catch (err) {
            if (err instanceof ValidationError) {
                setValidationError(err.errors[0]);
                return;
            }
        }
        setActionLoading(true)
        try {
            const result = await auctionItemMangementService.updateAuctionStatus(payload);
            if (result.success) {
                toast.success(result.message);
                setModalOpen(false);
                fetchAuction()
            }
            else {
                toast.error(result.message)
            }
        } catch {
            toast.error('error while updating the auction status')
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancelAuction = () => {

    }
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs uppercase tracking-widest font-black text-[#6B7280]">Loading Auction Details...</p>
            </div>
        )
    }
    if (!auction) return null
    const isPendingReview = auction?.status == 'PENDING_APPROVAL' && !auction?.isApproved
    const isHalted = auction.status === 'REJECTED' || auction.status === 'CANCELLED_BY_ADMIN';
    const haltNotice = auction.rejectionReason // later add auction cancellation reason
    return (

        <div className="min-h-screen bg-[#F3F4F6] px-4 py-8 md:px-8 text-[#0F172A] font-sans">
            {isHalted && (
                <style>{`
                    @keyframes marqueeHalt {
                        0% { transform: translate3d(100%, 0, 0); }
                        100% { transform: translate3d(-100%, 0, 0); }
                    }
                    .animate-marquee-halt {
                        display: inline-block;
                        white-space: nowrap;
                        padding-left: 25%;
                        animation: marqueeHalt 22s linear infinite;
                    }
                    .animate-marquee-halt:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            )}

            -            {isHalted && (
                <div className="max-w-7xl mx-auto mb-6 bg-[#DC2626] border border-[#B91C1C] rounded-xl shadow-md overflow-hidden relative group">
                    <div className="flex items-center">
                        <div className="bg-[#B91C1C] text-white px-4 py-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-r border-[#991B1B] z-10 shadow-lg shrink-0 select-none">
                            <FaExclamationTriangle className="animate-pulse text-[#FDE047]" size={12} />
                            <span>System Alert ({auction.status.replace(/_/g, " ")}) :</span>
                        </div>

                        <div className="w-full overflow-hidden py-2 text-white font-mono font-bold text-xs tracking-wide">
                            <div className="animate-marquee-halt cursor-help">
                                {haltNotice} &bull; <span className="text-amber-300">ACTION REASON </span> &bull; {haltNotice}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => navigate("/admin/auctions")}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                    <FaChevronLeft size={10} /> Back to Auctions
                </button>
                <span className="text-[10px] font-mono tracking-widest text-[#6B7280]">
                    AUCTION ITOM ID: #{auction.auctionItemId?.toUpperCase()}
                </span>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <div className="lg:col-span-7 space-y-6">

                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4">
                        <div
                            className="h-[450px] w-full rounded-lg overflow-hidden bg-[#F3F4F6] relative cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                        >
                            <img
                                src={activeImage}
                                alt={auction.title}
                                className={`w-full h-full object-cover transition-transform duration-75 origin-center ${isZoomed ? "scale-[2.2]" : "scale-100"
                                    }`}
                                style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                            />

                            {!isZoomed && (
                                <div className="absolute bottom-4 right-4 bg-[#111827]/80 text-white p-2 rounded-md pointer-events-none flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest">
                                    <FaSearchPlus size={12} /> Hover to Zoom
                                </div>
                            )}
                        </div>

                        {auction.images && auction.images.length > 1 && (
                            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                                {auction.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-20 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img.url ? "border-[#D4AF37] scale-95" : "border-[#E5E7EB] opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img.url} alt={img.altText || "preview text"} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-widest text-[#0F172A] border-b border-[#E5E7EB] pb-3 mb-4">
                            Auction Item Description
                        </h2>
                        <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line font-medium">
                            {auction.description}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                            <FaTruck className="text-[#6B7280]" size={13} />
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">
                                Shipping Rules & Margins
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                            <div>
                                <span className="block text-[9px] uppercase tracking-wider text-[#6B7280]/50">Premium Surcharge</span>
                                <span className="text-[#0F172A]">{auction.buyerPremiumPercent}% Flat Rate</span>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase tracking-wider text-[#6B7280]/50">Dispatch Fee</span>
                                <span className="text-[#0F172A]">{auction.currency} {auction.shippingCost}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-lg text-[11px] font-medium text-[#6B7280] leading-normal">
                            <span className="font-black text-[#0F172A] block text-[9px] uppercase tracking-wider mb-0.5">Shipping Strategy:</span>
                            {auction.shippingTerms}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">

                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">

                        <div className="flex justify-between items-center">
                            <span className="inline-block px-2.5 py-0.5 bg-[#111827] text-[#D4AF37] font-black text-[9px] tracking-widest rounded uppercase">
                                {auction.type} Auction
                            </span>

                            <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded border ${auction.status === "PENDING_APPROVAL"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : auction.status === "DRAFT"
                                    ? "bg-slate-50 border-slate-200 text-slate-600"
                                    : auction.status == 'REJECTED' || auction.status.startsWith('CANCELLED')
                                        ? "bg-red-50 border-red-200 text-red-700"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                }`}>
                                {auction.status?.replace(/_/g, " ")}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
                                {auction.title}
                            </h1>
                        </div>


                        <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white shadow-sm space-y-4">
                            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[9px] uppercase font-black text-[#6B7280] tracking-widest flex items-center gap-1">
                                        <FaCoins className="text-[#D4AF37]" /> Starting Price
                                    </span>
                                    <p className="text-base font-black text-[#0F172A] mt-1">
                                        {auction.currency || "INR"} {auction.startingPrice?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-black text-[#6B7280] tracking-widest flex items-center gap-1">
                                        <FaCoins className="text-[#111827]" /> Reserve Price
                                    </span>
                                    <p className="text-base font-black text-[#0F172A] mt-1">
                                        {auction.currency || "INR"} {auction.reservePrice?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] uppercase font-black text-[#6B7280] tracking-widest flex items-center gap-1">
                                        <FaCoins className="text-[#111827]" /> Current Highest Bid
                                    </span>
                                    <span className="text-[10px] font-bold text-[#111827] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                                        {auction.bidCount || 0} {auction.bidCount === 1 ? 'Bid' : 'Bids'}
                                    </span>
                                </div>

                                <p className="text-2xl font-black text-[#0F172A]">
                                    {auction.currency || "INR"} {(auction.currentHighestBid || auction.startingPrice)?.toLocaleString()}
                                </p>

                                <div className="mt-2 pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                                    <span className="text-[#6B7280] text-[10px] uppercase font-semibold">Leading Bidder</span>
                                    {auction.highestBidder?.name ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-[#111827] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                                                {auction.highestBidder.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-[#0F172A] capitalize">
                                                {auction.highestBidder.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[#6B7280] italic text-[11px]">No bids placed yet</span>
                                    )}
                                </div>
                            </div>

                            {auction.bidCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/bid-history/${auction.auctionItemId}`)}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#0F172A] text-xs font-bold transition-colors shadow-sm"
                                >
                                    <FaHistory size={12} className="text-[#111827]" />
                                    View Bidding History
                                </button>
                            )}
                        </div>


                        <div className="space-y-3 text-xs font-semibold border-y border-[#E5E7EB] py-4">
                            <div className="flex justify-between">
                                <span className="text-[#6B7280] uppercase text-[10px] tracking-wider">Minimum Increment:</span>
                                <span className="text-[#0F172A] font-black">{auction.currency} {auction.minimumIncrement}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6B7280] uppercase text-[10px] tracking-wider">Sniping Protection Buffer:</span>
                                <span className="text-[#0F172A] font-black">{auction.snipingProtectionMinutes} Mins</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1 text-[#6B7280]">
                                <FaClock className="text-[#6B7280]" size={12} />
                                <span className="text-[11px] text-[#0F172A]">
                                    {new Date(auction.startTime).toLocaleString()} — {new Date(auction.endTime).toLocaleString()}
                                </span>
                            </div>
                        </div>


                        <div className="pt-2">
                            {isPendingReview ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => openStatusModal('REJECT')}
                                        className="w-full bg-white border border-[#DC2626] text-[#DC2626] hover:bg-red-50 text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FaTimesCircle /> Reject Request
                                    </button>
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => openStatusModal('APPROVE')}
                                        className="w-full bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FaCheckCircle /> Approve & Publish
                                    </button>
                                </div>
                            ) : (
                                auction.status == 'SCHEDULED' && <button
                                    onClick={handleCancelAuction}
                                    className="w-full bg-[#111827] hover:bg-black text-[#D4AF37] text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    <FaBan /> Terminate Auction
                                </button>
                            )}
                        </div>
                    </div>

                    {auction.auctionHouse && (
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2.5">
                                <FaBuilding className="text-[#6B7280]" size={13} />
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">
                                    Submitting Auction House
                                </h2>
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-black text-sm text-[#0F172A]">{auction.auctionHouse.name}</h3>
                                    {auction.auctionHouse.isVerified && (
                                        <span className="text-[#16A34A] text-xs font-bold" title="Verified Account Frame">✔</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-[#6B7280] font-bold block mt-0.5">
                                    Established {auction.auctionHouse.yearEstablished} • {auction.auctionHouse.fullAddress}, {auction.auctionHouse.country}
                                </span>
                            </div>

                            <div className="bg-[#F3F4F6] border border-[#E5E7EB] p-3 rounded-lg text-xs font-medium text-[#6B7280] leading-relaxed italic">
                                &quot;{auction.auctionHouse.briefDescription}&quot;
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-semibold text-[#6B7280]">
                                <div>
                                    <span className="block text-[9px] uppercase tracking-wider text-[#6B7280]/60">Agent Handle</span>
                                    <span className="text-[#0F172A]">{auction.auctionHouse.primaryContactName}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase tracking-wider text-[#6B7280]/60">Phone Line</span>
                                    <span className="text-[#0F172A]">{auction.auctionHouse.phone}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-[9px] uppercase tracking-wider text-[#6B7280]/60">Business Email</span>
                                    <span className="text-[#0F172A] select-all">{auction.auctionHouse.businessEmail}</span>
                                </div>
                            </div>
                        </div>
                    )}



                </div>
            </div>
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-2xl border border-[#E5E7EB] shadow-2xl p-6 relative overflow-hidden animate-scaleIn">

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-xl ${modalType === 'APPROVE' ? 'bg-emerald-50 text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'}`}>
                                {modalType === 'APPROVE' ? <FaCheckCircle size={20} /> : <FaExclamationTriangle size={20} />}
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">
                                    {modalType === 'APPROVE' ? "Approve Publication Request" : "Reject Asset Listing"}
                                </h3>
                                <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
                                    Item Ref: #{auction.auctionItemId?.toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {modalType === 'APPROVE' ? (
                                <p className="text-xs font-medium text-[#6B7280] leading-relaxed">
                                    Are you completely sure you want to verify and approve <span className="font-bold text-[#0F172A]"> &quot;{auction.title}&quot;</span>? This will schedule the asset for live public bidding matching its timeline parameters.
                                </p>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                                        Rejection Explanation Note <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={rejectionReason}
                                        onChange={(e) => {
                                            setRejectionReason(e.target.value);
                                            if (validationError) setValidationError("");
                                        }}
                                        placeholder="Type administrative rationale parameters here (minimum 5 characters)..."
                                        className={`w-full text-xs font-medium bg-[#F3F4F6] border rounded-xl p-3 text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 transition-all ${validationError ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#E5E7EB] focus:ring-[#111827]'
                                            }`}
                                    />
                                    {validationError && (
                                        <span className="text-[10px] font-bold tracking-wide text-[#DC2626] block mt-1 animate-slideDown">
                                            ⚠️ {validationError}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>


                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setModalOpen(false)}
                                className="w-1/2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#0F172A] text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleUpdateStatus}
                                className={`w-1/2 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${modalType === 'APPROVE' ? 'bg-[#16A34A] hover:bg-emerald-700' : 'bg-[#111827] hover:bg-black'
                                    }`}
                            >
                                {actionLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : modalType === 'APPROVE' ? (
                                    "Confirm & Publish"
                                ) : (
                                    "Submit Rejection"
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );

}
export default AdminAuctionDetailPage