import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSession, getQuestions, getSummary } from "../services/practiceService";
import {
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  HelpCircle as InfoIcon
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

function PracticeReview() {
  const { id } = useParams(); // Practice Session ID
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    async function loadReviewData() {
      try {
        setLoading(true);
        const [sessionData, questionsData, summaryData] = await Promise.all([
          getSession(id),
          getQuestions(id),
          getSummary(id)
        ]);

        setSession(sessionData);
        setQuestions(questionsData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load review data.");
        navigate("/student/workspace");
      }
    }
    loadReviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted font-medium animate-pulse">Loading Explanations Guide...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[activeQuestionIndex];

  return (
    <div className="flex flex-col h-screen bg-background text-text select-none">
      {/* Review Screen Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-border bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Link
            to="/student/workspace"
            className="flex items-center text-sm font-semibold text-muted hover:text-text gap-1.5 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-border"></div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold truncate max-w-sm">{session?.title}</h1>
            <span className="text-xs bg-slate-800 text-muted px-2 py-0.5 rounded border border-border">Explanations Guide</span>
          </div>
        </div>

        {summary && (
          <div className="flex items-center space-x-4 text-xs font-mono font-medium text-muted">
            <div>
              Total Questions: <span className="text-text font-bold">{summary.totalQuestions}</span>
            </div>
            <div className="h-3 w-[1px] bg-border"></div>
            <div>
              Parse Time: <span className="text-text font-bold">{summary.processingTimeSeconds}s</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Review Layout Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Questions Index */}
        <aside className="w-80 border-r border-border bg-slate-900/20 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <BookOpen size={16} className="text-primary" />
              <span>Questions List</span>
            </h2>
            
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isActive = idx === activeQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`w-full aspect-square flex items-center justify-center font-bold font-mono text-sm rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-white border border-primary/50 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-slate-800 border border-border text-muted hover:text-text hover:border-muted"
                    }`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Side: Active Question Text & Explanations Panel */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Active Question Box */}
            <Card className="p-6 border border-border relative bg-card/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/25 px-2.5 py-1 rounded-md">
                  Question {currentQ?.questionNumber}
                </span>
                <span className="text-xs font-semibold text-success flex items-center gap-1">
                  <CheckCircle size={13} />
                  <span>Correct Answer: {currentQ?.correctAnswer}</span>
                </span>
              </div>

              {/* Question text */}
              <p className="text-base font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                {currentQ?.questionText || currentQ?.question}
              </p>

              {/* Options list showing highlighted correct key */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { key: "A", text: currentQ?.optionA },
                  { key: "B", text: currentQ?.optionB },
                  { key: "C", text: currentQ?.optionC },
                  { key: "D", text: currentQ?.optionD }
                ].map((opt) => {
                  const isCorrect = currentQ?.correctAnswer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-4 rounded-xl border flex items-start space-x-3.5 select-text ${
                        isCorrect
                          ? "border-success bg-success/5 shadow-inner"
                          : "border-border/60 bg-card/40 text-muted"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg font-mono font-bold text-xs ${
                        isCorrect
                          ? "bg-success text-white"
                          : "bg-slate-800 border border-border/50 text-muted"
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI Explanation Details Panel */}
            <Card className="p-6 border border-primary/20 bg-gradient-to-br from-card/30 to-violet-950/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center space-x-2 text-primary mb-4 font-bold select-none">
                <Sparkles size={16} fill="currentColor" />
                <h3 className="text-sm font-outfit uppercase tracking-wider">AI Solved Explanation</h3>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap select-text font-medium text-slate-200 pl-1 border-l-2 border-primary/20">
                {currentQ?.explanation || (
                  <span className="text-muted italic flex items-center gap-1.5">
                    <InfoIcon size={14} />
                    <span>No detailed explanation generated for this question.</span>
                  </span>
                )}
              </div>
            </Card>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border pt-6 select-none">
              <Button
                variant="outline"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                className="gap-1.5"
              >
                <ChevronLeft size={16} />
                <span>Previous Question</span>
              </Button>

              <Button
                variant="outline"
                disabled={activeQuestionIndex === questions.length - 1}
                onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                className="gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default PracticeReview;
