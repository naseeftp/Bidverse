import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import slotService from "../../services/slot.service";
import type { bookedSlotListDTO, slotCancelDTO } from "../../types/slot.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import toast from "react-hot-toast";
import Pagination from "../../components/user/pagination";
import CountdownTimer from "../../components/user/countDownTimer";
import {
  FaCalendarCheck,
  FaCalendarAlt,
  FaClock,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaBan,
  FaExclamationTriangle
} from "react-icons/fa";

const MySlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<bookedSlotListDTO[]>([]);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const [selectedSlotForCancel, setSelectedSlotForCancel] = useState<bookedSlotListDTO | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await slotService.listAllSlotForUser(page, 6);


      if (response.success && response.data) {
        setSlots(response.data);
        setPagination(response.pagination?? null);
      } else {
        toast.error(response.message || "Failed to retrieve slots");
      }
    } catch {
      toast.error("Failed to get your slots");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCancelSlot = async () => {
    if (!selectedSlotForCancel) return;

    setCancelling(true);
    try {
      const cancelData:slotCancelDTO={
      slotId:selectedSlotForCancel.slotId,
      auctionId:selectedSlotForCancel.auctionId
      }
      const response = await slotService.cancellSlot(cancelData);
      if (response.success) {
        toast.success(response.message || "Slot cancelled successfully");
        setSelectedSlotForCancel(null);
        fetchSlots();
      } else {
        toast.error(response.message || "Failed to cancel slot");
      }
    } catch {
      toast.error("An error occurred while cancelling the slot");
    } finally {
      setCancelling(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "confirmed":
      case "booked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <FaCheckCircle size={10} /> Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <FaHourglassHalf size={10} /> Pending
          </span>
        );
      case "cancelled":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <FaTimesCircle size={10} /> {normalized}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {status}
          </span>
        );
    }
  };

  const formatDate = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSlotTimingState = (startTime: string | Date, endTime: string | Date) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) {
      return { isUpcoming: true, isLive: false, isEnded: false };
    } else if (now >= start && now <= end) {
      return { isUpcoming: false, isLive: true, isEnded: false };
    } else {
      return { isUpcoming: false, isLive: false, isEnded: true };
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="border-b border-[#E6E0DA] pb-5">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
            My Reserved Slots
          </h1>
          <p className="text-xs text-[#6B6B6B] font-medium mt-1">
            Manage your booked bidding slots and live auction access times.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm space-y-2">
            <FaCalendarCheck size={24} className="mx-auto text-[#6B6B6B]/40" />
            <p className="text-[#1F1F1F] text-sm font-bold uppercase tracking-wide">
              No Slots Reserved
            </p>
            <p className="text-[#6B6B6B] text-xs max-w-sm mx-auto">
              You haven&rsquo;t booked any live bidding slots yet. Browse auctions to reserve your access.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((item) => {
                const { isUpcoming, isLive, isEnded } = getSlotTimingState(item.startTime, item.endTime);
                const isCancelled = item.status?.toLowerCase() === "cancelled";
                const canCancel = isUpcoming && !isCancelled;

                return (
                  <div
                    key={item.slotId}
                    className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm hover:border-[#C9653B]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-[#FFF9F4] border-b border-[#E6E0DA] overflow-hidden">
                        <img
                          src={item.auctionImage || "/placeholder.png"}
                          alt={item.auctionTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          {renderStatusBadge(item.status)}
                        </div>
                        {isLive && !isCancelled && (
                          <div className="absolute top-3 right-3 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live Now
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h2 className="text-sm font-bold text-[#1F1F1F] line-clamp-1">
                            {item.auctionTitle}
                          </h2>
                          <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 font-medium">
                            <FaCalendarAlt size={10} className="text-[#C9653B]" />
                            Booked on: {formatDate(item.bookedAt)}
                          </p>
                        </div>

                        <div className="bg-[#FFF9F4] p-3 rounded-lg border border-[#E6E0DA] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-[#6B6B6B] flex items-center gap-1">
                              <FaClock size={10} className="text-[#6B6B6B]" /> Start Time
                            </span>
                            <span className="text-xs font-bold text-[#1F1F1F]">
                              {formatDate(item.startTime)} at {formatTime(item.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-[#E6E0DA]/60 pt-2">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-[#6B6B6B] flex items-center gap-1">
                              <FaClock size={10} className="text-[#6B6B6B]" /> End Time
                            </span>
                            <span className="text-xs font-bold text-[#1F1F1F]">
                              {formatTime(item.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#E6E0DA] bg-[#FFF9F4] p-3 space-y-2.5">
                      {!isCancelled && (
                        <>
                          {isUpcoming && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#6B6B6B] font-semibold text-[10px] uppercase tracking-wider">
                                Starts In:
                              </span>
                              <CountdownTimer endTime={new Date(item.startTime).toISOString()} />
                            </div>
                          )}
                          {isLive && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-rose-600 font-bold text-[10px] uppercase tracking-wider">
                                Ends In:
                              </span>
                              <CountdownTimer endTime={new Date(item.endTime).toISOString()} />
                            </div>
                          )}
                          {isEnded && (
                            <div className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider text-center py-0.5">
                              Slot Concluded
                            </div>
                          )}
                        </>
                      )}

                      <div className="space-y-2">
                        {isLive && !isCancelled && (
                          <button
                            onClick={() => navigate(`/auctions/${item.auctionId}/live`)}
                            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            Enter Bidding Room
                            <FaExternalLinkAlt size={10} />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/auctions/${item.auctionId}`)}
                          className="w-full py-2 px-3 bg-white hover:bg-[#C9653B] hover:text-white border border-[#E6E0DA] hover:border-[#C9653B] text-[#1F1F1F] text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm group"
                        >
                          View Auction Details
                          <FaInfoCircle size={10} className="text-[#6B6B6B] group-hover:text-white transition-colors" />
                        </button>

                        {canCancel && (
                          <button
                            onClick={() => setSelectedSlotForCancel(item)}
                            className="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <FaBan size={10} />
                            Cancel Slot
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {selectedSlotForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E6E0DA] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <FaExclamationTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-[#1F1F1F] uppercase tracking-wide">
                Cancel Slot Reservation
              </h3>
            </div>

            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Are you sure you want to cancel your slot for{" "}
              <span className="font-bold text-[#1F1F1F]">{selectedSlotForCancel.auctionTitle}</span>? 
              This action cannot be undone, and your bidding window access will be released.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={cancelling}
                onClick={() => setSelectedSlotForCancel(null)}
                className="px-4 py-2 border border-[#E6E0DA] text-[#1F1F1F] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Reserved
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelSlot}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySlotsPage;