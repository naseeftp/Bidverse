import React from "react";
import type { IPaginationMeta } from "../../types/auth.type";

interface PaginationProps {
  currentPage: number;
  paginationMeta: IPaginationMeta | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  paginationMeta,
  isLoading,
  onPageChange,
}) => {
  const totalPages = paginationMeta?.totalPages || 1;

  return (
    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-[#111827]">
      <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">
        Displaying Page <span className="underline">{currentPage}</span> OF {totalPages}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-[10px] uppercase"
        >
          Prev
        </button>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-[10px] uppercase"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;