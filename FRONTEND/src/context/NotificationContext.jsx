import { createContext, useState, useEffect, useRef, useContext } from "react";
import { getSession } from "../services/practiceService";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

const STORAGE_KEY = "exampilot_notifications";
const STORAGE_VERSION = 1;
const MAX_NOTIFICATIONS = 100;
const EVENT_SOURCE = "POLLING"; // Swappable with "SSE" or "WEBSOCKET" later

export default function NotificationProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [processingSessionIds, setProcessingSessionIds] = useState([]);
  
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem("exampilot_settings_notifications");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored notifications preferences", e);
    }
    return { upload: true, mentor: true, system: true };
  });

  const getNotificationPreferences = () => notificationPrefs;

  const updateNotificationPreferences = (newPrefs) => {
    localStorage.setItem("exampilot_settings_notifications", JSON.stringify(newPrefs));
    setNotificationPrefs(newPrefs);
  };

  const pollingRef = useRef(null);
  const processingRef = useRef([]);

  // Sync ref with state so polling effect always sees latest list
  useEffect(() => {
    processingRef.current = processingSessionIds;
  }, [processingSessionIds]);

  // Clean up polling interval helper
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // 1. Initialize & load notifications from localStorage with version check and 7-day cleanup
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === STORAGE_VERSION && Array.isArray(parsed.notifications)) {
          // Version is correct, apply 7-day cleanup pruning
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const validNotifications = parsed.notifications.filter((n) => {
            const created = new Date(n.createdAt);
            return created.getTime() >= sevenDaysAgo.getTime();
          });

          // Enforce max 100 limit just in case
          const limited = enforceLimit(validNotifications);

          setNotifications(limited);
          saveToStorage(limited);
        } else {
          // Version mismatch - safely discard and reset
          resetStorage();
        }
      } else {
        // Initialize empty
        resetStorage();
      }
    } catch (err) {
      console.error("Failed to load notifications from localStorage", err);
      resetStorage();
    }
  }, []);

  // Reset helper
  const resetStorage = () => {
    const fresh = { version: STORAGE_VERSION, notifications: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setNotifications([]);
  };

  // Save helper
  const saveToStorage = (list) => {
    const container = { version: STORAGE_VERSION, notifications: list };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
  };

  // Enforce Max 100 limit
  const enforceLimit = (list) => {
    if (list.length <= MAX_NOTIFICATIONS) return list;

    // Separate read and unread
    const readItems = list.filter((n) => n.read);
    const unreadItems = list.filter((n) => !n.read);

    // Sort both by createdAt ascending (oldest first)
    readItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    unreadItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let itemsToRemove = list.length - MAX_NOTIFICATIONS;
    const itemsToKeep = [...list];

    // 1. Remove oldest read first
    while (itemsToRemove > 0 && readItems.length > 0) {
      const oldestRead = readItems.shift();
      const idx = itemsToKeep.findIndex((n) => n.id === oldestRead.id);
      if (idx !== -1) {
        itemsToKeep.splice(idx, 1);
        itemsToRemove--;
      }
    }

    // 2. Remove oldest unread if still exceeding
    while (itemsToRemove > 0 && unreadItems.length > 0) {
      const oldestUnread = unreadItems.shift();
      const idx = itemsToKeep.findIndex((n) => n.id === oldestUnread.id);
      if (idx !== -1) {
        itemsToKeep.splice(idx, 1);
        itemsToRemove--;
      }
    }

    return itemsToKeep;
  };

  // 2. Add notification with duplicate prevention
  const addNotification = (title, message, type, actionUrl, metadata = {}, category = "SYSTEM", priority = "NORMAL") => {
    const categoryKey = category ? category.toLowerCase() : "system";
    if (notificationPrefs && notificationPrefs[categoryKey] === false) {
      return;
    }
    let resultList = [];
    setNotifications((prev) => {
      // Duplicate prevention: compare type, actionUrl, and title against existing UNREAD items
      const isDuplicate = prev.some(
        (n) => !n.read && n.type === type && n.actionUrl === actionUrl && n.title === title
      );

      if (isDuplicate) {
        return prev;
      }

      const newItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
        category,
        priority,
        createdAt: new Date().toISOString(),
        read: false,
        actionUrl,
        metadata,
      };

      const updated = [newItem, ...prev]; // newer first
      const limited = enforceLimit(updated);
      resultList = limited;
      return limited;
    });

    // Sync to storage
    setTimeout(() => {
      if (resultList.length > 0) {
        saveToStorage(resultList);
      }
    }, 0);
  };

  // Operations
  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveToStorage(updated);
      return updated;
    });
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications((prev) => {
      saveToStorage([]);
      return [];
    });
  };

  // 3. Optimized Upload Polling
  const registerProcessingSession = (sessionId) => {
    if (!sessionId) return;
    setProcessingSessionIds((prev) => {
      if (prev.includes(sessionId)) return prev;
      return [...prev, sessionId];
    });
  };

  // Polling controller effect
  useEffect(() => {
    // If not polling transport, or no processing IDs exist, or no logged-in user: stop
    if (EVENT_SOURCE !== "POLLING" || processingSessionIds.length === 0 || !token) {
      stopPolling();
      return;
    }

    // Start interval if not already running
    if (!pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        const currentIds = [...processingRef.current];
        if (currentIds.length === 0) {
          stopPolling();
          return;
        }

        for (const id of currentIds) {
          try {
            const session = await getSession(id);
            if (session && (session.status === "READY" || session.status === "FAILED")) {
              const statusName = session.status;
              const title = session.title || "Exam PDF";

              // Trigger notification based on status
              if (statusName === "READY") {
                addNotification(
                  "Practice Paper Ready",
                  `Your uploaded PDF "${title}" is ready for timed testing!`,
                  "PDF_READY",
                  `/student/practice`, // routes to practice papers
                  { practiceSessionId: id },
                  "UPLOAD",
                  "NORMAL"
                );
              } else if (statusName === "FAILED") {
                addNotification(
                  "PDF Ingestion Failed",
                  `Failed to extract questions from "${title}".`,
                  "PDF_FAILED",
                  `/student/workspace`, // routes to dashboard upload
                  { practiceSessionId: id },
                  "UPLOAD",
                  "HIGH"
                );
              }

              // Remove from tracking list
              setProcessingSessionIds((prev) => prev.filter((item) => item !== id));
            }
          } catch (err) {
            console.error(`Failed to poll status for practice session ID: ${id}`, err);
          }
        }
      }, 6000);
    }

    return () => {
      // Only clear if unmounting or dependency changes
    };
  }, [processingSessionIds, token]);

  // 4. Logout behavior: clear runtime state and stop polling on token removal
  useEffect(() => {
    if (!token) {
      stopPolling();
      setProcessingSessionIds([]);
    }
  }, [token]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        registerProcessingSession,
        getNotificationPreferences,
        updateNotificationPreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
