import React, { useEffect, useState, useCallback } from "react";
import publicAuctionService from "../services/publicAuction.service";
import type { PublicAuctionHouseResponseDTO } from "../types/auth.type";
import type { IPaginationMeta } from "../types/auth.type";
import toast from "react-hot-toast";
import Pagination from "../components/user/pagination";

const AUCTION_CATEGORIES = [
  { value: "all", label: "All Specialties" },
  { value: "Fine Art & Antiquities", label: "Fine Art & Antiquities" },
  { value: "Luxury & Estate Jewelry", label: "Luxury & Estate Jewelry" },
  { value: "Automotive & Vehicles", label: "Automotive & Vehicles" },
  { value: "Real Estate & Property", label: "Real Estate & Property" },
  { value: "Industrial & Heavy Equipment", label: "Industrial & Heavy Equipment" },
  { value: "General Estate & Liquidation", label: "General Estate & Liquidation" },
  { value: "Electronics & Digital Assets", label: "Electronics & Digital Assets" }
];

const PublicAuctionHouses: React.FC = () => {
  const [houses, setHouses] = useState<PublicAuctionHouseResponseDTO[]>([]);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const delayedDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayedDebounceFn);
  }, [searchQuery]);

  const fetchHouses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await publicAuctionService.listAllPublicAuctionHouses(page, 6, search, categoryFilter);
      if (response.success) {
        setHouses(response.data ?? []);
        setPagination(response.pagination ?? null);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to sync registry");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);


  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#1F1F1F] font-sans antialiased selection:bg-[#C9653B]/20">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:px-8">


        <div className="relative max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9653B]/5 rounded-full border border-[#C9653B]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9653B] animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-[#C9653B] uppercase">
              Global Partner Index
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1F1F1F] font-serif">
            Verified Auction Houses
          </h1>
          <p className="text-base text-[#6B6B6B] font-normal leading-relaxed">
            Discover and interact with elite global nodes certified for fine art curation, dynamic estate liquidity, and secure luxury item escrow.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12 w-full">

          <div className="w-full md:max-w-md relative group/search">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#6B6B6B]">
              <svg className="w-4 h-4 fill-none stroke-current transition-colors duration-200 group-focus-within/search:text-[#C9653B]" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by house Name, Category"
              className="w-full pl-11 pr-16 py-3.5 text-xs bg-white border border-[#E6E0DA] rounded-2xl text-[#1F1F1F] placeholder-[#6B6B6B]/60 shadow-sm focus:outline-none focus:border-[#C9653B] focus:ring-4 focus:ring-[#C9653B]/5 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#6B6B6B] hover:text-[#C9653B] transition-colors text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="w-full md:w-64 relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white border border-[#E6E0DA] rounded-2xl text-xs font-bold text-[#1F1F1F] tracking-wide focus:outline-none focus:border-[#C9653B] focus:ring-4 focus:ring-[#C9653B]/5 shadow-sm transition-all duration-200 cursor-pointer"
            >
              {AUCTION_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="text-[#1F1F1F] font-semibold bg-white">
                  {cat.label}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#1F1F1F]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white border border-[#E6E0DA] rounded-3xl h-80 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white border border-[#E6E0DA] rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F4] border border-[#E6E0DA] flex items-center justify-center text-[#C9653B] mx-auto mb-4 font-bold">!</div>
            <p className="text-base font-bold text-[#1F1F1F]">No Houses Registered</p>
            <p className="text-xs text-[#6B6B6B] mt-1.5">The global federated merchant directory query returned zero matching nodes.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <article
                key={house.houseId}
                className="bg-white border border-[#E6E0DA] rounded-3xl shadow-sm hover:shadow-xl hover:border-[#C9653B]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-5">
                      <div className="relative flex-shrink-0">
                        {house.profileImage && house.profileImage.trim() !== "" ? (
                          <img
                            src={house.profileImage}
                            alt={house.businessName}
                            className="w-16 h-16 rounded-2xl object-cover bg-[#FFF9F4] border border-[#E6E0DA] group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-[#FFF9F4] border border-[#E6E0DA] flex items-center justify-center font-bold text-sm text-[#C9653B] tracking-wide group-hover:scale-105 transition-transform duration-300">
                            {(house.businessName || "AH").substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        {house.isVerified && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E6F4EA] border border-[#137333]/20 rounded-full flex items-center justify-center shadow-sm" title="Verified Operator Node">
                            <svg className="w-2.5 h-2.5 text-[#137333] fill-current" viewBox="0 0 20 20">
                              <path d="M10 2a1 1 0 00-.707.293l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414 0l7-7a1 1 0 000-1.414l-7-7A1 1 0 0010 2zm-1 9l-2-2 1.414-1.414L9 9.172l3.793-3.793L14 6.793 9 11z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 py-0.5">
                        <h2 className="text-lg font-bold text-[#1F1F1F] tracking-tight group-hover:text-[#C9653B] transition-colors duration-200">
                          {house.businessName}
                        </h2>
                        {house.yearEstablished && (
                          <span className="inline-block text-[11px] font-semibold text-[#6B6B6B] tracking-wide uppercase bg-[#FFF9F4] px-2 py-0.5 rounded border border-[#E6E0DA]">
                            Est. {house.yearEstablished}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-1.5 min-h-[26px]">
                      {house.categories && house.categories.length > 0 ? (
                        house.categories.map((cat, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center text-[9px] font-bold italic text-[#555555] tracking-wider uppercase px-0.5 py-1">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-bold italic text-[#555555] tracking-wider uppercase px-0.5 py-1">
                          General Specialty
                        </span>
                      )}
                    </div>
                    <p className="mt-6 text-xs leading-relaxed text-[#3A3A3A] line-clamp-3 min-h-[54px] font-medium">
                      {house.briefDescription || "No institutional business overview statement has been published by this merchant node."}
                    </p>
                  </div>


                </div>

                <div className="space-y-4">
                  {house.address && (
                    <div className="border-t border-b border-[#E6E0DA]/70 mx-8 py-3 flex items-center justify-between text-xs text-[#6B6B6B]">
                      <span className="inline-flex items-center gap-2 font-medium text-[#1F1F1F]">
                        <svg className="w-3.5 h-3.5 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {house.address.city}, {house.address.state}
                      </span>
                      <span className="tracking-widest uppercase font-black text-[9px] text-[#6B6B6B]">
                        {house.address.country}
                      </span>
                    </div>
                  )}

                  <div className="px-8 pb-8">
                    <button className="w-full bg-[#C9653B] hover:bg-[#B2532E] text-white font-bold text-xs py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#C9653B]/10 cursor-pointer flex items-center justify-center gap-2 group/btn">
                      <span>Visit Auction House</span>
                      <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}

        />

      </div>
    </div>
  );
};

export default PublicAuctionHouses;