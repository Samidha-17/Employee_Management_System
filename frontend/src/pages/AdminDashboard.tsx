import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  CalendarOff, 
  CreditCard, 
  Video, 
  UserPlus, 
  Award,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import { Employee, AttendanceRecord, LeaveRequest, Page, ScheduledMeeting } from '../types';

interface AdminDashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  meetings: ScheduledMeeting[];
  setCurrentPage: (page: Page) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  attendance,
  leaves,
  meetings,
  setCurrentPage,
}) => {
  // Calculated Executive Stats
  const totalEmployees = employees.length;
  const presentToday = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const absentToday = attendance.filter((a) => a.status === 'Absent').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const upcomingMeetings = meetings.filter((m) => m.status === 'Scheduled').length;
  const newEmployeesThisMonth = employees.filter((e) => new Date(e.joiningDate).getFullYear() >= 2023).length;
  const avgPerformance = (
    employees.reduce((sum, e) => sum + e.performanceRating, 0) / (totalEmployees || 1)
  ).toFixed(1);

  // Chart Data
  const attendanceTrendData = [
    { day: 'Mon', present: 92, absent: 5, late: 3 },
    { day: 'Tue', present: 95, absent: 3, late: 2 },
    { day: 'Wed', present: 90, absent: 6, late: 4 },
    { day: 'Thu', present: 96, absent: 2, late: 2 },
    { day: 'Fri', present: 88, absent: 8, late: 4 },
  ];

  const deptDistributionData = [
    { name: 'Engineering', value: employees.filter(e => e.department === 'Engineering').length, color: '#2563EB' },
    { name: 'Human Resources', value: employees.filter(e => e.department === 'Human Resources').length, color: '#10B981' },
    { name: 'Marketing', value: employees.filter(e => e.department === 'Marketing').length, color: '#F59E0B' },
    { name: 'Finance', value: employees.filter(e => e.department === 'Finance').length, color: '#8B5CF6' },
    { name: 'Sales', value: employees.filter(e => e.department === 'Sales').length, color: '#EC4899' },
    { name: 'Design', value: employees.filter(e => e.department === 'Design').length, color: '#06B6D4' },
  ];

  const payrollDeptData = [
    { dept: 'Engineering', amount: 840000 },
    { dept: 'Finance', amount: 380000 },
    { dept: 'HR', amount: 310000 },
    { dept: 'Sales', amount: 290000 },
    { dept: 'Design', amount: 260000 },
  ];

  const performanceTrendData = [
    { month: 'Mar', rating: 4.3 },
    { month: 'Apr', rating: 4.4 },
    { month: 'May', rating: 4.6 },
    { month: 'Jun', rating: 4.7 },
    { month: 'Jul', rating: 4.8 },
  ];

  const kpiCards = [
    {
      title: 'Total Employees',
      value: totalEmployees.toString(),
      trend: '+12%',
      trendUp: true,
      subtext: 'vs last quarter',
      icon: Users,
      bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      action: () => setCurrentPage('employees'),
    },
    {
      title: 'Present Today',
      value: presentToday.toString(),
      trend: '+94.2%',
      trendUp: true,
      subtext: 'turnout rate',
      icon: UserCheck,
      bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      action: () => setCurrentPage('attendance'),
    },
    {
      title: 'Absent Today',
      value: absentToday.toString(),
      trend: '-2.1%',
      trendUp: false,
      subtext: 'unscheduled absence',
      icon: UserX,
      bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      action: () => setCurrentPage('attendance'),
    },
    {
      title: 'Pending Leaves',
      value: pendingLeaves.toString(),
      trend: '3 Need Action',
      trendUp: false,
      subtext: 'manager queue',
      icon: CalendarOff,
      bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      action: () => setCurrentPage('leave'),
    },
    {
      title: 'Monthly Payroll',
      value: `₹${(totalPayroll / 100000).toFixed(2)}L`,
      trend: '+4.5%',
      trendUp: true,
      subtext: 'disbursed on time',
      icon: CreditCard,
      bgColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      action: () => setCurrentPage('payroll'),
    },
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings.toString(),
      trend: 'Today',
      trendUp: true,
      subtext: '3 board sessions',
      icon: Video,
      bgColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      action: () => setCurrentPage('meetings'),
    },
    {
      title: 'New Employees',
      value: newEmployeesThisMonth.toString(),
      trend: '+4 this month',
      trendUp: true,
      subtext: 'onboarding completed',
      icon: UserPlus,
      bgColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      action: () => setCurrentPage('add-employee'),
    },
    {
      title: 'Avg Performance',
      value: `${avgPerformance} / 5`,
      trend: 'Exceeds Target',
      trendUp: true,
      subtext: 'Q2 enterprise review',
      icon: Award,
      bgColor: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
      action: () => setCurrentPage('performance'),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 lg:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" /> Executive Control Center
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            ABC Technologies Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time workforce intelligence, attendance tracking, monthly payroll metrics, and team performance indicators.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setCurrentPage('add-employee')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
          <button
            onClick={() => setCurrentPage('reports')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <span>Generate Report</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-2xl ${card.bgColor} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {card.trendUp ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-amber-500" />
                  )}
                  <span>{card.trend}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {card.title}
                </span>
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualizer Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Attendance Flow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Present vs Late vs Absent ratios across departments</p>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/50">
              This Week
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="present" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#presentGrad)" name="Present (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Department Headcount</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of 10 enterprise teams</p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deptDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {deptDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Payroll Breakdown + Recent Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payroll Expenses Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payroll Budget Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total monthly expenditure per department</p>
            </div>
            <button
              onClick={() => setCurrentPage('payroll')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Payroll Hub <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollDeptData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="dept" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${(Number(val) / 1000).toFixed(0)}K`, 'Salary Expenditure']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals & Activity Stream */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Action Required</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {pendingLeaves} Pending
              </span>
            </div>

            <div className="space-y-3">
              {leaves.slice(0, 3).map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={leave.employeePhoto}
                      alt={leave.employeeName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {leave.employeeName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {leave.leaveType} • {leave.days} Day(s)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentPage('leave')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">System Status: All Services Operational</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              ● Healthy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
