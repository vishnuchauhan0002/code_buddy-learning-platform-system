import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Users,
  Code2,
  Trophy,
  Activity,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  X
} from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'add-problem', 'logs'
  const [loading, setLoading] = useState(true);

  // New problem form
  const [probTitle, setProbTitle] = useState('');
  const [probDifficulty, setProbDifficulty] = useState('Easy');
  const [probTopic, setProbTopic] = useState('Arrays');
  const [probTags, setProbTags] = useState('arrays, hashing');
  const [probDescription, setProbDescription] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [testCaseInput, setTestCaseInput] = useState('');
  const [testCaseOutput, setTestCaseOutput] = useState('');
  const [isCreatingProb, setIsCreatingProb] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminAPI.getStats();
      if (statsRes.data.success) setStats(statsRes.data.stats);

      if (activeTab === 'users') {
        const usersRes = await adminAPI.listUsers();
        if (usersRes.data.success) setUsers(usersRes.data.users || []);
      } else if (activeTab === 'logs') {
        const logsRes = await adminAPI.getAuditLogs();
        if (logsRes.data.success) setAuditLogs(logsRes.data.logs || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminAPI.updateRole(userId, { role: newRole });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      const res = await adminAPI.toggleStatus(userId, { is_active: !currentActive });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u))
        );
      }
    } catch (err) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    setIsCreatingProb(true);
    try {
      const res = await adminAPI.createProblem({
        title: probTitle,
        difficulty: probDifficulty,
        topic: probTopic,
        tags: probTags,
        description: probDescription,
        sample_input: sampleInput,
        sample_output: sampleOutput,
        test_cases: [
          { input: sampleInput, output: sampleOutput, is_hidden: false },
          { input: testCaseInput || sampleInput, output: testCaseOutput || sampleOutput, is_hidden: true }
        ]
      });
      if (res.data.success) {
        addToast('Problem created and published to library!', 'success');
        setProbTitle('');
        setProbDescription('');
        setSampleInput('');
        setSampleOutput('');
        setTestCaseInput('');
        setTestCaseOutput('');
        setActiveTab('users');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create problem', 'error');
    } finally {
      setIsCreatingProb(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-rose-400 text-sm">
        Access denied. Administrator privileges required.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Platform management, moderation, user roles, and problem curation
        </p>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
            <p className="text-2xl font-bold text-white">{stats.total_users}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">DSA Problems</span>
            <p className="text-2xl font-bold text-indigo-400">{stats.total_problems}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Code Submissions</span>
            <p className="text-2xl font-bold text-emerald-400">{stats.total_submissions}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Community Questions</span>
            <p className="text-2xl font-bold text-purple-400">{stats.total_questions}</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent text-slate-400'
          }`}
        >
          User Accounts
        </button>
        <button
          onClick={() => setActiveTab('add-problem')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'add-problem' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent text-slate-400'
          }`}
        >
          Add DSA Problem
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'logs' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent text-slate-400'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab 1: User Accounts */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {u.profile?.full_name || u.username}
                    <span className="text-slate-400 font-normal block text-[11px]">@{u.username}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        u.is_active
                          ? 'text-rose-400 hover:bg-rose-500/10'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.is_active ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Add Problem */}
      {activeTab === 'add-problem' && (
        <form onSubmit={handleCreateProblem} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs max-w-2xl">
          <h3 className="text-base font-bold text-white">Publish New Problem</h3>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Title</label>
            <input
              type="text"
              value={probTitle}
              onChange={(e) => setProbTitle(e.target.value)}
              placeholder="e.g. Reverse Linked List"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Difficulty</label>
              <select
                value={probDifficulty}
                onChange={(e) => setProbDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Topic</label>
              <input
                type="text"
                value={probTopic}
                onChange={(e) => setProbTopic(e.target.value)}
                placeholder="Arrays, Dynamic Programming"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={probTags}
              onChange={(e) => setProbTags(e.target.value)}
              placeholder="arrays, two-pointers"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              value={probDescription}
              onChange={(e) => setProbDescription(e.target.value)}
              rows={4}
              required
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Sample Input</label>
              <textarea
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Sample Output</label>
              <textarea
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Hidden Test Input</label>
              <textarea
                value={testCaseInput}
                onChange={(e) => setTestCaseInput(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Hidden Test Output</label>
              <textarea
                value={testCaseOutput}
                onChange={(e) => setTestCaseOutput(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreatingProb}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
          >
            {isCreatingProb ? 'Publishing...' : 'Publish Problem'}
          </button>
        </form>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h3 className="text-sm font-bold text-white">System Audit Trail</h3>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No audit logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs flex justify-between">
                  <div>
                    <span className="font-semibold text-indigo-400">{log.action}</span>
                    <p className="text-slate-300 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
