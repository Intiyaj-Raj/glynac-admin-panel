import type { UserStatus, Severity, SystemStatus } from "@/types";

export function StatusBadge({ status }: { status: UserStatus }) {
  const colors: Record<UserStatus, string> = {
    Active: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Suspended: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, string> = {
    Low: "bg-blue-100 text-blue-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-orange-100 text-orange-700",
    Critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[severity]}`}
    >
      {severity}
    </span>
  );
}

export function ServiceStatusBadge({ status }: { status: SystemStatus }) {
  const colors: Record<SystemStatus, string> = {
    Operational: "bg-green-100 text-green-700",
    Degraded: "bg-yellow-100 text-yellow-700",
    Down: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {status}
    </span>
  );
}

export function LogTypeBadge({ type }: { type: "info" | "warning" | "error" }) {
  const colors = {
    info: "bg-blue-100 text-blue-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[type]}`}
    >
      {type}
    </span>
  );
}
