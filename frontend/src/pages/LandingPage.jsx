import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  Users,
  Trophy,
  ArrowRight,
  Terminal,
  Play,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const languages = [
    { name: 'Python', color: 'from-blue-500 to-yellow-500', icon: '🐍' },
    { name: 'C++', color: 'from-blue-600 to-indigo-600', icon: '⚡' },
    { name: 'Java', color: 'from-orange-500 to-red-500', icon: '☕' },
    { name: 'JavaScript', color: 'from-yellow-400 to-amber-500', icon: '💛' },
    { name: 'C#', color: 'from-purple-600 to-indigo-700', icon: '🔷' },
    { name: 'Go', color: 'from-cyan-400 to-blue-500', icon: '🐹' },
    { name: 'SQL', color: 'from-teal-400 to-emerald-600', icon: '🗄️' },
  ];

  const features = [
    {
      icon: Terminal,
      title: 'Online Code Editor',
      desc: 'Full-featured Monaco editor with multi-language execution, syntax highlighting, and standard I/O support.'
    },
    {
      icon: Code2,
      title: 'Curated DSA Library',
      desc: 'Master algorithms with categorized problems, hidden test cases, detailed explanations, and starter templates.'
    },
    {
      icon: Sparkles,
      title: 'AI Coding Assistant',
      desc: 'Instant line-by-line explanations, automated bug diagnosis, and tailored hints to unblock your logic.'
    },
    {
      icon: Users,
      title: 'Peer Learning Community',
      desc: 'Ask questions, share alternative solutions, upvote helpful answers, and grow together with peers.'
    },
    {
      icon: Trophy,
      title: 'Contests & Challenges',
      desc: 'Compete in real-time timed coding challenges, climb global leaderboards, and test your speed.'
    },
    {
      icon: Zap,
      title: '1-on-1 Mentorship',
      desc: 'Book personalized guidance sessions with verified industry software engineers and tech leads.'
    }
  ];

  const testimonials = [
    {
      name: 'Aarav Mehta',
      role: 'Computer Science Student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: 'CodeBuddy transformed how I prepare for tech interviews. The AI assistant explains edge cases when I am stuck, and the peer community is super responsive!'
    },
    {
      name: 'Priya Sharma',
      role: 'Junior Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      comment: 'The timed contests and DSA library are clean and bug-free. Booking a mentorship session with Dr. Neha gave me crystal clear roadmap advice.'
    },
    {
      name: 'Rohan Verma',
      role: 'Self-taught Developer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      comment: 'I love having my code snippets, practice problems, and AI tutor all integrated into one fast developer dashboard.'
    }
  ];

  const faqs = [
    {
      q: 'How does code execution work in CodeBuddy?',
      a: 'Code is sent securely to an execution service (Judge0) supporting Python, C++, Java, JavaScript, Go, and C#. Your code is isolated with resource and execution time limits.'
    },
    {
      q: 'Is CodeBuddy free for students?',
      a: 'Yes! CodeBuddy is open for all learners to practice DSA problems, run code playgrounds, interact with the peer community, and track learning streaks.'
    },
    {
      q: 'How does the AI assistant help me learn without spoiling answers?',
      a: 'The assistant includes a dedicated "Hint" mode that guides your intuition step-by-step rather than immediately outputting complete code solutions.'
    },
    {
      q: 'How can I become a mentor on the platform?',
      a: 'Users can submit an application via the Mentors directory. Admins review experience and skills before verifying mentor profiles.'
    }
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* 1. HERO SECTION (Matching Panel 1: Code Smarter. Learn Together.) */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Coding Education & Peer Learning</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Code Smarter. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Learn Together.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
              A modern platform to practice coding, solve problems, get help from peers, and grow with an AI coding assistant.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/study"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-center flex items-center justify-center space-x-2"
              >
                <span>DSA Visualizer & Hub</span>
              </Link>
              <Link
                to="/problems"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all text-center"
              >
                Explore Problems
              </Link>
            </div>
          </div>

          {/* Interactive Code Editor Preview (Matching Panel 1 laptop mockup) */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl shadow-indigo-950/50">
            {/* Window title bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs text-slate-400 font-mono ml-2">solution.py — CodeBuddy Online Playground</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-indigo-400 font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Python 3.12
                </span>
                <Link to="/editor" className="text-xs text-slate-300 hover:text-white flex items-center space-x-1">
                  <span>Open Playground</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Code and output split */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 font-mono text-xs">
              <div className="p-4 text-slate-300 space-y-1 overflow-x-auto bg-slate-900/40">
                <p className="text-slate-500"># Two Sum — Optimal Hash Map O(n)</p>
                <p><span className="text-purple-400">def</span> <span className="text-blue-400">two_sum</span>(nums, target):</p>
                <p className="pl-4">lookup = {'{}'}</p>
                <p className="pl-4"><span className="text-purple-400">for</span> i, num <span className="text-purple-400">in</span> enumerate(nums):</p>
                <p className="pl-8">complement = target - num</p>
                <p className="pl-8"><span className="text-purple-400">if</span> complement <span className="text-purple-400">in</span> lookup:</p>
                <p className="pl-12 text-emerald-400"><span className="text-purple-400">return</span> [lookup[complement], i]</p>
                <p className="pl-8">lookup[num] = i</p>
                <p className="pl-4"><span className="text-purple-400">return</span> []</p>
                <p className="pt-2 text-slate-400">print(two_sum([2, 7, 11, 15], 9))</p>
              </div>

              <div className="p-4 bg-slate-950/60 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-sans font-semibold flex items-center justify-between">
                    <span>Console Output</span>
                    <span className="text-emerald-400 font-mono font-normal">● Status: Success (0.02s)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-emerald-300 font-mono">
                    [0, 1]
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-slate-400 text-[11px] font-sans">
                  <span>Memory: 12.4 MB</span>
                  <Link
                    to="/editor"
                    className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>Run interactive code</span>
                    <Play className="w-3 h-3 fill-indigo-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROGRAMMING LANGUAGES STRIP (Matching Panel 1 bottom row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Multi-Language Ecosystem</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {languages.map((lang) => (
            <Link
              key={lang.name}
              to={`/editor?lang=${lang.name.toLowerCase()}`}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:scale-105 transition-all group"
            >
              <span className="text-lg">{lang.icon}</span>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{lang.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">Everything You Need to Master Coding</h2>
          <p className="text-slate-400 text-sm">
            Designed for engineers, students, and competitive coders seeking deep conceptual clarity and peer collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-white">How CodeBuddy Works</h2>
            <p className="text-slate-400 text-sm">A 4-step streamlined loop to elevate your engineering skills.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-lg shadow-indigo-600/30">1</div>
              <h4 className="text-base font-semibold text-white">Pick a Challenge</h4>
              <p className="text-xs text-slate-400">Filter DSA problems by difficulty and topic from beginner to advanced.</p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-lg shadow-indigo-600/30">2</div>
              <h4 className="text-base font-semibold text-white">Code & Run Live</h4>
              <p className="text-xs text-slate-400">Write solutions in Monaco Editor and test against visible and hidden cases.</p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-lg shadow-indigo-600/30">3</div>
              <h4 className="text-base font-semibold text-white">AI-Powered Debugging</h4>
              <p className="text-xs text-slate-400">Ask the AI tutor for incremental hints or complexity optimization tips.</p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-lg shadow-indigo-600/30">4</div>
              <h4 className="text-base font-semibold text-white">Earn Points & Rank</h4>
              <p className="text-xs text-slate-400">Build your learning streak, gain reputation points, and climb the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Peer Community</p>
          <h2 className="text-3xl font-bold text-white">Loved by Learners & Mentors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic">"{t.comment}"</p>
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Quick answers to common questions about CodeBuddy.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <h4 className="text-sm font-semibold text-white">{faq.q}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 pl-8 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Upgrade Your Coding Journey?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Join thousands of developers solving DSA problems, connecting with mentors, and mastering code with AI today.
            </p>
            <div className="flex justify-center">
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
