import React, { useCallback, useEffect, useMemo, useState } from "react";
import dashboardService from "../../services/dashboard.service";
import type { DashboardResponseDTO, EscrowStatusBreakdownDTO } from "../../types/dashboard.dto";
import toast from "react-hot-toast";

const formatINR = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatShortDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

type Tone = "emerald" | "rose" | "gold" | "slate";

const toneStyleMap: Record<Tone, { bar: string; badge: string; text: string }> = {
    emerald: {
        bar: "bg-[#16A34A]",
        badge: "bg-emerald-50 text-[#16A34A] border-emerald-200",
        text: "text-[#16A34A]",
    },
    rose: {
        bar: "bg-[#DC2626]",
        badge: "bg-red-50 text-[#DC2626] border-red-200",
        text: "text-[#DC2626]",
    },
    gold: {
        bar: "bg-[#D4AF37]",
        badge: "bg-[#D4AF37]/10 text-[#9A7B1C] border-[#D4AF37]/30",
        text: "text-[#9A7B1C]",
    },
    slate: {
        bar: "bg-[#6B7280]",
        badge: "bg-gray-100 text-[#6B7280] border-[#E5E7EB]",
        text: "text-[#6B7280]",
    },
};

const getStatusTone = (status: string): Tone => {
    const s = status.toLowerCase();
    if (["completed", "approved", "sold", "verified", "paid", "delivered", "released"].some((k) => s.includes(k))) return "emerald";
    if (["refunded", "rejected", "cancelled", "failed"].some((k) => s.includes(k))) return "rose";
    if (["pending", "scheduled", "draft", "processing", "live", "active", "held"].some((k) => s.includes(k))) return "gold";
    return "slate";
};

const titleCase = (s: string) =>
    s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const MetricCardWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:border-[#D4AF37]/40 transition-all h-full flex flex-col justify-between ${className}`}>
        {children}
    </div>
);

const PrimaryMetricCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    trend?: string;
    highlight?: boolean;
}> = ({ title, value, subtitle, trend, highlight = false }) => (
    <MetricCardWrapper>
        <div>
            <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">{title}</span>
                {trend && (
                    <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${highlight
                                ? "bg-[#D4AF37]/10 text-[#9A7B1C] border-[#D4AF37]/30"
                                : "bg-gray-100 text-[#6B7280] border-[#E5E7EB]"
                            }`}
                    >
                        {trend}
                    </span>
                )}
            </div>
            <div className="my-3">
                <div className={`text-3xl font-extrabold tracking-tight font-mono ${highlight ? "text-[#D4AF37]" : "text-[#0F172A]"}`}>
                    {value}
                </div>
            </div>
        </div>
        {subtitle && <p className="text-xs text-[#6B7280] font-medium pt-2 border-t border-[#F3F4F6]">{subtitle}</p>}
    </MetricCardWrapper>
);

const SecondaryStatCard: React.FC<{
    label: string;
    value: string;
    meta?: string;
}> = ({ label, value, meta }) => (
    <MetricCardWrapper>
        <div>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{label}</span>
            <div className="mt-2 mb-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">{value}</span>
            </div>
        </div>
        {meta && <span className="text-[11px] text-[#6B7280] font-medium mt-2 pt-2 border-t border-[#F3F4F6]">{meta}</span>}
    </MetricCardWrapper>
);

const RevenueTrajectoryCard: React.FC<{ points: { date: string; revenue: number }[] }> = ({ points }) => {
    const width = 800;
    const height = 260;
    const padX = 32;
    const padY = 36;

    const values = points.map((p) => p.revenue);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);

    const chartInnerWidth = width - padX * 2;
    const chartInnerHeight = height - padY * 2;

    const coords = useMemo(() => {
        if (points.length === 0) return [];
        return points.map((p, i) => {
            const x = padX + (points.length > 1 ? (i / (points.length - 1)) * chartInnerWidth : chartInnerWidth / 2);
            const normalizedY = (p.revenue - minVal) / (maxVal - minVal || 1);
            const y = height - padY - normalizedY * chartInnerHeight;
            return { x, y, date: p.date, revenue: p.revenue };
        });
    }, [points, maxVal, minVal, chartInnerWidth, chartInnerHeight]);

    const linePath = useMemo(() => {
        if (coords.length === 0) return "";
        if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

        return coords.reduce((acc, pt, i, arr) => {
            if (i === 0) return `M ${pt.x},${pt.y}`;
            const prev = arr[i - 1];
            const cx1 = prev.x + (pt.x - prev.x) / 2;
            const cy1 = prev.y;
            const cx2 = prev.x + (pt.x - prev.x) / 2;
            const cy2 = pt.y;
            return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
        }, "");
    }, [coords]);

    const areaPath = useMemo(() => {
        if (!linePath || coords.length === 0) return "";
        const lastPt = coords[coords.length - 1];
        const firstPt = coords[0];
        return `${linePath} L ${lastPt.x},${height - padY} L ${firstPt.x},${height - padY} Z`;
    }, [linePath, coords, height]);

    return (
        <MetricCardWrapper>
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#E5E7EB] gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Revenue Trajectory Model</h3>
                        <p className="text-xs text-[#6B7280]">Continuous gross revenue growth and trajectory analysis</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-1.5 rounded-lg border border-[#E5E7EB] self-start sm:self-auto">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                        <span className="text-xs font-semibold text-[#111827]">Revenue Curve</span>
                    </div>
                </div>

                {points.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-xs text-[#6B7280] font-mono">
                        No revenue trajectory data available for this interval.
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px] min-w-[500px]">
                            <defs>
                                <linearGradient id="goldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#E5E7EB" strokeWidth="1.5" />
                            <line x1={padX} y1={padY + chartInnerHeight * 0.5} x2={width - padX} y2={padY + chartInnerHeight * 0.5} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />
                            <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />

                            <path d={areaPath} fill="url(#goldAreaGradient)" />
                            <path d={linePath} fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />

                            {coords.map((pt, i) => (
                                <g key={i} className="group cursor-pointer">
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={5}
                                        fill="#111827"
                                        stroke="#D4AF37"
                                        strokeWidth="2"
                                        className="transition-transform duration-200 group-hover:scale-125"
                                    />
                                    <text
                                        x={pt.x}
                                        y={height - padY + 18}
                                        fontSize="10"
                                        className="fill-[#6B7280] font-mono text-center"
                                        textAnchor="middle"
                                    >
                                        {formatShortDate(pt.date)}
                                    </text>
                                    <text
                                        x={pt.x}
                                        y={Math.max(pt.y - 12, 16)}
                                        fontSize="11"
                                        className="fill-[#111827] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                                        textAnchor="middle"
                                    >
                                        {formatINR(pt.revenue)}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                )}
            </div>
        </MetricCardWrapper>
    );
};

const DistributionCard: React.FC<{
    title: string;
    subtitle: string;
    totalLabel?: string;
    rows: { status: string; count: number }[];
    maxCount: number;
}> = ({ title, subtitle, totalLabel, rows, maxCount }) => {
    return (
        <MetricCardWrapper>
            <div>
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
                    {totalLabel && (
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] text-[#111827] font-semibold shrink-0">
                            {totalLabel}
                        </span>
                    )}
                </div>
                <p className="text-xs text-[#6B7280] mb-5 font-medium">{subtitle}</p>

                <div className="space-y-3.5">
                    {rows.length === 0 ? (
                        <div className="text-xs text-[#6B7280] py-4 text-center">No status records found</div>
                    ) : (
                        rows.map((row) => {
                            const tone = getStatusTone(row.status);
                            const style = toneStyleMap[tone];
                            const pct = maxCount > 0 ? Math.max((row.count / maxCount) * 100, 4) : 0;

                            return (
                                <div key={row.status} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#0F172A] font-semibold">{titleCase(row.status)}</span>
                                        <span className="font-mono text-[#111827] font-bold">{row.count}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </MetricCardWrapper>
    );
};

const EscrowBreakdownCard: React.FC<{ rows: EscrowStatusBreakdownDTO[] }> = ({ rows }) => {
    const totalEscrowAmount = useMemo(
        () => rows.reduce((acc, curr) => acc + curr.totalAmount, 0),
        [rows]
    );
    const maxAmount = useMemo(
        () => Math.max(...rows.map((r) => r.totalAmount), 1),
        [rows]
    );

    return (
        <MetricCardWrapper>
            <div>
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-base font-bold text-[#0F172A]">Escrow Vault Breakdown</h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#9A7B1C] font-semibold shrink-0">
                        {formatINR(totalEscrowAmount)}
                    </span>
                </div>
                <p className="text-xs text-[#6B7280] mb-5 font-medium">Funds held, released, and refunded</p>

                <div className="space-y-3.5">
                    {rows.length === 0 ? (
                        <div className="text-xs text-[#6B7280] py-4 text-center">No escrow records found</div>
                    ) : (
                        rows.map((row) => {
                            const tone = getStatusTone(row.status);
                            const style = toneStyleMap[tone];
                            const pct = maxAmount > 0 ? Math.max((row.totalAmount / maxAmount) * 100, 4) : 0;

                            return (
                                <div key={row.status} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[#0F172A] font-semibold">{titleCase(row.status)}</span>
                                            <span className="text-[#6B7280] text-[10px] font-mono">({row.count})</span>
                                        </div>
                                        <span className="font-mono text-[#111827] font-bold">{formatINR(row.totalAmount)}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </MetricCardWrapper>
    );
};

const LeaderboardTableCard: React.FC<{ houses: DashboardResponseDTO["topAuctionHouses"] }> = ({ houses }) => (
    <MetricCardWrapper>
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#E5E7EB] gap-2">
                <div>
                    <h3 className="text-base font-bold text-[#0F172A]">Top Performing Auction Houses</h3>
                    <p className="text-xs text-[#6B7280]">Ranked by overall settled order revenue</p>
                </div>
                <span className="text-xs font-semibold text-[#9A7B1C] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full self-start sm:self-auto">
                    {houses.length} Active Partners
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="text-[#6B7280] font-bold border-b border-[#E5E7EB] text-[11px] uppercase tracking-wider bg-[#F3F4F6]">
                            <th className="py-3 px-3 w-12 text-center rounded-l-lg">Rank</th>
                            <th className="py-3 px-3">Auction House</th>
                            <th className="py-3 px-3 text-right">Settled Revenue</th>
                            <th className="py-3 px-3 text-right rounded-r-lg">Count</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                        {houses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-[#6B7280] font-mono">
                                    No leaderboard records yet.
                                </td>
                            </tr>
                        ) : (
                            houses.map((house, idx) => (
                                <tr key={house.houseId} className="hover:bg-[#F3F4F6] transition-colors">
                                    <td className="py-3.5 px-3 text-center font-mono font-extrabold text-[#D4AF37]">
                                        #{idx + 1}
                                    </td>
                                    <td className="py-3.5 px-3 text-[#0F172A] font-bold text-sm">
                                        {house.houseName}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-[#0F172A] font-bold text-sm">
                                        {formatINR(house.totalRevenue)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-[#6B7280] font-semibold">
                                        {house.orderCount}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </MetricCardWrapper>
);

const AdminDashboardContent: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardResponseDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getAdminDashboard();
            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error("Failed to display dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const houseFunnelMax = useMemo(
        () => Math.max(...(dashboardData?.auctionHouseFunnel.map((f) => f.count) ?? [0]), 1),
        [dashboardData]
    );
    const itemFunnelMax = useMemo(
        () => Math.max(...(dashboardData?.auctionItemFunnel.map((f) => f.count) ?? [0]), 1),
        [dashboardData]
    );
    const orderFunnelMax = useMemo(
        () => Math.max(...(dashboardData?.orderStatusBreakdown.map((f) => f.count) ?? [0]), 1),
        [dashboardData]
    );

    const returnTotal = dashboardData
        ? dashboardData.returnRequestStats.pending +
        dashboardData.returnRequestStats.approved +
        dashboardData.returnRequestStats.rejected
        : 0;

    const returnRows = useMemo(
        () =>
            dashboardData
                ? [
                    { status: "pending", count: dashboardData.returnRequestStats.pending },
                    { status: "approved", count: dashboardData.returnRequestStats.approved },
                    { status: "rejected", count: dashboardData.returnRequestStats.rejected },
                ]
                : [],
        [dashboardData]
    );

    return (
        <div className="min-h-screen w-full bg-[#F3F4F6] text-[#0F172A] font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {loading && !dashboardData ? (
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-24 text-center text-sm font-mono text-[#6B7280]">
                        Gathering latest platform operational data…
                    </div>
                ) : !dashboardData ? (
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-24 text-center text-sm text-[#6B7280]">
                        No dashboard data available.
                    </div>
                ) : (
                    <>
                       
                        <div className="space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Platform Overview</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <PrimaryMetricCard
                                    title="Gross Platform Revenue"
                                    // value={formatINR(dashboardData.overview.totalRevenue)}
                                    value={dashboardData.overview.totalRevenue.toString()}
                                    subtitle={`Generated from ${dashboardData.overview.totalOrders} settled orders`}
                                    trend="Active"
                                    highlight={true}
                                />
                                <PrimaryMetricCard
                                    title="Payment Success Rate"
                                    value={`${dashboardData.overview.paymentSuccessRate}%`}
                                    subtitle="Gateway approval efficiency"
                                    trend={dashboardData.overview.paymentSuccessRate >= 80 ? "Healthy" : "Attention"}
                                />
                                <PrimaryMetricCard
                                    title="Active Auctions"
                                    value={String(dashboardData.overview.activeAuctions)}
                                    subtitle="Live bidding sessions ongoing"
                                    highlight={true}
                                />
                                <PrimaryMetricCard
                                    title="Pending Returns"
                                    value={String(dashboardData.overview.pendingReturnRequests)}
                                    subtitle="Disputes waiting for admin review"
                                    trend={dashboardData.overview.pendingReturnRequests > 0 ? "Action Req." : "Clear"}
                                />
                            </div>
                        </div>
                         <div>
                            <RevenueTrajectoryCard points={dashboardData.revenueTrend} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <SecondaryStatCard
                                label="Registered Platform Users"
                                value={String(dashboardData.overview.totalUsers)}
                                meta="Total buyer and seller accounts"
                            />
                            <SecondaryStatCard
                                label="Auction Houses"
                                value={String(dashboardData.overview.totalAuctionHouses)}
                                meta={`${dashboardData.overview.verifiedAuctionHouses} fully verified partners`}
                            />
                            <SecondaryStatCard
                                label="Total Orders Processed"
                                value={String(dashboardData.overview.totalOrders)}
                                meta="All time platform orders"
                            />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Financial & Fulfillment Pipeline</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <EscrowBreakdownCard rows={dashboardData.escrowBreakdown ?? []} />
                                <DistributionCard
                                    title="Order Statuses"
                                    subtitle="Fulfillment pipeline state"
                                    totalLabel={`${dashboardData.overview.totalOrders} Orders`}
                                    rows={dashboardData.orderStatusBreakdown}
                                    maxCount={orderFunnelMax}
                                />
                                <DistributionCard
                                    title="Return Requests"
                                    subtitle="Dispute resolution breakdown"
                                    totalLabel={`${returnTotal} Filed`}
                                    rows={returnRows}
                                    maxCount={returnTotal || 1}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Network & Catalog Operations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DistributionCard
                                    title="Auction Houses Onboarding"
                                    subtitle="Partner onboarding state breakdown"
                                    totalLabel={`${dashboardData.overview.totalAuctionHouses} Houses`}
                                    rows={dashboardData.auctionHouseFunnel}
                                    maxCount={houseFunnelMax}
                                />
                                <DistributionCard
                                    title="Item Listings Distribution"
                                    subtitle="Catalog status and active auction distribution"
                                    rows={dashboardData.auctionItemFunnel}
                                    maxCount={itemFunnelMax}
                                />
                            </div>
                        </div>

                        <div>
                            <LeaderboardTableCard houses={dashboardData.topAuctionHouses} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardContent;