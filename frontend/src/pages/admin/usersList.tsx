import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../services/admin.service";
import toast from "react-hot-toast";
import type { UserResponseDTO, IPaginationMeta } from "../../types/auth.type";
import { FaExternalLinkAlt } from "react-icons/fa";

const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPageination] = useState<IPaginationMeta | null>(null)
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.listAllusers(page,10,search);
      if (response.success) {
        setUsers(response.data ?? []);
        setPageination(response.pagination ?? null)

      }
    } catch {
      toast.error("Failed to sync registry")
    } finally {
      setLoading(false);
    }
  }, [page, search])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(handler)
  }, [fetchUsers, search]);

  return (
    <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
      <div className="mb-6">
        <div className="relative max-w-md group">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="SEARCH REGISTRY (NAME / EMAIL / ID)..."
            className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[10px] text-white font-black uppercase tracking-[0.2em] focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20"
          />

          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white group-focus-within:w-full transition-all duration-500"></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.05] border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                Name
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">
                Email
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
                <td colSpan={5} className="py-20 text-center text-white animate-pulse uppercase text-[10px] tracking-widest">
                  Loading User Registry...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">

                  <td className="px-6 py-4 border-r border-white/5">
                    <div className="text-white text-[10px] font-mono tracking-tight">
                      {user.id}
                    </div>
                  </td>


                  <td className="px-6 py-4 border-r border-white/5">
                    <div className="text-white text-xs font-bold uppercase tracking-wider">
                      {user.name}
                    </div>
                  </td>


                  <td className="px-6 py-4 border-r border-white/5">
                    <div className="text-white text-[11px] font-mono">
                      {user.email}
                    </div>
                  </td>


                  <td className="px-6 py-4 border-r border-white/5 text-center">
                    <span
                      className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${user.isActive
                          ? "bg-white text-black border-white"
                          : "bg-transparent border-white text-white opacity-50"
                        }`}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>


                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">
                      Details <FaExternalLinkAlt size={8} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest">
                  No Users Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination UI */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">
          Displaying Page <span className="underline">{page}</span> OF {pagination?.totalPages || 1}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1 || loading}
            className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-[10px]"
          >
            PREV
          </button>

          <button
            onClick={() => setPage(prev => Math.min(pagination?.totalPages || 1, prev + 1))}
            disabled={page === pagination?.totalPages || loading}
            className="p-2 border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-[10px]"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;