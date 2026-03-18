import { loadEnv } from '@config/env';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';
import { AuthProvider } from '../../types/authProviders';
import { CreditsDisplay } from '../stripe/CreditsDisplay';

export const NavBar = (): JSX.Element => {
  const { open } = useModalStore();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      open('authenticationModal');
    }
  };

  const handleChangePassword = () => {
    open('authenticationModal');
  };

  // Check if user is authenticated through email/password
  const isPasswordUser = user?.provider === AuthProvider.EMAIL;
  const { APP_NAME } = loadEnv();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10' : 'bg-black/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-reddit-orange" />
            <span className="text-xl font-bold bg-gradient-to-r from-reddit-orange via-pink-500 to-purple-500 bg-clip-text text-transparent">
              {VITE_APP_NAME}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Button
                onClick={handleAuthClick}
                className="bg-reddit-orange hover:bg-reddit-orange-dark border-none text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105"
              >
                Sign In
              </Button>
            ) : (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost gap-2 hover:bg-white/10">
                  <span className="text-sm text-gray-200">{user?.email}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-lg bg-base-200 border border-white/10 rounded-box w-52"
                >
                  {isPasswordUser && (
                    <li>
                      <button onClick={handleChangePassword} className="text-sm hover:bg-white/10">
                        Change Password
                      </button>
                    </li>
                  )}
                  <li>
                    <button onClick={signOut} className="text-sm text-error hover:bg-error/20">
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
