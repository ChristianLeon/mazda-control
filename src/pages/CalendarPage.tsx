import Card from "../components/Card";
import type { VehicleDocument, VerificationEvent } from "../types/mazda";

type ServiceState = "ok" | "soon" | "overdue";

type CalendarPageProps = {
  verificationEvents: VerificationEvent[];
  documents: VehicleDocument[];
  serviceLabel: string;
  serviceState: ServiceState;
  nextServiceMileage: number;
  currentMileage: number;
};

type VerificationCalendarItem = {
  id: string;
  title: string;
  semesterLabel: string;
  period: string;
  dueDate: string;
  cost?: number;
  status: string;
};

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function getDaysUntil(date: string) {
  const today = new Date();
  const targetDate = new Date(`${date}T00:00:00`);

  today.setHours(0, 0, 0, 0);

  const diff = targetDate.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getServiceVisual(state: ServiceState) {
  if (state === "ok") {
    return {
      container: "border-emerald-800 bg-emerald-950/30",
      label: "text-emerald-400",
      text: "text-emerald-300",
      badge: "Vigente",
    };
  }

  if (state === "soon") {
    return {
      container: "border-yellow-700 bg-yellow-950/30",
      label: "text-yellow-400",
      text: "text-yellow-300",
      badge: "Próximo",
    };
  }

  return {
    container: "border-red-800 bg-red-950/40",
    label: "text-red-400",
    text: "text-red-300",
    badge: "Vencido",
  };
}

function getDocumentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    valid: "Vigente",
    pending: "Pendiente",
    expired: "Vencido",
    paid: "Pagado",
    archived: "Archivado",
    completed: "Completado",
    done: "Realizado",
  };

  return labels[status] ?? status;
}

function getDocumentStatusClasses(status: string) {
  if (status === "valid") {
    return "border-emerald-700 bg-emerald-950/30 text-emerald-300";
  }

  if (status === "pending") {
    return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
  }

  if (status === "expired") {
    return "border-red-700 bg-red-950/40 text-red-300";
  }

  if (status === "paid" || status === "completed" || status === "done") {
    return "border-blue-700 bg-blue-950/30 text-blue-300";
  }

  return "border-zinc-700 bg-zinc-950 text-zinc-400";
}

function getDocumentTypeLabel(type: VehicleDocument["type"]) {
  const labels: Record<VehicleDocument["type"], string> = {
    insurance: "Seguro",
    verification: "Verificación",
    tax: "Tenencia / refrendo",
    registration: "Tarjeta de circulación",
    invoice: "Factura",
    warranty: "Garantía",
    ticket: "Ticket",
    service_order: "Orden de servicio",
    manual: "Manual",
    traffic_regulation: "Reglamento",
    other: "Otro",
  };

  return labels[type];
}

function getDocumentIcon(type: VehicleDocument["type"]) {
  const icons: Record<VehicleDocument["type"], string> = {
    insurance: "🛡️",
    verification: "✅",
    tax: "💳",
    registration: "📄",
    invoice: "🧾",
    warranty: "🔧",
    ticket: "🎫",
    service_order: "🛠️",
    manual: "📘",
    traffic_regulation: "🚦",
    other: "📁",
  };

  return icons[type];
}

function getUrgencyLabel(daysUntil: number) {
  if (daysUntil < 0) {
    return `Vencido hace ${Math.abs(daysUntil)} días`;
  }

  if (daysUntil === 0) {
    return "Vence hoy";
  }

  if (daysUntil <= 15) {
    return `Vence en ${daysUntil} días`;
  }

  if (daysUntil <= 30) {
    return `Próximo: ${daysUntil} días`;
  }

  return `${daysUntil} días restantes`;
}

function getUrgencyClasses(daysUntil: number) {
  if (daysUntil < 0) {
    return "border-red-700 bg-red-950/40 text-red-300";
  }

  if (daysUntil <= 15) {
    return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
  }

  if (daysUntil <= 30) {
    return "border-orange-700 bg-orange-950/30 text-orange-300";
  }

  return "border-zinc-700 bg-zinc-950 text-zinc-300";
}

function getVerificationSemesterLabel(title: string) {
  return title.toLowerCase().includes("primer")
    ? "Primer semestre"
    : "Segundo semestre";
}

function getVerificationPeriod(title: string) {
  return title.toLowerCase().includes("primer")
    ? "Mayo - junio"
    : "Noviembre - diciembre";
}

function isCompletedDocument(documentItem: VehicleDocument) {
  return documentItem.status === "paid" || documentItem.status === "archived";
}

export default function CalendarPage({
  verificationEvents,
  documents,
  serviceLabel,
  serviceState,
  nextServiceMileage,
  currentMileage,
}: CalendarPageProps) {
  const serviceVisual = getServiceVisual(serviceState);
  const kmToNextService = nextServiceMileage - currentMileage;

  const verificationDocuments = documents.filter(
    (documentItem) => documentItem.type === "verification"
  );

  const verificationItems: VerificationCalendarItem[] =
    verificationDocuments.length > 0
      ? verificationDocuments.map((documentItem) => ({
          id: documentItem.id,
          title: documentItem.title,
          semesterLabel: getVerificationSemesterLabel(documentItem.title),
          period: getVerificationPeriod(documentItem.title),
          dueDate: documentItem.expirationDate ?? "",
          cost: documentItem.cost,
          status: documentItem.status,
        }))
      : verificationEvents.map((event) => ({
          id: event.id,
          title: event.title,
          semesterLabel: getVerificationSemesterLabel(event.title),
          period: event.period,
          dueDate: event.dueDate,
          cost: event.cost,
          status: event.status,
        }));

  const activeExpiringItems = documents
    .filter((item) => item.expirationDate && !isCompletedDocument(item))
    .sort((a, b) =>
      String(a.expirationDate).localeCompare(String(b.expirationDate))
    );

  const expiredItems = activeExpiringItems.filter(
    (item) => item.expirationDate && getDaysUntil(item.expirationDate) < 0
  );

  const nextThirtyDaysItems = activeExpiringItems.filter((item) => {
    if (!item.expirationDate) return false;

    const days = getDaysUntil(item.expirationDate);

    return days >= 0 && days <= 30;
  });

  const futureItems = activeExpiringItems.filter((item) => {
    if (!item.expirationDate) return false;

    return getDaysUntil(item.expirationDate) > 30;
  });

  return (
    <>
      <Card title="Calendario">
        <div className="space-y-3">
          <div className={`rounded-3xl border p-4 ${serviceVisual.container}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${serviceVisual.label}`}>
                  Servicio por kilometraje
                </p>

                <p className={`mt-2 text-lg font-bold ${serviceVisual.text}`}>
                  {serviceVisual.badge}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${serviceVisual.container} ${serviceVisual.text}`}
              >
                {serviceVisual.badge}
              </span>
            </div>

            <p className={`mt-4 text-sm font-semibold ${serviceVisual.text}`}>
              {serviceLabel}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/20 p-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Actual
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {formatKm(currentMileage)}
                </p>

                <p className="text-xs text-zinc-400">km</p>
              </div>

              <div className="rounded-2xl bg-black/20 p-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Próximo
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {formatKm(nextServiceMileage)}
                </p>

                <p className="text-xs text-zinc-400">km</p>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-400">
              {kmToNextService >= 0
                ? `Faltan ${formatKm(kmToNextService)} km`
                : `Vencido por ${formatKm(Math.abs(kmToNextService))} km`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-red-900/70 bg-red-950/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-400">
                Vencidos
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {expiredItems.length}
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-900/70 bg-yellow-950/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-400">
                30 días
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {nextThirtyDaysItems.length}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Futuros
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {futureItems.length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Verificación">
        {verificationItems.length === 0 ? (
          <p className="text-zinc-400">Sin eventos de verificación.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {verificationItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {item.semesterLabel}
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {item.period}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Límite: {formatDate(item.dueDate)}
                </p>

                {item.cost !== undefined && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Costo: {formatMoney(item.cost)}
                  </p>
                )}

                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getDocumentStatusClasses(
                    item.status
                  )}`}
                >
                  {getDocumentStatusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Vencimientos urgentes">
        {expiredItems.length === 0 && nextThirtyDaysItems.length === 0 ? (
          <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/20 p-4 text-center">
            <p className="font-semibold text-emerald-300">
              Sin vencimientos críticos
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              No hay vencimientos críticos o próximos a 30 días.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...expiredItems, ...nextThirtyDaysItems].map((item) => {
              const daysUntil = item.expirationDate
                ? getDaysUntil(item.expirationDate)
                : 0;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
                      {getDocumentIcon(item.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {getDocumentTypeLabel(item.type)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getUrgencyClasses(
                            daysUntil
                          )}`}
                        >
                          {getUrgencyLabel(daysUntil)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-zinc-900 p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            Vence
                          </p>

                          <p className="mt-1 text-sm font-semibold text-zinc-200">
                            {formatDate(item.expirationDate)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-zinc-900 p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            Estado
                          </p>

                          <p className="mt-1 text-sm font-semibold text-zinc-200">
                            {getDocumentStatusLabel(item.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Próximos vencimientos">
        {futureItems.length === 0 ? (
          <p className="text-zinc-400">Sin vencimientos futuros.</p>
        ) : (
          <div className="space-y-3">
            {futureItems.map((item) => {
              const daysUntil = item.expirationDate
                ? getDaysUntil(item.expirationDate)
                : 0;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-lg">
                        {getDocumentIcon(item.type)}
                      </div>

                      <div>
                        <p className="font-semibold text-white">{item.title}</p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {getDocumentTypeLabel(item.type)} ·{" "}
                          {formatDate(item.expirationDate)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getDocumentStatusClasses(
                        item.status
                      )}`}
                    >
                      {getDocumentStatusLabel(item.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-500">
                    {daysUntil} días restantes
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}