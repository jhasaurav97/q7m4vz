import { CalendarDays } from "lucide-react";

export default function PageHeading() {
  return (
    <section className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-slate-500">
          RENEWABLE ENERGY ANALYTICS
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          National Wind Forecast
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Compare forecasted and actual wind generation to understand forecast
          accuracy before electricity procurement decisions.
        </p>
      </div>

      <div className="flex min-w-48 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <CalendarDays size={20} className="mt-1 text-slate-500" />

        <div>
          <span className="block text-[10px] tracking-wider text-slate-500">
            ANALYSIS PERIOD
          </span>
          <strong className="mt-2 block text-sm text-slate-900">
            January 2026
          </strong>
          <span className="mt-1 block text-xs text-slate-500">
            01 Jan – 31 Jan 2026
          </span>
        </div>
      </div>
    </section>
  );
}
