import React, { useCallback, useEffect, useState } from "react";
import type { OrderTenantListResponseDTO } from "../../types/order.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import orderService from "../../services/order.service";
import toast from "react-hot-toast";
import Pagination from "../../components/tenant/pagination";
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
import { useNavigate } from "react-router-dom";

const TenantOrders: React.FC = () => {
    const [orders, setOrders] = useState<OrderTenantListResponseDTO[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const [searchInput, setSearchInput] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const navigate = useNavigate();

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
            const response = await orderService.getTenantOrders(page, 6, statusFilter, searchTerm);
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> {normalized.replace(/_/g, " ")}
                    </span>
                );
            case OrderStatus.PENDING:
            case OrderStatus.PROCESSING:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaHourglassHalf size={10} /> {normalized.replace(/_/g, " ")}
                    </span>
                );
            case OrderStatus.SHIPPED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaTruck size={10} /> Shipped
                    </span>
                );
            case OrderStatus.OUT_FOR_DELIVERY:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaShippingFast size={10} /> Out For Delivery
                    </span>
                );
            case OrderStatus.CANCELLED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaTimesCircle size={10} /> Cancelled
                    </span>
                );
            case OrderStatus.REFUNDED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[10px] font-semibold uppercase tracking-wider">
                        <FaUndo size={10} /> Refunded
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wider">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-4 py-8 md:px-8 text-[#0F172A] font-sans antialiased">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="border-b border-[#E2E8F0] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                            My Orders
                        </h1>
                        <p className="text-xs text-[#475569] font-medium mt-1">
                            Track and manage your orders across your account.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-64 relative group">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] mb-1.5 block">
                                Search Orders
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#2F6FED] transition-colors pointer-events-none">
                                    <FaSearch size={11} />
                                </div>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Item name, buyer, ID..."
                                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-8 py-2 text-xs text-[#0F172A] font-medium placeholder-[#475569]/50 focus:outline-none focus:border-[#2F6FED] focus:ring-1 focus:ring-[#2F6FED] transition-all shadow-xs"
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] transition-colors"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full sm:w-52 relative group">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] mb-1.5 block">
                                Status Filter
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#2F6FED] transition-colors pointer-events-none">
                                    <FaFilter size={10} />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-8 py-2 text-xs text-[#0F172A] font-semibold uppercase tracking-wider focus:outline-none focus:border-[#2F6FED] focus:ring-1 focus:ring-[#2F6FED] appearance-none cursor-pointer shadow-xs transition-all"
                                >
                                    <option value="ALL">All Orders</option>
                                    {Object.values(OrderStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace(/_/g, " ")}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#475569] text-[8px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-[#2F6FED] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-xs space-y-2">
                        <FaShoppingBag size={24} className="mx-auto text-[#475569]/40" />
                        <p className="text-[#0F172A] text-sm font-bold tracking-wide">
                            No Orders Found
                        </p>
                        <p className="text-[#475569] text-xs max-w-sm mx-auto">
                            {searchTerm 
                                ? `No results found for "${searchTerm}". Try clearing your search.` 
                                : "You have no orders matching the selected filter criteria."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                                            <th className="py-3.5 px-4 text-center w-16">Image</th>
                                            <th className="py-3.5 px-4">Item Name</th>
                                            <th className="py-3.5 px-4">Order ID</th>
                                            <th className="py-3.5 px-4">Buyer Name</th>
                                            <th className="py-3.5 px-4 text-right">Amount</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                            <th className="py-3.5 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                                        {orders.map((order) => {
                                            const imageUrl = typeof order.itemImage === "string" 
                                                ? order.itemImage 
                                                : order.itemImage?.url;

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-[#F8FAFC] transition-colors"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden flex items-center justify-center mx-auto">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={order.itemTitle}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaBox className="text-[#475569]/40" size={16} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-semibold text-[#0F172A] max-w-[220px]">
                                                        <span className="line-clamp-2" title={order.itemTitle}>
                                                            {order.itemTitle}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-[11px] text-[#475569]">
                                                        {order.id || order.auctionId}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="font-mono text-xs text-[#0F172A] font-medium bg-[#F8FAFC] px-2 py-1 rounded border border-[#E2E8F0] inline-block">
                                                            {order.buyerName}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-sm text-[#0F172A]">
                                                        ₹{order.orderAmount.toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        {renderStatusBadge(order.status)}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <button
                                                            onClick={() => navigate(`/tenant/order-details/${order.id}`)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2F6FED] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#2558C7] transition-colors cursor-pointer shadow-xs"
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

                        <div className="mt-6">
                            <Pagination
                                pagination={pagination}
                                currentPage={page}
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

export default TenantOrders;