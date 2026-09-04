import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AuctionItemDetailDTO } from "../../types/auctionItem.dto";
import type { LiveAuctionStateResponseDTO } from "../../types/liveState.dto";
import toast from "react-hot-toast";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import liveService from "../../services/liveService";
import { getSocket } from "../../services/socket.service";

interface StreamLog {
  id: string;
  message: string;
  timestamp: string;
  type?: "JOIN" | "LEAVE" | "BID" | "ROUND" | "SYSTEM";
}

interface BidLog {
  id: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

const getRoundConfig = (r: number) => {
  switch (r) {
    case 1:
      return { label: "Going Once", badgeBg: "bg-blue-50 border-blue-200 text-blue-700" };
    case 2:
      return { label: "Going Twice", badgeBg: "bg-amber-50 border-amber-200 text-amber-700" };
    case 3:
    default:
      return { label: "Final Call", badgeBg: "bg-rose-50 border-rose-200 text-rose-700" };
  }
};

const TenantAuctionControllPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);
  const [pausing,setPausing]=useState<boolean>(false);
  const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null);
  const [liveState, setLiveState] = useState<LiveAuctionStateResponseDTO | null>(null);

  const [activeViewers, setActiveViewers] = useState<number>(0);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [highestBidder, setHighestBidder] = useState<string>("No Bids Yet");
  const [bidsHistory, setBidsHistory] = useState<BidLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<StreamLog[]>([]);

  const [round, setRound] = useState<number>(1);
  const [roundEndsAt, setRoundEndsAt] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  const fallbackTriggeredRef = useRef(false);

  const isLive = liveState?.status === "LIVE";
  const isWaiting = liveState?.status === "WAITING";
  const isEnded = liveState?.status === "ENDED";
  const isProcessingRound = isLive && timeLeftMs === 0 && !!roundEndsAt;

  const reserveMet = currentBid >= (auction?.reservePrice || 0);
  const currentRoundConfig = getRoundConfig(round);

  const getFormattedTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, "0");
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const addActivityLog = useCallback((message: string, type: StreamLog["type"] = "SYSTEM") => {
    setActivityLogs((prev) => [
      { id: Math.random().toString(), message, timestamp: getFormattedTime(), type },
      ...prev.slice(0, 24),
    ]);
  }, []);

  const fetchAuctionDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [auctionResponse, liveStateResponse] = await Promise.all([
        auctionItemMangementService.getAuction(id),
        liveService.findLiveState(id),
      ]);

      if (auctionResponse.success && auctionResponse.data) {
        const item: AuctionItemDetailDTO = auctionResponse.data;
        setAuction(item);
        setCurrentBid(item.currentHighestBid || item.startingPrice || 0);
        if (item.highestBidder?.name) {
          setHighestBidder(item.highestBidder.name);
        }
      } else {
        toast.error(auctionResponse.message || "Failed to fetch auction details");
      }

      if (liveStateResponse.success && liveStateResponse.data) {
        const state: LiveAuctionStateResponseDTO = liveStateResponse.data;
        setLiveState(state);

        if (state.currentRound) {
          setRound(state.currentRound);
        }
        if (state.roundsEndsAt) {
          setRoundEndsAt(new Date(state.roundsEndsAt).getTime());
        } else {
          setRoundEndsAt(null);
        }
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


  useEffect(() => {
    if (!isLive || isEnded || !roundEndsAt) {
      setTimeLeftMs(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, roundEndsAt - Date.now());
      setTimeLeftMs(remaining);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [isLive, isEnded, roundEndsAt]);


  useEffect(() => {
    if (!isLive || isEnded || !roundEndsAt) return;
    if (timeLeftMs !== 0) {
      fallbackTriggeredRef.current = false;
      return;
    }
    if (fallbackTriggeredRef.current) return;

    fallbackTriggeredRef.current = true;
    const timeout = setTimeout(async () => {
      if (!id) return;
      const res = await liveService.findLiveState(id);
      if (res.success && res.data) {
        setLiveState(res.data);
        if (res.data.currentRound) setRound(res.data.currentRound);
        setRoundEndsAt(res.data.roundsEndsAt ? new Date(res.data.roundsEndsAt).getTime() : null);
        fallbackTriggeredRef.current = false;
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, [timeLeftMs, isLive, isEnded, roundEndsAt, id]);

  const handleStartAuction = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const response = await liveService.startLive(id);
      if (response.success) {
        toast.success(response.message || "Auction started successfully");
        setLiveState((prev) => (prev ? { ...prev, status: "LIVE" } : prev));
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("An error occurred while starting the auction");
    } finally {
      setStarting(false);
    }
  };
  const handlePauseAuction=async()=>{
    if(!id) return
    setPausing(true);
   try {
    const response=await liveService.pauseLive(id);
    if(response.success&&response.data){
      toast.success(response.message)
    }
    else{
      toast.error(response.message)
    }
   } catch {
    toast.error('Failed to Pause Auction')
   }finally{
    setPausing(false)
   }
  }



  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const handleUserJoined = (data: { auctionItemId: string; userName: string; activeCount: number }) => {
      if (data.auctionItemId !== id) return;
      setActiveViewers(data.activeCount);
      addActivityLog(`${data.userName} joined the room`, "JOIN");
    };

    const handleUserLeft = (data: { auctionItemId: string; userName: string; activeCount: number }) => {
      if (data.auctionItemId !== id) return;
      setActiveViewers(data.activeCount);
      addActivityLog(`${data.userName} left the room`, "LEAVE");
    };

    const handleAuctionStarted = (data: {
      auctionItemId: string;
      round?: number;
      roundEndsAt?: string;
      endTime?: string;
    }) => {
      if (data.auctionItemId !== id) return;
      fallbackTriggeredRef.current = false;
      setLiveState((prev) => (prev ? { ...prev, status: "LIVE" } : prev));

      if (data.round) setRound(data.round);
      const targetEnd = data.roundEndsAt || data.endTime;
      if (targetEnd) {
        setRoundEndsAt(new Date(targetEnd).getTime());
      }

      addActivityLog("Auction is officially LIVE", "SYSTEM");
    };

    const handlePauseCallBack=(data:{
    auctionItemId:string
    })=>{
       if(data.auctionItemId!==id) return;
       setLiveState((prev)=>(prev?{...prev,status:'PAUSED'}:prev));
       setRound(1)
       addActivityLog('Auction Paused Resume to continue')
    }


    const handleRoundChanged = (data: { auctionItemId: string; round: number; roundEndsAt: string }) => {
      if (data.auctionItemId !== id) return;
      fallbackTriggeredRef.current = false;
      setRound(data.round);
      setRoundEndsAt(new Date(data.roundEndsAt).getTime());
      addActivityLog(`Round ${data.round} started — ${getRoundConfig(data.round).label}`, "ROUND");
    };

    const applyBid = (bidderName: string, amount: number, timestampIso?: string, newEndTime?: string) => {
      setCurrentBid(amount);
      setHighestBidder(bidderName);
      fallbackTriggeredRef.current = false;

      if (newEndTime) {
        setRoundEndsAt(new Date(newEndTime).getTime());
      }

      const bidTime = timestampIso
        ? new Date(timestampIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : getFormattedTime();

      setBidsHistory((prev) => [
        { id: Math.random().toString(), bidderName, amount, timestamp: bidTime },
        ...prev.slice(0, 19),
      ]);

      setActivityLogs((prev) => [
        {
          id: Math.random().toString(),
          message: `${bidderName} placed a bid of ${formatCurrency(amount, auction?.currency)}`,
          timestamp: bidTime,
          type: "BID",
        },
        ...prev.slice(0, 24),
      ]);
    };

  
    const handleBidPlaced = (data: {
      auctionItemId: string;
      amount: number;
      bidderName: string;
      timestamp?: string;
      newEndTime?: string;
    }) => {
      if (data.auctionItemId !== id) return;
      applyBid(data.bidderName, data.amount, data.timestamp, data.newEndTime);
    };


    const handleBidNew = (data: { auctionItemId: string; amount: number; bidderId: string; newEndTime?: string }) => {
      if (data.auctionItemId !== id) return;
      applyBid(`Bidder #${data.bidderId.slice(-4)}`, data.amount, undefined, data.newEndTime);
    };

    const handleAuctionEnded = (data: { auctionItemId: string; winningBid?: number; winnerName?: string }) => {
      if (data.auctionItemId !== id) return;
      setLiveState((prev) => (prev ? { ...prev, status: "ENDED" } : prev));
      setRoundEndsAt(null);
      setTimeLeftMs(0);

      addActivityLog(
        data.winnerName
          ? `Auction ENDED. Winner: ${data.winnerName} with ${formatCurrency(data.winningBid || 0, auction?.currency)}`
          : "Auction ENDED with no winner.",
        "SYSTEM"
      );
    };

    const handleSocketError = (d: { error?: string }) => {
      if (d?.error) toast.error(d.error);
    };

    socket.off("auction:user_joined");
    socket.off("auction:user_left");
    socket.off("auction:started");
    socket.off("auction:round");
    socket.off("auction:bid_placed");
    socket.off("bid:new");
    socket.off("auction:ended");
    socket.off("auction:error");
    socket.off('auction:paused');

    socket.on("auction:user_joined", handleUserJoined);
    socket.on("auction:user_left", handleUserLeft);
    socket.on("auction:started", handleAuctionStarted);
    socket.on("auction:round", handleRoundChanged);
    socket.on("auction:bid_placed", handleBidPlaced);
    socket.on("bid:new", handleBidNew);
    socket.on("auction:ended", handleAuctionEnded);
    socket.on("auction:error", handleSocketError);
    socket.on('auction:paused',handlePauseCallBack)
    socket.emit("auction:join", id);

    return () => {
      socket.emit("auction:leave", id);
      socket.off("auction:user_joined", handleUserJoined);
      socket.off("auction:user_left", handleUserLeft);
      socket.off("auction:started", handleAuctionStarted);
      socket.off("auction:round", handleRoundChanged);
      socket.off("auction:bid_placed", handleBidPlaced);
      socket.off("bid:new", handleBidNew);
      socket.off("auction:ended", handleAuctionEnded);
      socket.off("auction:error", handleSocketError);
      socket.off('auction:paused',handlePauseCallBack)
    };
  }, [id, auction?.currency, addActivityLog]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Loading Control Console...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <h2 className="text-slate-900 text-xl font-bold mb-2">Auction Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">
            The requested auction catalog details could not be retrieved.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-slate-900 hover:bg-black text-white font-medium py-2.5 px-4 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const primaryImage =
    auction.images.find((img) => img.isPrimary)?.url || auction.images[0]?.url;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

  
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>{auction.auctionHouse?.name || "Tenant Live Control"}</span>
              <span>•</span>
              <span>ID: {auction.auctionItemId || id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {auction.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="relative flex h-2.5 w-2.5">
                {isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                {isWaiting && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isLive ? "bg-emerald-500" : isWaiting ? "bg-amber-500" : "bg-slate-400"
                  }`}
                ></span>
              </span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {liveState?.status || "UNKNOWN"}
              </span>
            </div>

            {isWaiting && (
              <button
                onClick={handleStartAuction}
                disabled={starting}
                className="bg-slate-900 hover:bg-black text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting...</span>
                  </>
                ) : (
                  <span>Start Auction</span>
                )}
              </button>
            )}
            {isLive&&(
              <button
                onClick={handlePauseAuction}
                disabled={pausing}
                className="bg-slate-900 hover:bg-black text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {pausing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>pausing...</span>
                  </>
                ) : (
                  <span>Pause Auction</span>
                )}
              </button>
            )}
          </div>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Current Highest Bid
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {formatCurrency(currentBid, auction.currency)}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        reserveMet
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {reserveMet ? "Reserve Met" : "Reserve Pending"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Top Bidder:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                      {highestBidder}
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      {isLive ? "Time Remaining" : "Auction Status"}
                    </span>
                    {isLive && !isEnded && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentRoundConfig.badgeBg}`}
                      >
                        {isProcessingRound ? "Transitioning..." : currentRoundConfig.label} · Round {round}/3
                      </span>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900">
                    {isLive
                      ? formatCountdown(timeLeftMs)
                      : isEnded
                      ? "00:00:00"
                      : "Awaiting Start"}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Min Increment:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(auction.minimumIncrement, auction.currency)}
                    </span>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-1">
                  <div className="w-full h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={auction.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-500 text-xs font-medium">No Image</span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Description
                    </span>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {auction.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">Starting:</span>{" "}
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(auction.startingPrice, auction.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Reserve:</span>{" "}
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(auction.reservePrice, auction.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Buyer Premium:</span>{" "}
                      <span className="font-semibold text-slate-900">
                        {auction.buyerPremiumPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Live Bid Placement Stream
                </h2>
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {bidsHistory.length} Bids Recorded
                </span>
              </div>

              <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 p-3 overflow-y-auto space-y-2">
                {bidsHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                    <span className="text-base">🔨</span>
                    <span>No live bids placed yet. Waiting for incoming bids...</span>
                  </div>
                ) : (
                  bidsHistory.map((bid, idx) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        idx === 0
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-900 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            idx === 0
                              ? "bg-slate-800 text-white border-slate-700"
                              : "bg-slate-100 text-slate-900 border-slate-200"
                          }`}
                        >
                          #{bidsHistory.length - idx}
                        </div>
                        <div>
                          <span className="block text-xs font-bold">
                            {bid.bidderName}
                          </span>
                          <span
                            className={`block text-[10px] ${
                              idx === 0 ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {bid.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-extrabold ${
                            idx === 0 ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(bid.amount, auction.currency)}
                        </span>
                        {idx === 0 && (
                          <span className="block text-[10px] font-bold text-emerald-400">
                            Highest Bid
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-6">

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-lg">
                    👥
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">
                      Active Viewers
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900">
                      {activeViewers}
                    </span>
                  </div>
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Presence Log Stream
                </h3>
                <div className="h-80 rounded-xl bg-slate-50 border border-slate-200 p-3 overflow-y-auto text-xs space-y-2">
                  {activityLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Waiting for participant activity...
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                          log.type === "BID"
                            ? "bg-slate-100 border-slate-300"
                            : log.type === "ROUND"
                            ? "bg-blue-50 border-blue-200"
                            : log.type === "SYSTEM"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900 font-medium break-words">
                            {log.message}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {log.timestamp}
                          </span>
                        </div>
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