import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Clock,
  Code2,
  ChevronLeft,
  Timer,
  CheckCircle,
  Award
} from 'lucide-react';

const ContestDetailPage = () => {
  const { id } = useParams();
  const { addToast } = useToast();

  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'leaderboard'

  useEffect(() => {
    fetchContest();
    fetchLeaderboard();
  }, [id]);

  const fetchContest = async () => {
    try {
      const res = await contestsAPI.getContest(id);
      if (res.data.success) {
        setContest(res.data.contest);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load contest arena', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await contestsAPI.getLeaderboard(id);
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !contest) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/contests"
        className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Contests</span>
      </Link>

      {/* Contest Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{contest.title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {contest.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">{contest.description}</p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          <Timer className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Duration</div>
            <div className="text-sm font-bold text-white">{contest.duration_minutes} Mins</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'problems'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Contest Problems
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'leaderboard'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Standings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'problems' ? (
        <div className="space-y-3">
          {contest.problems?.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              Problems will unlock when the contest starts.
            </div>
          ) : (
            contest.problems.map((cp, idx) => (
              <div
                key={cp.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cp.title}</h3>
                    <p className="text-xs text-slate-400">{cp.topic} • {cp.difficulty}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-mono text-xs text-indigo-400 font-semibold">
                    {cp.contest_points || 100} pts
                  </span>
                  <Link
                    to={`/problems/${cp.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Solve Problem
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-500">
                    No submissions recorded yet for this contest.
                  </td>
                </tr>
              ) : (
                leaderboard.map((part) => (
                  <tr key={part.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      {part.rank}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {part.full_name || part.username}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-400">
                      {part.score}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContestDetailPage;
