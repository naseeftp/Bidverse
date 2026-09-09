import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaymentRequestResponseDTO } from "../../types/paymentRequest.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import paymentRequestService from "../../services/paymentRequest.service";
import Pagination from "../../components/user/pagination";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaCreditCard,
    FaFilter,
    FaGavel
} from "react-icons/fa";

const MyPaymentRequest: React.FC = () => {
    const [requests, setRequests] = useState<PaymentRequestResponseDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const navigate=useNavigate()
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const filterValue = statusFilter === "all" ? undefined : statusFilter;
            const response = await paymentRequestService.listPaymentRequests(page, 6, filterValue);

            if (response.success && response.data) {
                setRequests(response.data)
                setPagination(response.pagination || null)
            } else {
                toast.error(response.message || "Failed to retrieve payment requests");
            }
        } catch {
            toast.error("Failed to fetch payment requests");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const formatDate = (date: string | Date): string => {
        if (!date) return "N/A";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = (date: string | Date): string => {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const renderStatusBadge = (status: string) => {
        const normalized = status?.toLowerCase();
        switch (normalized) {
            case "paid":
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> Paid
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaHourglassHalf size={10} /> Pending
                    </span>
                );
            case "expired":
            case "failed":
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaTimesCircle size={10} /> {normalized}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider">
                        {status}
                    </span>
                );
        }
    };

  
    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="border-b border-[#E6E0DA] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
                            Payment Requests
                        </h1>
                        <p className="text-xs text-[#6B6B6B] font-medium mt-1">
                            Review and settle your pending auction payment requests.
                        </p>
                    </div>

                    <div className="w-full md:w-auto min-w-[200px] relative group">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5 block">
                            Status Filter
                        </label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] group-focus-within:text-[#C9653B] transition-colors pointer-events-none">
                                <FaFilter size={10} />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full bg-white border border-[#E6E0DA] rounded-lg pl-9 pr-8 py-2.5 text-[11px] text-[#1F1F1F] font-bold uppercase tracking-wider focus:outline-none focus:border-[#C9653B] appearance-none cursor-pointer shadow-sm transition-all"
                            >
                                <option value="all">ALL REQUESTS</option>
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6B6B] text-[8px]">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm space-y-2">
                        <FaCreditCard size={24} className="mx-auto text-[#6B6B6B]/40" />
                        <p className="text-[#1F1F1F] text-sm font-bold uppercase tracking-wide">
                            No Payment Requests Found
                        </p>
                        <p className="text-[#6B6B6B] text-xs max-w-sm mx-auto">
                            You don&rsquo;t have any payment requests matching the selected filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#FFF9F4] border-b border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                                            <th className="py-3.5 px-4">Auction Item</th>
                                            <th className="py-3.5 px-4">Created Date</th>
                                            <th className="py-3.5 px-4 text-right">Amount</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                            <th className="py-3.5 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E6E0DA] text-xs">
                                        {requests.map((req) => {
                                            const isPending = req.status?.toUpperCase() === "PENDING";
                                            return (
                                                <tr
                                                    key={req.id}
                                                    className="hover:bg-[#FFF9F4]/50 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
                                                                <FaGavel size={11} className="text-[#C9653B]" />
                                                                {req.auctionTitle || "Auction Item"}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-[#6B6B6B]">
                                                                Auction ID: {req.auctionId}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <div className="text-[#1F1F1F] font-semibold">
                                                            {formatDate(req.createdAt)}
                                                        </div>
                                                        <div className="text-[10px] text-[#6B6B6B]">
                                                            {formatTime(req.createdAt)}
                                                        </div>
                                                    </td>


                                                    <td className="py-4 px-4 text-right">
                                                        <span className="font-black text-sm text-[#1F1F1F]">
                                                            ₹{req.amount.toLocaleString("en-IN")}
                                                        </span>
                                                        <span className="text-[9px] text-[#6B6B6B] block uppercase font-bold">
                                                            {req.currency}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4 text-center">
                                                        {renderStatusBadge(req.status)}
                                                    </td>

                                                    <td className="py-4 px-4 text-center">
                                                        {isPending ? (
                                                            <button
                                                                onClick={()=>navigate(`/check-out/${req.id}`)}
                                                                className="px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#C9653B] text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm"
                                                            >
                                                                Complete Payment
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-[#6B6B6B] uppercase">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8">
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

export default MyPaymentRequest;