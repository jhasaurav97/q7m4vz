import {
  Wind,
  LayoutDashboard,
  BarChart3,
  Target,
  Database,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "#overview", Icon: LayoutDashboard },
  { label: "Forecast analysis", href: "#forecast-chart", Icon: BarChart3 },
  { label: "Accuracy metrics", href: "#accuracy-metrics", Icon: Target },
  { label: "Generation records", href: "#data-preview", Icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="flex w-full flex-col bg-[#101b2c] px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:px-5">
      <a
        href="#overview"
        className="mb-7 flex items-center gap-3 px-1 text-white no-underline"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-lime-300 text-xl font-extrabold text-slate-900">
          <Wind size={22} />
        </span>

        <span>
          <strong className="block text-lg">WindScope</strong>
          <small className="text-[9px] tracking-[1.5px] text-slate-400">
            ENERGY INTELLIGENCE
          </small>
        </span>
      </a>

      <p className="mb-3 px-2 text-[10px] font-semibold tracking-[1.5px] text-slate-400">
        WORKSPACE
      </p>

      <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {navigation.map(({ label, href, Icon }, index) => (
          <a
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs transition-colors ${
              index === 0
                ? "bg-slate-700 text-lime-300"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto hidden items-center gap-3 border-t border-slate-700 pt-5 lg:flex">
        <div className="grid size-10 place-items-center rounded-lg border border-slate-600 text-xs font-bold text-lime-300">
          UK
        </div>

        <div>
          <strong className="block text-xs">United Kingdom</strong>
          <small className="text-[10px] text-slate-400">
            National wind generation
          </small>
        </div>
      </div>
    </aside>
  );
}
