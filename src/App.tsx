import { JSX } from 'react';
import { Theme } from 'react-daisyui';
import { AuthErrorHandler } from './components/auth/AuthErrorHandler';
import { Toast } from './components/common/Toast';
import { Layout } from './components/layout/Layout';
import { AuthenticationModal } from './components/modal/auth/AuthenticationModal';
import { DashboardView } from './views/DashboardView';

export const App = (): JSX.Element => {
  return (
    <Theme dataTheme="reddit">
      <Layout>
        <AuthErrorHandler />
        <AuthenticationModal />
        <Toast />
        <DashboardView />
      </Layout>
    </Theme>
  );
};
