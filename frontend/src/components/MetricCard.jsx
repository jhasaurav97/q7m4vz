import { CircleDot } from "lucide-react";

export default function MetricCard({
  label,
  shortName,
  unit,
  description,
  value,
  loading,
}) {
  const displayValue =
    value == null || !Number.isFinite(value)
      ? "—"
      : shortName === "DATA"
        ? value.toLocaleString("en-GB")
        : value.toLocaleString("en-GB", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xs leading-5 text-slate-600">{label}</h3>

        <span className="grid min-h-8 min-w-8 place-items-center rounded-lg bg-lime-50 px-1 text-[10px] font-bold text-lime-800">
          {shortName}
        </span>
      </div>

      <div className="my-5 flex items-baseline gap-2">
        <strong className="text-2xl font-semibold text-slate-800 sm:text-3xl">
          {loading ? "…" : displayValue}
        </strong>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>

      <p className="mb-4 min-h-8 text-[10px] leading-5 text-slate-500">
        {description}
      </p>

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <CircleDot
          size={12}
          className={
            loading
              ? "text-amber-500"
              : value == null
                ? "text-slate-400"
                : "text-green-600"
          }
        />
        {loading
          ? "Loading data"
          : value == null
            ? "No metric available"
            : "Calculated from matched data"}
      </div>
    </article>
  );
}
