import { z } from 'zod';

const envSchema = z.object({
  APP_NAME: z.string().default('PixelPerfect'),
  SUPABASE_URL: z.string().url().optional().default('https://example.com'),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  FACEBOOK_CLIENT_ID: z.string().optional().default(''),
  AZURE_CLIENT_ID: z.string().optional().default(''),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  // In Next.js, client-side variables must be prefixed with NEXT_PUBLIC_
  // These are safe to expose to the browser (anon keys, public URLs, etc.)
  const env = {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PixelPerfect',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjI4MDY4MywiZXhwIjoxOTI3ODU2NjgzfQ.dummy',
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    FACEBOOK_CLIENT_ID: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || '',
    AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
  };
  return envSchema.parse(env);
}
