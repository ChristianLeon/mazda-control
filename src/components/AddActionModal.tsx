import { useEffect, useState, type FormEvent } from "react";
import type {
  NewServiceRecordInput,
  NewVehicleDocumentInput,
  NewVehicleIssueInput,
  NewWorkshopInput,
  Priority,
  VehicleDocumentStatus,
  VehicleDocumentType,
  VehicleRecordType,
  Workshop,
} from "../types/mazda";

type AddActionModalProps = {
  isOpen: boolean;
  currentMileage: number;
  workshops: Workshop[];
  onClose: () => void;
  onSaveService: (input: NewServiceRecordInput) => void;
  onSaveIssue: (input: NewVehicleIssueInput) => void;
  onSaveWorkshop: (input: NewWorkshopInput) => void;
  onSaveDocument: (input: NewVehicleDocumentInput) => void;
};

type AddMode = "service" | "issue" | "workshop" | "document";

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
  { value: "other", label: "Otro" },
];

const priorities: { value: Priority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

const workshopTypes: { value: Workshop["type"]; label: string }[] = [
  { value: "agency", label: "Agencia" },
  { value: "mechanic", label: "Taller mecánico" },
  { value: "tire_shop", label: "Llantera" },
  { value: "parts_store", label: "Refaccionaria" },
  { value: "detailing", label: "Lavado / detailing" },
  { value: "other", label: "Otro" },
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddActionModal({
  isOpen,
  currentMileage,
  workshops,
  onClose,
  onSaveService,
  onSaveIssue,
  onSaveWorkshop,
  onSaveDocument,
}: AddActionModalProps) {
  const [mode, setMode] = useState<AddMode>("service");

  const [type, setType] = useState<VehicleRecordType>("service");
  const [title, setTitle] = useState("Servicio / mantenimiento");
  const [date, setDate] = useState(today());
  const [mileage, setMileage] = useState(String(currentMileage));
  const [cost, setCost] = useState("0");
  const [workshopName, setWorkshopName] = useState("");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [notes, setNotes] = useState("");
  const [updateAsLastService, setUpdateAsLastService] = useState(true);

  const [issueTitle, setIssueTitle] = useState("");
  const [issuePriority, setIssuePriority] = useState<Priority>("medium");
  const [issueMileage, setIssueMileage] = useState(String(currentMileage));
  const [issueEstimatedCost, setIssueEstimatedCost] = useState("");
  const [issueNotes, setIssueNotes] = useState("");

  const [workshopNameInput, setWorkshopNameInput] = useState("");
  const [workshopType, setWorkshopType] = useState<Workshop["type"]>("mechanic");
  const [workshopPhone, setWorkshopPhone] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [workshopNotes, setWorkshopNotes] = useState("");
  const [workshopRating, setWorkshopRating] = useState("5");
  const [workshopFavorite, setWorkshopFavorite] = useState(false);

  const [documentType, setDocumentType] = useState<VehicleDocumentType>("other");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentIssueDate, setDocumentIssueDate] = useState("");
  const [documentExpirationDate, setDocumentExpirationDate] = useState("");
  const [documentCost, setDocumentCost] = useState("");
  const [documentProvider, setDocumentProvider] = useState("");
  const [documentFolio, setDocumentFolio] = useState("");
  const [documentNotes, setDocumentNotes] = useState("");
  const [documentStatus, setDocumentStatus] =
    useState<VehicleDocumentStatus>("valid");

  useEffect(() => {
    if (isOpen) {
      setMileage(String(currentMileage));
      setIssueMileage(String(currentMileage));
    }
  }, [currentMileage, isOpen]);

  if (!isOpen) return null;

  function resetServiceForm() {
    setType("service");
    setTitle("Servicio / mantenimiento");
    setDate(today());
    setCost("0");
    setWorkshopName("");
    setSelectedWorkshopId("");
    setNotes("");
    setUpdateAsLastService(true);
  }

  function resetIssueForm() {
    setIssueTitle("");
    setIssuePriority("medium");
    setIssueMileage(String(currentMileage));
    setIssueEstimatedCost("");
    setIssueNotes("");
  }

  function resetWorkshopForm() {
    setWorkshopNameInput("");
    setWorkshopType("mechanic");
    setWorkshopPhone("");
    setWorkshopAddress("");
    setWorkshopNotes("");
    setWorkshopRating("5");
    setWorkshopFavorite(false);
  }

  function resetDocumentForm() {
    setDocumentType("other");
    setDocumentTitle("");
    setDocumentIssueDate("");
    setDocumentExpirationDate("");
    setDocumentCost("");
    setDocumentProvider("");
    setDocumentFolio("");
    setDocumentNotes("");
    setDocumentStatus("valid");
  }

  function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMileage = Number(mileage.replace(/[^\d]/g, ""));
    const cleanCost = Number(cost.replace(/[^\d.]/g, ""));

    if (!Number.isFinite(cleanMileage) || cleanMileage <= 0) return;

    const selectedWorkshop = workshops.find(
      (workshop) => workshop.id === selectedWorkshopId
    );

    onSaveService({
      type,
      title,
      date,
      mileage: cleanMileage,
      cost: Number.isFinite(cleanCost) ? cleanCost : 0,
      workshopId: selectedWorkshop?.id,
      workshopName: selectedWorkshop?.name ?? workshopName,
      notes,
      updateAsLastService,
    });

    resetServiceForm();
    onClose();
  }

  function handleIssueSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMileage = Number(issueMileage.replace(/[^\d]/g, ""));
    const cleanCost = Number(issueEstimatedCost.replace(/[^\d.]/g, ""));

    if (!issueTitle.trim()) return;
    if (!Number.isFinite(cleanMileage) || cleanMileage <= 0) return;

    onSaveIssue({
      title: issueTitle,
      priority: issuePriority,
      detectedMileage: cleanMileage,
      estimatedCost: Number.isFinite(cleanCost) && cleanCost > 0 ? cleanCost : undefined,
      notes: issueNotes,
    });

    resetIssueForm();
    onClose();
  }

  function handleWorkshopSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanRating = Number(workshopRating);

    if (!workshopNameInput.trim()) return;

    onSaveWorkshop({
      name: workshopNameInput,
      type: workshopType,
      phone: workshopPhone,
      address: workshopAddress,
      notes: workshopNotes,
      rating: Number.isFinite(cleanRating)
        ? Math.min(Math.max(cleanRating, 1), 5)
        : undefined,
      isFavorite: workshopFavorite,
    });

    resetWorkshopForm();
    onClose();
  }

  function handleDocumentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanCost = Number(documentCost.replace(/[^\d.]/g, ""));

    if (!documentTitle.trim()) return;

    onSaveDocument({
      type: documentType,
      title: documentTitle,
      issueDate: documentIssueDate || undefined,
      expirationDate: documentExpirationDate || undefined,
      cost: Number.isFinite(cleanCost) && cleanCost > 0 ? cleanCost : undefined,
      provider: documentProvider,
      folio: documentFolio,
      notes: documentNotes,
      status: documentStatus,
    });

    resetDocumentForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
              Nuevo registro
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {mode === "service"
                ? "Servicio / mantenimiento"
                : mode === "issue"
                  ? "Falla / pendiente"
                  : mode === "workshop"
                    ? "Taller / proveedor"
                    : "Documento"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
          >
            Cerrar
          </button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 rounded-2xl bg-zinc-900 p-1">
          {[
            ["service", "Servicio"],
            ["issue", "Falla"],
            ["workshop", "Taller"],
            ["document", "Doc."],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value as AddMode)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                mode === value ? "bg-red-700 text-white" : "text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "service" && (
          <form onSubmit={handleServiceSubmit} className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Tipo
              </label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as VehicleRecordType)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
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
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
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
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Km
                </label>
                <input
                  value={mileage}
                  onChange={(event) => setMileage(event.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Costo
              </label>
              <input
                value={cost}
                onChange={(event) => setCost(event.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Taller / proveedor
              </label>

              <select
                value={selectedWorkshopId}
                onChange={(event) => {
                  setSelectedWorkshopId(event.target.value);

                  if (event.target.value) {
                    setWorkshopName("");
                  }
                }}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              >
                <option value="">Texto libre / no registrado</option>

                {workshops.map((workshop) => (
                  <option key={workshop.id} value={workshop.id}>
                    {workshop.name}
                    {workshop.isFavorite ? " ★" : ""}
                  </option>
                ))}
              </select>

              {!selectedWorkshopId && (
                <input
                  value={workshopName}
                  onChange={(event) => setWorkshopName(event.target.value)}
                  placeholder="Escribe taller o proveedor"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
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
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <input
                type="checkbox"
                checked={updateAsLastService}
                onChange={(event) => setUpdateAsLastService(event.target.checked)}
                className="h-5 w-5 accent-red-700"
              />
              <span className="text-sm text-zinc-200">
                Actualizar como último servicio
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
            >
              Guardar servicio
            </button>
          </form>
        )}

        {mode === "issue" && (
          <form onSubmit={handleIssueSubmit} className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Falla / pendiente
              </label>
              <input
                value={issueTitle}
                onChange={(event) => setIssueTitle(event.target.value)}
                placeholder="Ej. Balatas delanteras"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Prioridad
                </label>
                <select
                  value={issuePriority}
                  onChange={(event) => setIssuePriority(event.target.value as Priority)}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Km detectado
                </label>
                <input
                  value={issueMileage}
                  onChange={(event) => setIssueMileage(event.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Costo estimado
              </label>
              <input
                value={issueEstimatedCost}
                onChange={(event) =>
                  setIssueEstimatedCost(event.target.value.replace(/[^\d.]/g, ""))
                }
                inputMode="decimal"
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Notas
              </label>
              <textarea
                value={issueNotes}
                onChange={(event) => setIssueNotes(event.target.value)}
                rows={3}
                placeholder="Síntomas, piezas, cotización, taller sugerido..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
            >
              Guardar falla
            </button>
          </form>
        )}

        {mode === "workshop" && (
          <form onSubmit={handleWorkshopSubmit} className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Nombre
              </label>
              <input
                value={workshopNameInput}
                onChange={(event) => setWorkshopNameInput(event.target.value)}
                placeholder="Ej. Taller de confianza"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Tipo
              </label>
              <select
                value={workshopType}
                onChange={(event) => setWorkshopType(event.target.value as Workshop["type"])}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
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
                value={workshopPhone}
                onChange={(event) => setWorkshopPhone(event.target.value)}
                placeholder="Opcional"
                inputMode="tel"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Dirección
              </label>
              <input
                value={workshopAddress}
                onChange={(event) => setWorkshopAddress(event.target.value)}
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Calificación
              </label>
              <select
                value={workshopRating}
                onChange={(event) => setWorkshopRating(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              >
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Bueno</option>
                <option value="3">3 - Regular</option>
                <option value="2">2 - Malo</option>
                <option value="1">1 - No recomendado</option>
              </select>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <input
                type="checkbox"
                checked={workshopFavorite}
                onChange={(event) => setWorkshopFavorite(event.target.checked)}
                className="h-5 w-5 accent-red-700"
              />
              <span className="text-sm text-zinc-200">Marcar como favorito</span>
            </label>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Notas
              </label>
              <textarea
                value={workshopNotes}
                onChange={(event) => setWorkshopNotes(event.target.value)}
                rows={3}
                placeholder="Especialidad, precios, trato, garantía..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
            >
              Guardar taller
            </button>
          </form>
        )}

        {mode === "document" && (
          <form onSubmit={handleDocumentSubmit} className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Tipo
              </label>
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as VehicleDocumentType)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
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
                value={documentTitle}
                onChange={(event) => setDocumentTitle(event.target.value)}
                placeholder="Ej. Seguro 2026"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Estado
              </label>
              <select
                value={documentStatus}
                onChange={(event) =>
                  setDocumentStatus(event.target.value as VehicleDocumentStatus)
                }
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
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
                  value={documentIssueDate}
                  onChange={(event) => setDocumentIssueDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Vence / límite
                </label>
                <input
                  type="date"
                  value={documentExpirationDate}
                  onChange={(event) => setDocumentExpirationDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Costo
              </label>
              <input
                value={documentCost}
                onChange={(event) =>
                  setDocumentCost(event.target.value.replace(/[^\d.]/g, ""))
                }
                inputMode="decimal"
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Proveedor / entidad
              </label>
              <input
                value={documentProvider}
                onChange={(event) => setDocumentProvider(event.target.value)}
                placeholder="Ej. El Águila, Gobierno, Verificentro, Taller..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Folio / póliza
              </label>
              <input
                value={documentFolio}
                onChange={(event) => setDocumentFolio(event.target.value)}
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Notas
              </label>
              <textarea
                value={documentNotes}
                onChange={(event) => setDocumentNotes(event.target.value)}
                rows={3}
                placeholder="Notas del documento..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
            >
              Guardar documento
            </button>
          </form>
        )}
      </div>
    </div>
  );
}