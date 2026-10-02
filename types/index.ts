export type UserStatus = "Active" | "Pending" | "Suspended";

export type UserRole = "Admin" | "Compliance Officer" | "Advisor" | "Auditor";

export type Permission = "Read" | "Write" | "Approve" | "Admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  permissions: Permission[];
}
