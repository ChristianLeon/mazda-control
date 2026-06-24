import { useMemo, useState, type FormEvent } from "react";
import Card from "../components/Card";
import type {
  NewServiceRecordInput,
  VehicleRecord,
  VehicleRecordType,
  VehicleStatus,
  Workshop,
} from "../types/mazda";

type HistoryPageProps = {
  vehicleStatus: VehicleStatus;
  records: VehicleRecord[];
  workshops: Workshop[];
  onUpdateRecord: (recordId: string, input: NewServiceRecordInput) => void;
  onDeleteRecord: (recordId: string) => void;
};

type FilterValue = "all" | "service" | "repair" | "tires" | "brakes";

type DayGroup = {
  dateKey: string;
  records: VehicleRecord[];
  total: number;
};

type MonthGroup = {
  monthKey: string;
  days: DayGroup[];
  total: number;
  count: number;
};

const recordTypes: { value: VehicleRecordType; label: string }[] = [
  { value: "service", label: "Servicio general" },
  { value: "oil_change", label: "Cambio de aceite" },
  { value: "brakes", label: "Frenos / balatas" },
  { value: "tires", label: "Llantas" },
  { value: "battery", label: "Batería" },
  { value: "transmission", label: "Transmisión automática" },
  { value: "repair", label: "Reparación" },
  { value: "diagnostic", label: "Diagnóstico" },
  { value: "cleaning", label: "Lavado / engrasado" },
  { value: "verification", label: "Verificación" },
  { value: "insurance", label: "Seguro" },
  { value: "tax", label: "Tenencia / refrendo" },
  { value: "other", label: "Otro" },
];

const quickFilters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "service", label: "Servicio" },
  { value: "repair", label: "Reparación" },
  { value: "tires", label: "Llantas" },
  { value: "brakes", label: "Frenos" },
];

function safeAmount(value: number | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function formatMileageLabel(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "Sin km registrado";

  return `${formatKm(value)} km`;
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function getMonthKey(date?: string) {
  if (!date || date.length < 7) return "sin-fecha";

  return date.slice(0, 7);
}

function getMonthLabel(monthKey: string) {
  if (monthKey === "sin-fecha") return "Sin fecha";

  const date = new Date(`${monthKey}-01T00:00:00`);

  if (Number.isNaN(date.getTime())) return monthKey;

  const label = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getRecordTypeLabel(type: VehicleRecordType) {
  const foundType = recordTypes.find((item) => item.value === type);

  return foundType?.label ?? "Registro";
}

function getRecordIcon(type: VehicleRecordType) {
  const icons: Record<VehicleRecordType, string> = {
    service: "🧰",
    oil_change: "🛢️",
    brakes: "🛑",
    tires: "🛞",
    battery: "🔋",
    transmission: "⚙️",
    repair: "🔧",
    diagnostic: "🔍",
    verification: "✅",
    insurance: "🛡️",
    tax: "💳",
    cleaning: "✨",
    other: "📌",
  };

  return icons[type];
}

function getRecordTypeClasses(type: VehicleRecordType) {
  if (type === "service" || type === "oil_change") {
    return "border-emerald-700 bg-emerald-950/30 text-emerald-300";
  }

  if (type === "brakes" || type === "repair" || type === "transmission") {
    return "border-red-700 bg-red-950/40 text-red-300";
  }

  if (type === "tires" || type === "battery" || type === "diagnostic") {
    return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
  }

  if (type === "verification" || type === "insurance" || type === "tax") {
    return "border-blue-700 bg-blue-950/30 text-blue-300";
  }

  return "border-zinc-700 bg-zinc-950 text-zinc-300";
}

function sortRecords(records: VehicleRecord[]) {
  return [...records].sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));

    if (dateCompare !== 0) return dateCompare;

    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

function matchesFilter(record: VehicleRecord, filter: FilterValue) {
  if (filter === "all") return true;

  if (filter === "service") {
    return (
      record.type === "service" ||
      record.type === "oil_change" ||
      record.type === "cleaning"
    );
  }

  return record.type === filter;
}

function matchesSearch(record: VehicleRecord, searchTerm: string) {
  const query = normalizeText(searchTerm.trim());

  if (!query) return true;

  const recordText = normalizeText(
    [
      record.title,
      record.notes ?? "",
      record.workshopName ?? "",
      getRecordTypeLabel(record.type),
      record.date,
      String(record.cost),
    ].join(" ")
  );

  return recordText.includes(query);
}

function groupRecordsByMonthAndDay(records: VehicleRecord[]): MonthGroup[] {
  const monthMap = new Map<string, Map<string, VehicleRecord[]>>();

  records.forEach((record) => {
    const monthKey = getMonthKey(record.date);
    const dateKey = record.date || "sin-fecha";

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map<string, VehicleRecord[]>());
    }

    const dayMap = monthMap.get(monthKey);

    if (!dayMap) return;

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, []);
    }

    dayMap.get(dateKey)?.push(record);
  });

  return Array.from(monthMap.entries()).map(([monthKey, dayMap]) => {
    const days = Array.from(dayMap.entries()).map(([dateKey, dayRecords]) => ({
      dateKey,
      records: dayRecords,
      total: dayRecords.reduce(
        (total, record) => total + safeAmount(record.cost),
        0
      ),
    }));

    return {
      monthKey,
      days,
      total: days.reduce((total, day) => total + day.total, 0),
      count: days.reduce((total, day) => total + day.records.length, 0),
    };
  });
}

export default function HistoryPage({
  vehicleStatus,
  records,
  workshops,
  onUpdateRecord,
  onDeleteRecord,
}: HistoryPageProps) {
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editType, setEditType] = useState<VehicleRecordType>("service");
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMileage, setEditMileage] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editWorkshopId, setEditWorkshopId] = useState("");
  const [editWorkshopName, setEditWorkshopName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editUpdateAsLastService, setEditUpdateAsLastService] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [openMonthKeys, setOpenMonthKeys] = useState<string[]>([]);

  const sortedRecords = useMemo(() => sortRecords(records), [records]);

  const filteredRecords = useMemo(
    () =>
      sortedRecords.filter(
        (record) =>
          matchesFilter(record, activeFilter) &&
          matchesSearch(record, searchTerm)
      ),
    [sortedRecords, activeFilter, searchTerm]
  );

  const monthGroups = useMemo(
    () => groupRecordsByMonthAndDay(filteredRecords),
    [filteredRecords]
  );

  const totalSpent = useMemo(() => {
    return records.reduce((total, record) => total + safeAmount(record.cost), 0);
  }, [records]);

  const filteredTotal = useMemo(() => {
    return filteredRecords.reduce(
      (total, record) => total + safeAmount(record.cost),
      0
    );
  }, [filteredRecords]);

  const lastRecord = sortedRecords[0];

  function startEdit(record: VehicleRecord) {
    setEditingRecordId(record.id);
    setEditType(record.type);
    setEditTitle(record.title);
    setEditDate(record.date);
    setEditMileage(record.mileage > 0 ? String(record.mileage) : "");
    setEditCost(record.cost > 0 ? String(record.cost) : "");
    setEditWorkshopId(record.workshopId ?? "");
    setEditWorkshopName(record.workshopId ? "" : record.workshopName ?? "");
    setEditNotes(record.notes ?? "");
    setEditUpdateAsLastService(Boolean(record.updateAsLastService));
  }

  function cancelEdit() {
    setEditingRecordId(null);
  }

  function toggleMonth(monthKey: string) {
    setOpenMonthKeys((currentMonths) =>
      currentMonths.includes(monthKey)
        ? currentMonths.filter((item) => item !== monthKey)
        : [...currentMonths, monthKey]
    );
  }

  function openAllMonths() {
    setOpenMonthKeys(monthGroups.map((group) => group.monthKey));
  }

  function closeAllMonths() {
    setOpenMonthKeys([]);
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>, recordId: string) {
    event.preventDefault();

    const cleanMileage = editMileage.trim()
      ? Number(editMileage.replace(/[^\d]/g, ""))
      : 0;

    const cleanCost = editCost.trim()
      ? Number(editCost.replace(/[^\d.]/g, ""))
      : 0;

    if (!Number.isFinite(cleanMileage) || cleanMileage < 0) return;

    const selectedWorkshop = workshops.find(
      (workshop) => workshop.id === editWorkshopId
    );

    onUpdateRecord(recordId, {
      type: editType,
      title: editTitle.trim() || "Registro de historial",
      date: editDate,
      mileage: cleanMileage,
      cost: Number.isFinite(cleanCost) ? cleanCost : 0,
      workshopId: selectedWorkshop?.id,
      workshopName: selectedWorkshop?.name ?? editWorkshopName,
      notes: editNotes,
      updateAsLastService: editUpdateAsLastService,
    });

    setEditingRecordId(null);
  }

  function handleDelete(recordId: string) {
    const confirmed = window.confirm("¿Eliminar este registro del historial?");

    if (confirmed) {
      onDeleteRecord(recordId);
    }
  }

  function renderEditForm(record: VehicleRecord) {
    return (
      <form
        key={record.id}
        onSubmit={(event) => handleUpdate(event, record.id)}
        className="rounded-3xl border border-red-900/70 bg-zinc-900 p-4"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Editando
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              Registro de historial
            </p>
          </div>

          <button
            type="button"
            onClick={cancelEdit}
            className="rounded-full bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Tipo
            </label>

            <select
              value={editType}
              onChange={(event) =>
                setEditType(event.target.value as VehicleRecordType)
              }
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            >
              {recordTypes.map((recordType) => (
                <option key={recordType.value} value={recordType.value}>
                  {recordType.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Título
            </label>

            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Fecha
              </label>

              <input
                type="date"
                value={editDate}
                onChange={(event) => setEditDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Km
              </label>

              <input
                value={editMileage}
                onChange={(event) =>
                  setEditMileage(event.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                placeholder="Sin km"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Costo
            </label>

            <input
              value={editCost}
              onChange={(event) =>
                setEditCost(event.target.value.replace(/[^\d.]/g, ""))
              }
              inputMode="decimal"
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-700"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Taller / proveedor
            </label>

            <select
              value={editWorkshopId}
              onChange={(event) => {
                setEditWorkshopId(event.target.value);

                if (event.target.value) setEditWorkshopName("");
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

            {!editWorkshopId && (
              <input
                value={editWorkshopName}
                onChange={(event) => setEditWorkshopName(event.target.value)}
                placeholder="Escribe taller o proveedor"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-700"
              />
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Notas
            </label>

            <textarea
              value={editNotes}
              onChange={(event) => setEditNotes(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <input
              type="checkbox"
              checked={editUpdateAsLastService}
              onChange={(event) =>
                setEditUpdateAsLastService(event.target.checked)
              }
              className="h-5 w-5 accent-red-700"
            />

            <span className="text-sm text-zinc-200">
              Actualizar como último servicio
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-2xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-300"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
            >
              Guardar
            </button>
          </div>
        </div>
      </form>
    );
  }

  function renderRecordCard(record: VehicleRecord) {
    return (
      <article
        key={record.id}
        className="rounded-3xl border border-zinc-800 bg-zinc-900 p-3"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg">
            {getRecordIcon(record.type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white">{record.title}</p>

                <p className="mt-1 text-xs text-zinc-500">
                  {formatMileageLabel(record.mileage)}
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-red-400">
                {formatMoney(record.cost)}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRecordTypeClasses(
                  record.type
                )}`}
              >
                {getRecordTypeLabel(record.type)}
              </span>

              {record.updateAsLastService && (
                <span className="rounded-full border border-red-800 bg-red-950/30 px-3 py-1 text-xs font-semibold text-red-300">
                  Último servicio
                </span>
              )}
            </div>

            {(record.workshopName || record.notes) && (
              <div className="mt-3 space-y-2 rounded-2xl bg-zinc-950 p-3 text-sm text-zinc-400">
                {record.workshopName && (
                  <p>
                    <span className="text-zinc-600">Taller:</span>{" "}
                    {record.workshopName}
                  </p>
                )}

                {record.notes && <p>{record.notes}</p>}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => startEdit(record)}
                className="rounded-xl bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-200"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(record.id)}
                className="rounded-xl border border-red-900 px-3 py-2 text-sm font-semibold text-red-400"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      <Card title="Historial">
        <div className="space-y-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Total registrado
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {formatMoney(totalSpent)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Servicios, reparaciones y mantenimientos capturados
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Registros
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {records.length}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Último servicio
              </p>

              <p className="mt-2 text-sm font-bold text-white">
                {formatKm(vehicleStatus.lastServiceMileage)}
              </p>

              <p className="text-xs text-zinc-500">km</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Último mov.
              </p>

              <p className="mt-2 text-sm font-bold text-white">
                {lastRecord ? formatDate(lastRecord.date) : "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar: bomba, llanta, balatas, taller..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-700"
            />

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                    activeFilter === filter.value
                      ? "border-red-700 bg-red-700 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span>
                Visible: {filteredRecords.length} de {records.length}
              </span>

              <span>{formatMoney(filteredTotal)}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={openAllMonths}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Abrir meses
              </button>

              <button
                type="button"
                onClick={closeAllMonths}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Contraer meses
              </button>
            </div>
          </div>
        </div>
      </Card>

      {records.length === 0 ? (
        <Card title="Sin registros">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="font-semibold text-zinc-200">
              Aún no tienes historial capturado
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Presiona el botón + para agregar el primer servicio o
              mantenimiento.
            </p>
          </div>
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card title="Sin resultados">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="font-semibold text-zinc-200">
              No hay registros con ese filtro
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Cambia la búsqueda o selecciona “Todos”.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {monthGroups.map((monthGroup) => {
            const isMonthOpen = openMonthKeys.includes(monthGroup.monthKey);

            return (
              <section
                key={monthGroup.monthKey}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <button
                  type="button"
                  onClick={() => toggleMonth(monthGroup.monthKey)}
                  className="flex w-full items-start justify-between gap-3 px-1 py-2 text-left"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {getMonthLabel(monthGroup.monthKey)}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {monthGroup.count} registro(s)
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-sm font-bold text-red-400">
                      {formatMoney(monthGroup.total)}
                    </p>

                    <span className="text-lg text-zinc-500">
                      {isMonthOpen ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {isMonthOpen && (
                  <div className="mt-2 space-y-3">
                    {monthGroup.days.map((dayGroup) => (
                      <div key={dayGroup.dateKey} className="space-y-2">
                        <div className="flex items-center justify-between rounded-2xl bg-zinc-900 px-3 py-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                              {dayGroup.dateKey === "sin-fecha"
                                ? "Sin fecha"
                                : formatDate(dayGroup.dateKey)}
                            </p>

                            <p className="mt-1 text-xs text-zinc-600">
                              {dayGroup.records.length} movimiento(s)
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-zinc-300">
                            {formatMoney(dayGroup.total)}
                          </p>
                        </div>

                        {dayGroup.records.map((record) =>
                          editingRecordId === record.id
                            ? renderEditForm(record)
                            : renderRecordCard(record)
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}