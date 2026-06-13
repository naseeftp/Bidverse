import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { AuctionItemListDTO } from "../../types/auctionItem.dto";
import watchListService from "../../services/watchList.service";
import toast from "react-hot-toast";
import { incrementWatchlistCount } from "../../redux/user/auth.slice";
import { useAppDispatch } from "../../hooks/redux.hooks";

interface AuctionCardProps {
    item: AuctionItemListDTO;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ item }) => {
    const primaryImage = item.images?.find(img => img.isPrimary) || item.images?.[0];
    const navigate = useNavigate()
    const dispatch=useAppDispatch()
    const [timerLabel, setTimerLabel] = useState<string>("INITIALIZING...");
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [liveBadge, setLiveBadge] = useState<{ label: string; bg: string; text: string }>({
        label: "Checking Status",
        bg: "bg-[#E6E0DA] text-[#6B6B6B]",
        text: "text-[#6B6B6B]"
    });
    const [isWatched, setIsWathed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const handleWatchlistAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (isLoading ) return;
        try {
            setIsLoading(true);
            const response = await watchListService.addToWatchList(item.auctionItemId)
            if (response.success) {
                toast.success(response.message)
                setIsWathed(true)
                dispatch(incrementWatchlistCount())
            }
            else {
                toast.error(response.message)
            }
        } catch {
            toast.error('failed to add Watchlist')
        }
        finally {
            setIsLoading(false);
        }
 };


    useEffect(() => {
        if (!item.startTime || !item.endTime) {
            setLiveBadge({ label: "Scheduled", bg: "bg-amber-50 text-amber-700 border border-amber-200", text: "text-amber-700" });
            setTimerLabel("TBD");
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(item.startTime).getTime();
            const end = new Date(item.endTime).getTime();
            let targetTime = start;

            if (now < start) {
                setTimerLabel("STARTS IN");
                setLiveBadge({
                    label: "Upcoming",
                    bg: "bg-amber-50 text-amber-700 border border-amber-200",
                    text: "text-amber-700"
                });
                targetTime = start;
            } else if (now >= start && now < end) {
                setTimerLabel("ENDS IN");
                setLiveBadge({
                    label: "Live Now",
                    bg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                    text: "text-emerald-700"
                });
                targetTime = end;
            } else {
                setTimerLabel("CONCLUDED");
                setLiveBadge({
                    label: "Completed",
                    bg: "bg-[#6B6B6B]/10 text-[#6B6B6B] border border-[#E6E0DA]",
                    text: "text-[#6B6B6B]"
                });
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const difference = targetTime - now;
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [item]);

    const pad = (num: number) => String(num).padStart(2, "0");

    return (
        <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col w-full max-w-[360px] mx-auto group">

            <div className="relative aspect-[21/9] bg-[#FFF9F4] overflow-hidden border-b border-[#E6E0DA]/40">
                {primaryImage?.url ? (
                    <img
                        src={primaryImage.url}
                        alt={primaryImage.altText || item.auctionName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#6B6B6B]/40">
                        No Assets Attached
                    </div>
                )}

                <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md shadow-sm backdrop-blur-md ${liveBadge.bg} ${liveBadge.text}`}>
                        {liveBadge.label}
                    </span>
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#1F1F1F] text-white rounded-md shadow-sm">
                        {item.type === "TIMED" ? "⏱️ Timed" : "🎙️ Live"}
                    </span>
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-1 text-[10px] text-[#6B6B6B] font-medium mb-0.5">
                        <svg className="w-2.5 h-2.5 text-[#C9653B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{item.auctionHouseName}</span>
                    </div>

                    <h3 className="text-xs font-bold text-[#1F1F1F] leading-snug line-clamp-2 group-hover:text-[#C9653B] transition-colors mb-2 h-9">
                        {item.auctionName}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 border-t border-[#E6E0DA]/40 pt-2 mb-3">
                        <div className="flex flex-col justify-center">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-[#6B6B6B] mb-0.5">
                                Starting Price
                            </span>
                            <span className="text-xs font-black text-[#1F1F1F]">
                                {item.startingPrice ? `$${item.startingPrice.toLocaleString()}` : "TBD"}
                            </span>
                        </div>

                        <div className="bg-[#FFF9F4] border border-[#E6E0DA]/60 rounded-md py-1 px-1.5 flex flex-col justify-center items-center text-center">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-[#6B6B6B] mb-0.5">
                                {timerLabel}
                            </span>

                            {timerLabel !== "CONCLUDED" && timerLabel !== "TBD" ? (
                                <div className="flex items-center gap-1 text-[#1F1F1F] font-mono text-[10px] font-bold">
                                    {timeLeft.days > 0 && (
                                        <div><span>{pad(timeLeft.days)}</span><span className="text-[9px] text-[#6B6B6B] font-sans ml-0.5">d</span></div>
                                    )}
                                    <div><span>{pad(timeLeft.hours)}</span><span className="text-[9px] text-[#6B6B6B] font-sans ml-0.5">h</span></div>
                                    <div><span>{pad(timeLeft.minutes)}</span><span className="text-[9px] text-[#6B6B6B] font-sans ml-0.5">m</span></div>
                                    <div className="text-[#C9653B]"><span>{pad(timeLeft.seconds)}</span><span className="text-[9px] font-sans ml-0.5">s</span></div>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-[#6B6B6B] tracking-wide">
                                    {timerLabel === "TBD" ? "Awaiting" : "Closed"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E6E0DA]/50">
                    {item.type == 'TIMED' ?
                        (
                            <button
                                disabled={timerLabel === "CONCLUDED" || timerLabel == 'STARTS IN'}
                                className="w-full bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-bold text-[11px] py-1.5 rounded-md transition-colors shadow-sm focus:outline-none disabled:bg-[#E6E0DA] disabled:text-[#6B6B6B] disabled:cursor-not-allowed"
                            >
                                {timerLabel === 'ENDS IN' ? 'Start Bidding' : 'Wait For Bidding'}
                            </button>
                        )
                        : (
                            <button
                                disabled={timerLabel === "CONCLUDED" || timerLabel == 'ENDS IN'}
                                className="w-full bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-bold text-[11px] py-1.5 rounded-md transition-colors shadow-sm focus:outline-none disabled:bg-[#E6E0DA] disabled:text-[#6B6B6B] disabled:cursor-not-allowed"
                            >
                                Book Your slot
                            </button>

                        )


                    }

                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => navigate(`/auctions/${item.auctionItemId}`)}
                            className="w-full bg-white hover:bg-[#FFF9F4] border border-[#E6E0DA] text-[#1F1F1F] font-bold text-[10px] py-1 rounded-md transition-all focus:outline-none">
                            Details
                        </button>

                        <button
                            onClick={handleWatchlistAction}
                            disabled={isLoading }
                            className="w-full bg-white hover:bg-[#FFF9F4] border border-[#E6E0DA] text-[#C9653B] hover:text-[#C9653B]/90 font-bold text-[10px] py-1 rounded-md transition-all focus:outline-none flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {isWatched ? "Watched" : "Watchlist"}                    </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuctionCard;