import { useState } from 'react';
import { createAuditLog, getAuditLogs, type AuditLog, type AuditAction } from '@/lib/audit';

export function useAudit(organizationId: string | null) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadLogs = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLogs(organizationId);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    action: AuditAction,
    details: Record<string, any>,
    status: 'success' | 'failure' = 'success',
    errorMessage?: string
  ) => {
    if (!organizationId) return;

    try {
      const log = await createAuditLog(
        organizationId,
        action,
        details,
        status,
        errorMessage
      );
      setLogs(prev => [log, ...prev]);
      return log;
    } catch (err) {
      console.error('Failed to create audit log:', err);
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    logAction,
    refresh: loadLogs
  };
}