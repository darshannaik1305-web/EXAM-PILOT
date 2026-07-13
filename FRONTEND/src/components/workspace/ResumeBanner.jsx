import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Play, Calendar, HelpCircle } from "lucide-react";
import { formatDate } from "../../utils/formatters";

function ResumeBanner({ session }) {
  if (!session) return null;

  return (
    <Card className="relative overflow-hidden bg-slate-900 border border-border text-text flex flex-col justify-between h-full">
      {/* Subtle overlay accent */}
      <div className="absolute right-0 top-0 w-36 h-36 bg-primary/10 rounded-full filter blur-xl"></div>

      <div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary mb-4">
          Resume Last Session
        </span>
        <h4 className="text-xl font-bold tracking-tight mb-2 font-outfit truncate pr-8">
          {session.title}
        </h4>
        
        <div className="flex flex-col space-y-2 mt-4 text-xs text-muted font-medium">
          <div className="flex items-center space-x-1.5">
            <Calendar size={13} />
            <span>Uploaded: {formatDate(session.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HelpCircle size={13} />
            <span>{session.totalQuestions} Questions</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link to={`/student/practice/${session.id}`}>
          <Button variant="primary" className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5">
            <Play size={14} fill="currentColor" />
            <span>Resume Mock Test</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default ResumeBanner;
