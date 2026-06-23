import type { ReactNode } from "react";

type TrafficLink = {
  label: string;
  description: string;
  href: string;
  tag: string;
};

type InfoCardProps = {
  icon: string;
  title: string;
  children: ReactNode;
};

const officialLinks: TrafficLink[] = [
  {
    label: "Reglamento de Tránsito Morelia",
    description: "Página oficial de Policía Morelia con normativa municipal.",
    href: "https://www.policiamorelia.gob.mx/reglamento-de-transito-y-vialidad-municipal/",
    tag: "Morelia",
  },
  {
    label: "PDF Reglamento Morelia",
    description: "Documento PDF del Reglamento de Tránsito y Vialidad Municipal.",
    href: "https://www.policiamorelia.gob.mx/wp-content/uploads/2026/06/Reglamento-de-Transito-y-Vialidad-Mpal.pdf",
    tag: "Morelia",
  },
  {
    label: "Reglamento de Tránsito CDMX",
    description: "Página oficial de la SSC CDMX sobre reglamento de tránsito.",
    href: "https://www.ssc.cdmx.gob.mx/organizacion-policial/subsecretaria-de-control-de-transito/reglamento-de-transito",
    tag: "CDMX",
  },
  {
    label: "Reglamento de Tránsito EdoMex",
    description: "Ficha oficial vigente en Legislación del Estado de México.",
    href: "https://legislacion.edomex.gob.mx/node/24",
    tag: "EdoMex",
  },
  {
    label: "Hoy No Circula oficial",
    description: "Consulta dinámica por holograma y terminación de placa.",
    href: "https://hoynocircula.cdmx.gob.mx/",
    tag: "CDMX / EdoMex",
  },
];

function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{title}</p>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkCard({ item }: { item: TrafficLink }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-3xl border border-zinc-800 bg-zinc-950 p-4 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">{item.label}</p>

          <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
        </div>

        <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
          {item.tag}
        </span>
      </div>

      <p className="mt-3 text-xs font-semibold text-red-400">
        Abrir fuente oficial →
      </p>
    </a>
  );
}

export default function TrafficCirculationPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-red-900/70 bg-red-950/20 p-4">
        <p className="text-sm font-semibold text-red-300">
          Tránsito y circulación
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Módulo de consulta rápida. No guarda reglas fijas para evitar que la
          app quede obsoleta; concentra tu perfil vehicular y accesos oficiales.
        </p>
      </div>

      <InfoCard icon="🚘" title="Perfil de circulación del Mazda">
        <p>
          <span className="text-zinc-600">Vehículo:</span> Mazda 6 2016 Grand
          Touring Plus
        </p>
        <p>
          <span className="text-zinc-600">Holograma:</span> 0
        </p>
        <p>
          <span className="text-zinc-600">Engomado:</span> azul
        </p>
        <p>
          <span className="text-zinc-600">Placas:</span> Estado de México
        </p>
        <p>
          <span className="text-zinc-600">Zonas de interés:</span> Morelia,
          CDMX y EdoMex
        </p>
      </InfoCard>

      <InfoCard icon="📍" title="Morelia">
        <p>
          Consulta el Reglamento de Tránsito y Vialidad Municipal cuando tengas
          duda sobre estacionamiento, circulación, infracciones o criterios de
          tránsito local.
        </p>
        <p>
          Úsalo como referencia principal para circulación cotidiana en Morelia.
        </p>
      </InfoCard>

      <InfoCard icon="🏙️" title="CDMX / EdoMex">
        <p>
          Antes de entrar a Zona Metropolitana del Valle de México, valida Hoy
          No Circula y cualquier restricción extraordinaria.
        </p>
        <p>
          Tu referencia en la app es holograma 0, engomado azul y placas del
          Estado de México, pero la fuente oficial debe consultarse antes de
          circular.
        </p>
      </InfoCard>

      <InfoCard icon="⚠️" title="Recordatorio práctico">
        <p>
          No registres multas o artículos como regla fija dentro de la app si no
          estás seguro de que siguen vigentes.
        </p>
        <p>
          Para decisiones reales de circulación, abre siempre la fuente oficial
          correspondiente.
        </p>
      </InfoCard>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Enlaces oficiales
        </p>

        {officialLinks.map((item) => (
          <LinkCard key={item.href} item={item} />
        ))}
      </section>
    </div>
  );
}