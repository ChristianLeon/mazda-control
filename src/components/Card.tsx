import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
  tone?: "default" | "danger" | "success";
};

export default function Card({ title, children, tone = "default" }: CardProps) {
  const border =
    tone === "danger"
      ? "border-red-900/80"
      : tone === "success"
        ? "border-emerald-900/80"
        : "border-zinc-800";

  return (
    <article className={`mb-3 rounded-2xl border ${border} bg-zinc-900 p-4 shadow-sm`}>
      <h2 className="mb-2 text-sm font-semibold text-zinc-100">{title}</h2>
      <div className="text-sm text-zinc-300">{children}</div>
    </article>
  );
}
