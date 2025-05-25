import { supabase } from './supabaseClient';

export interface ValidationIssue {
  issue_type: string;
  issue_description: string;
  affected_records: number;
}

export async function validateOrganizationData(organizationId: string): Promise<ValidationIssue[]> {
  try {
    const { data, error } = await supabase
      .rpc('validate_organization_data', {
        org_id: organizationId
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to validate organization data:', err);
    throw err;
  }
}

export async function cleanupOrganizationData(organizationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('cleanup_organization_data', {
        org_id: organizationId
      });

    if (error) throw error;
  } catch (err) {
    console.error('Failed to cleanup organization data:', err);
    throw err;
  }
}