import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  Users, 
  CreditCard, 
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Employee, LeaveRequest, PayrollRecord } from '../types';

interface ReportsPageProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  payrolls: PayrollRecord[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ employees, leaves, payrolls }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'attendance' | 'payroll' | 'employee' | 'leave' | 'performance'
  >('employee');

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (type: 'PDF' | 'CSV' | 'Excel') => {
    setDownloadSuccess(`Exporting ${selectedCategory.toUpperCase()} Report as ${type}...`);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 2000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Reports & Analytics Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export comprehensive enterprise reports for auditing, compliance, payroll, and workforce growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Category Pills Header */}
      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-1 text-xs font-bold">
        {[
          { id: 'employee', label: 'Workforce Report', icon: Users },
          { id: 'payroll', label: 'Payroll & Tax', icon: CreditCard },
          { id: 'attendance', label: 'Attendance Audit', icon: Calendar },
          { id: 'leave', label: 'Leave Summary', icon: Calendar },
          { id: 'performance', label: 'KPI Analytics', icon: Award },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = selectedCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id as any)}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Report Preview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {selectedCategory} Enterprise Audit Report
            </h3>
            <p className="text-xs text-slate-500">Generated for Q3 2026 Fiscal Audit</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Ref: ABC-RPT-2026-08</span>
        </div>

        {/* Data Sample Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Primary Key Metric</th>
                <th className="p-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.slice(0, 6).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{emp.employeeId}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                  <td className="p-3 font-semibold text-blue-600">
                    {selectedCategory === 'payroll'
                      ? `₹${emp.salary.toLocaleString()}`
                      : selectedCategory === 'performance'
                      ? `${emp.performanceRating} / 5.0 Rating`
                      : 'Verified'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                      VERIFIED OK
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
