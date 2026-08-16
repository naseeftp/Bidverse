import React, { useCallback, useEffect, useState } from "react";
import transactionService from "../../services/transaction.service";
import type { transactionListDTO } from "../../types/transaction.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import Pagination from "../../components/user/pagination";
import {
    FaArrowUp,
    FaArrowDown,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaReceipt,
    FaExchangeAlt
} from "react-icons/fa";

const MyTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<transactionListDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await transactionService.listTransaction(page, 6);
            if (response.success && response.data) {
                setTransactions(response.data);
                setPagination(response.pagination ?? null);
            } else {
                toast.error(response.message || "Failed to retrieve transactions");
            }
        } catch {
            toast.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);
    const formatDate = (date: string | Date): string => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = (date: string | Date): string => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const renderStatusBadge = (status: string) => {
        const normalized = status?.toLowerCase();
        switch (normalized) {
            case "completed":
            case "success":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> Completed
                    </span>
                );
            case "pending":
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaHourglassHalf size={10} /> Pending
                    </span>
                );
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

    const renderDirectionBadge = (direction: string) => {
        const isCredit = direction?.toLowerCase() === "credit";
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isCredit
                        ? "bg-emerald-100/60 text-emerald-800"
                        : "bg-rose-100/60 text-rose-800"
                    }`}
            >
                {isCredit ? <FaArrowDown size={9} /> : <FaArrowUp size={9} />}
                {direction}
            </span>
        );
    };

    const formatPurpose = (purpose: string): string => {
        return purpose.replace(/_/g, " ").toUpperCase();
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="border-b border-[#E6E0DA] pb-5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
                        Transaction History
                    </h1>
                    <p className="text-xs text-[#6B6B6B] font-medium mt-1">
                        Track all your payments,and refunds.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm space-y-2">
                        <FaReceipt size={24} className="mx-auto text-[#6B6B6B]/40" />
                        <p className="text-[#1F1F1F] text-sm font-bold uppercase tracking-wide">
                            No Transactions Found
                        </p>
                        <p className="text-[#6B6B6B] text-xs max-w-sm mx-auto">
                            You haven&rsquo;t made any transactions yet. Your payment logs and refunds will appear here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#FFF9F4] border-b border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                                            <th className="py-3.5 px-4">Transaction Details</th>
                                            <th className="py-3.5 px-4">Purpose</th>
                                            <th className="py-3.5 px-4">Type</th>
                                            <th className="py-3.5 px-4">Date & Time</th>
                                            <th className="py-3.5 px-4 text-right">Amount</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E6E0DA] text-xs">
                                        {transactions.map((tx) => {
                                            const isCredit = tx.direction?.toLowerCase() === "credit";
                                            return (
                                                <tr
                                                    key={tx.transactionId}
                                                    className="hover:bg-[#FFF9F4]/50 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-[#1F1F1F]">
                                                                {tx.description}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-[#6B6B6B]">
                                                                ID: {tx.transactionId}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-[#1F1F1F] text-[10px] font-bold uppercase tracking-wider">
                                                            <FaExchangeAlt size={9} className="text-[#6B6B6B]" />
                                                            {formatPurpose(tx.purpose)}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        {renderDirectionBadge(tx.direction)}
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <div className="text-[#1F1F1F] font-semibold">
                                                            {formatDate(tx.createdAt)}
                                                        </div>
                                                        <div className="text-[10px] text-[#6B6B6B]">
                                                            {formatTime(tx.createdAt)}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4 text-right">
                                                        <span
                                                            className={`font-black text-sm ${isCredit ? "text-emerald-600" : "text-[#1F1F1F]"
                                                                }`}
                                                        >
                                                            {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                                                        </span>
                                                        <span className="text-[9px] text-[#6B6B6B] block uppercase font-bold">
                                                            {tx.currency}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4 text-center">
                                                        {renderStatusBadge(tx.status)}
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

export default MyTransactions;