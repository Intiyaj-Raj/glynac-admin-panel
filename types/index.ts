export type UserStatus = "Active" | "Pending" | "Suspended";

export type Permission = "Read" | "Write" | "Approve" | "Admin";

export type UserRole = "Admin" | "Compliance Officer" | "Advisor" | "Auditor";

export type ModuleId = "documents" | "policies" | "users" | "system" | "flags";

export type ModulePermissions = Record<ModuleId, Permission[]>;

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  permissions: ModulePermissions;
}

export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  active: boolean;
  category: string;
}

export type SystemStatus = "Operational" | "Degraded" | "Down";

export interface SystemService {
  name: string;
  status: SystemStatus;
  latencyMs: number;
  uptime: string;
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  type: "info" | "warning" | "error";

  actionType?: "feature_flag_changed";
  entityId?: string;
  entityName?: string;
  previousState?: string;
  newState?: string;

  simulated?: boolean;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;

  configKey: string;
  updatedAt?: string;
  updatedBy?: string;
}
