import { createContext, useState, useEffect, useContext } from "react";
import { sendMentorMessage } from "../services/mentorService";
import { NotificationContext } from "./NotificationContext";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const MentorContext = createContext();

const STORAGE_KEY = "exampilot_mentor_messages";
const INITIAL_MESSAGE = {
  role: "model",
  content: "Hello! I am your AI Mentor. I've reviewed your ExamPilot study history and analytics profile. How can I help you optimize your study strategies or resolve doubt topics today?"
};

export default function MentorProvider({ children }) {
  const { token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [sending, setSending] = useState(false);

  // 1. Load conversation history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load mentor messages from localStorage", err);
    }
  }, []);

  // Sync messages list changes to localStorage
  const saveMessages = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  // 2. Clear state on logout
  useEffect(() => {
    if (!token) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(STORAGE_KEY);
      setSending(false);
    }
  }, [token]);

  // 3. Send message handler (runs in background even if page changes)
  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;

    const userMessage = { role: "user", content: text.trim() };
    let currentHistory = [];

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      currentHistory = updated;
      saveMessages(updated);
      return updated;
    });

    setSending(true);

    try {
      // Clean request payload format
      const historyToSend = currentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendMentorMessage(historyToSend);
      const replyContent = result?.reply || "";

      setMessages((prev) => {
        const updated = [...prev, { role: "model", content: replyContent }];
        saveMessages(updated);
        return updated;
      });

      // Fire notification in NotificationContext
      const truncatedPrompt = text.length > 30 ? text.substring(0, 30) + "..." : text;
      addNotification(
        "AI Mentor Answered",
        `Answer to: "${truncatedPrompt}" is ready in your chatbox.`,
        "AI_RESPONSE",
        "/student/mentor",
        { mentorConversationId: "active" },
        "MENTOR",
        "NORMAL"
      );

    } catch (err) {
      console.error("Failed to fetch response from AI Mentor", err);
      toast.error("Failed to get response from AI Mentor. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <MentorContext.Provider
      value={{
        messages,
        sending,
        isChatGenerating: sending, // duplicate naming support
        sendMessage,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
}
