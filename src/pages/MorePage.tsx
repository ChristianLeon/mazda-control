import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Card from "../components/Card";
import TrafficCirculationPanel from "../components/TrafficCirculationPanel";
import CostAnalysisPanel from "../components/CostAnalysisPanel";
import type {
  Consumable,
  NewConsumableInput,
  NewVehicleDocumentInput,
  NewVehicleIssueInput,
  NewWorkshopInput,
  Vehicle,
  VehicleDocument,
  VehicleDocumentStatus,
  VehicleDocumentType,
  VehicleIssue,
  VehicleRecord,
  Workshop,
} from "../types/mazda";
import { calculateCostAnalysis } from "../utils/costAnalysis";

type UpdateVehicleIssueInput = NewVehicleIssueInput & {
  status: VehicleIssue["status"];
};

type MorePageProps = {
  vehicle: Vehicle;
  records: VehicleRecord[];
  consumables: Consumable[];
  issues: VehicleIssue[];
  workshops: Workshop[];
  documents: VehicleDocument[];
  onUpdateConsumable: (consumableId: string, input: NewConsumableInput) => void;
  onDeleteConsumable: (consumableId: string) => void;
  onUpdateIssue: (issueId: string, input: UpdateVehicleIssueInput) => void;
  onUpdateIssueStatus: (issueId: string, status: VehicleIssue["status"]) => void;
  onDeleteIssue: (issueId: string) => void;
  onUpdateWorkshop: (workshopId: string, input: NewWorkshopInput) => void;
  onDeleteWorkshop: (workshopId: string) => void;
  onUpdateDocument: (documentId: string, input: NewVehicleDocumentInput) => void;
  onDeleteDocument: (documentId: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<boolean>;
  onResetData: () => void;
};

type MorePanel =
  | "costs"
  | "issues"
  | "documents"
  | "workshops"
  | "consumables"
  | "trip-checklist"
  | "traffic"
  | "backup";

const issuePriorities: { value: VehicleIssue["priority"]; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

const issueStatuses: { value: VehicleIssue["status"]; label: string }[] = [
  { value: "open", label: "Abierta" },
  { value: "quoted", label: "Cotizada" },
  { value: "scheduled", label: "Programada" },
  { value: "resolved", label: "Resuelta" },
  { value: "dismissed", label: "Descartada" },
];

const documentTypes: { value: VehicleDocumentType; label: string }[] = [
  { value: "insurance", label: "Seguro" },
  { value: "verification", label: "Verificación" },
  { value: "tax", label: "Tenencia / refrendo" },
  { value: "registration", label: "Tarjeta de circulación" },
  { value: "invoice", label: "Factura" },
  { value: "warranty", label: "Garantía" },
  { value: "ticket", label: "Ticket" },
  { value: "service_order", label: "Orden de servicio" },
  { value: "manual", label: "Manual rápido" },
  { value: "traffic_regulation", label: "Guía vial / reglamento" },
  { value: "other", label: "Otro" },
];

const documentStatuses: { value: VehicleDocumentStatus; label: string }[] = [
  { value: "valid", label: "Vigente" },
  { value: "pending", label: "Pendiente" },
  { value: "expired", label: "Vencido" },
  { value: "paid", label: "Pagado" },
  { value: "archived", label: "Archivado" },
];

const workshopTypes: { value: Workshop["type"]; label: string }[] = [
  { value: "agency", label: "Agencia" },
  { value: "mechanic", label: "Taller mecánico" },
  { value: "tire_shop", label: "Llantera" },
  { value: "parts_store", label: "Refaccionaria" },
  { value: "detailing", label: "Lavado / detailing" },
  { value: "other", label: "Otro" },
];

const consumableCategories: {
  value: Consumable["category"];
  label: string;
}[] = [
  { value: "oil", label: "Aceite / lubricante" },
  { value: "filter", label: "Filtro" },
  { value: "tires", label: "Llanta" },
  { value: "wipers", label: "Limpiador" },
  { value: "battery", label: "Batería" },
  { value: "spark_plugs", label: "Bujía" },
  { value: "fluids", label: "Fluido" },
  { value: "cleaning", label: "Limpieza / aditivo" },
  { value: "other", label: "Otra refacción" },
];

type TripChecklistItem = {
  id: string;
  label: string;
  detail: string;
};

type TripChecklistGroup = {
  title: string;
  icon: string;
  items: TripChecklistItem[];
};

const tripChecklistGroups: TripChecklistGroup[] = [
  {
    title: "Motor y fluidos",
    icon: "⚙️",
    items: [
      {
        id: "oil",
        label: "Aceite de motor",
        detail: "Revisar nivel y que no haya fugas visibles.",
      },
      {
        id: "coolant",
        label: "Anticongelante",
        detail: "Revisar nivel, color y fugas.",
      },
      {
        id: "brake-fluid",
        label: "Líquido de frenos",
        detail: "Revisar nivel antes de carretera.",
      },
      {
        id: "washer-fluid",
        label: "Líquido limpiaparabrisas",
        detail: "Rellenar antes de salir.",
      },
    ],
  },
  {
    title: "Llantas",
    icon: "🛞",
    items: [
      {
        id: "tire-pressure",
        label: "Presión 40 PSI",
        detail: "Verificar en frío antes de salir.",
      },
      {
        id: "tire-wear",
        label: "Desgaste visible",
        detail: "Revisar desgaste irregular, grietas, chipotes o cortes.",
      },
      {
        id: "tools",
        label: "Herramienta / gato / birlos",
        detail: "Confirmar que estén completos y accesibles.",
      },
    ],
  },
  {
    title: "Seguridad",
    icon: "🛡️",
    items: [
      {
        id: "lights",
        label: "Luces",
        detail: "Altas, bajas, freno, direccionales e intermitentes.",
      },
      {
        id: "wipers",
        label: "Limpiadores",
        detail: "Que limpien parejo y no brinquen.",
      },
    ],
  },
  {
    title: "Cabina y viaje",
    icon: "🎒",
    items: [
      {
        id: "charger",
        label: "Cargador",
        detail: "Celular con batería o cargador disponible.",
      },
      {
        id: "cash",
        label: "Efectivo / tarjeta",
        detail: "Útil para casetas, estacionamientos o emergencias.",
      },
      {
        id: "tag",
        label: "TAG",
        detail: "Confirmar que esté disponible y con saldo para casetas.",
      },
    ],
  },
];

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function getPriorityLabel(priority: VehicleIssue["priority"]) {
  return (
    issuePriorities.find((item) => item.value === priority)?.label ?? priority
  );
}

function getStatusLabel(status: VehicleIssue["status"]) {
  return issueStatuses.find((item) => item.value === status)?.label ?? status;
}

function getDocumentTypeLabel(type: VehicleDocument["type"]) {
  return documentTypes.find((item) => item.value === type)?.label ?? "Documento";
}

function getDocumentStatusLabel(status: VehicleDocument["status"]) {
  return documentStatuses.find((item) => item.value === status)?.label ?? status;
}

function getWorkshopTypeLabel(type: Workshop["type"]) {
  return workshopTypes.find((item) => item.value === type)?.label ?? "Taller";
}

function getConsumableCategoryLabel(category: Consumable["category"]) {
  return (
    consumableCategories.find((item) => item.value === category)?.label ??
    "Refacción"
  );
}

function getPriorityClasses(priority: VehicleIssue["priority"]) {
  if (priority === "urgent") {
    return "border-red-700 bg-red-950/40 text-red-300";
  }

  if (priority === "high") {
    return "border-orange-700 bg-orange-950/40 text-orange-300";
  }

  if (priority === "medium") {
    return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
  }

  return "border-zinc-700 bg-zinc-950 text-zinc-300";
}

function getStatusClasses(status: VehicleIssue["status"]) {
  if (status === "resolved") {
    return "border-emerald-700 bg-emerald-950/30 text-emerald-300";
  }

  if (status === "scheduled") {
    return "border-blue-700 bg-blue-950/30 text-blue-300";
  }

  if (status === "quoted") {
    return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
  }

  if (status === "dismissed") {
    return "border-zinc-700 bg-zinc-950 text-zinc-400";
  }

  return "border-red-900 bg-red-950/30 text-red-300";
}

function getDocumentStatusClasses(status: VehicleDocument["status"]) {
  if (status === "valid") {
    return "border-emerald-700 bg-emerald-950/30 text-emerald-300";
  }

  if (status === "pending") {
    return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
  }

  if (status === "expired") {
    return "border-red-700 bg-red-950/40 text-red-300";
  }

  if (status === "paid") {
    return "border-blue-700 bg-blue-950/30 text-blue-300";
  }

  return "border-zinc-700 bg-zinc-950 text-zinc-400";
}

function MenuCard({
  icon,
  title,
  subtitle,
  metric,
  tone = "default",
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  metric?: string;
  tone?: "default" | "red" | "yellow" | "green" | "blue";
  onClick: () => void;
}) {
  const toneClasses = {
    default: "border-zinc-800 bg-zinc-950",
    red: "border-red-900/70 bg-red-950/20",
    yellow: "border-yellow-900/70 bg-yellow-950/20",
    green: "border-emerald-900/70 bg-emerald-950/20",
    blue: "border-blue-900/70 bg-blue-950/20",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl border p-4 text-left active:scale-[0.99] ${toneClasses[tone]}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
            </div>

            {metric && (
              <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
                {metric}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function DetailModal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                Más
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">{title}</h2>

              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
            >
              Cerrar
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function TripChecklistPanel() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const totalItems = tripChecklistGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  function toggleItem(itemId: string) {
    setCheckedItems((currentItems) =>
      currentItems.includes(itemId)
        ? currentItems.filter((item) => item !== itemId)
        : [...currentItems, itemId]
    );
  }

  function clearChecklist() {
    setCheckedItems([]);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-red-900/70 bg-red-950/20 p-4">
        <p className="text-sm font-semibold text-red-300">
          Checklist antes de salir
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Revisión rápida para carretera o trayectos largos. No sustituye una
          inspección mecánica.
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-300">
            {checkedItems.length}/{totalItems} completado(s)
          </span>

          <button
            type="button"
            onClick={clearChecklist}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {tripChecklistGroups.map((group) => {
        const completed = group.items.filter((item) =>
          checkedItems.includes(item.id)
        ).length;

        return (
          <section
            key={group.title}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
                  {group.icon}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-white">{group.title}</p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {completed}/{group.items.length} revisado(s)
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  completed === group.items.length
                    ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                    : "border-yellow-700 bg-yellow-950/40 text-yellow-300"
                }`}
              >
                {completed === group.items.length ? "Listo" : "Pendiente"}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {group.items.map((item) => {
                const checked = checkedItems.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`w-full rounded-2xl border p-3 text-left ${
                      checked
                        ? "border-emerald-900/70 bg-emerald-950/20"
                        : "border-zinc-800 bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          checked
                            ? "border-emerald-600 bg-emerald-700 text-white"
                            : "border-zinc-700 text-zinc-500"
                        }`}
                      >
                        {checked ? "✓" : ""}
                      </div>

                      <div>
                        <p className="font-semibold text-white">{item.label}</p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ConsumableEditForm({
  consumable,
  onCancel,
  onSave,
}: {
  consumable: Consumable;
  onCancel: () => void;
  onSave: (consumableId: string, input: NewConsumableInput) => void;
}) {
  const [name, setName] = useState(consumable.name);
  const [category, setCategory] = useState<Consumable["category"]>(
    consumable.category
  );
  const [brand, setBrand] = useState(consumable.brand ?? "");
  const [specification, setSpecification] = useState(
    consumable.specification ?? ""
  );
  const [notes, setNotes] = useState(consumable.notes ?? "");
  const [isFavorite, setIsFavorite] = useState(Boolean(consumable.isFavorite));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return;

    onSave(consumable.id, {
      name,
      category,
      brand,
      specification,
      notes,
      isFavorite,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-red-900/70 bg-zinc-900 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
        Editando pieza / refacción
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Nombre
          </label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Categoría
          </label>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Consumable["category"])
            }
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          >
            {consumableCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Marca
          </label>

          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Opcional"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Especificación / medida
          </label>

          <input
            value={specification}
            onChange={(event) => setSpecification(event.target.value)}
            placeholder="Opcional"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(event) => setIsFavorite(event.target.checked)}
            className="h-5 w-5 accent-red-700"
          />

          <span className="text-sm text-zinc-200">Marcar como favorito</span>
        </label>

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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
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

function IssueEditForm({
  issue,
  onCancel,
  onSave,
}: {
  issue: VehicleIssue;
  onCancel: () => void;
  onSave: (issueId: string, input: UpdateVehicleIssueInput) => void;
}) {
  const [title, setTitle] = useState(issue.title);
  const [priority, setPriority] = useState<VehicleIssue["priority"]>(
    issue.priority
  );
  const [status, setStatus] = useState<VehicleIssue["status"]>(issue.status);
  const [detectedMileage, setDetectedMileage] = useState(
    String(issue.detectedMileage)
  );
  const [estimatedCost, setEstimatedCost] = useState(
    issue.estimatedCost === undefined ? "" : String(issue.estimatedCost)
  );
  const [notes, setNotes] = useState(issue.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMileage = Number(detectedMileage.replace(/[^\d]/g, ""));
    const cleanCost = Number(estimatedCost.replace(/[^\d.]/g, ""));

    if (!title.trim()) return;
    if (!Number.isFinite(cleanMileage) || cleanMileage <= 0) return;

    onSave(issue.id, {
      title,
      priority,
      status,
      detectedMileage: cleanMileage,
      estimatedCost:
        Number.isFinite(cleanCost) && cleanCost > 0 ? cleanCost : undefined,
      notes,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-red-900/70 bg-zinc-900 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
        Editando falla
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Título
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Prioridad
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as VehicleIssue["priority"])
              }
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            >
              {issuePriorities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Estado
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as VehicleIssue["status"])
              }
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            >
              {issueStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Km detectado
          </label>

          <input
            value={detectedMileage}
            onChange={(event) =>
              setDetectedMileage(event.target.value.replace(/[^\d]/g, ""))
            }
            inputMode="numeric"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Costo estimado
          </label>

          <input
            value={estimatedCost}
            onChange={(event) =>
              setEstimatedCost(event.target.value.replace(/[^\d.]/g, ""))
            }
            inputMode="decimal"
            placeholder="Opcional"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
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

function DocumentEditForm({
  documentItem,
  onCancel,
  onSave,
}: {
  documentItem: VehicleDocument;
  onCancel: () => void;
  onSave: (documentId: string, input: NewVehicleDocumentInput) => void;
}) {
  const [type, setType] = useState<VehicleDocumentType>(documentItem.type);
  const [title, setTitle] = useState(documentItem.title);
  const [status, setStatus] = useState<VehicleDocumentStatus>(
    documentItem.status
  );
  const [issueDate, setIssueDate] = useState(documentItem.issueDate ?? "");
  const [expirationDate, setExpirationDate] = useState(
    documentItem.expirationDate ?? ""
  );
  const [cost, setCost] = useState(
    documentItem.cost === undefined ? "" : String(documentItem.cost)
  );
  const [provider, setProvider] = useState(documentItem.provider ?? "");
  const [folio, setFolio] = useState(documentItem.folio ?? "");
  const [notes, setNotes] = useState(documentItem.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanCost = Number(cost.replace(/[^\d.]/g, ""));

    if (!title.trim()) return;

    onSave(documentItem.id, {
      type,
      title,
      status,
      issueDate: issueDate || undefined,
      expirationDate: expirationDate || undefined,
      cost: Number.isFinite(cleanCost) && cleanCost > 0 ? cleanCost : undefined,
      provider,
      folio,
      notes,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-red-900/70 bg-zinc-900 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
        Editando documento
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Tipo
          </label>

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as VehicleDocumentType)
            }
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          >
            {documentTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Título
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Estado
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as VehicleDocumentStatus)
            }
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          >
            {documentStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Emisión / pago
            </label>

            <input
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Vence / límite
            </label>

            <input
              type="date"
              value={expirationDate}
              onChange={(event) => setExpirationDate(event.target.value)}
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
            Proveedor / entidad
          </label>

          <input
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="Ej. El Águila, Gobierno, Verificentro, Taller..."
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Folio / póliza
          </label>

          <input
            value={folio}
            onChange={(event) => setFolio(event.target.value)}
            placeholder="Opcional"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Notas
          </label>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Notas del documento..."
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
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

function WorkshopEditForm({
  workshop,
  onCancel,
  onSave,
}: {
  workshop: Workshop;
  onCancel: () => void;
  onSave: (workshopId: string, input: NewWorkshopInput) => void;
}) {
  const [name, setName] = useState(workshop.name);
  const [type, setType] = useState<Workshop["type"]>(workshop.type);
  const [phone, setPhone] = useState(workshop.phone ?? "");
  const [address, setAddress] = useState(workshop.address ?? "");
  const [notes, setNotes] = useState(workshop.notes ?? "");
  const [rating, setRating] = useState(
    workshop.rating === undefined ? "" : String(workshop.rating)
  );
  const [isFavorite, setIsFavorite] = useState(Boolean(workshop.isFavorite));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanRating = Number(rating.replace(/[^\d]/g, ""));

    if (!name.trim()) return;

    onSave(workshop.id, {
      name,
      type,
      phone,
      address,
      notes,
      rating:
        Number.isFinite(cleanRating) && cleanRating > 0
          ? Math.min(cleanRating, 5)
          : undefined,
      isFavorite,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-red-900/70 bg-zinc-900 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
        Editando taller
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Nombre
          </label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Tipo
          </label>

          <select
            value={type}
            onChange={(event) => setType(event.target.value as Workshop["type"])}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          >
            {workshopTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Teléfono
          </label>

          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Dirección
          </label>

          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Calificación 1-5
          </label>

          <input
            value={rating}
            onChange={(event) =>
              setRating(event.target.value.replace(/[^\d]/g, ""))
            }
            inputMode="numeric"
            placeholder="Opcional"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(event) => setIsFavorite(event.target.checked)}
            className="h-5 w-5 accent-red-700"
          />

          <span className="text-sm text-zinc-200">Marcar como favorito</span>
        </label>

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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
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

export default function MorePage({
  vehicle,
  records,
  consumables,
  issues,
  workshops,
  documents,
  onUpdateConsumable,
  onDeleteConsumable,
  onUpdateIssue,
  onUpdateIssueStatus,
  onDeleteIssue,
  onUpdateWorkshop,
  onDeleteWorkshop,
  onUpdateDocument,
  onDeleteDocument,
  onExportData,
  onImportData,
  onResetData,
}: MorePageProps) {
  const [activePanel, setActivePanel] = useState<MorePanel | null>(null);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null
  );
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(
    null
  );
  const [editingConsumableId, setEditingConsumableId] = useState<string | null>(
    null
  );

  const backupFileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupMessage, setBackupMessage] = useState("");
  const [isImportingBackup, setIsImportingBackup] = useState(false);

  const activeIssues = issues.filter(
    (issue) => issue.status !== "resolved" && issue.status !== "dismissed"
  );

  const closedIssues = issues.filter(
    (issue) => issue.status === "resolved" || issue.status === "dismissed"
  );

  const costAnalysis = useMemo(
    () =>
      calculateCostAnalysis({
        vehicle,
        records,
        documents,
        issues,
      }),
    [vehicle, records, documents, issues]
  );

  function getPanelTitle(panel: MorePanel) {
  const titles: Record<MorePanel, { title: string; subtitle: string }> = {
    costs: {
      title: "Análisis de costos",
      subtitle: "Gastos reales, estimados y costo por km",
    },
    issues: {
      title: "Fallas y pendientes",
      subtitle: "Editar, resolver o eliminar fallas",
    },
    documents: {
      title: "Documentos",
      subtitle: "Editar vigencias, costos, folios y estados",
    },
    workshops: {
      title: "Talleres",
      subtitle: "Editar proveedores y favoritos",
    },
    consumables: {
      title: "Piezas / Refacciones",
      subtitle: "Catálogo útil de piezas, fluidos y especificaciones",
    },
    "trip-checklist": {
      title: "Checklist de viaje",
      subtitle: "Revisión rápida antes de salir a carretera",
    },
    traffic: {
      title: "Tránsito y circulación",
      subtitle: "Morelia, CDMX / EdoMex y accesos oficiales",
    },
    backup: {
      title: "Respaldo",
      subtitle: "Exportar, importar o reiniciar datos locales",
    },
  };

  return titles[panel];
}

  function saveConsumable(consumableId: string, input: NewConsumableInput) {
    onUpdateConsumable(consumableId, input);
    setEditingConsumableId(null);
  }

  function deleteConsumable(consumableId: string) {
    const confirmed = window.confirm("¿Eliminar esta pieza / refacción?");

    if (confirmed) {
      onDeleteConsumable(consumableId);
      setEditingConsumableId(null);
    }
  }

  function saveIssue(issueId: string, input: UpdateVehicleIssueInput) {
    onUpdateIssue(issueId, input);
    setEditingIssueId(null);
  }

  function deleteIssue(issueId: string) {
    const confirmed = window.confirm("¿Eliminar esta falla?");

    if (confirmed) {
      onDeleteIssue(issueId);
      setEditingIssueId(null);
    }
  }

  function saveDocument(documentId: string, input: NewVehicleDocumentInput) {
    onUpdateDocument(documentId, input);
    setEditingDocumentId(null);
  }

  function deleteDocument(documentId: string) {
    const confirmed = window.confirm("¿Eliminar este documento?");

    if (confirmed) {
      onDeleteDocument(documentId);
      setEditingDocumentId(null);
    }
  }

  function saveWorkshop(workshopId: string, input: NewWorkshopInput) {
    onUpdateWorkshop(workshopId, input);
    setEditingWorkshopId(null);
  }

  function deleteWorkshop(workshopId: string) {
    const confirmed = window.confirm("¿Eliminar este taller?");

    if (confirmed) {
      onDeleteWorkshop(workshopId);
      setEditingWorkshopId(null);
    }
  }

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const confirmed = window.confirm(
      "¿Importar este respaldo? Esto reemplazará los datos actuales de Mazda Control."
    );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    setIsImportingBackup(true);
    setBackupMessage("");

    const imported = await onImportData(file);

    setIsImportingBackup(false);
    event.target.value = "";

    if (!imported) {
      setBackupMessage(
        "No se pudo importar el archivo. Verifica que sea un respaldo válido de Mazda Control."
      );
      return;
    }

    setBackupMessage("Respaldo importado correctamente. Recargando app...");

    window.setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  function handleResetLocalData() {
    const confirmed = window.confirm(
      "¿Reiniciar todos los datos locales? Esta acción restaurará la información inicial y reemplazará los datos actuales en este navegador."
    );

    if (!confirmed) return;

    onResetData();
    setBackupMessage("Datos reiniciados. Recargando app...");

    window.setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  function renderConsumableCard(item: Consumable) {
    if (editingConsumableId === item.id) {
      return (
        <ConsumableEditForm
          key={item.id}
          consumable={item}
          onCancel={() => setEditingConsumableId(null)}
          onSave={saveConsumable}
        />
      );
    }

    return (
      <article
        key={item.id}
        className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{item.name}</p>

            <p className="mt-1 text-xs text-zinc-500">
              {getConsumableCategoryLabel(item.category)}
              {item.brand ? ` · ${item.brand}` : ""}
            </p>
          </div>

          {item.isFavorite && (
            <span className="shrink-0 rounded-full border border-yellow-700 bg-yellow-950/30 px-3 py-1 text-xs font-semibold text-yellow-300">
              Favorito
            </span>
          )}
        </div>

        {item.specification && (
          <div className="mt-3 rounded-2xl bg-zinc-900 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Especificación / medida
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-200">
              {item.specification}
            </p>
          </div>
        )}

        {item.notes && (
          <p className="mt-3 rounded-2xl bg-zinc-900 p-3 text-sm text-zinc-400">
            {item.notes}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setEditingConsumableId(item.id)}
            className="rounded-2xl bg-red-700 px-3 py-3 text-sm font-semibold text-white"
          >
            Editar
          </button>

          <button
            onClick={() => deleteConsumable(item.id)}
            className="rounded-2xl border border-red-900 px-3 py-3 text-sm font-semibold text-red-400"
          >
            Eliminar
          </button>
        </div>
      </article>
    );
  }

  function renderIssueCard(issue: VehicleIssue) {
    if (editingIssueId === issue.id) {
      return (
        <IssueEditForm
          key={issue.id}
          issue={issue}
          onCancel={() => setEditingIssueId(null)}
          onSave={saveIssue}
        />
      );
    }

    return (
      <article
        key={issue.id}
        className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{issue.title}</p>

            <p className="mt-1 text-xs text-zinc-500">
              Detectado: {issue.detectedMileage.toLocaleString("es-MX")} km
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                issue.priority
              )}`}
            >
              {getPriorityLabel(issue.priority)}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                issue.status
              )}`}
            >
              {getStatusLabel(issue.status)}
            </span>
          </div>
        </div>

        {issue.estimatedCost !== undefined && (
          <p className="mt-3 text-sm text-zinc-400">
            Costo estimado: {formatMoney(issue.estimatedCost)}
          </p>
        )}

        {issue.notes && (
          <p className="mt-2 rounded-2xl bg-zinc-900 p-3 text-sm text-zinc-400">
            {issue.notes}
          </p>
        )}

        {issue.status !== "resolved" && issue.status !== "dismissed" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateIssueStatus(issue.id, "quoted")}
              className="rounded-xl bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
            >
              Cotizada
            </button>

            <button
              onClick={() => onUpdateIssueStatus(issue.id, "scheduled")}
              className="rounded-xl bg-blue-950/60 px-3 py-2 text-sm text-blue-200"
            >
              Programada
            </button>

            <button
              onClick={() => onUpdateIssueStatus(issue.id, "resolved")}
              className="rounded-xl bg-emerald-950/60 px-3 py-2 text-sm text-emerald-200"
            >
              Resuelta
            </button>

            <button
              onClick={() => onUpdateIssueStatus(issue.id, "dismissed")}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-400"
            >
              Descartar
            </button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setEditingIssueId(issue.id)}
            className="rounded-2xl bg-red-700 px-3 py-3 text-sm font-semibold text-white"
          >
            Editar falla
          </button>

          <button
            onClick={() => deleteIssue(issue.id)}
            className="rounded-2xl border border-red-900 px-3 py-3 text-sm font-semibold text-red-400"
          >
            Eliminar
          </button>
        </div>
      </article>
    );
  }

  function renderDocumentCard(documentItem: VehicleDocument) {
    if (editingDocumentId === documentItem.id) {
      return (
        <DocumentEditForm
          key={documentItem.id}
          documentItem={documentItem}
          onCancel={() => setEditingDocumentId(null)}
          onSave={saveDocument}
        />
      );
    }

    return (
      <article
        key={documentItem.id}
        className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {documentItem.title}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {getDocumentTypeLabel(documentItem.type)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getDocumentStatusClasses(
              documentItem.status
            )}`}
          >
            {getDocumentStatusLabel(documentItem.status)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-zinc-900 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Emisión / pago
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-200">
              {formatDate(documentItem.issueDate)}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Vencimiento
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-200">
              {formatDate(documentItem.expirationDate)}
            </p>
          </div>
        </div>

        {(documentItem.folio ||
          documentItem.provider ||
          documentItem.cost !== undefined) && (
          <div className="mt-3 space-y-1 text-sm text-zinc-400">
            {documentItem.folio && (
              <p>
                <span className="text-zinc-600">Folio:</span>{" "}
                {documentItem.folio}
              </p>
            )}

            {documentItem.provider && (
              <p>
                <span className="text-zinc-600">Proveedor:</span>{" "}
                {documentItem.provider}
              </p>
            )}

            {documentItem.cost !== undefined && (
              <p>
                <span className="text-zinc-600">Costo:</span>{" "}
                {formatMoney(documentItem.cost)}
              </p>
            )}
          </div>
        )}

        {documentItem.notes && (
          <p className="mt-3 rounded-xl bg-zinc-900 p-3 text-sm text-zinc-400">
            {documentItem.notes}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setEditingDocumentId(documentItem.id)}
            className="rounded-2xl bg-red-700 px-3 py-3 text-sm font-semibold text-white"
          >
            Editar documento
          </button>

          <button
            onClick={() => deleteDocument(documentItem.id)}
            className="rounded-2xl border border-red-900 px-3 py-3 text-sm font-semibold text-red-400"
          >
            Eliminar
          </button>
        </div>
      </article>
    );
  }

  function renderWorkshopCard(workshop: Workshop) {
    if (editingWorkshopId === workshop.id) {
      return (
        <WorkshopEditForm
          key={workshop.id}
          workshop={workshop}
          onCancel={() => setEditingWorkshopId(null)}
          onSave={saveWorkshop}
        />
      );
    }

    return (
      <article
        key={workshop.id}
        className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {workshop.name}
              {workshop.isFavorite ? " ★" : ""}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {getWorkshopTypeLabel(workshop.type)}
            </p>
          </div>

          {workshop.rating && (
            <span className="rounded-full border border-yellow-700 bg-yellow-950/30 px-3 py-1 text-xs font-semibold text-yellow-300">
              {workshop.rating}/5
            </span>
          )}
        </div>

        {workshop.phone && (
          <p className="mt-3 text-sm text-zinc-400">Tel: {workshop.phone}</p>
        )}

        {workshop.address && (
          <p className="mt-1 text-sm text-zinc-400">{workshop.address}</p>
        )}

        {workshop.notes && (
          <p className="mt-3 rounded-xl bg-zinc-900 p-3 text-sm text-zinc-400">
            {workshop.notes}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setEditingWorkshopId(workshop.id)}
            className="rounded-2xl bg-red-700 px-3 py-3 text-sm font-semibold text-white"
          >
            Editar taller
          </button>

          <button
            onClick={() => deleteWorkshop(workshop.id)}
            className="rounded-2xl border border-red-900 px-3 py-3 text-sm font-semibold text-red-400"
          >
            Eliminar
          </button>
        </div>
      </article>
    );
  }

   return (
    <>
      <Card title="Más">
        <div className="space-y-3">
          <MenuCard
            icon="📊"
            title="Análisis de costos"
            subtitle="Gasto real, pendiente y top gastos"
            metric={formatMoney(costAnalysis.totalKnownCost)}
            tone="red"
            onClick={() => setActivePanel("costs")}
          />

          <MenuCard
            icon="⚠️"
            title="Fallas"
            subtitle="Activas y cerradas"
            metric={String(activeIssues.length)}
            tone={activeIssues.length > 0 ? "yellow" : "green"}
            onClick={() => setActivePanel("issues")}
          />

          <MenuCard
            icon="📁"
            title="Docs"
            subtitle="Vigencias"
            metric={String(documents.length)}
            tone="blue"
            onClick={() => setActivePanel("documents")}
          />

          <MenuCard
            icon="🛠️"
            title="Talleres"
            subtitle="Proveedores"
            metric={String(workshops.length)}
            onClick={() => setActivePanel("workshops")}
          />

          <MenuCard
            icon="🔩"
            title="Piezas / Refacciones"
            subtitle="Catálogo del Mazda"
            metric={String(consumables.length)}
            onClick={() => setActivePanel("consumables")}
          />

          <MenuCard
            icon="🧳"
            title="Checklist de viaje"
            subtitle="Antes de carretera"
            onClick={() => setActivePanel("trip-checklist")}
          />

          <MenuCard
            icon="🚦"
            title="Tránsito y circulación"
            subtitle="Morelia, CDMX / EdoMex"
            onClick={() => setActivePanel("traffic")}
          />

          <MenuCard
            icon="💾"
            title="Respaldo"
            subtitle="Exportar, importar o reiniciar"
            onClick={() => setActivePanel("backup")}
          />
        </div>
      </Card>

      {activePanel && (
        <DetailModal
          title={getPanelTitle(activePanel).title}
          subtitle={getPanelTitle(activePanel).subtitle}
          onClose={() => {
            setActivePanel(null);
            setEditingIssueId(null);
            setEditingDocumentId(null);
            setEditingWorkshopId(null);
            setEditingConsumableId(null);
          }}
        >
          {activePanel === "costs" && (
  <CostAnalysisPanel costAnalysis={costAnalysis} />
)}

          {activePanel === "issues" && (
            <div className="space-y-3">
              {activeIssues.length === 0 ? (
                <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/20 p-4 text-center">
                  <p className="font-semibold text-emerald-300">
                    Sin fallas activas
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Agrega pendientes desde el botón +
                  </p>
                </div>
              ) : (
                activeIssues.map((issue) => renderIssueCard(issue))
              )}

              {closedIssues.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Cerradas
                  </p>

                  {closedIssues.map((issue) => renderIssueCard(issue))}
                </div>
              )}
            </div>
          )}

          {activePanel === "documents" && (
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
                  <p className="text-sm text-zinc-400">
                    Aún no tienes documentos registrados.
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Usa el botón + y selecciona Doc.
                  </p>
                </div>
              ) : (
                documents.map((documentItem) => renderDocumentCard(documentItem))
              )}
            </div>
          )}

          {activePanel === "workshops" && (
            <div className="space-y-3">
              {workshops.length === 0 ? (
                <p className="text-zinc-400">
                  Aún no tienes talleres registrados.
                </p>
              ) : (
                workshops.map((workshop) => renderWorkshopCard(workshop))
              )}
            </div>
          )}

          {activePanel === "consumables" && (
            <div className="space-y-3">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-semibold text-white">
                  Catálogo de referencia
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Guarda qué piezas, refacciones, fluidos o medidas usa tu
                  Mazda. El historial real de cambios sigue en Historial y
                  Estado.
                </p>
              </div>

              {consumables.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
                  <p className="text-sm text-zinc-400">
                    Sin piezas o refacciones registradas.
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Agrega una desde el botón + y selecciona Pza.
                  </p>
                </div>
              ) : (
                consumables.map((item) => renderConsumableCard(item))
              )}
            </div>
          )}

          {activePanel === "trip-checklist" && <TripChecklistPanel />}

          {activePanel === "traffic" && <TrafficCirculationPanel />}

          {activePanel === "backup" && (
            <div className="space-y-3">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-semibold text-white">Respaldo local</p>

                <p className="mt-1 text-sm text-zinc-500">
                  Exporta una copia JSON para guardar tus datos fuera del
                  navegador.
                </p>

                <button
                  type="button"
                  onClick={onExportData}
                  className="mt-4 w-full rounded-2xl bg-zinc-800 px-4 py-3 font-semibold text-white"
                >
                  Exportar respaldo JSON
                </button>
              </div>

              <div className="rounded-3xl border border-blue-900/70 bg-blue-950/20 p-4">
                <p className="font-semibold text-blue-300">
                  Importar respaldo
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Carga un archivo JSON exportado desde Mazda Control. El
                  respaldo importado reemplazará los datos actuales.
                </p>

                <input
                  ref={backupFileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportBackup}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isImportingBackup}
                  onClick={() => backupFileInputRef.current?.click()}
                  className="mt-4 w-full rounded-2xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {isImportingBackup
                    ? "Importando..."
                    : "Importar respaldo JSON"}
                </button>
              </div>

              <div className="rounded-3xl border border-red-900 bg-red-950/20 p-4">
                <p className="font-semibold text-red-300">Zona de riesgo</p>

                <p className="mt-1 text-sm text-zinc-500">
                  Esto restaura la información inicial de la app y reemplaza
                  los datos locales guardados en este navegador.
                </p>

                <button
                  type="button"
                  onClick={handleResetLocalData}
                  className="mt-4 w-full rounded-2xl border border-red-900 px-4 py-3 font-semibold text-red-400"
                >
                  Reiniciar datos locales
                </button>
              </div>

              {backupMessage && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-300">{backupMessage}</p>
                </div>
              )}
            </div>
          )}
        </DetailModal>
      )}
    </>
  );
}