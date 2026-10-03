export type UserStatus = "Active" | "Pending" | "Suspended";

export type Permission = "Read" | "Write" | "Approve" | "Admin";

export type UserRole = "Admin" | "Compliance Officer" | "Advisor" | "Auditor";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  permissions: Permission[];
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
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}
