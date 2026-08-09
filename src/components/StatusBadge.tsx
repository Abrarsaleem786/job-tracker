import { STATUS_COLORS, STATUS_LABELS, type Status } from "@/types";

export function StatusBadge({ status }: { status: string }) {
  const key = (status in STATUS_LABELS ? status : "not_applied") as Status;
  const label = STATUS_LABELS[key];
  const color = STATUS_COLORS[key];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
