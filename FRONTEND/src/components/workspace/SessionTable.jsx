import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/formatters";
import { Play, FileText, AlertCircle } from "lucide-react";
import Button from "../ui/Button";

function SessionTable({ sessions = [] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/65 border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
            <th className="py-4 px-6">Session Title</th>
            <th className="py-4 px-6">Upload Type</th>
            <th className="py-4 px-6">Created On</th>
            <th className="py-4 px-6 text-center">Questions</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-text">
          {sessions.map((session) => {
            const isReady = session.status === "READY";
            const isFailed = session.status === "FAILED";

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
                <td className="py-4 px-6">
                  <Badge status={session.status} />
                </td>
                <td className="py-4 px-6 text-right">
                  {isReady ? (
                    <Link to={`/student/practice/${session.id}`}>
                      <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5 cursor-pointer">
                        <Play size={11} fill="currentColor" />
                        <span>Practice</span>
                      </Button>
                    </Link>
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
