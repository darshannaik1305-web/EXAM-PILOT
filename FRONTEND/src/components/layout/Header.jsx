import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Bell, Search, Menu, Target, Sparkles, Activity } from "lucide-react";

function Header({ setIsMobileOpen }) {
  const { user } = useContext(AuthContext);

  // Derive initials from user email/details
  const displayName = user?.email || "Student";
  const userInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card text-text select-none">
      {/* Left: Mobile hamburger trigger + search bar shortcut */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-xl text-muted hover:text-text hover:bg-slate-800/40 focus:outline-none"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Workspace Search shortcut */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <Search size={14} className="absolute left-3 top-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search workspace... (Ctrl + K)"
            disabled
            className="w-full pl-9 pr-4 py-2 text-xs border border-border bg-slate-900/60 rounded-xl text-muted cursor-not-allowed"
          />
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
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Notification Bell */}
        <button
          className="p-2 text-muted hover:text-text rounded-xl hover:bg-slate-800/40 relative transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Subtle indicator dot */}
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
        </button>

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
