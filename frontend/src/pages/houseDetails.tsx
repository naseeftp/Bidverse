import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import publicAuctionService from "../services/publicAuction.service";
import Pagination from "../components/user/pagination";
import AuctionCard from "../components/user/auctionCard";
import type { AuctionHouseProfileDTO } from "../types/auctionHouse.type";
import type { AuctionItemListDTO } from "../types/auctionItem.dto";
import type { IPaginationMeta } from "../types/auth.type";
import chatService from "../services/chat.service";

const ITEM_STATUS_FILTERS = [
  { value: "all", label: "All Items" },
  { value: "SCHEDULED", label: "Available" },
  { value: "SOLD", label: "SOLD Auctions" },
  { value: "PASSED", label: "Passed Auctions" }
];

const PublicAuctionHouseDetailsPage: React.FC = () => {
  const { houseId } = useParams<{ houseId: string }>();
  const navigate = useNavigate();

  const [house, setHouse] = useState<AuctionHouseProfileDTO | null>(null);
  const [items, setItems] = useState<AuctionItemListDTO[]>([]);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false)

  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchDebounce, setSearchDebounce] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const delayedDebounceFn = setTimeout(() => {
      setSearchDebounce(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(delayedDebounceFn);
  }, [searchQuery]);

  const fetchHouseCatalogDetails = useCallback(async () => {
    if (!houseId) return;
    setLoading(true);
    try {
      const response = await publicAuctionService.getHouseDetailsWithAuctions(
        houseId,
        page,
        6,
        searchDebounce || undefined,
        statusFilter === "all" ? undefined : statusFilter
      );

      if (response.success && response.data && response.data.length > 0) {
        const pagePayload = response.data[0];

        setHouse(pagePayload.auctionHouse || null);
        setItems(pagePayload.items || []);
        setPagination(response.pagination || null);

      } else {
        toast.error(response.message || "Failed to locate institutional node");
        navigate("/auctions");
      }
    } catch {
      toast.error("Internal connection dropped syncing network nodes");
      navigate("/auctions");
    } finally {
      setLoading(false);
    }
  }, [houseId, page, searchDebounce, statusFilter, navigate]);

  useEffect(() => {
    fetchHouseCatalogDetails();
  }, [fetchHouseCatalogDetails]);

  const handleStatusToggle = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    setIsDropdownOpen(false);
  };

  const handleInitiateChat = async () => {
    setIsChatLoading(true);
    try {
      const payload = {
        receiverId: house?.ownerId ?? '',
        receiverRole: 'tenant'
      }
      const response = await chatService.getOrCreateConversation(payload)
      if (response.success && response.data) {
        navigate('/chat')
      } else {
        toast.error(response.message)
      }
    } catch {
      toast.error('failed to start conversation')
    } finally {
      setIsChatLoading(false)
    }
  }

  const currentFilterLabel = ITEM_STATUS_FILTERS.find(f => f.value === statusFilter)?.label || "All Items";

  if (loading && !house) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center text-[#1F1F1F]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#C9653B] animate-ping" />
          <p className="text-xs font-bold font-mono tracking-widest uppercase text-[#6B6B6B]">Syncing Merchant Nodes...</p>
        </div>
      </div>
    );
  }

  if (!house) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#1F1F1F] font-sans antialiased selection:bg-[#C9653B]/20">


      <header className="bg-white border-b border-[#E6E0DA] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C9653B_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02]" />

        <div className="max-w-7xl mx-auto px-6 py-16 sm:px-8 relative z-10">
          <button
            onClick={() => navigate("/auctions")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6B6B6B] hover:text-[#C9653B] transition-colors mb-10 uppercase tracking-widest group/back cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 transform group-hover/back:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Registry Index
          </button>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="relative flex-shrink-0">
              {house.profileImage && house.profileImage.trim() !== "" ? (
                <img
                  src={house.profileImage}
                  alt={house.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover bg-[#FFF9F4] border border-[#E6E0DA] shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#FFF9F4] border border-[#E6E0DA] flex items-center justify-center font-serif font-black text-2xl text-[#C9653B]">
                  {(house.name || "AH").substring(0, 2).toUpperCase()}
                </div>
              )}
              {house.isVerified && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#E6F4EA] border border-[#137333]/20 rounded-full flex items-center justify-center shadow-md" title="Verified Operator Node">
                  <svg className="w-3 h-3 text-[#137333] fill-current" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 00-.707.293l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414 0l7-7a1 1 0 000-1.414l-7-7A1 1 0 0010 2zm-1 9l-2-2 1.414-1.414L9 9.172l3.793-3.793L14 6.793 9 11z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 max-w-4xl">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1F1F1F] font-serif uppercase">
                  {house.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {house.yearEstablished && (
                    <span className="text-[10px] font-bold text-[#6B6B6B] tracking-widest uppercase bg-[#FFF9F4] px-2.5 py-1 rounded-lg border border-[#E6E0DA]">
                      Est. {house.yearEstablished}
                    </span>
                  )}
                  {house.categories?.map((cat, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-[#C9653B] tracking-wider uppercase bg-[#C9653B]/5 px-2.5 py-1 rounded-lg border border-[#C9653B]/10">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#6B6B6B] font-normal leading-relaxed">
                {house.briefDescription || "No institutional business overview statement has been published by this merchant node."}
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-[#6B6B6B] font-medium border-t border-[#E6E0DA]/60">
                <div className="flex items-center gap-2">
                  <span className="text-[#C9653B] font-bold">Location:</span>
                  <span>{house.fullAddress ? `${house.fullAddress}, ` : ""}{house.city}, {house.state}, {house.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C9653B] font-bold">Email:</span>
                  <a href={`mailto:${house.businessEmail}`} className="hover:underline text-[#1F1F1F]">{house.businessEmail}</a>
                </div>
                {house.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#C9653B] font-bold">Network:</span>
                    <span>{house.phone}</span>
                  </div>
                )}
              </div>
              <div className="pt-4 flex">
                <button
                  type="button"
                  disabled={isChatLoading}
                  onClick={handleInitiateChat}
                  className="inline-flex items-center gap-2.5 px-5 py-3 text-xs font-bold tracking-widest uppercase bg-[#1F1F1F] text-white border border-[#1F1F1F] rounded-xl hover:bg-transparent hover:text-[#1F1F1F] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 cursor-pointer shadow-sm shadow-[#1F1F1F]/10"
                >
                  {isChatLoading ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                  )}
                  {isChatLoading ? "Initializing Node..." : "Inquire / Contact House"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-6 py-16 sm:px-8">


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 w-full border-b border-[#E6E0DA] pb-8">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1F1F1F] font-serif">
              House Inventory Catalog
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5 font-normal">
              Filter through matching line items hosted directly by this operator network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">

            <div className="w-full sm:w-80 relative group/search">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#6B6B6B]">
                <svg className="w-4 h-4 fill-none stroke-current transition-colors duration-200 group-focus-within/search:text-[#C9653B]" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inventory title terms..."
                className="w-full pl-11 pr-16 py-3.5 text-xs bg-white border border-[#E6E0DA] rounded-2xl text-[#1F1F1F] placeholder-[#6B6B6B]/60 shadow-sm focus:outline-none focus:border-[#C9653B] focus:ring-4 focus:ring-[#C9653B]/5 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#6B6B6B] hover:text-[#C9653B] transition-colors text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>


            <div className="relative w-full sm:w-56" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-[#E6E0DA] rounded-2xl px-4 py-3.5 flex items-center justify-between text-xs font-bold tracking-wide uppercase text-[#1F1F1F] shadow-sm hover:border-[#C9653B] transition-all focus:outline-none cursor-pointer select-none"
              >
                <span>{currentFilterLabel}</span>
                <svg
                  className={`w-4 h-4 text-[#6B6B6B] transition-transform duration-200 ${isDropdownOpen ? "transform rotate-180 text-[#C9653B]" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-[#E6E0DA] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="py-1">
                    {ITEM_STATUS_FILTERS.map((filter) => {
                      const isSelected = statusFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          onClick={() => handleStatusToggle(filter.value)}
                          className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wide uppercase transition-colors flex items-center justify-between cursor-pointer ${isSelected
                              ? "bg-[#C9653B]/5 text-[#C9653B]"
                              : "text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#FFF9F4]"
                            }`}
                        >
                          <span>{filter.label}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9653B]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>


        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white border border-[#E6E0DA] rounded-xl h-[340px] w-full max-w-[360px] mx-auto animate-pulse shadow-sm" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#E6E0DA] rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm mt-12">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F4] border border-[#E6E0DA] flex items-center justify-center text-[#C9653B] mx-auto mb-4 font-bold font-mono">?</div>
            <p className="text-base font-bold text-[#1F1F1F]">No Assets Found</p>
            <p className="text-xs text-[#6B6B6B] mt-1.5">No matching active auction contracts are currently listed under this selection criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {items.map((item) => (
              <AuctionCard key={item.auctionItemId} item={item} />
            ))}
          </div>
        )}


        <div className="mt-12">
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            loading={loading}
          />
        </div>

      </main>
    </div>
  );
};

export default PublicAuctionHouseDetailsPage;