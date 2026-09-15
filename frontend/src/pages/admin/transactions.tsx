import React, { useCallback, useEffect, useState } from "react";
import transactionService from "../../services/transaction.service";
import type { transactionListDTO } from "../../types/transaction.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import Pagination from "../../components/admin/pagination";
import {
    FaArrowUp,
    FaArrowDown,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaExchangeAlt,
    FaFilter
} from "react-icons/fa";

const AdminTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<transactionListDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [direction, setDirection] = useState("all");

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await transactionService.listTransaction(page, 10, direction);
            if (response.success && response.data) {
                setTransactions(response.data);
                setPagination(response.pagination ?? null);
            } else {
                toast.error(response.message || "Failed to retrieve transactions");
            }
        } catch {
            toast.error("Failed to sync transaction registry");
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
                    <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 inline-flex items-center gap-1.5">
                        <FaCheckCircle size={8} /> Completed
                    </span>
                );
            case "pending":
            case "processing":
                return (
                    <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-amber-500/30 text-amber-400 bg-amber-500/10 inline-flex items-center gap-1.5">
                        <FaHourglassHalf size={8} /> Pending
                    </span>
                );
            case "failed":
            case "cancelled":
                return (
                    <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-rose-500/30 text-rose-400 bg-rose-500/10 inline-flex items-center gap-1.5">
                        <FaTimesCircle size={8} /> {normalized}
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/20 text-white/60 bg-white/5">
                        {status}
                    </span>
                );
        }
    };

    const renderDirectionBadge = (dir: string) => {
        const isCredit = dir?.toLowerCase() === "credit";
        return (
            <span
                className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-[2px] border inline-flex items-center gap-1 ${
                    isCredit
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-rose-500/30 text-rose-400 bg-rose-500/10"
                }`}
            >
                {isCredit ? <FaArrowDown size={8} /> : <FaArrowUp size={8} />}
                {dir}
            </span>
        );
    };

    const formatPurpose = (purpose: string): string => {
        return purpose.replace(/_/g, " ").toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-black uppercase tracking-[0.25em] text-[#111827]">
                    Transaction History
                </h1>
                <p className="text-[10px] font-bold text-[#111827] uppercase tracking-widest mt-1">
                    System Administration Panel
                </p>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row justify-end items-end gap-4">
                <div className="w-full md:w-auto min-w-[200px] relative group">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#111827] mb-2 block ml-1 text-right md:mr-1">
                        Direction Filter
                    </label>
                    <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
                        <FaFilter size={10} />
                    </div>
                    <select
                        value={direction}
                        onChange={(e) => {
                            setDirection(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-[#111827] border border-white/10 pl-10 pr-10 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 appearance-none cursor-pointer transition-all"
                    >
                        <option value="all">ALL TRANSACTIONS</option>
                        <option value="credit">CREDITED ONLY</option>
                        <option value="debit">DEBITED ONLY</option>
                    </select>
                    <div className="absolute bottom-4 right-4 pointer-events-none text-white/20 text-[8px]">▼</div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.05] border-b border-white/10">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    Transaction Details
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    Purpose
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    Date & Time
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-right">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-20 text-center text-white animate-pulse uppercase text-[10px] tracking-widest"
                                    >
                                        Syncing Transaction Ledger...
                                    </td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => {
                                    const isCredit = tx.direction?.toLowerCase() === "credit";
                                    return (
                                        <tr
                                            key={tx.transactionId}
                                            className="hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <td className="px-6 py-4 border-r border-white/5 space-y-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-white">
                                                    {tx.description}
                                                </p>
                                                <p className="font-mono text-[10px] text-white/50">
                                                    ID: {tx.transactionId}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white/5 border border-white/10 text-white/80 text-[9px] font-bold uppercase tracking-widest">
                                                    <FaExchangeAlt size={8} className="text-white/40" />
                                                    {formatPurpose(tx.purpose)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5">
                                                {renderDirectionBadge(tx.direction)}
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5 space-y-0.5">
                                                <div className="text-xs font-bold text-white tracking-wider">
                                                    {formatDate(tx.createdAt)}
                                                </div>
                                                <div className="text-[10px] font-mono text-white/50">
                                                    {formatTime(tx.createdAt)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5 text-right">
                                                <span
                                                    className={`font-mono font-bold text-xs tracking-tight ${
                                                        isCredit ? "text-emerald-400" : "text-white"
                                                    }`}
                                                >
                                                    {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                                                </span>
                                                <span className="text-[8px] text-white/40 block uppercase font-mono tracking-widest mt-0.5">
                                                    {tx.currency}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {renderStatusBadge(tx.status)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest"
                                    >
                                        No Transactions Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={page}
                    paginationMeta={pagination}
                    isLoading={loading}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default AdminTransactions;