import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStudentAnalytics } from "../services/analyticsService";
import {
  Trophy,
  Flame,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Inbox,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await getStudentAnalytics();
        setData(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.totalTestsTaken === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-outfit">Performance Analytics</h2>
          <p className="text-muted text-sm mt-1">Visualize your academic diagnostics and mock test history.</p>
        </div>

        <Card className="flex flex-col items-center justify-center p-12 text-center border-border">
          <Inbox size={48} className="text-muted mb-4 animate-pulse" />
          <h4 className="text-lg font-bold">No Performance History</h4>
          <p className="text-muted text-sm mt-1 max-w-sm">
            You must complete at least one Mock Test session before we can compile diagnostics, accuracy averages, and streak timelines.
          </p>
          <Link to="/student/workspace" className="mt-6">
            <Button variant="primary">Start a Mock Test</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-outfit">Performance Analytics</h2>
        <p className="text-muted text-sm mt-1">Visualize your subject strengths, accuracy levels, and pacing stats.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border border-border bg-card flex items-center space-x-4">
          <div className="p-3 bg-violet-500/10 text-primary rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Tests Completed</p>
            <h4 className="text-2xl font-black font-outfit mt-1">{data.totalTestsTaken}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-card flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-secondary rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Average Score</p>
            <h4 className="text-2xl font-black font-outfit mt-1">{data.averageScore.toFixed(1)} <span className="text-xs text-muted">pts</span></h4>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-card flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 text-success rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Average Accuracy</p>
            <h4 className="text-2xl font-black font-outfit mt-1">{data.averageAccuracy.toFixed(1)}%</h4>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-card flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-warning rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Active Streak</p>
            <h4 className="text-2xl font-black font-outfit mt-1">{data.studyStreak} <span className="text-xs text-muted">Days</span></h4>
          </div>
        </Card>
      </div>

      {/* Grid: Subject Breakdowns & Difficulty Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown Card */}
        <Card className="lg:col-span-2 p-6 border border-border bg-card space-y-6">
          <h3 className="text-lg font-bold font-outfit">Subject-wise Accuracy</h3>
          
          <div className="space-y-5">
            {data.subjectBreakdown.map((sub) => {
              // Custom badges for subjects
              let badgeColor = "bg-slate-800 text-muted";
              let badgeText = "Developing";
              if (sub.accuracy >= 70) {
                badgeColor = "bg-success/15 text-success border-success/20";
                badgeText = "Strong";
              } else if (sub.accuracy < 50) {
                badgeColor = "bg-danger/15 text-danger border-danger/20";
                badgeText = "Needs Focus";
              }

              return (
                <div key={sub.subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold font-outfit text-text">{sub.subject}</span>
                      <span className={`text-xs px-2 py-0.5 border rounded-full font-semibold ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-muted">
                      {sub.accuracy.toFixed(1)}% Accuracy
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-border/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.accuracy >= 70 ? "bg-success" : sub.accuracy < 50 ? "bg-danger" : "bg-primary"
                      }`}
                      style={{ width: `${sub.accuracy}%` }}
                    ></div>
                  </div>

                  {/* Detail counts */}
                  <div className="flex items-center space-x-4 text-xs text-muted font-medium font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-success" />
                      <span>{sub.correctAnswers} Correct</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle size={12} className="text-danger" />
                      <span>{sub.wrongAnswers} Wrong</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle size={12} />
                      <span>{sub.skippedQuestions} Skipped</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Difficulty Breakdown Card */}
        <Card className="p-6 border border-border bg-card space-y-6">
          <h3 className="text-lg font-bold font-outfit">Difficulty Performance</h3>

          <div className="space-y-6">
            {["EASY", "MEDIUM", "HARD"].map((diff) => {
              const diffData = data.difficultyBreakdown.find(d => d.difficulty === diff) || {
                accuracy: 0,
                correctAnswers: 0,
                wrongAnswers: 0
              };

              let color = "bg-success";
              if (diff === "MEDIUM") color = "bg-warning";
              if (diff === "HARD") color = "bg-danger";

              return (
                <div key={diff} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted">{diff}</span>
                    <span className="font-mono font-bold text-text">{diffData.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${diffData.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Warnings */}
          {data.weakSubjects.length > 0 && (
            <div className="border-t border-border pt-4 mt-2">
              <div className="bg-danger/10 border border-danger/25 p-3 rounded-xl flex items-start space-x-2 text-xs text-danger font-medium">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Areas Requiring Attention</p>
                  <p className="text-muted mt-0.5">
                    Your accuracy is under 50% in <span className="text-danger font-semibold">{data.weakSubjects.join(", ")}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* History Log Table */}
      <Card className="p-6 border border-border bg-card space-y-4">
        <h3 className="text-lg font-bold font-outfit">Mock Test Attempt History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                <th className="pb-3 px-2">Mock Test Title</th>
                <th className="pb-3 px-2">Submitted On</th>
                <th className="pb-3 px-2 text-center">Score</th>
                <th className="pb-3 px-2 text-center">Correct/Wrong</th>
                <th className="pb-3 px-2 text-center">Accuracy</th>
                <th className="pb-3 px-2 text-right">Solutions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-text font-medium">
              {data.history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="py-3 px-2 font-semibold truncate max-w-xs">{item.title}</td>
                  <td className="py-3 px-2 text-muted text-xs font-mono">{item.date}</td>
                  <td className="py-3 px-2 text-center font-bold font-mono text-secondary">{item.score.toFixed(1)}</td>
                  <td className="py-3 px-2 text-center text-xs font-mono text-muted">
                    <span className="text-success">{item.correctAnswers}</span> / <span className="text-danger">{item.wrongAnswers}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-success">{item.accuracy.toFixed(1)}%</td>
                  <td className="py-3 px-2 text-right">
                    <Link to={`/student/practice/${item.practiceSessionId}/review?testSessionId=${item.id}`}>
                      <Button variant="outline" size="sm" className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border-border hover:bg-slate-800">
                        <span>Review</span>
                        <ArrowRight size={11} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
