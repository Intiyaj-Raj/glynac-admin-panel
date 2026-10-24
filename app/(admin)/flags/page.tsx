"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Toggle from "@/components/Toggle";
import { useAdminStore } from "@/components/AdminStore";
import { flagLabel } from "@/lib/featureFlags";

export default function FlagsPage() {
  // Single source of truth: the shared AdminStore (persisted in localStorage)
  const { flags, flagsReady, toggleFlag } = useAdminStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // The effective configuration derived from the shared flags
  const config = useMemo(
    () => Object.fromEntries(flags.map((f) => [f.configKey, f.enabled])),
    [flags],
  );
  const lastChange = useMemo(
    () =>
      flags
        .filter((f) => f.updatedAt)
        .sort((a, b) =>
          (a.updatedAt ?? "") < (b.updatedAt ?? "") ? 1 : -1,
        )[0],
    [flags],
  );

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const cats = flags.map((f) => f.category);
    return ["All", ...Array.from(new Set(cats))];
  }, [flags]);

  // Filter flags by search and category
  const filteredFlags = flags.filter((f) => {
    const q = search.toLowerCase();
    const matchesSearch =
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === "All" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = flags.filter((f) => f.enabled).length;
  const showCount = (n: number) => (flagsReady ? n : "—");

  return (
    <div>
      <PageHeader
        title="Feature Flags & Configuration"
        subtitle="Toggle system capabilities without code deployments"
      />

      {/* Honest scope note: these switches only change frontend configuration */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Flag changes update this application’s shared configuration, are saved
        in this browser (localStorage) and are recorded in the audit log. This
        is a frontend-only demo — no validation, masking or lookup service is
        executed by these switches.
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Flags</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {showCount(flags.length)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Enabled</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {showCount(enabledCount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Disabled</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">
            {showCount(flags.length - enabledCount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
              placeholder="Search feature flags..."
              aria-label="Search feature flags"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Flag Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        aria-busy={!flagsReady}
      >
        {!flagsReady ? (
          // Avoids flashing default values before saved settings are loaded
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse"
            />
          ))
        ) : filteredFlags.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
            No feature flags found matching your filters.
          </div>
        ) : (
          filteredFlags.map((flag) => (
            <div
              key={flag.id}
              data-testid={`flag-card-${flag.id}`}
              className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${
                flag.enabled
                  ? "border-primary-200 ring-1 ring-primary-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {flag.name || flag.id}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {flag.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    {flag.updatedAt
                      ? `Last changed ${flag.updatedAt} by ${flag.updatedBy ?? "Admin"}`
                      : "Default setting"}
                  </p>
                </div>
                {/* One consistent indicator: switch + Enabled/Disabled label */}
                <div className="flex-shrink-0">
                  <Toggle
                    checked={flag.enabled}
                    onChange={() => toggleFlag(flag.id)}
                    label={`${flagLabel(flag)}: ${flag.enabled ? "enabled" : "disabled"}`}
                    showStatus
                    onText="Enabled"
                    offText="Disabled"
                    disabled={!flagsReady}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Effective system configuration */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mt-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Active System Configuration
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              The shared configuration read by the admin panel. It updates
              immediately when a flag changes.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {lastChange
              ? `Last change: ${lastChange.updatedAt} by ${lastChange.updatedBy ?? "Admin"}`
              : "No changes saved yet"}
          </span>
        </div>
        <pre
          className="mt-4 bg-slate-900 text-slate-100 text-xs rounded-lg p-4 overflow-x-auto"
          aria-label="Current system configuration"
        >
          {flagsReady
            ? JSON.stringify({ features: config }, null, 2)
            : "Loading saved configuration…"}
        </pre>
      </div>
    </div>
  );
}
