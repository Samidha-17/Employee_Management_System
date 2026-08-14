import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  CreditCard, 
  Award, 
  ShieldCheck, 
  ArrowLeft,
  Edit3,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, Page } from '../types';

interface EmployeeProfilePageProps {
  employee: Employee | null;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  setCurrentPage: (page: Page) => void;
  onEditEmployee: (emp: Employee) => void;
}

export const EmployeeProfilePage: React.FC<EmployeeProfilePageProps> = ({
  employee,
  attendance,
  leaves,
  setCurrentPage,
  onEditEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'salary' | 'attendance' | 'documents'>('overview');

  if (!employee) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No employee selected.</p>
        <button onClick={() => setCurrentPage('employees')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
          Return to Directory
        </button>
      </div>
    );
  }

  const myAttendance = attendance.filter((a) => a.employeeId === employee.employeeId);
  const myLeaves = leaves.filter((l) => l.employeeId === employee.employeeId);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Back Navigation */}
      <button
        onClick={() => setCurrentPage('employees')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Employee Directory</span>
      </button>

      {/* Cover Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative p-6 flex items-end justify-between">
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                employee.status === 'Active'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-amber-500 text-white'
              }`}
            >
              ● {employee.status}
            </span>
          </div>
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-5">
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl shrink-0"
            />
            <div className="space-y-1 mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {employee.name}
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {employee.designation} • {employee.department}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {employee.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Joined {employee.joiningDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onEditEmployee(employee);
              setCurrentPage('add-employee');
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Tabs Header */}
        <div className="flex border-t border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Job Info' },
            { id: 'salary', label: 'Salary & Compensation' },
            { id: 'attendance', label: 'Attendance & Leaves' },
            { id: 'documents', label: 'Compliance & Documents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Personal & Contact Card */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600">
              Personal & Contact Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" /> Corporate Email
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{employee.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" /> Phone
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{employee.phone}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" /> Reporting Manager
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{employee.manager}</span>
              </div>
            </div>
          </div>

          {/* Role & Skills Card */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-indigo-600">
              Skills & Core Competencies
            </h3>

            <div className="flex flex-wrap gap-2 pt-2">
              {employee.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 mt-4">
              <span className="text-xs text-slate-500 font-medium">Performance Rating Score</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {employee.performanceRating} / 5.0 Rating
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                  Top Tier ★
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary & Benefits Tab */}
      {activeTab === 'salary' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Compensation Structure
            </h3>
            <span className="text-xs font-bold text-slate-500">Currency: INR (₹)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Monthly Base Salary</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{employee.salary.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Bank Account Number</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">
                {employee.bankAccount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">PF Number</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">
                {employee.pfNumber}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Attendance Logs</h3>
          <div className="space-y-2">
            {myAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No recent attendance records logged.</p>
            ) : (
              myAttendance.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{att.date}</span>
                  <span className="text-slate-500">Check In: {att.checkIn}</span>
                  <span className="text-slate-500">Check Out: {att.checkOut}</span>
                  <span className="font-bold text-emerald-600">{att.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Verified Compliance Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {['Employment Contract.pdf', 'Government ID Proof.pdf', 'Tax Declaration Form 16.pdf', 'Medical Fitness Certificate.pdf'].map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{doc}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
