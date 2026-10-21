import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

// Load credentials from environment or user-configured localStorage
const defaultUrl = import.meta.env.VITE_SUPABASE_URL || '';
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('rcc_supabase_url') : null;
const savedKey = typeof window !== 'undefined' ? localStorage.getItem('rcc_supabase_anon_key') : null;

export const supabaseUrl = savedUrl || defaultUrl;
export const supabaseAnonKey = savedKey || defaultKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Configure Supabase dynamically from the UI (for instance if administrator sets up credentials)
 */
export function setCustomSupabaseCredentials(url: string, anonKey: string): boolean {
  if (!url || !anonKey) return false;
  localStorage.setItem('rcc_supabase_url', url.trim());
  localStorage.setItem('rcc_supabase_anon_key', anonKey.trim());
  window.location.reload();
  return true;
}

export function clearCustomSupabaseCredentials(): void {
  localStorage.removeItem('rcc_supabase_url');
  localStorage.removeItem('rcc_supabase_anon_key');
  window.location.reload();
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are not configured yet.',
    };
  }

  try {
    const { error } = await supabase.from('courses').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Connection test error: ${error.message} (${error.code || 'unknown'})`,
      };
    }
    return {
      success: true,
      message: 'Supabase PostgreSQL and Auth connection verified successfully.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      success: false,
      message: `Connection failed: ${msg}`,
    };
  }
}
