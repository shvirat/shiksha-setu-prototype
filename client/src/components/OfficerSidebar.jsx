import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tray, ChartBar, Compass, BookOpen, SignOut } from '@phosphor-icons/react';
import { BrandMark } from '../ui/BrandMark';
import { useAuth } from '../context/AuthContext';

export function OfficerSidebar() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/officer/queue', label: t('nav.queue'), icon: Tray },
    { to: '/officer/coverage-gaps', label: t('nav.coverageGaps'), icon: Compass },
    { to: '/officer/analytics', label: t('nav.analytics'), icon: ChartBar },
    { to: '/styleguide', label: t('nav.styleguide'), icon: BookOpen }
  ];

  return (
    <aside className="w-[232px] bg-navy-700 text-white flex flex-col justify-between flex-shrink-0 min-h-screen">
      {/* Brand & Section Header */}
      <div>
        <div className="p-5 border-b border-navy-600">
          <BrandMark light={true} />
          <span className="text-caption text-navy-100 block mt-1 uppercase tracking-wider font-semibold">
            Officer Portal
          </span>
          <span className="text-caption text-navy-100 truncate block mt-0.5 font-mono">
            {user?.email}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded text-small font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-900 text-white font-semibold'
                    : 'text-navy-100 hover:bg-navy-600 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-navy-600">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-small text-navy-100 hover:text-white hover:bg-navy-600 rounded transition-colors text-left"
        >
          <SignOut size={18} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
