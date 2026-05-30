import React, { useEffect, useState, useCallback } from "react";
import type { AuctionItemListDTO } from "../../types/auctionItem.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
    FaSearch, 
    FaFilter, 
    FaLayerGroup, 
    FaEye, 
    FaChevronLeft, 
    FaChevronRight 
} from "react-icons/fa";

const TenantAuctions:React.FC=()=>{
  const [auctions, setAuction] = useState<AuctionItemListDTO[]>([])
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null)
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState<number>(1)
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch,setDebouncedSearch]=useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter,setTypeFilter]=useState<string>('all')
    const navigate = useNavigate()

    useEffect(()=>{
        const delayHandler=setTimeout(()=>{
           setDebouncedSearch(search);
           setPage(1)
        },400)
        return ()=> clearTimeout(delayHandler)
    },[search])
    const fetchAuctions = useCallback(async () => {
        setLoading(true)
        try {
            const result = await auctionItemMangementService.listTenantAuctions(
                page,
                6,
                debouncedSearch.trim()===''?undefined:debouncedSearch,
                statusFilter=='all'?undefined:statusFilter,
                typeFilter=='all'?undefined:typeFilter
            
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
    }, [page,debouncedSearch, statusFilter,typeFilter])

    useEffect(() => {
        fetchAuctions()
    }, [fetchAuctions])

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-4 py-8 md:px-8 text-[#0F172A] font-sans">
            <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
                        Organization Registry
                    </h1>
                    <p className="text-sm text-[#475569] mt-0.5">
                        Manage and track your distributed catalog live inventory profiles
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="w-full md:max-w-md relative">
                    <div className="absolute left-4 top-3.5 text-[#475569]/50">
                        <FaSearch size={14} />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search item name, house name..."
                        className="w-full bg-[#F5F7FB] border border-[#E2E8F0] pl-10 pr-4 py-2.5 text-sm rounded-lg text-[#0F172A] placeholder-[#475569]/50 focus:outline-none focus:border-[#2F6FED] focus:bg-white transition-all font-medium"
                    />
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center self-stretch md:self-auto">
                    <div className="w-full sm:w-[180px] relative">
                        <div className="absolute left-3.5 top-3.5 text-[#475569]/50 pointer-events-none">
                            <FaFilter size={12} />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full bg-[#F5F7FB] border border-[#E2E8F0] pl-9 pr-8 py-2.5 text-xs text-[#475569] font-bold uppercase tracking-wider rounded-lg focus:outline-none focus:border-[#2F6FED] focus:bg-white cursor-pointer appearance-none"
                        >
                            <option value="all">ALL STATUSES</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="SOLD">SOLD</option>
                        </select>
                        <div className="absolute right-3.5 top-4 text-[#475569]/50 text-[10px] pointer-events-none">▼</div>
                    </div>

                    <div className="w-full sm:w-[180px] relative">
                        <div className="absolute left-3.5 top-3.5 text-[#475569]/50 pointer-events-none">
                            <FaLayerGroup size={12} />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="w-full bg-[#F5F7FB] border border-[#E2E8F0] pl-9 pr-8 py-2.5 text-xs text-[#475569] font-bold uppercase tracking-wider rounded-lg focus:outline-none focus:border-[#2F6FED] focus:bg-white cursor-pointer appearance-none"
                        >
                            <option value="all">ALL TYPES</option>
                            <option value="LIVE">LIVE</option>
                            <option value="TIMED">TIMED</option>
                        </select>
                        <div className="absolute right-3.5 top-4 text-[#475569]/50 text-[10px] pointer-events-none">▼</div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-10 h-10 border-4 border-[#2F6FED] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs uppercase tracking-widest font-bold text-[#475569] animate-pulse">Syncing Inventory Catalog...</p>
                    </div>
                ) : auctions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((item) => {
                            const thumbnailImage = item.images?.find((img) => img.isPrimary)?.url 
                               

                            return (
                                <div key={item.auctionItemId} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group">
                                    <div className="h-48 bg-[#F5F7FB] relative overflow-hidden">
                                        <img 
                                            src={thumbnailImage} 
                                            alt={item.auctionName}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x250?text=No+Image+Available"; }}
                                        />
                                        
                                      
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                         
                                            <span className={`px-2.5 py-1 text-[9px] font-black tracking-wider uppercase rounded-md shadow-sm border ${
                                                item.type === "LIVE" 
                                                    ? "bg-[#0F172A] text-white border-[#0F172A]" 
                                                    : "bg-white text-[#0F172A] border-[#E2E8F0]"
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>

                                  
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#475569]/60">
                                                    #{item.auctionItemId?.slice(-8).toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded-md border ${
                                                    item.auctionStatus === "SCHEDULED" || item.auctionStatus === "SOLD"
                                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                        : item.auctionStatus === "PENDING_APPROVAL"
                                                            ? "bg-amber-50 border-amber-200 text-amber-700"
                                                            : item.auctionStatus === "DRAFT"
                                                                ? "bg-slate-50 border-slate-200 text-slate-600"
                                                                : "bg-rose-50 border-rose-200 text-rose-700"
                                                }`}>
                                                    {item.auctionStatus?.replace(/_/g, " ")}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-base text-[#0F172A] line-clamp-1 group-hover:text-[#2F6FED] transition-colors">
                                                {item.auctionName}
                                            </h3>
                                            <p className="text-xs text-[#475569] font-medium flex items-center gap-1.5">
                                                <span className="inline-block w-1.5 h-1.5 bg-[#2F6FED] rounded-full"></span>
                                                {item.auctionHouseName}
                                            </p>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-end">
                                            <button
                                                onClick={() => navigate(`/tenant/auctions/${item.auctionItemId}`)}
                                                className="inline-flex items-center gap-2 bg-[#2F6FED] hover:bg-[#1E56C8] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm"
                                            >
                                                Details <FaEye size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-[#E2E8F0] py-24 text-center shadow-sm">
                        <p className="text-sm font-bold text-[#475569]/60 uppercase tracking-widest">
                            No matching catalog files recorded
                        </p>
                    </div>
                )}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="max-w-7xl mx-auto mt-10 flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <p className="text-xs font-semibold text-[#475569] tracking-wide">
                        Showing page <span className="text-[#0F172A] font-bold underline">{page}</span> of {pagination.totalPages}
                    </p>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1 || loading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#475569] hover:bg-[#F5F7FB] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <FaChevronLeft size={10} /> PREV
                        </button>
                        <button
                            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                            disabled={page === pagination.totalPages || loading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#475569] hover:bg-[#F5F7FB] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            NEXT <FaChevronRight size={10} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
   
}
export default TenantAuctions