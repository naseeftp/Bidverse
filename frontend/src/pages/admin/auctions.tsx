import React, { useEffect, useState, useCallback } from "react";
import type { AuctionItemListDTO } from "../../types/auctionItem.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    FaExternalLinkAlt,
    FaSearch,
    FaFilter
} from "react-icons/fa";
import Pagination from "../../components/admin/pagination";
const AdminAuctionsListPage: React.FC = () => {
    const [auctions, setAuction] = useState<AuctionItemListDTO[]>([])
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null)
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState<number>(1)
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const navigate = useNavigate()
    const fetchAuctions = useCallback(async () => {
        setLoading(true)
        try {
            const result = await auctionItemMangementService.listAdminAuctions(
                1, 5, undefined,
                statusFilter == 'all' ? undefined : statusFilter,
                typeFilter == 'all' ? undefined : typeFilter

            )
            if (result.success && result.data) {
                setAuction(result.data)
                setPagination(result.pagination ?? null)
            }
            else {
                toast.error(result.message)
            }
        } catch {
            toast.error('Error while listing auctions')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, typeFilter])

    useEffect(() => {
        fetchAuctions()
    }, [fetchAuctions])
    return (
        <div className="space-y-6 p-6  min-h-screen text-white">

            <div>
                <h1 className="text-xl font-black uppercase tracking-[0.25em] text-[#111827]">
                    Auctions Management
                </h1>
                <p className="text-[10px] font-bold text-[#111827] uppercase tracking-widest mt-1">
                    System Administration Panel
                </p>
            </div>


            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="w-full max-w-md relative group">
                    <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
                        <FaSearch size={10} />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        placeholder="Search Auctions by title,house Name"

                        className="w-full bg-[#111827] border border-white/10 pl-10 pr-4 py-3 text-[10px] text-white/40 font-bold uppercase tracking-widest "
                    />
                </div>


                <div className="w-full md:w-auto min-w-[200px] relative group">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#111827] mb-2 block ml-1 text-right md:mr-1">
                        Auction Type
                    </label>
                    <div className="absolute bottom-3.5 left-4 text-white/20">
                        <FaFilter size={10} />
                    </div>
                    <select
                        value={typeFilter}

                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
                        className="w-full bg-[#111827] border border-white/10 pl-10 pr-10 py-3 text-[10px] text-white/40 font-bold uppercase tracking-widest "
                    >
                        <option value="all">ALL TYPES</option>
                        <option value="LIVE">LIVE</option>
                        <option value="TIMED">TIMED</option>
                    </select>
                    <div className="absolute bottom-4 right-4 text-white/20 text-[8px]">▼</div>
                </div>


                <div className="w-full md:w-auto min-w-[200px] relative group">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#111827] mb-2 block ml-1 text-right md:mr-1">
                        Auction Status
                    </label>
                    <div className="absolute bottom-3.5 left-4 text-white/20">
                        <FaFilter size={10} />
                    </div>
                    <select
                        value={statusFilter}

                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                        className="w-full bg-[#111827] border border-white/10 pl-10 pr-10 py-3 text-[10px] text-white/40 font-bold uppercase tracking-widest "
                    >
                        <option value="all">ALL</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="SOLD">SOLD</option>
                    </select>
                    <div className="absolute bottom-4 right-4 text-white/20 text-[8px]">▼</div>
                </div>
            </div>


            <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.05] border-b border-white/10">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    AUCTION ID
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    IMAGE
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    ITEM NAME
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    AUCTION HOUSE
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center">
                                    TYPE
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center">
                                    STATUS
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white text-right">
                                    ACTION
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-20 text-center text-white animate-pulse uppercase text-[10px] tracking-widest"
                                    >
                                        Loading Platform Auctions...
                                    </td>
                                </tr>
                            ) : auctions.length > 0 ? (
                                auctions.map((item) => {
                                    const primaryImgUrl = item.images?.find((img) => img.isPrimary)?.url
                                    return (
                                        <tr key={item.auctionItemId} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-6 py-4 border-r border-white/5 font-mono text-[10px] text-white/60">
                                                #{item.auctionItemId?.slice(-8).toUpperCase()}
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5">
                                                <div className="w-12 h-12 bg-black border border-white/10 rounded-sm overflow-hidden flex items-center justify-center">
                                                    <img
                                                        src={primaryImgUrl}
                                                        alt={item.auctionName}
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5 text-xs font-bold uppercase tracking-wider text-white">
                                                {item.auctionName}
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5 text-xs text-white/80 uppercase tracking-wide">
                                                {item.auctionHouseName}
                                            </td>

                                            <td className="px-6 py-4 border-r border-white/5 text-center">
                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${item.type === "LIVE"
                                                    ? "bg-white text-black border-white"
                                                    : "border-white/20 text-white/60"
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>


                                            <td className="px-6 py-4 border-r border-white/5 text-center">
                                                <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${item.auctionStatus === "SCHEDULED" || item.auctionStatus === "SOLD"
                                                    ? "bg-green-500 text-black border-green-500"
                                                    : item.auctionStatus === "PENDING_APPROVAL"
                                                        ? "bg-yellow-400 text-black border-yellow-400"
                                                        : item.auctionStatus === "DRAFT"
                                                            ? "border-white/20 text-white/60"
                                                            : "bg-red-500 text-white border-red-500"
                                                    }`}>
                                                    {item.auctionStatus?.replace(/_/g, " ")}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/admin/auctions/${item.auctionItemId}`)}
                                                    className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:underline transition-all"
                                                >
                                                    View <FaExternalLinkAlt size={8} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest"
                                    >
                                        No Auction Records Registered
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

}

export default AdminAuctionsListPage