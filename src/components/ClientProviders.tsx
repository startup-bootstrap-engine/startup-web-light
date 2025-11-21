'use client';

import { type ReactNode } from 'react';
import { Theme } from 'react-daisyui';
import { AuthErrorHandler } from './auth/AuthErrorHandler';
import { Toast } from './common/Toast';
import { AuthenticationModal } from './modal/auth/AuthenticationModal';

export function ClientProviders({ children }: { children: ReactNode }): ReactNode {
  return (
    <Theme dataTheme="sunset">
      <AuthErrorHandler />
      <AuthenticationModal />
      <Toast />
      {children}
    </Theme>
  );
}
