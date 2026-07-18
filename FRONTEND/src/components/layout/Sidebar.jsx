import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  BarChart3,
  Bot,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import LogoutModal from "../common/LogoutModal";

function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/student/workspace" },
    { name: "Practice Papers", icon: FileText, path: "/student/practice" },
    { name: "Mock Tests", icon: GraduationCap, path: "/student/mock-tests" },
    { name: "Analytics", icon: BarChart3, path: "/student/analytics" },
    { name: "AI Mentor", icon: Bot, path: "/student/mentor" },
    { name: "Achievements", icon: Trophy, path: "/student/achievements" },
    { name: "Settings", icon: Settings, path: "/student/settings" },
  ];

  function handleConfirmLogout() {
    logout();
    setIsLogoutOpen(false);
    navigate("/login");
  }

  return (
    <>
      {/* Desktop Sidebar container */}
      <aside
        className={`hidden md:flex flex-col h-screen border-r border-border bg-card text-text transition-all duration-300 relative ${
          isCollapsed ? "w-18" : "w-64"
        }`}
      >
        {/* Sidebar Header branding */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <Link to="/student/workspace" className="flex items-center space-x-2.5 group">
              <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 border border-violet-500/20 group-hover:border-cyan-400/40 transition-all duration-300 shadow-inner">
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-sidebar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#logo-sidebar-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.5 12L12 10L15.5 12" stroke="url(#logo-sidebar-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1.5" fill="url(#logo-sidebar-grad)" />
                </svg>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-tight group-hover:brightness-110 transition-all duration-200">
                ExamPilot
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/student/workspace" className="mx-auto flex items-center justify-center group">
              <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 border border-violet-500/20 group-hover:border-cyan-400/40 transition-all duration-300 shadow-inner">
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-sidebar-grad-col" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#logo-sidebar-grad-col)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.5 12L12 10L15.5 12" stroke="url(#logo-sidebar-grad-col)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1.5" fill="url(#logo-sidebar-grad-col)" />
                </svg>
              </div>
            </Link>
          )}

          {/* Toggle collapsed button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-4 bg-card border border-border text-muted hover:text-text rounded-full p-1 shadow-md cursor-pointer hidden md:block"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-600/10 text-primary border-l-2 border-primary"
                    : "text-muted hover:text-text hover:bg-slate-800/40"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout action */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full flex items-center space-x-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Slide-over Layout */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay mask */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          {/* Drawer content panel */}
          <aside className="relative flex flex-col w-64 h-full bg-card border-r border-border text-text animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <Link to="/student/workspace" className="flex items-center space-x-2.5 group" onClick={() => setIsMobileOpen(false)}>
                <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 border border-violet-500/20 group-hover:border-cyan-400/40 transition-all duration-300 shadow-inner">
                  <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="logo-mobile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#logo-mobile-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 12L12 10L15.5 12" stroke="url(#logo-mobile-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="1.5" fill="url(#logo-mobile-grad)" />
                  </svg>
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-tight group-hover:brightness-110 transition-all duration-200">
                  ExamPilot
                </span>
              </Link>
            </div>

            <nav className="flex-grow px-3 py-4 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center space-x-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-violet-600/10 text-primary"
                        : "text-muted hover:text-text hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  setIsLogoutOpen(true);
                }}
                className="w-full flex items-center space-x-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </>
  );
}

export default Sidebar;
