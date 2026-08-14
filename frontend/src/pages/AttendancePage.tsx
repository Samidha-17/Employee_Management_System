import React, { useState } from 'react';
import { 
  CalendarCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AttendanceRecord, CurrentUser, UserRole } from '../types';

interface AttendancePageProps {
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  currentUser?: CurrentUser;
  userRole?: UserRole;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ attendance, setAttendance, currentUser, userRole }) => {
  const [selectedDate, setSelectedDate] = useState('2026-08-04');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isEmployee = userRole === 'employee';
  // Employees only ever see their own attendance log — every count, chart,
  // and row below is derived from this scoped set, not the company-wide one.
  const scopedAttendance = isEmployee && currentUser
    ? attendance.filter((a) => a.employeeId === currentUser.employeeId)
    : attendance;

  const presentCount = scopedAttendance.filter((a) => a.status === 'Present').length;
  const lateCount = scopedAttendance.filter((a) => a.status === 'Late').length;
  const absentCount = scopedAttendance.filter((a) => a.status === 'Absent').length;
  const leaveCount = scopedAttendance.filter((a) => a.status === 'On Leave').length;

  const filteredLogs = scopedAttendance.filter((a) => {
    const matchesQuery =
      a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const weeklyAttendanceChart = [
    { day: 'Mon', present: 8, late: 1, absent: 1 },
    { day: 'Tue', present: 9, late: 1, absent: 0 },
    { day: 'Wed', present: 7, late: 2, absent: 1 },
    { day: 'Thu', present: 8, late: 1, absent: 1 },
    { day: 'Fri', present: 9, late: 0, absent: 1 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            {isEmployee ? 'My Attendance' : 'Attendance Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee
              ? 'Your shift clockings, late arrivals, and monthly attendance charts.'
              : 'Real-time shift clockings, late arrival tracking, and monthly attendance charts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Present Today</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
              {presentCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Late Arrivals</span>
            <span className="text-2xl font-extrabold text-amber-500 block mt-1">
              {lateCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Absent Today</span>
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 block mt-1">
              {absentCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Approved Leave</span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 block mt-1">
              {leaveCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Attendance Volume Breakdown</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAttendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="present" name="Present" fill="#22C55E" radius={[6, 6, 0, 0]} />
              <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Attendance Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Shift Punch Logs ({selectedDate})</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Date</th>
                <th className="p-3">Check In</th>
                <th className="p-3">Check Out</th>
                <th className="p-3">Total Work Hours</th>
                <th className="p-3">Status Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={log.photo} alt={log.employeeName} className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{log.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{log.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{log.date}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.checkIn}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.checkOut}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{log.totalHours} hrs</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        log.status === 'Present'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : log.status === 'Late'
                          ? 'bg-amber-500/10 text-amber-600'
                          : log.status === 'On Leave'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      ● {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
