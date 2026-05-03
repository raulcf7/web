"use client";

import clsx from "clsx";

export interface FilterOption {
  label: string;
  value: string;
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={clsx("flex min-w-[180px] flex-col gap-2", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        {...(onChange
          ? {
              value: value ?? options[0]?.value,
              onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value),
            }
          : {
              defaultValue: value ?? options[0]?.value,
            })}
        className="h-10 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-slate-100 outline-none transition hover:border-red-300/30 focus:border-red-300/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
