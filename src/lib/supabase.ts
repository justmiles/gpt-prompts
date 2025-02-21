import { createClient } from '@supabase/supabase-js';

// Get environment variables from window._env_ if available (for runtime configuration)
// or fall back to import.meta.env (for build-time configuration)
const getEnvVar = (key: string): string => {
  const runtimeValue = (window as any)._env_?.[key];
  const buildTimeValue = import.meta.env[key];
  
  const value = runtimeValue || buildTimeValue;
  
  if (!value) {
    throw new Error(`Missing required Supabase configuration: ${key}

Please ensure you have set up your Supabase project and added the following environment variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

You can get these values from your Supabase project settings.
If you haven't set up Supabase yet, click the "Connect to Supabase" button in the top right corner.`);
  }
  
  return value;
};

// Validate Supabase configuration early
const validateSupabaseConfig = () => {
  try {
    const url = getEnvVar('VITE_SUPABASE_URL');
    const key = getEnvVar('VITE_SUPABASE_ANON_KEY');
    
    if (!url.startsWith('https://')) {
      throw new Error('VITE_SUPABASE_URL must start with https://');
    }
    
    if (key.length < 20) {
      throw new Error('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
    }
    
    return { url, key };
  } catch (error) {
    // Add the error to both console and throw it to ensure it's visible
    console.error('Supabase Configuration Error:', error);
    throw error;
  }
};

// Get and validate configuration
const { url: supabaseUrl, key: supabaseAnonKey } = validateSupabaseConfig();

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);