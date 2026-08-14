import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Eye, 
  Plus, 
  CheckCircle2, 
  X, 
  DollarSign, 
  Building2,
  Sparkles,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { PayrollRecord, CurrentUser, UserRole } from '../types';

interface PayrollPageProps {
  payrolls: PayrollRecord[];
  setPayrolls: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  currentUser?: CurrentUser;
  userRole?: UserRole;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ payrolls, setPayrolls, currentUser, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedEmpForBonus, setSelectedEmpForBonus] = useState('');
  const [bonusAmount, setBonusAmount] = useState(10000);

  const isEmployee = userRole === 'employee';
  // Employees only ever see their own payslips; running payroll and
  // awarding bonuses across the company stays admin/HR-only.
  const scopedPayrolls = isEmployee && currentUser
    ? payrolls.filter((p) => p.employeeId === currentUser.employeeId)
    : payrolls;

  const totalPayrollVal = scopedPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTaxVal = scopedPayrolls.reduce((sum, p) => sum + p.deductions.tax, 0);
  const totalPFVal = scopedPayrolls.reduce((sum, p) => sum + p.deductions.pf, 0);

  const filteredPayrolls = scopedPayrolls.filter((p) =>
    p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyBonus = (e: React.FormEvent) => {
    e.preventDefault();
    setPayrolls(
      payrolls.map((p) =>
        p.employeeId === selectedEmpForBonus
          ? {
              ...p,
              bonus: p.bonus + Number(bonusAmount),
              netSalary: p.netSalary + Number(bonusAmount),
            }
          : p
      )
    );
    setShowBonusModal(false);
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            {isEmployee ? 'My Payroll' : 'Payroll & Compensation Hub'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee
              ? 'View and download your own payslips and payment history.'
              : 'Manage automated monthly disbursement, tax deductions, PF calculations, and payslips.'}
          </p>
        </div>

        {!isEmployee && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBonusModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 font-semibold text-xs text-slate-800 dark:text-slate-200 shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Performance Bonus</span>
            </button>
          </div>
        )}
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Disbursement</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-1">
              ₹{(totalPayrollVal / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">● July 2026 Processed</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tax Deducted (TDS)</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-1">
              ₹{(totalTaxVal / 1000).toFixed(0)}K
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Remitted to Govt Portal</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Provident Fund Pool</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-1">
              ₹{(totalPFVal / 1000).toFixed(0)}K
            </span>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">● EPFO Compliant</span>
          </div>
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payroll Entries Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Payroll Records</h3>
          <div className="relative w-full sm:w-72">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Month / Year</th>
                <th className="p-3">Base Salary</th>
                <th className="p-3">Allowances</th>
                <th className="p-3">Deductions</th>
                <th className="p-3">Bonus</th>
                <th className="p-3">Net Payout</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayrolls.map((p) => {
                const totalAllowances = p.allowances.hra + p.allowances.conveyance + p.allowances.special + p.allowances.medical;
                const totalDeductions = p.deductions.pf + p.deductions.tax + p.deductions.healthInsurance;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.employeePhoto} alt={p.employeeName} className="w-8 h-8 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.employeeName}</p>
                          <p className="text-[10px] text-slate-400">{p.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{p.month} {p.year}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">₹{p.baseSalary.toLocaleString()}</td>
                    <td className="p-3 text-emerald-600 font-semibold">+₹{totalAllowances.toLocaleString()}</td>
                    <td className="p-3 text-rose-600 font-semibold">-₹{totalDeductions.toLocaleString()}</td>
                    <td className="p-3 text-indigo-600 font-bold">₹{p.bonus.toLocaleString()}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white text-sm">
                      ₹{p.netSalary.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600">
                        ● {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Payslip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal View */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto max-h-[90vh] custom-scrollbar space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Official Salary Slip Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPayslip}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print PDF</span>
                </button>
                <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Payslip Printable Body */}
            <div className="space-y-6 text-slate-800 dark:text-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">ABC Technologies Pvt. Ltd.</h2>
                  <p className="text-xs text-slate-500">BKC Enterprise Tower, Bandra East, Mumbai - 400051</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600 block">PAYSLIP STATEMENT</span>
                  <span className="text-xs text-slate-500">{selectedPayslip.month} {selectedPayslip.year}</span>
                </div>
              </div>

              {/* Employee Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p><span className="text-slate-400">Employee Name:</span> <strong>{selectedPayslip.employeeName}</strong></p>
                  <p className="mt-1"><span className="text-slate-400">Employee ID:</span> <strong>{selectedPayslip.employeeId}</strong></p>
                  <p className="mt-1"><span className="text-slate-400">Designation:</span> <strong>{selectedPayslip.designation}</strong></p>
                </div>
                <div>
                  <p><span className="text-slate-400">Bank Name:</span> <strong>{selectedPayslip.bankName}</strong></p>
                  <p className="mt-1"><span className="text-slate-400">Account No:</span> <strong>{selectedPayslip.accountNumber}</strong></p>
                  <p className="mt-1"><span className="text-slate-400">Payment Date:</span> <strong>{selectedPayslip.paymentDate}</strong></p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1">EARNINGS</h4>
                  <div className="flex justify-between"><span className="text-slate-500">Basic Salary</span><span>₹{selectedPayslip.baseSalary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">HRA Allowance</span><span>₹{selectedPayslip.allowances.hra.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Special Allowance</span><span>₹{selectedPayslip.allowances.special.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Performance Bonus</span><span>₹{selectedPayslip.bonus.toLocaleString()}</span></div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1">DEDUCTIONS</h4>
                  <div className="flex justify-between"><span className="text-slate-500">Provident Fund (PF)</span><span>₹{selectedPayslip.deductions.pf.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Income Tax (TDS)</span><span>₹{selectedPayslip.deductions.tax.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Health Insurance</span><span>₹{selectedPayslip.deductions.healthInsurance.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Total Summary Banner */}
              <div className="p-4 rounded-2xl bg-blue-600 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-200 block">NET SALARY PAYOUT</span>
                  <span className="text-2xl font-extrabold">₹{selectedPayslip.netSalary.toLocaleString()}</span>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">PAID IN FULL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bonus Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Award Performance Bonus</h3>
              <button onClick={() => setShowBonusModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBonus} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Select Employee</label>
                <select
                  value={selectedEmpForBonus}
                  onChange={(e) => setSelectedEmpForBonus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="">Select Employee...</option>
                  {payrolls.map((p) => (
                    <option key={p.employeeId} value={p.employeeId}>
                      {p.employeeName} ({p.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Bonus Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowBonusModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold">
                  Apply Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
