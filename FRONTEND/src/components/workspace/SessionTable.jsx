import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/formatters";
import { Play, FileText, AlertCircle, RotateCcw, Eye, Clock, X, ShieldAlert } from "lucide-react";
import Button from "../ui/Button";
import { retakeTest, deleteSession, getSessions } from "../../services/practiceService";
import { toast } from "react-hot-toast";

function SessionTable({ sessions = [], onSessionDeleted }) {
  const navigate = useNavigate();
  const [retakingId, setRetakingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null); // { id, title }
  const [cancelling, setCancelling] = useState(false);

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

  async function confirmCancelSession() {
    if (!cancelTarget) return;
    setCancelling(true);
    toast.loading("Cleaning up session data...", { id: "cancel-session-toast" });
    try {
      await deleteSession(cancelTarget.id);
      toast.success("Session cancelled and deleted.", { id: "cancel-session-toast" });
      if (onSessionDeleted) onSessionDeleted(cancelTarget.id);
    } catch (err) {
      console.error("Error cancelling session:", err);
      toast.error("Failed to cancel session. Please try again.", { id: "cancel-session-toast" });
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[900px] text-left border-collapse">
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
              const isProcessing = session.status === "EXTRACTING" || session.status === "UPLOADING" || session.status === "PROCESSING";
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
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="inline-flex items-center text-danger gap-1.5 text-xs font-semibold select-none">
                          <AlertCircle size={14} />
                          <span>Parsing Failed</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCancelTarget({ id: session.id, title: session.title })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          <X size={11} />
                          <span>Delete</span>
                        </button>
                      </div>
                    ) : isProcessing ? (
                      <div className="flex items-center justify-end gap-2.5">
                        <span className="text-xs text-muted font-semibold animate-pulse select-none">
                          Processing...
                        </span>
                        <button
                          type="button"
                          onClick={() => setCancelTarget({ id: session.id, title: session.title })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          <X size={11} />
                          <span>Delete</span>
                        </button>
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

      {/* Premium Glassmorphic Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Alert Warning Icon */}
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-bounce">
              <ShieldAlert size={24} />
            </div>

            {/* Titles & Description */}
            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-text font-outfit">
                Cancel & Delete Session?
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Are you sure you want to cancel and delete{" "}
                <span className="font-bold text-text">"{cancelTarget.title}"</span>?
                This will permanently remove all extracted questions and related data.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 w-full pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={confirmCancelSession}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer border border-rose-700/50"
              >
                {cancelling ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border text-muted hover:text-text text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionTable;
