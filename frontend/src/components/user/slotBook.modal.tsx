import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaCalendarCheck, FaInfoCircle } from "react-icons/fa";

interface BookSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionName: string;
  slotAmount: number;
  currency?: string;
  onConfirm: () => Promise<void> | void;
}

const BookSlotModal: React.FC<BookSlotModalProps> = ({
  isOpen,
  onClose,
  auctionName,
  slotAmount,
  currency = "INR",
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch {
      toast.error('failed to book slot')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-xl border border-[#E6E0DA] shadow-xl w-full max-w-md overflow-hidden text-[#1F1F1F]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E0DA] bg-[#FFF9F4]">
          <div className="flex items-center gap-2">
            <FaCalendarCheck className="text-[#C9653B]" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F1F1F]">
              Reserve Live Bidding Slot
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors p-1 rounded-md focus:outline-none"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-widest">
              Auction Event
            </span>
            <p className="text-base font-bold text-[#1F1F1F] line-clamp-2">
              {auctionName}
            </p>
          </div>

          <div className="p-4 bg-[#FFF9F4] border border-[#E6E0DA] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-widest block">
                Required Deposit / Reservation Fee
              </span>
              <p className="text-xl font-black text-[#C9653B] font-mono mt-0.5">
                {currency} {slotAmount?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
            <FaInfoCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={13} />
            <p className="leading-relaxed">
              Reserving a slot grants access to participating live during the scheduled event window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#E6E0DA] bg-[#FFF9F4]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-1/2 py-2.5 rounded-lg border border-[#E6E0DA] bg-white hover:bg-[#FFF9F4] text-xs font-bold uppercase tracking-wider text-[#1F1F1F] transition-all focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="w-1/2 py-2.5 rounded-lg bg-[#C9653B] hover:bg-[#C9653B]/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm & Reserve"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookSlotModal;