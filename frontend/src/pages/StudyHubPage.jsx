import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studyAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Sparkles,
  Layers,
  Repeat,
  Compass,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Eye,
  RotateCw,
  Copy,
  Check,
  Play,
  Lightbulb,
  Zap,
  Clock,
  Award,
  ExternalLink
} from 'lucide-react';

export default function StudyHubPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('diagrams'); // 'diagrams' | 'flashcards' | 'roadmap' | 'big-o'
  
  // Data states
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('two-pointers');
  const [flashcards, setFlashcards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterTopic, setFilterTopic] = useState('All');
  const [studiedCount, setStudiedCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Big-O Simulator state
  const [inputN, setInputN] = useState(100);

  // Tree visualizer state
  const [treeInverted, setTreeInverted] = useState(false);
  const [highlightedNode, setHighlightedNode] = useState(null);

  // Two Pointers visualizer state
  const [pointerLeft, setPointerLeft] = useState(0);
  const [pointerRight, setPointerRight] = useState(4);
  const sortedArray = [2, 7, 11, 15, 20];
  const targetSum = 18;

  // Linked list visualizer state
  const [reverseStep, setReverseStep] = useState(0);

  // Roadmaps state
  const [roadmaps, setRoadmaps] = useState([]);
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('codebuddy_completed_roadmap_days');
    return saved ? JSON.parse(saved) : [1, 2, 3, 5, 8, 11];
  });

  useEffect(() => {
    // Fetch visual sheets
    studyAPI.getVisualSheets()
      .then(res => {
        if (res.data.success) {
          setSheets(res.data.sheets);
        }
      })
      .catch(() => {});

    // Fetch flashcards
    studyAPI.getFlashcards()
      .then(res => {
        if (res.data.success) {
          setFlashcards(res.data.cards);
        }
      })
      .catch(() => {});

    // Fetch roadmaps
    studyAPI.getRoadmaps()
      .then(res => {
        if (res.data.success) {
          setRoadmaps(res.data.roadmaps);
        }
      })
      .catch(() => {});
  }, []);

  const currentSheet = sheets.find(s => s.id === selectedSheetId) || sheets[0];

  const filteredCards = filterTopic === 'All'
    ? flashcards
    : flashcards.filter(c => c.topic.toLowerCase().includes(filterTopic.toLowerCase()));

  const currentCard = filteredCards[cardIndex] || flashcards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleRateCard = (quality) => {
    setStudiedCount(prev => prev + 1);
    addToast(`Card marked as ${quality}! Spaced repetition interval updated.`, 'success');
    handleNextCard();
  };

  const toggleDayCompletion = (dayNum) => {
    setCompletedDays(prev => {
      const next = prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum];
      localStorage.setItem('codebuddy_completed_roadmap_days', JSON.stringify(next));
      return next;
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    addToast('Code snippet copied to clipboard', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Two pointer step logic
  const handleTwoPointerStep = () => {
    if (pointerLeft >= pointerRight) {
      setPointerLeft(0);
      setPointerRight(sortedArray.length - 1);
      return;
    }
    const sum = sortedArray[pointerLeft] + sortedArray[pointerRight];
    if (sum === targetSum) {
      addToast(`Target found: ${sortedArray[pointerLeft]} + ${sortedArray[pointerRight]} = ${targetSum}!`, 'success');
    } else if (sum < targetSum) {
      setPointerLeft(prev => prev + 1);
    } else {
      setPointerRight(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Study Hub & Visual Cheatsheets</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              DSA Visualizer & Spaced Repetition
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Master complex data structures with interactive step-by-step diagrams, active-recall flashcards, and a structured 30-day FAANG interview roadmap.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-assistant"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </Link>
            <Link
              to="/problems"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Solve Problems</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-8 pt-4 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'diagrams', name: 'Visual Algorithm Pictures', icon: Layers },
            { id: 'flashcards', name: 'Active-Recall Flashcards', icon: Repeat },
            { id: 'roadmap', name: '30-Day FAANG Roadmap', icon: Compass },
            { id: 'big-o', name: 'Big-O Growth Visualizer', icon: BarChart2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: VISUAL ALGORITHM DIAGRAMS / PICTURES */}
      {activeTab === 'diagrams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Index */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 px-1">
              Select Concept Diagram
            </h2>
            <div className="space-y-2">
              {sheets.map((sheet) => {
                const isSelected = sheet.id === selectedSheetId;
                return (
                  <button
                    key={sheet.id}
                    onClick={() => setSelectedSheetId(sheet.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {sheet.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {sheet.timeComplexity}
                        </span>
                      </div>
                      <h3 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {sheet.title}
                      </h3>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Interactive Visualizer Area */}
          <div className="lg:col-span-8 space-y-6">
            {currentSheet && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-xl">
                {/* Title & Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {currentSheet.title}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {currentSheet.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg">
                      Time: {currentSheet.timeComplexity}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg">
                      Space: {currentSheet.spaceComplexity}
                    </span>
                  </div>
                </div>

                {/* INTERACTIVE VISUAL CANVAS */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col justify-center items-center relative overflow-hidden">
                  {/* Two Pointers Canvas */}
                  {currentSheet.id === 'two-pointers' && (
                    <div className="w-full space-y-6 py-4">
                      <div className="text-center space-y-1">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                          Target Sum: <strong className="text-indigo-400 text-sm">{targetSum}</strong> · Current Sum:{' '}
                          <strong className="text-emerald-400 text-sm">
                            {sortedArray[pointerLeft]} + {sortedArray[pointerRight]} = {sortedArray[pointerLeft] + sortedArray[pointerRight]}
                          </strong>
                        </span>
                      </div>

                      {/* Array elements with pointers */}
                      <div className="flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto py-2">
                        {sortedArray.map((num, idx) => {
                          const isLeft = idx === pointerLeft;
                          const isRight = idx === pointerRight;
                          const isMatch = (pointerLeft < pointerRight) && (sortedArray[pointerLeft] + sortedArray[pointerRight] === targetSum) && (isLeft || isRight);

                          return (
                            <div key={idx} className="flex flex-col items-center space-y-2">
                              {/* Left Pointer label */}
                              <div className="h-6 flex items-center justify-center">
                                {isLeft && (
                                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/40 animate-pulse">
                                    Left (L)
                                  </span>
                                )}
                              </div>

                              {/* Number Box */}
                              <div
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold border-2 transition-all ${
                                  isMatch
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 scale-105 shadow-lg shadow-emerald-500/30'
                                    : isLeft || isRight
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                {num}
                              </div>

                              {/* Right Pointer label */}
                              <div className="h-6 flex items-center justify-center">
                                {isRight && (
                                  <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40 animate-pulse">
                                    Right (R)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleTwoPointerStep}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Advance One Step</span>
                        </button>
                        <button
                          onClick={() => {
                            setPointerLeft(0);
                            setPointerRight(sortedArray.length - 1);
                          }}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700/60 transition-all"
                        >
                          Reset Pointers
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tree Inversion Canvas */}
                  {currentSheet.id === 'tree-inversion' && (
                    <div className="w-full space-y-6 py-2 flex flex-col items-center">
                      <div className="text-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {treeInverted ? 'Mirror Inverted Binary Tree' : 'Standard Binary Tree'}
                        </span>
                      </div>

                      {/* SVG Visual Tree */}
                      <svg className="w-72 sm:w-96 h-48 overflow-visible" viewBox="0 0 320 180">
                        {/* Connecting lines */}
                        <line x1="160" y1="30" x2={treeInverted ? "240" : "80"} y2="90" stroke="#4f46e5" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="160" y1="30" x2={treeInverted ? "80" : "240"} y2="90" stroke="#4f46e5" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1={treeInverted ? "240" : "80"} y1="90" x2={treeInverted ? "270" : "50"} y2="150" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1={treeInverted ? "240" : "80"} y1="90" x2={treeInverted ? "210" : "110"} y2="150" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1={treeInverted ? "80" : "240"} y1="90" x2={treeInverted ? "110" : "210"} y2="150" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1={treeInverted ? "80" : "240"} y1="90" x2={treeInverted ? "50" : "270"} y2="150" stroke="#6366f1" strokeWidth="1.5" />

                        {/* Root Node (4) */}
                        <circle cx="160" cy="30" r="18" fill="#4338ca" stroke="#818cf8" strokeWidth="2" />
                        <text x="160" y="35" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">4</text>

                        {/* Level 1 Nodes */}
                        <circle cx={treeInverted ? "240" : "80"} cy="90" r="16" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
                        <text x={treeInverted ? "240" : "80"} y="95" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="12">
                          {treeInverted ? '7' : '2'}
                        </text>

                        <circle cx={treeInverted ? "80" : "240"} cy="90" r="16" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
                        <text x={treeInverted ? "80" : "240"} y="95" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="12">
                          {treeInverted ? '2' : '7'}
                        </text>

                        {/* Level 2 Leaves */}
                        <circle cx={treeInverted ? "270" : "50"} cy="150" r="13" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
                        <text x={treeInverted ? "270" : "50"} y="154" textAnchor="middle" fill="#c7d2fe" fontSize="11">
                          {treeInverted ? '9' : '1'}
                        </text>

                        <circle cx={treeInverted ? "210" : "110"} cy="150" r="13" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
                        <text x={treeInverted ? "210" : "110"} y="154" textAnchor="middle" fill="#c7d2fe" fontSize="11">
                          {treeInverted ? '6' : '3'}
                        </text>

                        <circle cx={treeInverted ? "110" : "210"} cy="150" r="13" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
                        <text x={treeInverted ? "110" : "210"} y="154" textAnchor="middle" fill="#c7d2fe" fontSize="11">
                          {treeInverted ? '3' : '6'}
                        </text>

                        <circle cx={treeInverted ? "50" : "270"} cy="150" r="13" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
                        <text x={treeInverted ? "50" : "270"} y="154" textAnchor="middle" fill="#c7d2fe" fontSize="11">
                          {treeInverted ? '1' : '9'}
                        </text>
                      </svg>

                      {/* Interactive Inversion Toggle */}
                      <button
                        onClick={() => {
                          setTreeInverted(!treeInverted);
                          addToast(treeInverted ? 'Reset to original BST' : 'Binary Tree Mirrored Inverted!', 'info');
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 flex items-center space-x-2 transition-all"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>{treeInverted ? 'Reset Original Tree' : 'Invert Left & Right Subtrees'}</span>
                      </button>
                    </div>
                  )}

                  {/* Linked List Canvas */}
                  {currentSheet.id === 'linked-list-reversal' && (
                    <div className="w-full space-y-6 py-4 flex flex-col items-center">
                      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2">
                        {[1, 2, 3, 4].map((val, idx) => (
                          <React.Fragment key={idx}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/60 flex items-center justify-center font-bold text-white text-base shadow-md">
                              {val}
                            </div>
                            {idx < 3 && (
                              <div className="flex items-center text-indigo-400">
                                {reverseStep % 2 === 1 ? (
                                  <ArrowLeft className="w-6 h-6 text-amber-400 animate-pulse" />
                                ) : (
                                  <ArrowRight className="w-6 h-6 text-indigo-400" />
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="text-center text-xs text-slate-400 max-w-md">
                        {reverseStep % 2 === 1 ? (
                          <span className="text-amber-400 font-medium">
                            Step 2: Direction reversed! `curr.next = prev`. Pointers shifting to next node.
                          </span>
                        ) : (
                          <span>
                            Step 1: Save `next_temp = curr.next`. Pointer arrow is still pointing forward.
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setReverseStep(prev => prev + 1)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Step Next Pointer Shift</span>
                      </button>
                    </div>
                  )}

                  {/* DP Table Canvas */}
                  {currentSheet.id === 'dp-grid' && (
                    <div className="w-full space-y-4 py-2 flex flex-col items-center">
                      <span className="text-xs font-semibold text-slate-400">
                        Formula: <code className="text-indigo-400">dp[i][j] = dp[i-1][j] + dp[i][j-1]</code>
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {['1', '1', '1', '1', '1', '2', '3', '4', '1', '3', '6', '10'].map((cell, idx) => (
                          <div
                            key={idx}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border ${
                              idx === 11
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-extrabold ring-2 ring-emerald-500/40'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {cell}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-emerald-400 font-medium">
                        Target cell [2][3] = 10 unique paths from start to finish!
                      </span>
                    </div>
                  )}

                  {/* Cycle Detection / Graph Fallback */}
                  {(currentSheet.id === 'fast-slow-pointers' || currentSheet.id === 'graph-traversal') && (
                    <div className="w-full text-center space-y-4 py-6">
                      <div className="inline-flex items-center space-x-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500 flex items-center justify-center text-indigo-400 font-bold">
                          BFS
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500" />
                        <div className="text-left text-xs space-y-0.5">
                          <p className="text-white font-semibold">Queue (FIFO) Layer-by-Layer</p>
                          <p className="text-slate-400">Guarantees shortest path in unweighted networks.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Code Template Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Standard Python Template
                    </span>
                    <button
                      onClick={() => handleCopyCode(currentSheet.codeTemplate)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-indigo-300 overflow-x-auto leading-relaxed">
                    {currentSheet.codeTemplate}
                  </pre>
                </div>

                {/* Best For Problems */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    High-Frequency Interview Problems Using This Pattern:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentSheet.bestFor?.map((prob, i) => (
                      <Link
                        key={i}
                        to={`/problems?search=${encodeURIComponent(prob)}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center space-x-1"
                      >
                        <span>{prob}</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE RECALL FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Topic:</span>
              {['All', 'Arrays', 'Window', 'Trees', 'DP', 'Graphs'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilterTopic(t);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterTopic === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              Card <strong className="text-white">{cardIndex + 1}</strong> of <strong className="text-white">{filteredCards.length}</strong> · Studied: <strong className="text-emerald-400">{studiedCount}</strong>
            </div>
          </div>

          {/* Flashcard Item with Flip Animation */}
          {currentCard && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer select-none perspective min-h-[360px] relative rounded-3xl p-8 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/50 shadow-2xl flex flex-col justify-between transition-all group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {currentCard.topic}
                </span>
                <span className="text-xs text-slate-500 flex items-center space-x-1">
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Click anywhere to flip</span>
                </span>
              </div>

              {/* Card Body */}
              {!isFlipped ? (
                // FRONT OF CARD
                <div className="space-y-4 py-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentCard.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {currentCard.question}
                  </p>
                </div>
              ) : (
                // BACK OF CARD
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Core Algorithmic Insight
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {currentCard.concept}
                    </p>
                  </div>

                  {currentCard.codeSnippet && (
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-indigo-300 overflow-x-auto">
                      {currentCard.codeSnippet}
                    </pre>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400">Time: <strong className="text-white">{currentCard.timeComplexity}</strong></span>
                      <span className="text-slate-400">Space: <strong className="text-white">{currentCard.spaceComplexity}</strong></span>
                    </div>
                    {currentCard.mnemonic && (
                      <div className="text-xs text-amber-300 italic flex items-center space-x-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>"{currentCard.mnemonic}"</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/40">
                <span>Difficulty: <strong className="text-amber-400">{currentCard.difficulty}</strong></span>
                <span className="text-indigo-400 font-medium">Tap to {isFlipped ? 'hide answer' : 'reveal answer'}</span>
              </div>
            </div>
          )}

          {/* Spaced Repetition Rating Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevCard}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Previous card"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextCard}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Next card"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => handleRateCard('Again')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
              >
                Again (Today)
              </button>
              <button
                onClick={() => handleRateCard('Hard')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
              >
                Hard (1 Day)
              </button>
              <button
                onClick={() => handleRateCard('Good')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
              >
                Good (3 Days)
              </button>
              <button
                onClick={() => handleRateCard('Easy')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
              >
                Easy (7 Days)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 30-DAY FAANG ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {roadmaps.map((map) => {
            const allDays = map.weeks.flatMap(w => w.days);
            const doneCount = allDays.filter(d => completedDays.includes(d.day)).length;
            const progressPercent = Math.round((doneCount / allDays.length) * 100);

            return (
              <div key={map.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {map.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {map.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-400">{progressPercent}%</span>
                    <p className="text-xs text-slate-500">{doneCount} of {allDays.length} days completed</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 4 Weeks Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {map.weeks.map((week) => (
                    <div
                      key={week.weekNumber}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Week {week.weekNumber}
                        </span>
                        <h4 className="text-sm font-semibold text-white">
                          {week.title}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {week.days.map((dayItem) => {
                          const isDone = completedDays.includes(dayItem.day);
                          return (
                            <div
                              key={dayItem.day}
                              onClick={() => toggleDayCompletion(dayItem.day)}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                                isDone
                                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                                  : 'bg-slate-900 border border-slate-800/60 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                  isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {dayItem.day}
                                </span>
                                <span>{dayItem.topic}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                                {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-indigo-400">{dayItem.problem}</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: BIG-O GROWTH SIMULATOR */}
      {activeTab === 'big-o' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <BarChart2 className="w-6 h-6 text-indigo-400" />
              <span>Interactive Big-O Operations Calculator</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Drag the input scale slider ($N$) to observe how operation counts scale across different asymptotic complexities.
            </p>
          </div>

          {/* Interactive Slider */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">
                Input Size Scale: <code className="text-indigo-400 font-bold text-base">N = {Number(inputN).toLocaleString()}</code>
              </span>
              <span className="text-xs text-slate-500">Contest limit: ~10^8 ops / second</span>
            </div>
            <input
              type="range"
              min="10"
              max="10000"
              step="10"
              value={inputN}
              onChange={(e) => setInputN(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>N = 10</span>
              <span>N = 1,000</span>
              <span>N = 5,000</span>
              <span>N = 10,000</span>
            </div>
          </div>

          {/* Calculated Complexities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { notation: 'O(1)', name: 'Constant Time', calc: 1, rating: 'Excellent', color: 'emerald' },
              { notation: 'O(log N)', name: 'Logarithmic', calc: Math.round(Math.log2(inputN) * 10) / 10, rating: 'Good', color: 'teal' },
              { notation: 'O(N)', name: 'Linear', calc: inputN, rating: 'Fair', color: 'blue' },
              { notation: 'O(N log N)', name: 'Linearithmic', calc: Math.round(inputN * Math.log2(inputN)), rating: 'Acceptable', color: 'amber' },
              { notation: 'O(N^2)', name: 'Quadratic', calc: inputN * inputN, rating: inputN > 1000 ? 'Hazardous' : 'Poor', color: 'orange' },
              { notation: 'O(2^N)', name: 'Exponential', calc: inputN > 30 ? 'Over 1 Trillion' : Math.pow(2, inputN), rating: 'Critical Hazard', color: 'rose' },
            ].map((item) => (
              <div
                key={item.notation}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white font-mono">
                    {item.notation}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    item.color === 'teal' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' :
                    item.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                    item.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    item.color === 'orange' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {item.rating}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-400">{item.name}</p>
                  <p className="text-xl font-black text-white font-mono">
                    {typeof item.calc === 'number' ? item.calc.toLocaleString() : item.calc} <span className="text-xs text-slate-500 font-sans font-normal">ops</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
