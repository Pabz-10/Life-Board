import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-project-url') {
    // Return a mock or null if keys are missing to allow build to proceed
    // but actual functionality will require real keys
    return {} as any; 
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
