import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import type { OrderDetailsResponseDTO } from "../../types/order.dto";
import orderService from "../../services/order.service";
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
} from "react-icons/fa";

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [details, setOrderDetails] = useState<OrderDetailsResponseDTO | null>(null);

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

    const renderStatusBadge = (status?: string) => {
        const normalized = status?.toUpperCase() || "PENDING";
        switch (normalized) {
            case "COMPLETED":
            case "DELIVERED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider">
                        <FaCheckCircle size={12} /> {normalized}
                    </span>
                );
            case "SHIPPED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-wider">
                        <FaTruck size={12} /> SHIPPED
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider">
                        CANCELLED
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider">
                        <FaHourglassHalf size={12} /> {normalized}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F4] flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!details) {
        return (
            <div className="min-h-screen bg-[#FFF9F4] px-4 py-16 text-center">
                <FaBox size={36} className="mx-auto text-[#6B6B6B]/40 mb-3" />
                <h2 className="text-lg font-black uppercase text-[#1F1F1F]">Order Not Found</h2>
                <p className="text-xs text-[#6B6B6B] mt-1">
                    The requested order details could not be found.
                </p>
                <button
                    onClick={() => navigate("/my-orders")}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F1F1F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C9653B] transition-colors cursor-pointer"
                >
                    <FaArrowLeft size={10} /> Back To My Orders
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="border-b border-[#E6E0DA] pb-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors mb-4 cursor-pointer"
                    >
                        <FaArrowLeft size={10} /> Back to Orders
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
                                    Order #{details.orderNumber}
                                </h1>
                                {renderStatusBadge(details.status)}
                            </div>
                            <p className="text-xs text-[#6B6B6B] font-medium mt-1.5 flex items-center gap-2">
                                <FaCalendarAlt size={12} /> Placed on {formatDate(details.createdAt)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-[#6B6B6B]">Order ID:</span>
                            <span className="font-mono text-xs text-[#1F1F1F] font-semibold bg-white px-2.5 py-1 rounded border border-[#E6E0DA]">
                                {details.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white border border-[#E6E0DA] rounded-xl p-5 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#6B6B6B] flex items-center gap-2 border-b border-[#E6E0DA] pb-3">
                                <FaTag size={12} className="text-[#C9653B]" /> Purchased Item
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="w-24 h-24 rounded-lg bg-[#FFF9F4] border border-[#E6E0DA] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {details.item.imageUrl ? (
                                        <img
                                            src={details.item.imageUrl}
                                            alt={details.item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaBox className="text-[#6B6B6B]/40" size={32} />
                                    )}
                                </div>

                                <div className="space-y-1.5 flex-1">
                                    <h3 className="text-base font-black text-[#1F1F1F] uppercase tracking-wide">
                                        {details.item.title}
                                    </h3>
                                    <div className="text-[11px] text-[#6B6B6B] font-mono">
                                        Item Reference ID: {details.item.id}
                                    </div>
                                    {details.seller && (
                                        <div className="pt-1 flex items-center gap-1.5 text-xs text-[#1F1F1F] font-bold">
                                            <FaStore className="text-[#C9653B]" size={12} />
                                            <span>Auction House: {details.seller.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#E6E0DA] rounded-xl p-5 shadow-sm space-y-3">
                            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#6B6B6B] flex items-center gap-2 border-b border-[#E6E0DA] pb-3">
                                <FaMapMarkerAlt size={12} className="text-[#C9653B]" /> Shipping Address
                            </h2>

                            <div className="space-y-2 text-xs text-[#1F1F1F]">
                                <div className="font-black text-sm text-[#1F1F1F]">
                                    {details.shippingAddress.recipientName}
                                </div>
                                <div className="text-[#6B6B6B] leading-relaxed font-medium">
                                    {details.shippingAddress.fullAddress}
                                    {details.shippingAddress.landMark && (
                                        <span>, Landmark: {details.shippingAddress.landMark}</span>
                                    )}
                                    <br />
                                    {details.shippingAddress.city}, {details.shippingAddress.state} - {details.shippingAddress.pincode}
                                    <br />
                                    {details.shippingAddress.country}
                                </div>

                                <div className="pt-2 border-t border-[#E6E0DA]/60 flex flex-wrap gap-4 text-[#6B6B6B] text-[11px] font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <FaPhone size={10} className="text-[#1F1F1F]" /> {details.shippingAddress.phone}
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

                        <div className="bg-white border border-[#E6E0DA] rounded-xl p-5 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#6B6B6B] flex items-center gap-2 border-b border-[#E6E0DA] pb-3">
                                <FaReceipt size={12} className="text-[#C9653B]" /> Payment Summary
                            </h2>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-[#6B6B6B] font-medium">
                                    <span>Item Winning Bid</span>
                                    <span className="font-bold text-[#1F1F1F]">
                                        ₹{details.financials.itemAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="flex justify-between text-[#6B6B6B] font-medium">
                                    <span>Shipping Fee</span>
                                    <span className="font-bold text-[#1F1F1F]">
                                        ₹{details.financials.shippingCost.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="border-t border-[#E6E0DA] pt-3 flex justify-between items-center text-sm font-black text-[#1F1F1F]">
                                    <span>Total Paid</span>
                                    <span className="text-base text-[#C9653B]">
                                        ₹{details.financials.totalAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {details.payment && (
                            <div className="bg-white border border-[#E6E0DA] rounded-xl p-5 shadow-sm space-y-3">
                                <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#6B6B6B] flex items-center gap-2 border-b border-[#E6E0DA] pb-3">
                                    <FaCreditCard size={12} className="text-[#C9653B]" /> Gateway Details
                                </h2>

                                <div className="space-y-3 text-[11px]">
                                    <div>
                                        <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider">
                                            Razorpay Payment ID
                                        </div>
                                        <div className="font-mono text-[#1F1F1F] font-semibold">
                                            {details.payment.razorpayPaymentId || "N/A"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[#6B6B6B] font-bold uppercase text-[9px] tracking-wider">
                                            Razorpay Order ID
                                        </div>
                                        <div className="font-mono text-[#1F1F1F] font-semibold">
                                            {details.payment.razorpayOrderId}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-[#E6E0DA] flex items-center justify-between">
                                        <span className="text-[#6B6B6B] font-bold uppercase text-[9px]">Escrow Status</span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                                            <FaShieldAlt size={10} /> {details.payment.escrowStatus}
                                        </span>
                                    </div>

                                    {details.payment.paidAt && (
                                        <div className="text-[10px] text-[#6B6B6B] pt-1">
                                            Paid on: {formatDate(details.payment.paidAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetailsPage;