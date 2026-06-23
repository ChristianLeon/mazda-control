import Card from "../components/Card";
import type {
  EmergencyContact,
  InsurancePolicy,
  Vehicle,
  VehicleIssue,
  VehicleStatus,
  VerificationProfile,
} from "../types/mazda";

type ServiceState = "ok" | "soon" | "overdue";

type HomePageProps = {
  serviceLabel: string;
  serviceState: ServiceState;
  vehicle: Vehicle;
  vehicleStatus: VehicleStatus;
  insurancePolicy: InsurancePolicy;
  emergencyContacts: EmergencyContact[];
  verificationProfile: VerificationProfile;
  issues: VehicleIssue[];
};

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value?: string) {
  if (!value) return "Sin dato";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function getDaysUntil(date: string) {
  const today = new Date();
  const targetDate = new Date(`${date}T00:00:00`);

  today.setHours(0, 0, 0, 0);

  const diff = targetDate.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getServiceVisualClasses(state: ServiceState) {
  if (state === "ok") {
    return {
      cardTone: "success" as const,
      box: "border-emerald-900/80 bg-emerald-950/30",
      label: "text-emerald-400",
      text: "text-emerald-300",
      badge: "Al día",
      action: "Sin acción inmediata",
    };
  }

  if (state === "soon") {
    return {
      cardTone: "default" as const,
      box: "border-yellow-700/80 bg-yellow-950/20",
      label: "text-yellow-400",
      text: "text-yellow-300",
      badge: "Próximo",
      action: "Planea tu próximo servicio",
    };
  }

  return {
    cardTone: "danger" as const,
    box: "border-red-900/80 bg-red-950/30",
    label: "text-red-400",
    text: "text-red-300",
    badge: "Atención",
    action: "",
  };
}

function getStickerColorClasses(color: string) {
  const normalized = color.trim().toLowerCase();

  switch (normalized) {
    case "azul":
      return "bg-blue-600 border-blue-400";
    case "rosa":
      return "bg-pink-600 border-pink-400";
    case "rojo":
      return "bg-red-600 border-red-400";
    case "verde":
      return "bg-emerald-600 border-emerald-400";
    case "amarillo":
      return "bg-yellow-400 border-yellow-200";
    default:
      return "bg-zinc-700 border-zinc-500";
  }
}

function getCurrentVerificationPeriod(date = new Date()) {
  const month = date.getMonth() + 1;

  if (month >= 5 && month <= 6) {
    return {
      label: "Primer semestre",
      period: "Mayo - junio",
      status: "Periodo actual",
    };
  }

  if (month >= 11 && month <= 12) {
    return {
      label: "Segundo semestre",
      period: "Noviembre - diciembre",
      status: "Periodo actual",
    };
  }

  return {
    label: "Sin periodo activo",
    period: "Fuera de periodo",
    status: "Consulta calendario",
  };
}

function getPriorityVisualClasses(priority: VehicleIssue["priority"]) {
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

function getPriorityLabel(priority: VehicleIssue["priority"]) {
  const labels: Record<VehicleIssue["priority"], string> = {
    urgent: "Urgente",
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };

  return labels[priority];
}

export default function HomePage({
  serviceLabel,
  serviceState,
  vehicle,
  vehicleStatus,
  insurancePolicy,
  emergencyContacts,
  verificationProfile,
  issues,
}: HomePageProps) {
  const primaryPhone = emergencyContacts.find((contact) => contact.isPrimary);
  const serviceVisual = getServiceVisualClasses(serviceState);
  const verificationPeriod = getCurrentVerificationPeriod();
  const openIssues = issues.filter((issue) => issue.status === "open");

  const insuranceDaysLeft = getDaysUntil(insurancePolicy.expirationDate);
  const nextServiceMileage =
    vehicleStatus.lastServiceMileage + vehicleStatus.oilIntervalKm;

  return (
    <>
      <Card title="Centro de control" tone={serviceVisual.cardTone}>
        <div className={`rounded-3xl border p-4 ${serviceVisual.box}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${serviceVisual.label}`}>
                Servicio
              </p>

              <p className={`mt-2 text-lg font-bold ${serviceVisual.text}`}>
                {serviceLabel}
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                {serviceVisual.action}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${serviceVisual.box} ${serviceVisual.text}`}
            >
              {serviceVisual.badge}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-black/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Km actual
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatKm(vehicle.currentMileage)}
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Próximo servicio
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatKm(nextServiceMileage)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Seguro">
        <div className="space-y-3">
          <div className="rounded-3xl border border-emerald-900/80 bg-emerald-950/20 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Vigente
            </p>

            <p className="mt-2 text-lg font-bold text-white">
              {insurancePolicy.insurer}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Plan {insurancePolicy.plan}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Póliza
              </p>

              <p className="mt-3 break-all text-base font-bold text-white">
                {insurancePolicy.policyNumber}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Vence
              </p>

              <p className="mt-3 text-base font-bold text-white">
                {formatDate(insurancePolicy.expirationDate)}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {insuranceDaysLeft >= 0
                  ? `${insuranceDaysLeft} días restantes`
                  : `Vencido hace ${Math.abs(insuranceDaysLeft)} días`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Siniestro
            </p>

            <p className="mt-2 text-lg font-semibold text-red-400">
              {primaryPhone?.phone ?? "Sin teléfono registrado"}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Verificación">
        <div className="space-y-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {verificationPeriod.label}
                </p>

                <p className="mt-2 text-lg font-bold text-white">
                  {verificationPeriod.period}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {verificationPeriod.status}
                </p>
              </div>

              <span className="rounded-full border border-yellow-700 bg-yellow-950/30 px-3 py-1 text-xs font-semibold text-yellow-300">
                Pendiente
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Holograma
              </p>

              <div className="mt-3 flex h-16 items-center justify-center">
                <p className="text-6xl font-bold leading-none text-white">
                  {verificationProfile.hologram}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Engomado
              </p>

              <div className="mt-3 flex h-16 items-center justify-center">
                <div
                  title={`Engomado ${verificationProfile.stickerColor}`}
                  className={`h-14 w-20 rounded-xl border ${getStickerColorClasses(
                    verificationProfile.stickerColor
                  )}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Placa
              </p>
              <p className="mt-2 font-bold text-white">{vehicle.plate}</p>
              <p className="mt-1 text-xs text-zinc-500">{vehicle.plateState}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Costo
              </p>
              <p className="mt-2 font-bold text-white">
                {formatMoney(verificationProfile.estimatedCost)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Estimado</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Fallas y pendientes">
        {openIssues.length === 0 ? (
          <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/20 p-4 text-center">
            <p className="font-semibold text-emerald-300">
              Sin fallas abiertas
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Agrega pendientes desde el botón +
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {openIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{issue.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Detectado: {formatKm(issue.detectedMileage)} km
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityVisualClasses(
                      issue.priority
                    )}`}
                  >
                    {getPriorityLabel(issue.priority)}
                  </span>
                </div>

                {issue.estimatedCost !== undefined && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Estimado: {formatMoney(issue.estimatedCost)}
                  </p>
                )}

                {issue.notes && (
                  <p className="mt-2 text-sm text-zinc-400">{issue.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}