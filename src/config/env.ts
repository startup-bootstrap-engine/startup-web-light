import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('PixelPerfect'),
  VITE_SUPABASE_URL: z.string().url().optional().default('https://example.com'),
  VITE_SUPABASE_ANON_KEY: z.string().optional().default(''),
  VITE_GOOGLE_CLIENT_ID: z.string().optional().default(''),
  VITE_FACEBOOK_CLIENT_ID: z.string().optional().default(''),
  VITE_AZURE_CLIENT_ID: z.string().optional().default(''),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  // In Next.js, environment variables are accessed via process.env
  // For client-side usage, they need to be prefixed with NEXT_PUBLIC_
  const env = {
    VITE_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || process.env.VITE_APP_NAME || 'PixelPerfect',
    VITE_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjI4MDY4MywiZXhwIjoxOTI3ODU2NjgzfQ.dummy',
    VITE_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    VITE_FACEBOOK_CLIENT_ID:
      process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || process.env.VITE_FACEBOOK_CLIENT_ID || '',
    VITE_AZURE_CLIENT_ID:
      process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || process.env.VITE_AZURE_CLIENT_ID || '',
  };
  return envSchema.parse(env);
}
