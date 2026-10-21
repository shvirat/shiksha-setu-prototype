import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, ChatCircleText, SignOut, User } from '@phosphor-icons/react';
import { BrandMark } from '../ui/BrandMark';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export function TopBar({ onToggleJago }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      try {
        const res = await apiRequest('/notifications');
        setUnreadCount(res.data.unreadCount || 0);
      } catch (_) {}
    }
    loadNotifications();
  }, [user]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-surface border-b border-line px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand */}
      <Link to="/" className="focus-visible:outline-navy-600">
        <BrandMark />
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language Toggle: EN | हिं */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-8 px-2.5 rounded border border-line-strong text-caption font-medium hover:bg-paper transition-colors focus-visible:outline-navy-600"
          aria-label="Toggle between English and Hindi"
        >
          {i18n.language === 'hi' ? 'English (EN)' : 'हिन्दी (हिं)'}
        </button>

        {user && (
          <>
            {/* Ask JAGO Drawer Trigger (Desktop) */}
            <button
              type="button"
              onClick={onToggleJago}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded border border-navy-700 text-navy-700 hover:bg-navy-50 text-small font-medium transition-colors focus-visible:outline-navy-600"
            >
              <ChatCircleText size={18} />
              <span>{t('nav.askJago')}</span>
            </button>

            {/* Notifications Bell with Numeric Badge (Never a dot) */}
            <Link
              to="/notifications"
              className="relative p-1.5 text-ink-muted hover:text-ink focus-visible:outline-navy-600"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-navy-700 text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile (Student) */}
            {user.role === 'student' && (
              <Link
                to="/profile"
                title={t('nav.profile')}
                className="p-1.5 text-ink-muted hover:text-navy-700 focus-visible:outline-navy-600"
              >
                <User size={20} />
              </Link>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title={t('nav.logout')}
              className="p-1.5 text-ink-muted hover:text-danger-700 focus-visible:outline-navy-600"
            >
              <SignOut size={20} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
