import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import revenueService from "../../services/revenue.service";
import type {
  RevenueBreakdownResponseDTO,
  RevenueGranularity,
  IncomingRevenueRowDTO,
} from "../../types/revenue.types";
import type { IPaginationMeta } from "../../types/auth.type";
import Pagination from "../../components/admin/pagination";

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};


const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

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

const CommissionTrendChart: React.FC<{
  points: { date: string; commission: number }[];
}> = ({ points }) => {
  const width = 760;
  const height = 200;
  const padX = 12;
  const padY = 20;

  if (points.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-xs text-[#93A2B2] font-sans">
        No commission recorded in this window.
      </div>
    );
  }

  const values = points.map((p) => p.commission);
  const max = Math.max(...values, 1);
  const span = max || 1;

  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padX + stepX * i,
    y: padY + (height - padY * 2) * (1 - p.commission / span),
    ...p,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${
    height - padY
  } L ${coords[0].x.toFixed(1)} ${height - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[200px] w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="commissionFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBA45C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#CBA45C" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      <line
        x1={padX}
        y1={height - padY}
        x2={width - padX}
        y2={height - padY}
        stroke="#2A3B4F"
        strokeWidth="1"
      />
      <line
        x1={padX}
        y1={padY}
        x2={width - padX}
        y2={padY}
        stroke="#2A3B4F"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      <path d={areaPath} fill="url(#commissionFill)" />
      <path d={linePath} fill="none" stroke="#CBA45C" strokeWidth="2" />
      {coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r="3"
          className="fill-[#0E1826] stroke-[#CBA45C]"
          strokeWidth="1.5"
        />
      ))}
      <text
        x={padX}
        y={height - 2}
        fontSize="10"
        className="fill-[#93A2B2] font-mono"
      >
        {formatShortDate(coords[0].date)}
      </text>
      <text
        x={width - padX}
        y={height - 2}
        fontSize="10"
        className="fill-[#93A2B2] font-mono"
        textAnchor="end"
      >
        {formatShortDate(coords[coords.length - 1].date)}
      </text>
    </svg>
  );
};

const sourceLabel = (source: string) =>
  source === "slot_booking"
    ? "Slot booking fee"
    : source === "order"
    ? "Order commission"
    : "Unknown";

const RevenueBreakdownPage: React.FC = () => {
  const today = new Date();
  const defaultStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(toInputDate(defaultStart));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [granularity, setGranularity] = useState<RevenueGranularity>("day");

  const [data, setData] = useState<RevenueBreakdownResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const [txRows, setTxRows] = useState<IncomingRevenueRowDTO[]>([]);
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
      const response = await revenueService.getRevenueBreakdown(s, e, granularity);
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
        const response = await revenueService.getIncomingRevenueList(s, e, page, 10);
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
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    fetchTransactions(txPage);
  }, [txPage]);

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };


  return (
    <div className="min-h-screen w-full bg-[#0E1826] font-sans text-[#EDE8DC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
      `}</style>

      <div className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="mb-8 border-b border-[#2A3B4F] pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#EDE8DC]">
                Revenue Breakdown
              </h1>
              <p className="mt-1 text-xs text-[#93A2B2]">
                Detailed insights into platform commission, auction house performance, and transaction flow.
              </p>
            </div>
        
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-3">
            <div className="flex items-center gap-1 rounded bg-[#0E1826] p-1 border border-[#2A3B4F]">
              {RANGE_PRESETS.map((r) => (
                <button
                  key={r.days}
                  onClick={() => applyPreset(r.days)}
                  className="rounded px-3 py-1 text-xs font-medium text-[#93A2B2] transition-colors hover:text-[#EDE8DC]"
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
                className="rounded border border-[#2A3B4F] bg-[#1B2A3C] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#CBA45C] focus:outline-none"
              />
              <span className="text-xs text-[#93A2B2]">to</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={toInputDate(today)}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-[#2A3B4F] bg-[#1B2A3C] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#CBA45C] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 rounded bg-[#0E1826] p-1 border border-[#2A3B4F]">
              {GRANULARITIES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGranularity(g.value)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    granularity === g.value
                      ? "bg-[#CBA45C] text-[#0E1826]"
                      : "text-[#93A2B2] hover:text-[#EDE8DC]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && !data ? (
          <div className="py-24 text-center font-serif text-lg text-[#93A2B2]">
            Reading the ledger…
          </div>
        ) : !data ? (
          <div className="py-24 text-center text-sm text-[#93A2B2]">
            No financial record available for the selected parameters.
          </div>
        ) : (
          <>
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-5 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-[#93A2B2]">
                  Commission Earned
                </span>
                <div className="mt-2 font-serif text-3xl font-semibold text-[#CBA45C] tabular-nums">
                  {formatINR(data.totalCommission)}
                </div>
                <p className="mt-1 text-[11px] text-[#93A2B2]/80">Net platform earnings in range</p>
              </div>

              <div className="rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-5 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-[#93A2B2]">
                  Refunded to Buyers
                </span>
                <div
                  className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
                    data.totalRefunded > 0 ? "text-[#C1665A]" : "text-[#EDE8DC]"
                  }`}
                >
                  {formatINR(data.totalRefunded)}
                </div>
                <p className="mt-1 text-[11px] text-[#93A2B2]/80">Total payout reversals processed</p>
              </div>

              <div className="rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-5 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-[#93A2B2]">
                  Refund Rate
                </span>
                <div
                  className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
                    data.refundRate > 15 ? "text-[#C1665A]" : "text-[#EDE8DC]"
                  }`}
                >
                  {data.refundRate}%
                </div>
                <p className="mt-1 text-[11px] text-[#93A2B2]/80">Percentage of gross sales refunded</p>
              </div>
            </div>

            <div className="mb-10 rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-6">
              <h2 className="mb-4 font-serif text-lg font-medium text-[#EDE8DC]">
                Commission Over Time
              </h2>
              <CommissionTrendChart points={data.trend} />
            </div>

            <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-6">
                <h2 className="mb-4 font-serif text-lg font-medium text-[#EDE8DC]">
                  Revenue by Source
                </h2>
                <div className="space-y-4">
                  {data.bySource.length === 0 ? (
                    <p className="py-4 text-xs text-[#93A2B2]">
                      No commission sources logged in this window.
                    </p>
                  ) : (
                    (() => {
                      const max = Math.max(
                        ...data.bySource.map((s) => s.amount),
                        1
                      );
                      return data.bySource.map((s) => (
                        <div key={s.source} className="flex items-center gap-3">
                          <span className="w-32 shrink-0 text-xs font-medium text-[#93A2B2]">
                            {sourceLabel(s.source)}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1B2A3C]">
                            <div
                              className="h-full rounded-full bg-[#7FAE8C]"
                              style={{
                                width: `${Math.max((s.amount / max) * 100, 4)}%`,
                              }}
                            />
                          </div>
                          <span className="w-24 shrink-0 text-right font-mono text-xs text-[#EDE8DC] tabular-nums">
                            {formatINR(s.amount)}
                          </span>
                          <span className="w-10 shrink-0 text-right font-mono text-xs text-[#93A2B2] tabular-nums">
                            {s.count} tx
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#2A3B4F] bg-[#131F2E] p-6">
                <h2 className="mb-4 font-serif text-lg font-medium text-[#EDE8DC]">
                  Revenue by Auction House
                </h2>
                <div className="grid grid-cols-[1fr_110px_70px_60px] gap-3 border-b border-[#2A3B4F] pb-2 text-[10px] font-medium uppercase tracking-wider text-[#93A2B2]">
                  <span>House</span>
                  <span className="text-right">Revenue</span>
                  <span className="text-right">Orders</span>
                  <span className="text-right">Share</span>
                </div>
                {data.byHouse.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#93A2B2]">
                    No auction house revenue recorded.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1B2A3C]">
                    {data.byHouse.map((h) => (
                      <div
                        key={h.houseId}
                        className="grid grid-cols-[1fr_110px_70px_60px] gap-3 py-3 items-center text-xs"
                      >
                        <span className="truncate font-medium text-[#EDE8DC]">
                          {h.houseName}
                        </span>
                        <span className="text-right font-mono text-[#EDE8DC] tabular-nums">
                          {formatINR(h.totalRevenue)}
                        </span>
                        <span className="text-right font-mono text-[#93A2B2] tabular-nums">
                          {h.orderCount}
                        </span>
                        <span className="text-right font-mono text-[#CBA45C] tabular-nums">
                          {h.sharePercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 font-serif text-lg font-medium text-[#EDE8DC]">
                Incoming Revenue Transactions
              </h2>

              <div className="overflow-hidden rounded-lg border border-[#2A3B4F] bg-[#131F2E]">
                <div className="grid grid-cols-[110px_130px_1fr_1fr_110px_90px] gap-4 border-b border-[#2A3B4F] bg-[#1B2A3C] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-[#93A2B2]">
                  <span>Date</span>
                  <span>Source</span>
                  <span>Auction Title</span>
                  <span>Auction House</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Status</span>
                </div>

                {txLoading && txRows.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#93A2B2]">
                    Loading transactions...
                  </div>
                ) : txRows.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#93A2B2]">
                    No transactions found in this time frame.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1B2A3C]">
                    {txRows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[110px_130px_1fr_1fr_110px_90px] gap-4 px-4 py-3 items-center text-xs transition-colors hover:bg-[#1B2A3C]/30"
                      >
                        <span className="font-mono text-[#93A2B2]">
                          {formatShortDate(row.date)}
                        </span>

                        <span className="font-medium text-[#EDE8DC]">
                          {sourceLabel(row.source)}
                        </span>

                        <span className="truncate text-[#EDE8DC]">
                          {row.auctionTitle ?? "—"}
                        </span>

                        <span className="truncate text-[#93A2B2]">
                          {row.houseName ?? "—"}
                        </span>

                        <span className="text-right font-mono font-medium text-[#EDE8DC] tabular-nums">
                          {formatINR(row.amount)}
                        </span>

                        <span className="text-right">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono uppercase ${
                              row.status?.toLowerCase() === "completed"
                                ? "bg-[#7FAE8C]/15 text-[#7FAE8C] border border-[#7FAE8C]/30"
                                : row.status?.toLowerCase() === "pending"
                                ? "bg-[#CBA45C]/15 text-[#CBA45C] border border-[#CBA45C]/30"
                                : "bg-[#93A2B2]/15 text-[#93A2B2] border border-[#93A2B2]/30"
                            }`}
                          >
                            {row.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#2A3B4F] bg-[#0E1826] p-2">
                  <Pagination
                    currentPage={txPage}
                    paginationMeta={txPagination}
                    isLoading={txLoading}
                    onPageChange={setTxPage}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueBreakdownPage;