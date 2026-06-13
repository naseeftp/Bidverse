import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { WatchlistItemCardDTO } from "../../types/watchlist.dto";
import watchListService from "../../services/watchList.service";
import toast from "react-hot-toast";
import { Trash2, Eye} from "lucide-react";

interface WatchlistCardProps {
    item: WatchlistItemCardDTO;
    onRemoveSuccess: (watchlistId: string) => void;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const WatchlistCard: React.FC<WatchlistCardProps> = ({ item, onRemoveSuccess }) => {
    const navigate = useNavigate();
    const [timerLabel, setTimerLabel] = useState<string>("CALCULATING...");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [statusBadge, setStatusBadge] = useState<{ label: string; style: string }>({
        label: "Checking",
        style: "bg-[#E6E0DA] text-[#6B6B6B]"
    });

   
    const handleDeleteAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (isDeleting) return;
        
        try {
            setIsDeleting(true);
            const response = await watchListService.deleteFromWatchList(item.watchlistId);
            if (response.success) {
                toast.success("Removed from watchlist");
                onRemoveSuccess(item.watchlistId);
            } else {
                toast.error(response.message || "Failed to remove item");
            }
        } catch {
            toast.error("Internal server error handling item removal");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (!item.startTime || !item.endTime) {
            setTimerLabel("TBD");
            setStatusBadge({ label: "Scheduled", style: "bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA]" });
            return;
        }

        const runTimer = () => {
            const now = new Date().getTime();
            const start = new Date(item.startTime).getTime();
            const end = new Date(item.endTime).getTime();

            if (now < start) {
                setTimerLabel("STARTS IN");
                setStatusBadge({
                    label: "Upcoming",
                    style: "bg-amber-50 text-amber-700 border border-amber-200"
                });
                
                const diff = start - now;
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                });
            } else if (now >= start && now < end) {
                setTimerLabel("ENDS IN");
                setStatusBadge({
                    label: "Live Now",
                    style: "bg-emerald-50 text-emerald-700 border border-emerald-200"
                });

                const diff = end - now;
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                });
            } else {
                setTimerLabel("CONCLUDED");
                setStatusBadge({
                    label: "Completed",
                    style: "bg-neutral-100 text-neutral-500 border border-neutral-200"
                });
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        runTimer(); 
        const interval = setInterval(runTimer, 1000);
        return () => clearInterval(interval);
    }, [item]);

    const pad = (num: number) => String(num).padStart(2, "0");

    return (
        <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col w-full mx-auto group">
            
            <div className="relative aspect-video bg-[#FFF9F4] overflow-hidden border-b border-[#E6E0DA]/60">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]/40">
                        No Assets Attached
                    </div>
                )}

                <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded shadow-sm ${statusBadge.style}`}>
                        {statusBadge.label}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#1F1F1F] text-white rounded shadow-sm font-mono">
                        {item.type === "TIMED" ? "⏱️ Timed" : "🎙️ Live"}
                    </span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-black text-[#1F1F1F] leading-snug line-clamp-2 mb-3 group-hover:text-[#C9653B] transition-colors min-h-[40px] uppercase tracking-wide">
                        {item.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-3 border-t border-[#E6E0DA]/60 pt-3 mb-4">
                        <div className="flex flex-col justify-center">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[#6B6B6B] mb-0.5">
                                Current Position
                            </span>
                            <span className="text-sm font-black text-[#1F1F1F] font-mono">
                                {item.currency} {item.currentBid.toLocaleString()}
                            </span>
                        </div>

                        <div className="bg-[#FFF9F4] border border-[#E6E0DA] rounded-lg py-1 px-2 flex flex-col justify-center items-center text-center">
                            <span className="text-[8px] uppercase font-black tracking-wider text-[#6B6B6B] mb-0.5">
                                {timerLabel}
                            </span>

                            {timerLabel !== "CONCLUDED" && timerLabel !== "TBD" ? (
                                <div className="flex items-center gap-1 text-[#1F1F1F] font-mono text-[10px] font-bold">
                                    {timeLeft.days > 0 && (
                                        <div className="flex items-baseline">
                                            <span>{pad(timeLeft.days)}</span>
                                            <span className="text-[8px] text-[#6B6B6B] font-sans ml-0.5">d</span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline">
                                        <span>{pad(timeLeft.hours)}</span>
                                        <span className="text-[8px] text-[#6B6B6B] font-sans ml-0.5">h</span>
                                    </div>
                                    <div className="flex items-baseline">
                                        <span>{pad(timeLeft.minutes)}</span>
                                        <span className="text-[8px] text-[#6B6B6B] font-sans ml-0.5">m</span>
                                    </div>
                                    <div className="flex items-baseline text-[#C9653B]">
                                        <span>{pad(timeLeft.seconds)}</span>
                                        <span className="text-[8px] font-sans ml-0.5">s</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[9px] font-black uppercase text-[#6B6B6B] tracking-wide">
                                    {timerLabel === "TBD" ? "Awaiting" : "Closed"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-[#E6E0DA]/40">
                    <button
                        onClick={() => navigate(`/auctions/${item.auctionItemId}`)}
                        className="col-span-4 bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        View Auction
                    </button>

                    <button
                        onClick={handleDeleteAction}
                        disabled={isDeleting}
                        title="Remove from Watchlist"
                        className="col-span-1 bg-white hover:bg-red-50 border border-[#E6E0DA] hover:border-red-200 text-[#6B6B6B] hover:text-red-600 rounded-lg transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WatchlistCard;