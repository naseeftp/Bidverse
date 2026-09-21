import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import revenueService from "../../services/revenue.service";

import type {
  TenantRevenueBreakdownResponseDTO,
  RevenueGranularity,
  TenantIncomingRevenueRowDTO,
} from "../../types/tenantrRevenue.type";
import type { IPaginationMeta } from "../../types/auth.type";
import Pagination from "../../components/tenant/pagination";

const RANGE_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const GRANULARITIES: { label: string; value: RevenueGranularity }[] = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

const sourceLabel = (source: string) =>
  source === "slot_booking"
    ? "Slot booking fee"
    : source === "order"
      ? "Order settlement"
      : "Unknown";

const RevenueTrendChart: React.FC<{
  points: { date: string; revenue: number }[];
}> = ({ points }) => {
  const width = 760;
  const height = 200;
  const padX = 12;
  const padY = 16;

  if (points.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-xs text-[#475569] font-sans bg-[#F5F7FB] rounded-lg border border-[#E2E8F0]">
        No revenue recorded in this window.
      </div>
    );
  }

  const values = points.map((p) => p.revenue);
  const max = Math.max(...values, 1);
  const span = max || 1;

  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padX + stepX * i,
    y: padY + (height - padY * 2) * (1 - p.revenue / span),
    ...p,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(
    1
  )} ${height - padY} L ${coords[0].x.toFixed(1)} ${height - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-[200px]"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="tenantRevFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2F6FED" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#2F6FED" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <line
        x1={padX}
        y1={height - padY}
        x2={width - padX}
        y2={height - padY}
        className="stroke-[#E2E8F0]"
        strokeWidth="1"
      />
      <path d={areaPath} fill="url(#tenantRevFill)" />
      <path
        d={linePath}
        fill="none"
        className="stroke-[#2F6FED]"
        strokeWidth="2"
      />
      {coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r="3"
          className="fill-white stroke-[#2F6FED]"
          strokeWidth="2"
        />
      ))}
      <text
        x={padX}
        y={height - 2}
        fontSize="10"
        className="fill-[#475569] font-sans"
      >
        {formatShortDate(coords[0].date)}
      </text>
      <text
        x={width - padX}
        y={height - 2}
        fontSize="10"
        className="fill-[#475569] font-sans"
        textAnchor="end"
      >
        {formatShortDate(coords[coords.length - 1].date)}
      </text>
    </svg>
  );
};

const TenantRevenueBreakdownPage: React.FC = () => {
  const today = new Date();
  const defaultStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(toInputDate(defaultStart));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [granularity, setGranularity] = useState<RevenueGranularity>("day");

  const [data, setData] = useState<TenantRevenueBreakdownResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const [txRows, setTxRows] = useState<TenantIncomingRevenueRowDTO[]>([]);
  const [txPagination, setTxPagination] = useState<IPaginationMeta | null>(null);
  const [txPage, setTxPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);

  const rangeAsISO = useCallback(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    return { s: s.toISOString(), e: e.toISOString() };
  }, [startDate, endDate]);

  const fetchBreakdown = useCallback(async () => {
    setLoading(true);
    try {
      const { s, e } = rangeAsISO();
      const response = await revenueService.getTenantRevenueBreakdown(
        s,
        e,
        granularity
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to load revenue breakdown");
    } finally {
      setLoading(false);
    }
  }, [rangeAsISO, granularity]);

  const fetchTransactions = useCallback(
    async (page: number) => {
      setTxLoading(true);
      try {
        const { s, e } = rangeAsISO();
        const response = await revenueService.getTenantIncomingRevenueList(
          s,
          e,
          page,
          10
        );
        if (response.success) {
          setTxRows(response.data ?? []);
          setTxPagination(response.pagination ?? null);
        } else {
          toast.error(response.message);
        }
      } catch {
        toast.error("Failed to load transactions");
      } finally {
        setTxLoading(false);
      }
    },
    [rangeAsISO]
  );

  useEffect(() => {
    fetchBreakdown();
    setTxPage(1);
    fetchTransactions(1);
  }, [startDate, endDate, granularity, fetchBreakdown, fetchTransactions]);

  useEffect(() => {
    fetchTransactions(txPage);
  }, [txPage, fetchTransactions]);

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB] font-sans text-[#0F172A]">
      <div className="max-w-[1024px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-[#E2E8F0] gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Your Revenue
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              What's settled to your account, and where it came from
            </p>
          </div>

          <div className="flex gap-1 bg-[#E2E8F0]/50 p-1 rounded-lg self-start md:self-auto">
            {GRANULARITIES.map((g) => {
              const isActive = granularity === g.value;
              return (
                <button
                  key={g.value}
                  onClick={() => setGranularity(g.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    isActive
                      ? "bg-[#2F6FED] text-white shadow-sm font-semibold"
                      : "text-[#475569] hover:text-[#0F172A]"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#475569] mr-1">Range:</span>
            {RANGE_PRESETS.map((r) => (
              <button
                key={r.days}
                onClick={() => applyPreset(r.days)}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#E2E8F0] bg-[#F5F7FB] text-[#475569] hover:text-[#0F172A] hover:bg-white hover:border-[#2F6FED]/50 transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-[#E2E8F0] bg-white text-[#0F172A] outline-none focus:border-[#2F6FED] focus:ring-1 focus:ring-[#2F6FED]"
            />
            <span className="text-xs text-[#475569]">to</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={toInputDate(today)}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-[#E2E8F0] bg-white text-[#0F172A] outline-none focus:border-[#2F6FED] focus:ring-1 focus:ring-[#2F6FED]"
            />
          </div>
        </div>

        {loading && !data ? (
          <div className="py-24 text-center text-sm font-medium text-[#475569] bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            Reading the ledger…
          </div>
        ) : !data ? (
          <div className="py-24 text-center text-sm text-[#475569] bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            Nothing to read yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-medium text-[#475569]">
                  Total Settled
                </span>
                <div className="text-3xl font-bold tracking-tight tabular-nums mt-1 text-[#2F6FED]">
                  {formatINR(data.totalRevenue)}
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-medium text-[#475569]">
                  Refund Rate
                </span>
                <div
                  className={`text-3xl font-bold tracking-tight tabular-nums mt-1 ${
                    data.refundRate > 15 ? "text-rose-500" : "text-[#0F172A]"
                  }`}
                >
                  {data.refundRate}%
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
                Revenue Over Time
              </h2>
              <RevenueTrendChart points={data.trend} />
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
                Revenue by Source
              </h2>
              <div className="space-y-3">
                {data.bySource.length === 0 ? (
                  <p className="text-xs text-[#475569]">
                    No revenue in this window.
                  </p>
                ) : (
                  (() => {
                    const max = Math.max(
                      ...data.bySource.map((s) => s.amount),
                      1
                    );
                    return data.bySource.map((s) => (
                      <div key={s.source} className="flex items-center gap-3">
                        <span className="w-36 shrink-0 text-xs font-medium text-[#475569]">
                          {sourceLabel(s.source)}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-[#F5F7FB] overflow-hidden border border-[#E2E8F0]">
                          <div
                            className="h-full rounded-full bg-[#2F6FED]"
                            style={{
                              width: `${Math.max((s.amount / max) * 100, 4)}%`,
                            }}
                          />
                        </div>
                        <span className="w-24 shrink-0 text-right text-xs font-semibold tabular-nums text-[#0F172A]">
                          {formatINR(s.amount)}
                        </span>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[#475569]">
                          {s.count}
                        </span>
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Settlements
                </h2>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[650px]">
                  <div className="grid grid-cols-[110px_140px_1fr_110px_100px] gap-4 px-5 py-2.5 text-xs font-semibold text-[#475569] bg-[#F5F7FB] border-b border-[#E2E8F0]">
                    <span>Date</span>
                    <span>Source</span>
                    <span>Auction</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Status</span>
                  </div>

                  {txLoading && txRows.length === 0 ? (
                    <div className="py-8 text-xs text-center text-[#475569]">
                      Loading…
                    </div>
                  ) : txRows.length === 0 ? (
                    <div className="py-8 text-xs text-center text-[#475569]">
                      No settlements in this window.
                    </div>
                  ) : (
                    txRows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[110px_140px_1fr_110px_100px] gap-4 px-5 py-3.5 items-center border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F5F7FB]/60 transition-colors"
                      >
                        <span className="text-xs text-[#475569]">
                          {formatShortDate(row.date)}
                        </span>
                        <span className="text-xs font-medium text-[#0F172A]">
                          {sourceLabel(row.source)}
                        </span>
                        <span className="text-xs text-[#475569] truncate">
                          {row.auctionTitle ?? "—"}
                        </span>
                        <span className="text-xs font-semibold text-right tabular-nums text-[#0F172A]">
                          {formatINR(row.amount)}
                        </span>
                        <span className="text-right">
                          <span
                            className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                              row.status?.toLowerCase() === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[#E2E8F0] bg-[#F5F7FB]/30">
                <Pagination
                  currentPage={txPage}
                  pagination={txPagination}
                  loading={txLoading}
                  onPageChange={setTxPage}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantRevenueBreakdownPage;