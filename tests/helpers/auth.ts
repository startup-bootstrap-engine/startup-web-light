import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

type AuthFixtures = {
  authenticatedRequest: ReturnType<typeof base.use>;
  testUser: { id: string; email: string; token: string };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create test user with unique email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test-password-123';

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) throw error;
    if (!data.user || !data.session) {
      throw new Error('Failed to create test user');
    }

    await use({
      id: data.user.id,
      email: data.user.email!,
      token: data.session.access_token,
    });

    // Cleanup: Delete test user after test completes
    try {
      await supabase.auth.admin.deleteUser(data.user.id);
    } catch (cleanupError) {
      console.warn('Failed to cleanup test user:', cleanupError);
    }
  },

  authenticatedRequest: async ({ testUser }, use) => {
    // This fixture will be used with test.use() to add auth headers
    await use({ testUser } as never);
  },
});

export { expect } from '@playwright/test';
