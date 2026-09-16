import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ReturnRequestStatus, type OrderDetailsResponseDTO } from "../../types/order.dto";
import orderService from "../../services/order.service";
import ImageLightbox from "../../components/common/imageLightbox";

import {
    FaArrowLeft,
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaCreditCard,
    FaStore,
    FaShieldAlt,
    FaHourglassHalf,
    FaReceipt,
    FaCalendarAlt,
    FaPhone,
    FaTag,
    FaUser,
    FaEnvelope,
    FaExclamationTriangle,
    FaTimesCircle,
    FaTimes,
} from "react-icons/fa";

const AdminOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [details, setOrderDetails] = useState<OrderDetailsResponseDTO | null>(null);
    const [reviewModal, setReviewModal] = useState<"approve" | "reject" | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const fetchOrderDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await orderService.getOrderDetails(id);
            if (response.success && response.data) {
                setOrderDetails(response.data);
            } else {
                toast.error(response.message || "Failed to retrieve order details");
            }
        } catch {
            toast.error("Failed to get order details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleReview = async () => {
        if (!id || !reviewModal) return;
        if (reviewModal === "reject" && rejectionReason.trim().length < 5) {
            toast.error("Please provide a rejection reason");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await orderService.reviewReturn(id, {
                action: reviewModal,
                rejectionReason: reviewModal === "reject" ? rejectionReason.trim() : undefined,
            });
            if (response.success) {
                toast.success(reviewModal === "approve" ? "Return approved, refund issued" : "Return rejected");
                setReviewModal(null);
                setRejectionReason("");
                fetchOrderDetails();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error("Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStatusBadge = (status?: string) => {
        const normalized = status?.toUpperCase() || "PENDING";
        switch (normalized) {
            case "COMPLETED":
            case "DELIVERED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> {normalized}
                    </span>
                );
            case "SHIPPED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaTruck size={10} /> SHIPPED
                    </span>
                );
            case "RETURN_REQUESTED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaExclamationTriangle size={10} /> RETURN REQUESTED
                    </span>
                );
            case "REFUNDED":
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        {normalized}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaHourglassHalf size={10} /> {normalized}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-[#2F6FED] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!details) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] px-4 py-16 text-center">
                <FaBox size={32} className="mx-auto text-[#475569]/40 mb-3" />
                <h2 className="text-base font-extrabold uppercase text-[#0F172A]">Order Not Found</h2>
                <p className="text-xs text-[#475569] mt-1">
                    The requested order details could not be found.
                </p>
                <button
                    onClick={() => navigate("/my-orders")}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2F6FED] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2558C7] transition-colors cursor-pointer shadow-xs"
                >
                    <FaArrowLeft size={10} /> Back To My Orders
                </button>
            </div>
        );
    }

    const returnRequest = details.returnRequest;
    const isPendingReview = returnRequest?.status === ReturnRequestStatus.PENDING;

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-4 py-8 md:px-8 text-[#0F172A] font-sans antialiased">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="border-b border-[#E2E8F0] pb-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475569] hover:text-[#0F172A] transition-colors mb-4 cursor-pointer"
                    >
                        <FaArrowLeft size={10} /> Back to Orders
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                                    Order #{details.orderNumber}
                                </h1>
                                {renderStatusBadge(details.status)}
                            </div>
                            <p className="text-xs text-[#475569] font-medium mt-1.5 flex items-center gap-2">
                                <FaCalendarAlt size={12} /> Placed on {formatDate(details.createdAt)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-[#475569]">Order ID:</span>
                            <span className="font-mono text-xs text-[#0F172A] font-medium bg-white px-2.5 py-1 rounded border border-[#E2E8F0] shadow-xs">
                                {details.id}
                            </span>
                        </div>
                    </div>
                </div>

                {isPendingReview && (
                    <div className="bg-white border-2 border-orange-400/40 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                                <FaExclamationTriangle size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#0F172A]">
                                    Return Requested — Action Needed
                                </h3>
                                <p className="text-xs text-[#475569] mt-0.5">
                                    Review the buyer's evidence below, then approve (refunds buyer) or reject.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setReviewModal("reject")}
                                className="flex-1 md:flex-initial inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                                <FaTimesCircle size={11} /> Reject
                            </button>
                            <button
                                onClick={() => setReviewModal("approve")}
                                className="flex-1 md:flex-initial inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
                            >
                                <FaCheckCircle size={11} /> Approve & Refund
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                                <FaTag size={12} className="text-[#2F6FED]" /> Order Item
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="w-24 h-24 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {details.item.imageUrl ? (
                                        <img
                                            src={details.item.imageUrl}
                                            alt={details.item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaBox className="text-[#475569]/40" size={32} />
                                    )}
                                </div>

                                <div className="space-y-1.5 flex-1">
                                    <h3 className="text-base font-bold text-[#0F172A] tracking-wide">
                                        {details.item.title}
                                    </h3>
                                    <div className="text-[11px] text-[#475569] font-mono">
                                        Item ID: {details.item.id}
                                    </div>
                                    {details.seller && (
                                        <div className="pt-1 flex items-center gap-1.5 text-xs text-[#0F172A] font-semibold">
                                            <FaStore className="text-[#2F6FED]" size={12} />
                                            <span>Auction House: {details.seller.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {returnRequest && (
                            <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-2">
                                        <FaExclamationTriangle size={12} className="text-orange-500" /> Return Request
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            returnRequest.status === ReturnRequestStatus.APPROVED
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : returnRequest.status === ReturnRequestStatus.REJECTED
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}
                                    >
                                        {returnRequest.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider">Reason</div>
                                        <div className="text-[#0F172A] font-semibold mt-0.5">
                                            {returnRequest.reason.replace(/_/g, " ")}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider">Requested On</div>
                                        <div className="text-[#0F172A] font-semibold mt-0.5">
                                            {formatDate(returnRequest.requestedAt)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider mb-1">
                                        Buyer's Description
                                    </div>
                                    <p className="text-xs text-[#0F172A] leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
                                        {returnRequest.description}
                                    </p>
                                </div>

                                {returnRequest.proofs.length > 0 && (
                                    <div>
                                        <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider mb-2">
                                            Proof Photos
                                        </div>
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
                                                        alt={`Proof ${idx + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-[#E2E8F0] hover:opacity-80 transition-opacity"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isPendingReview && (
                                    <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-[11px]">
                                        {returnRequest.rejectionReason && (
                                            <div>
                                                <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider">
                                                    {returnRequest.status === ReturnRequestStatus.REJECTED
                                                        ? "Rejection Reason"
                                                        : "Notes"}
                                                </div>
                                                <div className="text-[#0F172A] font-medium mt-0.5">
                                                    {returnRequest.rejectionReason}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-x-4 text-[#475569]">
                                            {returnRequest.reviewedByName && (
                                                <span>
                                                    Reviewed by: <b className="text-[#0F172A]">{returnRequest.reviewedByName}</b>
                                                </span>
                                            )}
                                            {returnRequest.reviewedAt && <span>on {formatDate(returnRequest.reviewedAt)}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {details.buyer && (
                            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                                    <FaUser size={12} className="text-[#2F6FED]" /> Buyer Information
                                </h2>

                                <div className="space-y-2.5 text-xs text-[#0F172A]">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-[#0F172A]">
                                            {details.buyer.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[#475569] font-medium">
                                        <FaEnvelope size={11} className="text-[#0F172A]" />
                                        <span>{details.buyer.email}</span>
                                    </div>

                                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-2 text-[11px] text-[#475569]">
                                        <span className="font-semibold uppercase text-[10px]">Buyer Account ID:</span>
                                        <span className="font-mono text-[#0F172A] font-semibold bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">
                                            {details.buyer.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                                <FaMapMarkerAlt size={12} className="text-[#2F6FED]" /> Shipping Address
                            </h2>

                            <div className="space-y-2 text-xs text-[#0F172A]">
                                <div className="font-bold text-sm text-[#0F172A]">
                                    {details.shippingAddress.recipientName}
                                </div>
                                <div className="text-[#475569] leading-relaxed font-medium">
                                    {details.shippingAddress.fullAddress}
                                    {details.shippingAddress.landMark && (
                                        <span>, Landmark: {details.shippingAddress.landMark}</span>
                                    )}
                                    <br />
                                    {details.shippingAddress.city}, {details.shippingAddress.state} - {details.shippingAddress.pincode}
                                    <br />
                                    {details.shippingAddress.country}
                                </div>

                                <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap gap-4 text-[#475569] text-[11px] font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <FaPhone size={10} className="text-[#0F172A]" /> {details.shippingAddress.phone}
                                    </span>
                                    {details.shippingAddress.altPhone && (
                                        <span className="flex items-center gap-1.5">
                                            Alt: {details.shippingAddress.altPhone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="space-y-6">

                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                                <FaReceipt size={12} className="text-[#2F6FED]" /> Payment Summary
                            </h2>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-[#475569] font-medium">
                                    <span>Item Winning Bid</span>
                                    <span className="font-bold text-[#0F172A]">
                                        ₹{details.financials.itemAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="flex justify-between text-[#475569] font-medium">
                                    <span>Shipping Fee</span>
                                    <span className="font-bold text-[#0F172A]">
                                        ₹{details.financials.shippingCost.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-center text-sm font-bold text-[#0F172A]">
                                    <span>Total Paid</span>
                                    <span className="text-base text-[#2F6FED] font-extrabold">
                                        ₹{details.financials.totalAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {details.payment && (
                            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                                    <FaCreditCard size={12} className="text-[#2F6FED]" /> Gateway Details
                                </h2>

                                <div className="space-y-3 text-[11px]">
                                    <div>
                                        <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider">
                                            Razorpay Payment ID
                                        </div>
                                        <div className="font-mono text-[#0F172A] font-semibold mt-0.5">
                                            {details.payment.razorpayPaymentId || "N/A"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[#475569] font-bold uppercase text-[9px] tracking-wider">
                                            Razorpay Order ID
                                        </div>
                                        <div className="font-mono text-[#0F172A] font-semibold mt-0.5">
                                            {details.payment.razorpayOrderId}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                                        <span className="text-[#475569] font-bold uppercase text-[9px]">Escrow Status</span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold uppercase">
                                            <FaShieldAlt size={10} /> {details.payment.escrowStatus}
                                        </span>
                                    </div>

                                    {details.payment.paidAt && (
                                        <div className="text-[10px] text-[#475569] pt-1">
                                            Paid on: {formatDate(details.payment.paidAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        reviewModal === "approve"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700"
                                    }`}
                                >
                                    {reviewModal === "approve" ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} />}
                                </div>
                                <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#0F172A]">
                                    {reviewModal === "approve" ? "Approve Return & Refund" : "Reject Return Request"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setReviewModal(null)}
                                className="text-[#475569] hover:text-[#0F172A] p-1 cursor-pointer"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {reviewModal === "approve" ? (
                            <p className="text-xs text-[#475569] leading-relaxed font-medium">
                                This will immediately refund ₹{details.financials.totalAmount.toLocaleString("en-IN")} to the
                                buyer via Razorpay and mark the order as refunded. This cannot be undone.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                                    Reason for rejection
                                </label>
                                <textarea
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this return doesn't qualify..."
                                    className="w-full border border-[#E2E8F0] px-3 py-2.5 rounded-lg text-sm resize-none"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
                            <button
                                disabled={isSubmitting}
                                onClick={() => setReviewModal(null)}
                                className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-bold uppercase tracking-wider text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={handleReview}
                                className={`px-5 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer ${
                                    reviewModal === "approve"
                                        ? "bg-emerald-700 hover:bg-emerald-800"
                                        : "bg-rose-700 hover:bg-rose-800"
                                }`}
                            >
                                {isSubmitting ? "Processing..." : reviewModal === "approve" ? "Confirm & Refund" : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof photo lightbox */}
            {lightboxIndex !== null && returnRequest && (
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

export default AdminOrderDetailsPage;