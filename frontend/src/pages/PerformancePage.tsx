import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Star, 
  UserCheck, 
  MessageSquare, 
  Plus, 
  Search,
  X,
  Target
} from 'lucide-react';
import { PerformanceReview, CurrentUser, UserRole } from '../types';

interface PerformancePageProps {
  reviews: PerformanceReview[];
  setReviews: React.Dispatch<React.SetStateAction<PerformanceReview[]>>;
  currentUser?: CurrentUser;
  userRole?: UserRole;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({ reviews, setReviews, currentUser, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [newFeedbackText, setNewFeedbackText] = useState('');

  const isEmployee = userRole === 'employee';
  // Employees see only their own review; leaving feedback on it is a
  // manager/HR/admin action.
  const scopedReviews = isEmployee && currentUser
    ? reviews.filter((r) => r.employeeId === currentUser.employeeId)
    : reviews;

  const filteredReviews = scopedReviews.filter((r) =>
    r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id ? { ...r, managerFeedback: newFeedbackText } : r
      )
    );
    setShowFeedbackModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            {isEmployee ? 'My Performance' : 'Performance & KPI Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee
              ? 'Your quarterly evaluations, goal completion progress, and manager feedback.'
              : 'Quarterly performance evaluations, goal completion progress, and manager feedback loops.'}
          </p>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => {
          const goalPct = (review.goalsCompleted / review.totalGoals) * 100;
          return (
            <div
              key={review.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.employeePhoto}
                      alt={review.employeeName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{review.employeeName}</h3>
                      <p className="text-[11px] text-slate-500">{review.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{review.overallRating}</span>
                  </div>
                </div>

                {/* KPI Progress Bar */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-600" /> Goals Completed
                    </span>
                    <span className="font-bold text-blue-600">
                      {review.goalsCompleted} / {review.totalGoals} ({goalPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${goalPct}%` }} />
                  </div>
                </div>

                {/* Manager Feedback Quote */}
                <div className="mt-4 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs italic text-slate-600 dark:text-slate-300">
                  "{review.managerFeedback}"
                </div>
              </div>

              {!isEmployee && (
                <button
                  onClick={() => {
                    setSelectedReview(review);
                    setNewFeedbackText(review.managerFeedback);
                    setShowFeedbackModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Update Manager Feedback</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback Composer Modal */}
      {showFeedbackModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Manager Performance Review Note</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedReview.employeeName}</p>
                <p className="text-[11px] text-slate-400">{selectedReview.designation} • {selectedReview.department}</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Executive Feedback Comment</label>
                <textarea
                  rows={4}
                  required
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold">
                  Save Review Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
