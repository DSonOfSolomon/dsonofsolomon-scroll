import { ReactNode } from "react";

export const adminInputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0a192f] focus:ring-2 focus:ring-[#0a192f]/10";

export const adminFileInputClass =
  "mt-2 block w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#0a192f] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white";

export const adminSecondaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50";

export const adminPrimaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-[#0a192f] px-4 text-sm font-medium !text-white shadow-sm transition-colors hover:bg-[#13294b]";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-gray-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-[#8a6a2f]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950 md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

export function AdminPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function AdminPanelHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase text-gray-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold text-gray-950">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-950 shadow-sm">
      <p className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-gray-600">
        {note}
      </p>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  }[tone];

  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${toneClass}`}>
      {children}
    </span>
  );
}
