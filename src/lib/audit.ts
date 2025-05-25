import { supabase } from './supabaseClient';

export type AuditAction = 
  | 'data_validation'
  | 'data_cleanup'
  | 'customer_cleanup'
  | 'booking_cleanup'
  | 'article_cleanup';

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: AuditAction;
  details: Record<string, any>;
  status: 'success' | 'failure';
  error_message?: string;
  created_at: string;
}

export async function createAuditLog(
  organizationId: string,
  action: AuditAction,
  details: Record<string, any>,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        action,
        details,
        status,
        error_message: errorMessage
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to create audit log:', err);
    throw err;
  }
}

export async function getAuditLogs(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:auth.users(email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to get audit logs:', err);
    throw err;
  }
}