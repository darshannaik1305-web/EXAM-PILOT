import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import { timeAgo } from "../../utils/timeAgo";
import {
  Bell,
  Menu,
  Target,
  Sparkles,
  Activity,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Bot,
  Info,
  Trash2
} from "lucide-react";

function Header({ setIsMobileOpen }) {
  const { user } = useContext(AuthContext);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useContext(NotificationContext);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/student/workspace")) return "Workspace Dashboard";
    if (path.includes("/student/practice") && path.includes("/review")) return "Attempt Review";
    if (path.includes("/student/practice")) return "Practice Papers";
    if (path.includes("/student/mock-tests")) return "Mock Exams";
    if (path.includes("/student/analytics")) return "Performance Analytics";
    if (path.includes("/student/mentor")) return "AI Study Mentor";
    if (path.includes("/student/achievements")) return "Achievements Hub";
    if (path.includes("/student/settings")) return "Settings";
    return "Student Workspace";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PDF_READY":
      case "SUCCESS":
        return CheckCircle;
      case "PDF_FAILED":
      case "ERROR":
        return AlertCircle;
      case "WARNING":
        return AlertTriangle;
      case "AI_RESPONSE":
        return Bot;
      default:
        return Info;
    }
  };

  const getIconBg = (type, read) => {
    if (read) return "bg-slate-800/30 text-slate-500 border border-slate-800/40";
    switch (type) {
      case "PDF_READY":
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "PDF_FAILED":
      case "ERROR":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "WARNING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "AI_RESPONSE":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      default:
        return "bg-slate-800/60 text-slate-300 border border-slate-700/60";
    }
  };

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    setIsDropdownOpen(false);
    
    if (item.metadata?.testSessionId && item.actionUrl.includes("review")) {
      const practiceSessionId = item.metadata.practiceSessionId || 0;
      navigate(`/student/practice/${practiceSessionId}/review?testSessionId=${item.metadata.testSessionId}`);
    } else {
      navigate(item.actionUrl);
    }
  };

  // Derive initials from user email/details
  const displayName = user?.email || "Student";
  const userInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card text-text select-none">
      {/* Left: Mobile hamburger trigger + dynamic title breadcrumb / mobile branding */}
      <div className="flex items-center space-x-3.5 flex-1 min-w-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-xl text-muted hover:text-text hover:bg-slate-800/40 focus:outline-none"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile Logo Branding */}
        <div className="flex sm:hidden items-center space-x-2 flex-shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 border border-violet-500/20 shadow-inner">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-header-mobile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#logo-header-mobile-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.5 12L12 10L15.5 12" stroke="url(#logo-header-mobile-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="1.5" fill="url(#logo-header-mobile-grad)" />
            </svg>
          </div>
          <span className="text-sm font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-tight">
            ExamPilot
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-2.5">
          <span className="w-1.5 h-1.5 bg-gradient-to-tr from-violet-500 to-cyan-400 rounded-full animate-pulse flex-shrink-0" />
          <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-outfit truncate">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Middle: Goal, Tip, and Status (hidden on mobile, wrapped on tablet) */}
      <div className="hidden lg:flex items-center space-x-3.5 mx-4 flex-shrink-0">
        {/* Today's Goal */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-border/80 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-muted uppercase tracking-wider">
          <Target size={12} className="text-violet-400" />
          <span>Goal: 20 Qs</span>
        </div>

        {/* Quick Tip */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-border/80 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-muted uppercase tracking-wider max-w-[200px] truncate">
          <Sparkles size={11} className="text-cyan-400" />
          <span className="truncate">Tip: Practice timed</span>
        </div>

        {/* Workspace Status */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-border/80 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-muted uppercase tracking-wider">
          <Activity size={12} className="text-emerald-400 animate-pulse" />
          <span className="text-emerald-400">Agent Active</span>
        </div>
      </div>

      {/* Right: Notifications trigger + profile initials avatar */}
      <div className="flex items-center space-x-4 flex-shrink-0 relative" ref={dropdownRef}>
        {/* Notification Bell */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`p-2 rounded-xl relative transition-all ${
            isDropdownOpen ? "text-text bg-slate-800/60" : "text-muted hover:text-text hover:bg-slate-800/40"
          }`}
          aria-label="Notifications"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isDropdownOpen && (
          <div className="absolute top-14 right-0 md:right-4 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl p-4 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200 select-none">
            {/* Header controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2.5">
              <span className="text-xs font-bold text-slate-200">Notifications</span>
              <div className="flex items-center space-x-2.5">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearAll()}
                    className="text-[10px] font-semibold text-muted hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List scroll container */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 bg-slate-800/30 text-muted rounded-full mb-2">
                    <Bell size={24} className="opacity-40" />
                  </div>
                  <p className="text-xs font-bold text-slate-400">You're all caught up!</p>
                  <p className="text-[10px] text-muted mt-0.5">No new alerts to review.</p>
                </div>
              ) : (
                notifications.map((item) => {
                  const Icon = getNotificationIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`flex items-start space-x-3 p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                        !item.read
                          ? "bg-slate-800/40 border-violet-500/20 hover:border-violet-500/40"
                          : "bg-transparent border-transparent hover:bg-slate-800/25 hover:border-slate-800"
                      }`}
                    >
                      {/* Color-coded Icon wrapper */}
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getIconBg(item.type, item.read)}`}>
                        <Icon size={14} />
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-xs font-bold truncate pr-3 ${!item.read ? "text-slate-100" : "text-slate-400"}`}>
                            {item.title}
                          </p>
                          <span className="text-[9px] text-muted flex-shrink-0 mt-0.5">
                            {timeAgo(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>

                      {/* Delete notification trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* User initials Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs select-none">
            {userInitials}
          </div>
          <span className="text-xs font-semibold text-muted hidden md:inline">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
