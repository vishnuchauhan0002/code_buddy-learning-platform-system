import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { codeAPI, snippetsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Play,
  CheckCircle,
  Save,
  RotateCcw,
  Trash2,
  Copy,
  Download,
  FolderOpen,
  Terminal,
  Settings,
  AlertCircle,
  Clock,
  Cpu,
  X
} from 'lucide-react';

const STARTER_TEMPLATES = {
  python: `# Simple Python Program\ndef greet(name):\n    return f"Hello, {name}!"\n\nname = input("Enter your name: ")\nprint(greet(name))\n`,
  javascript: `// JavaScript (Node.js)\nconst readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\n\nrl.question('Enter your name: ', (name) => {\n  console.log(\`Hello, \${name}!\`);\n  rl.close();\n});\n`,
  cpp: `// C++ (GCC 9.2.0)\n#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "Enter your name: ";\n    std::cin >> name;\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}\n`,
  c: `// C (GCC 9.2.0)\n#include <stdio.h>\n\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Hello, %s!\\n", name);\n    return 0;\n}\n`,
  java: `// Java (OpenJDK 13.0.1)\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}\n`,
  csharp: `// C# (Mono 6.6.0)\nusing System;\n\npublic class Program {\n    public static void Main() {\n        Console.Write("Enter your name: ");\n        string name = Console.ReadLine();\n        Console.WriteLine($"Hello, {name}!");\n    }\n}\n`,
  go: `// Go (1.13.5)\npackage main\n\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\tvar name string\n\tfmt.Print("Enter your name: ")\n\tfmt.Scanln(&name)\n\tfmt.Printf("Hello, %s!\\n", name)\n}\n`
};

const EXTENSION_MAP = {
  python: 'py',
  javascript: 'js',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  csharp: 'cs',
  go: 'go'
};

const CodeEditorPage = () => {
  const { addToast } = useToast();
  const { theme: appTheme } = useTheme();

  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState(() => (appTheme === 'light' ? 'light' : 'vs-dark'));
  const [fontSize, setFontSize] = useState(14);
  const [code, setCode] = useState(STARTER_TEMPLATES.python);
  const [stdin, setStdin] = useState('CodeBuddy');

  useEffect(() => {
    setTheme(appTheme === 'light' ? 'light' : 'vs-dark');
  }, [appTheme]);

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState({
    status: 'Ready',
    stdout: 'Hello, CodeBuddy!',
    stderr: '',
    execution_time: 0.02,
    memory: 12.4,
    success: true
  });

  // Modal states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetTags, setSnippetTags] = useState('algorithms, helper');
  const [userSnippets, setUserSnippets] = useState([]);

  // Switch language starter template
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(STARTER_TEMPLATES[newLang] || '');
    addToast(`Switched editor to ${newLang.toUpperCase()}`, 'info');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      addToast('Please enter some code to run', 'error');
      return;
    }

    setIsRunning(true);
    try {
      const res = await codeAPI.runCode({
        code,
        language,
        stdin
      });
      if (res.data.success) {
        setExecutionResult(res.data.result);
        if (res.data.result.success) {
          addToast('Code executed successfully!', 'success');
        } else {
          addToast(`Execution ended: ${res.data.result.status}`, 'error');
        }
      }
    } catch (err) {
      setExecutionResult({
        status: 'Error',
        stdout: '',
        stderr: err.response?.data?.message || err.message,
        execution_time: 0,
        memory: 0,
        success: false
      });
      addToast('Failed to run code', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    addToast('Code copied to clipboard!', 'success');
  };

  const handleDownloadCode = () => {
    const ext = EXTENSION_MAP[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solution.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Downloaded solution.${ext}`, 'success');
  };

  const handleReset = () => {
    setCode(STARTER_TEMPLATES[language] || '');
    addToast('Restored default code template', 'info');
  };

  const handleClear = () => {
    setCode('');
    setShowClearConfirm(false);
    addToast('Editor cleared', 'info');
  };

  const handleSaveSnippet = async (e) => {
    e.preventDefault();
    if (!snippetTitle.trim()) {
      addToast('Please specify a title for your snippet', 'error');
      return;
    }

    try {
      const res = await snippetsAPI.createSnippet({
        title: snippetTitle.trim(),
        code,
        language,
        tags: snippetTags
      });
      if (res.data.success) {
        addToast('Snippet saved to your workspace!', 'success');
        setShowSaveModal(false);
        setSnippetTitle('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save snippet', 'error');
    }
  };

  const handleOpenLoadModal = async () => {
    try {
      const res = await snippetsAPI.getSnippets();
      if (res.data.success) {
        setUserSnippets(res.data.snippets || []);
        setShowLoadModal(true);
      }
    } catch (err) {
      addToast('Please log in to load saved snippets', 'error');
    }
  };

  const handleLoadSnippet = (snippet) => {
    setCode(snippet.code);
    if (snippet.language && STARTER_TEMPLATES[snippet.language]) {
      setLanguage(snippet.language);
    }
    setShowLoadModal(false);
    addToast(`Loaded snippet: ${snippet.title}`, 'success');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header bar matching Panel 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-indigo-400" />
            <span>Online Code Editor</span>
          </h1>
          <p className="text-xs text-slate-400">
            Write, run and test your code in multiple languages
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="python">Python (3.8.1)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="cpp">C++ (GCC 9.2.0)</option>
            <option value="c">C (GCC 9.2.0)</option>
            <option value="java">Java (OpenJDK 13)</option>
            <option value="csharp">C# (Mono 6.6)</option>
            <option value="go">Go (1.13.5)</option>
          </select>

          {/* Theme selector */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>

          {/* Font size */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium"
            title="Font Size"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 disabled:opacity-50 transition-all"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Run Code</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1 transition-all"
            title="Save Snippet"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleOpenLoadModal}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1 transition-all"
            title="Load Saved Snippets"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Load</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60"
            title="Copy Code"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownloadCode}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60"
            title="Download Code"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60"
            title="Reset to Starter Template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60"
            title="Clear Editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor & I/O Workspace Split (Matching Panel 5) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Monaco Editor Container (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">main.{EXTENSION_MAP[language] || 'txt'}</span>
            <span className="text-[11px] text-slate-500">Monaco Language Server Active</span>
          </div>
          <div className="flex-1 min-h-[350px]">
            <Editor
              height="100%"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              theme={theme}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                formatOnPaste: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* Input & Output Panels (1 col) */}
        <div className="flex flex-col space-y-4 min-h-0">
          {/* Input Panel (stdin) */}
          <div className="h-44 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Input (stdin)
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter custom input here..."
              className="flex-1 p-3 bg-slate-900 text-slate-200 font-mono text-xs resize-none focus:outline-none"
            />
          </div>

          {/* Output Console Panel */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl min-h-[220px]">
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Output Console</span>
              {executionResult && (
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    executionResult.success
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  ● {executionResult.status}
                </span>
              )}
            </div>

            <div className="flex-1 p-3.5 bg-slate-950 font-mono text-xs overflow-y-auto whitespace-pre-wrap">
              {isRunning ? (
                <div className="flex items-center space-x-2 text-indigo-400">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span>Running code on execution sandbox...</span>
                </div>
              ) : (
                <>
                  {executionResult.stdout && (
                    <div className="text-slate-200">{executionResult.stdout}</div>
                  )}
                  {executionResult.stderr && (
                    <div className="text-rose-400 mt-2 font-mono whitespace-pre-wrap">
                      {executionResult.stderr}
                    </div>
                  )}
                  {!executionResult.stdout && !executionResult.stderr && (
                    <div className="text-slate-600">Click "Run Code" to execute...</div>
                  )}
                </>
              )}
            </div>

            {/* Performance status footer matching Panel 5 */}
            <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Time: {executionResult.execution_time}s</span>
              </span>
              <span className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-slate-500" />
                <span>Memory: {executionResult.memory} MB</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-sm w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Clear Editor?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to clear all code? Any unsaved changes will be lost.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Snippet Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Save Code Snippet</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSnippet} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Snippet Title</label>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="e.g. Binary Search Helper"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={snippetTags}
                  onChange={(e) => setSnippetTags(e.target.value)}
                  placeholder="algorithms, python, helper"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save to Snippets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Load Snippet Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Load Saved Snippet</h3>
              <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {userSnippets.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No saved snippets found. Click "Save" to persist snippets!
                </div>
              ) : (
                userSnippets.map((snip) => (
                  <div
                    key={snip.id}
                    onClick={() => handleLoadSnippet(snip)}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{snip.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{snip.language} • {snip.tags?.join(', ')}</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">Load →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorPage;
