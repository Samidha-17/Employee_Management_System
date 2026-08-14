import React, { useState } from 'react';
import { 
  CalendarOff, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  X, 
  User, 
  Calendar as CalendarIcon,
  MessageSquare
} from 'lucide-react';
import { LeaveRequest, CurrentUser, UserRole, SystemNotification } from '../types';

interface LeaveManagementPageProps {
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  currentUser?: CurrentUser;
  userRole?: UserRole;
  // Notifies one employee by id — used so an approved/rejected leave shows
  // up on that employee's own bell/badge/notifications page right away.
  onNotifyEmployee?: (
    employeeId: string,
    notification: Omit<SystemNotification, 'id' | 'recipientEmployeeId' | 'timestamp' | 'read'>
  ) => void;
}

export const LeaveManagementPage: React.FC<LeaveManagementPageProps> = ({ leaves, setLeaves, currentUser, userRole, onNotifyEmployee }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const isEmployee = userRole === 'employee';

  // Apply Form State — prefilled from whoever is actually signed in, not a
  // hardcoded demo name.
  const [newLeave, setNewLeave] = useState({
    employeeName: currentUser?.name || 'Ananya Roy',
    department: currentUser?.department || 'Design',
    leaveType: 'Casual Leave' as any,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    days: 1,
    reason: '',
  });

  const handleApprove = (id: string) => {
    setLeaves(
      leaves.map((l) =>
        l.id === id ? { ...l, status: 'Approved', managerApproval: currentUser?.name || 'Vikramaditya Sharma' } : l
      )
    );
    const leave = leaves.find((l) => l.id === id);
    if (leave && onNotifyEmployee) {
      onNotifyEmployee(leave.employeeId, {
        title: 'Your Leave Request Was Approved',
        description: `Your ${leave.leaveType} request for ${leave.startDate} - ${leave.endDate} has been approved.`,
        category: 'leave',
        linkToPage: 'leave',
      });
    }
  };

  const handleReject = (id: string) => {
    setLeaves(
      leaves.map((l) =>
        l.id === id ? { ...l, status: 'Rejected', managerApproval: currentUser?.name || 'Vikramaditya Sharma' } : l
      )
    );
    const leave = leaves.find((l) => l.id === id);
    if (leave && onNotifyEmployee) {
      onNotifyEmployee(leave.employeeId, {
        title: 'Your Leave Request Was Rejected',
        description: `Your ${leave.leaveType} request for ${leave.startDate} - ${leave.endDate} was rejected.`,
        category: 'leave',
        linkToPage: 'leave',
      });
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: LeaveRequest = {
      id: 'lv-' + Math.floor(100 + Math.random() * 900),
      employeeId: currentUser?.employeeId || 'ABC-104',
      employeeName: newLeave.employeeName,
      employeePhoto: currentUser?.photo || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      department: newLeave.department,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days: Number(newLeave.days),
      reason: newLeave.reason || 'Personal leave request.',
      status: 'Pending',
      appliedDate: new Date().toISOString().slice(0, 10),
    };

    setLeaves([created, ...leaves]);
    setShowApplyModal(false);
  };

  // Employees only ever browse their own leave history; admin/HR/managers
  // keep the full department-wide queue to review and action.
  const scopedLeaves = isEmployee && currentUser
    ? leaves.filter((l) => l.employeeId === currentUser.employeeId)
    : leaves;

  const filteredLeaves = scopedLeaves.filter((l) => {
    const matchesFilter = activeFilter === 'All' || l.status === activeFilter;
    const matchesQuery =
      l.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarOff className="w-6 h-6 text-blue-600" />
            {isEmployee ? 'My Leave Requests' : 'Leave Management Hub'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee
              ? 'Track your time-off requests and apply for new leave.'
              : 'Review time-off requests, manage department quotas, and process manager approvals.'}
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave Request</span>
        </button>
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full sm:w-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee or leave type..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Leave Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeaves.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No leave requests found matching selected filter.
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={leave.employeePhoto}
                      alt={leave.employeeName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{leave.employeeName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{leave.department}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      leave.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : leave.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    ● {leave.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span>{leave.leaveType}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{leave.days} Day(s)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {leave.startDate} → {leave.endDate}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 italic">
                  "{leave.reason}"
                </p>
              </div>

              {/* Action Buttons for Pending items — approving/rejecting is a
                  manager/HR/admin action, never available on your own request */}
              {leave.status === 'Pending' && !isEmployee ? (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleApprove(leave.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleReject(leave.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    {leave.status === 'Pending'
                      ? 'Awaiting manager review'
                      : `Reviewed by ${leave.managerApproval || 'HR Manager'}`}
                  </span>
                  <span className="font-semibold">{leave.status}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Apply Leave Request Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Apply Time-Off Request</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Leave Category</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Reason / Justification</label>
                <textarea
                  rows={3}
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Explain brief reason for leave..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
