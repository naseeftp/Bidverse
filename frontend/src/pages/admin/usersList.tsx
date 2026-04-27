import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../services/admin.service";
import toast from "react-hot-toast";
import type { UserResponseDTO, IPaginationMeta } from "../../types/auth.type";
import { FaExternalLinkAlt, FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPageination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate()
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.listAllusers(page, 10, search, statusFilter);
      if (response.success) {
        setUsers(response.data ?? []);
        setPageination(response.pagination ?? null);
      }
    } catch {
      toast.error("Failed to sync registry");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchUsers, search, statusFilter,page]);

  return (
    <div className="space-y-6">


      <div className="flex flex-col md:flex-row justify-between items-end gap-4">


        <div className="w-full max-w-md relative group">

          <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
            <FaSearch size={10} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Name,Email,Id"
            className="w-full bg-[#111827] border border-white/10 pl-10 pr-4 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white"
          />
        </div>


        <div className="w-full md:w-auto min-w-[200px] relative group">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block ml-1 text-right md:mr-1">
            Filter Status
          </label>
          <div className="absolute bottom-3.5 left-4 text-white/20 group-focus-within:text-white transition-colors">
            <FaFilter size={10} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full bg-[#111827] border border-white/10 pl-10 pr-10 py-3 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 appearance-none cursor-pointer transition-all"
          >
            <option value="all">ALL ENTITIES</option>
            <option value="active">ACTIVE ONLY</option>
            <option value="blocked">BLOCKED ONLY</option>
          </select>
          <div className="absolute bottom-4 right-4 pointer-events-none text-white/20 text-[8px]">▼</div>
        </div>
      </div>

     
      <div className="bg-[#111827] rounded-sm border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.05] border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5">Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white border-r border-white/5 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white text-right">Action</th>
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
                    <td className="px-6 py-4 border-r border-white/5 font-mono text-[10px] text-white/60">#{user.id}</td>
                    <td className="px-6 py-4 border-r border-white/5 text-xs font-bold uppercase tracking-wider text-white">{user.name}</td>
                    <td className="px-6 py-4 border-r border-white/5 text-[11px] font-mono text-white/80 lowercase">{user.email}</td>
                    <td className="px-6 py-4 border-r border-white/5 text-center">
                      <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px] border ${user.isActive ? "bg-white text-black border-white" : "border-white/20 text-white/40"
                        }`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={()=>navigate(`/admin/user/${user.id}`)} className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">
                        Details <FaExternalLinkAlt size={8} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-white/50 text-[10px] uppercase tracking-widest">No Users Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

       
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
    </div>
  );
};

export default UsersListPage;