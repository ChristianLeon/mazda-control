import { useEffect, useState } from "react";
import { initialVehicleStatus } from "../data/initialData";
import type {
  Consumable,
  NewConsumableInput,
  NewServiceRecordInput,
  NewVehicleDocumentInput,
  NewVehicleIssueInput,
  NewWorkshopInput,
  VehicleDocument,
  VehicleIssue,
  VehicleRecord,
  Workshop,
} from "../types/mazda";
import {
  exportMazdaData,
  loadMazdaData,
  resetMazdaData,
  saveMazdaData,
  type MazdaControlData,
} from "../utils/storage";

type UpdateVehicleIssueInput = NewVehicleIssueInput & {
  status: VehicleIssue["status"];
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getLastServiceMileageFromRecords(records: VehicleRecord[]) {
  const serviceRecords = records
    .filter((record) => record.updateAsLastService)
    .sort((a, b) => {
      const dateCompare = String(b.date).localeCompare(String(a.date));

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return String(b.createdAt).localeCompare(String(a.createdAt));
    });

  return serviceRecords[0]?.mileage ?? initialVehicleStatus.lastServiceMileage;
}

export function useMazdaData() {
  const [data, setData] = useState<MazdaControlData>(() => loadMazdaData());

  useEffect(() => {
    saveMazdaData(data);
  }, [data]);

  function updateMileage(nextMileage: number) {
    const sanitizedMileage = Math.max(0, Math.round(nextMileage));
    const now = new Date().toISOString();

    setData((currentData) => ({
      ...currentData,
      vehicle: {
        ...currentData.vehicle,
        currentMileage: sanitizedMileage,
        updatedAt: now,
      },
      vehicleStatus: {
        ...currentData.vehicleStatus,
        currentMileage: sanitizedMileage,
      },
    }));
  }

  function addVehicleRecord(input: NewServiceRecordInput) {
    const sanitizedMileage = Math.max(0, Math.round(input.mileage));
    const sanitizedCost = Math.max(0, Number(input.cost) || 0);
    const now = new Date().toISOString();

    setData((currentData) => {
      const newRecord: VehicleRecord = {
        id: createId("record"),
        vehicleId: currentData.vehicle.id,
        type: input.type,
        title: input.title.trim() || "Servicio / mantenimiento",
        date: input.date,
        mileage: sanitizedMileage,
        cost: sanitizedCost,
        workshopId: input.workshopId || undefined,
        workshopName: input.workshopName?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        status: "completed",
        updateAsLastService: input.updateAsLastService,
        createdAt: now,
        updatedAt: now,
      };

      const nextRecords = [newRecord, ...currentData.records];

      return {
        ...currentData,
        records: nextRecords,
        vehicle: {
          ...currentData.vehicle,
          currentMileage: sanitizedMileage,
          updatedAt: now,
        },
        vehicleStatus: {
          ...currentData.vehicleStatus,
          currentMileage: sanitizedMileage,
          lastServiceMileage: getLastServiceMileageFromRecords(nextRecords),
        },
      };
    });
  }

  function updateVehicleRecord(recordId: string, input: NewServiceRecordInput) {
    const sanitizedMileage = Math.max(0, Math.round(input.mileage));
    const sanitizedCost = Math.max(0, Number(input.cost) || 0);
    const now = new Date().toISOString();

    setData((currentData) => {
      const nextRecords = currentData.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              type: input.type,
              title: input.title.trim() || "Servicio / mantenimiento",
              date: input.date,
              mileage: sanitizedMileage,
              cost: sanitizedCost,
              workshopId: input.workshopId || undefined,
              workshopName: input.workshopName?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              updateAsLastService: input.updateAsLastService,
              updatedAt: now,
            }
          : record
      );

      const nextCurrentMileage = Math.max(
        currentData.vehicle.currentMileage,
        sanitizedMileage
      );

      return {
        ...currentData,
        records: nextRecords,
        vehicle: {
          ...currentData.vehicle,
          currentMileage: nextCurrentMileage,
          updatedAt: now,
        },
        vehicleStatus: {
          ...currentData.vehicleStatus,
          currentMileage: nextCurrentMileage,
          lastServiceMileage: getLastServiceMileageFromRecords(nextRecords),
        },
      };
    });
  }

  function deleteVehicleRecord(recordId: string) {
    setData((currentData) => {
      const nextRecords = currentData.records.filter(
        (record) => record.id !== recordId
      );

      return {
        ...currentData,
        records: nextRecords,
        vehicleStatus: {
          ...currentData.vehicleStatus,
          lastServiceMileage: getLastServiceMileageFromRecords(nextRecords),
        },
      };
    });
  }

  function addIssue(input: NewVehicleIssueInput) {
    const sanitizedMileage = Math.max(0, Math.round(input.detectedMileage));
    const sanitizedCost =
      input.estimatedCost === undefined
        ? undefined
        : Math.max(0, Number(input.estimatedCost) || 0);

    setData((currentData) => {
      const newIssue: VehicleIssue = {
        id: createId("issue"),
        vehicleId: currentData.vehicle.id,
        title: input.title.trim() || "Falla / pendiente",
        priority: input.priority,
        status: "open",
        detectedMileage: sanitizedMileage,
        estimatedCost: sanitizedCost,
        notes: input.notes?.trim() || undefined,
      };

      return {
        ...currentData,
        issues: [newIssue, ...currentData.issues],
      };
    });
  }

  function updateIssue(issueId: string, input: UpdateVehicleIssueInput) {
    const sanitizedMileage = Math.max(0, Math.round(input.detectedMileage));
    const sanitizedCost =
      input.estimatedCost === undefined
        ? undefined
        : Math.max(0, Number(input.estimatedCost) || 0);

    setData((currentData) => ({
      ...currentData,
      issues: currentData.issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              title: input.title.trim() || "Falla / pendiente",
              priority: input.priority,
              status: input.status,
              detectedMileage: sanitizedMileage,
              estimatedCost: sanitizedCost,
              notes: input.notes?.trim() || undefined,
            }
          : issue
      ),
    }));
  }

  function updateIssueStatus(issueId: string, status: VehicleIssue["status"]) {
    setData((currentData) => ({
      ...currentData,
      issues: currentData.issues.map((issue) =>
        issue.id === issueId ? { ...issue, status } : issue
      ),
    }));
  }

  function deleteIssue(issueId: string) {
    setData((currentData) => ({
      ...currentData,
      issues: currentData.issues.filter((issue) => issue.id !== issueId),
    }));
  }

  function addWorkshop(input: NewWorkshopInput) {
    const now = new Date().toISOString();

    setData((currentData) => {
      const newWorkshop: Workshop = {
        id: createId("workshop"),
        name: input.name.trim() || "Taller sin nombre",
        type: input.type,
        phone: input.phone?.trim() || undefined,
        address: input.address?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        rating: input.rating,
        isFavorite: input.isFavorite ?? false,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...currentData,
        workshops: [newWorkshop, ...currentData.workshops],
      };
    });
  }

  function updateWorkshop(workshopId: string, input: NewWorkshopInput) {
    const now = new Date().toISOString();

    setData((currentData) => ({
      ...currentData,
      workshops: currentData.workshops.map((workshop) =>
        workshop.id === workshopId
          ? {
              ...workshop,
              name: input.name.trim() || "Taller sin nombre",
              type: input.type,
              phone: input.phone?.trim() || undefined,
              address: input.address?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              rating: input.rating,
              isFavorite: input.isFavorite ?? false,
              updatedAt: now,
            }
          : workshop
      ),
    }));
  }

  function deleteWorkshop(workshopId: string) {
    setData((currentData) => ({
      ...currentData,
      workshops: currentData.workshops.filter(
        (workshop) => workshop.id !== workshopId
      ),
    }));
  }

  function addConsumable(input: NewConsumableInput) {
  setData((currentData) => {
    const newConsumable: Consumable = {
      id: createId("consumable"),
      vehicleId: currentData.vehicle.id,
      name: input.name.trim() || "Refacción sin nombre",
      category: input.category,
      brand: input.brand?.trim() || undefined,
      specification: input.specification?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      isFavorite: input.isFavorite ?? false,
    };

    return {
      ...currentData,
      consumables: [newConsumable, ...currentData.consumables],
    };
  });
}

  function updateConsumable(consumableId: string, input: NewConsumableInput) {
  setData((currentData) => ({
    ...currentData,
    consumables: currentData.consumables.map((consumable) =>
      consumable.id === consumableId
        ? {
            ...consumable,
            name: input.name.trim() || "Refacción sin nombre",
            category: input.category,
            brand: input.brand?.trim() || undefined,
            specification: input.specification?.trim() || undefined,
            notes: input.notes?.trim() || undefined,
            isFavorite: input.isFavorite ?? false,
          }
        : consumable
    ),
  }));
}

  function deleteConsumable(consumableId: string) {
    setData((currentData) => ({
      ...currentData,
      consumables: currentData.consumables.filter(
        (consumable) => consumable.id !== consumableId
      ),
    }));
  }

  function addDocument(input: NewVehicleDocumentInput) {
    const now = new Date().toISOString();

    const sanitizedCost =
      input.cost === undefined ? undefined : Math.max(0, Number(input.cost) || 0);

    setData((currentData) => {
      const newDocument: VehicleDocument = {
        id: createId("document"),
        vehicleId: currentData.vehicle.id,
        type: input.type,
        title: input.title.trim() || "Documento",
        issueDate: input.issueDate || undefined,
        expirationDate: input.expirationDate || undefined,
        cost: sanitizedCost,
        provider: input.provider?.trim() || undefined,
        folio: input.folio?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        status: input.status,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...currentData,
        documents: [newDocument, ...currentData.documents],
      };
    });
  }

  function updateDocument(documentId: string, input: NewVehicleDocumentInput) {
    const now = new Date().toISOString();

    const sanitizedCost =
      input.cost === undefined ? undefined : Math.max(0, Number(input.cost) || 0);

    setData((currentData) => ({
      ...currentData,
      documents: currentData.documents.map((documentItem) =>
        documentItem.id === documentId
          ? {
              ...documentItem,
              type: input.type,
              title: input.title.trim() || "Documento",
              issueDate: input.issueDate || undefined,
              expirationDate: input.expirationDate || undefined,
              cost: sanitizedCost,
              provider: input.provider?.trim() || undefined,
              folio: input.folio?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              status: input.status,
              updatedAt: now,
            }
          : documentItem
      ),
    }));
  }

  function deleteDocument(documentId: string) {
    setData((currentData) => ({
      ...currentData,
      documents: currentData.documents.filter(
        (documentItem) => documentItem.id !== documentId
      ),
    }));
  }

  function resetData() {
    setData(resetMazdaData());
  }

  function exportData() {
    exportMazdaData(data);
  }

  return {
    data,
    updateMileage,
    addVehicleRecord,
    updateVehicleRecord,
    deleteVehicleRecord,
    addIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    addConsumable,
    updateConsumable,
    deleteConsumable,
    addDocument,
    updateDocument,
    deleteDocument,
    resetData,
    exportData,
  };
}