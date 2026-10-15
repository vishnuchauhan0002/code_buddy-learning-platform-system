import React, { useState, useEffect } from 'react';
import { mentorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Search,
  Star,
  Clock,
  Briefcase,
  Calendar,
  Video,
  CheckCircle,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const MentorDirectoryPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'my-sessions'
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState('');
  const [preferredTime, setPreferredTime] = useState('Next Tuesday at 6:00 PM IST');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My Sessions
  const [mySessions, setMySessions] = useState({ as_student: [], as_mentor: [], is_mentor: false });
  const [ratingSessionId, setRatingSessionId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchMentors();
    } else {
      fetchMySessions();
    }
  }, [activeTab, search, selectedSkill]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await mentorsAPI.getMentors({
        search: search.trim(),
        skill: selectedSkill !== 'All' ? selectedSkill : ''
      });
      if (res.data.success) {
        setMentors(res.data.mentors || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load mentors directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMySessions = async () => {
    setLoading(true);
    try {
      const res = await mentorsAPI.getMySessions();
      if (res.data.success) {
        setMySessions(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Please login to view your mentoring sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (mentor) => {
    if (!user) {
      addToast('Please login to request a mentoring session', 'error');
      return;
    }
    setSelectedMentor(mentor);
    setTopic(`1-on-1 Guidance with ${mentor.name}`);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      addToast('Please provide a session topic', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await mentorsAPI.requestSession({
        mentor_id: selectedMentor.id,
        topic: topic.trim(),
        preferred_time: preferredTime.trim(),
        message: message.trim()
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setSelectedMentor(null);
        setTopic('');
        setMessage('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      const res = await mentorsAPI.updateSessionStatus(sessionId, { status });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchMySessions();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmitRating = async (sessionId) => {
    try {
      const res = await mentorsAPI.rateSession(sessionId, {
        rating: ratingValue,
        feedback: ratingFeedback
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setRatingSessionId(null);
        fetchMySessions();
      }
    } catch (err) {
      addToast('Failed to submit rating', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header matching Panel 11 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span>Find a Mentor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect with experienced developers
          </p>
        </div>

        {/* Tabs: Directory & My Sessions */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'directory'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Mentors
          </button>
          <button
            onClick={() => setActiveTab('my-sessions')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'my-sessions'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Sessions
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Search & Skill Filter Bar matching Panel 11 */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by skill, language or keyword..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Skills</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="AI/ML">AI / ML</option>
              <option value="System Design">System Design</option>
              <option value="Algorithms">Algorithms</option>
            </select>
          </div>

          {/* Mentor Cards matching Panel 11 */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                Loading mentors...
              </div>
            ) : mentors.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                No mentors found matching your filters.
              </div>
            ) : (
              mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{mentor.name}</h3>
                        <span className="text-xs text-slate-400 font-normal">
                          {mentor.title} {mentor.company && `• ${mentor.company}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{mentor.rating} ({mentor.reviews_count})</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{mentor.experience_years}+ years exp</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                        {mentor.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {mentor.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 rounded-md text-[10px] bg-slate-800 border border-slate-700/60 text-slate-300 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Request Button matching Panel 11 */}
                  <div className="self-end md:self-center">
                    <button
                      onClick={() => handleOpenBooking(mentor)}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* My Sessions View */
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Your Mentoring Sessions</h3>

            {mySessions.as_student?.length === 0 && mySessions.as_mentor?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No sessions requested yet. Browse the directory above to connect with a mentor!
              </p>
            ) : (
              <div className="space-y-3">
                {mySessions.as_student.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{sess.topic}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            sess.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : sess.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {sess.status}
                        </span>
                      </div>
                      <p className="text-slate-400">Mentor: {sess.mentor_name} • {sess.preferred_time}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {sess.status === 'accepted' && sess.meeting_link && (
                        <a
                          href={sess.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 flex items-center space-x-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meet</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentoring Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Request Mentoring Session</h3>
              <button onClick={() => setSelectedMentor(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <img src={selectedMentor.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="text-xs font-semibold text-white">{selectedMentor.name}</p>
                <p className="text-[11px] text-slate-400">{selectedMentor.title}</p>
              </div>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. System Design Interview Guidance"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Time / Date</label>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g. Tomorrow at 5:00 PM IST"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Message to Mentor</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your goals and any specific questions you have..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDirectoryPage;
