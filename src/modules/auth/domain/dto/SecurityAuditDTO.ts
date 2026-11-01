export interface SecurityAuditQueryParamsDTO {
  page?: number;
  limit?: number;
  search?: string;
  tab?: "audit_logs" | "login_audits";
}

export interface SecurityAuditSummaryDTO {
  totalAdminActions30d: number;
  loginSuccess24h: number;
  loginFailedAttempts: number;
  criticalMutationsCount: number;
}

export interface SecurityAuditItemDTO {
  id: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  target: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface SecurityAuditResponseDTO {
  logs: SecurityAuditItemDTO[];
  total: number;
  page: number;
  totalPages: number;
  summary: SecurityAuditSummaryDTO;
}
