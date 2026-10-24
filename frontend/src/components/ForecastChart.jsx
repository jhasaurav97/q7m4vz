import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Wind } from "lucide-react";

function formatAxisTime(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/London",
  });
}

function formatTooltipTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default function ForecastChart({ data, loading, error }) {
  return (
    <section id="forecast-chart" className="mt-9 scroll-mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Forecast vs actual generation
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            National wind generation across hourly delivery intervals
          </p>
        </div>

        <span className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] font-bold text-slate-500">
          UNIT: MW
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        {loading ? (
          <p className="py-24 text-center text-sm text-slate-500">
            Loading generation data…
          </p>
        ) : error ? (
          <p className="py-24 text-center text-sm text-red-700">
            Chart unavailable: {error}
          </p>
        ) : data.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Wind size={30} className="text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No matched generation data
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Check the API response and eligible forecast coverage.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs text-slate-500">
              {data.length.toLocaleString("en-GB")} matched hourly observations
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid stroke="#e7ecf2" strokeDasharray="4 4" />

                  <XAxis
                    dataKey="startTime"
                    tickFormatter={formatAxisTime}
                    minTickGap={30}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />

                  <YAxis
                    width={58}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    domain={["auto", "auto"]}
                  />

                  <Tooltip
                    labelFormatter={formatTooltipTime}
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString("en-GB")} MW`,
                      name,
                    ]}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="forecastGenerationMw"
                    name="Forecast generation"
                    stroke="#5b8def"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="actualGenerationMw"
                    name="Actual generation"
                    stroke="#65a30d"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
