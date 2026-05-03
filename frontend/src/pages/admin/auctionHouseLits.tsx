import React, { useCallback, useEffect, useState } from 'react';
import type { IPaginationMeta } from '../../types/auth.type';
import type { AdminAuctionHouseDetailDTO } from '../../types/auctionHouse.type';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';
import {
    FaExternalLinkAlt,
    FaSearch,
    FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AuctionHouseTable: React.FC = () => {
    const [houses, setHouses] = useState<AdminAuctionHouseDetailDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const navigate = useNavigate();

    const fetchHouses = useCallback(async () => {
        setLoading(true);

        try {
            const response = await adminService.listAllAuctionHouses(
                page,
                10,
                search,
                statusFilter
            );

            if (response.success) {
                setHouses(response.data ?? []);
                setPagination(response.pagination ?? null);
            }
        } catch {
            toast.error('Failed to sync registry');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchHouses();
        }, 500);

        return () => clearTimeout(handler);
    }, [fetchHouses]);

    return (
        <div className="space-y-6">

           
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">

              
                <div className="w-full max-w-md relative group">
                    <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
                        <FaSearch size={10} />
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by Name, Email, ID"
                        className="w-full bg-[#111827] border border-white/10 pl-10 pr-4 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white"
                    />
                </div>

              
                <div className="w-full md:w-auto min-w-[200px] relative group">

                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block ml-1 text-right md:mr-1">
                        Verification Status
                    </label>

                    <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
                        <FaFilter size={10} />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-[#111827] border border-white/10 pl-10 pr-10 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 appearance-none cursor-pointer transition-all"
                    >
                        <option value="all">ALL</option>
                        <option value="approved">APPROVED</option>
                        <option value="pending">PENDING</option>
                        <option value="rejected">REJECTED</option>
                        <option value="not_submitted">NOT SUBMITTED</option>
                    </select>

                    <div className="absolute bottom-4 right-4 pointer-events-none text-white/20 text-[8px]">
                        ▼
                    </div>
                </div>
            </div>

           
            <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-left border-collapse">

                        <thead>
                            <tr className="bg-white/[0.05] border-b border-white/10">

                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    OWNER ID
                                </th>

                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    BUSINESS NAME
                                </th>

                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                                    EMAIL
                                </th>

                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center">
                                    ACC STATUS
                                </th>

                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center">
                                    VERIFICATION STATUS
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
                                        colSpan={6}
                                        className="py-20 text-center text-white animate-pulse uppercase text-[10px] tracking-widest"
                                    >
                                        Loading Auction Houses...
                                    </td>
                                </tr>
                            ) : houses.length > 0 ? (
                                houses.map((house) => (
                                    <tr
                                        key={house.houseId}
                                        className="hover:bg-white/[0.03] transition-colors group"
                                    >

                                      
                                        <td className="px-6 py-4 border-r border-white/5 font-mono text-[10px] text-white/60">
                                            #{house.userId}
                                        </td>

                                       
                                        <td className="px-6 py-4 border-r border-white/5 text-xs font-bold uppercase tracking-wider text-white">
                                            {house.businessName || 'N/A'}
                                        </td>

                                       
                                        <td className="px-6 py-4 border-r border-white/5 text-[11px] font-mono text-white/80 lowercase">
                                            {house.userEmail}
                                        </td>

                                        
                                        <td className="px-6 py-4 border-r border-white/5 text-center">
                                            <span
                                                className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${!house.isAccountBlocked
                                                        ? 'bg-white text-black border-white'
                                                        : 'border-white/20 text-white/40'
                                                    }`}
                                            >
                                                {!house.isAccountBlocked
                                                    ? 'Active'
                                                    : 'Blocked'}
                                            </span>
                                        </td>

                                        
                                        <td className="px-6 py-4 border-r border-white/5 text-center">
                                            <span
                                                className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border
                                                ${house.status === 'approved'
                                                        ? 'bg-green-500 text-black border-green-500'
                                                        : house.status === 'pending'
                                                            ? 'bg-yellow-400 text-black border-yellow-400'
                                                            : house.status === 'rejected'
                                                                ? 'bg-red-500 text-white border-red-500'
                                                                : 'border-white/20 text-white/40'
                                                    }`}
                                            >
                                                {house.status}
                                            </span>
                                        </td>

                                       
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    navigate(`/admin/auction-house/${house.userId}`)
                                                }
                                                className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:underline transition-all"
                                            >
                                                Details <FaExternalLinkAlt size={8} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest"
                                    >
                                        No Auction Houses Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

             
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">

                    <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">
                        Displaying Page{' '}
                        <span className="underline">{page}</span> OF{' '}
                        {pagination?.totalPages || 1}
                    </p>

                    <div className="flex gap-2">

                        <button
                            onClick={() =>
                                setPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={page === 1 || loading}
                            className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-[10px]"
                        >
                            PREV
                        </button>

                        <button
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(
                                        pagination?.totalPages || 1,
                                        prev + 1
                                    )
                                )
                            }
                            disabled={
                                page === pagination?.totalPages || loading
                            }
                            className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-[10px]"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionHouseTable;