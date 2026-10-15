import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import {
  User,
  Mail,
  Lock,
  Shield,
  Settings,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const profile = user?.profile || {};

  // Form states
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [skillLevel, setSkillLevel] = useState(profile.skill_level || 'Intermediate');
  const [bio, setBio] = useState(profile.bio || '');
  const [preferredLanguages, setPreferredLanguages] = useState(
    Array.isArray(profile.preferred_languages)
      ? profile.preferred_languages.join(', ')
      : profile.preferred_languages || 'Python, JavaScript'
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFullName(user.profile.full_name || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setSkillLevel(user.profile.skill_level || 'Intermediate');
      setBio(user.profile.bio || '');
      setAvatarUrl(user.profile.avatar_url || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        full_name: fullName,
        skill_level: skillLevel,
        bio: bio,
        preferred_languages: preferredLanguages,
        avatar_url: avatarUrl
      });
      if (res.data.success) {
        updateProfile(res.data.data);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.data.success) {
        addToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header matching Panel 12 */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <User className="w-6 h-6 text-indigo-400" />
          <span>My Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Overview Card matching Panel 12 */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl flex flex-col items-center text-center">
          <div className="relative group">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`}
              alt={fullName}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
            />
            <button
              type="button"
              onClick={() => {
                const newSeed = prompt('Enter a seed or avatar name for DiceBear avatar:');
                if (newSeed) {
                  setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newSeed)}`);
                }
              }}
              className="absolute bottom-0 right-0 p-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-colors"
              title="Change Avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{fullName || user?.username}</h2>
            <p className="text-xs text-indigo-400 font-medium">@{user?.username}</p>
            <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              {user?.role || 'Student'}
            </span>
          </div>

          <p className="text-xs text-slate-300 italic px-4">
            "{bio || 'Passionate about coding and building cool projects!'}"
          </p>

          {/* Skills Badges matching Panel 12 */}
          <div className="w-full pt-2 border-t border-slate-800 text-left space-y-2">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {['Python', 'JavaScript', 'DSA', 'Web Development'].map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-800 border border-slate-700/60 text-slate-300 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-800/40">
              <p className="text-xs font-bold text-white">{profile.total_points || 2100}</p>
              <p className="text-[10px] text-slate-400">Points</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40">
              <p className="text-xs font-bold text-amber-400">{profile.current_streak || 12}d</p>
              <p className="text-[10px] text-slate-400">Streak</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40">
              <p className="text-xs font-bold text-emerald-400">{profile.reputation_points || 250}</p>
              <p className="text-[10px] text-slate-400">Reputation</p>
            </div>
          </div>
        </div>

        {/* Right Tabbed Configuration Card matching Panel 12 */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {/* Tabs: Profile, Security, Preferences matching Panel 12 */}
          <div className="flex items-center space-x-2 px-6 pt-4 border-b border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Preferences
            </button>
          </div>

          <div className="p-6 sm:p-8 flex-1">
            {/* 1. Profile Tab Form */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2.5 bg-slate-800/40 border border-slate-700/40 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-3 py-2.5 bg-slate-800/40 border border-slate-700/40 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Skill Level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preferred Languages</label>
                  <input
                    type="text"
                    value={preferredLanguages}
                    onChange={(e) => setPreferredLanguages(e.target.value)}
                    placeholder="Python, JavaScript, C++"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* 2. Security Tab Form */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs max-w-md">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Application Theme</h4>
                    <p className="text-slate-400 mt-0.5">Toggle between Dark mode and Light mode</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                  >
                    Current: {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Email Notifications</h4>
                    <p className="text-slate-400 mt-0.5">Receive contest reminders and answer notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
