import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  User, 
  BookOpen, 
  SunMoon, 
  Bell, 
  HelpCircle, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Calendar, 
  Award, 
  Activity, 
  FileText, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { NotificationContext } from "../context/NotificationContext";
import { EXAM_SUGGESTIONS } from "../config/exams";
import { SUBJECT_SUGGESTIONS } from "../config/subjects";
import api from "../services/api";

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account Settings", icon: User },
  { id: "preferences", label: "Study Preferences", icon: BookOpen },
  { id: "appearance", label: "Appearance", icon: SunMoon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "about", label: "About ExamPilot", icon: HelpCircle },
  { id: "danger", label: "Danger Zone", icon: ShieldAlert },
];

export default function Settings() {
  const { token, user, logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const { getNotificationPreferences, updateNotificationPreferences } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("account");

  // Profile Preferences State
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    targetExam: "",
    defaultSubject: "",
    studyGoalHours: 10
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Danger Zone Deletion State
  const [deleteConfirm, setDeleteConfirm] = useState({
    password: "",
    phrase: ""
  });

  // Read-only Statistics
  const [stats, setStats] = useState({
    memberSince: null,
    totalPracticePapers: 0,
    totalMockTests: 0,
    totalQuestionsSolved: 0,
    role: "STUDENT",
    frontendVersion: "V3.5.0-FE",
    backendVersion: "V3.5.0-BE",
    aiServiceVersion: "Offline"
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Combobox suggest lists UI control
  const [examSearch, setExamSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Load profile and statistics
  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Profile Preferences
      const profileRes = await api.get("/api/users/profile");
      const profileData = profileRes.data;
      setProfile({
        username: profileData.username || "",
        email: profileData.email || "",
        targetExam: profileData.targetExam || "General",
        defaultSubject: profileData.defaultSubject || "General",
        studyGoalHours: profileData.studyGoalHours || 10
      });
      setExamSearch(profileData.targetExam || "General");
      setSubjectSearch(profileData.defaultSubject || "General");

      // 2. Fetch Stats
      const statsRes = await api.get("/api/users/profile/stats");
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load settings data:", error);
      toast.error("Could not load user configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Save Settings handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!profile.username.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }
    if (profile.username.length < 3 || profile.username.length > 50) {
      toast.error("Display name must be between 3 and 50 characters.");
      return;
    }

    try {
      setSaveLoading(true);
      await api.put("/api/users/profile", {
        username: profile.username,
        targetExam: profile.targetExam,
        defaultSubject: profile.defaultSubject,
        studyGoalHours: profile.studyGoalHours
      });
      toast.success("Settings and preferences saved successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      toast.error(typeof errMsg === "string" ? errMsg : "Failed to update configurations.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Change Password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error("New password cannot be the same as your current password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password confirmations do not match.");
      return;
    }
    // Pattern verification (digit + letter)
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(passwordForm.newPassword)) {
      toast.error("New password must contain at least one letter and one number.");
      return;
    }

    try {
      setPassLoading(true);
      await api.put("/api/users/password", passwordForm);
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      toast.error(typeof errMsg === "string" ? errMsg : "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  // Delete Account handler
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteConfirm.password) {
      toast.error("Please verify your account password.");
      return;
    }
    if (deleteConfirm.phrase !== "CONFIRM DELETE") {
      toast.error("Please type the confirmation phrase exactly.");
      return;
    }

    const confirmFirst = window.confirm(
      "WARNING: This action is permanent and completely irreversible. It will wipe your practice session data, scores, solved questions, and cached files. Do you want to proceed?"
    );
    if (!confirmFirst) return;

    try {
      setDeleteLoading(true);
      await api.post("/api/users/me/delete", { password: deleteConfirm.password });
      toast.success("Account and associated data deleted successfully. Logging out...");
      logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      toast.error(typeof errMsg === "string" ? errMsg : "Failed to delete account. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Notification toggles
  const notificationPrefs = getNotificationPreferences();
  const handleNotificationToggle = (key) => {
    const current = { ...notificationPrefs };
    current[key] = !current[key];
    updateNotificationPreferences(current);
    toast.success(`Notifications for ${key} updated.`);
  };

  // Suggest filtering helper
  const filteredExams = EXAM_SUGGESTIONS.filter(item => 
    item.toLowerCase().includes(examSearch.toLowerCase())
  );
  const filteredSubjects = SUBJECT_SUGGESTIONS.filter(item => 
    item.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // Format date helper
  const formatMemberSince = (isoStr) => {
    if (!isoStr) return "N/A";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <RefreshCw className="h-10 w-10 animate-spin text-violet-500" />
          <span className="font-semibold">Retrieving Workspace Configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      {/* Title Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Workspace Settings
          </h1>
          <p className="mt-2 text-slate-400">
            Configure display credentials, target exams, visual preferences, and manage account safety.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Left Side Tab Navigation */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4 shadow-xl backdrop-blur-md">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 ${
                  isActive 
                    ? "bg-violet-600/90 text-white shadow-lg shadow-violet-500/25" 
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-8 shadow-xl backdrop-blur-md">
          {/* Section: Account Settings */}
          {activeSection === "account" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
                  <User className="h-6 w-6" /> Account Details
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  Update display credentials and security configurations.
                </p>
              </div>

              {/* Username Display Form */}
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 pl-10 pr-4 text-slate-400 cursor-not-allowed text-sm"
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Account emails cannot be updated.</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Display Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm transition-all"
                    placeholder="Enter display name"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 font-bold text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    {saveLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Profile"}
                  </button>
                </div>
              </form>

              <hr className="border-slate-800" />

              {/* Change Password Panel */}
              <div>
                <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5" /> Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-4 pr-10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        placeholder="Current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-4 pr-10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        placeholder="Must be at least 8 characters (1 letter, 1 number)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-4 pr-10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={passLoading}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 font-bold text-white shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                    >
                      {passLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Section: Study Preferences */}
          {activeSection === "preferences" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
                  <BookOpen className="h-6 w-6" /> Study Preferences
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  Personalize your target exam settings, subjects, and study hour goals.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Generic Exam Combobox */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Target Competitive Exam</label>
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => {
                      setExamSearch(e.target.value);
                      setProfile({ ...profile, targetExam: e.target.value });
                    }}
                    onFocus={() => setShowExamDropdown(true)}
                    onBlur={() => setTimeout(() => setShowExamDropdown(false), 200)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="Search suggested exams or type any custom exam..."
                  />
                  {showExamDropdown && filteredExams.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 py-1.5 shadow-2xl scrollbar-thin">
                      {filteredExams.map((item, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => {
                            setExamSearch(item);
                            setProfile({ ...profile, targetExam: item });
                          }}
                          className="cursor-pointer px-4 py-2 text-sm text-slate-300 hover:bg-violet-600 hover:text-white"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Generic Subject Combobox */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Default Study Subject</label>
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                      setProfile({ ...profile, defaultSubject: e.target.value });
                    }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="Search suggested subjects or type any custom subject..."
                  />
                  {showSubjectDropdown && filteredSubjects.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 py-1.5 shadow-2xl scrollbar-thin">
                      {filteredSubjects.map((item, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => {
                            setSubjectSearch(item);
                            setProfile({ ...profile, defaultSubject: item });
                          }}
                          className="cursor-pointer px-4 py-2 text-sm text-slate-300 hover:bg-violet-600 hover:text-white"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Study Goal Count Counter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Weekly Study Goal (Hours)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, studyGoalHours: Math.max(1, profile.studyGoalHours - 1) })}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xl font-bold transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={profile.studyGoalHours}
                      onChange={(e) => setProfile({ ...profile, studyGoalHours: Math.min(168, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="h-10 w-20 rounded-xl border border-slate-700 bg-slate-800/80 text-center font-bold text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, studyGoalHours: Math.min(168, profile.studyGoalHours + 1) })}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xl font-bold transition"
                    >
                      +
                    </button>
                    <span className="text-slate-400 text-xs font-semibold">
                      Goal value will compile inside future study analytics charts.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 font-bold text-white shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    {saveLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section: Appearance */}
          {activeSection === "appearance" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
                  <SunMoon className="h-6 w-6" /> Display Theme
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  Adjust color scheme modes to customize visual layouts.
                </p>
              </div>

              {/* Theme Toggles */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "LIGHT", label: "Light Mode", desc: "Crisp white styling" },
                  { id: "DARK", label: "Dark Mode", desc: "Premium slate color styling" },
                  { id: "SYSTEM", label: "System Sync", desc: "Match browser settings" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id);
                      toast.success(`Theme mode updated to ${item.id}`);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all duration-300 ${
                      theme === item.id 
                        ? "border-violet-500 bg-violet-600/10 shadow-lg text-violet-400" 
                        : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <span className="text-base font-bold">{item.label}</span>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeSection === "notifications" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
                  <Bell className="h-6 w-6" /> Notification Preferences
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  Subscribe to notification categories to filter out muted logs.
                </p>
              </div>

              {/* Toggles */}
              <div className="divide-y divide-slate-800">
                {[
                  { key: "upload", title: "Practice Paper Ingestions", desc: "Triggers when practice paper PDF uploads finish parsing or fail." },
                  { key: "mentor", title: "AI Mentor updates", desc: "Triggers when the mentor compiles background answers." },
                  { key: "system", title: "System alerts", desc: "General platform notifications and scheduled updates." }
                ].map((item) => {
                  const isChecked = notificationPrefs[item.key] !== false;
                  return (
                    <div key={item.key} className="flex items-center justify-between py-4">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="font-semibold text-slate-200">{item.title}</span>
                        <span className="text-xs text-slate-500">{item.desc}</span>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(item.key)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                          isChecked ? "bg-violet-600" : "bg-slate-700"
                        }`}
                      >
                        <span 
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                            isChecked ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: About Panel & Stats */}
          {activeSection === "about" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6" /> About ExamPilot
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  Read-only workspace statistics, registration history, and service version details.
                </p>
              </div>

              {/* Statistics grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/40 border border-slate-800 p-4">
                  <Calendar className="h-8 w-8 text-cyan-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold">MEMBER SINCE</span>
                    <span className="font-bold text-slate-200 text-sm">{formatMemberSince(stats.memberSince)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/40 border border-slate-800 p-4">
                  <FileText className="h-8 w-8 text-violet-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold">PRACTICE PAPERS</span>
                    <span className="font-bold text-slate-200 text-sm">{stats.totalPracticePapers} Uploaded</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/40 border border-slate-800 p-4">
                  <Activity className="h-8 w-8 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold">MOCK TESTS ATTEMPTED</span>
                    <span className="font-bold text-slate-200 text-sm">{stats.totalMockTests} Attempts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/40 border border-slate-800 p-4">
                  <Award className="h-8 w-8 text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold">QUESTIONS RESOLVED</span>
                    <span className="font-bold text-slate-200 text-sm">{stats.totalQuestionsSolved} Questions</span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-800" />

              {/* Technical version cards */}
              <div>
                <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Technical Versions
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Frontend Build</span>
                    <span className="font-mono text-sm text-slate-300 font-bold">{stats.frontendVersion}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Backend API</span>
                    <span className="font-mono text-sm text-slate-300 font-bold">{stats.backendVersion}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">AI Service</span>
                    <span className={`font-mono text-sm font-bold ${stats.aiServiceVersion === "Offline" ? "text-red-400 animate-pulse" : "text-slate-300"}`}>
                      {stats.aiServiceVersion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Danger Zone */}
          {activeSection === "danger" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6" /> Account Termination
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  Irreversibly wipe your user credentials, files, and complete data records.
                </p>
              </div>

              <div className="rounded-2xl border border-red-950/40 bg-red-950/10 p-5 text-sm text-red-400/90 leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-base text-red-400">
                  <ShieldAlert className="h-5 w-5" /> EXTREME WARNING: Permanent Actions
                </p>
                <p>
                  Proceeding below triggers the complete deletion of your profile credentials, target exam settings, 
                  stored practice PDF assets, AI explanation crops, and mock attempts. 
                  This sequence cannot be undone.
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Verify Password</label>
                  <input
                    type="password"
                    value={deleteConfirm.password}
                    onChange={(e) => setDeleteConfirm({ ...deleteConfirm, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Confirmation Phrase
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm.phrase}
                    onChange={(e) => setDeleteConfirm({ ...deleteConfirm, phrase: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder='Type "CONFIRM DELETE" to enable deletion'
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={deleteLoading || deleteConfirm.phrase !== "CONFIRM DELETE"}
                    className="rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none px-6 py-2.5 font-bold text-white shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Permanently Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
