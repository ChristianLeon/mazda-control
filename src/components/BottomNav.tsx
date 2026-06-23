export type AppTab = "home" | "status" | "calendar" | "history" | "more";

type BottomNavProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const tabs: { id: AppTab; label: string }[] = [
  { id: "home", label: "Inicio" },
  { id: "status", label: "Estado" },
  { id: "calendar", label: "Calendario" },
  { id: "history", label: "Historial" },
  { id: "more", label: "Más" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto grid max-w-md grid-cols-5 border-t border-zinc-800 bg-zinc-950">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-2 py-3 text-xs ${
            activeTab === tab.id ? "text-red-500" : "text-zinc-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
