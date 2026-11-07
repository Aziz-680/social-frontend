import type { User } from "@/lib/types";

type UserStatusProps = {
  status?: User["status"];
  compact?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  away: "Away",
  busy: "Busy",
  "do not disturb": "Do not disturb",
  chilling: "Chilling",
  inactive: "Inactive",
  offline: "Offline",
};

export function getStatusLabel(status?: string) {
  if (!status) return "";
  return STATUS_LABELS[status.toLowerCase()] ?? status.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function UserStatus({ status, compact = false }: UserStatusProps) {
  if (!status) return null;
  const normalized = status.toLowerCase().replaceAll(" ", "-");
  const label = getStatusLabel(status);
  return (
    <span className={`user-status${compact ? " user-status-compact" : ""}`} aria-label={`Status: ${label}`} title={label}>
      <i className={`status-dot status-${normalized}`} aria-hidden="true" />
      {!compact && <span>{label}</span>}
    </span>
  );
}
