import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { myBidListDTO } from "../../types/bid.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import bidService from "../../services/bid.service";
import Pagination from "../../components/user/pagination";
import {
    FaSearch,
    FaTrophy,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaStore,
    FaGavel,
    FaExternalLinkAlt,
    FaFilter
} from "react-icons/fa";
import { BidStatus } from "../../types/bid.dto";
import CountdownTimer from "../../components/user/countDownTimer";

const MyBidsPage: React.FC = () => {
    const navigate = useNavigate();
    const [bids, setBids] = useState<myBidListDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [page, setPage] = useState<number>(1);

    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    const [statusFilter, setStatusFilter] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);

        return () => clearTimeout(handler);
    }, [search]);

    const fetchBids = useCallback(async () => {
        setLoading(true);
        try {
            const response = await bidService.getUserBids(page, 6, statusFilter, debouncedSearch);
            if (response.success && response.data) {
                setBids(response.data ?? []);
                setPagination(response.pagination ?? null);
            }
        } catch {
            toast.error("Failed to load your bids");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, debouncedSearch]);

    useEffect(() => {
        fetchBids();
    }, [fetchBids]);

    const renderStatusBadge = (status: string) => {
        const normalized = status?.toLowerCase();
        switch (normalized) {
            case BidStatus.ACTIVE:
            case "active":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Active
                    </span>
                );
            case BidStatus.WINNING:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <FaCheckCircle size={10} /> Winning
                    </span>
                );
            case BidStatus.OUTBID:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <FaExclamationTriangle size={10} /> Outbid
                    </span>
                );
            case BidStatus.WON:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F1F1F] text-white border border-[#1F1F1F] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <FaTrophy size={10} className="text-amber-400" /> Lot Won
                    </span>
                );
            case BidStatus.CANCELLED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <FaTimesCircle size={10} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Active
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="border-b border-[#E6E0DA] pb-5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
                        My Bids
                    </h1>
                    <p className="text-xs text-[#6B6B6B] font-medium mt-1">
                        Track your bid activity across all live and past auctions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    <div className="relative w-full sm:w-56">
                        <FaFilter size={10} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-white border border-[#E6E0DA] rounded-xl pl-9 pr-8 py-2 text-xs font-bold uppercase tracking-wider text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] shadow-sm appearance-none cursor-pointer transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value={BidStatus.ACTIVE}>Active</option>
                            <option value={BidStatus.WINNING}>Winning</option>
                            <option value={BidStatus.OUTBID}>Outbid</option>
                            <option value={BidStatus.WON}>Won</option>
                            <option value={BidStatus.CANCELLED}>Cancelled</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6B6B] text-[10px]">
                            ▼
                        </div>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <FaSearch size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                        <input
                            type="text"
                            placeholder="Search by lot title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-[#E6E0DA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F1F1F] placeholder-[#6B6B6B] focus:outline-none focus:border-[#C9653B] shadow-sm transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm space-y-2">
                        <FaGavel size={24} className="mx-auto text-[#6B6B6B]/40" />
                        <p className="text-[#1F1F1F] text-sm font-bold uppercase tracking-wide">No Bids Found</p>
                        <p className="text-[#6B6B6B] text-xs max-w-sm mx-auto">
                           You haven&rsquo;t placed any bids matching your current filter criteria.
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
                                                    <span className={`text-sm font-black font-mono ${item.myBidStatus === BidStatus.OUTBID ? "text-amber-600" : "text-emerald-700"
                                                        }`}>
                                                        ₹{item.currentHighestBid?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-[#E6E0DA] bg-[#FFF9F4] p-3 space-y-2">
                                        {item.endTime && (
                                            <div className="flex justify-between items-center text-[11px]">
                                                <span className="text-[#6B6B6B] font-semibold text-[10px] uppercase tracking-wider">
                                                    Time Remaining:
                                                </span>
                                                <CountdownTimer endTime={new Date(item.endTime).toISOString()} />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => navigate(`/auctions/${item.auctionId || item.auctionTitle}`)}
                                            className="w-full py-2 px-3 bg-white hover:bg-[#C9653B] hover:text-white border border-[#E6E0DA] hover:border-[#C9653B] text-[#1F1F1F] text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm group"
                                        >
                                            View Auction Details
                                            <FaExternalLinkAlt size={10} className="text-[#6B6B6B] group-hover:text-white transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

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