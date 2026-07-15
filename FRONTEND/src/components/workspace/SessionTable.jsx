import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/formatters";
import { Play, FileText, AlertCircle, RotateCcw, Eye, Clock } from "lucide-react";
import Button from "../ui/Button";
import { retakeTest } from "../../services/practiceService";
import { toast } from "react-hot-toast";

function SessionTable({ sessions = [] }) {
  const navigate = useNavigate();
  const [retakingId, setRetakingId] = useState(null);

  async function handleRetake(sessionId) {
    try {
      setRetakingId(sessionId);
      toast.loading("Initializing new attempt...", { id: "retake-toast" });
      await retakeTest(sessionId);
      toast.success("New attempt started!", { id: "retake-toast" });
      navigate(`/student/practice/${sessionId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to retake test.", { id: "retake-toast" });
    } finally {
      setRetakingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/65 border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
            <th className="py-4 px-6">Session Title</th>
            <th className="py-4 px-6">Upload Type</th>
            <th className="py-4 px-6">Created On</th>
            <th className="py-4 px-6 text-center">Questions</th>
            <th className="py-4 px-6 text-center">Attempts</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-text">
          {sessions.map((session) => {
            const isReady = session.status === "READY";
            const isFailed = session.status === "FAILED";
            const totalAttempts = session.totalAttempts || 0;
            const testStatus = session.latestTestStatus; // ACTIVE, COMPLETED, null

            return (
              <tr key={session.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-4 px-6 font-semibold">
                  <div className="flex items-center space-x-3">
                    <FileText size={18} className="text-muted" />
                    <span className="truncate max-w-xs">{session.title}</span>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-muted">
                  {session.uploadType === "PDF_MOCK" ? "PDF Mock Test" : "Practice Paper"}
                </td>
                <td className="py-4 px-6 text-muted text-xs font-mono">
                  {formatDate(session.createdAt)}
                </td>
                <td className="py-4 px-6 text-center font-bold font-mono">
                  {isReady ? session.totalQuestions : "—"}
                </td>
                <td className="py-4 px-6 text-center font-bold text-muted font-mono">
                  {isReady ? totalAttempts : "—"}
                </td>
                <td className="py-4 px-6">
                  {isReady && testStatus === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                      <Clock size={12} />
                      <span>In Progress</span>
                    </span>
                  ) : (
                    <Badge status={session.status} />
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  {isReady ? (
                    <div className="flex items-center justify-end space-x-2.5">
                      {testStatus === "ACTIVE" ? (
                        <>
                          <Link to={`/student/practice/${session.id}`}>
                            <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs py-1.5 px-3">
                              <Play size={11} fill="currentColor" />
                              <span>Resume</span>
                            </Button>
                          </Link>
                          {totalAttempts > 1 && (
                            <Link to={`/student/practice/${session.id}/review`}>
                              <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs py-1.5 px-3 border-border hover:bg-slate-800">
                                <Eye size={12} />
                                <span>Results</span>
                              </Button>
                            </Link>
                          )}
                        </>
                      ) : testStatus === "COMPLETED" ? (
                        <>
                          <Link to={`/student/practice/${session.id}/review?testSessionId=${session.latestTestSessionId}`}>
                            <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs py-1.5 px-3">
                              <Eye size={12} />
                              <span>View Result</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={retakingId === session.id}
                            onClick={() => handleRetake(session.id)}
                            className="inline-flex items-center gap-1.5 cursor-pointer text-xs py-1.5 px-3 border-border hover:bg-slate-800"
                          >
                            <RotateCcw size={12} />
                            <span>Retake</span>
                          </Button>
                        </>
                      ) : (
                        <Link to={`/student/practice/${session.id}`}>
                          <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5 cursor-pointer text-xs py-1.5 px-3">
                            <Play size={11} fill="currentColor" />
                            <span>Take Test</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : isFailed ? (
                    <div className="inline-flex items-center text-danger gap-1.5 text-xs font-semibold select-none">
                      <AlertCircle size={14} />
                      <span>Parsing Failed</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted font-semibold animate-pulse select-none">
                      Processing...
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SessionTable;
