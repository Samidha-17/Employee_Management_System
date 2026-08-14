export type Page = 
  | 'login'
  | 'admin-dashboard'
  | 'employee-dashboard'
  | 'employees'
  | 'add-employee'
  | 'employee-profile'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'reports'
  | 'meetings'
  | 'notifications'
  | 'settings';

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: 'Engineering' | 'Human Resources' | 'Marketing' | 'Finance' | 'Sales' | 'Design' | 'Operations';
  designation: string;
  joiningDate: string;
  salary: number;
  bankAccount: string;
  pfNumber: string;
  photo: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Probation';
  performanceRating: number; // 1 to 5
  manager: string;
  location: string;
  skills: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  photo: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Half Day';
  totalHours: number;
  overtimeHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  department: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
  managerApproval?: string;
  managerComments?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  designation: string;
  department: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: {
    hra: number;
    conveyance: number;
    special: number;
    medical: number;
  };
  deductions: {
    pf: number;
    tax: number;
    healthInsurance: number;
  };
  bonus: number;
  netSalary: number;
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  bankName: string;
  accountNumber: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  department: string;
  designation: string;
  reviewPeriod: string;
  overallRating: number;
  kpiScore: number;
  goalsCompleted: number;
  totalGoals: number;
  strengths: string[];
  improvements: string[];
  managerFeedback: string;
  lastReviewDate: string;
  status: 'Completed' | 'Pending Review' | 'Draft';
}

export interface ScheduledMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingLink: string;
  organizerName: string;
  organizerPhoto: string;
  participants: { name: string; photo: string; email: string }[];
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  category: 'Department Sync' | '1-on-1' | 'All Hands' | 'Interview' | 'Client Meeting';
  description: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  category: 'leave' | 'payroll' | 'meeting' | 'system' | 'performance';
  linkToPage?: Page;
  // Who should see this notification. If recipientEmployeeId is set, it's a
  // personal notification meant only for that one employee (e.g. "your leave
  // was approved"). Otherwise `audience` decides: 'management' = admin/HR/
  // manager only, 'all' = everyone signed in (company-wide announcements).
  recipientEmployeeId?: string | null;
  audience?: 'all' | 'management';
}

export interface CurrentUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  photo: string;
  role: UserRole;
  department: string;
  designation: string;
}
