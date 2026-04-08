import React from "react";
import { 
    
    FaUsers, 
    FaGavel, 
    FaChartLine, 
    FaCog, 
    FaSignOutAlt, 
    FaShieldAlt 
} from "react-icons/fa";

const AdminDashboard: React.FC = () => {
    // Shared Styles
    const navItemStyle = "flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B7280] hover:text-[#D4AF37] hover:bg-[#1f2937] transition-all cursor-pointer border-l-4 border-transparent hover:border-[#D4AF37]";
    const cardStyle = "bg-[#FFFFFF] border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-shadow";

    return (
        <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
            
            {/* --- SIDEBAR --- */}
            <aside className="w-72 bg-[#111827] text-white flex flex-col shadow-2xl">
                <div className="p-8 flex items-center gap-3 border-b border-gray-800">
                    <FaShieldAlt className="text-[#D4AF37] text-2xl" />
                    <span className="text-sm font-light uppercase tracking-[0.3em]">BidVerse <span className="text-[#D4AF37] font-bold">HQ</span></span>
                </div>

                <nav className="flex-grow mt-6">
                    <div className={navItemStyle + " text-[#D4AF37] border-[#D4AF37] bg-[#1f2937]"}>
                         Overview
                    </div>
                    <div className={navItemStyle}><FaUsers /> Management</div>
                    <div className={navItemStyle}><FaGavel /> Live Auctions</div>
                    <div className={navItemStyle}><FaChartLine /> Analytics</div>
                    <div className={navItemStyle}><FaCog /> System Settings</div>
                </nav>

                <div className="p-6 border-t border-gray-800">
                    <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">
                        <FaSignOutAlt /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow flex flex-col">
                
                {/* HEADER */}
                <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-10">
                    <div>
                        <h1 className="text-[#0F172A] text-xs font-bold uppercase tracking-[0.2em]">Command Console</h1>
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-widest">System Status: <span className="text-[#16A34A] font-bold">Operational</span></p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[11px] font-bold text-[#0F172A]">Root Admin</p>
                            <p className="text-[9px] text-[#6B7280] uppercase">System Level 5</p>
                        </div>
                        <div className="w-10 h-10 bg-[#111827] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* DASHBOARD BODY */}
                <div className="p-10 space-y-8">
                    
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Total Revenue" value="$128,430" change="+12.5%" icon={<FaChartLine />} />
                        <StatCard title="Active Users" value="1,240" change="+3.2%" icon={<FaUsers />} />
                        <StatCard title="Total Bids" value="45,092" change="+18.1%" icon={<FaGavel />} />
                        <StatCard title="Active Houses" value="84" change="0%" icon={<FaShieldAlt />} />
                    </div>

                    {/* CONTENT ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* RECENT ACTIVITY TABLE */}
                        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-sm shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-[#E5E7EB] flex justify-between items-center">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F172A]">System Logs</h3>
                                <button className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">View All</button>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F3F4F6] text-[10px] uppercase tracking-widest text-[#6B7280]">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Event</th>
                                            <th className="px-6 py-4 font-bold">Entity</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB] text-xs text-[#0F172A]">
                                        <TableRow event="Auction Created" entity="Rolex GMT-Master" status="Success" />
                                        <TableRow event="New User Reg" entity="john_doe@mail.com" status="Pending" />
                                        <TableRow event="Payment Processed" entity="TXN-9402" status="Success" />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SYSTEM HEALTH */}
                        <div className={cardStyle}>
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F172A] mb-6">Security Level</h3>
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-32 h-32 flex items-center justify-center border-4 border-[#D4AF37] rounded-full">
                                    <span className="text-2xl font-light text-[#111827]">98%</span>
                                </div>
                                <p className="mt-6 text-[10px] text-center text-[#6B7280] uppercase tracking-widest leading-loose">
                                    Server Encryption: AES-256 <br/>
                                    Database: Synchronized
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, change, icon }: any) => (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 relative overflow-hidden group">
        <div className="text-[#D4AF37] mb-4 text-xl group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">{title}</h4>
        <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-light text-[#0F172A]">{value}</span>
            <span className="text-[9px] text-[#16A34A] font-bold">{change}</span>
        </div>
        <div className="absolute top-0 right-0 w-1 h-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
);

const TableRow = ({ event, entity, status }: any) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-medium">{event}</td>
        <td className="px-6 py-4 text-[#6B7280]">{entity}</td>
        <td className="px-6 py-4">
            <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${
                status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
            }`}>
                {status}
            </span>
        </td>
    </tr>
);

export default AdminDashboard;