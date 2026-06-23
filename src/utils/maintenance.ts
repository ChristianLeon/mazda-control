import type { VehicleStatus } from "../types/mazda";

export type ServiceMileageStatus = {
  nextServiceMileage: number;
  remainingKm: number;
  overdueKm: number;
  status: "ok" | "soon" | "overdue";
  label: string;
};

export function calculateServiceMileageStatus(
  status: VehicleStatus,
  warningKm = 1000
): ServiceMileageStatus {
  const nextServiceMileage = status.lastServiceMileage + status.oilIntervalKm;
  const remainingKm = nextServiceMileage - status.currentMileage;
  const overdueKm = Math.max(status.currentMileage - nextServiceMileage, 0);

  if (overdueKm > 0) {
    return {
      nextServiceMileage,
      remainingKm,
      overdueKm,
      status: "overdue",
      label: `Servicio vencido por ${overdueKm.toLocaleString("es-MX")} km`,
    };
  }

  if (remainingKm <= warningKm) {
    return {
      nextServiceMileage,
      remainingKm,
      overdueKm: 0,
      status: "soon",
      label: `Servicio próximo en ${remainingKm.toLocaleString("es-MX")} km`,
    };
  }

  return {
    nextServiceMileage,
    remainingKm,
    overdueKm: 0,
    status: "ok",
    label: `Servicio vigente. Faltan ${remainingKm.toLocaleString("es-MX")} km`,
  };
}