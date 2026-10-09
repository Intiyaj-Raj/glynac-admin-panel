"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { StatusBadge } from "@/components/Badges";
import { mockUsers } from "@/data/mockData";
import type { User, UserRole, Permission } from "@/types";

const ALL_ROLES: UserRole[] = [
  "Admin",
  "Compliance Officer",
  "Advisor",
  "Auditor",
];
const ALL_PERMISSIONS: Permission[] = ["Read", "Write", "Approve", "Admin"];
const ROWS_PER_PAGE = 8;

type SortField = "name" | "role" | "status";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter users by search text, role, and status
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort the filtered results
    result = [...result].sort((a, b) => {
      let valA: string = a[sortField];
      let valB: string = b[sortField];
      if (valA.toLowerCase() < valB.toLowerCase()) return sortAsc ? -1 : 1;
      if (valA.toLowerCase() > valB.toLowerCase()) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, sortField, sortAsc, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);
  const pageUsers = filteredUsers.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  // Toggle sorting when a column header is clicked
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setPage(0);
  };

  // Save updated user from the modal back to the users array
  const handleSaveUser = (updatedUser: User) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setEditingUser(null);
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage user roles, permissions, and access control"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
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
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Role filter dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="All">All Roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort("name")}
                >
                  Name {sortField === "name" && (sortAsc ? "▲" : "▼")}
                </th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Email
                </th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort("role")}
                >
                  Role {sortField === "role" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort("status")}
                >
                  Status {sortField === "status" && (sortAsc ? "▲" : "▼")}
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Last Active
                </th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                pageUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="font-medium text-slate-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.role}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {user.lastActive}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Showing {page * ROWS_PER_PAGE + 1}-
              {Math.min(
                page * ROWS_PER_PAGE + ROWS_PER_PAGE,
                filteredUsers.length,
              )}{" "}
              of {filteredUsers.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role & Permission Editor Modal */}
      {editingUser && (
        <RoleEditorModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

// Modal for editing a user's role and permissions
function RoleEditorModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [permissions, setPermissions] = useState<Permission[]>(
    user.permissions,
  );

  // Toggle a single permission checkbox
  const togglePermission = (perm: Permission) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleSave = () => {
    onSave({ ...user, role, permissions });
  };

  return (
    <Modal open={true} onClose={onClose} title="Edit Role & Permissions">
      {/* User info */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <p className="font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      {/* Role selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Permissions checkboxes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Permissions
        </label>
        <div className="space-y-2">
          {ALL_PERMISSIONS.map((perm) => (
            <label
              key={perm}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">{perm}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
