import React from "react";
import type { IPaginationMeta } from "../../types/auth.type";

interface PaginationProps {
  pagination: IPaginationMeta | null;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
  loading?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  loading = false
}) => {

  if (!pagination || pagination.totalPages <= 1) return null;
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={loading}
          className={`w-10 h-10 text-xs font-bold rounded-xl border transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${pagination.currentPage === i
              ? "bg-[#C9653B] text-white border-[#C9653B] shadow-md shadow-[#C9653B]/20 scale-105"
              : "bg-white text-[#1F1F1F] border-[#E6E0DA] hover:bg-[#FFF9F4] hover:border-[#C9653B]/40"
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  }

  return (
    <div className="mt-20 flex items-center justify-center">
      <div className="inline-flex items-center gap-1.5 bg-white p-2 border border-[#E6E0DA] rounded-2xl shadow-md">

        <button
          onClick={() => onPageChange(Math.max(pagination.currentPage - 1, 1))}
          disabled={!pagination.hasPrevPage || loading}
          className="h-10 px-4 text-xs font-bold rounded-xl text-[#6B6B6B] hover:bg-[#FFF9F4] hover:text-[#C9653B] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6B6B6B] flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed select-none"
        >
          <svg className="w-4 h-4 mr-1.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        <div className="flex items-center gap-1.5 px-1">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(Math.min(pagination.currentPage + 1, pagination.totalPages))}
          disabled={!pagination.hasNextPage || loading}
          className="h-10 px-4 text-xs font-bold rounded-xl text-[#6B6B6B] hover:bg-[#FFF9F4] hover:text-[#C9653B] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6B6B6B] flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed select-none"
        >
          Next
          <svg className="w-4 h-4 ml-1.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </div>

  )

}

export default Pagination