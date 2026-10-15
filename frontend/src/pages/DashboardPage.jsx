import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  Code2,
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Trophy,
  Terminal,
  Calendar,
  ExternalLink,
  Zap,
  TrendingUp,
  FileCode,
  BookOpen
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const profile = user?.profile;
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : user?.username || 'Learner';

  const stats = data?.stats || {
    problems_solved: profile?.total_points ? Math.floor(profile.total_points / 20) : 12,
    current_streak: profile?.current_streak || 12,
    success_rate: 87,
    learning_hours: profile?.learning_hours || 42.0,
  };

  const weeklyProgress = data?.weekly_progress || [
    { day: 'Mon', count: 3 },
    { day: 'Tue', count: 5 },
    { day: 'Wed', count: 4 },
    { day: 'Thu', count: 7 },
    { day: 'Fri', count: 2 },
    { day: 'Sat', count: 8 },
    { day: 'Sun', count: 6 },
  ];

  const maxWeeklyCount = Math.max(...weeklyProgress.map((d) => d.count), 1);

  const dailyChallenge = data?.daily_challenge || {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers, return indices of two numbers that add up to a specific target.'
  };

  const recommendedProblems = data?.recommended_problems?.length
    ? data.recommended_problems
    : [
        { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack' },
        { id: 3, title: 'Merge Two Sorted Lists', difficulty: 'Medium', topic: 'Linked List' },
      ];

  const upcomingContests = data?.upcoming_contests?.length
    ? data.upcoming_contests
    : [
        {
          id: 1,
          title: 'Weekly Challenge #45',
          start_time: '2026-12-15T20:00:00',
          duration_minutes: 120,
          problems_count: 5
        }
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header with personalized greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Welcome back, {firstName}!</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center space-x-1">
            <span>Keep learning, keep coding!</span>
            <span className="text-amber-400">🔥</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/study"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center space-x-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>DSA Visualizer & Study</span>
          </Link>
          <Link
            to="/editor"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi-Model AI</span>
          </Link>
        </div>
      </div>

      {/* 2. Four Interactive Stat Cards (Matching Panel 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Problems Solved */}
        <Link
          to="/problems"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/80 transition-all group flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Problems Solved</p>
            <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {stats.problems_solved}
            </p>
          </div>
        </Link>

        {/* Current Streak */}
        <Link
          to="/progress"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6 fill-amber-500/20" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Current Streak</p>
            <p className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {stats.current_streak} <span className="text-sm font-normal text-slate-400">days</span>
            </p>
          </div>
        </Link>

        {/* Success Rate */}
        <Link
          to="/progress"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all group flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Success Rate</p>
            <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              {stats.success_rate}%
            </p>
          </div>
        </Link>

        {/* Learning Hours */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Learning Hours</p>
            <p className="text-2xl font-bold text-white">
              {stats.learning_hours} <span className="text-sm font-normal text-slate-400">hrs</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Daily Challenge + Recommended Problems) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Challenge Card (Matching Panel 4) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Daily Challenge</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {dailyChallenge.difficulty}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Today</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{dailyChallenge.title}</h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {dailyChallenge.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <span>Reward: +100 Points</span>
              </span>
              <Link
                to={`/problems/${dailyChallenge.id}`}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <span>Start Solving</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Recommended Problems (Matching Panel 4) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Recommended Problems</h3>
              <Link to="/problems" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                View all problems →
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-mono">
                      {prob.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{prob.title}</h4>
                      <p className="text-xs text-slate-400">{prob.topic || 'Algorithms'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                    <Link
                      to={`/problems/${prob.id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-700 hover:bg-indigo-600 transition-colors"
                    >
                      Solve
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Learning Progress Chart + Upcoming Contests) */}
        <div className="space-y-6">
          {/* Learning Progress Chart (Matching Panel 4) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Learning Progress</h3>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60">
                This Week
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-4">
              <div className="h-40 flex items-end justify-between gap-2 px-2">
                {weeklyProgress.map((item, idx) => {
                  const heightPercent = Math.max(15, Math.round((item.count / maxWeeklyCount) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </div>
                      <div className="w-full bg-slate-800 rounded-t-lg h-32 flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md group-hover:from-indigo-500 group-hover:to-purple-400 transition-all duration-300"
                        ></div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Contests (Matching Panel 4) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upcoming Contests</h3>
              <Link to="/contests" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingContests.map((contest) => (
                <div
                  key={contest.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{contest.title}</h4>
                    <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                      {contest.duration_minutes || 120} mins
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(contest.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </p>

                  <Link
                    to={`/contests/${contest.id}`}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-center text-white bg-indigo-600 hover:bg-indigo-500 transition-colors block"
                  >
                    Join Contest
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
