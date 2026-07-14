import { useState, useEffect, useRef } from "react";
import { sendMentorMessage } from "../services/mentorService";
import { getStudentAnalytics } from "../services/analyticsService";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Flame,
  Activity,
  Award,
  BookOpen,
  HelpCircle
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

function Mentor() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState(null);
  
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Hello! I am your AI Mentor. I've reviewed your ExamPilot study history and JEE analytics profile. How can I help you optimize your study strategies or resolve doubt topics today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  
  const chatEndRef = useRef(null);

  // Load stats so we can display them in the mentor sidebar
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getStudentAnalytics();
        setStats(response);
      } catch (err) {
        console.error("Failed to load analytics context for chatbot", err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMessage = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setSending(true);

    try {
      // Send message history to Spring Boot gateway
      const historyToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const result = await sendMentorMessage(historyToSend);
      setMessages((prev) => [...prev, { role: "model", content: result.reply }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message to AI Mentor. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-background text-text overflow-hidden rounded-2xl border border-border select-none">
      
      {/* Left Pane: Chat Window */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/10">
        
        {/* Chat Title bar */}
        <div className="px-6 py-4 border-b border-border bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Bot size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold font-outfit text-sm">ExamPilot Guidance Mentor</h3>
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                <Sparkles size={11} className="text-secondary" />
                <span>Gemini 2.5 Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text">
          {messages.map((msg, idx) => {
            const isModel = msg.role === "model";
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3.5 max-w-2xl ${
                  isModel ? "" : "ml-auto flex-row-reverse space-x-reverse"
                }`}
              >
                {/* Avatar Icon Box */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isModel
                    ? "bg-primary/20 text-primary border border-primary/20"
                    : "bg-cyan-500/20 text-secondary border border-cyan-500/20"
                }`}>
                  {isModel ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap border ${
                  isModel
                    ? "bg-card/65 border-border/80 text-slate-100"
                    : "bg-primary/10 border-primary/20 text-slate-100 shadow-lg shadow-primary/5"
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {/* Typing Loading State */}
          {sending && (
            <div className="flex items-start space-x-3.5 max-w-2xl">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary border border-primary/20">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-card border border-border flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message Input Footer Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-slate-900/60 flex items-center space-x-3">
          <input
            type="text"
            disabled={sending}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your doubt or revision plan question here..."
            className="flex-grow bg-slate-950 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-100 font-medium"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={sending || !inputValue.trim()}
            className="px-4 py-3 rounded-xl shadow-lg shadow-primary/15 gap-1 cursor-pointer"
          >
            <span>Ask</span>
            <Send size={14} />
          </Button>
        </form>
      </div>

      {/* Right Pane: Diagnostics context sidebar */}
      <aside className="w-80 border-l border-border bg-slate-900/40 p-6 flex flex-col justify-between overflow-y-auto hidden lg:flex">
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <BookOpen size={14} className="text-primary" />
            <span>Profile Context</span>
          </h4>

          {loadingStats ? (
            <div className="py-8 text-center space-y-2">
              <LoadingSpinner size="sm" />
              <p className="text-xs text-muted">Reading results database...</p>
            </div>
          ) : !stats || stats.totalTestsTaken === 0 ? (
            <div className="text-center py-6 bg-card/30 border border-border/50 rounded-xl p-4 text-xs text-muted">
              <HelpCircle size={28} className="mx-auto mb-2 text-muted/60" />
              <p className="font-semibold">No Stats Context</p>
              <p className="mt-1">Complete a mock test to give the AI Mentor details to inspect!</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-medium">
              <div className="bg-card/40 border border-border/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame size={16} className="text-warning" />
                  <span>Streak Timeline</span>
                </div>
                <span className="font-mono font-bold text-sm">{stats.studyStreak} Days</span>
              </div>

              <div className="bg-card/40 border border-border/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity size={16} className="text-secondary" />
                  <span>Avg Accuracy</span>
                </div>
                <span className="font-mono font-bold text-sm">{stats.averageAccuracy.toFixed(1)}%</span>
              </div>

              {stats.strongSubjects.length > 0 && (
                <div className="bg-card/40 border border-border/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-success font-bold">
                    <Award size={16} />
                    <span>Mastered Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stats.strongSubjects.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-bold tracking-tight">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {stats.weakSubjects.length > 0 && (
                <div className="bg-card/40 border border-border/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-danger font-bold">
                    <AlertTriangle size={16} />
                    <span>Needs Attention</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stats.weakSubjects.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 font-bold tracking-tight">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-muted leading-relaxed p-4 bg-card/15 border border-border/30 rounded-xl">
          The AI Mentor reviews your scores, accuracy trends, and subjects history to optimize its advice and guide you effectively.
        </div>
      </aside>
    </div>
  );
}

export default Mentor;
