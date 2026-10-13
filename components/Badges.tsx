import type { UserStatus, Severity, SystemStatus } from "@/types";

// Color-coded badge for user status (Active/Pending/Suspended)
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

// Severity badge. Uses ONE accent hue (rose) that grows in intensity with severity,
// plus a 4-step level meter so the level never depends on color alone.
const SEVERITY_LEVEL: Record<Severity, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

const SEVERITY_STYLES: Record<
  Severity,
  { badge: string; filled: string; empty: string }
> = {
  Low: {
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    filled: "bg-slate-400",
    empty: "bg-slate-200",
  },
  Medium: {
    badge: "bg-rose-50 text-rose-700 ring-rose-100",
    filled: "bg-rose-300",
    empty: "bg-rose-100",
  },
  High: {
    badge: "bg-rose-100 text-rose-800 ring-rose-200",
    filled: "bg-rose-500",
    empty: "bg-rose-200",
  },
  Critical: {
    badge: "bg-rose-600 text-white ring-rose-700",
    filled: "bg-white",
    empty: "bg-rose-400",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const style = SEVERITY_STYLES[severity];
  const level = SEVERITY_LEVEL[severity];

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${style.badge}`}
      title={`Severity: ${severity} (${level} of 4)`}
    >
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`w-1 rounded-sm ${step <= level ? style.filled : style.empty}`}
            style={{ height: `${4 + step * 2}px` }}
          />
        ))}
      </span>
      {severity}
    </span>
  );
}

// Color-coded badge for system service status
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

// Badge for log entry type (info/warning/error)
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
