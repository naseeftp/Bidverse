import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuctionItemStatus, type AuctionItemDetailDTO } from "../types/auctionItem.dto";
import toast from "react-hot-toast";
import publicAuctionService from "../services/publicAuction.service";
import {
    FaChevronLeft,
    FaCoins,
    FaTruck,
    FaSearchPlus,
    FaHourglassHalf,
    FaStore,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaShieldAlt,
    FaRegBuilding,
    FaRegHeart,
    FaHeart,
    FaBan,
    FaExclamationTriangle
} from "react-icons/fa";
import watchListService from "../services/watchList.service";
import { useAppDispatch } from "../hooks/redux.hooks";
import { incrementWatchlistCount } from "../redux/user/auth.slice";
import chatService from "../services/chat.service";
import PlaceBidModal from "../components/user/placeBid.modal";
import bidService from "../services/bid.service";
import BookSlotModal from "../components/user/slotBook.modal";
import slotService from "../services/slot.service";
import { openRazorpayCheckout } from "../utils/razorpay";
import paymentService from "../services/payment.service";

const PublicAuctionDetailPage: React.FC = () => {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(false);
    const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null);
    const [activeImage, setActiveImage] = useState<string>("");
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [timerLabel, setTimerLabel] = useState<'STARTS IN' | 'ENDS IN' | 'CONCLUDED'>('STARTS IN');

    const [isWatched, setIsWathed] = useState<boolean>(false);
    const [isWatchlistLoading, setIsWatchlistLoading] = useState<boolean>(false);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

    const [isBidModalOpen, setBidModalOpen] = useState<boolean>(false);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState<boolean>(false);

    const fetchAuctionDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const response = await publicAuctionService.getAuctionDetails(itemId);
            if (response.success && response.data) {
                setAuction(response.data);
                const primaryImage =
                    response.data.images?.find(image => image.isPrimary)?.url ||
                    response.data.images[0]?.url;

                setActiveImage(primaryImage || "");
            } else {
                toast.error(response.message);
                navigate("/auctions");
            }
        } catch {
            toast.error("Error while fetching auction details");
            navigate("/auctions");
        } finally {
            setLoading(false);
        }
    }, [itemId, navigate]);

    const handleInitiateChat = async () => {
        setIsChatLoading(true);
        try {
            const payload = {
                receiverId: auction?.auctionHouse.ownerId ?? '',
                receiverRole: 'tenant'
            };
            const response = await chatService.getOrCreateConversation(payload);
            if (response.success && response.data) {
                navigate('/chat');
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('failed to start conversation');
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleBidSubmit = async (bidAmount: number) => {
        if (!auction?.auctionItemId || !auction.auctionHouse.id) {
            return;
        }
        try {
            const response = await bidService.placeBid({
                tenantId: auction?.auctionHouse.id,
                auctionId: auction?.auctionItemId,
                amount: bidAmount.toString()
            });
            if (response?.success && response.data) {
                toast.success(response.message);
                fetchAuctionDetail();
            } else {
                toast.error(response!.message);
            }
        } catch {
            toast.error('failed to place Bid');
        }
    };

    const handleBookSlotSubmit = async () => {
        if (!auction?.auctionItemId || !auction.auctionHouse.id) {
            toast.error("Auction details are missing.");
            return;
        }

        try {
            const payload = {
                auctionId: auction.auctionItemId,
                tenantId: auction.auctionHouse.id,
            };

            const response = await slotService.bookSlot(payload);
            if (response?.success) {
                openRazorpayCheckout(
                    {
                        orderId: response.data?.payment.orderId ?? '',
                        amount: response.data?.payment.amount ?? 0,
                        currency: response.data?.payment.currency ?? '',
                        keyId: response.data?.payment.keyId ?? ''
                    },
                    async (paymentResponse) => {
                        try {
                            await paymentService.verifyPayment({
                                razorpayOrderId: paymentResponse.razorpay_order_id,
                                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                                razorpaySignature: paymentResponse.razorpay_signature,
                            });
                            toast.success("Payment successful! Slot confirmed.");
                            fetchAuctionDetail();
                        } catch {
                            toast.error("Payment verification failed.");
                        }
                    },
                );
                fetchAuctionDetail();
            } else {
                toast.error(response?.message || "Failed to book slot");
            }
        } catch {
            toast.error("An error occurred while booking slot");
        }
    };

    const handleWatchlistAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (isWatchlistLoading) return;
        try {
            setIsWatchlistLoading(true);
            const response = await watchListService.addToWatchList(auction?.auctionItemId as string);
            if (response.success) {
                toast.success(response.message);
                setIsWathed(true);
                dispatch(incrementWatchlistCount());
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('failed to add Watchlist');
        } finally {
            setIsWatchlistLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctionDetail();
    }, [fetchAuctionDetail]);

    useEffect(() => {
        if (!auction || !auction.startTime || !auction.endTime) return;

        const cancelled =
            auction.status === AuctionItemStatus.CANCELLED_BY_ADMIN ||
            auction.status === AuctionItemStatus.CANCELLED_BY_HOUSE ;

        if (cancelled) {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F4] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs uppercase tracking-widest font-bold text-[#6B6B6B]">Loading Asset Portfolio...</p>
            </div>
        );
    }

    if (!auction) return null;

    const isCancelled = auction.status === 'CANCELLED_BY_ADMIN' || auction.status === 'CANCELLED_BY_HOUSE' 
    const cancellationReason =auction.cancellationReason
    const canPlaceBid = !isCancelled && timerLabel === 'ENDS IN';
    const canBookSlot = !isCancelled && timerLabel === 'STARTS IN';
    const canAddToWatchlist = !isCancelled && !isWatched;

    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">

            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => navigate("/auctions")}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6B6B] hover:text-[#C9653B] transition-colors focus:outline-none"
                >
                    <FaChevronLeft size={10} /> Back to Auctions
                </button>
                <span className="text-xs font-mono tracking-wider text-[#6B6B6B] bg-white border border-[#E6E0DA] px-3 py-1 rounded-md shadow-sm">
                    LOT REFERENCE ID: #{auction.auctionItemId?.toUpperCase()}
                </span>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-xl border border-[#E6E0DA] shadow-sm p-4">
                        <div
                            className="h-[450px] w-full rounded-lg overflow-hidden bg-[#FFF9F4] relative cursor-zoom-in border border-[#E6E0DA]/60"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                        >
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={auction.title}
                                    className={`w-full h-full object-cover transition-transform duration-75 origin-center ${isZoomed ? "scale-[2.2]" : "scale-100"}`}
                                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B6B]/50 uppercase tracking-widest font-bold">
                                    No Image Media Documented
                                </div>
                            )}

                            {isZoomed === false && activeImage && (
                                <div className="absolute bottom-4 right-4 bg-[#1F1F1F]/90 backdrop-blur-sm text-white p-2 rounded-md pointer-events-none flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider shadow-sm">
                                    <FaSearchPlus size={11} className="text-[#C9653B]" /> Hover to Inspect
                                </div>
                            )}
                        </div>

                        {auction.images && auction.images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-thin">
                                {auction.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-20 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all focus:outline-none ${activeImage === img.url
                                            ? "border-[#C9653B] scale-95 shadow-sm"
                                            : "border-[#E6E0DA] opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img.url} alt={img.altText || "Asset View"} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-[#E6E0DA] p-6 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1F1F1F] border-b border-[#E6E0DA] pb-3 mb-4">
                            Auction Item Description
                        </h2>
                        <p className="text-sm text-[#6B6B6B] leading-relaxed whitespace-pre-line font-medium">
                            {auction.description || "No customized descriptive logs written by the auction house for this lot asset position."}
                        </p>
                    </div>

                    {auction.auctionHouse && (
                        <div className="bg-white rounded-xl border border-[#E6E0DA] p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E6E0DA] pb-3">
                                <div className="flex items-center gap-2">
                                    <FaStore className="text-[#C9653B]" size={14} />
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#1F1F1F]">
                                        Broker House Profile
                                    </h2>
                                </div>
                                {auction.auctionHouse.isVerified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded border border-emerald-200">
                                        <FaShieldAlt size={8} /> Verified Entity
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-sm font-black text-[#1F1F1F]">
                                    {auction.auctionHouse.name}
                                </h3>
                                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                                    {auction.auctionHouse.briefDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] border-t border-[#FFF9F4]">
                                <div>
                                    <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Established</span>
                                    <span className="font-bold text-[#1F1F1F] inline-flex items-center gap-1 mt-0.5">
                                        <FaRegBuilding size={10} className="text-[#6B6B6B]/60" /> Class of {auction.auctionHouse.yearEstablished || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Origin Jurisdiction</span>
                                    <span className="font-bold text-[#1F1F1F] inline-flex items-center gap-1 mt-0.5 truncate max-w-full">
                                        <FaMapMarkerAlt size={10} className="text-[#C9653B]" /> {auction.auctionHouse.country || "India"}
                                    </span>
                                </div>
                            </div>

                            {auction.auctionHouse.fullAddress && (
                                <div className="p-2.5 bg-[#FFF9F4] rounded-lg border border-[#E6E0DA]/50 text-[11px] font-medium text-[#6B6B6B]">
                                    <span className="font-bold text-[#1F1F1F] uppercase text-[8px] tracking-wider block mb-0.5">Corporate Headquarters Address:</span>
                                    {auction.auctionHouse.fullAddress}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 space-y-6">

                    <div className="bg-white rounded-xl border border-[#E6E0DA] p-6 shadow-sm space-y-5">

                        <div className="flex justify-between items-center">
                            <span className="inline-block px-2.5 py-1 bg-[#C9653B]/10 text-[#C9653B] font-bold text-[10px] tracking-wider rounded uppercase border border-[#C9653B]/20">
                                {auction.type} Format
                            </span>

                            <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded border ${
                                auction.status === "PENDING_APPROVAL" || auction.status === "SCHEDULED"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : auction.status === "DRAFT"
                                        ? "bg-stone-100 border-stone-200 text-stone-600"
                                        : isCancelled || auction.status === "REJECTED"
                                            ? "bg-red-50 border-red-200 text-red-600"
                                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}>
                                {auction.status?.replace(/_/g, " ")}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-[#1F1F1F]">
                                {auction.title}
                            </h1>
                        </div>

                        {isCancelled ? (
                            <div className="border border-red-200 bg-red-50 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaBan className="text-red-600" size={14} />
                                    <span className="text-[10px] uppercase font-bold text-red-700 tracking-widest">
                                        Auction Cancelled
                                    </span>
                                </div>
                                <div className="bg-white border border-red-100 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" size={12} />
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1">
                                                Cancellation Reason
                                            </p>
                                            <p className="text-sm font-medium text-[#1F1F1F] leading-relaxed">
                                                {cancellationReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-[10px] text-red-600/80 font-medium text-center uppercase tracking-wide">
                                    This lot is no longer available for bidding
                                </p>
                            </div>
                        ) : (
                            <div className="border border-[#E6E0DA]/80 bg-[#FFF9F4] rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaHourglassHalf className={`text-xs ${timerLabel === 'ENDS IN' ? 'text-[#C9653B] animate-spin' : 'text-[#6B6B6B]'}`} />
                                    <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-widest">
                                        {timerLabel}
                                    </span>
                                </div>

                                {timerLabel !== "CONCLUDED" ? (
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-white border border-[#E6E0DA] p-2 rounded-lg">
                                            <p className="text-lg font-black text-[#1F1F1F] font-mono">{String(timeLeft.days).padStart(2, '0')}</p>
                                            <p className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-tight">Days</p>
                                        </div>
                                        <div className="bg-white border border-[#E6E0DA] p-2 rounded-lg">
                                            <p className="text-lg font-black text-[#1F1F1F] font-mono">{String(timeLeft.hours).padStart(2, '0')}</p>
                                            <p className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-tight">Hours</p>
                                        </div>
                                        <div className="bg-white border border-[#E6E0DA] p-2 rounded-lg">
                                            <p className="text-lg font-black text-[#1F1F1F] font-mono">{String(timeLeft.minutes).padStart(2, '0')}</p>
                                            <p className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-tight">Mins</p>
                                        </div>
                                        <div className="bg-white border border-[#E6E0DA] p-2 rounded-lg">
                                            <p className="text-lg font-black text-[#C9653B] font-mono">{String(timeLeft.seconds).padStart(2, '0')}</p>
                                            <p className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-tight">Secs</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-red-100 p-2.5 rounded-lg text-center text-xs font-bold text-red-600 uppercase tracking-widest shadow-sm">
                                        Bidding Window Has Closed
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border border-[#E6E0DA] rounded-xl p-4 bg-white shadow-sm space-y-4">
                            <div className="p-3 bg-[#FFF9F4] rounded-lg border border-[#E6E0DA]">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-widest flex items-center gap-1">
                                        <FaCoins className="text-[#C9653B]" /> Current Highest Bid
                                    </span>
                                    <span className="text-[10px] font-bold text-[#6B6B6B] bg-white px-2 py-0.5 rounded border border-[#E6E0DA]">
                                        {auction.bidCount || 0} {auction.bidCount === 1 ? 'Bid' : 'Bids'}
                                    </span>
                                </div>

                                <p className="text-2xl font-black text-[#1F1F1F]">
                                    {auction.currency || "INR"} {(auction.currentHighestBid || auction.startingPrice)?.toLocaleString()}
                                </p>

                                <div className="mt-2 pt-2 border-t border-[#E6E0DA]/60 flex items-center justify-between text-xs">
                                    <span className="text-[#6B6B6B] text-[10px] uppercase font-semibold">Leading Bidder</span>
                                    {auction.highestBidder?.name ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                                                {auction.highestBidder.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-[#1F1F1F] capitalize">
                                                {auction.highestBidder.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[#6B6B6B] italic text-[11px]">No bids placed yet</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-1 text-xs">
                                <span className="text-[#6B6B6B] uppercase text-[10px] font-bold tracking-wider">Starting Price:</span>
                                <span className="text-[#1F1F1F] font-bold">
                                    {auction.currency || "INR"} {auction.startingPrice?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-1">
                            {auction.type === 'TIMED' ? (
                                <button
                                    disabled={!canPlaceBid}
                                    onClick={() => setBidModalOpen(true)}
                                    className="w-full bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-all shadow-sm focus:outline-none disabled:bg-[#E6E0DA] disabled:text-[#6B6B6B] disabled:cursor-not-allowed transform active:scale-[0.99]"
                                >
                                    {isCancelled
                                        ? 'Auction Cancelled'
                                        : timerLabel === 'ENDS IN'
                                            ? 'Place Bid'
                                            : timerLabel === 'CONCLUDED'
                                                ? 'Bidding Window Closed'
                                                : 'Awaiting Bidding Window'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsSlotModalOpen(true)}
                                    disabled={!canBookSlot}
                                    className="w-full bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-all shadow-sm focus:outline-none disabled:bg-[#E6E0DA] disabled:text-[#6B6B6B] disabled:cursor-not-allowed transform active:scale-[0.99]"
                                >
                                    {isCancelled
                                        ? 'Auction Cancelled'
                                        : timerLabel === 'STARTS IN'
                                            ? 'Register & Reserve Live Bidding Slot'
                                            : 'Live Show Concluded'}
                                </button>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleWatchlistAction}
                                    disabled={isWatchlistLoading || !canAddToWatchlist}
                                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all focus:outline-none flex items-center justify-center gap-1.5 border border-[#E6E0DA] disabled:cursor-not-allowed disabled:opacity-60 ${
                                        isWatched
                                            ? "bg-[#1F1F1F] text-white border-[#1F1F1F]"
                                            : "bg-white text-[#1F1F1F] hover:bg-[#FFF9F4]"
                                    }`}
                                >
                                    {isWatched ? (
                                        <>
                                            <FaHeart size={11} className="text-[#C9653B]" /> Saved
                                        </>
                                    ) : (
                                        <>
                                            <FaRegHeart size={11} className="text-[#6B6B6B]" /> Watchlist
                                        </>
                                    )}
                                </button>

                                <button
                                    disabled={isChatLoading}
                                    onClick={handleInitiateChat}
                                    className="w-full py-2.5 bg-[#1F1F1F] hover:bg-[#C9653B] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    <FaCoins className="text-amber-400 text-xs" /> Enquire
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs font-medium border-t border-[#E6E0DA] pt-4">
                            <div className="flex justify-between">
                                <span className="text-[#6B6B6B] uppercase text-[10px] tracking-wider">Minimum Bid Increment Step:</span>
                                <span className="text-[#1F1F1F] font-bold">{auction.currency || "INR"} {auction.minimumIncrement}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6B6B6B] uppercase text-[10px] tracking-wider">Anti-Sniping Extension Buffer:</span>
                                <span className="text-[#1F1F1F] font-bold">{auction.snipingProtectionMinutes} Minutes</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-[#FFF9F4] text-[#6B6B6B]">
                                <FaCalendarAlt size={12} className="text-[#C9653B]" />
                                <span className="text-[11px] text-[#1F1F1F] font-bold">
                                    {auction.startTime ? new Date(auction.startTime).toLocaleString() : ""} — {auction.endTime ? new Date(auction.endTime).toLocaleString() : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E6E0DA] p-6 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 border-b border-[#E6E0DA] pb-2">
                            <FaTruck className="text-[#6B6B6B]" size={13} />
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#1F1F1F]">
                                Dispatch & Premium Policies
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                            <div>
                                <span className="block text-[9px] uppercase tracking-wider text-[#6B6B6B]">Buyer&apos;s Premium</span>
                                <span className="text-[#1F1F1F] font-black">{auction.buyerPremiumPercent || 0}% Flat Rate Invoice Addendum</span>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase tracking-wider text-[#6B6B6B]">Estimated Freight Cost</span>
                                <span className="text-[#C9653B] font-black">{auction.currency || "INR"} {auction.shippingCost || 0}</span>
                            </div>
                        </div>
                        {auction.shippingTerms && (
                            <div className="p-3 bg-[#FFF9F4] border border-[#E6E0DA]/60 rounded-lg text-[11px] font-medium text-[#6B6B6B] leading-relaxed">
                                <span className="font-bold text-[#1F1F1F] block text-[9px] uppercase tracking-wider mb-0.5">Shipping Strategy Framework:</span>
                                {auction.shippingTerms}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PlaceBidModal
                isOpen={isBidModalOpen}
                onClose={() => setBidModalOpen(false)}
                auctionName={auction.title}
                currentHighestBid={auction.currentHighestBid}
                minimumBidIncrement={auction.minimumIncrement}
                startingPrice={auction.startingPrice}
                onSubmitBid={handleBidSubmit}
            />
            <BookSlotModal
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                auctionName={auction.title}
                slotAmount={auction.slotFee || 0}
                currency={auction.currency}
                onConfirm={handleBookSlotSubmit}
            />
        </div>
    );
};

export default PublicAuctionDetailPage;