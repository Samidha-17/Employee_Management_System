import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Sun, 
  Moon, 
  Globe, 
  CheckCircle2, 
  SlidersHorizontal,
  Key
} from 'lucide-react';
import { CurrentUser, Employee } from '../types';
import { authApi, employeesApi } from '../services/api';

interface SettingsPageProps {
  currentUser: CurrentUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  backendConnected: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  setCurrentUser,
  setEmployees,
  darkMode,
  setDarkMode,
  backendConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'security' | 'system'>('profile');
  const [savedToast, setSavedToast] = useState(false);

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [autoClockOut, setAutoClockOut] = useState(false);

  // Profile form (Profile tab) — controlled so Save actually persists it,
  // instead of the old defaultValue inputs that never left the DOM.
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change form (Account tab)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setProfileError(null);

    if (activeTab === 'profile' && (displayName !== currentUser.name || email !== currentUser.email)) {
      if (!backendConnected) {
        setProfileError('Profile changes require a live connection to the server.');
        return;
      }
      setSavingProfile(true);
      try {
        await employeesApi.update(currentUser.id, { name: displayName, email });
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === currentUser.id ? { ...emp, name: displayName, email } : emp))
        );
        setCurrentUser((prev) => ({ ...prev, name: displayName, email }));
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
        return;
      } finally {
        setSavingProfile(false);
      }
    }

    if (activeTab === 'account' && (currentPassword || newPassword)) {
      if (!backendConnected) {
        setPasswordError('Password changes require a live connection to the server.');
        return;
      }
      setChangingPassword(true);
      try {
        await authApi.changePassword(currentUser.employeeId, currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
      } catch (err) {
        setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
        return;
      } finally {
        setChangingPassword(false);
      }
    }

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          System & Account Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure multi-factor security, notification channels, theme options, and profile settings.
        </p>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left Vertical Tabs */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-4 space-y-1 bg-slate-50/50 dark:bg-slate-800/30">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'account', label: 'Account & Security', icon: Lock },
            { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
            { id: 'security', label: 'Two-Factor Authentication', icon: ShieldCheck },
            { id: 'system', label: 'Theme & Preferences', icon: SlidersHorizontal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Panel */}
        <div className="md:col-span-8 p-6 lg:p-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600">
                  Profile Information
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                  {profileError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs">
                      {profileError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600">
                  Notification Delivery Channels
                </h3>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Email Notifications</p>
                    <p className="text-[11px] text-slate-400">Receive leave updates and payslip dispatches via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Slack & Teams Webhook Alerts</p>
                    <p className="text-[11px] text-slate-400">Push instant meeting invites to Slack channel.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={slackAlerts}
                    onChange={(e) => setSlackAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600">
                  Interface Theme
                </h3>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-blue-600" />}
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Dark Atmosphere Mode</p>
                      <p className="text-[11px] text-slate-400">Toggle dark mode visual layout.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    {darkMode ? 'Light' : 'Dark'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600">
                  Two-Factor Security (2FA)
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
                  <span>● Authenticator App Active</span>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded">Enforced</span>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600">
                  Password & Security Credentials
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  {passwordError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                      {passwordError}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={changingPassword || savingProfile}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs shadow-md"
              >
                {changingPassword ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
