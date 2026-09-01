import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AuctionItemDetailDTO } from "../../types/auctionItem.dto";
import toast from "react-hot-toast";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import type { LiveAuctionStateResponseDTO } from "../../types/liveState.dto";
import liveService from "../../services/liveService";
import { getSocket } from "../../services/socket.service";


interface StreamLog {
    id: string;
    message: string;
    timestamp: string;
}
const TenantAuctionControllPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [starting, setStarting] = useState<boolean>(false);
    const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null);
    const [liveState, setLiveState] = useState<LiveAuctionStateResponseDTO | null>(null);
    const navigate = useNavigate();
    const [activeViewers, setActiveViewers] = useState<number>(0);
    const [activityLogs, setActivityLogs] = useState<StreamLog[]>([]);

    const fetchAuctionDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [auctionResponse, liveStateResponse] = await Promise.all([
                auctionItemMangementService.getAuction(id),
                liveService.findLiveState(id)
            ]);

            if (auctionResponse.success && auctionResponse.data) {
                setAuction(auctionResponse.data);
            } else {
                toast.error(auctionResponse.message || "Failed to fetch auction details");
            }

            if (liveStateResponse.success && liveStateResponse.data) {
                setLiveState(liveStateResponse.data);
            } else if (!liveStateResponse.success) {
                toast.error(liveStateResponse.message || "Failed to fetch live state");
            }
        } catch {
            toast.error("Failed to load auction control panel");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAuctionDetails();
    }, [fetchAuctionDetails]);

      const handleStartAuction = async () => {
        if (!id) return;
        setStarting(true);
        try {
          const response = await liveService.startLive(id);
          if (response.success) {
            toast.success(response.message);
            fetchAuctionDetails();
          } else {
            toast.error(response.message);
          }
        } catch {
          toast.error("An error occurred while starting the auction");
        } finally {
          setStarting(false);
        }
      };
    useEffect(() => {
        if (!id) return;
        const socket = getSocket();
        if (!socket.connected) {
            socket.connect()
        };
        
        const handleUserJoined = (data: { auctionItemId: string; userId: string; userName: string; activeCount: number }) => {
            if (data.auctionItemId !== id) return;

            setActiveViewers(data.activeCount);
            const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

            setActivityLogs((prev) => [
                {
                    id: Math.random().toString(),
                    message: `${data.userName} joined the room`,
                    timestamp: timeString
                },
                ...prev.slice(0, 19)
            ]);
        };

        const handleUserLeft = (data: { auctionItemId: string; userId: string; userName: string; activeCount: number }) => {
            if (data.auctionItemId !== id) return;

            setActiveViewers(data.activeCount);
            const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

            setActivityLogs((prev) => [
                {
                    id: Math.random().toString(),
                    message: `${data.userName} left the room`,
                    timestamp: timeString
                },
                ...prev.slice(0, 19)
            ]);
        };
        socket.off("auction:user_joined");
        socket.off("auction:user_left");
        socket.on("auction:user_joined", handleUserJoined);
        socket.on("auction:user_left", handleUserLeft);
         
        socket.emit('auction:join', id)
        return () => {
            socket.emit("auction:leave", id);
            socket.off("auction:user_joined", handleUserJoined);
            socket.off("auction:user_left", handleUserLeft);
        };
    }, [id])

    const formatCurrency = (amount: number, currency: string = "INR") => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#2F6FED] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#475569] font-medium text-sm">Loading Control Console...</p>
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] p-8 flex items-center justify-center">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-md text-center shadow-sm">
                    <h2 className="text-[#0F172A] text-xl font-bold mb-2">Auction Not Found</h2>
                    <p className="text-[#475569] text-sm mb-6">
                        The requested auction catalog details could not be retrieved.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-[#2F6FED] hover:bg-[#2558c4] text-white font-medium py-2.5 px-4 rounded-xl transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FB] text-[#0F172A] font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT SIDE: Item Overview & Parameters */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#475569]">
                                        <span>{auction.auctionHouse?.name || "Tenant Console"}</span>
                                        <span>•</span>
                                        <span>ID: {auction.auctionItemId || id}</span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                                        {auction.title}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-[#475569]">Status:</span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2F6FED] border border-blue-200">
                                        {auction.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <div className="w-full h-44 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] overflow-hidden flex items-center justify-center">
                                        {auction.images && auction.images.length > 0 ? (
                                            <img
                                                src={typeof auction.images[0] === "string" ? auction.images[0] : (auction.images[0] as any)?.url}
                                                alt={auction.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-[#475569] text-xs font-medium text-center p-4">
                                                No Image Available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                                    <div>
                                        <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                                            Description
                                        </span>
                                        <p className="mt-1 text-sm text-[#475569] leading-relaxed break-words">
                                            {auction.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-xs text-[#475569]">Auction Type</span>
                                            <span className="text-sm font-semibold text-[#0F172A]">{auction.type}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-[#475569]">Currency</span>
                                            <span className="text-sm font-semibold text-[#0F172A]">{auction.currency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LIVE CONTROL CONSOLE SECTION */}
                            <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                                        Live Control Console
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            {liveState?.status === "WAITING" && (
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            )}
                                            <span
                                                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveState?.status === "WAITING"
                                                        ? "bg-amber-500"
                                                        : liveState?.status === "LIVE"
                                                            ? "bg-emerald-500"
                                                            : "bg-gray-400"
                                                    }`}
                                            ></span>
                                        </span>
                                        <span className="text-xs font-semibold text-[#475569]">
                                            Room: {liveState?.status || "UNKNOWN"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F7FB] p-4 rounded-xl border border-[#E2E8F0] items-center">
                                    <div className="space-y-1">
                                        <span className="block text-xs font-medium text-[#475569]">Live State ID</span>
                                        <span className="block text-xs font-mono font-semibold text-[#0F172A] truncate">
                                            {liveState?.liveStateId || "N/A"}
                                        </span>
                                    </div>

                                    <div>
                                        {liveState?.status === "WAITING" && (
                                            <button
                                                onClick={handleStartAuction}
                                                disabled={starting}
                                                className="w-full bg-[#2F6FED] hover:bg-[#2458c7] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {starting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Starting Auction...</span>
                                                    </>
                                                ) : (
                                                    <span>Start Auction</span>
                                                )}
                                            </button>
                                        )}

                                        {liveState?.status === "LIVE" && (
                                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                                                Auction is Currently Active
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
                                Financial & Bidding Parameters
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                                    <span className="block text-xs text-[#475569] mb-1">Starting Price</span>
                                    <span className="text-base font-bold text-[#0F172A]">
                                        {formatCurrency(auction.startingPrice, auction.currency)}
                                    </span>
                                </div>

                                <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                                    <span className="block text-xs text-[#475569] mb-1">Reserve Price</span>
                                    <span className="text-base font-bold text-[#0F172A]">
                                        {formatCurrency(auction.reservePrice, auction.currency)}
                                    </span>
                                </div>

                                <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                                    <span className="block text-xs text-[#475569] mb-1">Min Increment</span>
                                    <span className="text-base font-bold text-[#0F172A]">
                                        {formatCurrency(auction.minimumIncrement, auction.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Real-Time Presence & Stream Logs */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm sticky top-6 space-y-6">

                            {/* LIVE PARTICIPANT COUNTER */}
                            <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2F6FED] flex items-center justify-center font-bold text-lg">
                                        👥
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-[#475569]">Active Viewers</span>
                                        <span className="text-2xl font-extrabold text-[#0F172A]">{activeViewers}</span>
                                    </div>
                                </div>
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            </div>

                            {/* ROOM ACTIVITY STREAM */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                                    Presence Log Stream
                                </h3>
                                <div className="h-64 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] p-3 overflow-y-auto text-xs space-y-2">
                                    {activityLogs.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-[#475569]">
                                            Waiting for participant activity...
                                        </div>
                                    ) : (
                                        activityLogs.map((log) => (
                                            <div key={log.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#E2E8F0]">
                                                <span className="text-[#0F172A] font-medium">{log.message}</span>
                                                <span className="text-[10px] text-[#475569]">{log.timestamp}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TenantAuctionControllPage;