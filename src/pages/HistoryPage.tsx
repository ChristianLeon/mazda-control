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

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
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

  const totalSpent = useMemo(() => {
    return records.reduce((total, record) => total + record.cost, 0);
  }, [records]);

  const lastRecord = records[0];

  function startEdit(record: VehicleRecord) {
    setEditingRecordId(record.id);
    setEditType(record.type);
    setEditTitle(record.title);
    setEditDate(record.date);
    setEditMileage(String(record.mileage));
    setEditCost(String(record.cost));
    setEditWorkshopId(record.workshopId ?? "");
    setEditWorkshopName(record.workshopId ? "" : record.workshopName ?? "");
    setEditNotes(record.notes ?? "");
    setEditUpdateAsLastService(Boolean(record.updateAsLastService));
  }

  function cancelEdit() {
    setEditingRecordId(null);
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>, recordId: string) {
    event.preventDefault();

    const cleanMileage = Number(editMileage.replace(/[^\d]/g, ""));
    const cleanCost = Number(editCost.replace(/[^\d.]/g, ""));

    if (!Number.isFinite(cleanMileage) || cleanMileage <= 0) {
      return;
    }

    const selectedWorkshop = workshops.find(
      (workshop) => workshop.id === editWorkshopId
    );

    onUpdateRecord(recordId, {
      type: editType,
      title: editTitle,
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
        </div>
      </Card>

      {records.length === 0 ? (
        <Card title="Sin registros">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="font-semibold text-zinc-200">
              Aún no tienes historial capturado
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Presiona el botón + para agregar el primer servicio o mantenimiento.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) =>
            editingRecordId === record.id ? (
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
                        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
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
                      className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
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

                        if (event.target.value) {
                          setEditWorkshopName("");
                        }
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
                        onChange={(event) =>
                          setEditWorkshopName(event.target.value)
                        }
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
            ) : (
              <article
                key={record.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-xl">
                    {getRecordIcon(record.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {record.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(record.date)} ·{" "}
                          {formatKm(record.mileage)} km
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
            )
          )}
        </div>
      )}
    </>
  );
}