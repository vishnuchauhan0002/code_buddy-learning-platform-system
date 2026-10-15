import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Award, Trophy, Medal, Flame, Star } from 'lucide-react';

const LeaderboardPage = () => {
  const { addToast } = useToast();
  const [filter, setFilter] = useState('all'); // 'all', 'weekly', 'monthly'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getLeaderboard({ filter });
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20 mx-auto">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-bold text-xs shadow-md mx-auto">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold text-xs shadow-md mx-auto">
          🥉
        </div>
      );
    }
    return <span className="font-mono text-slate-400 font-semibold">{rank}</span>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header matching Panel 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Top performers in the CodeBuddy community
          </p>
        </div>

        {/* Filter Tabs matching Panel 9 */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === 'weekly'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilter('monthly')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === 'monthly'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Leaderboard Table matching Panel 9 */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-16 text-center">Rank</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4 w-32 text-right">Points</th>
              <th className="py-3.5 px-4 w-36 text-right">Problems Solved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                  Loading rankings...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500">
                  No leaderboard data yet. Start solving problems to rank!
                </td>
              </tr>
            ) : (
              leaderboard.map((item) => (
                <tr
                  key={item.user_id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center">
                    {getRankBadge(item.rank)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.avatar_url}
                        alt={item.full_name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">
                          {item.full_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          @{item.username}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-indigo-400">
                    {item.points.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-300">
                    {item.problems_solved}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
