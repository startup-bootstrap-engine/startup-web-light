import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Reddit Monitor'),
  VITE_SUPABASE_URL: z.string().default('https://placeholder.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  VITE_GOOGLE_CLIENT_ID: z.string().default(''),
  VITE_FACEBOOK_CLIENT_ID: z.string().default(''),
  VITE_AZURE_CLIENT_ID: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const env = import.meta.env;
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.warn('Environment validation failed. Using default values:', result.error.format());
    // Return with defaults applied
    return envSchema.parse({});
  }

  // Check if using placeholder values and warn
  if (result.data.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('⚠️  Using placeholder Supabase configuration. Please set up your .env file with real values.');
  }

  return result.data;
}
