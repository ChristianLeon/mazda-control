import { useMemo, useState, type FormEvent } from "react";
import Card from "../components/Card";
import type {
  NewServiceRecordInput,
  Vehicle,
  VehicleRecord,
  VehicleStatus,
  Workshop,
} from "../types/mazda";
import {
  buildMaintenancePlan,
  summarizeMaintenancePlan,
  type MaintenanceCard,
  type MaintenanceCardState,
} from "../utils/maintenancePlan";

type ServiceState = "ok" | "soon" | "overdue";

type StatusPageProps = {
  serviceLabel: string;
  serviceState: ServiceState;
  vehicle: Vehicle;
  vehicleStatus: VehicleStatus;
  records: VehicleRecord[];
  workshops: Workshop[];
  onUpdateMileage: (nextMileage: number) => void;
  onSaveMaintenanceService: (input: NewServiceRecordInput) => void;
};

type MaintenanceGroup = {
  category: string;
  cards: MaintenanceCard[];
  summary: {
    overdue: number;
    soon: number;
    ok: number;
    info: number;
  };
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function cleanNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, ""));
}

function getServiceTone(state: ServiceState) {
  if (state === "ok") return "success" as const;
  if (state === "overdue") return "danger" as const;

  return "default" as const;
}

function getServiceClasses(state: ServiceState) {
  if (state === "ok") {
    return {
      container: "border-emerald-900/80 bg-emerald-950/30",
      label: "text-emerald-400",
      value: "text-emerald-300",
      badge: "Al día",
    };
  }

  if (state === "soon") {
    return {
      container: "border-yellow-700/80 bg-yellow-950/20",
      label: "text-yellow-400",
      value: "text-yellow-300",
      badge: "Próximo",
    };
  }

  return {
    container: "border-red-900/80 bg-red-950/30",
    label: "text-red-400",
    value: "text-red-300",
    badge: "Vencido",
  };
}

function getMaintenanceClasses(state: MaintenanceCardState) {
  if (state === "ok") {
    return {
      container: "border-emerald-900/70 bg-emerald-950/20",
      badge: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
      text: "text-emerald-300",
    };
  }

  if (state === "soon") {
    return {
      container: "border-yellow-900/70 bg-yellow-950/20",
      badge: "border-yellow-700 bg-yellow-950/40 text-yellow-300",
      text: "text-yellow-300",
    };
  }

  if (state === "overdue") {
    return {
      container: "border-red-900/80 bg-red-950/30",
      badge: "border-red-700 bg-red-950/50 text-red-300",
      text: "text-red-300",
    };
  }

  return {
    container: "border-yellow-900/70 bg-yellow-950/20",
    badge: "border-yellow-700 bg-yellow-950/40 text-yellow-300",
    text: "text-yellow-300",
  };
}

function getGroupTone(summary: MaintenanceGroup["summary"]) {
  if (summary.overdue > 0) {
    return "border-red-900/80 bg-red-950/25";
  }

  if (summary.soon > 0) {
    return "border-yellow-900/80 bg-yellow-950/20";
  }

  if (summary.info > 0) {
    return "border-yellow-900/80 bg-yellow-950/20";
  }

  return "border-emerald-900/70 bg-emerald-950/20";
}

function getGroupStatusLabel(summary: MaintenanceGroup["summary"]) {
  if (summary.overdue > 0) return `${summary.overdue} vencido(s)`;
  if (summary.soon > 0) return `${summary.soon} próximo(s)`;
  if (summary.info > 0) return `${summary.info} por controlar`;

  return "Al día";
}

function getGroupStatusClasses(summary: MaintenanceGroup["summary"]) {
  if (summary.overdue > 0) {
    return "border-red-700 bg-red-950/40 text-red-300";
  }

  if (summary.soon > 0) {
    return "border-yellow-700 bg-yellow-950/40 text-yellow-300";
  }

  if (summary.info > 0) {
    return "border-yellow-700 bg-yellow-950/40 text-yellow-300";
  }

  return "border-emerald-700 bg-emerald-950/40 text-emerald-300";
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    Motor: "⚙️",
    Frenos: "🛑",
    Llantas: "🛞",
    Fluidos: "💧",
    Visibilidad: "🌧️",
    Transmisión: "⚙️",
    Combustible: "⛽",
    "Aire acondicionado": "❄️",
    Encendido: "⚡",
    Enfriamiento: "🌡️",
  };

  return icons[category] ?? "🧰";
}

function sortCards(cards: MaintenanceCard[]) {
  const order: Record<MaintenanceCardState, number> = {
    overdue: 0,
    soon: 1,
    info: 2,
    ok: 3,
  };

  return [...cards].sort((a, b) => {
    const stateCompare = order[a.state] - order[b.state];

    if (stateCompare !== 0) return stateCompare;

    const aKm = a.remainingKm ?? Number.MAX_SAFE_INTEGER;
    const bKm = b.remainingKm ?? Number.MAX_SAFE_INTEGER;

    return aKm - bKm;
  });
}

function groupMaintenanceCards(cards: MaintenanceCard[]): MaintenanceGroup[] {
  const grouped = cards.reduce<Record<string, MaintenanceCard[]>>(
    (accumulator, card) => {
      if (!accumulator[card.category]) {
        accumulator[card.category] = [];
      }

      accumulator[card.category].push(card);

      return accumulator;
    },
    {}
  );

  return Object.entries(grouped)
    .map(([category, categoryCards]) => ({
      category,
      cards: sortCards(categoryCards),
      summary: summarizeMaintenancePlan(categoryCards),
    }))
    .sort((a, b) => {
      const aPriority = a.summary.overdue * 100 + a.summary.soon * 10 + a.summary.info;
      const bPriority = b.summary.overdue * 100 + b.summary.soon * 10 + b.summary.info;

      if (aPriority !== bPriority) return bPriority - aPriority;

      return a.category.localeCompare(b.category);
    });
}



function MaintenanceRegisterModal({
  item,
  currentMileage,
  workshops,
  onClose,
  onSave,
}: {
  item: MaintenanceCard;
  currentMileage: number;
  workshops: Workshop[];
  onClose: () => void;
  onSave: (input: NewServiceRecordInput) => void;
}) {
  const [date, setDate] = useState(getToday());
  const [mileage, setMileage] = useState(String(currentMileage));
  const [cost, setCost] = useState("");
  const [workshopId, setWorkshopId] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [notes, setNotes] = useState(item.suggestedNotes);

  const selectedWorkshop = workshops.find(
    (workshop) => workshop.id === workshopId
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMileage = cleanNumber(mileage);
    const cleanCost = cleanNumber(cost);

    if (!Number.isFinite(cleanMileage) || cleanMileage <= 0) return;

    onSave({
      type: item.serviceType,
      title: item.title,
      date,
      mileage: cleanMileage,
      cost: Number.isFinite(cleanCost) ? cleanCost : 0,
      workshopId: selectedWorkshop?.id,
      workshopName: selectedWorkshop?.name ?? workshopName,
      notes,
      updateAsLastService: item.updateAsLastService,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
      >
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                Registrar cambio
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                {item.title}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">{item.category}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm font-semibold text-white">
              {item.intervalLabel}
            </p>

            <p className="mt-1 text-xs text-zinc-500">{item.action}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Fecha
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Km
              </label>

              <input
                value={mileage}
                onChange={(event) =>
                  setMileage(event.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Costo
            </label>

            <input
              value={cost}
              onChange={(event) =>
                setCost(event.target.value.replace(/[^\d.]/g, ""))
              }
              inputMode="decimal"
              placeholder="Opcional"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Taller / proveedor
            </label>

            <select
              value={workshopId}
              onChange={(event) => {
                setWorkshopId(event.target.value);

                if (event.target.value) setWorkshopName("");
              }}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            >
              <option value="">Texto libre / no registrado</option>
              {workshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}
                  {workshop.isFavorite ? " ★" : ""}
                </option>
              ))}
            </select>

            {!workshopId && (
              <input
                value={workshopName}
                onChange={(event) => setWorkshopName(event.target.value)}
                placeholder="Escribe taller o proveedor"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Notas
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
          >
            Guardar cambio
          </button>
        </div>
      </form>
    </div>
  );
}

export default function StatusPage({
  serviceLabel,
  serviceState,
  vehicle,
  vehicleStatus,
  records,
  workshops,
  onUpdateMileage,
  onSaveMaintenanceService,
}: StatusPageProps) {
  const [mileageInput, setMileageInput] = useState(
    String(vehicle.currentMileage)
  );
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceCard | null>(null);

  const serviceClasses = getServiceClasses(serviceState);

  const maintenanceCards = useMemo(
    () =>
      buildMaintenancePlan({
        currentMileage: vehicle.currentMileage,
        lastServiceMileage: vehicleStatus.lastServiceMileage,
        records,
      }),
    [vehicle.currentMileage, vehicleStatus.lastServiceMileage, records]
  );

  const maintenanceSummary = useMemo(
    () => summarizeMaintenancePlan(maintenanceCards),
    [maintenanceCards]
  );

  const maintenanceGroups = useMemo(
    () => groupMaintenanceCards(maintenanceCards),
    [maintenanceCards]
  );

  const [openGroups, setOpenGroups] = useState<string[]>([]);

  function toggleGroup(category: string) {
    setOpenGroups((currentGroups) =>
      currentGroups.includes(category)
        ? currentGroups.filter((item) => item !== category)
        : [...currentGroups, category]
    );
  }

  function openOnlyImportant() {
    setOpenGroups(
      maintenanceGroups
        .filter(
          (group) =>
            group.summary.overdue > 0 ||
            group.summary.soon > 0 ||
            group.summary.info > 0
        )
        .map((group) => group.category)
    );
  }

  function openAllGroups() {
    setOpenGroups(maintenanceGroups.map((group) => group.category));
  }

  function closeAllGroups() {
    setOpenGroups([]);
  }

  function handleMileageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextMileage = Number(mileageInput.replace(/[^\d]/g, ""));

    if (!Number.isFinite(nextMileage) || nextMileage <= 0) return;

    onUpdateMileage(nextMileage);
  }

  return (
    <>
      <Card title="Estado actual" tone={getServiceTone(serviceState)}>
        <div className="space-y-3">
          <div className={`rounded-3xl border p-4 ${serviceClasses.container}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${serviceClasses.label}`}
                >
                  Servicio
                </p>

                <p className={`mt-2 text-xl font-bold ${serviceClasses.value}`}>
                  {serviceLabel}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${serviceClasses.container} ${serviceClasses.value}`}
              >
                {serviceClasses.badge}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleMileageSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Kilometraje actual
            </p>

            <div className="mt-3 flex gap-2">
              <input
                value={mileageInput}
                onChange={(event) =>
                  setMileageInput(event.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-lg font-bold text-white outline-none focus:border-red-700"
              />

              <button
                type="submit"
                className="rounded-2xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"
              >
                Actualizar
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Actual registrado: {formatKm(vehicle.currentMileage)} km
            </p>
          </form>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Último servicio
              </p>

              <p className="mt-2 text-lg font-bold text-white">
                {formatKm(vehicleStatus.lastServiceMileage)}
              </p>

              <p className="text-xs text-zinc-500">km</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Uso
              </p>

              <p className="mt-2 text-lg font-bold text-white">Ocasional</p>

              <p className="text-xs text-zinc-500">1-2 veces + fines</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Plan de mantenimiento">
        <div className="space-y-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm font-semibold text-white">
              Modo preventivo moderado
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Agrupado por categoría para reducir scroll. Abre solo lo que
              necesites revisar o registrar.
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-red-900/70 bg-red-950/20 p-2 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-red-400">
                  Venc.
                </p>

                <p className="mt-1 font-bold text-white">
                  {maintenanceSummary.overdue}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-900/70 bg-yellow-950/20 p-2 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-400">
                  Próx.
                </p>

                <p className="mt-1 font-bold text-white">
                  {maintenanceSummary.soon}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/20 p-2 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                  OK
                </p>

                <p className="mt-1 font-bold text-white">
                  {maintenanceSummary.ok}
                </p>
              </div>

           <div className="rounded-xl border border-yellow-900/70 bg-yellow-950/20 p-2 text-center">
  <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-400">
    Info
  </p>

                <p className="mt-1 font-bold text-white">
                  {maintenanceSummary.info}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={openOnlyImportant}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Importantes
              </button>

              <button
                type="button"
                onClick={openAllGroups}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Abrir todo
              </button>

              <button
                type="button"
                onClick={closeAllGroups}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Cerrar
              </button>
            </div>
          </div>

          {maintenanceGroups.map((group) => {
            const isOpen = openGroups.includes(group.category);
            const groupStatusClasses = getGroupStatusClasses(group.summary);

            return (
              <section
                key={group.category}
                className={`rounded-3xl border p-3 ${getGroupTone(
                  group.summary
                )}`}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.category)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
                      {getCategoryIcon(group.category)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {group.category}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {group.cards.length} componente(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${groupStatusClasses}`}
                    >
                      {getGroupStatusLabel(group.summary)}
                    </span>

                    <span className="text-lg text-zinc-500">
                      {isOpen ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-3">
                    {group.cards.map((item) => {
                      const classes = getMaintenanceClasses(item.state);

                      return (
                        <article
                          key={item.id}
                          className={`rounded-3xl border p-4 ${classes.container}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="mt-1 font-semibold text-white">
                                {item.title}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${classes.badge}`}
                            >
                              {item.statusLabel}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-black/20 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                Intervalo
                              </p>

                              <p className="mt-1 text-sm font-semibold text-zinc-200">
                                {item.intervalLabel}
                              </p>
                            </div>

                            <div className="rounded-xl bg-black/20 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                Próximo
                              </p>

                              <p
                                className={`mt-1 text-sm font-semibold ${classes.text}`}
                              >
                                {item.nextLabel}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-zinc-500">
                            {item.lastReferenceLabel}
                          </p>

                          <p className="mt-2 text-sm text-zinc-400">
                            {item.detail}
                          </p>

                          <button
                            type="button"
                            onClick={() => setSelectedMaintenance(item)}
                            className="mt-4 w-full rounded-2xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"
                          >
                            Registrar cambio
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </Card>

      {selectedMaintenance && (
        <MaintenanceRegisterModal
          item={selectedMaintenance}
          currentMileage={vehicle.currentMileage}
          workshops={workshops}
          onClose={() => setSelectedMaintenance(null)}
          onSave={onSaveMaintenanceService}
        />
      )}
    </>
  );
}