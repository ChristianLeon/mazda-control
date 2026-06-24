import { useMemo, useState } from "react";
import type { Vehicle } from "../types/mazda";

type VehicleGuidesPanelProps = {
  mode: "checklist" | "guide";
  vehicle: Vehicle;
};

type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
};

type ChecklistGroup = {
  title: string;
  icon: string;
  items: ChecklistItem[];
};

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

const tripChecklistGroups: ChecklistGroup[] = [
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
        label: "Refrigerante",
        detail: "Revisar nivel, color y que no haya fuga.",
      },
      {
        id: "brake-fluid",
        label: "Líquido de frenos",
        detail: "Revisar nivel antes de carretera.",
      },
      {
        id: "washer-fluid",
        label: "Líquido limpiaparabrisas",
        detail: "Rellenar antes de viaje.",
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
        detail: "Revisar desgaste irregular, chipotes, cortes o grietas.",
      },
      {
        id: "spare-tools",
        label: "Herramienta / gato / birlos",
        detail: "Confirmar que estén completos y accesibles.",
      },
      {
        id: "tire-size",
        label: "Medida 225/45 R19",
        detail: "Dato base para cotizar o revisar llantas.",
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
        detail: "Que limpien parejo, sin brincar ni dejar marcas fuertes.",
      },
      {
        id: "insurance",
        label: "Seguro vigente",
        detail: "Confirmar vigencia visible en Inicio.",
      },
      {
        id: "verification",
        label: "Verificación",
        detail: "Confirmar que el semestre correspondiente esté cubierto.",
      },
      {
        id: "registration",
        label: "Tarjeta de circulación",
        detail: "Llevarla disponible físicamente o digital cuando aplique.",
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
        detail: "Celular con batería o cargador para carretera.",
      },
      {
        id: "cash",
        label: "Efectivo / tarjeta",
        detail: "Útil para casetas, estacionamientos o emergencias.",
      },
      {
        id: "contacts",
        label: "Teléfonos de emergencia",
        detail: "Aseguradora, asistencia vial y contacto familiar.",
      },
      {
        id: "route",
        label: "Ruta revisada",
        detail: "Revisar tráfico, casetas, combustible y clima.",
      },
    ],
  },
];

function ChecklistGroupCard({
  group,
  checkedItems,
  onToggle,
}: {
  group: ChecklistGroup;
  checkedItems: string[];
  onToggle: (itemId: string) => void;
}) {
  const completed = group.items.filter((item) =>
    checkedItems.includes(item.id)
  ).length;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
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

        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
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
              onClick={() => onToggle(item.id)}
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
                  <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function QuickInfoCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{title}</p>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function VehicleGuidesPanel({
  mode,
  vehicle,
}: VehicleGuidesPanelProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const totalChecklistItems = useMemo(
    () =>
      tripChecklistGroups.reduce(
        (total, group) => total + group.items.length,
        0
      ),
    []
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

  if (mode === "checklist") {
    return (
      <div className="space-y-3">
        <div className="rounded-3xl border border-red-900/70 bg-red-950/20 p-4">
          <p className="text-sm font-semibold text-red-300">
            Checklist antes de salir
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Revisión rápida para carretera o trayectos largos. No sustituye una
            inspección mecánica, pero ayuda a no olvidar puntos básicos.
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-300">
              {checkedItems.length}/{totalChecklistItems} completado(s)
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

        {tripChecklistGroups.map((group) => (
          <ChecklistGroupCard
            key={group.title}
            group={group}
            checkedItems={checkedItems}
            onToggle={toggleItem}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <QuickInfoCard icon="🚘" title="Datos rápidos del Mazda">
        <p>
          <span className="text-zinc-600">Vehículo:</span>{" "}
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
        <p>
          <span className="text-zinc-600">Versión:</span> {vehicle.version}
        </p>
        <p>
          <span className="text-zinc-600">Motor:</span> {vehicle.engine}
        </p>
        <p>
          <span className="text-zinc-600">Kilometraje:</span>{" "}
          {formatKm(vehicle.currentMileage)} km
        </p>
      </QuickInfoCard>

      <QuickInfoCard icon="🧰" title="Consumibles clave">
        <p>
          <span className="text-zinc-600">Aceite:</span> 5W-30
        </p>
        <p>
          <span className="text-zinc-600">Llantas:</span> 225/45 R19
        </p>
        <p>
          <span className="text-zinc-600">Presión:</span> 40 PSI
        </p>
        <p>
          <span className="text-zinc-600">Gasolina:</span> controlarla en FuelIQ
        </p>
      </QuickInfoCard>

      <QuickInfoCard icon="✅" title="Trámites">
        <p>
          <span className="text-zinc-600">Verificación 1er semestre:</span>{" "}
          mayo - junio
        </p>
        <p>
          <span className="text-zinc-600">Verificación 2do semestre:</span>{" "}
          noviembre - diciembre
        </p>
        <p>
          <span className="text-zinc-600">Tenencia / refrendo:</span> enero -
          marzo
        </p>
        <p>
          <span className="text-zinc-600">Seguro:</span> revisar vigencia en
          Inicio
        </p>
      </QuickInfoCard>

      <QuickInfoCard icon="🚦" title="Guía vial rápida">
        <p>
          <span className="text-zinc-600">En choque:</span> detente en lugar
          seguro, activa intermitentes, revisa lesionados, llama al seguro y no
          aceptes acuerdos sin evidencia.
        </p>
        <p>
          <span className="text-zinc-600">En carretera:</span> revisa presión,
          fluidos, luces, limpiadores, seguro, verificación y ruta.
        </p>
        <p>
          <span className="text-zinc-600">Morelia / CDMX:</span> conservar
          documentos vigentes y revisar restricciones locales antes de circular.
        </p>
      </QuickInfoCard>
    </div>
  );
}