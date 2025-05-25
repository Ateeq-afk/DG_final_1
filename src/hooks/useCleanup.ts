import { useState } from 'react';
import { validateOrganizationData, cleanupOrganizationData, type ValidationIssue } from '@/lib/cleanup';
import { useAudit } from '@/hooks/useAudit';

export function useCleanup(organizationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const { logAction } = useAudit(organizationId);

  const validateData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log validation start
      await logAction('data_validation', {
        status: 'started',
        timestamp: new Date().toISOString()
      });

      const issues = await validateOrganizationData(organizationId);
      setValidationIssues(issues);

      // Log validation results
      await logAction('data_validation', {
        status: 'completed',
        issues_found: issues.length,
        issues: issues
      });

      return issues;
    } catch (err) {
      console.error('Validation failed:', err);
      setError(err instanceof Error ? err : new Error('Validation failed'));

      // Log validation error
      await logAction('data_validation', {
        status: 'failed',
        timestamp: new Date().toISOString()
      }, 'failure', err instanceof Error ? err.message : 'Validation failed');

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanupData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log cleanup start
      await logAction('data_cleanup', {
        status: 'started',
        timestamp: new Date().toISOString()
      });

      await cleanupOrganizationData(organizationId);
      setValidationIssues([]);

      // Log cleanup success
      await logAction('data_cleanup', {
        status: 'completed',
        timestamp: new Date().toISOString(),
        validation_issues_resolved: validationIssues.length
      });
    } catch (err) {
      console.error('Cleanup failed:', err);
      setError(err instanceof Error ? err : new Error('Cleanup failed'));

      // Log cleanup error
      await logAction('data_cleanup', {
        status: 'failed',
        timestamp: new Date().toISOString()
      }, 'failure', err instanceof Error ? err.message : 'Cleanup failed');

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    validationIssues,
    validateData,
    cleanupData
  };
}