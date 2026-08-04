import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { bidHistoryDTO } from "../../types/bid.dto";
import Pagination from "../../components/admin/pagination";
import toast from "react-hot-toast";
import bidService from "../../services/bid.service";
import type { IPaginationMeta } from "../../types/auth.type";
import { FaArrowLeft, FaGavel } from "react-icons/fa";

const AdminBidHistoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [bids, setBids] = useState<bidHistoryDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const fetchBids = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const result = await bidService.getBidHistory(id, page, 6);
            if (result && result.success && result.data) {
                setBids(result.data ?? []);
                setPagination(result.pagination ?? null);
            } else {
                toast.error(result?.message || "Failed to load bid history");
            }
        } catch {
            toast.error("Error while fetching bid history");
        } finally {
            setLoading(false);
        }
    }, [id, page]);

    useEffect(() => {
        fetchBids();
    }, [fetchBids]);

    const getStatusBadge = (status: string) => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case "winning":
            case "won":
                return (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200">
                        Winning
                    </span>
                );
            case "outbid":
                return (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-50 text-[#D4AF37] border border-[#D4AF37]/30">
                        Outbid
                    </span>
                );
            case "cancelled":
            case "rejected":
                return (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-rose-50 text-[#DC2626] border border-rose-200">
                        {status}
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] px-4 py-8 md:px-8 text-[#0F172A] font-sans">
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#0F172A] mb-4 transition-colors uppercase tracking-wider"
                >
                    <FaArrowLeft size={10} /> BACK TO AUCTIONS
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-2.5">
                            <FaGavel className="text-[#D4AF37]" size={22} /> Bid Audit Logs
                        </h1>
                        <p className="text-sm text-[#6B7280] mt-0.5">
                            Real-time transparent history recorded for Item ID:{" "}
                            <span className="font-mono font-semibold text-[#0F172A]">
                                #{id?.slice(-8).toUpperCase()}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 space-y-4 bg-white rounded-xl border border-[#E5E7EB]">
                        <div className="w-10 h-10 border-4 border-[#111827] border-t-[#D4AF37] rounded-full animate-spin"></div>
                        <p className="text-xs uppercase tracking-widest font-bold text-[#6B7280] animate-pulse">
                            Syncing Bid Logs...
                        </p>
                    </div>
                ) : bids && bids.length > 0 ? (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#111827] border-b border-[#E5E7EB] text-[11px] font-bold text-[#F3F4F6] uppercase tracking-wider">
                                        <th className="py-4 px-6">Bidder</th>
                                        <th className="py-4 px-6">Bid Amount</th>
                                        <th className="py-4 px-6">Date & Time</th>
                                        <th className="py-4 px-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] text-sm font-medium">
                                    {bids.map((bid) => (
                                        <tr
                                            key={bid.bidId}
                                            className="hover:bg-[#F3F4F6]/50 transition-colors"
                                        >
                                            <td className="py-4 px-6 font-bold text-[#0F172A]">
                                                {bid.bidderName || "Anonymous Bidder"}
                                            </td>
                                            <td className="py-4 px-6 font-extrabold text-[#111827] text-base">
                                                {bid.bidAmount?.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-[#6B7280]">
                                                {bid.bidPlacedAt
                                                    ? new Date(bid.bidPlacedAt).toLocaleString("en-US", {
                                                          dateStyle: "medium",
                                                          timeStyle: "short",
                                                      })
                                                    : "N/A"}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {getStatusBadge(bid.bidStatus)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            paginationMeta={pagination}
                            currentPage={page}
                            onPageChange={setPage}
                            isLoading={loading}
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] py-24 text-center shadow-sm">
                        <p className="text-sm font-bold text-[#6B7280] uppercase tracking-widest">
                            No bids recorded for this item yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBidHistoryPage;