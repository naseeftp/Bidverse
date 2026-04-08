import React from "react";
import { FaUsers, FaGavel, FaWallet, FaArrowUp, FaArrowDown } from "react-icons/fa";

const AdminDashboardContent: React.FC = () => {
    // Shared Style Classes
    const cardBase = "bg-white border border-[#E5E7EB] p-6 rounded-sm shadow-sm";
    const labelSmall = "text-[10px] font-bold uppercase tracking-widest text-[#6B7280]";

    return (
        <div className="space-y-8 p-2">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-light text-[#0F172A] uppercase tracking-tight">
                    System <span className="font-bold text-[#D4AF37]">Overview</span>
                </h1>
                <p className="text-[11px] text-[#6B7280] uppercase tracking-widest mt-1">
                    Real-time platform metrics and administrative logs
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cardBase}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={labelSmall}>Total Volume</p>
                            <h3 className="text-2xl font-light text-[#0F172A] mt-1">$428,190.00</h3>
                        </div>
                        <div className="p-3 bg-[#F3F4F6] text-[#D4AF37]">
                            <FaWallet size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#16A34A]">
                        <FaArrowUp /> 12% <span className="text-[#6B7280]">VS LAST MONTH</span>
                    </div>
                </div>

                <div className={cardBase}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={labelSmall}>Active Bidders</p>
                            <h3 className="text-2xl font-light text-[#0F172A] mt-1">12,402</h3>
                        </div>
                        <div className="p-3 bg-[#F3F4F6] text-[#111827]">
                            <FaUsers size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#16A34A]">
                        <FaArrowUp /> 5.4% <span className="text-[#6B7280]">NEW REGISTRATIONS</span>
                    </div>
                </div>

                <div className={cardBase}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={labelSmall}>Live Auctions</p>
                            <h3 className="text-2xl font-light text-[#0F172A] mt-1">184</h3>
                        </div>
                        <div className="p-3 bg-[#F3F4F6] text-[#D4AF37]">
                            <FaGavel size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#DC2626]">
                        <FaArrowDown /> 2% <span className="text-[#6B7280]">CLOSING SOON</span>
                    </div>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white border border-[#E5E7EB] rounded-sm shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5E7EB] flex justify-between items-center bg-white">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F172A]">Recent Activity Log</h3>
                    <button className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37] pb-0.5 hover:text-[#111827] hover:border-[#111827] transition-all">
                        Download Report
                    </button>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Transaction ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Entity</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                        {[
                            { id: "#TRX-94021", name: "Vintage Rolex Submariner", price: "$12,400", status: "Verified" },
                            { id: "#TRX-94022", name: "Auction House: Sotheby's", price: "$0.00", status: "Pending" },
                            { id: "#TRX-94023", name: "Premium Membership", price: "$499.00", status: "Verified" },
                            { id: "#TRX-94024", name: "Art: 'Blue Silence'", price: "$8,200", status: "Failed" },
                        ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#F3F4F6]/50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-[#6B7280]">{row.id}</td>
                                <td className="px-6 py-4 text-xs font-bold text-[#0F172A]">{row.name}</td>
                                <td className="px-6 py-4 text-xs text-[#0F172A]">{row.price}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                                        row.status === 'Verified' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 
                                        row.status === 'Pending' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 
                                        'bg-[#DC2626]/10 text-[#DC2626]'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboardContent;