"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  mockActivityLogs,
  mockFeatureFlags,
  mockRules,
  mockUsers,
} from "@/data/mockData";
import {
  FLAGS_STORAGE_KEY,
  buildDefaultFlags,
  flagLabel,
  loadPersistedFlags,
  savePersistedFlags,
} from "@/lib/featureFlags";
import type { ActivityLog, ComplianceRule, FeatureFlag, User } from "@/types";

export const CURRENT_ADMIN = "Sarah Johnson";

export type Toast = {
  id: number;
  message: string;
  tone: "success" | "info" | "warning";
};

export type LogInput = Omit<
  ActivityLog,
  "id" | "timestamp" | "user" | "type"
> & {
  user?: string;
  type?: ActivityLog["type"];
};

export type FlagStatus = "enabled" | "disabled" | "unknown";

export type FlagUpdateResult =
  | { ok: true; changed: boolean; persisted: boolean }
  | { ok: false; reason: "unknown-flag" | "invalid-value" | "not-ready" };

type Store = {
  users: User[];
  rules: ComplianceRule[];
  logs: ActivityLog[];
  toasts: Toast[];
  // --- feature flags ---
  flags: FeatureFlag[];
  /** False until saved flags have been read from localStorage on the client. */
  flagsReady: boolean;
  /** "enabled" | "disabled", or "unknown" for IDs that do not exist. */
  getFlagStatus: (id: string) => FlagStatus;
  /** Convenience boolean; unknown flags are treated as disabled. */
  isFlagEnabled: (id: string) => boolean;
  updateFlag: (id: string, enabled: boolean) => FlagUpdateResult;
  toggleFlag: (id: string) => FlagUpdateResult;
  // --- everything else ---
  updateUser: (updated: User) => void;
  addRule: (rule: ComplianceRule) => void;
  updateRule: (rule: ComplianceRule) => void;
  toggleRule: (id: string) => void;
  addLog: (entry: LogInput) => void;
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
};

const AdminStoreContext = createContext<Store | null>(null);

export function formatTimestamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const MAX_LOGS = 300;
const TOAST_DEDUPE_MS = 300;

// Keep the log bounded, but evict simulated demo events first so real audit
// entries (configuration changes, admin actions) are never pushed out.
function trimLogs(logs: ActivityLog[]): ActivityLog[] {
  if (logs.length <= MAX_LOGS) return logs;
  const result = [...logs];
  for (let i = result.length - 1; i >= 0 && result.length > MAX_LOGS; i--) {
    if (result[i].simulated) result.splice(i, 1);
  }
  return result;
}

export function AdminStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [rules, setRules] = useState<ComplianceRule[]>(mockRules);

  // Newest first
  const [logs, setLogs] = useState<ActivityLog[]>(() =>
    [...mockActivityLogs].sort((a, b) =>
      a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0,
    ),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextLogId = useRef(Math.max(...mockActivityLogs.map((l) => l.id)) + 1);
  const nextToastId = useRef(1);
  const lastToast = useRef<{ message: string; at: number } | null>(null);
  const toastTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // ---------------------------------------------------------------- logs
  const addLog = useCallback((entry: LogInput) => {
    const log: ActivityLog = {
      ...entry,
      id: nextLogId.current++,
      user: entry.user ?? CURRENT_ADMIN,
      type: entry.type ?? "info",
      timestamp: formatTimestamp(),
    };
    setLogs((prev) => trimLogs([log, ...prev]));
  }, []);

  // -------------------------------------------------------------- toasts
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      // Ignore an identical message fired twice in a row (double events)
      const now = Date.now();
      const last = lastToast.current;
      if (last && last.message === message && now - last.at < TOAST_DEDUPE_MS) {
        return;
      }
      lastToast.current = { message, at: now };

      const id = nextToastId.current++;
      setToasts((prev) => [...prev, { id, message, tone }].slice(-4));
      const timer = setTimeout(() => {
        toastTimers.current.delete(timer);
        dismissToast(id);
      }, 4200);
      toastTimers.current.add(timer);
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  // --------------------------------------------------------- feature flags
  // Server render and first client render both use the defaults (no hydration
  // mismatch); saved values are applied right after mount.
  const flagsRef = useRef<FeatureFlag[]>(buildDefaultFlags(mockFeatureFlags));
  const flagsReadyRef = useRef(false);
  const [flags, setFlagsState] = useState<FeatureFlag[]>(flagsRef.current);
  const [flagsReady, setFlagsReady] = useState(false);

  const commitFlags = useCallback((next: FeatureFlag[]) => {
    flagsRef.current = next; // synchronous source of truth
    setFlagsState(next); // mirror for rendering
  }, []);

  // Load saved flags once on the client
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return; // React Strict Mode runs effects twice in dev
    hydrated.current = true;

    const result = loadPersistedFlags(mockFeatureFlags);
    commitFlags(result.flags);
    flagsReadyRef.current = true;
    setFlagsReady(true);

    if (result.status === "invalid") {
      pushToast(
        "Saved feature-flag settings were unreadable. Defaults are being used.",
        "warning",
      );
    } else if (result.status === "unavailable") {
      pushToast(
        "Browser storage is unavailable. Feature-flag changes will not be saved.",
        "warning",
      );
    }
  }, [commitFlags, pushToast]);

  // Keep other open tabs in sync (silent: the originating tab already toasted)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== FLAGS_STORAGE_KEY) return;
      if (!flagsReadyRef.current) return;
      const result = loadPersistedFlags(mockFeatureFlags);
      if (result.status === "ok" || result.status === "empty") {
        commitFlags(result.flags);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [commitFlags]);

  const getFlagStatus = useCallback(
    (id: string): FlagStatus => {
      const f = flags.find((x) => x.id === id);
      if (!f) return "unknown";
      return f.enabled ? "enabled" : "disabled";
    },
    [flags],
  );

  const isFlagEnabled = useCallback(
    (id: string) => flags.find((x) => x.id === id)?.enabled === true,
    [flags],
  );

  const updateFlag = useCallback(
    (id: string, enabled: boolean): FlagUpdateResult => {
      if (!flagsReadyRef.current) return { ok: false, reason: "not-ready" };
      if (typeof enabled !== "boolean")
        return { ok: false, reason: "invalid-value" };

      // Always read the latest flags from the ref (never from a render closure)
      const current = flagsRef.current.find((f) => f.id === id);
      if (!current) {
        pushToast(
          `Unknown feature flag “${id}”. Nothing was changed.`,
          "warning",
        );
        return { ok: false, reason: "unknown-flag" };
      }
      if (current.enabled === enabled) {
        return { ok: true, changed: false, persisted: true };
      }

      const updated: FeatureFlag = {
        ...current,
        enabled,
        updatedAt: formatTimestamp(),
        updatedBy: CURRENT_ADMIN,
      };
      const next = flagsRef.current.map((f) => (f.id === id ? updated : f));
      commitFlags(next);

      const saved = savePersistedFlags(next);
      const label = flagLabel(current);
      const verb = enabled ? "enabled" : "disabled";

      // Audit entry (side effects run here, in the event path, not inside a
      // state updater, so Strict Mode cannot duplicate them)
      addLog({
        actionType: "feature_flag_changed",
        action: `Admin ${verb} ${label}${saved.ok ? "" : " (not saved to browser storage)"}`,
        module: "Feature Flags",
        type: enabled ? "info" : "warning",
        entityId: current.id,
        entityName: current.name,
        previousState: current.enabled ? "enabled" : "disabled",
        newState: verb,
      });

      if (saved.ok) {
        pushToast(
          `${label} ${verb} successfully.`,
          enabled ? "success" : "info",
        );
      } else {
        pushToast(
          `${label} ${verb} for this session only — it could not be saved to browser storage.`,
          "warning",
        );
      }
      return { ok: true, changed: true, persisted: saved.ok };
    },
    [commitFlags, addLog, pushToast],
  );

  const toggleFlag = useCallback(
    (id: string): FlagUpdateResult => {
      const current = flagsRef.current.find((f) => f.id === id);
      if (!current) return updateFlag(id, true); // reports the unknown ID
      return updateFlag(id, !current.enabled);
    },
    [updateFlag],
  );

  // ------------------------------------------------- users & rules (as before)
  const updateUser = useCallback(
    (updated: User) => {
      const before = users.find((u) => u.id === updated.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      const changes: string[] = [];
      if (before?.role !== updated.role)
        changes.push(`role ${before?.role} → ${updated.role}`);
      if (before?.status !== updated.status)
        changes.push(`status ${before?.status} → ${updated.status}`);
      if (
        before &&
        JSON.stringify(before.permissions) !==
          JSON.stringify(updated.permissions)
      )
        changes.push("permissions");
      const detail = changes.length ? ` (${changes.join(", ")})` : "";
      addLog({
        action: `Updated access for ${updated.name}${detail}`,
        module: "RBAC",
        type: updated.status === "Suspended" ? "warning" : "info",
      });
      pushToast(`${updated.name} updated`);
    },
    [users, addLog, pushToast],
  );

  const addRule = useCallback(
    (rule: ComplianceRule) => {
      setRules((prev) => [...prev, rule]);
      addLog({
        action: `Added compliance rule ${rule.id} (${rule.severity})`,
        module: "Policy Manager",
      });
      pushToast(`Rule ${rule.id} added`);
    },
    [addLog, pushToast],
  );

  const updateRule = useCallback(
    (rule: ComplianceRule) => {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
      addLog({
        action: `Edited compliance rule ${rule.id} (severity: ${rule.severity}, ${
          rule.active ? "active" : "inactive"
        })`,
        module: "Policy Manager",
      });
      pushToast(`Rule ${rule.id} saved`);
    },
    [addLog, pushToast],
  );

  const toggleRule = useCallback(
    (id: string) => {
      const rule = rules.find((r) => r.id === id);
      if (!rule) return;
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
      );
      addLog({
        action: `${rule.active ? "Deactivated" : "Activated"} compliance rule ${id}`,
        module: "Policy Manager",
        type: rule.active ? "warning" : "info",
      });
      pushToast(`${id} ${rule.active ? "deactivated" : "activated"}`, "info");
    },
    [rules, addLog, pushToast],
  );

  const value = useMemo<Store>(
    () => ({
      users,
      rules,
      logs,
      toasts,
      flags,
      flagsReady,
      getFlagStatus,
      isFlagEnabled,
      updateFlag,
      toggleFlag,
      updateUser,
      addRule,
      updateRule,
      toggleRule,
      addLog,
      pushToast,
      dismissToast,
    }),
    [
      users,
      rules,
      logs,
      toasts,
      flags,
      flagsReady,
      getFlagStatus,
      isFlagEnabled,
      updateFlag,
      toggleFlag,
      updateUser,
      addRule,
      updateRule,
      toggleRule,
      addLog,
      pushToast,
      dismissToast,
    ],
  );

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore(): Store {
  const ctx = useContext(AdminStoreContext);
  if (!ctx)
    throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  const tone = {
    success: "border-green-200 bg-green-50 text-green-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  };
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-96"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${tone[t.tone]}`}
        >
          <span className="break-words">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
