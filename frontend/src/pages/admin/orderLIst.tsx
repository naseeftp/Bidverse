import React, { useCallback, useEffect, useState } from "react";
import type { OrderAdminListResponseDTO } from "../../types/order.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import orderService from "../../services/order.service";
import toast from "react-hot-toast";
import Pagination from "../../components/admin/pagination";
import { OrderStatus } from "../../types/order.dto";
import { FaExternalLinkAlt, FaSearch, FaFilter, FaBox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderAdminListResponseDTO[]>([]);
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
      const response = await orderService.getAllOrdersByAdmin(
        page,
        10,
        statusFilter,
        searchTerm
      );
      if (response.success && response.data) {
        setOrders(response.data || []);
        setPagination(response.pagination ?? null);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to sync order registry");
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
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] bg-white text-black border border-white">
            {normalized.replace(/_/g, " ")}
          </span>
        );
      case OrderStatus.PENDING:
      case OrderStatus.PROCESSING:
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/60 text-white">
            {normalized.replace(/_/g, " ")}
          </span>
        );
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] bg-white/10 border border-white/20 text-white">
            {normalized.replace(/_/g, " ")}
          </span>
        );
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/20 text-white/40">
            {normalized.replace(/_/g, " ")}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/20 text-white/50">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase tracking-[0.25em] text-[#111827]">
          Order Management
        </h1>
        <p className="text-[10px] font-bold text-[#111827] uppercase tracking-widest mt-1">
          System Administration Panel
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        {/* Search Input */}
        <div className="w-full max-w-md relative group">
          <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
            <FaSearch size={10} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Item, Buyer, ID..."
            className="w-full bg-[#111827] border border-white/10 pl-10 pr-4 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white/40"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto min-w-[200px] relative group">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#111827] mb-2 block ml-1 text-right md:mr-1">
            Status Filter
          </label>
          <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
            <FaFilter size={10} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#111827] border border-white/10 pl-10 pr-10 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 appearance-none cursor-pointer transition-all"
          >
            <option value="ALL">ALL ENTITIES</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")} ONLY
              </option>
            ))}
          </select>
          <div className="absolute bottom-4 right-4 pointer-events-none text-white/20 text-[8px]">
            ▼
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/[0.05] border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center w-16">
                  Img
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  Order ID
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  Item Name
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  Buyer
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  House
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-right">
                  Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-20 text-center text-white animate-pulse uppercase text-[10px] tracking-widest"
                  >
                    Loading Order Registry...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const imageUrl =
                    typeof order.itemImage === "string"
                      ? order.itemImage
                      : order.itemImage?.url;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-4 py-4 border-r border-white/5 text-center">
                        <div className="w-9 h-9 rounded-xs bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={order.itemTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaBox className="text-white/20" size={12} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 font-mono text-[10px] text-white/60">
                        #{order.id || order.auctionId}
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 text-xs font-bold uppercase tracking-wider text-white max-w-[200px] truncate">
                        {order.itemTitle}
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 text-xs font-bold uppercase tracking-wider text-white">
                        {order.buyerName}
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 text-[11px] font-mono text-white/80">
                        {order.houseName}
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 text-right font-mono text-xs font-bold text-white">
                        ₹{order.orderAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 text-center">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/tenant/order-details/${order.id}`)}
                          className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:underline transition-all"
                        >
                          Details <FaExternalLinkAlt size={8} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest"
                  >
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

     
        <Pagination
          currentPage={page}
          paginationMeta={pagination}
          isLoading={loading}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AdminOrders;