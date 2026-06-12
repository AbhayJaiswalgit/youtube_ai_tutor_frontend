import React, { useState, useRef, useEffect } from "react";
import { api } from "@tutor/api";
import ExtAuthModal from "./components/ExtAuthModal";
import "./App.css";

// Manual ChatBubble implementation to ensure CSS applies perfectly in the extension
const ExtChatBubble = ({ sender, text }) => {
  const isAI = sender === "ai";
  return (
    <div className={`chat-message ${isAI ? "ai" : "user"}`}>
      {isAI && <div className="avatar">AI</div>}
      <div className="message-content">{text}</div>
    </div>
  );
};

const extractYouTubeId = (url) => {
  const match = url?.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  );
  return match && match[2].length === 11 ? match[2] : null;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [videoTitle, setVideoTitle] = useState("No video detected");

  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["userData", "theme"], (result) => {
        if (result.userData) setCurrentUser(result.userData);
        if (result.theme) setTheme(result.theme);
      });
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (typeof chrome !== "undefined" && chrome.storage)
      chrome.storage.local.set({ theme });
  }, [theme]);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const handleTabChange = (tab) => {
        if (tab.url && tab.url.includes("youtube.com/watch")) {
          const id = extractYouTubeId(tab.url);
          if (id && id !== videoId) {
            setVideoUrl(tab.url);
            setVideoId(id);
            setVideoTitle(tab.title.replace(" - YouTube", ""));
            handleInitializeVideo(tab.url, id);
          }
        } else {
          setVideoId(null);
          setVideoTitle("No YouTube video detected");
          setStatus("idle");
          setMessages([]);
        }
      };

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) handleTabChange(tabs[0]);
      });

      const listener = (tabId, changeInfo, tab) => {
        if (changeInfo.status === "complete" && tab.active)
          handleTabChange(tab);
      };
      chrome.tabs.onUpdated.addListener(listener);
      return () => chrome.tabs.onUpdated.removeListener(listener);
    }
  }, [videoId]);

  useEffect(
    () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages, isTyping],
  );

  const handleInitializeVideo = async (url, extractedId) => {
    setStatus("processing");
    setMessages([]);
    setSessionId(null);

    try {
      await api.processVideo(url);

      const pollInterval = setInterval(async () => {
        try {
          const res = await api.getVideoStatus(extractedId);
          if (res.data.processing_status === "completed") {
            clearInterval(pollInterval);
            setStatus("ready");
            // USER FRIENDLY SUCCESS MESSAGE
            setMessages([
              {
                sender: "ai",
                text: "Video is ready! What would you like to know?",
              },
            ]);
          } else if (res.data.processing_status === "failed") {
            clearInterval(pollInterval);
            setStatus("error");
          }
        } catch (err) {}
      }, 2000);
    } catch (error) {
      setStatus("error");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || status !== "ready") return;
    if (!currentUser) return setIsAuthModalOpen(true);

    const userMessage = inputText;
    setInputText("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await api.askQuestion({
        video_id: videoId,
        message: userMessage,
        session_id: sessionId,
      });
      if (!sessionId) setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error connecting to AI." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- QUICK ACTIONS LOGIC ---
  const handleGenerateNotes = async () => {
    if (status !== "ready") return;
    if (!currentUser) return setIsAuthModalOpen(true);

    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Generate detailed study notes for this video." },
    ]);

    try {
      const response = await api.generateNotes(videoId);
      let notesText = "### 📝 Video Summary Notes\n\n";
      response.data.content.forEach((section) => {
        notesText += `**${section.heading}**\n`;
        section.bullet_points.forEach((point) => {
          notesText += `• ${point}\n`;
        });
        notesText += "\n";
      });
      setMessages((prev) => [...prev, { sender: "ai", text: notesText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Failed to generate notes." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (status !== "ready") return;
    if (!currentUser) return setIsAuthModalOpen(true);

    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "Build a quiz testing me on this video concept.",
      },
    ]);

    try {
      const response = await api.generateQuiz(videoId);
      let quizText = "### 🎯 Dynamic Interactive Quiz\n\n";
      response.data.questions.forEach((q, idx) => {
        quizText += `${idx + 1}. ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          quizText += `   ${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
        });
        quizText += `*Explanation: ${q.explanation}*\n\n`;
      });
      setMessages((prev) => [...prev, { sender: "ai", text: quizText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Failed to generate quiz." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.remove(["jwtToken", "userData"], () => {
        setCurrentUser(null);
        setSessionId(null);
        setMessages([]);
      });
    }
  };

  return (
    <div className="ext-layout">
      {/* 1. COMPACT HEADER */}
      <header className="ext-header">
        <div className="ext-brand">🧠 AI Tutor</div>
        <div className="ext-controls">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {currentUser ? (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                background: "var(--btn-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Sign In
            </button>
          )}

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="ext-link"
          >
            Website ↗
          </a>
        </div>
      </header>

      {/* 2. VIDEO CONTEXT */}
      <div className="ext-video-context">
        <span style={{ fontSize: "14px" }}>📺</span>
        <div className="ext-video-title">
          {status === "processing" ? "Analyzing: " + videoTitle : videoTitle}
        </div>
      </div>

      {/* 3. MAXIMIZED CHAT AREA */}
      <main className="ext-chat-area">
        {status === "idle" && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              marginTop: "40px",
              fontSize: "13px",
              padding: "0 20px",
            }}
          >
            Open any YouTube video to automatically initialize the AI Tutor.
          </div>
        )}

        {status === "processing" && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-main)",
              marginTop: "40px",
              fontSize: "13px",
            }}
          >
            <div style={{ marginBottom: "10px", fontSize: "24px" }}>⚙️</div>
            {/* USER FRIENDLY LOADING MESSAGE */}
            Analyzing video content...
          </div>
        )}

        <div className="chat-container-inner">
          {messages.map((msg, idx) => (
            <ExtChatBubble key={idx} sender={msg.sender} text={msg.text} />
          ))}
          {isTyping && (
            <div
              style={{
                color: "var(--text-muted)",
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              AI is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* 4. QUICK ACTIONS & INPUT FOOTER */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Render Quick Actions only when ready */}
        {status === "ready" && (
          <div className="ext-quick-actions">
            <button
              className="ext-action-btn"
              onClick={handleGenerateNotes}
              disabled={isTyping}
            >
              📝 Generate Notes
            </button>
            <button
              className="ext-action-btn"
              onClick={handleGenerateQuiz}
              disabled={isTyping}
            >
              🎯 Generate Quiz
            </button>
          </div>
        )}

        <footer className="ext-footer">
          <form className="input-box" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={
                status === "ready"
                  ? "Ask about this video..."
                  : "Waiting for video..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={status !== "ready" || isTyping}
            />
            <button
              type="submit"
              disabled={status !== "ready" || isTyping}
              style={{ opacity: status !== "ready" || isTyping ? 0.5 : 1 }}
            >
              ↑
            </button>
          </form>
        </footer>
      </div>

      {/* MODAL */}
      <ExtAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={setCurrentUser}
      />
    </div>
  );
}
