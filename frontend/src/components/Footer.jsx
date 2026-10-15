import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Sparkles, Users, Trophy, TrendingUp, Heart, Globe, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400">
      {/* 5 Pillar Value Bar matching bottom of uploaded design */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
            <Link to="/problems" className="flex items-center space-x-3 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">Practice</p>
                <p className="text-xs text-slate-400">Solve coding problems</p>
              </div>
            </Link>

            <Link to="/ai-assistant" className="flex items-center space-x-3 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">Learn</p>
                <p className="text-xs text-slate-400">Get AI powered help</p>
              </div>
            </Link>

            <Link to="/community" className="flex items-center space-x-3 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Connect</p>
                <p className="text-xs text-slate-400">Join a coding community</p>
              </div>
            </Link>

            <Link to="/contests" className="flex items-center space-x-3 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 transition-all">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">Compete</p>
                <p className="text-xs text-slate-400">Participate in contests</p>
              </div>
            </Link>

            <Link to="/progress" className="flex items-center space-x-3 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">Grow</p>
                <p className="text-xs text-slate-400">Track your progress</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Code<span className="text-indigo-400">Buddy</span></span>
            </div>
            <p className="text-sm text-slate-400">
              Code Smarter. Learn Together. The modern AI-powered coding and peer-learning platform for programmers worldwide.
            </p>
            <div className="flex space-x-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors" title="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors" title="Twitter / X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors" title="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>

          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/problems" className="hover:text-white transition-colors">Problem Practice (DSA)</Link></li>
              <li><Link to="/editor" className="hover:text-white transition-colors">Online Code Editor</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition-colors">AI Coding Assistant</Link></li>
              <li><Link to="/contests" className="hover:text-white transition-colors">Coding Contests</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors">Global Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/community" className="hover:text-white transition-colors">Discussions & Q&A</Link></li>
              <li><Link to="/mentors" className="hover:text-white transition-colors">Find a Mentor</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link to="/snippets" className="hover:text-white transition-colors">Code Snippets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account & Demo</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In (Student: student@example.com)</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Free Account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-white transition-colors">Forgot Password</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile & Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CodeBuddy Platform. Built with modern full-stack technologies.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted for developers <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" /> by CodeBuddy Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
