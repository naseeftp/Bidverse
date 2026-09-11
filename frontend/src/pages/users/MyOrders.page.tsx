import React, { useCallback, useEffect, useState } from "react";
import type { OrderListResponseDTO } from "../../types/order.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import orderService from "../../services/order.service";
import toast from "react-hot-toast";
import Pagination from "../../components/user/pagination";
import { OrderStatus } from "../../types/order.dto";
import {
    FaShoppingBag,
    FaFilter,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaTruck,
    FaShippingFast,
    FaUndo,
    FaBox,
    FaEye,
    FaSearch,
    FaTimes,
} from "react-icons/fa";

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<OrderListResponseDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const [searchInput, setSearchInput] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
            setPage(1); 
        }, 400);

        return () => clearTimeout(handler);
    }, [searchInput]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrders(page, 6, statusFilter, searchTerm);
            if (response.success && response.data) {
                setOrders(response.data || []);
                setPagination(response.pagination ?? null);
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error("Failed to get your orders");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchTerm]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const renderStatusBadge = (status: string) => {
        const normalized = status?.toUpperCase() as OrderStatus;

        switch (normalized) {
            case OrderStatus.COMPLETED:
            case OrderStatus.DELIVERED:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> {normalized.replace(/_/g, " ")}
                    </span>
                );
            case OrderStatus.PENDING:
            case OrderStatus.PROCESSING:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaHourglassHalf size={10} /> {normalized.replace(/_/g, " ")}
                    </span>
                );
            case OrderStatus.SHIPPED:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaTruck size={10} /> Shipped
                    </span>
                );
            case OrderStatus.OUT_FOR_DELIVERY:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaShippingFast size={10} /> Out For Delivery
                    </span>
                );
            case OrderStatus.CANCELLED:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaTimesCircle size={10} /> Cancelled
                    </span>
                );
            case OrderStatus.REFUNDED:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                        <FaUndo size={10} /> Refunded
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FFF9F4] text-[#6B6B6B] border border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider">
                        {status}
                    </span>
                );
        }
    };

    const handleViewOrder = (orderId: string) => {
        toast.success(`View order details: ${orderId}`);
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] px-4 py-8 md:px-8 text-[#1F1F1F] font-sans antialiased">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="border-b border-[#E6E0DA] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-[#1F1F1F]">
                            My Orders
                        </h1>
                        <p className="text-xs text-[#6B6B6B] font-medium mt-1">
                            Track and manage your won auction items and purchases.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-64 relative group">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5 block">
                                Search Orders
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] group-focus-within:text-[#C9653B] transition-colors pointer-events-none">
                                    <FaSearch size={10} />
                                </div>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="TITLE, ORDER NO, ID..."
                                    className="w-full bg-white border border-[#E6E0DA] rounded-lg pl-9 pr-8 py-2.5 text-[11px] text-[#1F1F1F] font-bold tracking-wider placeholder-[#6B6B6B]/50 focus:outline-none focus:border-[#C9653B] shadow-sm transition-all"
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full sm:w-52 relative group">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5 block">
                                Status Filter
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] group-focus-within:text-[#C9653B] transition-colors pointer-events-none">
                                    <FaFilter size={10} />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full bg-white border border-[#E6E0DA] rounded-lg pl-9 pr-8 py-2.5 text-[11px] text-[#1F1F1F] font-bold uppercase tracking-wider focus:outline-none focus:border-[#C9653B] appearance-none cursor-pointer shadow-sm transition-all"
                                >
                                    <option value="ALL">ALL ORDERS</option>
                                    {Object.values(OrderStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace(/_/g, " ")}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6B6B] text-[8px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#C9653B] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-[#E6E0DA] rounded-xl p-12 text-center shadow-sm space-y-2">
                        <FaShoppingBag size={24} className="mx-auto text-[#6B6B6B]/40" />
                        <p className="text-[#1F1F1F] text-sm font-bold uppercase tracking-wide">
                            No Orders Found
                        </p>
                        <p className="text-[#6B6B6B] text-xs max-w-sm mx-auto">
                            {searchTerm 
                                ? `No results found for "${searchTerm}". Try clearing your search.` 
                                : "You haven't placed or won any orders matching this filter yet."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-[#FFF9F4] border-b border-[#E6E0DA] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                                            <th className="py-3.5 px-4 text-center w-16">Image</th>
                                            <th className="py-3.5 px-4">Item Name</th>
                                            <th className="py-3.5 px-4">Order ID</th>
                                            <th className="py-3.5 px-4">Order No.</th>
                                            <th className="py-3.5 px-4 text-right">Amount</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                            <th className="py-3.5 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E6E0DA] text-xs">
                                        {orders.map((order) => {
                                            const imageUrl = typeof order.itemImage === "string" 
                                                ? order.itemImage 
                                                : order.itemImage?.url;

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-[#FFF9F4]/50 transition-colors"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="w-12 h-12 rounded-lg bg-[#FFF9F4] border border-[#E6E0DA] overflow-hidden flex items-center justify-center mx-auto">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={order.itemTitle}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaBox className="text-[#6B6B6B]/40" size={18} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-bold text-[#1F1F1F] max-w-[220px]">
                                                        <span className="line-clamp-2" title={order.itemTitle}>
                                                            {order.itemTitle}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-[11px] text-[#6B6B6B]">
                                                        {order.id || order.auctionId}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="font-mono text-xs text-[#1F1F1F] font-semibold bg-[#FFF9F4] px-2 py-1 rounded border border-[#E6E0DA] inline-block">
                                                            {order.orderNumber}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-black text-sm text-[#1F1F1F]">
                                                        ₹{order.orderAmount.toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        {renderStatusBadge(order.status)}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <button
                                                            onClick={() => handleViewOrder(order.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1F1F1F] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#C9653B] transition-colors cursor-pointer shadow-xs"
                                                        >
                                                            <FaEye size={11} /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Pagination
                                pagination={pagination}
                                onPageChange={setPage}
                                loading={loading}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyOrders;