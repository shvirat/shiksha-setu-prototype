import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { House, ListDashes, Folder, ChatCircleText } from '@phosphor-icons/react';

export function StudentNav({ onOpenJagoMobile }) {
  const { t } = useTranslation();

  const links = [
    { to: '/', label: t('nav.home'), icon: House },
    { to: '/schemes', label: t('nav.schemes'), icon: ListDashes },
    { to: '/wallet', label: t('nav.documents'), icon: Folder },
    { to: '/jago', label: t('nav.askJago'), icon: ChatCircleText }
  ];

  return (
    <>
      {/* Desktop Horizontal Nav */}
      <nav className="hidden sm:block border-b border-line bg-surface px-6">
        <div className="max-w-[1040px] mx-auto flex items-center space-x-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `py-3 text-small font-medium transition-colors border-b-2 flex items-center gap-1.5 focus-visible:outline-navy-600 ${
                  isActive
                    ? 'border-navy-700 text-navy-700 font-semibold'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`
              }
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-line z-30 flex items-stretch h-14">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center relative text-caption transition-colors ${
                isActive
                  ? 'text-navy-700 font-bold border-t-2 border-navy-700 -mt-[1px]'
                  : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            <link.icon size={20} />
            <span className="text-[11px] leading-tight mt-0.5">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
