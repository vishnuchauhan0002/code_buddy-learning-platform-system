import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FileCode,
  Search,
  Plus,
  Copy,
  Download,
  Trash2,
  CopyCheck,
  ExternalLink,
  X
} from 'lucide-react';

const SnippetsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Snippet Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    fetchSnippets();
  }, [search]);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const res = await snippetsAPI.getSnippets({ search });
      if (res.data.success) {
        setSnippets(res.data.snippets || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load snippets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await snippetsAPI.createSnippet({
        title,
        description,
        language,
        code,
        tags
      });
      if (res.data.success) {
        addToast('Snippet saved!', 'success');
        setShowModal(false);
        setTitle('');
        setDescription('');
        setCode('');
        setTags('');
        fetchSnippets();
      }
    } catch (err) {
      addToast('Failed to save snippet', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    try {
      const res = await snippetsAPI.deleteSnippet(id);
      if (res.data.success) {
        addToast('Snippet deleted', 'info');
        setSnippets((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      addToast('Failed to delete snippet', 'error');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await snippetsAPI.duplicateSnippet(id);
      if (res.data.success) {
        addToast('Snippet duplicated!', 'success');
        fetchSnippets();
      }
    } catch (err) {
      addToast('Failed to duplicate', 'error');
    }
  };

  const handleCopy = (codeContent) => {
    navigator.clipboard.writeText(codeContent);
    addToast('Code copied to clipboard', 'success');
  };

  const handleDownload = (snippet) => {
    const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${snippet.title.replace(/\s+/g, '_')}.${snippet.language === 'python' ? 'py' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${snippet.title}`, 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileCode className="w-6 h-6 text-indigo-400" />
            <span>My Snippets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your personal code vault and reusable templates
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Snippet</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search snippets by title or tags..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Loading snippets...
          </div>
        ) : snippets.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            No snippets saved yet. Click "New Snippet" to save code!
          </div>
        ) : (
          snippets.map((snip) => (
            <div
              key={snip.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{snip.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {snip.language}
                  </span>
                </div>
                {snip.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{snip.description}</p>
                )}
                {/* Code Preview */}
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 max-h-28 overflow-hidden relative">
                  <pre>{snip.code}</pre>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950 to-transparent"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCopy(snip.code)}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
                    title="Copy Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(snip)}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(snip.id)}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
                    title="Duplicate Snippet"
                  >
                    <CopyCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(snip.id)}
                    className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => navigate('/editor')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                >
                  <span>Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Snippet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New Snippet</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quick Sort Implementation"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="sorting, dsa"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief notes about this code"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste or write your code here..."
                  rows={6}
                  required
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetsPage;
