import { createClient } from '@supabase/supabase-js';

// Get environment variables from window._env_ if available (for runtime configuration)
// or fall back to import.meta.env (for build-time configuration)
const getEnvVar = (key: string): string => {
  const runtimeValue = (window as any)._env_?.[key];
  const buildTimeValue = import.meta.env[key];
  
  const value = runtimeValue || buildTimeValue;
  
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  
  return value;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);