import React, { useState, useEffect, useCallback } from "react";
import watchListService from "../../services/watchList.service";
import type { IPaginationMeta } from "../../types/auth.type";
import type { WatchlistItemCardDTO } from "../../types/watchlist.dto";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import WatchlistCard from "../../components/user/watchlistCard";
import Pagination from "../../components/user/pagination";

const Watchlist: React.FC = () => {
    const [items, setItems] = useState<WatchlistItemCardDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);

    const LIMIT = 6;

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);

            const response = await watchListService.findAllWatchListItems(page, LIMIT);

            if (response.success && response.data) {
                setItems(response.data);
                setPagination(response.pagination ?? null);
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error("Network error fetching watchlist items");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleRemoveSuccess = (watchlistId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.watchlistId !== watchlistId));

        // If we deleted the last item on page 3, push user back to page 2
        if (items.length === 1 && page > 1) {
            setPage((prev) => prev - 1);
        } else {
            fetchItems();
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] text-[#1F1F1F] px-4 py-8 md:px-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center justify-between border-b border-[#E6E0DA]/60 pb-5 mb-8">
                    <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-[#C9653B] fill-[#C9653B]" />
                        <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
                            My Watchlist
                        </h1>
                    </div>
                    {pagination && pagination.totalItems > 0 && (
                        <p className="text-sm text-[#6B6B6B]">
                            Monitoring <span className="font-bold text-[#1F1F1F]">{pagination.totalItems}</span> Items
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm max-w-md mx-auto mt-12">
                        <p className="text-[#6B6B6B] text-sm font-medium">Your watchlist is currently empty.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <WatchlistCard
                                    key={item.watchlistId}
                                    item={item}
                                    onRemoveSuccess={handleRemoveSuccess}
                                />
                            ))}
                        </div>

                        <Pagination
                            pagination={pagination}
                            onPageChange={setPage}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Watchlist;