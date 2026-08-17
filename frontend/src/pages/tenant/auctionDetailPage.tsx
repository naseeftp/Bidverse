import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuctionItemStatus, type AuctionItemDetailDTO } from "../../types/auctionItem.dto";
import toast from "react-hot-toast";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import {
    FaChevronLeft,
    FaCoins,
    FaTruck,
    FaSearchPlus,
    FaHourglassHalf,
    FaCalendarAlt,
    FaEdit,
    FaRedo,
    FaExclamationTriangle,
    FaHistory,
    FaBan
} from "react-icons/fa";

const TenantAuctionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null);
    const [activeImage, setActiveImage] = useState<string>('');
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [timerLabel, setTimerLabel] = useState<'STARTS IN' | 'ENDS IN' | 'CONCLUDED'>('STARTS IN');
    const navigate = useNavigate();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelValidationError, setCancelValidationError] = useState("");
    const [cancelLoading, setCancelLoading] = useState(false);

    const fetchAuctionDetail = useCallback(async () => {
        if (!id) return;

        setLoading(true);

        try {
            const response = await auctionItemMangementService.getAuction(id);

            if (response.success && response.data) {
                setAuction(response.data);

                const primaryImage =
                    response.data.images.find(image => image.isPrimary)?.url ||
                    response.data.images[0]?.url;

                setActiveImage(primaryImage);
            } else {
                toast.error(response.message);
                navigate("/tenant/auctions");
            }
        } catch {
            toast.error("Error while fetching auction details");
            navigate("/tenant/auctions");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchAuctionDetail();
    }, [fetchAuctionDetail]);

    useEffect(() => {
        if (!auction) return;

        // Skip timer for rejected or cancelled auctions
        const isCancelled =
            auction.status === 'CANCELLED_BY_ADMIN' ||
            auction.status === 'CANCELLED_BY_HOUSE' ||
            (auction.status?.startsWith('CANCELLED') ?? false);

        if (auction.status === "REJECTED" || isCancelled) {
            setTimerLabel('CONCLUDED');
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(auction.startTime).getTime();
            const end = new Date(auction.endTime).getTime();
            let targetTime = start;

            if (now < start) {
                setTimerLabel('STARTS IN');
                targetTime = start;
            } else if (now >= start && now < end) {
                setTimerLabel('ENDS IN');
                targetTime = end;
            } else {
                setTimerLabel('CONCLUDED');
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const difference = targetTime - now;
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [auction]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y });
    };

    const openCancelModal = () => {
        setCancelReason('');
        setCancelValidationError('');
        setCancelModalOpen(true);
    };

    const handleCancelAuction = async () => {
        if (!auction) return;

        const trimmed = cancelReason.trim();
        if (!trimmed) {
            setCancelValidationError("Cancellation reason is required");
            return;
        }
        if (trimmed.length < 5) {
            setCancelValidationError("Cancellation reason must be at least 5 characters");
            return;
        }
        setCancelValidationError("");

        setCancelLoading(true);
        try {
            const response = await auctionItemMangementService.cancellAuction({
                auctionId: auction.auctionItemId ?? '',
                cancelledRole: 'tenant', 
                cencelingReason: trimmed
            });
            if (response.success) {
                toast.success(response.message || "Auction terminated successfully");
                setCancelModalOpen(false);
                setCancelReason('');
                fetchAuctionDetail();
            } else {
                toast.error(response.message || "Failed to terminate auction");
            }
        } catch {
            toast.error("Failed to terminate auction");
        } finally {
            setCancelLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#2F6FED] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs uppercase tracking-widest font-semibold text-[#475569]">Loading Consignment Files...</p>
            </div>
        );
    }

    if (!auction) return null;

    const isCancelled =
        auction.status === AuctionItemStatus.CANCELLED_BY_ADMIN||
        auction.status === AuctionItemStatus.CANCELLED_BY_HOUSE 
    

    const isRejected = auction.status === "REJECTED";
    const isScheduled = auction.status === "SCHEDULED";

    const cancellationReason =auction.cancellationReason

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-4 py-8 md:px-8 text-[#0F172A] font-sans antialiased">

            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => navigate("/tenant/auctions")}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475569] hover:text-[#2F6FED] transition-colors"
                >
                    <FaChevronLeft size={10} /> Back to Auctions
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {auction.status === "PENDING_APPROVAL" && (
                        <button
                            onClick={() => navigate(`/tenant/update-auctions/${auction.auctionItemId}`)}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white border border-[#E2E8F0] hover:border-[#2F6FED] text-[#475569] hover:text-[#2F6FED] px-4 py-2 rounded-lg shadow-sm transition-all"
                        >
                            <FaEdit size={12} /> Edit Auction
                        </button>
                    )}
                    <span className="text-xs font-mono tracking-wider text-[#475569] bg-[#E2E8F0] px-3 py-1 rounded-md">
                        REF ID: #{auction.auctionItemId?.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {isRejected && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-enter">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                            <FaExclamationTriangle size={16} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">Consignment Submission Rejected</h3>
                            <p className="text-xs font-medium text-red-600 mt-1 leading-relaxed">
                                {auction.rejectionReason || "No specific reason was provided by the management reviewers. Please verify the consignment data requirements and resubmit."}
                            </p>
                        </div>
                    </div>
                )}

                {isCancelled && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                            <FaBan size={16} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">
                                Auction {auction.status?.replace(/_/g, " ")}
                            </h3>
                            <p className="text-xs font-medium text-red-600 mt-1 leading-relaxed">
                                {cancellationReason}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-7 space-y-6">

                        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                            <div
                                className="h-[450px] w-full rounded-lg overflow-hidden bg-[#F5F7FB] relative cursor-zoom-in border border-[#E2E8F0]"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={() => setIsZoomed(true)}
                                onMouseLeave={() => setIsZoomed(false)}
                            >
                                <img
                                    src={activeImage}
                                    alt={auction.title}
                                    className={`w-full h-full object-cover transition-transform duration-75 origin-center ${isZoomed ? "scale-[2.2]" : "scale-100"}`}
                                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                                />

                                {!isZoomed && (
                                    <div className="absolute bottom-4 right-4 bg-[#0F172A]/80 text-white p-2 rounded-md pointer-events-none flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                                        <FaSearchPlus size={12} /> Hover to Inspect
                                    </div>
                                )}
                            </div>

                            {auction.images && auction.images.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-thin">
                                    {auction.images.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img.url)}
                                            className={`w-20 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img.url
                                                ? "border-[#2F6FED] scale-95 shadow-sm"
                                                : "border-[#E2E8F0] opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img src={img.url} alt={img.altText || "Item detail"} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0F172A] border-b border-[#E2E8F0] pb-3 mb-4">
                                Auction Item Description
                            </h2>
                            <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line font-medium">
                                {auction.description}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">

                        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">

                            <div className="flex justify-between items-center">
                                <span className="inline-block px-2.5 py-1 bg-[#2F6FED]/10 text-[#2F6FED] font-bold text-[10px] tracking-wider rounded uppercase">
                                    {auction.type} Format
                                </span>

                                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded border ${
                                    auction.status === "PENDING_APPROVAL"
                                        ? "bg-amber-50 border-amber-200 text-amber-700"
                                        : auction.status === "DRAFT"
                                            ? "bg-slate-100 border-slate-200 text-slate-600"
                                            : isRejected || isCancelled
                                                ? "bg-red-50 border-red-200 text-red-600"
                                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                }`}>
                                    {auction.status?.replace(/_/g, " ")}
                                </span>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                                    {auction.title}
                                </h1>
                            </div>

                            <div className="border border-[#E2E8F0] bg-[#F5F7FB] rounded-xl p-4 shadow-sm">
                                {isRejected ? (
                                    <div className="space-y-3">
                                        <div className="text-center py-1">
                                            <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-widest">Action Required</p>
                                            <p className="text-xs font-medium text-[#475569] mt-1">Review validation parameters before resubmitting.</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/tenant/update-auctions/${auction.auctionItemId}?resubmit=true`)}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-[#2F6FED] hover:bg-[#1E52C1] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            <FaRedo size={11} /> Re-Submit Consignment
                                        </button>
                                    </div>
                                ) : isCancelled ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaBan className="text-red-600" size={13} />
                                            <span className="text-[10px] uppercase font-bold text-red-700 tracking-widest">
                                                Auction Cancelled
                                            </span>
                                        </div>
                                        <div className="bg-white border border-red-100 rounded-lg p-3">
                                            <p className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider mb-1">
                                                Cancellation Reason
                                            </p>
                                            <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
                                                {cancellationReason}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-red-600/80 font-medium text-center uppercase tracking-wide">
                                            This auction is no longer active
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FaHourglassHalf className={`text-xs ${timerLabel === 'ENDS IN' ? 'text-[#2F6FED] animate-spin' : 'text-[#475569]'}`} />
                                            <span className="text-[10px] uppercase font-bold text-[#475569] tracking-widest">
                                                {timerLabel}
                                            </span>
                                        </div>

                                        {timerLabel !== "CONCLUDED" ? (
                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                <div className="bg-white border border-[#E2E8F0] p-2 rounded-lg">
                                                    <p className="text-lg font-bold text-[#0F172A]">{String(timeLeft.days).padStart(2, '0')}</p>
                                                    <p className="text-[9px] uppercase font-bold text-[#475569]/70 tracking-tight">Days</p>
                                                </div>
                                                <div className="bg-white border border-[#E2E8F0] p-2 rounded-lg">
                                                    <p className="text-lg font-bold text-[#0F172A]">{String(timeLeft.hours).padStart(2, '0')}</p>
                                                    <p className="text-[9px] uppercase font-bold text-[#475569]/70 tracking-tight">Hours</p>
                                                </div>
                                                <div className="bg-white border border-[#E2E8F0] p-2 rounded-lg">
                                                    <p className="text-lg font-bold text-[#0F172A]">{String(timeLeft.minutes).padStart(2, '0')}</p>
                                                    <p className="text-[9px] uppercase font-bold text-[#475569]/70 tracking-tight">Mins</p>
                                                </div>
                                                <div className="bg-white border border-[#E2E8F0] p-2 rounded-lg">
                                                    <p className="text-lg font-bold text-[#0F172A]">{String(timeLeft.seconds).padStart(2, '0')}</p>
                                                    <p className="text-[9px] uppercase font-bold text-[#475569]/70 tracking-tight">Secs</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-red-200 p-2.5 rounded-lg text-center text-xs font-bold text-red-600 uppercase tracking-widest">
                                                Bidding Window Has Closed
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-white shadow-sm space-y-4">
                                <div className="p-3 bg-[#F5F7FB] rounded-lg border border-[#E2E8F0]">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] uppercase font-bold text-[#475569] tracking-widest flex items-center gap-1">
                                            <FaCoins className="text-[#2F6FED]" /> Current Highest Bid
                                        </span>
                                        <span className="text-[10px] font-bold text-[#2F6FED] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                                            {auction.bidCount || 0} {auction.bidCount === 1 ? 'Bid' : 'Bids'}
                                        </span>
                                    </div>

                                    <p className="text-2xl font-black text-[#0F172A]">
                                        {auction.currency || "INR"} {(auction.currentHighestBid || auction.startingPrice)?.toLocaleString()}
                                    </p>

                                    <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                                        <span className="text-[#475569] text-[10px] uppercase font-semibold">Leading Bidder</span>
                                        {auction.highestBidder?.name ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-[#2F6FED] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {auction.highestBidder.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-[#0F172A] capitalize">
                                                    {auction.highestBidder.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[#475569] italic text-[11px]">No bids placed yet</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-1 text-xs">
                                    <span className="text-[#475569] uppercase text-[10px] font-bold tracking-wider">Reserve Price:</span>
                                    <span className="text-[#0F172A] font-bold">
                                        {auction.currency || "INR"} {auction.reservePrice?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center px-1 text-xs">
                                    <span className="text-[#475569] uppercase text-[10px] font-bold tracking-wider">Starting Price:</span>
                                    <span className="text-[#0F172A] font-bold">
                                        {auction.currency || "INR"} {auction.startingPrice?.toLocaleString()}
                                    </span>
                                </div>

                                {auction.bidCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/tenant/bid-history/${auction.auctionItemId}`)}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F5F7FB] text-[#0F172A] text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <FaHistory size={12} className="text-[#2F6FED]" />
                                        View Bidding History
                                    </button>
                                )}
                            </div>

                            {isScheduled && (
                                <button
                                    onClick={openCancelModal}
                                    className="w-full bg-[#0F172A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    <FaBan size={12} /> Terminate Auction
                                </button>
                            )}

                            <div className="space-y-3 text-xs font-medium border-t border-[#E2E8F0] pt-4">
                                <div className="flex justify-between">
                                    <span className="text-[#475569] uppercase text-[10px] tracking-wider">Minimum Bid Step:</span>
                                    <span className="text-[#0F172A] font-bold">{auction.currency} {auction.minimumIncrement}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#475569] uppercase text-[10px] tracking-wider">Sniping Buffer Window:</span>
                                    <span className="text-[#0F172A] font-bold">{auction.snipingProtectionMinutes} Minutes</span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-[#F5F7FB] text-[#475569]">
                                    <FaCalendarAlt size={12} className="text-[#2F6FED]" />
                                    <span className="text-[11px] text-[#0F172A] font-semibold">
                                        {new Date(auction.startTime).toLocaleString()} — {new Date(auction.endTime).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                                <FaTruck className="text-[#475569]" size={13} />
                                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                                    Dispatch & Premium Policies
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                <div>
                                    <span className="block text-[9px] uppercase tracking-wider text-[#475569]/60">Buyer&apos;s Premium</span>
                                    <span className="text-[#0F172A]">{auction.buyerPremiumPercent}% Flat Rate</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase tracking-wider text-[#475569]/60">Estimated Freight Cost</span>
                                    <span className="text-[#0F172A]">{auction.currency} {auction.shippingCost}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg text-[11px] font-medium text-[#475569] leading-relaxed">
                                <span className="font-bold text-[#0F172A] block text-[9px] uppercase tracking-wider mb-0.5">Shipping Strategy Framework:</span>
                                {auction.shippingTerms}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                                <FaBan size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0F172A]">
                                    Terminate Auction
                                </h3>
                                <p className="text-[11px] font-medium text-[#475569] mt-0.5">
                                    Ref: #{auction.auctionItemId?.toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-medium text-[#475569] leading-relaxed">
                                You are about to permanently terminate{" "}
                                <span className="font-bold text-[#0F172A]">&quot;{auction.title}&quot;</span>.
                                Please provide a clear reason for this action.
                            </p>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                                    Cancellation Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={cancelReason}
                                    onChange={(e) => {
                                        setCancelReason(e.target.value);
                                        if (cancelValidationError) setCancelValidationError("");
                                    }}
                                    placeholder="Enter the reason for terminating this auction (minimum 5 characters)..."
                                    className={`w-full text-xs font-medium bg-[#F5F7FB] border rounded-xl p-3 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 transition-all ${
                                        cancelValidationError
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-[#E2E8F0] focus:ring-[#2F6FED]'
                                    }`}
                                />
                                {cancelValidationError && (
                                    <span className="text-[10px] font-bold tracking-wide text-red-600 block mt-1">
                                        ⚠️ {cancelValidationError}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                            <button
                                type="button"
                                disabled={cancelLoading}
                                onClick={() => {
                                    setCancelModalOpen(false);
                                    setCancelReason('');
                                    setCancelValidationError('');
                                }}
                                className="w-1/2 bg-[#F5F7FB] hover:bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={cancelLoading}
                                onClick={handleCancelAuction}
                                className="w-1/2 bg-[#0F172A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {cancelLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FaBan size={12} /> Confirm Termination
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantAuctionDetailPage;