import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  MessageCircle,
  Eye,
  CheckCircle,
  Bookmark,
  X
} from 'lucide-react';

const CommunityPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'bookmarks'
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ask question modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Data Structures');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [activeTab, selectedTag, search]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await communityAPI.getQuestions({
        tab: activeTab,
        tag: selectedTag !== 'All' ? selectedTag : '',
        search: search.trim()
      });
      if (res.data.success) {
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load discussions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e, qId, direction) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await communityAPI.voteQuestion(qId, { direction });
      if (res.data.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === qId
              ? { ...q, upvotes_count: res.data.upvotes_count, user_voted: res.data.user_voted }
              : q
          )
        );
      }
    } catch (err) {
      addToast('Please login to vote on questions', 'error');
    }
  };

  const handleToggleBookmark = async (e, qId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await communityAPI.toggleBookmark(qId);
      if (res.data.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === qId ? { ...q, is_bookmarked: res.data.is_bookmarked } : q
          )
        );
        addToast(res.data.message, 'info');
      }
    } catch (err) {
      addToast('Please login to bookmark discussions', 'error');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      addToast('Title and question details are required', 'error');
      return;
    }

    setIsPosting(true);
    try {
      const res = await communityAPI.createQuestion({
        title: newTitle.trim(),
        category: newCategory,
        tags: newTags.trim(),
        content: newContent.trim()
      });
      if (res.data.success) {
        addToast('Question published to community!', 'success');
        setShowAskModal(false);
        setNewTitle('');
        setNewTags('');
        setNewContent('');
        fetchQuestions();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post question. Please login.', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header matching Panel 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            <span>Community</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask questions, share knowledge, and help others
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* Tabs matching Panel 8: All Questions, My Questions, Bookmarks */}
      <div className="flex items-center space-x-1 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Questions
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Questions
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Bookmarks
        </button>
      </div>

      {/* Search and Tag Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Tags</option>
          <option value="python">python</option>
          <option value="java">java</option>
          <option value="linked-list">linked-list</option>
          <option value="dynamic-programming">dynamic-programming</option>
          <option value="system-design">system-design</option>
          <option value="optimization">optimization</option>
        </select>
      </div>

      {/* Question Cards Feed matching Panel 8 */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading community questions...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            No questions found. Be the first to ask!
          </div>
        ) : (
          questions.map((q) => (
            <Link
              key={q.id}
              to={`/community/${q.id}`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group block"
            >
              <div className="flex items-start space-x-4 flex-1">
                <img
                  src={q.author_avatar}
                  alt={q.author_name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/20 flex-shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {q.title}
                    </h3>
                    {q.accepted_answer_id && (
                      <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-400" title="Solved / Accepted Answer">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {q.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700/60 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Asked by <span className="text-slate-300 font-medium">{q.author_name}</span> ({q.author_reputation} pts) • {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats & Actions (Matching Panel 8 right side: upvotes, answers, bookmark) */}
              <div className="flex items-center space-x-4 text-xs text-slate-400 self-end sm:self-auto">
                {/* Upvotes */}
                <button
                  onClick={(e) => handleVote(e, q.id, 1)}
                  className={`flex items-center space-x-1 p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                    q.user_voted === 1 ? 'text-indigo-400 font-bold' : ''
                  }`}
                  title="Upvote"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${q.user_voted === 1 ? 'fill-indigo-400' : ''}`} />
                  <span>{q.upvotes_count}</span>
                </button>

                {/* Answers count */}
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>{q.answers_count}</span>
                </div>

                {/* Views count */}
                <div className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{q.views_count}</span>
                </div>

                {/* Bookmark */}
                <button
                  onClick={(e) => handleToggleBookmark(e, q.id)}
                  className="p-1 rounded-lg hover:text-amber-400 transition-colors"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${q.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
                  />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Ask a Question</h3>
              <button onClick={() => setShowAskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to optimize this DP memoization?"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Data Structures">Data Structures</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="System Design">System Design</option>
                    <option value="Object Oriented Programming">Object Oriented Programming</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="python, dsa, tree"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Question Details / Code</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe your question in detail. Include what you tried and error messages..."
                  rows={6}
                  required
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isPosting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
