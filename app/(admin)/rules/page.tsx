"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import Toggle from "@/components/Toggle";
import { SeverityBadge } from "@/components/Badges";
import { useAdminStore } from "@/components/AdminStore";
import type { ComplianceRule, Severity } from "@/types";

const SEVERITY_OPTIONS: Severity[] = ["Low", "Medium", "High", "Critical"];

export default function RulesPage() {
  const { rules, addRule, updateRule, toggleRule } = useAdminStore();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter rules by search text, severity and active status
  const filteredRules = useMemo(() => {
    const q = search.toLowerCase();
    return rules.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      const matchesSeverity =
        severityFilter === "All" || r.severity === severityFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" ? r.active : !r.active);
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [rules, search, severityFilter, statusFilter]);

  const existingIds = useMemo(() => rules.map((r) => r.id), [rules]);

  // Save edits to an existing rule
  const handleSaveRule = (updated: ComplianceRule) => {
    updateRule(updated);
    setEditingRule(null);
  };

  // Add a new custom rule
  const handleAddRule = (newRule: ComplianceRule) => {
    addRule(newRule);
    setShowAddModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Compliance Rule Policy Manager"
        subtitle="Configure active SEC/FINRA rules, severity, and status"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Rule
          </button>
        }
      />

      {/* Search + filters */}
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
              placeholder="Search rules by name, ID, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter by severity"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="All">All Severities</option>
            {SEVERITY_OPTIONS.map((sv) => (
              <option key={sv} value={sv}>
                {sv}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Rule ID</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium">Severity</th>
                <th className="text-left px-4 py-3 font-medium">Active</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No rules found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {rule.id}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {rule.name}
                        </p>
                        <p className="text-xs text-slate-500 hidden sm:block">
                          {rule.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {rule.category}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={rule.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle
                        checked={rule.active}
                        onChange={() => toggleRule(rule.id)}
                        label={`Toggle ${rule.name}`}
                        showStatus
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <RuleEditModal
          rule={editingRule}
          existingIds={existingIds}
          onClose={() => setEditingRule(null)}
          onSave={handleSaveRule}
        />
      )}

      {/* Add Rule Modal */}
      {showAddModal && (
        <RuleEditModal
          rule={null}
          existingIds={existingIds}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRule}
        />
      )}
    </div>
  );
}

// Shared modal for editing an existing rule or creating a new one
function RuleEditModal({
  rule,
  existingIds,
  onClose,
  onSave,
}: {
  rule: ComplianceRule | null;
  existingIds: string[];
  onClose: () => void;
  onSave: (rule: ComplianceRule) => void;
}) {
  const [id, setId] = useState(rule?.id ?? "");
  const [name, setName] = useState(rule?.name ?? "");
  const [description, setDescription] = useState(rule?.description ?? "");
  const [category, setCategory] = useState(rule?.category ?? "");
  const [severity, setSeverity] = useState<Severity>(rule?.severity ?? "Low");
  const [active, setActive] = useState(rule?.active ?? true);

  // Duplicate check (case-insensitive) – only relevant when creating a rule
  const trimmedId = id.trim();
  const isDuplicate =
    !rule &&
    trimmedId !== "" &&
    existingIds.some((x) => x.toLowerCase() === trimmedId.toLowerCase());

  const handleSave = () => {
    // Validation - required fields and unique ID
    if (!trimmedId || !name.trim() || isDuplicate) return;
    onSave({
      id: trimmedId,
      name: name.trim(),
      description,
      category,
      severity,
      active,
    });
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={rule ? "Edit Rule" : "Add New Rule"}
    >
      <div className="space-y-4">
        {/* Rule ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rule ID
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!rule}
            placeholder="e.g. FINRA-2210"
            aria-invalid={isDuplicate}
            aria-describedby={isDuplicate ? "rule-id-error" : undefined}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 ${
              isDuplicate
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-300 focus:ring-primary-500"
            }`}
          />
          {isDuplicate && (
            <p id="rule-id-error" className="text-xs text-red-600 mt-1">
              A rule with ID “{trimmedId}” already exists. Choose a unique ID.
            </p>
          )}
        </div>

        {/* Rule Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule name"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the rule"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Communications"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Severity
          </label>
          <div className="flex flex-wrap gap-2">
            {SEVERITY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  severity === s
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 pt-2">
          <Toggle
            checked={active}
            onChange={setActive}
            label="Active"
            showStatus
          />
          <span className="text-sm text-slate-700">
            {active ? "Rule is enforced" : "Rule is not enforced"}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!trimmedId || !name.trim() || isDuplicate}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {rule ? "Save Changes" : "Add Rule"}
        </button>
      </div>
    </Modal>
  );
}
