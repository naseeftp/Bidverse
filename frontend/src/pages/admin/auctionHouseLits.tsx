import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { fetchAllAuctionHouses } from '../../redux/admin/admin.slice';
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AuctionHouseTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { houses, loading, pagination } = useAppSelector((state) => state.admin);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchAllAuctionHouses({ page, limit: 10 }));
    }, [dispatch, page]);

    return (
        <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.05] border-b border-white/10">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">Auction House</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">Established</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">Owner ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-white animate-pulse uppercase text-[10px] tracking-widest">
                                    Synchronizing Data...
                                </td>
                            </tr>
                        ) : houses.length > 0 ? (
                            houses.map((house) => (
                                <tr key={house.id || house._id} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4 border-r border-white/5">
                                        <div className="text-white text-xs font-bold uppercase tracking-wider">
                                            {house.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-white/5">
                                        
                                        <div className="text-white text-[11px] font-mono">
                                            {house.yearEstablished}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-white/5">
                                        {/* Changed to text-white and removed extreme truncation */}
                                        <div className="text-white text-[10px] font-mono opacity-90">
                                            {house.userId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-white/5">
                                        <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${
                                            house.status === 'verified'
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent border-white text-white'
                                        }`}>
                                            {house.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/auction-house/${house.id || house._id}`)}
                                            className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:underline transition-all"
                                        >
                                            Details <FaExternalLinkAlt size={8} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">
                    Page <span className="text-white underline">{page}</span> OF {pagination.totalPages || 1}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 transition-all"
                    >
                        <FaChevronLeft size={10} />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages || pagination.totalPages === 0}
                        className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 transition-all"
                    >
                        <FaChevronRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionHouseTable;