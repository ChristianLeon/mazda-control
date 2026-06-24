import type {
  Vehicle,
  VehicleDocument,
  VehicleIssue,
  VehicleRecord,
} from "../types/mazda";

export type CostAnalysis = {
  serviceTotal: number;
  documentTotal: number;
  realSpentTotal: number;
  openIssueEstimateTotal: number;
  totalKnownCost: number;
  costPerCurrentKm: number;
  topExpenses: {
    id: string;
    title: string;
    source: "Servicio" | "Documento" | "Falla estimada";
    amount: number;
  }[];
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
    .slice(0, 5);

  return {
    serviceTotal,
    documentTotal,
    realSpentTotal,
    openIssueEstimateTotal,
    totalKnownCost,
    costPerCurrentKm,
    topExpenses,
  };
}