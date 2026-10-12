"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { ServiceStatusBadge, LogTypeBadge } from "@/components/Badges";
import { mockServices, mockActivityLogs } from "@/data/mockData";
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

export default function SystemHealthPage() {
  const [logs] = useState(mockActivityLogs);
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
      const matchesSearch =
        l.user.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.action.toLowerCase().includes(logSearch.toLowerCase());
      const matchesType = logTypeFilter === "All" || l.type === logTypeFilter;
      const matchesModule = moduleFilter === "All" || l.module === moduleFilter;
      return matchesSearch && matchesType && matchesModule;
    });
  }, [logs, logSearch, logTypeFilter, moduleFilter]);

  // Overall system health summary
  const operationalCount = mockServices.filter(
    (s) => s.status === "Operational",
  ).length;
  const degradedCount = mockServices.filter(
    (s) => s.status === "Degraded",
  ).length;

  return (
    <div>
      <PageHeader
        title="System Health & Activity Log"
        subtitle="Monitor platform services and audit user actions in real time"
      />

      {/* System Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Services Operational</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {operationalCount}/{mockServices.length}
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
              mockServices.reduce((sum, s) => sum + s.latencyMs, 0) /
                mockServices.length,
            )}{" "}
            ms
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Error Rate</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {getOverallErrorRate(mockServices)}
          </p>
        </div>
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
              {mockServices.map((service) => (
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
                className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
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
