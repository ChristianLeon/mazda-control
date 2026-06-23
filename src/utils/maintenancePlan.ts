import type { VehicleRecord, VehicleRecordType } from "../types/mazda";

export type MaintenanceCardState = "ok" | "soon" | "overdue" | "info";

export type MaintenanceCard = {
  id: string;
  title: string;
  category: string;
  source: "manual" | "preventive" | "inspection";
  serviceType: VehicleRecordType;
  updateAsLastService: boolean;
  intervalLabel: string;
  lastReferenceLabel: string;
  nextLabel: string;
  statusLabel: string;
  state: MaintenanceCardState;
  detail: string;
  action: string;
  suggestedNotes: string;
  remainingKm?: number;
};

type BuildMaintenancePlanParams = {
  currentMileage: number;
  lastServiceMileage: number;
  records: VehicleRecord[];
};

type MaintenanceRule = {
  id: string;
  title: string;
  category: string;
  source: "manual" | "preventive" | "inspection";
  serviceType: VehicleRecordType;
  updateAsLastService: boolean;
  intervalKm?: number;
  intervalMonths?: number;
  fallbackToLastService?: boolean;
  searchKeywords: string[];
  intervalLabel: string;
  detail: string;
  action: string;
  suggestedNotes: string;
};

const SOON_THRESHOLD_KM = 1500;
const SOON_THRESHOLD_DAYS = 30;

const maintenanceRules: MaintenanceRule[] = [
  {
    id: "engine-oil-filter",
    title: "Aceite + filtro de aceite",
    category: "Motor",
    source: "manual",
    serviceType: "oil_change",
    updateAsLastService: true,
    intervalKm: 10000,
    intervalMonths: 12,
    fallbackToLastService: true,
    searchKeywords: ["aceite", "filtro de aceite", "oil"],
    intervalLabel: "10,000 km / 12 meses",
    detail:
      "Cambio principal del motor. Como el vehículo no se usa diario, también debe controlarse por fecha.",
    action: "Registrar cada cambio de aceite y filtro.",
    suggestedNotes: "Cambio de aceite y filtro de aceite.",
  },
  {
    id: "engine-air-filter",
    title: "Filtro de aire de motor",
    category: "Motor",
    source: "manual",
    serviceType: "service",
    updateAsLastService: false,
    intervalKm: 40000,
    intervalMonths: 24,
    searchKeywords: ["filtro de aire", "aire motor"],
    intervalLabel: "40,000 km / 24 meses",
    detail:
      "Si circulas por polvo, tierra o zonas con mucho contaminante, conviene revisarlo antes.",
    action: "Registrar reemplazo del filtro de aire.",
    suggestedNotes: "Cambio de filtro de aire de motor.",
  },
  {
    id: "cabin-air-filter",
    title: "Filtro de cabina",
    category: "Aire acondicionado",
    source: "manual",
    serviceType: "service",
    updateAsLastService: false,
    intervalKm: 40000,
    intervalMonths: 24,
    searchKeywords: ["filtro de cabina", "cabina", "aire acondicionado"],
    intervalLabel: "40,000 km / 24 meses",
    detail:
      "Afecta flujo de aire, olores y desempeño del aire acondicionado.",
    action: "Registrar cambio del filtro de cabina.",
    suggestedNotes: "Cambio de filtro de cabina.",
  },
  {
    id: "spark-plugs",
    title: "Bujías",
    category: "Encendido",
    source: "manual",
    serviceType: "service",
    updateAsLastService: false,
    intervalKm: 120000,
    fallbackToLastService: true,
    searchKeywords: ["bujia", "bujías", "bujias", "spark"],
    intervalLabel: "120,000 km",
    detail:
      "Ya reportaste cambio en enero 2026. Mientras no exista registro específico, se toma como referencia el último servicio.",
    action: "Registrar cambio de bujías cuando corresponda.",
    suggestedNotes: "Cambio de bujías.",
  },
  {
    id: "tire-rotation",
    title: "Rotación de llantas",
    category: "Llantas",
    source: "manual",
    serviceType: "tires",
    updateAsLastService: false,
    intervalKm: 10000,
    fallbackToLastService: true,
    searchKeywords: ["rotación", "rotacion", "llantas", "neumaticos", "neumáticos"],
    intervalLabel: "10,000 km",
    detail:
      "Ayuda a emparejar desgaste. En llanta 225/45 R19 conviene vigilar desgaste irregular.",
    action: "Registrar rotación de llantas.",
    suggestedNotes: "Rotación de llantas.",
  },
  {
    id: "brake-fluid",
    title: "Líquido de frenos",
    category: "Frenos",
    source: "preventive",
    serviceType: "brakes",
    updateAsLastService: false,
    intervalMonths: 24,
    searchKeywords: ["liquido de frenos", "líquido de frenos", "brake fluid", "purga"],
    intervalLabel: "24 meses preventivo",
    detail:
      "El líquido absorbe humedad con el tiempo. Conviene controlar fecha de cambio o purga.",
    action: "Registrar cambio o purga de líquido de frenos.",
    suggestedNotes: "Cambio o purga de líquido de frenos.",
  },
  {
    id: "brake-pads",
    title: "Balatas / frenos",
    category: "Frenos",
    source: "inspection",
    serviceType: "brakes",
    updateAsLastService: false,
    searchKeywords: ["balatas", "frenos", "pastillas"],
    intervalLabel: "Por inspección / desgaste",
    detail:
      "No tiene cambio fijo. Depende de desgaste, ruido, vibración y grosor de balata.",
    action: "Registrar diagnóstico, cotización o cambio.",
    suggestedNotes: "Revisión o cambio de balatas/frenos.",
  },
  {
    id: "washer-fluid",
    title: "Líquido limpiaparabrisas",
    category: "Fluidos",
    source: "inspection",
    serviceType: "other",
    updateAsLastService: false,
    searchKeywords: ["limpiaparabrisas", "washer"],
    intervalLabel: "Revisar nivel",
    detail:
      "No es cambio programado; se revisa y rellena según nivel.",
    action: "Registrar relleno si quieres llevar control.",
    suggestedNotes: "Relleno de líquido limpiaparabrisas.",
  },
  {
    id: "wiper-blades",
    title: "Limpiadores",
    category: "Visibilidad",
    source: "preventive",
    serviceType: "other",
    updateAsLastService: false,
    intervalMonths: 12,
    searchKeywords: ["limpiadores", "plumas", "wipers", "parabrisas"],
    intervalLabel: "12 meses o cuando fallen",
    detail:
      "Tus limpiadores Michelin pueden mantenerse mientras limpien parejo y sin ruido excesivo.",
    action: "Registrar reemplazo cuando dejen marcas, chillen o brinquen.",
    suggestedNotes: "Cambio de limpiadores.",
  },
  {
    id: "engine-coolant",
    title: "Refrigerante",
    category: "Enfriamiento",
    source: "manual",
    serviceType: "service",
    updateAsLastService: false,
    intervalKm: 200000,
    intervalMonths: 120,
    searchKeywords: ["refrigerante", "anticongelante", "coolant", "fl-22"],
    intervalLabel: "Primer cambio 200,000 km / 10 años",
    detail:
      "También conviene vigilar nivel, fugas, color y temperatura de operación.",
    action: "Registrar cambio de refrigerante cuando se realice.",
    suggestedNotes: "Cambio de refrigerante.",
  },
  {
    id: "drive-belts",
    title: "Bandas / correa de accesorios",
    category: "Motor",
    source: "inspection",
    serviceType: "service",
    updateAsLastService: false,
    searchKeywords: ["banda", "bandas", "correa"],
    intervalLabel: "Inspección periódica",
    detail:
      "Revisar grietas, ruido, tensión, tensor y desgaste visible.",
    action: "Registrar inspección o cambio si hay ruido o fisuras.",
    suggestedNotes: "Inspección o cambio de bandas.",
  },
  {
    id: "automatic-transmission",
    title: "Transmisión automática",
    category: "Transmisión",
    source: "preventive",
    serviceType: "transmission",
    updateAsLastService: false,
    searchKeywords: ["transmisión", "transmision", "atf", "automática", "automatica"],
    intervalLabel: "Pendiente de registrar km/fecha exacta",
    detail:
      "Reportaste servicio de transmisión en junio 2025. Falta registrar km y fecha exacta para calcular recordatorio real.",
    action: "Crear servicio de transmisión con fecha y kilometraje reales.",
    suggestedNotes: "Servicio de transmisión automática.",
  },
  {
    id: "injector-cleaner",
    title: "Limpiador de inyectores",
    category: "Combustible",
    source: "preventive",
    serviceType: "service",
    updateAsLastService: false,
    intervalKm: 10000,
    intervalMonths: 6,
    fallbackToLastService: true,
    searchKeywords: ["inyector", "inyectores", "aditivo", "limpiador"],
    intervalLabel: "Preventivo: 10,000 km / 6 meses",
    detail:
      "No es reemplazo obligatorio; es un control preventivo porque lo quieres tener visible.",
    action: "Registrar cuando agregues aditivo o hagas limpieza.",
    suggestedNotes: "Aplicación de limpiador de inyectores.",
  },
];

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function getSourceLabel(source: MaintenanceRule["source"]) {
  if (source === "manual") return "Manual";
  if (source === "preventive") return "Preventivo";

  return "Inspección";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function findLastRecord(rule: MaintenanceRule, records: VehicleRecord[]) {
  const keywords = rule.searchKeywords.map(normalizeText);

  const matchingRecords = records.filter((record) => {
    const text = normalizeText(`${record.title} ${record.notes ?? ""}`);

    return (
      record.type === rule.serviceType ||
      keywords.some((keyword) => text.includes(keyword))
    );
  });

  return matchingRecords.sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));

    if (dateCompare !== 0) return dateCompare;

    return String(b.createdAt).localeCompare(String(a.createdAt));
  })[0];
}

function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  date.setMonth(date.getMonth() + months);

  return date;
}

function getDaysUntil(date: Date) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diff = date.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getKmState(remainingKm: number) {
  if (remainingKm <= 0) return "overdue";
  if (remainingKm <= SOON_THRESHOLD_KM) return "soon";

  return "ok";
}

function getDateState(daysUntil: number) {
  if (daysUntil <= 0) return "overdue";
  if (daysUntil <= SOON_THRESHOLD_DAYS) return "soon";

  return "ok";
}

function getWorstState(states: MaintenanceCardState[]) {
  if (states.includes("overdue")) return "overdue";
  if (states.includes("soon")) return "soon";
  if (states.includes("ok")) return "ok";

  return "info";
}

function buildStatusLabel({
  state,
  remainingKm,
  daysUntil,
}: {
  state: MaintenanceCardState;
  remainingKm?: number;
  daysUntil?: number;
}) {
  if (state === "info") return "Pendiente de dato real";

  if (state === "overdue") {
    if (remainingKm !== undefined && remainingKm <= 0) {
      return `Vencido por ${formatKm(Math.abs(remainingKm))} km`;
    }

    if (daysUntil !== undefined && daysUntil <= 0) {
      return `Vencido hace ${Math.abs(daysUntil)} días`;
    }

    return "Vencido";
  }

  if (state === "soon") {
    if (remainingKm !== undefined && remainingKm > 0) {
      return `Próximo: ${formatKm(remainingKm)} km`;
    }

    if (daysUntil !== undefined && daysUntil > 0) {
      return `Próximo: ${daysUntil} días`;
    }

    return "Próximo";
  }

  return "Vigente";
}

function buildCardFromRule({
  rule,
  currentMileage,
  lastServiceMileage,
  records,
}: {
  rule: MaintenanceRule;
  currentMileage: number;
  lastServiceMileage: number;
  records: VehicleRecord[];
}): MaintenanceCard {
  const lastRecord = findLastRecord(rule, records);

  const baseMileage =
    lastRecord?.mileage ??
    (rule.fallbackToLastService ? lastServiceMileage : undefined);

  const states: MaintenanceCardState[] = [];
  let remainingKm: number | undefined;
  let nextKmLabel = "Requiere dato real";
  let nextDateLabel = "";

  if (rule.intervalKm !== undefined && baseMileage !== undefined) {
    const nextMileage = baseMileage + rule.intervalKm;
    remainingKm = nextMileage - currentMileage;
    states.push(getKmState(remainingKm));
    nextKmLabel = `${formatKm(nextMileage)} km`;
  }

  if (
    rule.intervalMonths !== undefined &&
    lastRecord?.date !== undefined &&
    lastRecord.date
  ) {
    const nextDate = addMonths(lastRecord.date, rule.intervalMonths);

    if (nextDate) {
      const daysUntil = getDaysUntil(nextDate);
      states.push(getDateState(daysUntil));
      nextDateLabel = ` / ${nextDate.toLocaleDateString("es-MX")}`;

      const state = getWorstState(states);

      return {
        id: rule.id,
        title: rule.title,
        category: rule.category,
        source: rule.source,
        serviceType: rule.serviceType,
        updateAsLastService: rule.updateAsLastService,
        intervalLabel: `${rule.intervalLabel} · ${getSourceLabel(rule.source)}`,
        lastReferenceLabel: lastRecord
          ? `Último registro: ${formatKm(lastRecord.mileage)} km · ${lastRecord.date}`
          : `Sin registro específico; usando último servicio ${formatKm(lastServiceMileage)} km`,
        nextLabel: `Próximo: ${nextKmLabel}${nextDateLabel}`,
        statusLabel: buildStatusLabel({
          state,
          remainingKm,
          daysUntil,
        }),
        state,
        detail: rule.detail,
        action: rule.action,
        suggestedNotes: rule.suggestedNotes,
        remainingKm,
      };
    }
  }

  const state = states.length > 0 ? getWorstState(states) : "info";

  return {
    id: rule.id,
    title: rule.title,
    category: rule.category,
    source: rule.source,
    serviceType: rule.serviceType,
    updateAsLastService: rule.updateAsLastService,
    intervalLabel: `${rule.intervalLabel} · ${getSourceLabel(rule.source)}`,
    lastReferenceLabel: lastRecord
      ? `Último registro: ${formatKm(lastRecord.mileage)} km · ${lastRecord.date}`
      : rule.fallbackToLastService
        ? `Sin registro específico; usando último servicio ${formatKm(lastServiceMileage)} km`
        : "Sin registro específico de este componente",
    nextLabel: `Próximo: ${nextKmLabel}`,
    statusLabel: buildStatusLabel({
      state,
      remainingKm,
    }),
    state,
    detail: rule.detail,
    action: rule.action,
    suggestedNotes: rule.suggestedNotes,
    remainingKm,
  };
}

export function buildMaintenancePlan({
  currentMileage,
  lastServiceMileage,
  records,
}: BuildMaintenancePlanParams) {
  return maintenanceRules.map((rule) =>
    buildCardFromRule({
      rule,
      currentMileage,
      lastServiceMileage,
      records,
    })
  );
}

export function summarizeMaintenancePlan(cards: MaintenanceCard[]) {
  return {
    overdue: cards.filter((card) => card.state === "overdue").length,
    soon: cards.filter((card) => card.state === "soon").length,
    ok: cards.filter((card) => card.state === "ok").length,
    info: cards.filter((card) => card.state === "info").length,
  };
}