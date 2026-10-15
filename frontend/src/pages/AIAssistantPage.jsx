import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Send,
  RotateCcw,
  Trash2,
  Copy,
  Code,
  Bug,
  Lightbulb,
  Zap,
  HelpCircle,
  Bot,
  User,
  Check,
  Volume2,
  VolumeX,
  Languages,
  Activity,
  Layers,
  Cpu,
  Shield,
  ArrowRight
} from 'lucide-react';

const AI_MODELS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    sub: 'GPT-4o',
    provider: 'OpenAI',
    color: 'emerald',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgActive: 'bg-emerald-500/10',
    description: 'General tutoring, logical proofs & clean code generation'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    sub: '1.5 Pro',
    provider: 'Google',
    color: 'blue',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    bgActive: 'bg-blue-500/10',
    description: 'Deep multimodal context, Google style guide & big-O profiling'
  },
  {
    id: 'claude',
    name: 'Claude',
    sub: '3.5 Sonnet',
    provider: 'Anthropic',
    color: 'amber',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    bgActive: 'bg-amber-500/10',
    description: 'System architecture, safety audits & edge-case prevention'
  },
  {
    id: 'apple',
    name: 'Apple Intelligence',
    sub: 'On-Device',
    provider: 'Apple Silicon',
    color: 'slate',
    iconColor: 'text-slate-300',
    borderColor: 'border-slate-400/50',
    bgActive: 'bg-slate-500/10',
    description: 'Zero-cost abstractions, Swift/C++ memory idioms & low power'
  },
  {
    id: 'cloud',
    name: 'Cloud AI',
    sub: 'DeepSeek v3',
    provider: 'Cloud DeepSeek',
    color: 'purple',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgActive: 'bg-purple-500/10',
    description: 'Competitive programming hacks, bit tricks & branchless speed'
  }
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'user',
    text: 'Can you explain this recursion and analyze its complexity?',
    code: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)',
    language: 'python'
  },
  {
    id: 2,
    sender: 'assistant',
    engine: 'chatgpt',
    text: (
      "> 🤖 **Engine Active: OpenAI ChatGPT (GPT-4o)** · *Fast, versatile, structured coding tutor & debugger*\n\n" +
      "### 📘 Structured Code Explanation\n\n" +
      "This is a fundamental recursive function to calculate mathematical factorials ($n! = n \\times (n-1) \\times \\dots \\times 1$).\n\n" +
      "**Line-by-Line Breakdown:**\n" +
      "1. `def factorial(n):` defines the subproblem state taking positive integer `n`.\n" +
      "2. `if n == 0:` guards the base case: $0! = 1$ to stop the call stack from recursing infinitely.\n" +
      "3. `return n * factorial(n - 1)` decomposes the problem into smaller identical steps.\n\n" +
      "**Complexity Analysis:**\n" +
      "- **Time Complexity:** $O(N)$ linear amortized runtime.\n" +
      "- **Space Complexity:** $O(N)$ auxiliary stack frames on the call stack."
    )
  }
];

const AIAssistantPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeEngine, setActiveEngine] = useState('chatgpt');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'convert' | 'complexity'

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('codebuddy_ai_chat');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Text to Speech (Audio voice)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // Polyglot Converter State
  const [convSourceLang, setConvSourceLang] = useState('python');
  const [convTargetLang, setConvTargetLang] = useState('javascript');
  const [convCode, setConvCode] = useState(
    'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []'
  );
  const [convResult, setConvResult] = useState('');
  const [convLoading, setConvLoading] = useState(false);

  // Big-O Analyzer State
  const [analyzerCode, setAnalyzerCode] = useState(
    'def search(arr, target):\n    for item in arr:\n        if item == target:\n            return True\n    return False'
  );
  const [complexityResult, setComplexityResult] = useState(null);
  const [complexityLoading, setComplexityLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('codebuddy_ai_chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (id, text) => {
    if (!('speechSynthesis' in window)) {
      addToast('Speech synthesis not supported in this browser.', 'warning');
      return;
    }

    if (isSpeaking && speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and code symbols for smooth auditory speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted for speech.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*>-]/g, '')
      .replace(/\$([^$]+)\$/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    setIsSpeaking(true);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
    addToast('Reading explanation aloud...', 'info');
  };

  const handleSendMessage = async (promptToSend = inputPrompt, currentMode = 'chat') => {
    const query = promptToSend.trim();
    if (!query && !codeContext.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      code: codeContext,
      language: selectedLanguage
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({
        prompt: query,
        code: codeContext,
        language: selectedLanguage,
        mode: currentMode,
        engine: activeEngine
      });

      if (res.data.success) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          engine: activeEngine,
          text: res.data.reply
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        engine: activeEngine,
        text: 'Sorry, I encountered an issue connecting to the AI tutor service. Please check your backend configuration.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setCodeContext('');
      setShowCodeInput(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Response copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('codebuddy_ai_chat');
    addToast('Conversation cleared', 'info');
  };

  const handleNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    addToast('Started a fresh chat session', 'info');
  };

  const handleQuickPrompt = (promptText, promptMode) => {
    handleSendMessage(promptText, promptMode);
  };

  // Polyglot conversion handler
  const handleConvertCode = async () => {
    if (!convCode.trim()) return;
    setConvLoading(true);
    try {
      const res = await aiAPI.convert({
        code: convCode,
        from_lang: convSourceLang,
        to_lang: convTargetLang,
        engine: activeEngine
      });
      if (res.data.success) {
        setConvResult(res.data.converted_code);
        addToast(`Code converted to ${convTargetLang}!`, 'success');
      }
    } catch (e) {
      addToast('Failed to convert code snippet', 'error');
    } finally {
      setConvLoading(false);
    }
  };

  // Complexity analyzer handler
  const handleAnalyzeComplexity = async () => {
    if (!analyzerCode.trim()) return;
    setComplexityLoading(true);
    try {
      const res = await aiAPI.complexity({
        code: analyzerCode,
        language: 'python',
        engine: activeEngine
      });
      if (res.data.success) {
        setComplexityResult(res.data);
        addToast('Complexity profiling complete!', 'success');
      }
    } catch (e) {
      addToast('Failed to analyze complexity', 'error');
    } finally {
      setComplexityLoading(false);
    }
  };

  const selectedModelMeta = AI_MODELS.find(m => m.id === activeEngine) || AI_MODELS[0];

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-7.5rem)] space-y-4">
      {/* Header Banner & Model Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Multi-Model AI Coding Suite</span>
            </h1>
            <p className="text-xs text-slate-400">
              Switch freely between flagship AI engines tailored for learning, debugging, and systems programming.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 border border-slate-700/60 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI ENGINE SELECTOR CAROUSEL / TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 border-t border-slate-800/80">
          {AI_MODELS.map((model) => {
            const isSelected = model.id === activeEngine;
            return (
              <button
                key={model.id}
                onClick={() => {
                  setActiveEngine(model.id);
                  addToast(`Switched to ${model.name} (${model.sub})`, 'info');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? `${model.bgActive} ${model.borderColor} shadow-md shadow-indigo-500/10 scale-[1.02]`
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {model.name}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {model.sub}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1">
                  {model.description}
                </p>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Function Mode Switcher: Chat | Converter | Big-O */}
        <div className="flex items-center space-x-2 pt-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Interactive Chat Tutor</span>
          </button>
          <button
            onClick={() => setActiveTab('convert')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'convert'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Polyglot Code Converter</span>
          </button>
          <button
            onClick={() => setActiveTab('complexity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'complexity'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Big-O Profiler</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CHAT TUTOR */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* Quick Prompt Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => handleQuickPrompt('Explain this code line by line and describe its edge cases.', 'explain')}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 flex-shrink-0 transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
              <span>Explain Code</span>
            </button>

            <button
              onClick={() => handleQuickPrompt('Inspect this snippet for off-by-one errors and runtime exceptions.', 'debug')}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 flex-shrink-0 transition-all"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>Find Bugs</span>
            </button>

            <button
              onClick={() => handleQuickPrompt('How can I optimize an O(N^2) double loop into O(N) using a Hash Map?', 'optimize')}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 flex-shrink-0 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimize Complexity</span>
            </button>

            <button
              onClick={() => handleQuickPrompt('Provide a progressive hint without spoiling the full solution.', 'hint')}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 flex-shrink-0 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Give Me a Hint</span>
            </button>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xl scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">How can {selectedModelMeta.name} assist you today?</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  {selectedModelMeta.description}. Attach code snippets or ask about algorithmic patterns.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-xl rounded-2xl p-4 text-xs space-y-2.5 shadow-md leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {msg.text && (
                      <div className="whitespace-pre-line font-sans">
                        {msg.text}
                      </div>
                    )}

                    {msg.code && (
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                        <pre className="whitespace-pre-wrap">{msg.code}</pre>
                      </div>
                    )}

                    {msg.sender === 'assistant' && (
                      <div className="pt-2 flex items-center justify-between border-t border-slate-700/50">
                        {/* Audio Read-Aloud Voice Button */}
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className={`text-[10px] flex items-center space-x-1 transition-colors ${
                            isSpeaking && speakingMsgId === msg.id
                              ? 'text-indigo-400 font-bold animate-pulse'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Listen to response with Speech Synthesis"
                        >
                          {isSpeaking && speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
                  <span>{selectedModelMeta.name} is formulating an algorithmic response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Code Attachment Area if opened */}
          {showCodeInput && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">Attach Code Context:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-200 border border-slate-700"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                </select>
              </div>
              <textarea
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                placeholder="Paste code snippet for analysis, debugging, or optimization..."
                rows={4}
                className="w-full p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center space-x-2">
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showCodeInput
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400'
              }`}
              title="Attach Code Snippet"
            >
              <Code className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedModelMeta.name} anything about programming, algorithms, or bug fixing...`}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || (!inputPrompt.trim() && !codeContext.trim())}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: POLYGLOT CODE CONVERTER */}
      {activeTab === 'convert' && (
        <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl scrollbar-thin">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Languages className="w-5 h-5 text-indigo-400" />
                <span>Polyglot Language Translator ({selectedModelMeta.name})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Translate code between Python, JavaScript, C++, Java, and Go while preserving time and space complexity.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={convSourceLang}
                onChange={(e) => setConvSourceLang(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 rounded-xl text-xs text-slate-200 border border-slate-700"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
              </select>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <select
                value={convTargetLang}
                onChange={(e) => setConvTargetLang(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 rounded-xl text-xs text-slate-200 border border-slate-700"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input code */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Source Code ({convSourceLang}):</span>
              <textarea
                value={convCode}
                onChange={(e) => setConvCode(e.target.value)}
                rows={12}
                className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleConvertCode}
                disabled={convLoading || !convCode.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
              >
                {convLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Translate into {convTargetLang.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>

            {/* Converted Output */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Target Output ({convTargetLang}):</span>
              <div className="w-full h-[280px] p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {convResult ? convResult : '// Converted code and idiomatic breakdown will appear here...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BIG-O PROFILER */}
      {activeTab === 'complexity' && (
        <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl scrollbar-thin">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Big-O Algorithmic Profiler ({selectedModelMeta.name})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Paste any algorithm to profile its worst-case asymptotic bounds and detect asymptotic bottlenecks.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">Source Code to Profile:</span>
            <textarea
              value={analyzerCode}
              onChange={(e) => setAnalyzerCode(e.target.value)}
              rows={8}
              className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleAnalyzeComplexity}
              disabled={complexityLoading || !analyzerCode.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all"
            >
              {complexityLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Analyze Big-O Complexity</span>
                </>
              )}
            </button>
          </div>

          {complexityResult && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">Time Complexity</span>
                  <p className="text-xl font-black text-indigo-400 font-mono">{complexityResult.time_complexity || 'O(N)'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">Space Complexity</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">{complexityResult.space_complexity || 'O(1)'}</p>
                </div>
              </div>
              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {complexityResult.analysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
