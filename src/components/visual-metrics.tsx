type DonutGaugeProps = {
  label: string;
  value: number;
  tone?: "emerald" | "amber" | "indigo" | "rose" | "slate";
};

const TONE = {
  emerald: "#059669",
  amber: "#d97706",
  indigo: "#4f46e5",
  rose: "#e11d48",
  slate: "#0f172a",
};

export function DonutGauge({ label, value, tone = "emerald" }: DonutGaugeProps) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="grid h-16 w-16 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${TONE[tone]} ${bounded * 3.6}deg, #e2e8f0 0deg)`,
        }}
      >
        <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-bold text-slate-900">
          {bounded}%
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">Confidence view</p>
      </div>
    </div>
  );
}

export function SparkBars({
  values,
  tone = "bg-indigo-500",
}: {
  values: number[];
  tone?: string;
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-16 items-end gap-1.5 rounded-xl bg-slate-50 px-3 py-2">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={`w-full rounded-t ${tone}`}
          style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function SegmentedBar({
  segments,
}: {
  segments: Array<{ label: string; value: number; className: string }>;
}) {
  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1,
  );

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.className}
            style={{ width: `${(segment.value / total) * 100}%` }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-500">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${segment.className}`} />
            {segment.label} {segment.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HeatStrip({
  cells,
}: {
  cells: Array<{ label: string; level: "low" | "medium" | "high" }>;
}) {
  const colorByLevel = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${colorByLevel[cell.level]}`}
        >
          {cell.label}
        </div>
      ))}
    </div>
  );
}
