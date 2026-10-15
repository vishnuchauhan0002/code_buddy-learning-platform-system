import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { problemsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Code2,
  Search,
  Filter,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ProblemsPage = () => {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });

  const currentSearch = searchParams.get('search') || '';
  const currentDifficulty = searchParams.get('difficulty') || 'All';
  const currentTopic = searchParams.get('topic') || 'All';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchProblems();
  }, [currentSearch, currentDifficulty, currentTopic, currentPage]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await problemsAPI.getProblems({
        search: currentSearch,
        difficulty: currentDifficulty,
        topic: currentTopic,
        page: currentPage,
        per_page: 8
      });
      if (res.data.success) {
        setProblems(res.data.problems);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load problems', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleDifficultyChange = (diff) => {
    const params = new URLSearchParams(searchParams);
    params.set('difficulty', diff);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleTopicChange = (top) => {
    const params = new URLSearchParams(searchParams);
    params.set('topic', top);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleToggleBookmark = async (e, problemId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await problemsAPI.toggleBookmark(problemId);
      if (res.data.success) {
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, is_bookmarked: res.data.bookmarked } : p))
        );
        addToast(res.data.message, 'info');
      }
    } catch (err) {
      addToast('Please login to bookmark problems', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header matching Panel 6 */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Code2 className="w-6 h-6 text-indigo-400" />
          <span>Problem Practice</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Sharpen your skills with coding problems
        </p>
      </div>

      {/* Filter and Search Bar matching Panel 6 */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search problems by title, topic..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={currentDifficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="w-full md:w-36 px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Topic Filter */}
          <select
            value={currentTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Topics</option>
            <option value="Arrays">Arrays & Hashing</option>
            <option value="String">Strings</option>
            <option value="Linked List">Linked Lists</option>
            <option value="Stack">Stacks & Queues</option>
            <option value="DP">Dynamic Programming</option>
            <option value="Searching">Searching & Sorting</option>
            <option value="Two Pointers">Two Pointers</option>
          </select>
        </div>
      </div>

      {/* Problem Practice Table (Matching Panel 6) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4 w-32">Difficulty</th>
                <th className="py-3.5 px-4 w-32">Acceptance</th>
                <th className="py-3.5 px-4 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading problems...
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    No problems found matching criteria.
                  </td>
                </tr>
              ) : (
                problems.map((prob) => (
                  <tr
                    key={prob.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Index & Solved check */}
                    <td className="py-4 px-4 text-center font-mono text-slate-400">
                      {prob.is_solved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <span>{prob.id}</span>
                      )}
                    </td>

                    {/* Title + Topic tags */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors text-sm"
                        >
                          {prob.title}
                        </Link>
                        <button
                          onClick={(e) => handleToggleBookmark(e, prob.id)}
                          className="text-slate-500 hover:text-amber-400 transition-colors"
                          title="Bookmark Problem"
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              prob.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {prob.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700/60 text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          prob.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : prob.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>

                    {/* Acceptance */}
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {prob.acceptance_rate}%
                    </td>

                    {/* Action Button matching Panel 6 */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/problems/${prob.id}`}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors inline-block"
                      >
                        Solve
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar matching Panel 6 */}
        <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {problems.length} of {pagination.total} problems
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(pagination.total_pages || 1)].map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    pNum === currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.total_pages}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
