import { ArrowUpRight } from "lucide-react";
import MetricCard from "./MetricCard";

const metricDefinitions = [
  {
    label: "Mean Absolute Error",
    shortName: "MAE",
    unit: "MW",
    description: "Average absolute forecast error",
    key: "maeMw",
  },
  {
    label: "Root Mean Square Error",
    shortName: "RMSE",
    unit: "MW",
    description: "Gives larger errors more weight",
    key: "rmseMw",
  },
  {
    label: "Weighted Absolute Percentage Error",
    shortName: "WAPE",
    unit: "%",
    description: "Absolute error relative to actual generation",
    key: "wapePercent",
  },
  {
    label: "Matched Intervals",
    shortName: "DATA",
    unit: "",
    description: "Hours with actual and eligible forecast values",
    key: "matchedIntervals",
  },
];

export default function MetricsSection({ metrics }) {
  return (
    <section id="accuracy-metrics" className="mt-9 scroll-mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Forecast performance
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Quantitative measures of forecast error
          </p>
        </div>

        <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] font-bold tracking-wider text-slate-500">
          JAN 2026 <ArrowUpRight size={12} className="ml-1 inline" />
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricDefinitions.map((definition) => (
          <MetricCard
            key={definition.key}
            {...definition}
            value={metrics?.[definition.key] ?? null}
            loading={!metrics}
          />
        ))}
      </div>

      {metrics && (
        <p className="mt-3 text-xs text-slate-500">
          {metrics.coveragePercent}% coverage across{" "}
          {metrics.expectedIntervals.toLocaleString("en-GB")} expected delivery
          hours.
        </p>
      )}
    </section>
  );
}
