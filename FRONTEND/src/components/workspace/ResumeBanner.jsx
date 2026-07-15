import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Play, Calendar, HelpCircle, Trophy, Eye, RotateCcw } from "lucide-react";
import { formatDate } from "../../utils/formatters";
import { retakeTest } from "../../services/practiceService";
import { toast } from "react-hot-toast";

function ResumeBanner({ session }) {
  const navigate = useNavigate();
  const [retaking, setRetaking] = useState(false);

  if (!session) return null;

  const testStatus = session.latestTestStatus; // ACTIVE, COMPLETED, null
  const totalAttempts = session.totalAttempts || 0;
  const bestScore = session.bestScore;
  const bestAccuracy = session.bestAccuracy;

  async function handleRetake() {
    try {
      setRetaking(true);
      toast.loading("Initializing new attempt...", { id: "banner-retake-toast" });
      await retakeTest(session.id);
      toast.success("New attempt started!", { id: "banner-retake-toast" });
      navigate(`/student/practice/${session.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to retake test.", { id: "banner-retake-toast" });
    } finally {
      setRetaking(false);
    }
  }

  return (
    <Card className="relative overflow-hidden bg-slate-900 border border-border text-text flex flex-col justify-between h-full min-h-[260px]">
      {/* Subtle overlay accent */}
      <div className="absolute right-0 top-0 w-36 h-36 bg-primary/10 rounded-full filter blur-xl"></div>

      <div>
        {testStatus === "ACTIVE" ? (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 select-none">
            Resume Active Test
          </span>
        ) : testStatus === "COMPLETED" ? (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 select-none">
            ✓ Test Completed
          </span>
        ) : (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary mb-4 select-none">
            Start Mock Test
          </span>
        )}

        <h4 className="text-xl font-bold tracking-tight mb-2 font-outfit truncate pr-8">
          {session.title}
        </h4>
        
        {testStatus === "COMPLETED" ? (
          <div className="grid grid-cols-3 gap-2 bg-slate-950/40 border border-border/40 p-3 rounded-xl mt-4 select-none">
            <div className="text-center">
              <span className="block text-[10px] font-bold text-muted uppercase tracking-wider">Latest Score</span>
              <strong className="text-sm font-bold text-text font-mono">
                {session.latestScore !== null && session.latestScore !== undefined ? session.latestScore.toFixed(1) : "—"}
              </strong>
            </div>
            <div className="text-center border-x border-border/40">
              <span className="block text-[10px] font-bold text-muted uppercase tracking-wider">Accuracy</span>
              <strong className="text-sm font-bold text-emerald-400 font-mono">
                {session.latestAccuracy !== null && session.latestAccuracy !== undefined ? `${session.latestAccuracy.toFixed(1)}%` : "—"}
              </strong>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-muted uppercase tracking-wider">Attempt</span>
              <strong className="text-sm font-bold text-text font-mono">
                #{totalAttempts}
              </strong>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 mt-4 text-xs text-muted font-medium">
            <div className="flex items-center space-x-1.5">
              <Calendar size={13} />
              <span>Uploaded: {formatDate(session.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <HelpCircle size={13} />
              <span>{session.totalQuestions} Questions</span>
            </div>
            {totalAttempts > 0 && (
              <div className="flex items-center space-x-1.5">
                <Trophy size={13} className="text-amber-500" />
                <span>
                  Best Score: {bestScore !== null ? `${bestScore.toFixed(1)} pts` : "—"} 
                  {bestAccuracy !== null ? ` (${bestAccuracy.toFixed(1)}% Acc)` : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        {testStatus === "ACTIVE" ? (
          <Link to={`/student/practice/${session.id}`} className="w-full">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5">
              <Play size={14} fill="currentColor" />
              <span>Resume Mock Test</span>
            </Button>
          </Link>
        ) : testStatus === "COMPLETED" ? (
          <>
            <Link to={`/student/practice/${session.id}/review?testSessionId=${session.latestTestSessionId}`} className="w-full">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5 font-semibold">
                <Eye size={14} />
                <span>View Result</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              disabled={retaking}
              onClick={handleRetake}
              className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5 border-border hover:bg-slate-800 font-semibold"
            >
              <RotateCcw size={14} />
              <span>Retake Test</span>
            </Button>
          </>
        ) : (
          <Link to={`/student/practice/${session.id}`} className="w-full">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5">
              <Play size={14} fill="currentColor" />
              <span>Start Mock Test</span>
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

export default ResumeBanner;
