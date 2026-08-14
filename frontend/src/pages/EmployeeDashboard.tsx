import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Award, 
  Video, 
  PlusCircle, 
  Download, 
  Sparkles, 
  TrendingUp,
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { CurrentUser, LeaveRequest, Page, ScheduledMeeting, PayrollRecord, AttendanceRecord } from '../types';
import { attendanceActionsApi } from '../services/api';

interface EmployeeDashboardProps {
  currentUser: CurrentUser;
  leaves: LeaveRequest[];
  meetings: ScheduledMeeting[];
  payrolls: PayrollRecord[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  backendConnected: boolean;
  setCurrentPage: (page: Page) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Parses a "hh:mm AM/PM" checkIn label back into a real Date for today, so
// the live shift timer counts up from the moment the person actually
// punched in rather than from an arbitrary local counter.
function parseTimeToday(label: string): Date | null {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(label || '');
  if (!match) return null;
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  const d = new Date();
  d.setHours(hours, parseInt(match[2], 10), 0, 0);
  return d;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  leaves,
  meetings,
  payrolls,
  attendance,
  setAttendance,
  backendConnected,
  setCurrentPage,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [punching, setPunching] = useState(false);
  const [punchError, setPunchError] = useState<string | null>(null);

  const todayRecord = attendance.find(
    (a) => a.employeeId === currentUser.employeeId && a.date === todayStr()
  );
  const clockedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const shiftDone = !!todayRecord?.checkIn && !!todayRecord?.checkOut;

  useEffect(() => {
    if (!clockedIn || !todayRecord?.checkIn) {
      setElapsedSeconds(0);
      return;
    }
    const start = parseTimeToday(todayRecord.checkIn) || new Date();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [clockedIn, todayRecord?.checkIn]);

  const formatElapsedTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const upsertAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) =>
      prev.some((a) => a.id === record.id) ? prev.map((a) => (a.id === record.id ? record : a)) : [record, ...prev]
    );
  };

  const handlePunch = async () => {
    setPunchError(null);
    setPunching(true);
    try {
      if (backendConnected) {
        const record = clockedIn
          ? await attendanceActionsApi.checkOut(currentUser.employeeId)
          : await attendanceActionsApi.checkIn(currentUser.employeeId);
        upsertAttendance(record);
      } else {
        // Offline/demo fallback — record it into local state (still visible
        // on the Attendance page) instead of silently doing nothing.
        const now = nowLabel();
        if (clockedIn && todayRecord) {
          const started = parseTimeToday(todayRecord.checkIn);
          const hours = started ? (Date.now() - started.getTime()) / 3600000 : 0;
          upsertAttendance({
            ...todayRecord,
            checkOut: now,
            totalHours: Math.round(hours * 100) / 100,
            overtimeHours: Math.round(Math.max(0, hours - 8) * 100) / 100,
          });
        } else {
          upsertAttendance({
            id: todayRecord?.id || `att-local-${Date.now()}`,
            employeeId: currentUser.employeeId,
            employeeName: currentUser.name,
            photo: currentUser.photo,
            date: todayStr(),
            checkIn: now,
            checkOut: '',
            status: 'Present',
            totalHours: 0,
            overtimeHours: 0,
          });
        }
      }
    } catch (err) {
      setPunchError(err instanceof Error ? err.message : 'Failed to record attendance');
    } finally {
      setPunching(false);
    }
  };

  const myLeaves = leaves.filter((l) => l.employeeId === currentUser.employeeId);
  const myMeetings = meetings
    .filter((m) => m.participants.some((p) => p.email === currentUser.email) || m.organizerName === currentUser.name)
    .slice(0, 2);
  const myPayrolls = payrolls.filter((p) => p.employeeId === currentUser.employeeId);
  const myLatestPayroll = myPayrolls[0];

  const leaveBalances = [
    { type: 'Casual Leave', used: 2, total: 12, color: 'bg-blue-600' },
    { type: 'Sick Leave', used: 1, total: 10, color: 'bg-emerald-600' },
    { type: 'Earned Leave', used: 0, total: 15, color: 'bg-indigo-600' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 lg:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <img
            src={currentUser.photo}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-2xl shrink-0"
          />
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" /> Employee Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {currentUser.designation} • {currentUser.department} Department
            </p>
          </div>
        </div>

        {/* Live Attendance Punch Widget */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs text-blue-300 font-medium">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Shift Timer (09:00 AM - 06:00 PM)</span>
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-white font-mono mt-0.5">
              {formatElapsedTime(elapsedSeconds)}
            </div>
            <p className="text-[10px] text-slate-300">
              {shiftDone
                ? `Clocked out at ${todayRecord?.checkOut} • ${todayRecord?.totalHours} hrs today`
                : todayRecord?.checkIn
                ? `Clocked in at ${todayRecord.checkIn}`
                : 'Not clocked in yet today'}
            </p>
            {punchError && <p className="text-[10px] text-rose-300 mt-1">{punchError}</p>}
          </div>

          <button
            onClick={handlePunch}
            disabled={punching || shiftDone}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
              clockedIn
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {punching ? 'Recording…' : shiftDone ? 'Shift Completed' : clockedIn ? 'Clock Out Now' : 'Clock In Shift'}
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Balance Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Leave Balances
            </h3>
            <button
              onClick={() => setCurrentPage('leave')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Apply Leave
            </button>
          </div>

          <div className="space-y-3">
            {leaveBalances.map((leave, idx) => {
              const remaining = leave.total - leave.used;
              const pct = (remaining / leave.total) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.type}</span>
                    <span className="text-slate-500 font-bold">
                      {remaining} / {leave.total} Days Left
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${leave.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Payroll Disbursement */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Latest Payslip
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Processed
              </span>
            </div>

            {myLatestPayroll ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">July 2026 Net Payout</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    ₹{myLatestPayroll.netSalary.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Bank Account: {myLatestPayroll.accountNumber} • HDFC
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => setCurrentPage('payroll')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Payslip PDF</span>
          </button>
        </div>

        {/* Performance Score Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Q2 KPI Performance
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600">
                Score: 98%
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Overall Rating</span>
                <span className="text-lg font-bold text-amber-500">4.9 / 5.0 ★</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-300">
                "Exceeded all Q2 deliverables with pristine UI designs & high team satisfaction."
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('performance')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Full Performance Report</span>
          </button>
        </div>
      </div>

      {/* Schedule & Leave Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Meetings */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-violet-600" />
              My Upcoming Syncs ({myMeetings.length})
            </h3>
            <button
              onClick={() => setCurrentPage('meetings')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Open Calendar
            </button>
          </div>

          <div className="space-y-3">
            {myMeetings.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {m.date} • {m.time}
                  </p>
                </div>
                <a
                  href={m.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Join Meeting
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* My Recent Leave Requests */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              My Leave Requests
            </h3>
            <button
              onClick={() => setCurrentPage('leave')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Manage Requests
            </button>
          </div>

          <div className="space-y-3">
            {myLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent leave requests filed.</p>
            ) : (
              myLeaves.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{l.leaveType}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l.startDate} to {l.endDate} ({l.days} Days)
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      l.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : l.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
