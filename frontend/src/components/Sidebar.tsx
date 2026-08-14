import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarOff, 
  CreditCard, 
  Award, 
  BarChart3, 
  Video, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  UserCheck
} from 'lucide-react';
import { Page, UserRole } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userRole: UserRole;
  unreadCount: number;
  pendingLeavesCount: number;
  onOpenLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  collapsed,
  setCollapsed,
  userRole,
  unreadCount,
  pendingLeavesCount,
  onOpenLogout,
}) => {
  const dashboardPage: Page = userRole === 'employee' ? 'employee-dashboard' : 'admin-dashboard';
  const isEmployee = userRole === 'employee';

  // Employees get their own personal-record labels and lose the
  // company-wide directory/analytics pages; admin, HR, and managers keep
  // the full management view. This is what actually keeps each role's view
  // separate, rather than a toggle anyone could flip.
  const navItems = [
    {
      id: dashboardPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    ...(!isEmployee
      ? [
          {
            id: 'employees' as Page,
            label: 'Employees',
            icon: Users,
            badge: null,
          },
        ]
      : []),
    {
      id: 'attendance' as Page,
      label: isEmployee ? 'My Attendance' : 'Attendance',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'leave' as Page,
      label: isEmployee ? 'My Leave' : 'Leave Requests',
      icon: CalendarOff,
      badge: !isEmployee && pendingLeavesCount > 0 ? pendingLeavesCount : null,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'payroll' as Page,
      label: isEmployee ? 'My Payroll' : 'Payroll',
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'performance' as Page,
      label: isEmployee ? 'My Performance' : 'Performance',
      icon: Award,
      badge: null,
    },
    ...(!isEmployee
      ? [
          {
            id: 'reports' as Page,
            label: 'Reports & Analytics',
            icon: BarChart3,
            badge: null,
          },
        ]
      : []),
    {
      id: 'meetings' as Page,
      label: 'Meetings',
      icon: Video,
      badge: null,
    },
    {
      id: 'notifications' as Page,
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'settings' as Page,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-[#0F172A] text-slate-200 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white tracking-tight truncate text-base leading-tight">
                ABC Tech
              </span>
              <span className="text-[11px] text-slate-400 truncate font-medium">
                Enterprise EMS
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="capitalize font-medium">{userRole} Mode</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPage === item.id ||
            (item.id === 'admin-dashboard' && currentPage === 'employee-dashboard') ||
            (item.id === 'employee-dashboard' && currentPage === 'admin-dashboard') ||
            (item.id === 'employees' && (currentPage === 'add-employee' || currentPage === 'employee-profile'));

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`}
              />

              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {/* Badge Count */}
              {item.badge !== null && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm shrink-0 ${
                    item.badgeColor || 'bg-blue-600'
                  } ${collapsed ? 'absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px]' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onOpenLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign out of system"
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-400" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
