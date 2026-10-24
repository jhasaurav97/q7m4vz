import { useState } from "react";
import { Database, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 24;

const columns = [
  "Delivery time (UK)",
  "Actual (MW)",
  "Forecast (MW)",
  "Error (MW)",
  "Forecast published (UK)",
];

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function GenerationRecords({ data }) {
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(data.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visibleRows = data.slice(start, start + PAGE_SIZE);

  return (
    <section id="data-preview" className="mt-9 scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Generation records</h2>
        <p className="mt-1 text-xs text-slate-500">
          Matched hourly actual and forecast observations
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-4 text-[10px] font-semibold text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.startTime} className="hover:bg-slate-50">
                <td className="border-t border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {formatDateTime(row.startTime)}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 text-xs">
                  {formatNumber(row.actualGenerationMw)}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 text-xs">
                  {formatNumber(row.forecastGenerationMw)}
                </td>
                <td
                  className={`border-t border-slate-100 px-4 py-3 text-xs font-medium ${
                    row.errorMw > 0
                      ? "text-amber-700"
                      : row.errorMw < 0
                        ? "text-blue-700"
                        : "text-slate-700"
                  }`}
                >
                  {row.errorMw > 0 ? "+" : ""}
                  {formatNumber(row.errorMw)}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  {formatDateTime(row.publishTime)}
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-t border-slate-100 px-4 py-12 text-center"
                >
                  <Database size={22} className="mx-auto text-slate-400" />
                  <p className="mt-3 text-xs text-slate-500">
                    No matched records available.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {data.length
            ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, data.length)} of ${data.length} records`
            : "0 records"}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs text-slate-500">
            {pageCount ? page + 1 : 0} / {pageCount}
          </span>

          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
