import type { CostAnalysis } from "../utils/costAnalysis";

type Props = {
  costAnalysis: CostAnalysis;
};

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "red" | "yellow" | "green" | "blue";
}) {
  const toneClasses = {
    default: "border-zinc-800 bg-zinc-950 text-white",
    red: "border-red-900/80 bg-red-950/25 text-red-300",
    yellow: "border-yellow-900/80 bg-yellow-950/20 text-yellow-300",
    green: "border-emerald-900/80 bg-emerald-950/20 text-emerald-300",
    blue: "border-blue-900/80 bg-blue-950/20 text-blue-300",
  };

  return (
    <div className={`rounded-2xl border p-4 text-center ${toneClasses[tone]}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

export default function CostAnalysisPanel({ costAnalysis }: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-red-900/80 bg-red-950/20 p-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-red-400">
          Total conocido
        </p>

        <p className="mt-2 text-2xl font-bold text-white">
          {formatMoney(costAnalysis.totalKnownCost)}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Gasto real + fallas estimadas abiertas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Real gastado"
          value={formatMoney(costAnalysis.realSpentTotal)}
          tone="green"
        />

        <MetricCard
          label="Pendiente est."
          value={formatMoney(costAnalysis.openIssueEstimateTotal)}
          tone="yellow"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="Servicios"
          value={formatMoney(costAnalysis.serviceTotal)}
        />

        <MetricCard
          label="Docs"
          value={formatMoney(costAnalysis.documentTotal)}
          tone="blue"
        />

        <MetricCard
          label="$/km"
          value={formatMoney(costAnalysis.costPerCurrentKm)}
        />
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="font-semibold text-white">Gasto por categoría</p>

        <p className="mt-1 text-xs text-zinc-500">
          Solo considera gastos reales registrados. Documentos pendientes no
          suman.
        </p>

        <div className="mt-4 space-y-2">
          {costAnalysis.recordTypeTotals.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin gastos registrados.</p>
          ) : (
            costAnalysis.recordTypeTotals.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-900 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {item.count} movimiento(s)
                  </p>
                </div>

                <p className="text-sm font-bold text-red-400">
                  {formatMoney(item.total)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="font-semibold text-white">Meses con más gasto</p>

        <div className="mt-4 space-y-2">
          {costAnalysis.monthlyTotals.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin gastos por mes.</p>
          ) : (
            costAnalysis.monthlyTotals.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-900 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {item.count} movimiento(s)
                  </p>
                </div>

                <p className="text-sm font-bold text-red-400">
                  {formatMoney(item.total)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="font-semibold text-white">Top gastos</p>

        <div className="mt-4 space-y-2">
          {costAnalysis.topExpenses.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin gastos registrados.</p>
          ) : (
            costAnalysis.topExpenses.map((item) => (
              <div
                key={`${item.source}-${item.id}`}
                className="rounded-2xl bg-zinc-900 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{item.title}</p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {item.source}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-red-400">
                    {formatMoney(item.amount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}