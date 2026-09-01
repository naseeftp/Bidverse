import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AuctionItemDetailDTO } from "../../types/auctionItem.dto";
import toast from "react-hot-toast";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import type { LiveAuctionStateResponseDTO } from "../../types/liveState.dto";
import liveService from "../../services/liveService";
import { getSocket } from "../../services/socket.service";

const LiveRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null);
    const [liveState, setLiveState] = useState<LiveAuctionStateResponseDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [customBid, setCustomBid] = useState<string>("");

    const fetchAuctionDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setAuction(null);
        setLiveState(null);

        try {
            const [auctionResponse, liveStateResponse] = await Promise.all([
                auctionItemMangementService.getAuction(id),
                liveService.findLiveState(id)
            ]);

            if (auctionResponse.success && auctionResponse.data) {
                setAuction(auctionResponse.data);
            } else {
                toast.error(auctionResponse.message || "Failed to load item details");
            }

            if (liveStateResponse.success && liveStateResponse.data) {
                setLiveState(liveStateResponse.data);
            } else {
                toast.error(liveStateResponse.message || "Failed to load live state");
            }
        } catch {
            toast.error("Failed to join live room");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if(!id) return
        fetchAuctionDetails();
        const socket=getSocket();
        if(!socket.connected){
            socket.connect()
        }
        socket.emit('auction:join',id)
        return ()=>{
            socket.emit('auction:leave',id)
        }
    }, [fetchAuctionDetails,id]);

    const formatCurrency = (amount?: number | null, currency: string = "INR") => {
        if (amount === null || amount === undefined) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const isWaiting = liveState?.status === "WAITING";
    const minIncrement = auction?.minimumIncrement ?? 0;
    const currentHighest = auction?.currentHighestBid || auction?.startingPrice || 0;
    const nextMinBid = currentHighest + minIncrement;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#6B6B6B] font-medium text-sm">Entering Live Auction Room...</p>
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen bg-[#FFF9F4] p-8 flex items-center justify-center">
                <div className="bg-white border border-[#E6E0DA] rounded-2xl p-8 max-w-md text-center shadow-sm">
                    <h2 className="text-[#1F1F1F] text-xl font-bold mb-2">Auction Room Unavailable</h2>
                    <p className="text-[#6B6B6B] text-sm mb-6">
                        Unable to locate live room details for this auction item.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-[#C9653B] hover:bg-[#b0552f] text-white font-medium py-2.5 px-4 rounded-xl transition-all"
                    >
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF9F4] text-[#1F1F1F] font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex items-center justify-between pb-2 border-b border-[#E6E0DA]">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1F1F1F] flex items-center gap-1 transition-colors"
                    >
                        ← Leave Room
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                        {auction.auctionHouse?.name || "Live Slot Room"}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-7 space-y-6">

                        <div className="bg-white rounded-2xl border border-[#E6E0DA] p-6 shadow-sm space-y-5">

                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-[#1F1F1F]">
                                        {auction.title}
                                    </h1>
                                    <p className="text-xs text-[#6B6B6B] mt-0.5">Item ID: {auction.auctionItemId}</p>
                                </div>

                                {isWaiting ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF7E0] text-[#B06000] border border-amber-200">
                                        • Waiting to Start
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#137333] border border-green-200">
                                        • Live Bidding Active
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5 items-center">
                                <div className="w-full sm:w-44 h-44 rounded-xl bg-[#FFF9F4] border border-[#E6E0DA] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {auction.images && auction.images.length > 0 ? (
                                        <img
                                            src={typeof auction.images[0] === "string" ? auction.images[0] : (auction.images[0] as any)?.url}
                                            alt={auction.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs text-[#6B6B6B]">No Image</span>
                                    )}
                                </div>

                                <div className="w-full space-y-3">
                                    <p className="text-xs text-[#6B6B6B] line-clamp-3 leading-relaxed">
                                        {auction.description || "No description provided for this item."}
                                    </p>

                                    <div className="pt-2 border-t border-[#E6E0DA] grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="block text-[#6B6B6B]">Starting Price</span>
                                            <span className="font-bold text-[#1F1F1F]">
                                                {formatCurrency(auction.startingPrice, auction.currency)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[#6B6B6B]">Min Increment</span>
                                            <span className="font-bold text-[#1F1F1F]">
                                                +{formatCurrency(auction.minimumIncrement, auction.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl border border-[#E6E0DA] p-6 shadow-sm space-y-6">

                            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0DA]">
                                <h2 className="text-base font-bold text-[#1F1F1F]">Bidding Console</h2>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${isWaiting ? "bg-[#B06000]" : "bg-[#C9653B] animate-pulse"}`}></span>
                                    <span className="text-xs font-semibold text-[#6B6B6B]">
                                        {isWaiting ? "STANDBY" : "LIVE"}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#FFF9F4] p-4 rounded-xl border border-[#E6E0DA] text-center space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                                    Current Highest Bid
                                </span>
                                <div className="text-3xl font-extrabold text-[#C9653B]">
                                    {formatCurrency(currentHighest, auction.currency)}
                                </div>
                                <span className="block text-[11px] text-[#6B6B6B]">
                                    Next minimum valid bid: {formatCurrency(nextMinBid, auction.currency)}
                                </span>
                            </div>

                            {isWaiting ? (
                                <div className="bg-[#FEF7E0] border border-amber-200 rounded-xl p-4 text-center space-y-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-[#B06000] mx-auto flex items-center justify-center font-bold text-sm">
                                        ⏳
                                    </div>
                                    <h3 className="text-sm font-bold text-[#1F1F1F]">Auction Has Not Started</h3>
                                    <p className="text-xs text-[#6B6B6B]">
                                        The host has not launched this slot room yet. Bidding controls will unlock automatically once the live session starts.
                                    </p>
                                    <button
                                        disabled
                                        className="w-full mt-2 bg-[#E6E0DA] text-[#6B6B6B] font-semibold py-3 px-4 rounded-xl cursor-not-allowed text-xs"
                                    >
                                        Bidding Disabled
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setCustomBid(String(nextMinBid))}
                                            className="py-2.5 px-3 rounded-xl border border-[#C9653B] text-[#C9653B] font-semibold text-xs hover:bg-[#FFF9F4] transition-all"
                                        >
                                            + Minimum ({formatCurrency(minIncrement, auction.currency)})
                                        </button>
                                        <button
                                            onClick={() => setCustomBid(String(nextMinBid + minIncrement))}
                                            className="py-2.5 px-3 rounded-xl border border-[#C9653B] text-[#C9653B] font-semibold text-xs hover:bg-[#FFF9F4] transition-all"
                                        >
                                            + 2x Increment
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#6B6B6B]">Enter Custom Bid</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={customBid}
                                                onChange={(e) => setCustomBid(e.target.value)}
                                                placeholder={`Min ${nextMinBid}`}
                                                className="w-full bg-[#FFF9F4] border border-[#E6E6E0] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#C9653B]"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="w-full bg-[#C9653B] hover:bg-[#b0552f] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        Place Bid Now
                                    </button>
                                </div>
                            )}

                            <div className="pt-2 border-t border-[#E6E0DA] space-y-2">
                                <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                                    Live Stream Log
                                </span>
                                <div className="h-28 rounded-xl bg-[#FFF9F4] border border-[#E6E0DA] p-3 text-xs text-[#6B6B6B] flex items-center justify-center">
                                    {isWaiting ? "Waiting for slot initialization..." : "No bids placed yet in this session."}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LiveRoom;