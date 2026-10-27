import type {
  ModuleId,
  ModulePermissions,
  Permission,
  UserRole,
} from "@/types";

export const ALL_PERMISSIONS: Permission[] = [
  "Read",
  "Write",
  "Approve",
  "Admin",
];

export const ALL_MODULES: {
  id: ModuleId;
  label: string;
  description: string;
}[] = [
  { id: "documents", label: "Documents", description: "Document review & VDR" },
  { id: "policies", label: "Policies", description: "Compliance rules" },
  { id: "users", label: "Users & Roles", description: "RBAC management" },
  {
    id: "system",
    label: "System & Logs",
    description: "Health and audit logs",
  },
  { id: "flags", label: "Feature Flags", description: "System configuration" },
];

const ALL: Permission[] = ["Read", "Write", "Approve", "Admin"];

const ROLE_DEFAULTS: Record<UserRole, ModulePermissions> = {
  Admin: {
    documents: ALL,
    policies: ALL,
    users: ALL,
    system: ALL,
    flags: ALL,
  },
  "Compliance Officer": {
    documents: ["Read", "Write", "Approve"],
    policies: ["Read", "Write", "Approve"],
    users: ["Read"],
    system: ["Read"],
    flags: ["Read"],
  },
  Advisor: {
    documents: ["Read", "Write"],
    policies: ["Read"],
    users: [],
    system: [],
    flags: [],
  },
  Auditor: {
    documents: ["Read"],
    policies: ["Read"],
    users: ["Read"],
    system: ["Read"],
    flags: ["Read"],
  },
};

export function defaultPermissionsFor(role: UserRole): ModulePermissions {
  const d = ROLE_DEFAULTS[role];
  return {
    documents: [...d.documents],
    policies: [...d.policies],
    users: [...d.users],
    system: [...d.system],
    flags: [...d.flags],
  };
}

export function countGrants(p: ModulePermissions): number {
  return Object.values(p).reduce((n, list) => n + list.length, 0);
}

export const MAX_GRANTS = ALL_MODULES.length * ALL_PERMISSIONS.length;
