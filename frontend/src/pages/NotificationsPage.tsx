import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  CalendarOff, 
  CreditCard, 
  Video, 
  Award, 
  Check,
  ArrowRight
} from 'lucide-react';
import { Page, SystemNotification } from '../types';

interface NotificationsPageProps {
  // Already scoped to the signed-in user (personal notices + whatever
  // company-wide/management announcements apply to their role) — this page
  // never sees, marks, or clears anyone else's notifications.
  notifications: SystemNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  setCurrentPage: (page: Page) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkAllRead,
  onClearAll,
  setCurrentPage,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = notifications.filter(
    (n) => filterCategory === 'all' || n.category === filterCategory
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notification Alerts Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System updates, leave requests requiring approval, and meeting notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-blue-600" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={onClearAll}
            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'leave', 'payroll', 'meeting', 'performance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-bold capitalize transition-all ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No notifications available in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/50 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{n.description}</p>
                <span className="text-[10px] text-slate-400 font-mono block pt-1">{n.timestamp}</span>
              </div>

              {n.linkToPage && (
                <button
                  onClick={() => setCurrentPage(n.linkToPage!)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
