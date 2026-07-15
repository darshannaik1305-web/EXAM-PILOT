import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { getSessions } from "../services/practiceService";
import { getDashboardStats } from "../services/analyticsService";
import StatCard from "../components/workspace/StatCard";
import ResumeBanner from "../components/workspace/ResumeBanner";
import SessionTable from "../components/workspace/SessionTable";
import UploadZone from "../components/workspace/UploadZone";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import Card from "../components/ui/Card";
import {
  BookOpen,
  Zap,
  Award,
  SlidersHorizontal,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Calendar,
  Flame,
  Clock,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { formatDate } from "../utils/formatters";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

function formatSpeed(seconds) {
  if (seconds === undefined || seconds === null || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(0)}s/Q`;
  return `${(seconds / 60).toFixed(1)}m/Q`;
}

function Dashboard() {
  const { user } = useContext(AuthContext);

  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Search & Filter state
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Synchronize URL search param to local state
  useEffect(() => {
    setSearchQuery(searchParamQuery);
  }, [searchParamQuery]);

  const uploadZoneRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, [page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDashboardSearchChange = (val) => {
    setSearchQuery(val);
    setSearchParams(
      (prev) => {
        if (val) {
          prev.set("search", val);
        } else {
          prev.delete("search");
        }
        return prev;
      },
      { replace: true }
    );
  };

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchSessions() {
    setLoading(true);
    try {
      const data = await getSessions(page, 5); // Page size = 5 for better layout mapping
      if (data && data.content) {
        setSessions(data.content);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
      // Fixed id to prevent duplicate toasts inside StrictMode
      toast.error("Failed to load practice sessions. Backend server is unreachable.", {
        id: "fetch-sessions-error"
      });
    } finally {
      setLoading(false);
    }
  }

  function handleUploadSuccess() {
    setPage(0);
    fetchSessions();
    fetchStats();
  }

  function scrollToUpload() {
    uploadZoneRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Derived states: prioritize session with ACTIVE test, fallback to first READY session
  const latestReadySession = sessions.find((s) => s.status === "READY" && s.latestTestStatus === "ACTIVE")
    || sessions.find((s) => s.status === "READY")
    || null;

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timelineOnboarding = [
    { title: "Account Created", completed: true, desc: "Successfully registered workspace credentials." },
    { title: "Ready to Upload", completed: true, desc: "AI extraction engine connection active." },
    { title: "Upload PDF Paper", completed: false, desc: "Ingest your first exam worksheet." },
    { title: "Generate Mock Test", completed: false, desc: "Google Gemini will extract LaTeX math notation." },
    { title: "Complete First Test", completed: false, desc: "Submit practice answers to calculate accuracy." },
  ];

  const analyticsPlaceholders = [
    {
      title: "Weekly Practice",
      desc: "Performance analytics will appear after your first completed mock test.",
      icon: Calendar
    },
    {
      title: "Accuracy Trend",
      desc: "Accuracy history will be generated automatically.",
      icon: TrendingUp
    },
    {
      title: "Study Streak",
      desc: "Your learning streak will be calculated after completing practice sessions.",
      icon: Flame
    },
    {
      title: "Questions Solved",
      desc: "Question statistics will appear after AI processing.",
      icon: HelpCircle
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-border p-6 sm:p-8 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full filter blur-2xl"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider select-none">
              {formattedDate}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider select-none animate-pulse">
              Goal: 20 Qs
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-extrabold text-text font-outfit">
            Welcome back, {user?.username || user?.email?.split("@")[0] || "Student"}! 👋
          </h2>
          <p className="text-muted text-xs sm:text-sm max-w-xl leading-relaxed">
            Time to master today's syllabus concepts! Ingest test worksheets and review step-by-step explanations.
          </p>
        </div>

        {/* Welcome section motivational chips */}
        <div className="flex flex-wrap gap-2.5 relative z-10 lg:justify-end select-none">
          <div className="flex items-center space-x-1.5 bg-card border border-border px-3.5 py-2 rounded-xl text-xs text-muted font-medium">
            <Flame size={14} className="text-amber-500" />
            <span>Streak: <strong className="text-text font-mono">{statsLoading ? "--" : (stats?.studyStreak ?? 0)}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-card border border-border px-3.5 py-2 rounded-xl text-xs text-muted font-medium">
            <BookOpen size={14} className="text-violet-400" />
            <span>Sessions: <strong className="text-text font-mono">{statsLoading ? "—" : (stats?.totalPracticeSessions ?? 0)}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-card border border-border px-3.5 py-2 rounded-xl text-xs text-muted font-medium">
            <Award size={14} className="text-cyan-400" />
            <span>Accuracy: <strong className="text-text font-mono">{statsLoading ? "--" : (stats?.overallTestAccuracy ? `${stats.overallTestAccuracy.toFixed(0)}%` : "—")}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-card border border-border px-3.5 py-2 rounded-xl text-xs text-muted font-medium">
            <Clock size={14} className="text-emerald-400" />
            <span>Active: <strong className="text-text">Today</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard
          title="Practice Sessions"
          value={statsLoading ? "—" : (stats?.totalPracticeSessions ?? 0)}
          description="READY practice papers"
          icon={BookOpen}
        />
        <StatCard
          title="Average Solving Speed"
          value={statsLoading ? "—" : formatSpeed(stats?.averageSolvingSpeed)}
          description="Average timing per question"
          icon={Zap}
        />
        <StatCard
          title="Overall Test Accuracy"
          value={statsLoading ? "—" : (stats?.overallTestAccuracy !== undefined && stats?.overallTestAccuracy !== null ? `${stats.overallTestAccuracy.toFixed(1)}%` : "—")}
          description="Average practice score"
          icon={Award}
        />
      </div>

      {/* Upload and Resume Section */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7" ref={uploadZoneRef}>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="lg:col-span-5 h-full">
          {loading ? (
            <Skeleton className="h-full min-h-[340px]" />
          ) : (
            <ResumeBanner session={latestReadySession} />
          )}
        </div>
      </div>

      {/* Coming Soon Analytics Placeholder Cards Grid */}
      <div className="space-y-4">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-bold text-text font-outfit">
            Performance Analytics
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsPlaceholders.map((chart) => {
            const Icon = chart.icon;
            return (
              <Card key={chart.title} className="flex flex-col justify-between bg-card border-border min-h-[160px] relative group overflow-hidden hover:border-slate-600 transition-colors duration-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">{chart.title}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 border border-border text-muted select-none">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {chart.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3.5 mt-4">
                  <div className="flex items-center space-x-1.5 text-[10px] text-muted font-bold uppercase tracking-wider select-none">
                    <Icon size={12} className="text-primary" />
                    <span>Calculated by AI</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sessions and Activity log split layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Sessions Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
            <h3 className="text-lg font-bold text-text font-outfit">
              Recent Practice Sessions
            </h3>

            {/* Search & Filters */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-full sm:w-56">
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => handleDashboardSearchChange(e.target.value)}
                  placeholder="Search..."
                  className="text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 bg-slate-900 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all select-none">
                <SlidersHorizontal size={14} className="text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer font-semibold text-sm text-text bg-slate-900 border-none outline-none"
                >
                  <option value="ALL" className="bg-slate-900 text-text">All Statuses</option>
                  <option value="READY" className="bg-slate-900 text-text">Ready</option>
                  <option value="EXTRACTING" className="bg-slate-900 text-text">Extracting</option>
                  <option value="FAILED" className="bg-slate-900 text-text">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table container */}
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : sessions.length === 0 ? (
            /* Premium Onboarding Empty Card (Only when they have 0 sessions in total) */
            <div className="border border-border bg-card rounded-2xl p-12 text-center shadow-sm relative overflow-hidden group">
              <div className="absolute -inset-px bg-gradient-to-tr from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="mx-auto w-14 h-14 bg-slate-900 border border-border rounded-2xl flex items-center justify-center text-muted mb-4 relative z-10">
                <FileSpreadsheet size={24} />
              </div>
              <h4 className="text-base font-bold text-text relative z-10 font-outfit">No Practice Sessions Yet</h4>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1.5 leading-relaxed relative z-10">
                Upload your first PDF past exam paper in the dropzone above to activate Gemini questions extraction.
              </p>
              <div className="mt-5 relative z-10">
                <Button variant="outline" size="sm" onClick={scrollToUpload} className="px-5 cursor-pointer">
                  Upload Paper
                </Button>
              </div>
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-4">
              <SessionTable sessions={filteredSessions} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted">
                    Page <span className="font-semibold text-text font-mono">{page + 1}</span> of{" "}
                    <span className="font-semibold text-text font-mono">{totalPages}</span>
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="cursor-pointer px-2.5 py-1.5"
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="cursor-pointer px-2.5 py-1.5"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No search results matched */
            <div className="border border-border bg-card rounded-2xl p-12 text-center shadow-sm relative overflow-hidden">
              <div className="mx-auto w-14 h-14 bg-slate-900 border border-border rounded-2xl flex items-center justify-center text-muted mb-4">
                <Inbox size={24} />
              </div>
              <h4 className="text-base font-bold text-text font-outfit">No Results Found</h4>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1.5 leading-relaxed">
                We couldn't find any practice sessions matching "<strong>{searchQuery}</strong>". Try checking your spelling or selecting a different status filter.
              </p>
              <div className="mt-5">
                <Button variant="outline" size="sm" onClick={() => handleDashboardSearchChange("")} className="px-5 cursor-pointer">
                  Clear Search Filter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent Activity Log / Onboarding timeline checklist */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-bold text-text font-outfit flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <span>Recent Activity</span>
            </h3>
          </div>

          <Card className="p-5 space-y-5">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {sessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="flex gap-3.5 relative">
                    {/* Circle marker */}
                    <div className="w-7 h-7 rounded-full bg-slate-950 border border-border flex items-center justify-center flex-shrink-0 z-10">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === "READY" ? "bg-emerald-500" : session.status === "FAILED" ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                      }`} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted font-mono">{formatDate(session.createdAt)}</p>
                      <h5 className="text-xs sm:text-sm font-bold text-text truncate mt-0.5">
                        PDF Parsed: {session.title}
                      </h5>
                      <span className="inline-flex items-center text-[10px] text-primary hover:underline mt-1 font-semibold">
                        View details
                        <ArrowUpRight size={10} className="ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Premium Onboarding timeline checklist */
              <div className="space-y-5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {timelineOnboarding.map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 relative">
                    {/* Checklist icon circle */}
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 z-10 font-mono text-[10px] font-bold ${
                      item.completed 
                        ? "bg-slate-950 border-emerald-500/60 text-emerald-400 animate-fade-in" 
                        : "bg-slate-950 border-border text-muted"
                    }`}>
                      {item.completed ? "✓" : idx + 1}
                    </div>

                    <div className="min-w-0">
                      <h5 className={`text-xs sm:text-sm font-bold ${
                        item.completed ? "text-text" : "text-muted"
                      }`}>
                        {item.title}
                      </h5>
                      <p className="text-[10px] text-muted leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;