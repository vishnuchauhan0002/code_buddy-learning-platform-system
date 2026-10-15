import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ChevronLeft,
  ThumbsUp,
  Bookmark,
  CheckCircle,
  MessageCircle,
  Send,
  Eye,
  Check
} from 'lucide-react';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [isPostingAnswer, setIsPostingAnswer] = useState(false);

  useEffect(() => {
    fetchQuestionDetails();
  }, [id]);

  const fetchQuestionDetails = async () => {
    setLoading(true);
    try {
      const res = await communityAPI.getQuestion(id);
      if (res.data.success) {
        setQuestion(res.data.question);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load discussion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async (direction) => {
    try {
      const res = await communityAPI.voteQuestion(id, { direction });
      if (res.data.success) {
        setQuestion((prev) => ({
          ...prev,
          upvotes_count: res.data.upvotes_count,
          user_voted: res.data.user_voted
        }));
      }
    } catch (err) {
      addToast('Please login to vote', 'error');
    }
  };

  const handleVoteAnswer = async (ansId, direction) => {
    try {
      const res = await communityAPI.voteAnswer(ansId, { direction });
      if (res.data.success) {
        setQuestion((prev) => ({
          ...prev,
          answers: prev.answers.map((a) =>
            a.id === ansId
              ? { ...a, upvotes_count: res.data.upvotes_count, user_voted: res.data.user_voted }
              : a
          )
        }));
      }
    } catch (err) {
      addToast('Please login to vote on answers', 'error');
    }
  };

  const handleAcceptAnswer = async (ansId) => {
    try {
      const res = await communityAPI.acceptAnswer(id, ansId);
      if (res.data.success) {
        addToast('Marked as accepted answer!', 'success');
        fetchQuestionDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to accept answer', 'error');
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) {
      addToast('Answer content cannot be empty', 'error');
      return;
    }

    setIsPostingAnswer(true);
    try {
      const res = await communityAPI.postAnswer(id, { content: newAnswer.trim() });
      if (res.data.success) {
        addToast('Answer posted! Thank you for helping.', 'success');
        setNewAnswer('');
        fetchQuestionDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post answer. Please login.', 'error');
    } finally {
      setIsPostingAnswer(false);
    }
  };

  if (loading || !question) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAuthor = user && user.id === question.user_id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/community"
        className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Discussions</span>
      </Link>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <img
              src={question.author_avatar}
              alt={question.author_name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h1 className="text-xl font-bold text-white leading-snug">{question.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Posted by <span className="text-slate-200 font-medium">{question.author_name}</span> ({question.author_reputation} pts) • {new Date(question.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Upvote & Bookmark */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => handleVoteQuestion(1)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs ${
                question.user_voted === 1
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${question.user_voted === 1 ? 'fill-indigo-400' : ''}`} />
              <span>{question.upvotes_count} Upvotes</span>
            </button>
          </div>
        </div>

        {/* Question content */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
          {question.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {question.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-md text-[10px] bg-slate-800 border border-slate-700/60 text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <span>{question.answers?.length || 0} Answers</span>
        </h3>

        {question.answers?.map((ans) => (
          <div
            key={ans.id}
            className={`p-6 rounded-2xl border transition-all space-y-4 ${
              ans.is_accepted
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={ans.author_avatar}
                  alt={ans.author_name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                />
                <div>
                  <h4 className="text-xs font-semibold text-white">{ans.author_name}</h4>
                  <p className="text-[10px] text-slate-400">{ans.author_reputation} reputation points</p>
                </div>
              </div>

              {ans.is_accepted && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Accepted Answer</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {ans.content}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
              <button
                onClick={() => handleVoteAnswer(ans.id, 1)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-colors ${
                  ans.user_voted === 1
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${ans.user_voted === 1 ? 'fill-indigo-400' : ''}`} />
                <span>{ans.upvotes_count}</span>
              </button>

              {isAuthor && !ans.is_accepted && (
                <button
                  onClick={() => handleAcceptAnswer(ans.id)}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Solution</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post Your Answer Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Your Answer</h3>
        <form onSubmit={handlePostAnswer} className="space-y-3">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your explanation or code solution here..."
            rows={5}
            required
            className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPostingAnswer}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPostingAnswer ? 'Submitting...' : 'Post Your Answer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
