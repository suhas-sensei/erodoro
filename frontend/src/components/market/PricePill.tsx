import { formatCents } from "@/lib/format";

export function PricePill({
  kind,
  label,
  cents,
  enabled = true,
  active = false,
  onClick,
}: {
  kind: "yes" | "no";
  label: string;
  cents?: number;
  enabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const base =
    "flex h-9 items-center gap-2 rounded-control px-3 text-[14px] font-semibold transition";
  const color = !enabled
    ? "bg-disabled text-disabledTxt cursor-not-allowed"
    : kind === "yes"
      ? `bg-green hover:bg-greenPress text-white ${active ? "ring-2 ring-focus" : ""}`
      : `bg-red hover:bg-redPress text-white ${active ? "ring-2 ring-focus" : ""}`;

  return (
    <button
      disabled={!enabled}
      onClick={onClick}
      className={`${base} ${color}`}
    >
      <span className="uppercase">{label}</span>
      {cents !== undefined && <span>{formatCents(cents)}</span>}
    </button>
  );
}
