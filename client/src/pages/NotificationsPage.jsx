import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiRequest } from '../services/api';

export function NotificationsPage() {
  const { i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await apiRequest('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    } catch (_) {}
  };

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 pb-20 sm:pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-body text-ink-muted mt-1 font-sans">
            Real-time updates on your scholarship applications, verification findings, and sanction orders.
          </p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <Button variant="secondary" size="dense" onClick={handleMarkAllRead}>
            <Check size={16} className="mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <div className="border border-line rounded bg-surface divide-y divide-line">
        {loading ? (
          <div className="p-8 text-center text-small text-ink-muted">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-small text-ink-muted">No notifications recorded yet.</div>
        ) : (
          notifications.map((n) => {
            const isRead = Boolean(n.readAt);
            const message = i18n.language === 'hi' && n.messageHi ? n.messageHi : n.message;
            const formattedDate = new Date(n.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={n._id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  !isRead ? 'bg-navy-50/50' : 'hover:bg-paper'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-semibold text-ink">{n.title}</span>
                    <Badge status={n.type === 'DEFICIENCY' ? 'FLAGGED' : 'VERIFIED'} label={n.type.replace(/_/g, ' ')} />
                    {!isRead && (
                      <span className="w-2 h-2 bg-saffron-700 rounded-none inline-block" title="Unread" />
                    )}
                  </div>
                  <p className="text-small text-ink-muted leading-relaxed">{message}</p>
                  <span className="text-caption text-ink-subtle block font-mono">{formattedDate}</span>
                </div>

                {!isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(n._id)}
                    className="text-caption text-navy-600 hover:underline flex-shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
