import React, { useState, useEffect } from 'react';
import { 
  Page, 
  UserRole, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRecord, 
  PerformanceReview, 
  ScheduledMeeting, 
  SystemNotification, 
  CurrentUser 
} from './types';
import { 
  INITIAL_CURRENT_USER, 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVES, 
  INITIAL_PAYROLLS, 
  INITIAL_PERFORMANCE, 
  INITIAL_MEETINGS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';
import {
  fetchAllInitialData,
  authApi,
  employeesApi,
  attendanceApi,
  leavesApi,
  payrollApi,
  performanceApi,
  meetingsApi,
  notificationsApi,
} from './services/api';

// A notification is visible to a signed-in user if: it's addressed to them
// personally (recipientEmployeeId matches), or it has no personal recipient
// and its audience allows their role ('management' = admin/hr/manager only,
// 'all'/unset = everyone). This is the single source of truth for "who sees
// what" so the notifications page, bell dropdown, and unread badge never
// drift out of sync with each other.
function isNotificationVisible(
  n: SystemNotification,
  user: CurrentUser,
  role: UserRole
): boolean {
  if (n.recipientEmployeeId) return n.recipientEmployeeId === user.employeeId;
  if (n.audience === 'management') return role !== 'employee';
  return true;
}

import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LogoutModal } from './components/LogoutModal';
import { SearchModal } from './components/SearchModal';

import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';
import { AddEmployeePage } from './pages/AddEmployeePage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { AttendancePage } from './pages/AttendancePage';
import { LeaveManagementPage } from './pages/LeaveManagementPage';
import { PayrollPage } from './pages/PayrollPage';
import { PerformancePage } from './pages/PerformancePage';
import { MeetingsPage } from './pages/MeetingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('admin-dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(INITIAL_CURRENT_USER);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Data Collections (start with local mock data so the UI renders instantly;
  // replaced with live data from the Flask backend as soon as it responds)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(INITIAL_PAYROLLS);
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_PERFORMANCE);
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(INITIAL_MEETINGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Selected state for single employee details/edit
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);

  // Backend connection status, surfaced in Settings / a small badge if needed
  const [backendConnected, setBackendConnected] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const hydrated = React.useRef(false);

  // Login state — each role is a real, separate backend account now, so a
  // sign-in failure needs to be shown rather than silently papered over.
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ---------------------------------------------------------------------
  // Load live data from the Flask API on first mount. If the backend isn't
  // reachable (e.g. it hasn't been started yet) we silently keep using the
  // bundled mock data so the app still works standalone.
  // ---------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllInitialData();
        if (cancelled) return;
        if (data.employees.length) setEmployees(data.employees);
        setAttendance(data.attendance);
        setLeaves(data.leaves);
        setPayrolls(data.payrolls);
        setReviews(data.performance);
        setMeetings(data.meetings);
        setNotifications(data.notifications);
        if (data.employees.length) setSelectedEmployee(data.employees[0]);
        setBackendConnected(true);
      } catch (err) {
        console.warn('Backend unreachable, falling back to local mock data.', err);
        setBackendConnected(false);
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
          // allow sync effects to run from now on
          setTimeout(() => { hydrated.current = true; }, 0);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---------------------------------------------------------------------
  // Two-way sync: whenever a data collection changes locally (an employee
  // is added, a leave is approved, attendance is marked, etc.) push the
  // whole collection back to the backend so it's persisted. This covers
  // every mutation already implemented across the page components without
  // needing to touch each of them individually.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    employeesApi.sync(employees).catch((e) => console.warn('Sync employees failed', e));
  }, [employees]);

  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    attendanceApi.sync(attendance).catch((e) => console.warn('Sync attendance failed', e));
  }, [attendance]);

  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    leavesApi.sync(leaves).catch((e) => console.warn('Sync leaves failed', e));
  }, [leaves]);

  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    payrollApi.sync(payrolls).catch((e) => console.warn('Sync payroll failed', e));
  }, [payrolls]);

  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    performanceApi.sync(reviews).catch((e) => console.warn('Sync performance failed', e));
  }, [reviews]);

  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    meetingsApi.sync(meetings).catch((e) => console.warn('Sync meetings failed', e));
  }, [meetings]);

  useEffect(() => {
    if (!hydrated.current || !backendConnected) return;
    notificationsApi.sync(notifications).catch((e) => console.warn('Sync notifications failed', e));
  }, [notifications]);

  // Employees can reach their own dashboard, attendance/leave/payroll/
  // performance/meetings, notifications and settings — but not the
  // company-wide employee directory or analytics. Redirect if a stale page
  // reference (e.g. from a previous admin session) would leak that view.
  const EMPLOYEE_RESTRICTED_PAGES: Page[] = ['employees', 'add-employee', 'employee-profile', 'reports'];
  useEffect(() => {
    if (userRole === 'employee' && EMPLOYEE_RESTRICTED_PAGES.includes(currentPage)) {
      setCurrentPage('employee-dashboard');
    }
  }, [userRole, currentPage]);

  // Dark Mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Every login is a real authentication check against the database — there
  // is no local "pretend to be logged in" fallback. If it fails, the person
  // sees the real reason (wrong password, account inactive, server
  // unreachable, etc.) rather than silently landing on a stand-in account.
  const handleLogin = async (email: string, password: string, role: UserRole) => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const { user } = await authApi.login(email, password, role);
      setCurrentUser(user);
      setUserRole(user.role);
      setCurrentPage(user.role === 'employee' ? 'employee-dashboard' : 'admin-dashboard');
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Could not reach the server. Please check your connection and try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    setCurrentPage('login');
  };

  // `password` (if provided from the Add/Edit Employee form) is never kept
  // in the `employees` state array — it's sent straight to the backend so
  // it gets hashed immediately and can't linger as plaintext in memory or
  // get re-sent (and silently re-applied) on some later, unrelated sync.
  const handleAddOrUpdateEmployee = async (newEmpWithPassword: Employee & { password?: string }) => {
    const { password, ...newEmp } = newEmpWithPassword;
    const exists = employees.some((e) => e.id === newEmp.id);

    if (backendConnected && password) {
      try {
        if (exists) {
          await employeesApi.update(newEmp.id, { password } as Partial<Employee>);
        } else {
          // Create directly (rather than waiting for the bulk-sync effect)
          // so the password is hashed and stored right away.
          await employeesApi.create({ ...newEmp, password } as Partial<Employee>);
        }
      } catch (e) {
        console.warn('Failed to set employee password', e);
      }
    }

    if (exists) {
      setEmployees(employees.map((e) => (e.id === newEmp.id ? newEmp : e)));
    } else {
      setEmployees([newEmp, ...employees]);
    }
    setSelectedEmployee(newEmp);
  };

  // Notifications, scoped to whoever is signed in right now — this is what
  // every part of the UI (bell badge, dropdown, notifications page) reads
  // from, so no one ever sees another employee's personal notifications.
  const visibleNotifications = notifications.filter((n) =>
    isNotificationVisible(n, currentUser, userRole)
  );
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications(
      notifications.map((n) =>
        isNotificationVisible(n, currentUser, userRole) ? { ...n, read: true } : n
      )
    );
  };

  const handleClearMyNotifications = () => {
    setNotifications(notifications.filter((n) => !isNotificationVisible(n, currentUser, userRole)));
  };

  // Pushes a new personal notification for one employee — used when a
  // leave request (or other personal-facing event) is actioned, so the
  // affected employee's bell/badge/notifications page updates immediately
  // instead of only the actor (admin/HR/manager) seeing the change.
  const notifyEmployee = (
    employeeId: string,
    notification: Omit<SystemNotification, 'id' | 'recipientEmployeeId' | 'timestamp' | 'read'>
  ) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        recipientEmployeeId: employeeId,
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} loginError={loginError} isLoggingIn={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        userRole={userRole}
        unreadCount={unreadCount}
        pendingLeavesCount={pendingLeavesCount}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />

      {/* Top Navbar */}
      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        currentUser={currentUser}
        userRole={userRole}
        notifications={visibleNotifications}
        onOpenSearch={() => setSearchModalOpen(true)}
        setCurrentPage={setCurrentPage}
        onOpenLogout={() => setLogoutModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Page Content Body */}
      <main
        className={`transition-all duration-300 pb-12 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            employees={employees}
            attendance={attendance}
            leaves={leaves}
            meetings={meetings}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'employee-dashboard' && (
          <EmployeeDashboard
            currentUser={currentUser}
            leaves={leaves}
            meetings={meetings}
            payrolls={payrolls}
            attendance={attendance}
            setAttendance={setAttendance}
            backendConnected={backendConnected}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'employees' && (
          <EmployeeManagementPage
            employees={employees}
            setEmployees={setEmployees}
            setCurrentPage={setCurrentPage}
            onSelectEmployee={setSelectedEmployee}
          />
        )}

        {currentPage === 'add-employee' && (
          <AddEmployeePage
            onAddEmployee={handleAddOrUpdateEmployee}
            setCurrentPage={setCurrentPage}
            editingEmployee={selectedEmployee}
          />
        )}

        {currentPage === 'employee-profile' && (
          <EmployeeProfilePage
            employee={selectedEmployee}
            attendance={attendance}
            leaves={leaves}
            setCurrentPage={setCurrentPage}
            onEditEmployee={setSelectedEmployee}
          />
        )}

        {currentPage === 'attendance' && (
          <AttendancePage
            attendance={attendance}
            setAttendance={setAttendance}
            currentUser={currentUser}
            userRole={userRole}
          />
        )}

        {currentPage === 'leave' && (
          <LeaveManagementPage
            leaves={leaves}
            setLeaves={setLeaves}
            currentUser={currentUser}
            userRole={userRole}
            onNotifyEmployee={notifyEmployee}
          />
        )}

        {currentPage === 'payroll' && (
          <PayrollPage
            payrolls={payrolls}
            setPayrolls={setPayrolls}
            currentUser={currentUser}
            userRole={userRole}
          />
        )}

        {currentPage === 'performance' && (
          <PerformancePage
            reviews={reviews}
            setReviews={setReviews}
            currentUser={currentUser}
            userRole={userRole}
          />
        )}

        {currentPage === 'meetings' && (
          <MeetingsPage
            meetings={meetings}
            setMeetings={setMeetings}
            currentUser={currentUser}
            userRole={userRole}
          />
        )}

        {currentPage === 'reports' && (
          <ReportsPage
            employees={employees}
            leaves={leaves}
            payrolls={payrolls}
          />
        )}

        {currentPage === 'notifications' && (
          <NotificationsPage
            notifications={visibleNotifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onClearAll={handleClearMyNotifications}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setEmployees={setEmployees}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            backendConnected={backendConnected}
          />
        )}
      </main>

      {/* Command Palette Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        employees={employees}
        leaves={leaves}
        setCurrentPage={setCurrentPage}
        onSelectEmployee={setSelectedEmployee}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
