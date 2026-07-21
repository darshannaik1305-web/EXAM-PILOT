import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  startOrResumeTest,
  getTestQuestion,
  saveTestAnswer,
  getTestPalette,
  submitTest,
} from "../services/practiceService";
import { API_BASE_URL } from "../services/api";
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Flag,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

function PracticeTest() {
  const { id } = useParams(); // Practice Session ID
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [palette, setPalette] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Current Question Answering State
  const [selectedOption, setSelectedOption] = useState("");
  const [isMarkedForReview, setIsMarkedForReview] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  // Time spent tracking
  const questionLoadedAt = useRef(null);
  const timerRef = useRef(null);
  const didInit = useRef(false);

  // Confirmation Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // 1. Initial Start or Resume
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    async function initTest() {
      try {
        setLoading(true);
        const testSession = await startOrResumeTest(id);
        
        // If the session has already completed (e.g. time expired), redirect to results/review immediately
        if (testSession.status === "COMPLETED") {
          toast.success("This test session has already been completed.");
          navigate(`/student/practice/${id}/review?testSessionId=${testSession.id}`);
          return;
        }

        setSession(testSession);

        // Calculate time remaining
        const remaining = testSession.remainingSeconds !== undefined && testSession.remainingSeconds !== null
          ? testSession.remainingSeconds
          : (testSession.durationSeconds - Math.floor((new Date() - new Date(testSession.startedAt)) / 1000));
        setTimeLeft(remaining > 0 ? remaining : 0);

        // Load Question 1
        await loadQuestion(testSession.id, 1);
        
        // Load Palette
        const paletteData = await getTestPalette(testSession.id);
        setPalette(paletteData);

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load test session. Please try again.");
        navigate("/student/workspace");
      }
    }
    initTest();
  }, [id]);

  // 2. Timer effect
  useEffect(() => {
    if (timeLeft <= 0 && !loading && session) {
      handleAutoSubmit();
      return;
    }

    if (session && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, session, loading]);

  // 3. Auto Submit on Timer Expiry
  async function handleAutoSubmit() {
    toast.error("Time is up! Submitting your test automatically...", { duration: 5000 });
    await executeSubmission();
  }

  // 4. Load Question Helper
  async function loadQuestion(testSessionId, questionNumber) {
    try {
      const q = await getTestQuestion(testSessionId, questionNumber);
      setCurrentQuestion(q);
      setSelectedOption(q.selectedOption || "");
      setIsMarkedForReview(q.isMarkedForReview || false);
      setIsSkipped(q.isSkipped || false);
      questionLoadedAt.current = new Date();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load question.");
    }
  }

  // 5. Save Current Answer Helper
  async function saveCurrentAnswer(skipFlag = false, reviewFlag = false) {
    if (!session || !currentQuestion) return false;
    
    setSaving(true);
    try {
      // Calculate time spent on question in seconds
      const secondsSpent = Math.max(1, Math.floor((new Date() - questionLoadedAt.current) / 1000));
      
      const payload = {
        selectedOption: selectedOption || null,
        isMarkedForReview: reviewFlag,
        isSkipped: skipFlag && !selectedOption,
        timeSpentSeconds: secondsSpent
      };

      await saveTestAnswer(session.id, currentQuestion.questionNumber, payload);
      setSaving(false);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save answer progress.");
      setSaving(false);
      return false;
    }
  }

  // 6. Navigation: Next / Prev / Direct click
  async function navigateToQuestion(targetNum) {
    if (saving) return;
    
    // Save current answer state first
    const saved = await saveCurrentAnswer(isSkipped, isMarkedForReview);
    if (!saved) return;

    // Refresh Palette
    const paletteData = await getTestPalette(session.id);
    setPalette(paletteData);

    // Load target question
    await loadQuestion(session.id, targetNum);
  }

  // Action Button: Save & Next
  async function handleSaveNext() {
    if (currentQuestion.questionNumber < session.totalQuestions) {
      await navigateToQuestion(currentQuestion.questionNumber + 1);
    } else {
      // Last question - save and prompt submit
      await saveCurrentAnswer(false, isMarkedForReview);
      const paletteData = await getTestPalette(session.id);
      setPalette(paletteData);
      setShowSubmitModal(true);
    }
  }

  // Action Button: Skip
  async function handleSkipNext() {
    setIsSkipped(true);
    setSelectedOption(""); // Clear selection if skipped
    
    if (currentQuestion.questionNumber < session.totalQuestions) {
      setSaving(true);
      const secondsSpent = Math.max(1, Math.floor((new Date() - questionLoadedAt.current) / 1000));
      await saveTestAnswer(session.id, currentQuestion.questionNumber, {
        selectedOption: null,
        isMarkedForReview: false,
        isSkipped: true,
        timeSpentSeconds: secondsSpent
      });
      const paletteData = await getTestPalette(session.id);
      setPalette(paletteData);
      await loadQuestion(session.id, currentQuestion.questionNumber + 1);
      setSaving(false);
    } else {
      await saveTestAnswer(session.id, currentQuestion.questionNumber, {
        selectedOption: null,
        isMarkedForReview: false,
        isSkipped: true,
        timeSpentSeconds: 1
      });
      const paletteData = await getTestPalette(session.id);
      setPalette(paletteData);
      setShowSubmitModal(true);
    }
  }

  // Action Button: Mark For Review
  async function handleMarkReview() {
    setIsMarkedForReview(true);
    if (currentQuestion.questionNumber < session.totalQuestions) {
      setSaving(true);
      const secondsSpent = Math.max(1, Math.floor((new Date() - questionLoadedAt.current) / 1000));
      await saveTestAnswer(session.id, currentQuestion.questionNumber, {
        selectedOption: selectedOption || null,
        isMarkedForReview: true,
        isSkipped: false,
        timeSpentSeconds: secondsSpent
      });
      const paletteData = await getTestPalette(session.id);
      setPalette(paletteData);
      await loadQuestion(session.id, currentQuestion.questionNumber + 1);
      setSaving(false);
    } else {
      await saveTestAnswer(session.id, currentQuestion.questionNumber, {
        selectedOption: selectedOption || null,
        isMarkedForReview: true,
        isSkipped: false,
        timeSpentSeconds: 1
      });
      const paletteData = await getTestPalette(session.id);
      setPalette(paletteData);
      setShowSubmitModal(true);
    }
  }

  // Submit test session API action
  async function executeSubmission() {
    setSubmitting(true);
    try {
      const response = await submitTest(session.id);
      toast.success("Test submitted successfully!");
      setShowSubmitModal(false);
      navigate(`/student/practice/${id}/review?testSessionId=${response.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit test.");
    } finally {
      setSubmitting(false);
    }
  }

  // 7. Format timer text
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted font-medium animate-pulse">Initializing Test Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-text select-none">
      {/* Test Execution Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-border bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center text-sm font-semibold text-muted hover:text-text gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Exit Test</span>
          </button>
          <div className="h-4 w-[1px] bg-border"></div>
          <h1 className="text-base font-bold truncate max-w-md">{session?.practiceSessionTitle}</h1>
        </div>

        {/* Timer Box */}
        <div className="flex items-center space-x-3 bg-card border border-border px-4 py-1.5 rounded-full shadow-inner">
          <Timer size={16} className={timeLeft < 180 ? "text-danger animate-pulse" : "text-primary"} />
          <span className={`font-mono font-bold text-lg tracking-wider ${timeLeft < 180 ? "text-danger" : "text-text"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Question Pane */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <Card className="p-6 border border-border relative overflow-hidden bg-card/40">
              {/* Question Index Label */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/25 px-2.5 py-1 rounded-md">
                  Question {currentQuestion?.questionNumber} of {session?.totalQuestions}
                </span>
                {isMarkedForReview && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-warning">
                    <Bookmark size={12} fill="currentColor" />
                    <span>Flagged for Review</span>
                  </span>
                )}
              </div>

              {/* Question Text */}
              <p className="text-base font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                {currentQuestion?.questionText}
              </p>

              {/* Diagram Rendering */}
              {currentQuestion?.diagramUrl && (
                <div className="my-5 flex justify-center bg-slate-950/40 p-4 rounded-xl border border-border/10">
                  <img
                    src={currentQuestion.diagramUrl.startsWith("http") ? currentQuestion.diagramUrl : `${API_BASE_URL}${currentQuestion.diagramUrl}`}
                    alt={`Question ${currentQuestion.questionNumber} Diagram`}
                    style={{
                      maxWidth: currentQuestion.diagramWidth ? `${currentQuestion.diagramWidth / 3}px` : "100%",
                      maxHeight: "320px",
                    }}
                    className="object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Option Selector Grid */}
              <div className="space-y-3.5">
                {[
                  { key: "A", text: currentQuestion?.optionA },
                  { key: "B", text: currentQuestion?.optionB },
                  { key: "C", text: currentQuestion?.optionC },
                  { key: "D", text: currentQuestion?.optionD }
                ].map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  return (
                    <button
                      key={opt.key}
                      disabled={saving}
                      onClick={() => {
                        setSelectedOption(opt.key);
                        setIsSkipped(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start space-x-3.5 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md shadow-primary/5"
                          : "border-border hover:border-muted hover:bg-slate-800/20"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg font-mono font-bold text-xs ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-slate-800 border border-border text-muted"
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Question Controls Footer */}
          <div className="max-w-3xl mx-auto w-full border-t border-border pt-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                disabled={currentQuestion?.questionNumber === 1 || saving}
                onClick={() => navigateToQuestion(currentQuestion?.questionNumber - 1)}
                className="gap-2"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </Button>
              
              <Button
                variant="outline"
                disabled={saving}
                onClick={handleSkipNext}
                className="hover:bg-slate-800"
              >
                Skip Question
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                disabled={saving}
                onClick={handleMarkReview}
                className="border-warning text-warning hover:bg-warning/10 gap-1.5"
              >
                <Bookmark size={15} fill={isMarkedForReview ? "currentColor" : "none"} />
                <span>Flag for Review</span>
              </Button>

              <Button
                variant="primary"
                disabled={saving}
                onClick={handleSaveNext}
                className="gap-2 shadow-lg shadow-primary/20"
              >
                <span>{currentQuestion?.questionNumber === session?.totalQuestions ? "Review & Submit" : "Save & Next"}</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </main>

        {/* Right Side: Palette Sidebar */}
        <aside className="w-80 border-l border-border bg-slate-900/40 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Question Palette</h2>
            
            {/* Status Legend Panel */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-card/30 p-4 border border-border/50 rounded-xl text-xs text-muted">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 bg-success rounded-md border border-success/30"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 bg-warning rounded-md border border-warning/30"></span>
                <span>Marked</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 bg-rose-500 rounded-md border border-rose-500/30"></span>
                <span>Skipped</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 bg-slate-800 rounded-md border border-border"></span>
                <span>Unvisited</span>
              </div>
            </div>

            {/* Grid Palette List */}
            <div className="grid grid-cols-5 gap-2.5">
              {palette.map((item) => {
                let colorClass = "bg-slate-800 border border-border text-muted hover:border-muted";
                if (item.status === "ANSWERED") {
                  colorClass = "bg-success text-white border border-success/30";
                } else if (item.status === "REVIEW") {
                  colorClass = "bg-warning text-white border border-warning/30";
                } else if (item.status === "SKIPPED") {
                  colorClass = "bg-rose-500 text-white border border-rose-500/30";
                }

                const isCurrent = currentQuestion?.questionNumber === item.questionNumber;

                return (
                  <button
                    key={item.questionNumber}
                    disabled={saving}
                    onClick={() => navigateToQuestion(item.questionNumber)}
                    className={`w-full aspect-square flex items-center justify-center font-bold font-mono text-sm rounded-xl transition-all cursor-pointer ${colorClass} ${
                      isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : ""
                    }`}
                  >
                    {item.questionNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Box */}
          <div className="mt-8 border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white border-border py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              <span>Submit Test Session</span>
            </Button>
          </div>
        </aside>
      </div>

      {/* Confirmation Submit Overlay Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-warning">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Submit Practice Session</h3>
            </div>
            
            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to submit your mock test? Once submitted, you cannot modify your answers.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={submitting}
                onClick={executeSubmission}
                className="bg-success hover:bg-green-600 shadow-lg shadow-green-500/10"
              >
                {submitting ? "Submitting..." : "Yes, Submit Test"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pause/Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-warning">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Pause and Exit?</h3>
            </div>
            
            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to pause and exit? Your progress is saved and you can resume the test at any time.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowExitModal(false);
                  navigate("/student/workspace");
                }}
              >
                Exit Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PracticeTest;
