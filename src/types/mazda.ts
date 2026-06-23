export type Priority = "low" | "medium" | "high" | "urgent";

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  version: string;
  engine: string;
  currentMileage: number;
  plate: string;
  plateState: string;
  vin: string;
  tireSize: string;
  tirePressurePsi: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VehicleStatus = {
  vehicleId: string;
  currentMileage: number;
  lastServiceMileage: number;
  oilType: string;
  oilIntervalKm: number;
  lastOilChangeDate: string;
  lastSparkPlugChangeDate: string;
  lastTransmissionServiceDate: string;
  lastBrakeChangeNote: string;
  lastTireChangeNote: string;
  lastBatteryChangeNote: string;
};

export type InsuranceCoverage = {
  name: string;
  limit: string;
  deductible?: string;
  status: "covered" | "excluded";
};

export type InsurancePolicy = {
  id: string;
  vehicleId: string;
  insurer: string;
  policyNumber: string;
  startDate: string;
  expirationDate: string;
  plan: string;
  coveragePackage: string;
  coverages: InsuranceCoverage[];
};

export type EmergencyContact = {
  id: string;
  label: string;
  phone: string;
  type: "insurance_claim" | "insurance_office" | "emergency" | "workshop" | "other";
  isPrimary?: boolean;
};

export type VerificationProfile = {
  vehicleId: string;
  plate: string;
  plateState: string;
  hologram: string;
  stickerColor: string;
  lastNumericPlateDigit: string;
  firstSemesterPeriod: string;
  secondSemesterPeriod: string;
  estimatedCost: number;
};

export type VerificationEvent = {
  id: string;
  vehicleId: string;
  title: string;
  period: string;
  dueDate: string;
  cost: number;
  status: "pending" | "completed" | "overdue";
  hologram: string;
  stickerColor: string;
};

export type VehicleIssue = {
  id: string;
  vehicleId: string;
  title: string;
  priority: Priority;
  status: "open" | "quoted" | "scheduled" | "resolved" | "dismissed";
  detectedMileage: number;
  estimatedCost?: number;
  notes?: string;
};

export type Consumable = {
  id: string;
  vehicleId: string;
  name: string;
  category:
    | "oil"
    | "filter"
    | "tires"
    | "wipers"
    | "battery"
    | "spark_plugs"
    | "fluids"
    | "cleaning"
    | "other";
  brand?: string;
  specification?: string;
  notes?: string;
  isFavorite: boolean;
};

export type MaintenanceRule = {
  id: string;
  vehicleId: string;
  title: string;
  category:
    | "oil"
    | "filters"
    | "brakes"
    | "tires"
    | "battery"
    | "spark_plugs"
    | "transmission"
    | "fluids"
    | "inspection"
    | "cleaning"
    | "other";
  intervalKm?: number;
  intervalMonths?: number;
  manualReference?: string;
  isEditable: boolean;
  isActive: boolean;
};

export type ReminderSettings = {
  kmWarningThreshold: number;
  dateWarningDays: number[];
  documentWarningDays: number[];
};

export type Workshop = {
  id: string;
  name: string;
  type: "agency" | "mechanic" | "tire_shop" | "parts_store" | "detailing" | "other";
  phone?: string;
  address?: string;
  notes?: string;
  rating?: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VehicleRecordType =
  | "service"
  | "oil_change"
  | "brakes"
  | "tires"
  | "battery"
  | "transmission"
  | "repair"
  | "diagnostic"
  | "verification"
  | "insurance"
  | "tax"
  | "cleaning"
  | "other";

export type VehicleRecord = {
  id: string;
  vehicleId: string;
  type: VehicleRecordType;
  title: string;
  date: string;
  mileage: number;
  cost: number;
  workshopId?: string;
  workshopName?: string;
  notes?: string;
  status: "completed" | "scheduled" | "pending";
  updateAsLastService?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewServiceRecordInput = {
  type: VehicleRecordType;
  title: string;
  date: string;
  mileage: number;
  cost: number;
  workshopId?: string;
  workshopName?: string;
  notes?: string;
  updateAsLastService: boolean;
};

export type NewVehicleIssueInput = {
  title: string;
  priority: Priority;
  detectedMileage: number;
  estimatedCost?: number;
  notes?: string;
};

export type NewWorkshopInput = {
  name: string;
  type: Workshop["type"];
  phone?: string;
  address?: string;
  notes?: string;
  rating?: number;
  isFavorite?: boolean;
};

export type VehicleDocumentType =
  | "insurance"
  | "verification"
  | "tax"
  | "registration"
  | "invoice"
  | "warranty"
  | "ticket"
  | "service_order"
  | "manual"
  | "traffic_regulation"
  | "other";

export type VehicleDocumentStatus =
  | "valid"
  | "pending"
  | "expired"
  | "paid"
  | "archived";

export type VehicleDocument = {
  id: string;
  vehicleId: string;
  type: VehicleDocumentType;
  title: string;
  issueDate?: string;
  expirationDate?: string;
  cost?: number;
  provider?: string;
  folio?: string;
  notes?: string;
  status: VehicleDocumentStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewVehicleDocumentInput = {
  type: VehicleDocumentType;
  title: string;
  issueDate?: string;
  expirationDate?: string;
  cost?: number;
  provider?: string;
  folio?: string;
  notes?: string;
  status: VehicleDocumentStatus;
};