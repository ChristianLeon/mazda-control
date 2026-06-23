import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import type { Vehicle, VehicleStatus } from "../types/mazda";

type ServiceState = "ok" | "soon" | "overdue";

type StatusPageProps = {
  serviceLabel: string;
  serviceState: ServiceState;
  vehicle: Vehicle;
  vehicleStatus: VehicleStatus;
  onUpdateMileage: (mileage: number) => void;
};

function getServiceVisual(state: ServiceState) {
  if (state === "ok") {
    return {
      card: "border-emerald-800 bg-emerald-950/30",
      text: "text-emerald-300",
      label: "text-emerald-400",
      bar: "bg-emerald-500",
      badge: "Vigente",
    };
  }

  if (state === "soon") {
    return {
      card: "border-yellow-700 bg-yellow-950/30",
      text: "text-yellow-300",
      label: "text-yellow-400",
      bar: "bg-yellow-400",
      badge: "Próximo",
    };
  }

  return {
    card: "border-red-800 bg-red-950/40",
    text: "text-red-300",
    label: "text-red-400",
    bar: "bg-red-500",
    badge: "Vencido",
  };
}

function formatKm(value: number) {
  return value.toLocaleString("es-MX");
}

function formatDate(value: string) {
  if (!value) return "Sin dato";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export default function StatusPage({
  serviceLabel,
  serviceState,
  vehicle,
  vehicleStatus,
  onUpdateMileage,
}: StatusPageProps) {
  const [mileageInput, setMileageInput] = useState(String(vehicle.currentMileage));
  const [savedMessage, setSavedMessage] = useState("");

  const serviceVisual = getServiceVisual(serviceState);

  const nextServiceMileage = useMemo(() => {
    return vehicleStatus.lastServiceMileage + vehicleStatus.oilIntervalKm;
  }, [vehicleStatus.lastServiceMileage, vehicleStatus.oilIntervalKm]);

  const serviceProgress = useMemo(() => {
    const totalInterval = Math.max(
      1,
      nextServiceMileage - vehicleStatus.lastServiceMileage
    );

    const usedInterval = vehicle.currentMileage - vehicleStatus.lastServiceMileage;
    const percentage = (usedInterval / totalInterval) * 100;

    return Math.min(Math.max(percentage, 0), 100);
  }, [
    nextServiceMileage,
    vehicle.currentMileage,
    vehicleStatus.lastServiceMileage,
  ]);

  const kmSinceLastService = Math.max(
    0,
    vehicle.currentMileage - vehicleStatus.lastServiceMileage
  );

  useEffect(() => {
    setMileageInput(String(vehicle.currentMileage));
  }, [vehicle.currentMileage]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanValue = mileageInput.replace(/[^\d]/g, "");
    const nextMileage = Number(cleanValue);

    if (!Number.isFinite(nextMileage) || nextMileage <= 0) {
      setSavedMessage("Ingresa un kilometraje válido.");
      return;
    }

    onUpdateMileage(nextMileage);
    setMileageInput(String(nextMileage));
    setSavedMessage(`Kilometraje actualizado a ${formatKm(nextMileage)} km`);
  }

  return (
    <>
      <Card title="Estado del vehículo">
        <div className="space-y-3">
          <div className={`rounded-3xl border p-4 text-center ${serviceVisual.card}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <p className={`text-xs uppercase tracking-[0.2em] ${serviceVisual.label}`}>
                  Servicio
                </p>

                <p className={`mt-2 text-xl font-bold ${serviceVisual.text}`}>
                  {serviceVisual.badge}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${serviceVisual.card} ${serviceVisual.text}`}
              >
                {serviceVisual.badge}
              </span>
            </div>

            <p className={`mt-4 text-sm font-semibold ${serviceVisual.text}`}>
              {serviceLabel}
            </p>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/30">
              <div
                className={`h-full rounded-full ${serviceVisual.bar}`}
                style={{ width: `${serviceProgress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-zinc-400">
              {formatKm(kmSinceLastService)} km recorridos desde el último servicio
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Actual
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {formatKm(vehicle.currentMileage)}
              </p>
              <p className="text-xs text-zinc-500">km</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Último
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {formatKm(vehicleStatus.lastServiceMileage)}
              </p>
              <p className="text-xs text-zinc-500">km</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Próximo
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {formatKm(nextServiceMileage)}
              </p>
              <p className="text-xs text-zinc-500">km</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Actualizar kilometraje">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Kilometraje actual
            </label>

            <input
              value={mileageInput}
              onChange={(event) => {
                const onlyNumbers = event.target.value.replace(/[^\d]/g, "");
                setMileageInput(onlyNumbers);
                setSavedMessage("");
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-red-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white active:scale-[0.99]"
          >
            Guardar kilometraje
          </button>

          {savedMessage && (
            <p className="text-center text-sm text-zinc-400">{savedMessage}</p>
          )}
        </form>
      </Card>

      <Card title="Identificación">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Placa
            </p>
            <p className="mt-2 text-lg font-bold text-white">{vehicle.plate}</p>
            <p className="mt-1 text-xs text-zinc-500">{vehicle.plateState}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Motor
            </p>
            <p className="mt-2 text-lg font-bold text-white">{vehicle.engine}</p>
            <p className="mt-1 text-xs text-zinc-500">{vehicle.version}</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Serie / VIN
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-zinc-200">
            {vehicle.vin}
          </p>
        </div>
      </Card>

      <Card title="Mantenimiento">
        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Aceite
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {vehicleStatus.oilType}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Intervalo: {formatKm(vehicleStatus.oilIntervalKm)} km
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Aceite
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatDate(vehicleStatus.lastOilChangeDate)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Bujías
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatDate(vehicleStatus.lastSparkPlugChangeDate)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Transmisión automática
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-200">
              {formatDate(vehicleStatus.lastTransmissionServiceDate)}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Llantas">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Medida
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {vehicle.tireSize}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Presión
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {vehicle.tirePressurePsi} PSI
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Marca registrada
          </p>
          <p className="mt-2 text-lg font-bold text-white">Pirelli P Zero</p>
        </div>
      </Card>
    </>
  );
}