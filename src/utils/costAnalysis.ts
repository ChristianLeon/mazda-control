import type {
  Vehicle,
  VehicleDocument,
  VehicleIssue,
  VehicleRecord,
  VehicleRecordType,
} from "../types/mazda";

export type CostBucket = {
  id: string;
  label: string;
  total: number;
  count: number;
};

export type CostAnalysis = {
  serviceTotal: number;
  documentTotal: number;
  realSpentTotal: number;
  openIssueEstimateTotal: number;
  totalKnownCost: number;
  costPerCurrentKm: number;
  recordTypeTotals: CostBucket[];
  monthlyTotals: CostBucket[];
  topExpenses: {
    id: string;
    title: string;
    source: "Servicio" | "Documento" | "Falla estimada";
    amount: number;
  }[];
};

const recordTypeLabels: Record<VehicleRecordType, string> = {
  service: "Servicio general",
  oil_change: "Cambio de aceite",
  brakes: "Frenos / balatas",
  tires: "Llantas",
  battery: "Batería",
  transmission: "Transmisión",
  repair: "Reparaciones",
  diagnostic: "Diagnóstico",
  verification: "Verificación",
  insurance: "Seguro",
  tax: "Tenencia / refrendo",
  cleaning: "Lavado / limpieza",
  other: "Otros",
};

function safeAmount(value: number | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function isRealDocumentExpense(document: VehicleDocument) {
  if (document.status === "pending") return false;
  if (document.status === "expired") return false;
  if (document.status === "archived") return false;

  return safeAmount(document.cost) > 0;
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

function addToBucket(
  map: Map<string, CostBucket>,
  id: string,
  label: string,
  amount: number
) {
  if (amount <= 0) return;

  const current = map.get(id);

  if (!current) {
    map.set(id, {
      id,
      label,
      total: amount,
      count: 1,
    });

    return;
  }

  map.set(id, {
    ...current,
    total: current.total + amount,
    count: current.count + 1,
  });
}

export function calculateCostAnalysis(params: {
  vehicle: Vehicle;
  records: VehicleRecord[];
  documents: VehicleDocument[];
  issues: VehicleIssue[];
}): CostAnalysis {
  const { vehicle, records, documents, issues } = params;

  const serviceTotal = records.reduce(
    (total, record) => total + safeAmount(record.cost),
    0
  );

  const paidDocuments = documents.filter(isRealDocumentExpense);

  const documentTotal = paidDocuments.reduce(
    (total, document) => total + safeAmount(document.cost),
    0
  );

  const openIssueEstimateTotal = issues
    .filter(
      (issue) => issue.status !== "resolved" && issue.status !== "dismissed"
    )
    .reduce((total, issue) => total + safeAmount(issue.estimatedCost), 0);

  const realSpentTotal = serviceTotal + documentTotal;
  const totalKnownCost = realSpentTotal + openIssueEstimateTotal;

  const costPerCurrentKm =
    vehicle.currentMileage > 0 ? realSpentTotal / vehicle.currentMileage : 0;

  const recordTypeMap = new Map<string, CostBucket>();
  const monthlyMap = new Map<string, CostBucket>();

  records.forEach((record) => {
    const amount = safeAmount(record.cost);

    addToBucket(
      recordTypeMap,
      record.type,
      recordTypeLabels[record.type],
      amount
    );

    const monthKey = getMonthKey(record.date);
    addToBucket(monthlyMap, monthKey, getMonthLabel(monthKey), amount);
  });

  paidDocuments.forEach((document) => {
    const amount = safeAmount(document.cost);
    const monthKey = getMonthKey(document.issueDate ?? document.expirationDate);

    addToBucket(recordTypeMap, "documents", "Documentos pagados", amount);
    addToBucket(monthlyMap, monthKey, getMonthLabel(monthKey), amount);
  });

  const recordTypeTotals = Array.from(recordTypeMap.values()).sort(
    (a, b) => b.total - a.total
  );

  const monthlyTotals = Array.from(monthlyMap.values()).sort(
    (a, b) => b.total - a.total
  );

  const serviceExpenses = records
    .filter((record) => safeAmount(record.cost) > 0)
    .map((record) => ({
      id: record.id,
      title: record.title,
      source: "Servicio" as const,
      amount: safeAmount(record.cost),
    }));

  const documentExpenses = paidDocuments.map((document) => ({
    id: document.id,
    title: document.title,
    source: "Documento" as const,
    amount: safeAmount(document.cost),
  }));

  const issueExpenses = issues
    .filter(
      (issue) =>
        issue.status !== "resolved" &&
        issue.status !== "dismissed" &&
        safeAmount(issue.estimatedCost) > 0
    )
    .map((issue) => ({
      id: issue.id,
      title: issue.title,
      source: "Falla estimada" as const,
      amount: safeAmount(issue.estimatedCost),
    }));

  const topExpenses = [
    ...serviceExpenses,
    ...documentExpenses,
    ...issueExpenses,
  ]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  return {
    serviceTotal,
    documentTotal,
    realSpentTotal,
    openIssueEstimateTotal,
    totalKnownCost,
    costPerCurrentKm,
    recordTypeTotals,
    monthlyTotals,
    topExpenses,
  };
}