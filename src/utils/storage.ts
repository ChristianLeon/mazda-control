import {
  initialConsumables,
  initialDocuments,
  initialEmergencyContacts,
  initialInsurancePolicy,
  initialIssues,
  initialMaintenanceRules,
  initialVehicle,
  initialVehicleStatus,
  initialVerificationEvents,
  initialVerificationProfile,
} from "../data/initialData";

import type {
  Consumable,
  EmergencyContact,
  InsurancePolicy,
  MaintenanceRule,
  Vehicle,
  VehicleDocument,
  VehicleIssue,
  VehicleRecord,
  VehicleStatus,
  VerificationEvent,
  VerificationProfile,
  Workshop,
} from "../types/mazda";

export type MazdaControlData = {
  vehicle: Vehicle;
  vehicleStatus: VehicleStatus;
  insurancePolicy: InsurancePolicy;
  emergencyContacts: EmergencyContact[];
  verificationProfile: VerificationProfile;
  verificationEvents: VerificationEvent[];
  issues: VehicleIssue[];
  consumables: Consumable[];
  maintenanceRules: MaintenanceRule[];
  workshops: Workshop[];
  records: VehicleRecord[];
  documents: VehicleDocument[];
};

const STORAGE_KEY = "mazda-control-data-v1";

export function createInitialMazdaData(): MazdaControlData {
  return {
    vehicle: initialVehicle,
    vehicleStatus: initialVehicleStatus,
    insurancePolicy: initialInsurancePolicy,
    emergencyContacts: initialEmergencyContacts,
    verificationProfile: initialVerificationProfile,
    verificationEvents: initialVerificationEvents,
    issues: initialIssues,
    consumables: initialConsumables,
    maintenanceRules: initialMaintenanceRules,
    workshops: [],
    records: [],
    documents: initialDocuments,
  };
}

function normalizeMazdaData(data: Partial<MazdaControlData>): MazdaControlData {
  const initialData = createInitialMazdaData();

  return {
    vehicle: data.vehicle ?? initialData.vehicle,
    vehicleStatus: data.vehicleStatus ?? initialData.vehicleStatus,
    insurancePolicy: data.insurancePolicy ?? initialData.insurancePolicy,
    emergencyContacts: data.emergencyContacts ?? initialData.emergencyContacts,
    verificationProfile: data.verificationProfile ?? initialData.verificationProfile,
    verificationEvents: data.verificationEvents ?? initialData.verificationEvents,
    issues: data.issues ?? initialData.issues,
    consumables: data.consumables ?? initialData.consumables,
    maintenanceRules: data.maintenanceRules ?? initialData.maintenanceRules,
    workshops: data.workshops ?? initialData.workshops,
    records: data.records ?? initialData.records,
    documents: data.documents ?? initialData.documents,
  };
}

export function loadMazdaData(): MazdaControlData {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) {
      const initialData = createInitialMazdaData();
      saveMazdaData(initialData);
      return initialData;
    }

    return normalizeMazdaData(JSON.parse(rawData) as Partial<MazdaControlData>);
  } catch {
    const initialData = createInitialMazdaData();
    saveMazdaData(initialData);
    return initialData;
  }
}

export function saveMazdaData(data: MazdaControlData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetMazdaData() {
  const initialData = createInitialMazdaData();
  saveMazdaData(initialData);
  return initialData;
}

export function exportMazdaData(data: MazdaControlData) {
  const fileContent = JSON.stringify(data, null, 2);
  const blob = new Blob([fileContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `mazda-control-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}