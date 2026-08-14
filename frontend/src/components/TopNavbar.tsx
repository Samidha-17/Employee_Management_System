import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  LogOut,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { CurrentUser, Page, SystemNotification, UserRole } from '../types';

interface TopNavbarProps {
  sidebarCollapsed: boolean;
  currentUser: CurrentUser;
  userRole: UserRole;
  notifications: SystemNotification[];
  onOpenSearch: () => void;
  setCurrentPage: (page: Page) => void;
  onOpenLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  sidebarCollapsed,
  currentUser,
  userRole,
  notifications,
  onOpenSearch,
  setCurrentPage,
  onOpenLogout,
  darkMode,
  setDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-sm flex items-center justify-between px-6 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      {/* Search Input Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-all text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-inner group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-slate-400 dark:text-slate-400 font-medium text-xs sm:text-sm">
            Search employees, leaves, reports...
          </span>
          <kbd className="ml-auto hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Date and Clock Display */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{currentTime}</span>
        </div>

        {/* Signed-in-as Badge — read only. Roles no longer switch on the fly;
            each one is a separate account, so changing view means logging
            out and signing back in as that account. */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          {userRole} View
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Messages Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="HR Messages & Announcements"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  HR Announcements
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="py-3 space-y-3">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
                  <p className="font-semibold text-blue-900 dark:text-blue-300">Quarterly Town Hall Scheduled</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">Join the all-hands meeting on Thursday at 3 PM IST to review H1 milestones.</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">HR Desk • 1 hour ago</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">New Health Insurance Benefit</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Check out the updated dental & vision claim policy under Employee Profile.</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">Benefits Team • Yesterday</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full min-w-[18px] text-center shadow-xs">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  System Notifications ({notifications.length})
                </span>
                <button
                  onClick={() => setCurrentPage('notifications')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="py-2 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.linkToPage) setCurrentPage(n.linkToPage);
                      setShowNotifications(false);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      !n.read
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40'
                        : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowMessages(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <img
              src={currentUser.photo}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {currentUser.designation}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200/50 dark:border-blue-800/50">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{userRole.toUpperCase()} Privilege</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentPage('employee-profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span>Account Settings</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
