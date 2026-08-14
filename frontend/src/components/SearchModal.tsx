import React, { useState, useEffect } from 'react';
import { Search, X, Users, CalendarOff, CreditCard, Video, ArrowRight } from 'lucide-react';
import { Employee, LeaveRequest, Page } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  leaves: LeaveRequest[];
  setCurrentPage: (page: Page) => void;
  onSelectEmployee?: (emp: Employee) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  employees,
  leaves,
  setCurrentPage,
  onSelectEmployee,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEmployees = query.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.employeeId.toLowerCase().includes(query.toLowerCase()) ||
          e.department.toLowerCase().includes(query.toLowerCase()) ||
          e.designation.toLowerCase().includes(query.toLowerCase())
      )
    : employees.slice(0, 4);

  const pagesList: { id: Page; title: string; icon: any; category: string }[] = [
    { id: 'employees', title: 'Employee Directory', icon: Users, category: 'Module' },
    { id: 'attendance', title: 'Attendance Log', icon: Users, category: 'Module' },
    { id: 'leave', title: 'Leave Management', icon: CalendarOff, category: 'Module' },
    { id: 'payroll', title: 'Payroll & Payslips', icon: CreditCard, category: 'Module' },
    { id: 'meetings', title: 'Meeting Scheduler', icon: Video, category: 'Module' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-blue-600 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, ID, department, or modules..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 text-sm font-medium placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Quick Modules */}
          {!query && (
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-2 px-2">
                Quick Navigation
              </span>
              <div className="grid grid-cols-2 gap-2">
                {pagesList.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentPage(p.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.title}</p>
                        <p className="text-[10px] text-slate-400">{p.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Employees List */}
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-2 px-2">
              Employees ({filteredEmployees.length})
            </span>
            {filteredEmployees.length === 0 ? (
              <p className="text-xs text-slate-400 px-2 py-4 text-center">No matching records found.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      if (onSelectEmployee) onSelectEmployee(emp);
                      setCurrentPage('employee-profile');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.photo}
                        alt={emp.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{emp.name}</p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {emp.employeeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {emp.designation} • {emp.department}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search shortcut: Press Esc to exit</span>
          <span>ABC Technologies Enterprise EMS</span>
        </div>
      </div>
    </div>
  );
};
