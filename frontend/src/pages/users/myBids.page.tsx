import React, { useState, useEffect, useCallback } from "react";
import type { myBidListDTO } from "../../types/bid.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import bidService from "../../services/bid.service";
import Pagination from "../../components/user/pagination"; // Adjust path to your Pagination component
import {
    FaSearch,
    FaTrophy,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaStore,
    FaGavel
} from "react-icons/fa";

export enum BidStatus {
    ACTIVE = "active",
    OUTBID = "outbid",
    WINNING = "winning",
    WON = "won",
    CANCELLED = "cancelled"
}

const MyBidsPage: React.FC = () => {
    const [bids, setBids] = useState<myBidListDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchBids = useCallback(async () => {
        setLoading(true);
        try {
            const response = await bidService.getUserBids(page, 6, statusFilter, search);
            if (response.success && response.data) {
                setBids(response.data ?? []);
                setPagination(response.pagination ?? null);
            }
        } catch {
            toast.error("Failed to load your bids");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => {
        fetchBids();
    }, [fetchBids]);

    const renderStatusBadge = (status: string) => {
        const normalized = status?.toLowerCase();
        switch (normalized) {
            case BidStatus.WINNING:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> Winning
                    </span>
                );
            case BidStatus.OUTBID:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaExclamationTriangle size={10} /> Outbid
                    </span>
                );
            case BidStatus.WON:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F1F1F] text-white border border-[#1F1F1F] text-[10px] font-bold uppercase tracking-wider">
                        <FaTrophy size={10} className="text-amber-400" /> Lot Won
                    </span>
                );
            case BidStatus.CANCELLED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaTimesCircle size={10} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider">
                        Active
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="border-b border-[#E6E0DA] pb-5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
                        My Bids
                    </h1>
                    <p className="text-xs text-[#6B6B6B] font-medium mt-1">
                        Track your bid activity across all live and past auctions.
                    </p>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Status Tabs */}
                    <div className="bg-white border border-[#E6E0DA] p-1 rounded-xl flex flex-wrap gap-1 w-full sm:w-auto shadow-sm">
                        {[
                            { label: "All Bids", value: "" },
                            { label: "Winning", value: BidStatus.WINNING },
                            { label: "Outbid", value: BidStatus.OUTBID },
                            { label: "Won", value: BidStatus.WON },
                            { label: "Cancelled", value: BidStatus.CANCELLED }
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setStatusFilter(tab.value);
                                    setPage(1); // Reset to page 1 on filter switch
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                                    statusFilter === tab.value
                                        ? "bg-[#C9653B] text-white shadow-sm"
                                        : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <FaSearch size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                        <input
                            type="text"
                            placeholder="Search by lot title..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset page on query change
                            }}
                            className="w-full bg-white border border-[#E6E0DA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F1F1F] placeholder-[#6B6B6B] focus:outline-none focus:border-[#C9653B] shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Dynamic Content Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm space-y-2">
                        <FaGavel size={24} className="mx-auto text-[#6B6B6B]/40" />
                        <p className="text-[#1F1F1F] text-sm font-bold uppercase tracking-wide">No Bids Found</p>
                        <p className="text-[#6B6B6B] text-xs max-w-sm mx-auto">
                            You haven't placed any bids matching your current filter criteria.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bids.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm hover:border-[#C9653B]/50 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image Header */}
                                        <div className="relative h-44 bg-[#FFF9F4] border-b border-[#E6E0DA] overflow-hidden">
                                            <img
                                                src={item.auctionImage || "/placeholder.png"}
                                                alt={item.auctionTitle}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3">
                                                {renderStatusBadge(item.myBidStatus)}
                                            </div>
                                        </div>

                                        {/* Lot Details */}
                                        <div className="p-4 space-y-3">
                                            <div className="space-y-1">
                                                <h2 className="text-sm font-bold text-[#1F1F1F] line-clamp-1">
                                                    {item.auctionTitle}
                                                </h2>
                                                <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 font-medium">
                                                    <FaStore size={10} className="text-[#C9653B]" />
                                                    {item.auctionHouseName}
                                                </p>
                                            </div>

                                            {/* Bid Amount Metrics */}
                                            <div className="grid grid-cols-2 gap-2 bg-[#FFF9F4] p-3 rounded-lg border border-[#E6E0DA]">
                                                <div>
                                                    <span className="block text-[9px] uppercase tracking-wider font-bold text-[#6B6B6B]">
                                                        Your Last Bid
                                                    </span>
                                                    <span className="text-sm font-black text-[#1F1F1F] font-mono">
                                                        ₹{item.myLastBidAmount?.toLocaleString()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="block text-[9px] uppercase tracking-wider font-bold text-[#6B6B6B]">
                                                        Current Highest
                                                    </span>
                                                    <span className={`text-sm font-black font-mono ${
                                                        item.myBidStatus === BidStatus.OUTBID ? "text-amber-600" : "text-emerald-700"
                                                    }`}>
                                                        ₹{item.currentHighestBid?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer End Time info */}
                                    {item.endTime && (
                                        <div className="px-4 py-2.5 bg-[#FFF9F4] border-t border-[#E6E0DA] flex justify-between items-center text-[10px] text-[#6B6B6B] font-medium">
                                            <span>Ends:</span>
                                            <span className="font-bold text-[#1F1F1F]">
                                                {new Date(item.endTime).toLocaleDateString()} at {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination Component */}
                        <div className="mt-10">
                            <Pagination
                                pagination={pagination}
                                onPageChange={setPage}
                                loading={loading}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyBidsPage;