"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Toggle from "@/components/Toggle";
import { mockFeatureFlags } from "@/data/mockData";
import type { FeatureFlag } from "@/types";

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Toggle a feature flag on/off
  const toggleFlag = (id: string) => {
    setFlags(
      flags.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  };

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const cats = flags.map((f) => f.category);
    return ["All", ...Array.from(new Set(cats))];
  }, [flags]);

  // Filter flags by search and category
  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div>
      <PageHeader
        title="Feature Flags & Configuration"
        subtitle="Toggle system capabilities without code deployments"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Flags</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {flags.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Enabled</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {enabledCount}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Disabled</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">
            {flags.length - enabledCount}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredFlags.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
            No feature flags found matching your filters.
          </div>
        ) : (
          filteredFlags.map((flag) => (
            <div
              key={flag.id}
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
                      {flag.name}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {flag.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        flag.enabled ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          flag.enabled ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={flag.enabled}
                  onChange={() => toggleFlag(flag.id)}
                  label={flag.name}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
