import { Wind, Clock3, Activity } from "lucide-react";

export default function ContextStrip({ metrics }) {
  const coverage =
    metrics?.coveragePercent == null
      ? "Awaiting API data"
      : `${metrics.coveragePercent}% matched coverage`;

  const items = [
    {
      label: "DATA SOURCE",
      value: "Elexon BMRS",
      Icon: Wind,
    },
    {
      label: "TIME RESOLUTION",
      value: "Hourly analysis",
      Icon: Clock3,
    },
    {
      label: "DATA COVERAGE",
      value: coverage,
      Icon: Activity,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ label, value, Icon }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-lime-50 text-lime-800">
            <Icon size={20} />
          </div>

          <div>
            <p className="text-[10px] tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 text-xs font-semibold text-slate-800">{value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
