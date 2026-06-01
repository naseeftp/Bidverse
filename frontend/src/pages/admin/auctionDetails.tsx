import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AuctionItemDetailDTO } from "../../types/auctionItem.dto";
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
    FaSearchPlus
} from "react-icons/fa";
const AdminAuctionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null)
    const [activeImage, setActiveImage] = useState<string>('');
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    const fetchAuction = async () => {
        setLoading(true);
        try {
            const result = await auctionItemMangementService.getAuction(id!)
            if (result.success && result.data) {
                setAuction(result.data)
                const primaryImage = result.data.images.find((img) => img.isPrimary)?.url || result.data.images?.[0]?.url
                setActiveImage(primaryImage)
            }
            else {
                toast.error(result.message)
                navigate('/admin/auctions')
            }

        } catch {
            toast.error('failed to fetch auction details')
            navigate("/admin/auctions");
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if (id) {
            fetchAuction()
        }

    }, [id])
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { // creating an arrow fn that accept react mouse event bound to  specifally bound to html div element
                                                                       // its allow us to access active mouse co ordinates (e.pagex e.pagey)
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect(); // identifying where the image located in the screen and how big it is
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y });
    };
    const handleApprove = async () => {

    }
    const handleReject = () => {

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
    return (
        <div className="min-h-screen bg-[#F3F4F6] px-4 py-8 md:px-8 text-[#0F172A] font-sans">
            
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
                                className={`w-full h-full object-cover transition-transform duration-75 origin-center ${
                                    isZoomed ? "scale-[2.2]" : "scale-100"
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
                                        className={`w-20 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                                            activeImage === img.url ? "border-[#D4AF37] scale-95" : "border-[#E5E7EB] opacity-60 hover:opacity-100"
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
                </div>

                <div className="lg:col-span-5 space-y-6">
                    
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">
                        
                        <div className="flex justify-between items-center">
                            <span className="inline-block px-2.5 py-0.5 bg-[#111827] text-[#D4AF37] font-black text-[9px] tracking-widest rounded uppercase">
                                {auction.type} Auction
                            </span>
                            
                            <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded border ${
                                auction.status === "PENDING_APPROVAL"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : auction.status === "DRAFT"
                                        ? "bg-slate-50 border-slate-200 text-slate-600"
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

                   
                        <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-4 grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[9px] uppercase font-black text-[#6B7280] tracking-widest flex items-center gap-1">
                                    <FaCoins className="text-[#D4AF37]" /> Starting Price
                                </span>
                                <p className="text-base font-black text-[#0F172A] mt-1">
                                    {auction.currency} {auction.startingPrice?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-[9px] uppercase font-black text-[#6B7280] tracking-widest flex items-center gap-1">
                                    <FaCoins className="text-[#111827]" /> Reserve Price
                                </span>
                                <p className="text-base font-black text-[#0F172A] mt-1">
                                    {auction.currency} {auction.reservePrice?.toLocaleString()}
                                </p>
                            </div>
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
                                        onClick={handleReject}
                                        className="w-full bg-white border border-[#DC2626] text-[#DC2626] hover:bg-red-50 text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FaTimesCircle /> Reject Request
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="w-full bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FaCheckCircle /> Approve & Publish
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleCancelAuction}
                                    className="w-full bg-[#111827] hover:bg-black text-[#D4AF37] text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    <FaBan /> Terminate Live Auction
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
                                "{auction.auctionHouse.briefDescription}"
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
            </div>
        </div>
    );

}
export default AdminAuctionDetailPage