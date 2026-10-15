import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemSolvePage from './pages/ProblemSolvePage';
import CodeEditorPage from './pages/CodeEditorPage';
import AIAssistantPage from './pages/AIAssistantPage';
import StudyHubPage from './pages/StudyHubPage';
import CommunityPage from './pages/CommunityPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ContestsPage from './pages/ContestsPage';
import ContestDetailPage from './pages/ContestDetailPage';
import MentorDirectoryPage from './pages/MentorDirectoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SnippetsPage from './pages/SnippetsPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Authenticated Dashboard & App Routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/study" element={<StudyHubPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/problems/:id" element={<ProblemSolvePage />} />
                <Route path="/editor" element={<CodeEditorPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/:id" element={<QuestionDetailPage />} />
                <Route path="/contests" element={<ContestsPage />} />
                <Route path="/contests/:id" element={<ContestDetailPage />} />
                <Route path="/mentors" element={<MentorDirectoryPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/snippets" element={<SnippetsPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
