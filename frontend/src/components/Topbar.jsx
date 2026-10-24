import { Circle } from "lucide-react";

const statusLabels = {
  loading: "CONNECTING TO API",
  success: "API CONNECTED",
  error: "API ERROR",
};

export default function Topbar({ status = "loading" }) {
  const dotColor = {
    loading: "text-amber-500",
    success: "text-green-600",
    error: "text-red-600",
  }[status];

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-4">
      <div className="text-[10px] font-bold tracking-[1.3px] text-slate-500">
        ENERGY INTELLIGENCE
        <span className="px-2 text-slate-300">/</span>
        WIND FORECASTS
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
        <Circle size={9} className={`fill-current ${dotColor}`} />
        {statusLabels[status] || "UNKNOWN STATUS"}
      </div>
    </header>
  );
}
