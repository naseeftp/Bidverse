import React, { useState, useEffect, useCallback } from "react";
import publicAuctionService from "../services/publicAuction.service";
import type { AuctionItemListDTO } from "../types/auctionItem.dto";
import type { IPaginationMeta } from "../types/auth.type";
import toast from "react-hot-toast";
import AuctionCard from "../components/user/auctionCard";
import Pagination from "../components/user/pagination";

const PublicAuctions: React.FC = () => {
    const [auction, setAuction] = useState<AuctionItemListDTO[]>([])
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null)
    const [page, setPage] = useState<number>(1)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");

    const fetchAuctions = useCallback(async () => {
        setLoading(true)
        try {
            const response = await publicAuctionService.listPublicAuction(page, 6, search, typeFilter)
            if (response.success && response.data) {
                setAuction(response.data);
                setPagination(response.pagination ?? null)
            }
            else {
                toast.error(response.message)
            }
        } catch {
            toast.error('Error while loading auction list')
        } finally {
            setLoading(false)
        }

    }, [page, search, typeFilter])
    

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAuctions();
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchAuctions])

    return (
        <div className="min-h-screen bg-[#FFF9F4] text-[#1F1F1F] px-4 py-8 md:px-8">
            <div className="max-w-7xl mx-auto">


                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 pb-6 border-b border-[#E6E0DA]/60">


                    <div className="max-w-md">
                        <h1 className="text-3xl font-bold tracking-tight text-[#1F1F1F] mb-2">Find Auctions....</h1>
                        <p className="text-sm text-[#6B6B6B]">Explore verified active Auctions and Participate.</p>
                    </div>


                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto sm:max-w-xl">

                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Search by title or house..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full bg-white border border-[#E6E0DA] text-[#1F1F1F] placeholder-[#6B6B6B]/60 pl-4 pr-10 py-2 rounded-xl text-sm focus:outline-none focus:border-[#C9653B] focus:ring-1 focus:ring-[#C9653B] transition-all shadow-sm"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-[#6B6B6B]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>


                        <div className="relative w-full sm:w-44">
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="w-full bg-white border border-[#E6E0DA] text-[#1F1F1F] pl-4 pr-10 py-2 rounded-xl text-sm focus:outline-none focus:border-[#C9653B] transition-all appearance-none cursor-pointer shadow-sm font-medium"
                            >
                                <option value="">All Formats</option>
                                <option value="TIMED">Timed Auction</option>
                                <option value="LIVE">Live Stream</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-[#6B6B6B]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>


                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : auction.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm">
                        <p className="text-[#6B6B6B] text-sm">No live or scheduled Auctions Available</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {auction.map((item) => (
                                <AuctionCard key={item.auctionItemId} item={item} onBidSuccess={fetchAuctions} />
                            ))}
                        </div>

                        <div className="mt-10">
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
}

export default PublicAuctions