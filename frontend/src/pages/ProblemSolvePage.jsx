import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { problemsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Code2,
  Play,
  CheckCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Cpu,
  History,
  FileText,
  Lightbulb,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const ProblemSolvePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'hints', 'solution', 'submissions'
  const [submissions, setSubmissions] = useState([]);

  // Editor states
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    fetchProblemDetails();
  }, [id]);

  const fetchProblemDetails = async () => {
    setLoading(true);
    setRunResult(null);
    setSubmissionResult(null);
    try {
      const res = await problemsAPI.getProblem(id);
      if (res.data.success) {
        const prob = res.data.data;
        setProblem(prob);
        setCustomInput(prob.sample_input || '');

        // Load starter code
        if (prob.starter_code && prob.starter_code[language]) {
          setCode(prob.starter_code[language]);
        } else if (prob.starter_code && prob.starter_code.python) {
          setCode(prob.starter_code.python);
        } else {
          setCode('# Write your solution here\n');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load problem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem?.starter_code && problem.starter_code[newLang]) {
      setCode(problem.starter_code[newLang]);
    }
    addToast(`Switched language to ${newLang}`, 'info');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      addToast('Please enter some code', 'error');
      return;
    }

    setIsRunning(true);
    setRunResult(null);
    try {
      const res = await problemsAPI.runCode(id, {
        code,
        language,
        input: customInput
      });
      if (res.data.success) {
        setRunResult(res.data);
        addToast('Executed against sample input', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Run failed', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      addToast('Please enter some code', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await problemsAPI.submitSolution(id, {
        code,
        language
      });
      if (res.data.success) {
        setSubmissionResult(res.data);
        if (res.data.passed) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addToast('🎉 Accepted! Points and streak updated.', 'success');
        } else {
          addToast(`Submission Result: ${res.data.submission?.status}`, 'error');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Submission failed. Please log in.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await problemsAPI.toggleBookmark(id);
      if (res.data.success) {
        setProblem((prev) => ({ ...prev, is_bookmarked: res.data.bookmarked }));
        addToast(res.data.message, 'info');
      }
    } catch (err) {
      addToast('Please log in to bookmark problems', 'error');
    }
  };

  const loadSubmissions = async () => {
    setActiveTab('submissions');
    try {
      const res = await problemsAPI.getSubmissions({ problem_id: id });
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      addToast('Please log in to view submission history', 'error');
    }
  };

  if (loading || !problem) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading problem details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Navigation & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Link
            to="/problems"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Problems"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {problem.id}. {problem.title}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  problem.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : problem.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {problem.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Topic: {problem.topic} • Points: {problem.points}
            </p>
          </div>
        </div>

        {/* Prev / Next & Bookmark */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleBookmark}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Bookmark"
          >
            <Bookmark
              className={`w-4 h-4 ${problem.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
            />
          </button>

          <button
            onClick={() => problem.prev_id && navigate(`/problems/${problem.prev_id}`)}
            disabled={!problem.prev_id}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-30 flex items-center space-x-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => problem.next_id && navigate(`/problems/${problem.next_id}`)}
            disabled={!problem.next_id}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-30 flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Description on Left, Editor on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left Panel: Tabs for Problem Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex flex-col overflow-hidden">
          {/* Tabs bar */}
          <div className="flex items-center space-x-1 px-4 pt-2 border-b border-slate-800 bg-slate-950/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-2 border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'description'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`px-3 py-2 border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'hints'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hints ({problem.hints?.length || 0})</span>
            </button>
            <button
              onClick={loadSubmissions}
              className={`px-3 py-2 border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'submissions'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300 leading-relaxed scrollbar-thin">
            {activeTab === 'description' && (
              <>
                <div className="whitespace-pre-line text-slate-200 text-sm">
                  {problem.description}
                </div>

                {/* Constraints */}
                {problem.constraints && (
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <h4 className="text-xs font-semibold text-slate-200">Constraints:</h4>
                    <pre className="font-mono text-[11px] text-slate-400 whitespace-pre-wrap">{problem.constraints}</pre>
                  </div>
                )}

                {/* Sample I/O */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white">Sample Test Case</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      <span className="text-slate-500 block mb-1 font-sans text-[10px] uppercase font-semibold">Input</span>
                      <pre className="whitespace-pre-wrap text-slate-300">{problem.sample_input}</pre>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      <span className="text-slate-500 block mb-1 font-sans text-[10px] uppercase font-semibold">Expected Output</span>
                      <pre className="whitespace-pre-wrap text-emerald-300">{problem.sample_output}</pre>
                    </div>
                  </div>
                  {problem.sample_explanation && (
                    <p className="text-slate-400 italic text-[11px]">
                      <strong>Explanation:</strong> {problem.sample_explanation}
                    </p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Problem Hints</h3>
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-800/50 border border-indigo-500/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400">Hint {idx + 1}</span>
                      <p className="text-xs text-slate-300">{hint}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No hints available for this problem.</p>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Your Past Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-slate-500 text-center py-6">No submissions recorded yet.</p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className={`font-semibold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status}
                        </span>
                        <span className="text-slate-500">• {sub.language}</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {sub.execution_time}s • {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor + Run/Submit Console */}
        <div className="flex flex-col space-y-4 min-h-0">
          {/* Editor Header */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {isRunning ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-slate-300" />
                  )}
                  <span>Run Code</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || isRunning}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 4,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>

          {/* Output / Test Case Evaluation Result Bar */}
          <div className="h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col">
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Test Result / Console</span>
              {submissionResult && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${submissionResult.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  ● {submissionResult.submission?.status} ({submissionResult.passed_test_cases}/{submissionResult.total_test_cases} Passed)
                </span>
              )}
            </div>

            <div className="flex-1 p-3.5 bg-slate-950 font-mono text-xs overflow-y-auto whitespace-pre-wrap">
              {isRunning && (
                <div className="text-indigo-400 flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span>Running code...</span>
                </div>
              )}

              {isSubmitting && (
                <div className="text-indigo-400 flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span>Evaluating against all hidden and visible test cases...</span>
                </div>
              )}

              {runResult && !isRunning && !isSubmitting && (
                <div className="space-y-2">
                  <div className="text-slate-400 font-sans text-[11px] font-semibold">Sample Execution:</div>
                  <div className="text-slate-200">{runResult.result?.stdout || 'No output'}</div>
                  {runResult.result?.stderr && (
                    <div className="text-rose-400">{runResult.result.stderr}</div>
                  )}
                </div>
              )}

              {submissionResult && !isSubmitting && (
                <div className="space-y-1">
                  <div className={`font-semibold ${submissionResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {submissionResult.passed ? 'Accepted!' : submissionResult.submission?.status}
                  </div>
                  {submissionResult.submission?.error_message && (
                    <div className="text-rose-400 text-[11px]">{submissionResult.submission.error_message}</div>
                  )}
                  <div className="text-slate-400 text-[11px] pt-1 font-sans">
                    Passed {submissionResult.passed_test_cases} of {submissionResult.total_test_cases} test cases • Time: {submissionResult.submission?.execution_time}s
                  </div>
                </div>
              )}

              {!runResult && !submissionResult && !isRunning && !isSubmitting && (
                <div className="text-slate-600">Click "Run Code" to test or "Submit Solution" to evaluate.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvePage;
