import React, { useState } from 'react';
import { 
  UserPlus, 
  User, 
  Briefcase, 
  Mail, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  ArrowLeft,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Employee, Page, UserRole } from '../types';

interface AddEmployeePageProps {
  onAddEmployee: (emp: Employee & { password?: string }) => void;
  setCurrentPage: (page: Page) => void;
  editingEmployee?: Employee | null;
}

export const AddEmployeePage: React.FC<AddEmployeePageProps> = ({
  onAddEmployee,
  setCurrentPage,
  editingEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'contact' | 'salary'>('personal');
  const [successBanner, setSuccessBanner] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: editingEmployee?.name || '',
    email: editingEmployee?.email || '',
    phone: editingEmployee?.phone || '',
    role: (editingEmployee?.role || 'employee') as UserRole,
    department: (editingEmployee?.department || 'Engineering') as any,
    designation: editingEmployee?.designation || '',
    joiningDate: editingEmployee?.joiningDate || new Date().toISOString().slice(0, 10),
    salary: editingEmployee?.salary || 120000,
    bankAccount: editingEmployee?.bankAccount || 'HDFC000' + Math.floor(100000 + Math.random() * 900000),
    pfNumber: editingEmployee?.pfNumber || 'MH/BAN/0012345/' + Math.floor(100 + Math.random() * 900),
    photo:
      editingEmployee?.photo ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: (editingEmployee?.status || 'Active') as any,
    performanceRating: editingEmployee?.performanceRating || 4.5,
    manager: editingEmployee?.manager || 'Vikramaditya Sharma',
    location: editingEmployee?.location || 'Mumbai HQ',
    skills: editingEmployee?.skills.join(', ') || 'React, TypeScript, Communication',
  });

  // Login credentials for this employee's own sign-in. Left blank on edit —
  // only filled in to reset/change it. New employees default to
  // "welcome123" on the backend if left blank here.
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: Employee & { password?: string } = {
      id: editingEmployee?.id || 'emp-' + Math.floor(100 + Math.random() * 900),
      employeeId: editingEmployee?.employeeId || 'ABC-' + Math.floor(111 + Math.random() * 888),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      designation: formData.designation,
      joiningDate: formData.joiningDate,
      salary: Number(formData.salary),
      bankAccount: formData.bankAccount,
      pfNumber: formData.pfNumber,
      photo: formData.photo,
      status: formData.status,
      performanceRating: Number(formData.performanceRating),
      manager: formData.manager,
      location: formData.location,
      skills: formData.skills.split(',').map((s) => s.trim()),
      ...(password ? { password } : {}),
    };

    onAddEmployee(newEmp);
    setSuccessBanner(true);
    setTimeout(() => {
      setCurrentPage('employees');
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: 'Engineering',
      designation: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: 120000,
      bankAccount: '',
      pfNumber: '',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      status: 'Active',
      performanceRating: 4.5,
      manager: 'Vikramaditya Sharma',
      location: 'Mumbai HQ',
      skills: '',
    });
    setPassword('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('employees')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              {editingEmployee ? 'Edit Employee Profile' : 'Onboard New Employee'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete multi-section enterprise onboarding form for ABC Technologies.
            </p>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Employee record saved successfully! Redirecting to Directory...</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">
          {[
            { id: 'personal', label: '1. Personal Details', icon: User },
            { id: 'professional', label: '2. Professional Details', icon: Briefcase },
            { id: 'contact', label: '3. Contact Info', icon: Mail },
            { id: 'salary', label: '4. Salary & Bank', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Photo Upload Dropzone */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <img
                  src={formData.photo}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/20"
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Enter HTTPS image URL or Unsplash profile photo link.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Skill Keywords</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, Architecture, System Design"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Professional Details */}
          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation Title</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Lead System Architect"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Access Privilege Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Specialist</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Office Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai HQ"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reporting Manager</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="e.g. Vikramaditya Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Contact Info */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@abctechnologies.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Salary & Bank Details */}
          {activeTab === 'salary' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PF Universal Number</label>
                <input
                  type="text"
                  value={formData.pfNumber}
                  onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 block">
                  {editingEmployee ? 'Reset Login Password (optional)' : 'Login Password (optional)'}
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingEmployee ? 'Leave blank to keep current password' : 'Leave blank to default to "welcome123"'}
                  className="w-full sm:w-1/3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400">
                  This is what {formData.name || 'the employee'} uses to sign in with their email above — each employee logs in with their own credentials.
                </p>
              </div>
            </div>
          )}

          {/* Form Actions Footer Buttons */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Fields</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentPage('employees')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Employee Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
