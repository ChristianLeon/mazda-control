import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  NewServiceRecordInput,
  NewVehicleDocumentInput,
  NewVehicleIssueInput,
  NewWorkshopInput,
  VehicleDocumentStatus,
  VehicleDocumentType,
  VehicleRecordType,
  VehicleIssue,
  Workshop,
} from "../types/mazda";

type AddMode = "service" | "issue" | "workshop" | "document";

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

const serviceTypes: { value: VehicleRecordType; label: string }[] = [
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

const issuePriorities: { value: VehicleIssue["priority"]; label: string }[] = [
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

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function cleanNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, ""));
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-sm font-semibold active:scale-[0.98] ${
        active
          ? "border-red-700 bg-red-700 text-white"
          : "border-zinc-800 bg-zinc-950 text-zinc-400"
      }`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
      {children}
    </label>
  );
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

  const [serviceType, setServiceType] = useState<VehicleRecordType>("service");
  const [serviceTitle, setServiceTitle] = useState("Servicio general");
  const [serviceDate, setServiceDate] = useState(getToday());
  const [serviceMileage, setServiceMileage] = useState(String(currentMileage));
  const [serviceCost, setServiceCost] = useState("");
  const [serviceWorkshopId, setServiceWorkshopId] = useState("");
  const [serviceWorkshopName, setServiceWorkshopName] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceUpdatesLastService, setServiceUpdatesLastService] =
    useState(true);

  const [issueTitle, setIssueTitle] = useState("");
  const [issuePriority, setIssuePriority] =
    useState<VehicleIssue["priority"]>("medium");
  const [issueMileage, setIssueMileage] = useState(String(currentMileage));
  const [issueCost, setIssueCost] = useState("");
  const [issueNotes, setIssueNotes] = useState("");

  const [workshopName, setWorkshopName] = useState("");
  const [workshopType, setWorkshopType] = useState<Workshop["type"]>("mechanic");
  const [workshopPhone, setWorkshopPhone] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [workshopRating, setWorkshopRating] = useState("");
  const [workshopFavorite, setWorkshopFavorite] = useState(false);
  const [workshopNotes, setWorkshopNotes] = useState("");

  const [documentType, setDocumentType] =
    useState<VehicleDocumentType>("other");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentStatus, setDocumentStatus] =
    useState<VehicleDocumentStatus>("valid");
  const [documentIssueDate, setDocumentIssueDate] = useState(getToday());
  const [documentExpirationDate, setDocumentExpirationDate] = useState("");
  const [documentCost, setDocumentCost] = useState("");
  const [documentProvider, setDocumentProvider] = useState("");
  const [documentFolio, setDocumentFolio] = useState("");
  const [documentNotes, setDocumentNotes] = useState("");

  const selectedWorkshop = useMemo(
    () => workshops.find((workshop) => workshop.id === serviceWorkshopId),
    [serviceWorkshopId, workshops]
  );

  useEffect(() => {
    if (isOpen) {
      setServiceMileage(String(currentMileage));
      setIssueMileage(String(currentMileage));
    }
  }, [isOpen, currentMileage]);

  useEffect(() => {
    if (serviceType === "oil_change") {
      setServiceTitle("Cambio de aceite");
      setServiceUpdatesLastService(true);
    }

    if (serviceType === "brakes") {
      setServiceTitle("Frenos / balatas");
    }

    if (serviceType === "tires") {
      setServiceTitle("Llantas");
    }

    if (serviceType === "battery") {
      setServiceTitle("Batería");
    }

    if (serviceType === "transmission") {
      setServiceTitle("Servicio de transmisión automática");
    }

    if (serviceType === "cleaning") {
      setServiceTitle("Lavado / engrasado");
      setServiceUpdatesLastService(false);
    }

    if (serviceType === "service") {
      setServiceTitle("Servicio general");
      setServiceUpdatesLastService(true);
    }
  }, [serviceType]);

  useEffect(() => {
    const defaultTitles: Record<VehicleDocumentType, string> = {
      insurance: "Seguro",
      verification: "Verificación",
      tax: "Tenencia / refrendo",
      registration: "Tarjeta de circulación",
      invoice: "Factura",
      warranty: "Garantía",
      ticket: "Ticket",
      service_order: "Orden de servicio",
      manual: "Manual",
      traffic_regulation: "Reglamento / guía vial",
      other: "Documento",
    };

    if (!documentTitle.trim()) {
      setDocumentTitle(defaultTitles[documentType]);
    }
  }, [documentType, documentTitle]);

  function resetAndClose() {
    onClose();
  }

  function handleSaveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mileage = cleanNumber(serviceMileage);
    const cost = cleanNumber(serviceCost);

    if (!Number.isFinite(mileage) || mileage <= 0) {
      return;
    }

    onSaveService({
      type: serviceType,
      title: serviceTitle,
      date: serviceDate,
      mileage,
      cost: Number.isFinite(cost) ? cost : 0,
      workshopId: selectedWorkshop?.id,
      workshopName: selectedWorkshop?.name ?? serviceWorkshopName,
      notes: serviceNotes,
      updateAsLastService: serviceUpdatesLastService,
    });

    resetAndClose();
  }

  function handleSaveIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mileage = cleanNumber(issueMileage);
    const cost = cleanNumber(issueCost);

    if (!issueTitle.trim()) {
      return;
    }

    if (!Number.isFinite(mileage) || mileage <= 0) {
      return;
    }

    onSaveIssue({
      title: issueTitle,
      priority: issuePriority,
      detectedMileage: mileage,
      estimatedCost: Number.isFinite(cost) && cost > 0 ? cost : undefined,
      notes: issueNotes,
    });

    resetAndClose();
  }

  function handleSaveWorkshop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const rating = cleanNumber(workshopRating);

    if (!workshopName.trim()) {
      return;
    }

    onSaveWorkshop({
      name: workshopName,
      type: workshopType,
      phone: workshopPhone,
      address: workshopAddress,
      notes: workshopNotes,
      rating: Number.isFinite(rating) && rating > 0 ? Math.min(rating, 5) : undefined,
      isFavorite: workshopFavorite,
    });

    resetAndClose();
  }

  function handleSaveDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cost = cleanNumber(documentCost);

    if (!documentTitle.trim()) {
      return;
    }

    onSaveDocument({
      type: documentType,
      title: documentTitle,
      status: documentStatus,
      issueDate: documentIssueDate || undefined,
      expirationDate: documentExpirationDate || undefined,
      cost: Number.isFinite(cost) && cost > 0 ? cost : undefined,
      provider: documentProvider,
      folio: documentFolio,
      notes: documentNotes,
    });

    resetAndClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3">
      <div className="max-h-[94vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                Nuevo registro
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                ¿Qué quieres agregar?
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Captura rápida para Mazda Control
              </p>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-full bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <ModeButton
              active={mode === "service"}
              icon="🧰"
              label="Serv."
              onClick={() => setMode("service")}
            />
            <ModeButton
              active={mode === "issue"}
              icon="⚠️"
              label="Falla"
              onClick={() => setMode("issue")}
            />
            <ModeButton
              active={mode === "workshop"}
              icon="🛠️"
              label="Taller"
              onClick={() => setMode("workshop")}
            />
            <ModeButton
              active={mode === "document"}
              icon="📁"
              label="Doc"
              onClick={() => setMode("document")}
            />
          </div>
        </div>

        {mode === "service" && (
          <form onSubmit={handleSaveService} className="space-y-3">
            <div className="rounded-3xl border border-red-900/70 bg-red-950/20 p-4">
              <p className="text-sm font-semibold text-red-300">
                Servicio / mantenimiento
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Registra servicios, reparaciones, cambio de aceite, frenos,
                llantas o gastos del vehículo.
              </p>
            </div>

            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select
                value={serviceType}
                onChange={(event) =>
                  setServiceType(event.target.value as VehicleRecordType)
                }
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              >
                {serviceTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Título</FieldLabel>
              <input
                value={serviceTitle}
                onChange={(event) => setServiceTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Fecha</FieldLabel>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(event) => setServiceDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>

              <div>
                <FieldLabel>Kilometraje</FieldLabel>
                <input
                  value={serviceMileage}
                  onChange={(event) =>
                    setServiceMileage(event.target.value.replace(/[^\d]/g, ""))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Costo</FieldLabel>
              <input
                value={serviceCost}
                onChange={(event) =>
                  setServiceCost(event.target.value.replace(/[^\d.]/g, ""))
                }
                inputMode="decimal"
                placeholder="0"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Taller / proveedor</FieldLabel>
              <select
                value={serviceWorkshopId}
                onChange={(event) => {
                  setServiceWorkshopId(event.target.value);

                  if (event.target.value) {
                    setServiceWorkshopName("");
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

              {!serviceWorkshopId && (
                <input
                  value={serviceWorkshopName}
                  onChange={(event) => setServiceWorkshopName(event.target.value)}
                  placeholder="Escribe taller o proveedor"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              )}
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <input
                type="checkbox"
                checked={serviceUpdatesLastService}
                onChange={(event) =>
                  setServiceUpdatesLastService(event.target.checked)
                }
                className="h-5 w-5 accent-red-700"
              />
              <span className="text-sm text-zinc-200">
                Actualizar como último servicio
              </span>
            </label>

            <div>
              <FieldLabel>Notas</FieldLabel>
              <textarea
                value={serviceNotes}
                onChange={(event) => setServiceNotes(event.target.value)}
                rows={3}
                placeholder="Detalle del servicio..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white"
            >
              Guardar servicio
            </button>
          </form>
        )}

        {mode === "issue" && (
          <form onSubmit={handleSaveIssue} className="space-y-3">
            <div className="rounded-3xl border border-yellow-900/70 bg-yellow-950/20 p-4">
              <p className="text-sm font-semibold text-yellow-300">
                Falla / pendiente
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Registra problemas, reparaciones pendientes o gastos estimados.
              </p>
            </div>

            <div>
              <FieldLabel>Título</FieldLabel>
              <input
                value={issueTitle}
                onChange={(event) => setIssueTitle(event.target.value)}
                placeholder="Ej. Balatas delanteras"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Prioridad</FieldLabel>
                <select
                  value={issuePriority}
                  onChange={(event) =>
                    setIssuePriority(
                      event.target.value as VehicleIssue["priority"]
                    )
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
                <FieldLabel>Km detectado</FieldLabel>
                <input
                  value={issueMileage}
                  onChange={(event) =>
                    setIssueMileage(event.target.value.replace(/[^\d]/g, ""))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Costo estimado</FieldLabel>
              <input
                value={issueCost}
                onChange={(event) =>
                  setIssueCost(event.target.value.replace(/[^\d.]/g, ""))
                }
                inputMode="decimal"
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Notas</FieldLabel>
              <textarea
                value={issueNotes}
                onChange={(event) => setIssueNotes(event.target.value)}
                rows={3}
                placeholder="Describe la falla o pendiente..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
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
          <form onSubmit={handleSaveWorkshop} className="space-y-3">
            <div className="rounded-3xl border border-blue-900/70 bg-blue-950/20 p-4">
              <p className="text-sm font-semibold text-blue-300">
                Taller / proveedor
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Registra talleres, llanteras, refaccionarias o proveedores.
              </p>
            </div>

            <div>
              <FieldLabel>Nombre</FieldLabel>
              <input
                value={workshopName}
                onChange={(event) => setWorkshopName(event.target.value)}
                placeholder="Ej. Taller Mazda, Llantera..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select
                value={workshopType}
                onChange={(event) =>
                  setWorkshopType(event.target.value as Workshop["type"])
                }
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
              <FieldLabel>Teléfono</FieldLabel>
              <input
                value={workshopPhone}
                onChange={(event) => setWorkshopPhone(event.target.value)}
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Dirección</FieldLabel>
              <input
                value={workshopAddress}
                onChange={(event) => setWorkshopAddress(event.target.value)}
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Calificación 1-5</FieldLabel>
              <input
                value={workshopRating}
                onChange={(event) =>
                  setWorkshopRating(event.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <input
                type="checkbox"
                checked={workshopFavorite}
                onChange={(event) => setWorkshopFavorite(event.target.checked)}
                className="h-5 w-5 accent-red-700"
              />
              <span className="text-sm text-zinc-200">
                Marcar como favorito
              </span>
            </label>

            <div>
              <FieldLabel>Notas</FieldLabel>
              <textarea
                value={workshopNotes}
                onChange={(event) => setWorkshopNotes(event.target.value)}
                rows={3}
                placeholder="Notas del taller..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
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
          <form onSubmit={handleSaveDocument} className="space-y-3">
            <div className="rounded-3xl border border-blue-900/70 bg-blue-950/20 p-4">
              <p className="text-sm font-semibold text-blue-300">
                Documento
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Registra seguro, verificación, tenencia, garantías o tickets.
              </p>
            </div>

            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value as VehicleDocumentType)
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
              <FieldLabel>Título</FieldLabel>
              <input
                value={documentTitle}
                onChange={(event) => setDocumentTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Estado</FieldLabel>
              <select
                value={documentStatus}
                onChange={(event) =>
                  setDocumentStatus(
                    event.target.value as VehicleDocumentStatus
                  )
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
                <FieldLabel>Emisión / pago</FieldLabel>
                <input
                  type="date"
                  value={documentIssueDate}
                  onChange={(event) => setDocumentIssueDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>

              <div>
                <FieldLabel>Vence / límite</FieldLabel>
                <input
                  type="date"
                  value={documentExpirationDate}
                  onChange={(event) =>
                    setDocumentExpirationDate(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Costo</FieldLabel>
              <input
                value={documentCost}
                onChange={(event) =>
                  setDocumentCost(event.target.value.replace(/[^\d.]/g, ""))
                }
                inputMode="decimal"
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Proveedor / entidad</FieldLabel>
              <input
                value={documentProvider}
                onChange={(event) => setDocumentProvider(event.target.value)}
                placeholder="Ej. Aseguradora, Gobierno, Taller..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Folio / póliza</FieldLabel>
              <input
                value={documentFolio}
                onChange={(event) => setDocumentFolio(event.target.value)}
                placeholder="Opcional"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <FieldLabel>Notas</FieldLabel>
              <textarea
                value={documentNotes}
                onChange={(event) => setDocumentNotes(event.target.value)}
                rows={3}
                placeholder="Notas del documento..."
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
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