import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { fetchAllAuctionHouses } from '../../redux/admin/admin.slice';
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const AuctionHouseTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate()
    const { houses, loading, pagination } = useAppSelector((state) => state.admin);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchAllAuctionHouses({ page, limit: 10 }));
    }, [dispatch, page]);

    return (
        <div className="bg-[#111827] rounded-sm border border-white/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Auction House</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Established</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Owner ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">
                                    Synchronizing Data...
                                </td>
                            </tr>
                        ) : houses.length > 0 ? (
                            houses.map((house) => (
                                <tr key={house.id || house._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-white text-xs font-bold uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">
                                            {house.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-400 text-[11px] font-mono">{house.yearEstablished}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-500 text-[9px] font-mono truncate max-w-[100px]" title={house.userId}>
                                            {house.userId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${house.status === 'verified'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                            }`}>
                                            {house.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/auction-house/${house.id || house._id}`)}
                                            className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Details <FaExternalLinkAlt size={8} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-gray-600 text-[10px] uppercase tracking-widest">
                                    No records found in registry
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Displaying Page <span className="text-[#D4AF37]">{page}</span> of {pagination.totalPages || 1}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-white/10 rounded-sm text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <FaChevronLeft size={10} />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages || pagination.totalPages === 0}
                        className="p-2 border border-white/10 rounded-sm text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <FaChevronRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionHouseTable;