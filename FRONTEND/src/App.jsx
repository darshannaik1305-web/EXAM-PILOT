import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PracticeTest from "./pages/PracticeTest";
import PracticeReview from "./pages/PracticeReview";
import PracticePapers from "./pages/PracticePapers";
import Analytics from "./pages/Analytics";
import Mentor from "./pages/Mentor";
import ProtectedRoute from "./components/common/ProtectedRoute";
import SettingsPage from "./pages/Settings";
import PublicRoute from "./components/common/PublicRoute";
import GuestLayout from "./components/layout/GuestLayout";
import StudentLayout from "./components/layout/StudentLayout";
import PlaceholderPage from "./pages/placeholder/PlaceholderPage";
import Workspace404 from "./pages/placeholder/Workspace404";
import ScrollToTop from "./components/common/ScrollToTop";
import { FileText, GraduationCap, BarChart3, Bot, Trophy, Settings } from "lucide-react";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Guest Layout Shell */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Route>

      {/* Full-screen Practice Test Environment */}
      <Route
        path="/student/practice/:id"
        element={
          <ProtectedRoute>
            <PracticeTest />
          </ProtectedRoute>
        }
      />

      {/* Full-screen Practice Solution Review Environment */}
      <Route
        path="/student/practice/:id/review"
        element={
          <ProtectedRoute>
            <PracticeReview />
          </ProtectedRoute>
        }
      />

      {/* Student Layout Shell */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="workspace" element={<Dashboard />} />
        
        {/* Sidebar Placeholder Pages */}
        <Route path="practice" element={<PracticePapers />} />
        <Route
          path="mock-tests"
          element={
            <PlaceholderPage
              title="Mock Tests"
              description="Simulate real competitive online test conditions with custom pacing."
              icon={GraduationCap}
              roadmap={[
                { title: "Exam Simulator", desc: "Standardized timer controls conforming to official test limits." },
                { title: "Auto Grading", desc: "Instant score validation upon test packet submission." },
              ]}
            />
          }
        />
        <Route path="analytics" element={<Analytics />} />
        <Route path="mentor" element={<Mentor />} />
        <Route
          path="achievements"
          element={
            <PlaceholderPage
              title="Achievements"
              description="Unlock milestone trophies by maintaining learning habits."
              icon={Trophy}
              roadmap={[
                { title: "Solve Streaks", desc: "Earn rewards for consecutive practice uploads." },
                { title: "Accuracy Medals", desc: "Unlock badges for achieving high test scores." },
              ]}
            />
          }
        />
        <Route
          path="settings"
          element={<SettingsPage />}
        />

        {/* Fallback Workspace 404 Page */}
        <Route path="*" element={<Workspace404 />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;