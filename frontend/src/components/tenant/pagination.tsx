import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { IPaginationMeta } from "../../types/auth.type"; 

interface PaginationProps {
    pagination: IPaginationMeta | null;
    currentPage: number;
     // eslint-disable-next-line no-unused-vars
    onPageChange: (newPage: number) => void;
    loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    pagination,
    currentPage,
    onPageChange,
    loading = false,
}) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === pagination.totalPages;

    return (
        <div className="max-w-7xl mx-auto mt-10 flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-[#E2E8F0] shadow-sm">
            <p className="text-xs font-semibold text-[#475569] tracking-wide">
                Showing page{" "}
                <span className="text-[#0F172A] font-bold underline">
                    {currentPage}
                </span>{" "}
                of {pagination.totalPages}
            </p>

            <div className="flex gap-3">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={isFirstPage || loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#475569] hover:bg-[#F5F7FB] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <FaChevronLeft size={10} /> PREV
                </button>
                <button
                    onClick={() =>
                        onPageChange(Math.min(pagination.totalPages, currentPage + 1))
                    }
                    disabled={isLastPage || loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#475569] hover:bg-[#F5F7FB] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    NEXT <FaChevronRight size={10} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;