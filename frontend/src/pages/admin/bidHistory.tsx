import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { bidHistoryDTO } from "../../types/bid.dto";
import Pagination from "../../components/admin/pagination";
import toast from "react-hot-toast";
import bidService from "../../services/bid.service";
import type { IPaginationMeta } from "../../types/auth.type";
import { FaArrowLeft as ArrowIcon, FaFilter as FilterIcon, FaTimes as TimesIcon } from "react-icons/fa";

const AdminBidHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bids, setBids] = useState<bidHistoryDTO[]>([]);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>("");

  const navigate = useNavigate();

  const fetchBids = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const min = appliedMinPrice ? Number(appliedMinPrice) : undefined;
      const max = appliedMaxPrice ? Number(appliedMaxPrice) : undefined;
      const result = await bidService.getBidHistory(id, page, 10, min, max);
      if (result && result.success && result.data) {
        setBids(result.data ?? []);
        setPagination(result.pagination ?? null);
      } else {
        toast.error(result?.message || "Failed to load bid history");
      }
    } catch {
      toast.error("Failed to sync bid registry");
    } finally {
      setLoading(false);
    }
  }, [id, page, appliedMaxPrice, appliedMinPrice]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      toast.error("Min price cannot be greater than Max price");
      return;
    }
    setPage(1);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const handleResetFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "winning":
      case "won":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] bg-white text-black border border-white">
            Winning
          </span>
        );
      case "outbid":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/40 text-white">
            Outbid
          </span>
        );
      case "cancelled":
      case "rejected":
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/20 text-white/40">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border border-white/20 text-white/60">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[10px] font-black text-[#111827] hover:underline uppercase tracking-[0.2em] mb-3 transition-all"
        >
          <ArrowIcon size={9} /> BACK TO AUCTIONS
        </button>
        <h1 className="text-xl font-black uppercase tracking-[0.25em] text-[#111827]">
          Bid Audit Logs
        </h1>
        <p className="text-[10px] font-bold text-[#111827] uppercase tracking-widest mt-1">
          System Administration Panel — Item ID:{" "}
          <span className="font-mono font-semibold">
            #{id?.slice(-8).toUpperCase()}
          </span>
        </p>
      </div>

      <form
        onSubmit={handleApplyFilter}
        className="bg-[#111827] rounded-sm border border-white/10 p-5 shadow-xl flex flex-col md:flex-row items-end justify-between gap-4"
      >
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full md:w-auto">
          <div className="w-full sm:w-48 group">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mb-2 block">
              Min Bid Amount
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 100"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 px-4 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30"
            />
          </div>

          <div className="w-full sm:w-48 group">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mb-2 block">
              Max Bid Amount
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 px-4 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {(appliedMinPrice || appliedMaxPrice) && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white border border-white/20 hover:border-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TimesIcon size={9} /> Clear Filter
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black bg-white border border-white hover:bg-white/90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FilterIcon size={9} /> Apply Filter
          </button>
        </div>
      </form>

      <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.05] border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  Bidder
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  Bid Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-20 text-center text-white animate-pulse uppercase text-[10px] font-black tracking-widest"
                  >
                    Syncing Bid Registry...
                  </td>
                </tr>
              ) : bids && bids.length > 0 ? (
                bids.map((bid) => (
                  <tr
                    key={bid.bidId}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4 border-r border-white/5 text-xs font-bold uppercase tracking-wider text-white">
                      {bid.bidderName || "Anonymous Bidder"}
                    </td>
                    <td className="px-6 py-4 border-r border-white/5 font-mono text-xs font-black text-white">
                      ₹{bid.bidAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-r border-white/5 font-mono text-[10px] text-white/60">
                      {bid.bidPlacedAt
                        ? new Date(bid.bidPlacedAt)
                            .toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                            .toUpperCase()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(bid.bidStatus)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-20 text-center text-white/50 text-[10px] font-bold uppercase tracking-widest"
                  >
                    No Bids Recorded For This Item
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

export default AdminBidHistoryPage;