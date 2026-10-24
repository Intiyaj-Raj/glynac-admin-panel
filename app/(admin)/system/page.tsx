"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ServiceStatusBadge, LogTypeBadge } from "@/components/Badges";
import { mockServices } from "@/data/mockData";
import { useAdminStore } from "@/components/AdminStore";
import type { SystemService } from "@/types";

// Get latency color based on how fast the service responds
function getLatencyColor(ms: number): string {
  if (ms < 100) return "text-green-600";
  if (ms < 200) return "text-yellow-600";
  return "text-red-600";
}

// Calculate an overall error rate from the services
function getOverallErrorRate(services: SystemService[]): string {
  const degraded = services.filter((s) => s.status !== "Operational").length;
  const rate = (degraded / services.length) * 100;
  return `${rate.toFixed(1)}%`;
}

// Simulated platform events that arrive while the stream is live
const SIMULATED_EVENTS: {
  user: string;
  action: string;
  module: string;
  type: "info" | "warning" | "error";
}[] = [
  {
    user: "Michael Chen",
    action: "Reviewed document Client_Disclosure_Q3.pdf",
    module: "VDR",
    type: "info",
  },
  {
    user: "Emily Rodriguez",
    action: "Downloaded client portfolio document",
    module: "VDR",
    type: "info",
  },
  {
    user: "Jessica Williams",
    action: "Approved flagged document after review",
    module: "VDR",
    type: "info",
  },
  {
    user: "Patricia Adams",
    action: "Reviewed audit trail for AML-001",
    module: "Policy Manager",
    type: "info",
  },
  {
    user: "James Martinez",
    action: "Failed login attempt - 3 retries",
    module: "Authentication",
    type: "warning",
  },
  {
    user: "Christopher Lee",
    action: "Uploaded new compliance document",
    module: "VDR",
    type: "info",
  },
  {
    user: "System",
    action: "AI Compliance Engine response time exceeded threshold",
    module: "System Health",
    type: "error",
  },
  {
    user: "System",
    action: "Notification Service retry queue growing",
    module: "System Health",
    type: "warning",
  },
  {
    user: "Amanda Foster",
    action: "Exported compliance report (CSV)",
    module: "Policy Manager",
    type: "info",
  },
  {
    user: "David Kim",
    action: "Access denied to restricted module",
    module: "Authentication",
    type: "warning",
  },
];

const STREAM_INTERVAL_MS = 4000;

export default function SystemHealthPage() {
  // Logs live in the shared store, so actions from other pages show up here
  const { logs, addLog, flags, flagsReady } = useAdminStore();
  const [live, setLive] = useState(true);
  const [services, setServices] = useState(mockServices);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const seenTopId = useRef<number | null>(null);
  const [freshIds, setFreshIds] = useState<number[]>([]);

  // Real-time simulation: new audit events + small latency fluctuations
  useEffect(() => {
    if (!live) return;
    const tick = () => {
      const evt =
        SIMULATED_EVENTS[Math.floor(Math.random() * SIMULATED_EVENTS.length)];
      addLog({ ...evt, simulated: true });
      setServices((prev) =>
        prev.map((svc, i) => {
          const base = mockServices[i].latencyMs;
          const jitter = 1 + (Math.random() - 0.5) * 0.3;
          return { ...svc, latencyMs: Math.max(5, Math.round(base * jitter)) };
        }),
      );
      setLastUpdated(new Date().toLocaleTimeString());
    };
    const t = setInterval(tick, STREAM_INTERVAL_MS);
    return () => clearInterval(t);
  }, [live, addLog]);

  // Briefly highlight entries that arrived after the page was opened
  useEffect(() => {
    const topId = logs[0]?.id ?? null;
    if (seenTopId.current === null) {
      seenTopId.current = topId;
      return;
    }
    const prevTop = seenTopId.current;
    const newOnes = logs.filter((l) => l.id > (prevTop ?? 0)).map((l) => l.id);
    seenTopId.current = topId;
    if (newOnes.length === 0) return;
    setFreshIds((ids) => [...ids, ...newOnes]);
    const t = setTimeout(
      () => setFreshIds((ids) => ids.filter((id) => !newOnes.includes(id))),
      2500,
    );
    return () => clearTimeout(t);
  }, [logs]);

  const [logSearch, setLogSearch] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("All");
  const [moduleFilter, setModuleFilter] = useState<string>("All");

  // Get unique module names from logs for the filter dropdown
  const moduleNames = useMemo(() => {
    const modules = logs.map((l) => l.module);
    return ["All", ...Array.from(new Set(modules))];
  }, [logs]);

  // Filter logs by search, type, and module
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = logSearch.toLowerCase();
      const matchesSearch =
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.entityId ?? "").toLowerCase().includes(q) ||
        (l.entityName ?? "").toLowerCase().includes(q);
      const matchesType = logTypeFilter === "All" || l.type === logTypeFilter;
      const matchesModule = moduleFilter === "All" || l.module === moduleFilter;
      return matchesSearch && matchesType && matchesModule;
    });
  }, [logs, logSearch, logTypeFilter, moduleFilter]);

  // Overall system health summary
  const operationalCount = services.filter(
    (s) => s.status === "Operational",
  ).length;
  const degradedCount = services.filter((s) => s.status === "Degraded").length;

  return (
    <div>
      <PageHeader
        title="System Health & Activity Log"
        subtitle="Monitor platform services and audit user actions in real time"
        action={
          <div className="flex items-center gap-3">
            {lastUpdated && live && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                Updated {lastUpdated}
              </span>
            )}
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              aria-pressed={live}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                live
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {live && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    live ? "bg-green-500" : "bg-slate-400"
                  }`}
                />
              </span>
              {live ? "Live" : "Paused"}
            </button>
          </div>
        }
      />

      {/* System Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Services Operational</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {operationalCount}/{services.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Degraded Services</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {degradedCount}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Avg API Latency</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.round(
              services.reduce((sum, s) => sum + s.latencyMs, 0) /
                services.length,
            )}{" "}
            ms
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Error Rate</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {getOverallErrorRate(services)}
          </p>
        </div>
      </div>

      {/* Feature configuration (reads the same shared flags as the Flags page) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-slate-900">
            Feature Configuration
          </h3>
          <Link
            href="/flags"
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Manage flags
          </Link>
        </div>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {!flagsReady
            ? [0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-9 rounded-lg bg-slate-100 animate-pulse"
                />
              ))
            : flags.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-lg border border-slate-200"
                >
                  <span className="truncate text-slate-700">
                    {f.name.replace(/^Enable\s+/i, "")}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      f.enabled ? "text-green-700" : "text-slate-500"
                    }`}
                  >
                    {f.enabled ? "Enabled" : "Disabled"}
                  </span>
                </li>
              ))}
        </ul>
      </div>

      {/* Service Health Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <h3 className="text-lg font-semibold text-slate-900 px-5 pt-5">
          Service Health Monitor
        </h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Service</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Latency</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">
                  Uptime
                </th>
                <th className="text-left px-5 py-3 font-medium">Health Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr
                  key={service.name}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {service.name}
                  </td>
                  <td className="px-5 py-3">
                    <ServiceStatusBadge status={service.status} />
                  </td>
                  <td
                    className={`px-5 py-3 font-medium ${getLatencyColor(service.latencyMs)}`}
                  >
                    {service.latencyMs} ms
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">
                    {service.uptime}
                  </td>
                  <td className="px-5 py-3">
                    {/* Simple visual health bar based on latency */}
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          service.status === "Operational"
                            ? "bg-green-500"
                            : service.status === "Degraded"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width:
                            service.status === "Operational"
                              ? "95%"
                              : service.status === "Degraded"
                                ? "60%"
                                : "20%",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log Stream */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Activity Log Stream
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit trail of user actions across the platform
            {live ? " · streaming" : " · paused"}
          </p>
        </div>

        {/* Log Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-4">
          <div className="flex-1 relative">
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search logs..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={logTypeFilter}
            onChange={(e) => setLogTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="All">All Types</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {moduleNames.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Log Entries */}
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No log entries found matching your filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors duration-700 ${
                  freshIds.includes(log.id) ? "bg-primary-50" : ""
                }`}
              >
                {/* Type indicator dot */}
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    log.type === "info"
                      ? "bg-blue-500"
                      : log.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <LogTypeBadge type={log.type} />
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {log.module}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 mt-1">{log.action}</p>
                  {log.actionType === "feature_flag_changed" && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">{log.entityId}</span> ·{" "}
                      {log.entityName} · {log.previousState} → {log.newState}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{log.user}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
