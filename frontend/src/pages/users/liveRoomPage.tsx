import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AuctionItemDetailDTO } from "../../types/auctionItem.dto";
import toast from "react-hot-toast";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import type { LiveAuctionStateResponseDTO } from "../../types/liveState.dto";
import liveService from "../../services/liveService";
import { getSocket } from "../../services/socket.service";
import { useAppSelector } from "../../hooks/redux.hooks";

interface ActivityLog {
  id: string;
  text: string;
  time: string;
  type: "bid" | "round" | "system";
}
type Outcome =
  | { type: "won"; amount: number }
  | { type: "lost"; amount: number }
  | { type: "passed" };

const LiveRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<AuctionItemDetailDTO | null>(null);
  const [liveState, setLiveState] = useState<LiveAuctionStateResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [customBid, setCustomBid] = useState<string>("");

  const [round, setRound] = useState<number>(1);
  const [roundEndsAt, setRoundEndsAt] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [placing, setPlacing] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);


  const fallbackTriggeredRef = useRef(false);
  const currentUserId = useAppSelector((state) => state.auth.user?.userId)

  const isEnded = liveState?.status === "ENDED";
  const isWaiting = liveState?.status === "WAITING";
  const isProcessingRound = timeLeftMs === 0 && !isWaiting && !isEnded;

  const seconds = Math.ceil(timeLeftMs / 1000);

  const getRoundConfig = (r: number) => {
    switch (r) {
      case 1:
        return {
          label: "Going Once",
          badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
          accentColor: "text-blue-600",
          barColor: "bg-blue-600",
        };
      case 2:
        return {
          label: "Going Twice",
          badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
          accentColor: "text-amber-600",
          barColor: "bg-amber-500",
        };
      case 3:
      default:
        return {
          label: "Final Call",
          badgeBg: "bg-rose-50 border-rose-200 text-rose-700",
          accentColor: "text-rose-600",
          barColor: "bg-rose-600",
        };
    }
  };

  const currentRoundConfig = getRoundConfig(round);

  const addLog = useCallback((text: string, type: ActivityLog["type"] = "system") => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [{ id: Math.random().toString(), text, time, type }, ...prev.slice(0, 40)]);
  }, []);

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
        toast.error(auctionResponse.message || "Failed to load item details");
      }

      if (liveStateResponse.success && liveStateResponse.data) {
        setLiveState(liveStateResponse.data);
        setRound(liveStateResponse.data.currentRound);
        setRoundEndsAt(new Date(liveStateResponse.data.roundsEndsAt).getTime());
      } else {
        toast.error(liveStateResponse.message || "Failed to load live state");
      }
    } catch {
      toast.error("Failed to join live room");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleAuctionStarted = useCallback((data: { auctionItemId: string; status?: string }) => {
    if (data.auctionItemId !== id) return;
    setLiveState((prev) => (prev ? { ...prev, status: "LIVE" } : prev));
    addLog("Auction is now live! Bidding opened.", "system");
  }, [id, addLog]);

  const handleBidNew = useCallback((data: { auctionItemId: string; amount: number; bidderId: string }) => {
    if (data.auctionItemId !== id) return;
    setAuction((prev) => (prev ? { ...prev, currentHighestBid: data.amount } : prev));
    addLog(`New highest bid: ₹${data.amount.toLocaleString("en-IN")}`, "bid");
  }, [id, addLog]);

  const handleRound = useCallback((data: { auctionItemId: string; round: number; roundEndsAt: string }) => {
    if (data.auctionItemId !== id) return;
    fallbackTriggeredRef.current = false;
    setRound(data.round);
    setRoundEndsAt(new Date(data.roundEndsAt).getTime());

  }, [id, addLog]);

  const handleEnded = useCallback((data: { auctionItemId: string; status: 'SOLD' | 'PASSED', reserveMet: boolean, winningBidder?: string; winningBid: number }) => {
    if (data.auctionItemId !== id) return;
    setLiveState((prev) => (prev ? { ...prev, status: "ENDED" } : prev));
    setTimeLeftMs(0);
    if (data.status === 'PASSED') {
      setOutcome({ type: 'passed' });
      toast('Item Passed-reserve Price is Not Met,{ icon: "⚠️" }')
      addLog("Auction closed. Reserve price not met — item passed.", "system");
      return
    }
    const isWinner = currentUserId === data.winningBidder;
    if (isWinner) {
      setOutcome({ type: "won", amount: data.winningBid });
      toast.success(`Congratulations! You won at ₹${data.winningBid.toLocaleString("en-IN")}`);
      addLog(`You won the auction at ₹${data.winningBid.toLocaleString("en-IN")}!`, "system");
    }
    else {
      setOutcome({ type: "lost", amount: data.winningBid });
      toast("Item sold. Better luck next time!", { icon: "🙁" });
      addLog(`Auction closed. Sold for ₹${data.winningBid.toLocaleString("en-IN")}`, "system");
    }

  }, [id, addLog]);

  useEffect(() => {
    if (!id) return;
    fetchAuctionDetails();

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("auction:join", id);

    socket.on("auction:started", handleAuctionStarted);
    socket.on("bid:new", handleBidNew);
    socket.on("auction:round", handleRound);
    socket.on("auction:ended", handleEnded);
    socket.on("auction:error", (d) => toast.error(d.error));

    return () => {
      socket.emit("auction:leave", id);
      socket.off("auction:started", handleAuctionStarted);
      socket.off("bid:new", handleBidNew);
      socket.off("auction:round", handleRound);
      socket.off("auction:ended", handleEnded);
    };
  }, [fetchAuctionDetails, id, handleBidNew, handleRound, handleEnded, handleAuctionStarted]);

  useEffect(() => {
    if (!roundEndsAt || isEnded) return;

    const tick = () => {
      const remaining = Math.max(0, roundEndsAt - Date.now());
      setTimeLeftMs(remaining);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [roundEndsAt, isEnded]);

  useEffect(() => {
    if (timeLeftMs === 0 && !isWaiting && !isEnded && !fallbackTriggeredRef.current && roundEndsAt) {
      fallbackTriggeredRef.current = true;
      const timeout = setTimeout(async () => {
        const res = await liveService.findLiveState(id!);
        if (res.success && res.data) {
          setLiveState(res.data);
          setRound(res.data.currentRound);
          setRoundEndsAt(new Date(res.data.roundsEndsAt).getTime());
        }
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [timeLeftMs, isWaiting, isEnded, id, roundEndsAt]);

  const handlePlaceBid = async () => {
    const amount = Number(customBid);
    if (!amount || amount < nextMinBid) {
      toast.error(`Bid must be at least ${nextMinBid}`);
      return;
    }
    setPlacing(true);
    try {
      const res = await liveService.placeBid(id!, amount, auction?.auctionHouse.id ?? "");
      if (res.success) {
        toast.success(res.message);
        setCustomBid("");
      } else {
        toast.error(res.message || "Bid failed");
      }
    } catch {
      toast.error("Bid failed, please try again");
    } finally {
      setPlacing(false);
    }
  };

  const formatCurrency = (amount?: number | null, currency: string = "INR") => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
          <p className="text-[#6B6B6B] text-sm mb-6">Unable to locate live room details for this auction item.</p>
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
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between pb-4 border-b border-[#E6E0DA]">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-[#6B6B6B] hover:text-[#1F1F1F] flex items-center gap-2 transition-colors bg-white px-3 py-2 rounded-xl border border-[#E6E0DA] shadow-xs"
        >
          ← Leave Room
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C9653B] animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
            {auction.auctionHouse?.name || "Live Auction House"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white rounded-2xl border border-[#E6E0DA] p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1F1F1F]">{auction.title}</h1>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">Item ID: {auction.auctionItemId}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <div className="w-full sm:w-48 h-48 rounded-xl bg-[#FFF9F4] border border-[#E6E0DA] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {auction.images && auction.images.length > 0 ? (
                    <img
                      src={typeof auction.images[0] === "string" ? auction.images[0] : (auction.images[0] as any)?.url}
                      alt={auction.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-xs text-[#6B6B6B]">No Image Available</span>
                  )}
                </div>

                <div className="w-full space-y-4">
                  <p className="text-xs text-[#6B6B6B] line-clamp-4 leading-relaxed">
                    {auction.description || "No description provided for this item."}
                  </p>

                  <div className="pt-3 border-t border-[#E6E0DA] grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#FFF9F4] p-2.5 rounded-xl border border-[#E6E0DA]/60">
                      <span className="block text-[#6B6B6B] text-[10px] font-bold uppercase">Starting Price</span>
                      <span className="font-extrabold text-sm text-[#1F1F1F]">
                        {formatCurrency(auction.startingPrice, auction.currency)}
                      </span>
                    </div>
                    <div className="bg-[#FFF9F4] p-2.5 rounded-xl border border-[#E6E0DA]/60">
                      <span className="block text-[#6B6B6B] text-[10px] font-bold uppercase">Min Increment</span>
                      <span className="font-extrabold text-sm text-[#1F1F1F]">
                        +{formatCurrency(auction.minimumIncrement, auction.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E6E0DA] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E0DA]">
                <h2 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider">
                  Bidding Console
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isEnded ? "bg-gray-400" : isWaiting ? "bg-amber-500" : "bg-[#C9653B] animate-pulse"}`}></span>
                  <span className="text-xs font-bold text-[#6B6B6B]">
                    {isEnded ? "CONSOLE CLOSED" : isWaiting ? "STANDBY" : "LIVE AGENT ACTIVE"}
                  </span>
                </div>
              </div>

              <div className="bg-[#FFF9F4] p-5 rounded-2xl border border-[#E6E0DA] text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Current Highest Bid
                </span>
                <div className="text-4xl font-black text-[#C9653B] tracking-tight">
                  {formatCurrency(currentHighest, auction.currency)}
                </div>
                {!isEnded && (
                  <span className="block text-xs font-semibold text-[#6B6B6B] pt-1">
                    Next Minimum Valid Bid: <span className="text-[#1F1F1F] font-bold">{formatCurrency(nextMinBid, auction.currency)}</span>
                  </span>
                )}
              </div>

              {isEnded ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-1">
                  <h3 className="text-sm font-bold text-gray-800">Bidding Finished</h3>
                  <p className="text-xs text-gray-500">This auction item is closed and no longer accepting bids.</p>
                </div>
              ) : isWaiting ? (
                <div className="bg-[#FEF7E0] border border-amber-200 rounded-xl p-4 text-center space-y-1">
                  <h3 className="text-sm font-bold text-[#1F1F1F]">Auction Waiting To Launch</h3>
                  <p className="text-xs text-[#6B6B6B]">Controls will unlock as soon as the host initiates the session.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={isProcessingRound || placing}
                      onClick={() => setCustomBid(String(nextMinBid))}
                      className="py-3 px-4 rounded-xl border-2 border-[#C9653B] text-[#C9653B] font-bold text-xs hover:bg-[#C9653B] hover:text-white disabled:opacity-50 transition-all shadow-2xs"
                    >
                      + Min ({formatCurrency(minIncrement, auction.currency)})
                    </button>
                    <button
                      disabled={isProcessingRound || placing}
                      onClick={() => setCustomBid(String(nextMinBid + minIncrement))}
                      className="py-3 px-4 rounded-xl border-2 border-[#C9653B] text-[#C9653B] font-bold text-xs hover:bg-[#C9653B] hover:text-white disabled:opacity-50 transition-all shadow-2xs"
                    >
                      + 2x Increment
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                      Custom Bid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B6B6B]">₹</span>
                      <input
                        type="number"
                        disabled={isProcessingRound || placing}
                        value={customBid}
                        onChange={(e) => setCustomBid(e.target.value)}
                        placeholder={`Min ${nextMinBid}`}
                        className="w-full bg-[#FFF9F4] border border-[#E6E0DA] rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isProcessingRound || placing}
                    onClick={handlePlaceBid}
                    className="w-full bg-[#C9653B] hover:bg-[#b0552f] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide"
                  >
                    {placing ? "Submitting Bid..." : isProcessingRound ? "Round Transitioning..." : "Place Bid Now"}
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white rounded-2xl border border-[#E6E0DA] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Live Auction Timer
                </span>
                {isEnded ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
                    FINISHED
                  </span>
                ) : isWaiting ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    STANDBY
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    ACTIVE
                  </span>
                )}
              </div>

              {!isEnded && !isWaiting && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${currentRoundConfig.badgeBg}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase">
                      {isProcessingRound ? "Transitioning..." : currentRoundConfig.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold opacity-80">
                    Round {round} / 3
                  </span>
                </div>
              )}

              {/* Countdown Timer Display */}
              <div className="bg-[#FFF9F4] rounded-2xl border border-[#E6E0DA] p-6 text-center space-y-1">
                {isEnded ? (
                  <div className="py-2">
                    <p className="text-sm font-bold text-gray-500">Bidding Concluded</p>
                    <p className="text-xs text-gray-400 mt-1">Final hammer price determined</p>
                  </div>
                ) : isWaiting ? (
                  <div className="py-2">
                    <p className="text-sm font-bold text-amber-800">Waiting for Host</p>
                    <p className="text-xs text-amber-600 mt-1">Timer starts automatically when session launches</p>
                  </div>
                ) : (
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                      Time Remaining in Round
                    </span>
                    <div className={`text-5xl font-black font-mono tracking-tight ${seconds <= 3 ? "text-red-600 animate-bounce" : "text-[#1F1F1F]"}`}>
                      {isProcessingRound ? "0" : seconds}
                      <span className="text-xl font-sans font-semibold ml-1 text-[#6B6B6B]">s</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live Stream Activity Log */}
            <div className="bg-white rounded-2xl border border-[#E6E0DA] p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E0DA]">
                <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9653B]"></span>
                  Live Activity Stream
                </h3>
                <span className="text-[10px] font-semibold text-[#6B6B6B]">{logs.length} Events</span>
              </div>

              <div className="h-72 rounded-xl bg-[#FFF9F4] border border-[#E6E0DA] p-3 text-xs overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-[#6B6B6B] p-4">
                    <p>{isWaiting ? "Waiting for room startup..." : "No bids or events logged yet."}</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="bg-white p-2.5 rounded-lg border border-[#E6E0DA]/80 shadow-2xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {log.type === "bid" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase flex-shrink-0">
                            BID
                          </span>
                        )}
                        {log.type === "round" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 uppercase flex-shrink-0">
                            ROUND
                          </span>
                        )}
                        {log.type === "system" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-gray-100 text-gray-700 uppercase flex-shrink-0">
                            INFO
                          </span>
                        )}
                        <span className="text-xs font-semibold text-[#1F1F1F] truncate">{log.text}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {outcome && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
            {outcome.type === "won" && (
              <>
                <h2 className="text-2xl font-black text-emerald-600">Congratulations! 🎉</h2>
                <p className="text-sm text-[#6B6B6B]">
                  You won this item for {formatCurrency(outcome.amount, auction.currency)}.
                </p>
                <button
                  onClick={() => navigate(`/orders/checkout/${id}`)}
                  className="w-full bg-[#C9653B] hover:bg-[#b0552f] text-white font-bold py-3 rounded-xl"
                >
                  Complete Your Order
                </button>
              </>
            )}
            {outcome.type === "lost" && (
              <>
                <h2 className="text-2xl font-black text-[#1F1F1F]">Item Sold</h2>
                <p className="text-sm text-[#6B6B6B]">
                  This item sold for {formatCurrency(outcome.amount, auction.currency)}. Better luck next time!
                </p>
                <button onClick={() => navigate("/auctions")} className="w-full border border-[#E6E0DA] font-bold py-3 rounded-xl">
                  Browse More Auctions
                </button>
              </>
            )}
            {outcome.type === "passed" && (
              <>
                <h2 className="text-2xl font-black text-amber-600">Item Passed</h2>
                <p className="text-sm text-[#6B6B6B]">
                  Bidding closed without meeting the reserve price. This item did not sell.
                </p>
                <button onClick={() => navigate("/auctions")} className="w-full border border-[#E6E0DA] font-bold py-3 rounded-xl">
                  Back to Catalog
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveRoom;