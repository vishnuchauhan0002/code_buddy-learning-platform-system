import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Calendar,
  Clock,
  Code2,
  Users,
  CheckCircle,
  Timer
} from 'lucide-react';

const ContestsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'active', 'past'
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, [activeTab]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await contestsAPI.getContests({ tab: activeTab });
      if (res.data.success) {
        setContests(res.data.contests || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load contests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (contestId) => {
    try {
      const res = await contestsAPI.register(contestId);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setContests((prev) =>
          prev.map((c) => (c.id === contestId ? { ...c, is_registered: true } : c))
        );
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Please login to register for contest', 'error');
    }
  };

  // Calculate readable time remaining
  const getTimeRemaining = (startTimeStr) => {
    const diff = new Date(startTimeStr) - new Date();
    if (diff <= 0) return 'Live Now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header matching Panel 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Coding Contests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Participate in live contests and challenge yourself
          </p>
        </div>

        {/* Tabs matching Panel 10: Upcoming, Active, Past */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'past'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Contests List matching Panel 10 */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading contests...
          </div>
        ) : contests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            No {activeTab} contests found at the moment.
          </div>
        ) : (
          contests.map((contest) => (
            <div
              key={contest.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{contest.title}</h3>
                  {contest.is_registered && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Registered</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(contest.start_time).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{contest.problems_count} Problems</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{Math.round(contest.duration_minutes / 60)} Hours</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{contest.participants_count} Participants</span>
                  </span>
                </div>
              </div>

              {/* Right Side: Countdown badge & Action button matching Panel 10 */}
              <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                {/* Countdown Timer Badge matching Panel 10 */}
                <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-semibold flex items-center space-x-1.5">
                  <Timer className="w-3.5 h-3.5 text-purple-400" />
                  <span>{getTimeRemaining(contest.start_time)}</span>
                </div>

                {contest.is_registered ? (
                  <Link
                    to={`/contests/${contest.id}`}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all text-center"
                  >
                    Enter Arena
                  </Link>
                ) : (
                  <button
                    onClick={() => handleRegister(contest.id)}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
