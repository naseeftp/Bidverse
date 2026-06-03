import React, { useState, useEffect } from "react";
import type{ AuctionItemListDTO } from "../../types/auctionItem.dto";

interface AuctionCardProps {
    item: AuctionItemListDTO;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ item }) => {
    const primaryImage = item.images?.find(img => img.isPrimary) || item.images?.[0];

    const [liveBadge, setLiveBadge] = useState<{ label: string; bg: string; text: string }>({
        label: "Checking Status",
        bg: "bg-[#E6E0DA] text-[#6B6B6B]",
        text: "text-[#6B6B6B]"
    });
    const [timeRemainingStr, setTimeRemainingStr] = useState<string>("Initializing...");

    useEffect(() => {
        if (!item.startTime || !item.endTime) {
            setLiveBadge({ label: "Scheduled", bg: "bg-amber-50 text-amber-700 border border-amber-200", text: "text-amber-700" });
            setTimeRemainingStr("TBD");
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const start = new Date(item.startTime).getTime();
            const end = new Date(item.endTime).getTime();

            if (now < start) {
                setLiveBadge({ 
                    label: "Upcoming", 
                    bg: "bg-amber-50 text-amber-700 border border-amber-200", 
                    text: "text-amber-700" 
                });
                const diff = start - now;
                setTimeRemainingStr(`Starts in: ${formatCountdown(diff)}`);
            } else if (now >= start && now <= end) {
                setLiveBadge({ 
                    label: "Live Now", 
                    bg: "bg-emerald-50 text-emerald-700 border border-emerald-200", 
                    text: "text-emerald-700" 
                });
                const diff = end - now;
                setTimeRemainingStr(`Ends in: ${formatCountdown(diff)}`);
            } else {
                setLiveBadge({ 
                    label: "Completed", 
                    bg: "bg-[#6B6B6B]/10 text-[#6B6B6B] border border-[#E6E0DA]", 
                    text: "text-[#6B6B6B]" 
                });
                setTimeRemainingStr("Auction Concluded");
            }
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [item.startTime, item.endTime]);

    const pad = (num: number) => String(num).padStart(2, '0');

    const formatCountdown = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
        }
        if (hours > 0) {
            return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
        }
        return `${pad(minutes)}m ${pad(seconds)}s`;
    };

    const getSystemStatusStyles = (status: string) => {
        switch (status) {
            case "SOLD":
                return "text-emerald-700 bg-emerald-50/60 border-emerald-200";
            case "PASSED":
                return "text-[#6B6B6B] bg-[#FFF9F4] border-[#E6E0DA]";
            case "SCHEDULED":
            default:
                return "text-[#C9653B] bg-[#FFF9F4] border-[#E6E0DA]";
        }
    };

    return (
        <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
            
            <div className="relative aspect-[16/10] bg-[#FFF9F4] overflow-hidden border-b border-[#E6E0DA]/40">
                {primaryImage?.url ? (
                    <img
                        src={primaryImage.url}
                        alt={primaryImage.altText || item.auctionName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B6B]/40">
                        No Assets Attached
                    </div>
                )}
                
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm backdrop-blur-md ${liveBadge.bg} ${liveBadge.text}`}>
                        {liveBadge.label}
                    </span>
                    
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#1F1F1F] text-white rounded-md shadow-sm">
                        {item.type === "TIMED" ? "⏱️ Timed Auction" : "🎙️ Live Stream"}
                    </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8 flex items-center gap-1.5 text-white">
                    <svg className="w-3.5 h-3.5 text-[#C9653B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold font-mono tracking-wide drop-shadow-sm">
                        {timeRemainingStr}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] font-medium mb-2">
                        <svg className="w-3.5 h-3.5 text-[#C9653B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{item.auctionHouseName}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#1F1F1F] leading-snug line-clamp-2 group-hover:text-[#C9653B] transition-colors mb-4">
                        {item.auctionName}
                    </h3>
                </div>

                <div className="border-t border-[#E6E0DA]/60 pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] uppercase font-bold tracking-wider text-[#6B6B6B] mb-0.5">System Status</p>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wide rounded border ${getSystemStatusStyles(item.auctionStatus)}`}>
                            {item.auctionStatus}
                        </span>
                    </div>

                    <button className="bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-sm focus:outline-none">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionCard;