import React, { useState } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import { ReturnRequestStatus, type IReturnRequestDTO } from '../../types/order.dto';
import ImageLightbox from './imageLightbox';

interface Props {
    returnRequest: IReturnRequestDTO;
    formatDate: (d?: string) => string;
}

const statusStyles: Record<ReturnRequestStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    [ReturnRequestStatus.PENDING]: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <FaHourglassHalf size={11} />,
    },
    [ReturnRequestStatus.APPROVED]: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <FaCheckCircle size={11} />,
    },
    [ReturnRequestStatus.REJECTED]: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: <FaTimesCircle size={11} />,
    },
};

const ReturnRequestPanel: React.FC<Props> = ({ returnRequest, formatDate }) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const style = statusStyles[returnRequest.status];

    return (
        <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E0DA] pb-3">
                <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#6B6B6B] flex items-center gap-2">
                    <FaExclamationTriangle size={12} className="text-orange-500" /> Return Request
                </h2>
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${style.bg} ${style.text} border ${style.border} text-[10px] font-black uppercase tracking-wider`}
                >
                    {style.icon} {returnRequest.status}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                    <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider">Reason</div>
                    <div className="text-[#1F1F1F] font-semibold mt-0.5">{returnRequest.reason.replace(/_/g, " ")}</div>
                </div>
                <div>
                    <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider">Requested On</div>
                    <div className="text-[#1F1F1F] font-semibold mt-0.5">{formatDate(returnRequest.requestedAt)}</div>
                </div>
            </div>

            <div>
                <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider mb-1">Description</div>
                <p className="text-xs text-[#1F1F1F] leading-relaxed bg-[#FFF9F4] border border-[#E6E0DA] rounded-lg p-3">
                    {returnRequest.description}
                </p>
            </div>

            {returnRequest.proofs.length > 0 && (
                <div>
                    <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider mb-2">Proof Photos</div>
                    <div className="grid grid-cols-4 gap-2">
                        {returnRequest.proofs.map((url, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setLightboxIndex(idx)}
                                className="cursor-pointer"
                                aria-label={`View proof photo ${idx + 1}`}
                            >
                                <img
                                    src={url}
                                    alt={`Return proof ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border border-[#E6E0DA] hover:opacity-80 transition-opacity"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {returnRequest.status !== ReturnRequestStatus.PENDING && (
                <div className="pt-3 border-t border-[#E6E0DA] space-y-2 text-[11px]">
                    {returnRequest.rejectionReason && (
                        <div>
                            <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider">
                                {returnRequest.status === ReturnRequestStatus.REJECTED ? "Rejection Reason" : "Review Notes"}
                            </div>
                            <div className="text-[#1F1F1F] font-medium mt-0.5">{returnRequest.rejectionReason}</div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 text-[#6B6B6B]">
                        {returnRequest.reviewedByName && (
                            <span>
                                Reviewed by: <b className="text-[#1F1F1F]">{returnRequest.reviewedByName}</b>
                            </span>
                        )}
                        {returnRequest.reviewedAt && <span>on {formatDate(returnRequest.reviewedAt)}</span>}
                    </div>
                </div>
            )}

            {lightboxIndex !== null && (
                <ImageLightbox
                    images={returnRequest.proofs}
                    activeIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </div>
    );
};

export default ReturnRequestPanel;