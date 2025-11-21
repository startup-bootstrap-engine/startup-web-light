'use client';

import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { IAssetCategory } from '../../types';
import { Tab } from '../common/Tab';

interface ITabNavigationClientProps {
  categories: IAssetCategory[];
}

export const TabNavigationClient = ({ categories }: ITabNavigationClientProps): JSX.Element => {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/') return 'summary';
    const match = pathname?.match(/^\/portfolio\/([^/]+)/);
    return match ? match[1] : 'summary';
  };

  const activeTab = getActiveTab();

  // Show only first 2 categories on mobile (plus Summary tab)
  const visibleCategories = categories.slice(0, 2);
  const hiddenCategories = categories.slice(2);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMoreMenuOpen(false);
    if (isMoreMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMoreMenuOpen]);

  return (
    <div className="bg-base-200/50 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10">
      <div className="container mx-auto px-2 md:px-4">
        <div className="tabs tabs-boxed bg-base-200/50 flex md:justify-between py-1 relative">
          {/* Desktop: Full width tabs container */}
          <div className="hidden md:flex w-full">
            <Link href="/">
              <Tab
                id="summary"
                label="Summary"
                icon="LayoutDashboard"
                isActive={activeTab === 'summary'}
                onClick={() => {}}
              />
            </Link>
            {categories.map(category => (
              <Link key={category.id} href={`/portfolio/${category.id}`}>
                <Tab
                  id={category.id}
                  label={category.name}
                  icon={category.icon}
                  isActive={activeTab === category.id}
                  onClick={() => {}}
                />
              </Link>
            ))}
          </div>

          {/* Mobile: Limited tabs + more menu */}
          <div className="flex md:hidden items-center w-full">
            <div className="flex-1 flex overflow-x-auto scrollbar-hide">
              <Link href="/">
                <Tab
                  id="summary"
                  label="Summary"
                  icon="LayoutDashboard"
                  isActive={activeTab === 'summary'}
                  onClick={() => {}}
                />
              </Link>
              {visibleCategories.map(category => (
                <Link key={category.id} href={`/portfolio/${category.id}`}>
                  <Tab
                    id={category.id}
                    label={category.name}
                    icon={category.icon}
                    isActive={activeTab === category.id}
                    onClick={() => {}}
                  />
                </Link>
              ))}
            </div>

            {hiddenCategories.length > 0 && (
              <div className="relative ml-1">
                <button
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-lg
                    transition-colors duration-200
                    ${isMoreMenuOpen ? 'bg-primary/20 text-primary' : 'text-base-content/70 hover:bg-primary/10'}
                  `}
                  onClick={e => {
                    e.stopPropagation();
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {/* Backdrop */}
                {isMoreMenuOpen && (
                  <div
                    className="fixed inset-0 bg-black/20 z-20"
                    onClick={() => setIsMoreMenuOpen(false)}
                  />
                )}

                {/* Dropdown menu */}
                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-base-200 rounded-lg shadow-lg border border-primary/10 py-1 z-30 min-w-[160px]">
                    {hiddenCategories.map(category => (
                      <Link
                        key={category.id}
                        href={`/portfolio/${category.id}`}
                        className={`
                          flex items-center gap-2 w-full px-4 py-2.5 text-sm
                          ${activeTab === category.id ? 'bg-primary/20 text-primary' : 'text-base-content/70'}
                          hover:bg-primary/10
                        `}
                        onClick={() => setIsMoreMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
