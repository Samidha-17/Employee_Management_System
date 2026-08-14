import React, { useState } from 'react';
import { 
  Building2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Award,
  Users2
} from 'lucide-react';
import { UserRole } from '../types';
import { authApi } from '../services/api';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
  loginError?: string | null;
  isLoggingIn?: boolean;
}

// Matches the demo accounts seeded by the Flask backend (backend/app.py ->
// DEMO_LOGIN_ACCOUNTS). Each role is a genuinely separate account/user, so
// switching the pill below only changes which credentials are pre-filled —
// the actual view you land on always comes from whichever account you sign
// in with, not from a client-side toggle.
const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  admin: { email: 'admin@admin.com', password: 'admin123' },
  hr: { email: 'hr@hr.com', password: 'hr123' },
  manager: { email: 'manager@manager.com', password: 'manager123' },
  employee: { email: 'employee@employee.com', password: 'employee123' },
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loginError, isLoggingIn }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState(DEMO_CREDENTIALS.admin.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.admin.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot-password flow. There's no email/SMTP setup in this project, so
  // instead of a link "sent to your inbox", the account is verified by
  // Employee ID + email right here and the new password is set directly.
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmployeeId, setForgotEmployeeId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  const resetForgotForm = () => {
    setShowForgot(false);
    setForgotEmployeeId('');
    setForgotEmail('');
    setForgotNewPassword('');
    setForgotError(null);
    setForgotDone(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }
    setForgotSubmitting(true);
    try {
      await authApi.forgotPassword(forgotEmail, forgotEmployeeId, forgotNewPassword);
      setForgotDone(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const selectDemoRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, selectedRole);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-slate-800/80 backdrop-blur-2xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] relative z-10">
        
        {/* Left Side: Branding & Corporate Graphic */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-slate-900/90 via-blue-950/60 to-slate-900 border-r border-slate-700/50 flex flex-col justify-between relative">
          {/* Logo Header */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">ABC Technologies</h1>
                <p className="text-xs text-blue-400 font-medium">Enterprise Human Capital Suite</p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise EMS v4.2
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Empower Your Enterprise Workforce.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Unified employee lifecycle management, automated global payroll, AI performance analytics, and seamless leave workflows built for modern multinational teams.
              </p>
            </div>
          </div>

          {/* Value Highlights Grid */}
          <div className="my-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm mb-1">
                <ShieldCheck className="w-4 h-4" /> ISO 27001 Certified
              </div>
              <p className="text-xs text-slate-400">Enterprise grade data encryption & role security.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm mb-1">
                <Users2 className="w-4 h-4" /> 10,000+ Employees
              </div>
              <p className="text-xs text-slate-400">Real-time attendance & multi-currency payroll.</p>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
            <span>© 2026 ABC Technologies Pvt. Ltd.</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-400" /> Premium Enterprise UI</span>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">System Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a demo role below or enter your corporate credentials to access the EMS portal.
              </p>
            </div>

            {/* Demo Role Selector Pills — each fills in a genuinely separate
                demo account's credentials; the pill itself never grants a view. */}
            <div className="p-1 rounded-2xl bg-slate-800/90 border border-slate-700/80 grid grid-cols-4 gap-1">
              {(['admin', 'hr', 'manager', 'employee'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectDemoRole(role)}
                  className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold capitalize transition-all ${
                    selectedRole === role
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role === 'hr' ? 'HR' : role}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@abctechnologies.com"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {showForgot && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  {forgotDone ? (
                    <>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Password reset. You can sign in with your new password now.
                      </div>
                      <button
                        type="button"
                        onClick={resetForgotForm}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
                      >
                        Back to sign in
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400">
                        Verify your account to set a new password.
                      </p>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Employee ID</label>
                        <input
                          type="text"
                          required
                          value={forgotEmployeeId}
                          onChange={(e) => setForgotEmployeeId(e.target.value)}
                          placeholder="ABC-1234"
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Account Email</label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="user@abctechnologies.com"
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      {forgotError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                          {forgotError}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleForgotSubmit}
                          disabled={forgotSubmitting}
                          className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl transition-all"
                        >
                          {forgotSubmitting ? 'Resetting…' : 'Reset Password'}
                        </button>
                        <button
                          type="button"
                          onClick={resetForgotForm}
                          className="text-xs text-slate-400 hover:text-slate-200 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {loginError}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-2 group"
              >
                <span>{isLoggingIn ? 'Signing in…' : 'Access System Dashboard'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">
                Protected by ABC Technologies SSO & MFA Gateways
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
