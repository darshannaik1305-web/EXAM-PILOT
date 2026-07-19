import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { getSession, getQuestions, getSummary, getReviewData } from "../services/practiceService";
import { API_BASE_URL } from "../services/api";
import {
  FileText,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  HelpCircle as InfoIcon
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

function PracticeReview() {
  const { id } = useParams(); // Practice Session ID
  const [searchParams] = useSearchParams();
  const testSessionId = searchParams.get("testSessionId");
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
        if (testSessionId) {
          // Attempt Review Mode
          const [sessionData, reviewQuestions] = await Promise.all([
            getSession(id),
            getReviewData(testSessionId)
          ]);
          setSession(sessionData);
          setQuestions(reviewQuestions);
        } else {
          // Explanation Guide Mode
          const [sessionData, questionsData, summaryData] = await Promise.all([
            getSession(id),
            getQuestions(id),
            getSummary(id)
          ]);
          setSession(sessionData);
          setQuestions(questionsData);
          setSummary(summaryData);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load review data.");
        navigate("/student/workspace");
      }
    }
    loadReviewData();
  }, [id, testSessionId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted font-medium animate-pulse">
            {testSessionId ? "Analyzing test attempt performance..." : "Loading Explanations Guide..."}
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[activeQuestionIndex];

  // Helper formatting for time spent
  function formatDuration(seconds) {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  // Calculate summary stats for Attempt Review Mode
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let totalTimeSpent = 0;
  let earnedScore = 0;
  
  if (testSessionId && questions.length > 0) {
    questions.forEach((q) => {
      if (q.isSkipped) {
        skippedCount++;
      } else if (q.isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
      totalTimeSpent += (q.timeSpentSeconds || 0);
      earnedScore += (q.marksAwarded || 0);
    });
  }

  const maxPossibleScore = session ? (session.positiveMarks || 4.0) * questions.length : 0;

  function formatTotalTime(totalSeconds) {
    if (!totalSeconds) return "0s";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

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
            <span className="text-xs bg-slate-800 text-muted px-2 py-0.5 rounded border border-border">
              {testSessionId ? "Attempt Performance Review" : "Explanations Guide"}
            </span>
          </div>
        </div>

        {testSessionId && (
          <div className="flex items-center space-x-3.5 text-xs font-semibold select-none">
            {/* Score */}
            <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-border/40">
              <Award size={13} className="text-primary" />
              <span className="text-muted text-[10px] uppercase font-bold">Score:</span>
              <span className="text-text font-mono font-bold">{earnedScore.toFixed(1)} / {maxPossibleScore.toFixed(1)}</span>
            </div>

            {/* Time Taken */}
            <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-border/40">
              <Clock size={13} className="text-amber-500" />
              <span className="text-muted text-[10px] uppercase font-bold">Time:</span>
              <span className="text-text font-mono font-bold">{formatTotalTime(totalTimeSpent)}</span>
            </div>

            {/* Correct */}
            <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-border/40">
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-mono font-bold">{correctCount} Correct</span>
            </div>

            {/* Wrong */}
            <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-border/40">
              <XCircle size={13} className="text-rose-400" />
              <span className="text-rose-400 font-mono font-bold">{wrongCount} Incorrect</span>
            </div>
          </div>
        )}

        {!testSessionId && summary && (
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 font-outfit">
              <BookOpen size={16} className="text-primary" />
              <span>Questions List</span>
            </h2>
            
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isActive = idx === activeQuestionIndex;
                
                // Color coding for question boxes in Sidebar based on correctness (Only in Attempt Review Mode)
                let boxClass = "bg-slate-800 border border-border text-muted hover:text-text hover:border-muted";
                if (testSessionId) {
                  if (q.isSkipped) {
                    boxClass = "bg-slate-900 border border-slate-700 text-slate-500 hover:bg-slate-850 hover:text-text";
                  } else if (q.isCorrect) {
                    boxClass = "bg-emerald-950/40 border border-emerald-800 text-emerald-400 hover:bg-emerald-950/60";
                  } else {
                    boxClass = "bg-red-950/40 border border-red-900/80 text-red-400 hover:bg-red-950/60";
                  }
                }

                if (isActive) {
                  boxClass = "bg-primary text-white border border-primary/50 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background";
                }

                return (
                  <button
                    key={q.questionNumber || idx}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`w-full aspect-square flex items-center justify-center font-bold font-mono text-sm rounded-xl transition-all cursor-pointer ${boxClass}`}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/25 px-2.5 py-1 rounded-md">
                    Question {currentQ?.questionNumber}
                  </span>
                  
                  {/* Subject and Difficulty labels if present */}
                  {currentQ?.subject && (
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">
                      {currentQ.subject}
                    </span>
                  )}
                  {currentQ?.difficulty && (
                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded uppercase tracking-wider ${
                      currentQ.difficulty.toLowerCase() === "easy" ? "bg-emerald-950 text-emerald-400 border-emerald-800/40" :
                      currentQ.difficulty.toLowerCase() === "hard" ? "bg-red-950 text-red-400 border-red-900/40" :
                      "bg-amber-950 text-amber-400 border-amber-900/40"
                    }`}>
                      {currentQ.difficulty}
                    </span>
                  )}
                </div>

                {/* Score & Time Badges (Mode B specific) or correct answer indicator */}
                {testSessionId ? (
                  <div className="flex items-center gap-2">
                    {/* Correctness status badge */}
                    {currentQ?.isSkipped ? (
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded uppercase">
                        Skipped
                      </span>
                    ) : currentQ?.isCorrect ? (
                      <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <CheckCircle size={10} />
                        Correct
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <XCircle size={10} />
                        Incorrect
                      </span>
                    )}

                    {/* Marks badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                      currentQ?.marksAwarded > 0 ? "bg-emerald-950 text-emerald-400 border-emerald-800" :
                      currentQ?.marksAwarded < 0 ? "bg-red-950 text-red-400 border-red-900" :
                      "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      <Award size={10} />
                      {currentQ?.marksAwarded > 0 ? `+${currentQ.marksAwarded}` : currentQ?.marksAwarded} Marks
                    </span>

                    {/* Time spent badge */}
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock size={10} />
                      {formatDuration(currentQ?.timeSpentSeconds)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-success flex items-center gap-1">
                    <CheckCircle size={13} />
                    <span>Correct Answer: {currentQ?.correctAnswer}</span>
                  </span>
                )}
              </div>

              {/* Question text */}
              <p className="text-base font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                {currentQ?.questionText || currentQ?.question}
              </p>

              {/* Diagram Rendering */}
              {currentQ?.diagramUrl && (
                <div className="my-5 flex justify-center bg-slate-950/40 p-4 rounded-xl border border-border/10">
                  <img
                    src={currentQ.diagramUrl.startsWith("http") ? currentQ.diagramUrl : `${API_BASE_URL}${currentQ.diagramUrl}`}
                    alt={`Question ${currentQ.questionNumber} Diagram`}
                    style={{
                      maxWidth: currentQ.diagramWidth ? `${currentQ.diagramWidth / 3}px` : "100%",
                      maxHeight: "320px",
                    }}
                    className="object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Options list showing highlighted correct key vs student choice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { key: "A", text: currentQ?.optionA },
                  { key: "B", text: currentQ?.optionB },
                  { key: "C", text: currentQ?.optionC },
                  { key: "D", text: currentQ?.optionD }
                ].map((opt) => {
                  const isCorrect = currentQ?.correctAnswer === opt.key;
                  const isStudentChoice = currentQ?.selectedOption === opt.key;

                  let cardStyle = "border-border/60 bg-card/40 text-muted";
                  let bubbleStyle = "bg-slate-800 border border-border/50 text-muted";

                  if (testSessionId) {
                    if (isCorrect) {
                      cardStyle = "border-emerald-500 bg-emerald-500/10 text-text font-semibold shadow-inner";
                      bubbleStyle = "bg-emerald-500 text-white font-bold";
                    } else if (isStudentChoice) {
                      cardStyle = "border-red-500 bg-red-500/10 text-text font-semibold shadow-inner";
                      bubbleStyle = "bg-red-500 text-white font-bold";
                    }
                  } else {
                    if (isCorrect) {
                      cardStyle = "border-success bg-success/5 shadow-inner text-text font-semibold";
                      bubbleStyle = "bg-success text-white font-bold";
                    }
                  }

                  return (
                    <div
                      key={opt.key}
                      className={`p-4 rounded-xl border flex items-start space-x-3.5 select-text transition-all ${cardStyle}`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg font-mono font-bold text-xs ${bubbleStyle}`}>
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
              
              <div className="flex items-center space-x-2 text-primary mb-4 font-bold select-none font-outfit">
                <Sparkles size={16} fill="currentColor" />
                <h3 className="text-sm uppercase tracking-wider">AI Solved Explanation</h3>
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

            {/* Step-by-Step Solution Detail Panel (If present) */}
            {currentQ?.solution && (
              <Card className="p-6 border border-emerald-500/20 bg-gradient-to-br from-card/30 to-emerald-950/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center space-x-2 text-emerald-400 mb-4 font-bold select-none font-outfit">
                  <BookOpen size={16} />
                  <h3 className="text-sm uppercase tracking-wider">Step-by-step Solution</h3>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap select-text font-medium text-slate-200 pl-1 border-l-2 border-emerald-500/20">
                  {currentQ.solution}
                </div>
              </Card>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border pt-6 select-none">
              <Button
                variant="outline"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                className="gap-1.5 border-border hover:bg-slate-850"
              >
                <ChevronLeft size={16} />
                <span>Previous Question</span>
              </Button>

              <Button
                variant="outline"
                disabled={activeQuestionIndex === questions.length - 1}
                onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                className="gap-1.5 border-border hover:bg-slate-850"
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
