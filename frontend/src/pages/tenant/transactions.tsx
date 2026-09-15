import React, { useCallback, useEffect, useState } from "react";
import transactionService from "../../services/transaction.service";
import type { transactionListDTO } from "../../types/transaction.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import Pagination from "../../components/tenant/pagination";
import {
    FaArrowUp,
    FaArrowDown,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaReceipt,
    FaExchangeAlt,
    FaFilter
} from "react-icons/fa"

const TenantTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<transactionListDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [direction, setDirection] = useState("all");

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await transactionService.listTransaction(page, 6, direction);
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
    }, [page, direction]);

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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> Completed
                    </span>
                );
            case "pending":
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaHourglassHalf size={10} /> Pending
                    </span>
                );
            case "failed":
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaTimesCircle size={10} /> {normalized}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wider">
                        {status}
                    </span>
                );
        }
    };

    const renderDirectionBadge = (dir: string) => {
        const isCredit = dir?.toLowerCase() === "credit";
        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    isCredit
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        : "bg-rose-50 text-rose-700 border border-rose-200/80"
                }`}
            >
                {isCredit ? <FaArrowDown size={9} /> : <FaArrowUp size={9} />}
                {dir}
            </span>
        );
    };

    const formatPurpose = (purpose: string): string => {
        return purpose.replace(/_/g, " ").toUpperCase();
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-4 py-8 md:px-8 text-[#0F172A] font-sans antialiased">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="border-b border-[#E2E8F0] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                            Transaction History
                        </h1>
                        <p className="text-xs text-[#475569] font-medium mt-1">
                            Track all your payments, and refunds.
                        </p>
                    </div>

                    <div className="w-full md:w-auto min-w-[200px] relative group">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] mb-1.5 block">
                            Direction Filter
                        </label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#2F6FED] transition-colors pointer-events-none">
                                <FaFilter size={10} />
                            </div>
                            <select
                                value={direction}
                                onChange={(e) => {
                                    setDirection(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-8 py-2 text-xs text-[#0F172A] font-semibold uppercase tracking-wider focus:outline-none focus:border-[#2F6FED] focus:ring-1 focus:ring-[#2F6FED] appearance-none cursor-pointer shadow-xs transition-all"
                            >
                                <option value="all">ALL TRANSACTIONS</option>
                                <option value="credit">CREDITED</option>
                                <option value="debit">DEBITED</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#475569] text-[8px]">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#2F6FED] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-xs space-y-2">
                        <FaReceipt size={24} className="mx-auto text-[#475569]/40" />
                        <p className="text-[#0F172A] text-sm font-bold tracking-wide">
                            No Transactions Found
                        </p>
                        <p className="text-[#475569] text-xs max-w-sm mx-auto">
                            You haven&rsquo;t made any transactions matching this criteria yet.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                                            <th className="py-3.5 px-4">Transaction Details</th>
                                            <th className="py-3.5 px-4">Purpose</th>
                                            <th className="py-3.5 px-4">Type</th>
                                            <th className="py-3.5 px-4">Date & Time</th>
                                            <th className="py-3.5 px-4 text-right">Amount</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                                        {transactions.map((tx) => {
                                            const isCredit = tx.direction?.toLowerCase() === "credit";
                                            return (
                                                <tr
                                                    key={tx.transactionId}
                                                    className="hover:bg-[#F8FAFC] transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-semibold text-[#0F172A]">
                                                                {tx.description}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-[#475569]">
                                                                ID: {tx.transactionId}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] text-[10px] font-semibold uppercase tracking-wider">
                                                            <FaExchangeAlt size={9} className="text-[#475569]" />
                                                            {formatPurpose(tx.purpose)}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        {renderDirectionBadge(tx.direction)}
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <div className="text-[#0F172A] font-semibold">
                                                            {formatDate(tx.createdAt)}
                                                        </div>
                                                        <div className="text-[10px] text-[#475569]">
                                                            {formatTime(tx.createdAt)}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4 text-right">
                                                        <span
                                                            className={`font-bold text-sm ${
                                                                isCredit ? "text-emerald-600" : "text-[#0F172A]"
                                                            }`}
                                                        >
                                                            {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                                                        </span>
                                                        <span className="text-[9px] text-[#475569] block uppercase font-bold">
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

                        <div className="mt-6">
                            <Pagination
                                pagination={pagination}
                                currentPage={page}
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

export default TenantTransactions;