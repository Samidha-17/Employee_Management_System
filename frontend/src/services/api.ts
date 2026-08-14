import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  PerformanceReview,
  ScheduledMeeting,
  SystemNotification,
  UserRole,
  CurrentUser,
} from '../types';

// Base URL of the Flask backend. Configure with VITE_API_URL in a .env file
// (see .env.example). Defaults to localhost:5000 for local development.
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Generic resource helpers
// ---------------------------------------------------------------------------

function resource<T>(path: string) {
  return {
    list: () => request<T[]>(`/api/${path}`),
    create: (item: Partial<T>) =>
      request<T>(`/api/${path}`, { method: 'POST', body: JSON.stringify(item) }),
    update: (id: string, item: Partial<T>) =>
      request<T>(`/api/${path}/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
    remove: (id: string) => request(`/api/${path}/${id}`, { method: 'DELETE' }),
    // Bulk replace: syncs the entire collection to match the given array.
    // Used so the existing frontend state-array pattern (setX(fullArray))
    // can transparently persist to the backend without rewriting every page.
    sync: (items: T[]) =>
      request<T[]>(`/api/${path}`, { method: 'PUT', body: JSON.stringify(items) }),
  };
}

export const employeesApi = resource<Employee>('employees');
export const attendanceApi = resource<AttendanceRecord>('attendance');
export const leavesApi = resource<LeaveRequest>('leaves');
export const payrollApi = resource<PayrollRecord>('payroll');
export const performanceApi = resource<PerformanceReview>('performance');
export const meetingsApi = resource<ScheduledMeeting>('meetings');
export const notificationsApi = resource<SystemNotification>('notifications');

// ---------------------------------------------------------------------------
// Extra endpoints
// ---------------------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string, role: UserRole) =>
    request<{ token: string; user: CurrentUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  changePassword: (employeeId: string, currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ employeeId, currentPassword, newPassword }),
    }),
  forgotPassword: (email: string, employeeId: string, newPassword: string) =>
    request<{ success: boolean }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, employeeId, newPassword }),
    }),
};

// Dedicated single-record check-in/check-out endpoints. Preferred over
// pushing a locally-mutated attendance array through attendanceApi.sync()
// for this specific action, since two people punching at the same moment
// can never race or clobber each other this way.
export const attendanceActionsApi = {
  checkIn: (employeeId: string) =>
    request<AttendanceRecord>('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
  checkOut: (employeeId: string) =>
    request<AttendanceRecord>('/api/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
};

export const dashboardApi = {
  stats: () =>
    request<{
      totalEmployees: number;
      activeEmployees: number;
      onLeave: number;
      pendingLeaves: number;
      presentToday: number;
      upcomingMeetings: number;
      departmentCounts: Record<string, number>;
    }>('/api/dashboard/stats'),
};

export const leaveActionsApi = {
  approve: (id: string, managerApproval?: string, managerComments?: string) =>
    request<LeaveRequest>(`/api/leaves/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ managerApproval, managerComments }),
    }),
  reject: (id: string, managerApproval?: string, managerComments?: string) =>
    request<LeaveRequest>(`/api/leaves/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ managerApproval, managerComments }),
    }),
};

export const payrollActionsApi = {
  markPaid: (id: string, paymentDate?: string) =>
    request<PayrollRecord>(`/api/payroll/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({ paymentDate }),
    }),
};

export const notificationActionsApi = {
  markAllRead: () =>
    request<SystemNotification[]>('/api/notifications/mark-all-read', { method: 'POST' }),
  clearAll: () =>
    request<SystemNotification[]>('/api/notifications/clear-all', { method: 'POST' }),
};

export const uploadApi = {
  photo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return { url: `${API_BASE_URL}${data.url}` };
  },
};

export async function fetchAllInitialData() {
  const [employees, attendance, leaves, payrolls, performance, meetings, notifications] =
    await Promise.all([
      employeesApi.list(),
      attendanceApi.list(),
      leavesApi.list(),
      payrollApi.list(),
      performanceApi.list(),
      meetingsApi.list(),
      notificationsApi.list(),
    ]);
  return { employees, attendance, leaves, payrolls, performance, meetings, notifications };
}
