import React, { useState } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Sparkles,
  Link2
} from 'lucide-react';
import { ScheduledMeeting, CurrentUser, UserRole } from '../types';

interface MeetingsPageProps {
  meetings: ScheduledMeeting[];
  setMeetings: React.Dispatch<React.SetStateAction<ScheduledMeeting[]>>;
  currentUser?: CurrentUser;
  userRole?: UserRole;
}

export const MeetingsPage: React.FC<MeetingsPageProps> = ({ meetings, setMeetings, currentUser, userRole }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    category: 'Department Sync' as any,
    date: new Date().toISOString().slice(0, 10),
    time: '10:00 AM - 11:00 AM',
    description: '',
  });

  const isEmployee = userRole === 'employee';
  // Employees only see meetings they organize or are invited to; scheduling
  // company-wide meetings stays an admin/HR/manager action.
  const scopedMeetings = isEmployee && currentUser
    ? meetings.filter(
        (m) =>
          m.organizerName === currentUser.name ||
          m.participants.some((p) => p.email === currentUser.email)
      )
    : meetings;

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ScheduledMeeting = {
      id: 'meet-' + Math.floor(100 + Math.random() * 900),
      title: newMeeting.title,
      date: newMeeting.date,
      time: newMeeting.time,
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/abc-tech-' + Math.floor(100 + Math.random() * 900),
      organizerName: currentUser?.name || 'Vikramaditya Sharma',
      organizerPhoto: currentUser?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      participants: [
        { name: 'Priya Deshmukh', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', email: 'p.deshmukh@abctechnologies.com' },
        { name: 'Rohan Mehta', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', email: 'r.mehta@abctechnologies.com' },
      ],
      status: 'Scheduled',
      category: newMeeting.category,
      description: newMeeting.description || 'Enterprise team sync.',
    };

    setMeetings([created, ...meetings]);
    setShowScheduleModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-violet-600" />
            {isEmployee ? 'My Meetings' : 'Enterprise Meeting Scheduler'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee
              ? 'Meetings you organize or are invited to, with instant Google Meet links.'
              : 'Schedule executive standups, department syncs, and generate instant Google Meet links.'}
          </p>
        </div>

        {!isEmployee && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Meeting</span>
          </button>
        )}
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scopedMeetings.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No meetings on your calendar right now.
          </div>
        ) : (
        scopedMeetings.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-600">
                  {m.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{m.date}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{m.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> {m.time} ({m.durationMinutes} min)
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">{m.description}</p>

              {/* Participants List */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Participants ({m.participants.length})
                </span>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {m.participants.map((p, idx) => (
                    <img
                      key={idx}
                      src={p.photo}
                      alt={p.name}
                      title={p.name}
                      className="w-7 h-7 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900"
                    />
                  ))}
                </div>
              </div>
            </div>

            <a
              href={m.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Join Video Call</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {!isEmployee && showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Video Conference</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Meeting Topic Title</label>
                <input
                  type="text"
                  required
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="e.g. Q3 Engineering Architecture Review"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description / Agenda</label>
                <textarea
                  rows={3}
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  placeholder="Outline key discussion points..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-bold">
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
