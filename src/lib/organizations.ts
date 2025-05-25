import { supabase } from './supabaseClient';

export async function getK2KOrganization() {
  try {
    const { data, error } = await supabase
      .rpc('get_k2k_organization');

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Failed to get K2K organization:', err);
    throw err;
  }
}

export async function verifyClientCode(code: string) {
  try {
    const k2k = await getK2KOrganization();
    return k2k?.client_code === code.toUpperCase();
  } catch (err) {
    console.error('Failed to verify client code:', err);
    return false;
  }
}