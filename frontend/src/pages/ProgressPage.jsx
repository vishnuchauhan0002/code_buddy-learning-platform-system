import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Flame,
  CheckCircle,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ProgressPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), dashboardAPI.getActivity()])
      .then(([statsRes, actRes]) => {
        if (statsRes.data.success) setData(statsRes.data);
        if (actRes.data.success) setActivity(actRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const profile = user?.profile;
  const stats = data?.stats || {
    problems_solved: 128,
    current_streak: 12,
    success_rate: 87,
    learning_hours: 42.0,
    difficulty_breakdown: { easy: 65, medium: 48, hard: 15 }
  };

  const diff = stats.difficulty_breakdown || { easy: 65, medium: 48, hard: 15 };
  const totalDiff = (diff.easy || 0) + (diff.medium || 0) + (diff.hard || 0) || 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Coding Progress</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed metrics, difficulty distribution, and learning activity
        </p>
      </div>

      {/* 4 Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Solved</span>
          <p className="text-2xl font-bold text-white">{stats.problems_solved}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Active learner</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Learning Streak</span>
          <p className="text-2xl font-bold text-amber-400 flex items-center space-x-1">
            <span>{stats.current_streak}</span>
            <Flame className="w-5 h-5 fill-amber-400 inline" />
          </p>
          <span className="text-[10px] text-slate-400">Keep it up!</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Accuracy</span>
          <p className="text-2xl font-bold text-emerald-400">{stats.success_rate}%</p>
          <span className="text-[10px] text-slate-400">Submission success</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Learning Time</span>
          <p className="text-2xl font-bold text-purple-400">{stats.learning_hours} hrs</p>
          <span className="text-[10px] text-slate-400">Time invested</span>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <h3 className="text-sm font-bold text-white">Difficulty Breakdown</h3>

        <div className="space-y-4">
          {/* Easy */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-semibold">Easy</span>
              <span className="text-slate-300 font-mono">{diff.easy} Solved</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.round((diff.easy / totalDiff) * 100)}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>

          {/* Medium */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-amber-400 font-semibold">Medium</span>
              <span className="text-slate-300 font-mono">{diff.medium} Solved</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.round((diff.medium / totalDiff) * 100)}%` }}
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>

          {/* Hard */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-rose-400 font-semibold">Hard</span>
              <span className="text-slate-300 font-mono">{diff.hard} Solved</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.round((diff.hard / totalDiff) * 100)}%` }}
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Log */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Recent Submissions Log</h3>

        <div className="space-y-2">
          {activity?.recent_submissions?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent submissions found.</p>
          ) : (
            activity?.recent_submissions?.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  {sub.status === 'Accepted' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <div>
                    <h4 className="font-semibold text-white">{sub.problem_title || `Problem #${sub.problem_id}`}</h4>
                    <p className="text-[11px] text-slate-400">{sub.language} • {sub.execution_time}s</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      sub.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
