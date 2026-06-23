import { useMemo, useState } from "react";
import AddActionModal from "./components/AddActionModal";
import BottomNav, { type AppTab } from "./components/BottomNav";
import FloatingActionButton from "./components/FloatingActionButton";
import { useMazdaData } from "./hooks/useMazdaData";
import CalendarPage from "./pages/CalendarPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import MorePage from "./pages/MorePage";
import StatusPage from "./pages/StatusPage";
import { calculateServiceMileageStatus } from "./utils/maintenance";

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
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
    addDocument,
    updateDocument,
    deleteDocument,
    exportData,
    resetData,
  } = useMazdaData();

  const serviceStatus = useMemo(
    () => calculateServiceMileageStatus(data.vehicleStatus, 1000),
    [data.vehicleStatus]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
          Mazda Control
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          {data.vehicle.brand} {data.vehicle.model} {data.vehicle.year}
        </h1>

        <p className="text-sm text-zinc-400">
          {data.vehicle.version} · {data.vehicle.engine}
        </p>
      </header>

      <section className="flex-1 px-4 pb-24 pt-4">
        {activeTab === "home" && (
          <HomePage
            serviceLabel={serviceStatus.label}
            serviceState={serviceStatus.status}
            vehicle={data.vehicle}
            vehicleStatus={data.vehicleStatus}
            insurancePolicy={data.insurancePolicy}
            emergencyContacts={data.emergencyContacts}
            verificationProfile={data.verificationProfile}
            issues={data.issues}
          />
        )}

        {activeTab === "status" && (
          <StatusPage
            serviceLabel={serviceStatus.label}
            serviceState={serviceStatus.status}
            vehicle={data.vehicle}
            vehicleStatus={data.vehicleStatus}
            records={data.records}
            workshops={data.workshops}
            onUpdateMileage={updateMileage}
            onSaveMaintenanceService={addVehicleRecord}
          />
        )}

        {activeTab === "calendar" && (
          <CalendarPage
            verificationEvents={data.verificationEvents}
            insurancePolicy={data.insurancePolicy}
            documents={data.documents}
            serviceLabel={serviceStatus.label}
            serviceState={serviceStatus.status}
            nextServiceMileage={serviceStatus.nextServiceMileage}
            currentMileage={data.vehicle.currentMileage}
          />
        )}

        {activeTab === "history" && (
          <HistoryPage
            vehicleStatus={data.vehicleStatus}
            records={data.records}
            workshops={data.workshops}
            onUpdateRecord={updateVehicleRecord}
            onDeleteRecord={deleteVehicleRecord}
          />
        )}

        {activeTab === "more" && (
          <MorePage
            vehicle={data.vehicle}
            records={data.records}
            consumables={data.consumables}
            issues={data.issues}
            workshops={data.workshops}
            documents={data.documents}
            onUpdateIssue={updateIssue}
            onUpdateIssueStatus={updateIssueStatus}
            onDeleteIssue={deleteIssue}
            onUpdateWorkshop={updateWorkshop}
            onDeleteWorkshop={deleteWorkshop}
            onUpdateDocument={updateDocument}
            onDeleteDocument={deleteDocument}
            onExportData={exportData}
            onResetData={resetData}
          />
        )}
      </section>

      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AddActionModal
        isOpen={isAddModalOpen}
        currentMileage={data.vehicle.currentMileage}
        workshops={data.workshops}
        onClose={() => setIsAddModalOpen(false)}
        onSaveService={addVehicleRecord}
        onSaveIssue={addIssue}
        onSaveWorkshop={addWorkshop}
        onSaveDocument={addDocument}
      />
    </main>
  );
}

export default App;