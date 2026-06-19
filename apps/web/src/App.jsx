// apps/web/src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import { api } from "@tutor/api";
import { extractYouTubeId } from "./utils";
import "./App.css";

import Sidebar from "./components/Sidebar";
import VideoHeader from "./components/VideoHeader";
import ChatBox from "./components/ChatBox";
import InputFooter from "./components/InputFooter";
import QuickActions from "./components/QuickActions";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'processing' | 'ready' | 'error'
  const [playerTime, setPlayerTime] = useState(0);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Split-view expanded state
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const toggleVideoExpanded = () => setIsVideoExpanded((prev) => !prev);

  // Theme state tracking token configuration
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    const token = localStorage.getItem("jwtToken");
    if (savedUserData && token) setCurrentUser(JSON.parse(savedUserData));
  }, []);

  // Update DOM tree data attributes gracefully when theme updates
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    console.log(`[Theme Configuration] Applied visual mode context: ${theme}`);
  }, [theme]);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // apps/web/src/App.jsx

  // apps/web/src/App.jsx

  const handleGenerateNotes = async () => {
    if (status !== "ready") return;
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "Please generate structured notes for this video.",
      },
    ]);

    try {
      const response = await api.generateNotes(videoId);

      // --- FORMATTING LOGIC ---
      let formattedNotes = "";
      const data = response.data;

      // Check if backend returned our structured JSON
      if (data && data.content && Array.isArray(data.content)) {
        formattedNotes = "📝 **Detailed Video Summary**\n\n";

        data.content.forEach((section) => {
          // Convert JSON heading to Markdown Heading 3
          formattedNotes += `### ${section.heading}\n`;

          // Convert JSON array to Markdown bullet points
          section.bullet_points.forEach((point) => {
            formattedNotes += `- ${point}\n`;
          });
          formattedNotes += "\n"; // Add spacing between sections
        });
      } else {
        // Fallback just in case backend returns a plain string
        formattedNotes = typeof data === "string" ? data : JSON.stringify(data);
      }

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: formattedNotes.trim() },
      ]);
      triggerRefresh();
    } catch (error) {
      console.error("[API Error] Generate Notes failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I encountered an error generating notes.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (status !== "ready") return;
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Create a concept quiz for this video." },
    ]);

    try {
      const response = await api.generateQuiz(videoId);

      // --- FORMATTING LOGIC ---
      let formattedQuiz = "";
      const data = response.data;

      // Check if backend returned our structured JSON
      if (data && data.questions && Array.isArray(data.questions)) {
        formattedQuiz = `🎯 **Knowledge Check (${data.difficulty || "Medium"} Level)**\n\n`;

        data.questions.forEach((q, index) => {
          // Format Question
          formattedQuiz += `**${index + 1}. ${q.question}**\n`;

          // Format Multiple Choice Options
          q.options.forEach((opt, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex); // Generates A, B, C, D
            formattedQuiz += `   **${letter})** ${opt}\n`;
          });

          // Format Answer & Explanation
          formattedQuiz += `\n   ✅ *Answer: ${q.correct_answer}*\n   💡 *${q.explanation}*\n\n---\n\n`;
        });
      } else {
        // Fallback
        formattedQuiz = typeof data === "string" ? data : JSON.stringify(data);
      }

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: formattedQuiz.trim() },
      ]);
      triggerRefresh();
    } catch (error) {
      console.error("[API Error] Generate Quiz failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I encountered an error generating the quiz.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- NEW: Load History Session ---
  const handleLoadSession = async (pastSessionId, pastVideoId) => {
    setStatus("processing"); // Show loading state
    setVideoId(pastVideoId);
    setSessionId(pastSessionId);
    setVideoUrl(`https://youtube.com/watch?v=${pastVideoId}`);

    try {
      // 1. Fetch the actual chat history using the NEW endpoint
      const response = await api.getSessionMessages(pastSessionId);

      // 2. Format backend messages for the React UI
      const formattedMessages = response.data.map((msg) => ({
        sender: msg.role === "user" ? "user" : "ai",
        text: msg.content,
        citations: msg.citations || [],
      }));

      setMessages(formattedMessages);
      setStatus("ready");
    } catch (err) {
      console.error("Failed to load session", err);
      alert("Failed to load chat history. Ensure you are logged in.");
      setStatus("idle");
    }
  };

  // const handleInitializeVideoPipeline = async (urlToProcess) => {
  //   const targetUrl = urlToProcess || videoUrl;
  //   const extractedId = extractYouTubeId(targetUrl);
  //   if (!extractedId)
  //     return alert("Please provide a valid YouTube reference link.");

  //   console.log(
  //     `[Pipeline Initialization] Processing YouTube ID: ${extractedId}`,
  //   );
  //   setVideoId(extractedId);
  //   setStatus("processing");
  //   setMessages([]);
  //   setSessionId(null);
  //   setPlayerTime(0);

  //   try {
  //     await api.processVideo(targetUrl);

  //     const pollInterval = setInterval(async () => {
  //       try {
  //         const res = await api.getVideoStatus(extractedId);
  //         if (res.data.processing_status === "completed") {
  //           clearInterval(pollInterval);
  //           setStatus("ready");
  //           setMessages([
  //             {
  //               sender: "ai",
  //               text: "Ask anything about the video!",
  //               citations: [],
  //             },
  //           ]);
  //         } else if (res.data.processing_status === "failed") {
  //           clearInterval(pollInterval);
  //           setStatus("error");
  //         }
  //       } catch (err) {
  //         console.error("Status synchronization check failed", err);
  //       }
  //     }, 2000);
  //   } catch (error) {
  //     setStatus("error");
  //   }
  // };

  const handleInitializeVideoPipeline = async (urlToProcess) => {
    const targetUrl = urlToProcess || videoUrl;
    const extractedId = extractYouTubeId(targetUrl);
    if (!extractedId)
      return alert("Please provide a valid YouTube reference link.");

    setVideoId(extractedId);
    setStatus("processing");
    setMessages([]);
    setSessionId(null);
    setPlayerTime(0);

    try {
      // This request will now respect the 60-second cold-start timeout
      // we configured in our shared Axios instance
      await api.processVideo(targetUrl);

      const pollInterval = setInterval(async () => {
        try {
          const res = await api.getVideoStatus(extractedId);
          if (res.data.processing_status === "completed") {
            clearInterval(pollInterval);
            setStatus("ready");
            setMessages([
              {
                sender: "ai",
                text: "Ask anything about the video!",
                citations: [],
              },
            ]);
          } else if (res.data.processing_status === "failed") {
            clearInterval(pollInterval);
            setStatus("error");
            // Graceful failure if the background worker crashes
            setMessages([
              {
                sender: "ai",
                text: "This video cannot be processed. Please ensure the video has standard closed captions or subtitles available.",
                citations: [],
              },
            ]);
          }
        } catch (err) {
          console.error("Status synchronization check failed", err);
        }
      }, 2000);
    } catch (error) {
      // CATCHING EXPLICIT SUPADATA ERRORS (400, 404, 422)
      setStatus("error");
      setMessages([
        {
          sender: "ai",
          text: "This video cannot be processed. Please ensure the video has standard closed captions or subtitles available.",
          citations: [],
        },
      ]);
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

      if (!sessionId) {
        setSessionId(response.data.session_id);
        triggerRefresh();
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.data.answer,
          citations: response.data.citations || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Authorization session validation checked context error.",
          citations: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTimelineNavigation = (seconds) => {
    console.log(`[Timeline Action] User jump tracking triggered: ${seconds}s`);
    setPlayerTime(seconds);
  };

  //   if (status === "dashboard") {
  //     return (
  //       <Dashboard
  //         onBackToHome={() => setStatus("idle")}
  //         onLoadSession={handleLoadSession}
  //       />
  //     );
  //   }

  //   if (status === "idle") {
  //     return (
  //       <div
  //         className="home-splash-container"
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           height: "100vh",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           padding: "20px",
  //         }}
  //       >
  //         <div style={{ textAlign: "center", maxWidth: "600px", width: "100%" }}>
  //           <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧠</div>
  //           <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
  //             What do you want to learn today?
  //           </h1>
  //           <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
  //             Paste any YouTube video lecture link below to unlock an instant
  //             interactive AI Tutor matrix.
  //           </p>
  //           <div style={{ display: "flex", gap: "12px" }}>
  //             <input
  //               type="text"
  //               className="input-box"
  //               style={{
  //                 flex: 1,
  //                 padding: "14px",
  //                 borderRadius: "8px",
  //                 border: "1px solid var(--border-main)",
  //                 backgroundColor: "var(--bg-input)",
  //                 color: "var(--text-main)",
  //               }}
  //               placeholder="Paste YouTube link here..."
  //               value={videoUrl}
  //               onChange={(e) => setVideoUrl(e.target.value)}
  //               onKeyDown={(e) =>
  //                 e.key === "Enter" && handleInitializeVideoPipeline()
  //               }
  //             />
  //             <button
  //               className="sidebar-action-btn"
  //               style={{ width: "auto", padding: "0 24px" }}
  //               onClick={() => handleInitializeVideoPipeline()}
  //             >
  //               Initialize →
  //             </button>
  //           </div>
  //           <button
  //             onClick={() => !currentUser && setIsAuthModalOpen(true)}
  //             style={{
  //               marginTop: "32px",
  //               background: "none",
  //               border: "none",
  //               color: "var(--brand-primary)",
  //               cursor: "pointer",
  //             }}
  //           >
  //             {currentUser
  //               ? `Active Profile Account: ${currentUser.name}`
  //               : "Sign into Account Setup ↗"}
  //           </button>
  //         </div>
  //         <AuthModal
  //           isOpen={isAuthModalOpen}
  //           onClose={() => setIsAuthModalOpen(false)}
  //           onAuthSuccess={(userData) => setCurrentUser(userData)}
  //         />
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="app-layout">
  //       <Sidebar
  //         videoUrl={videoUrl}
  //         setVideoUrl={setVideoUrl}
  //         onProcessVideo={() => handleInitializeVideoPipeline()}
  //         onNewChat={() => setStatus("idle")}
  //         currentUser={currentUser}
  //         onLogout={() => {
  //           localStorage.clear();
  //           setCurrentUser(null);
  //           setStatus("idle");
  //         }}
  //         onTriggerLogin={() => setIsAuthModalOpen(true)}
  //         theme={theme}
  //         toggleTheme={toggleTheme}
  //       />

  //       <main className="main-workspace">
  //         <VideoHeader
  //           videoId={videoId}
  //           status={status}
  //           playerTime={playerTime}
  //         />
  //         <ChatBox
  //           messages={messages}
  //           isTyping={isTyping}
  //           chatEndRef={chatEndRef}
  //           onTimestampClick={handleTimelineNavigation}
  //         />
  //         <QuickActions
  //           status={status}
  //           onGenerateNotes={handleGenerateNotes}
  //           onGenerateQuiz={handleGenerateQuiz}
  //         />
  //         <InputFooter
  //           inputText={inputText}
  //           setInputText={setInputText}
  //           onSend={handleSend}
  //           status={status}
  //           isTyping={isTyping}
  //         />
  //       </main>

  //       <AuthModal
  //         isOpen={isAuthModalOpen}
  //         onClose={() => setIsAuthModalOpen(false)}
  //         onAuthSuccess={(userData) => setCurrentUser(userData)}
  //       />
  //     </div>
  //   );
  // }

  // export default App;

  // --- ROUTING LOGIC ---

  if (status === "dashboard") {
    return (
      <Dashboard
        onBackToHome={() => setStatus("idle")}
        onLoadSession={handleLoadSession}
        refreshTrigger={refreshTrigger}
      />
    );
  }

  if (status === "idle") {
    // CHATGPT-STYLE HOME SCREEN SPLASH VIEW
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
          color: "var(--text-main)",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "600px", width: "100%" }}>
          <div style={{ fontSize: "42px", marginBottom: "12px" }}>🧠</div>
          <h1
            style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px" }}
          >
            What do you want to learn today?
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "15px",
              marginBottom: "32px",
            }}
          >
            Paste any YouTube video link to unlock an interactive AI Tutor.
          </p>

          {/* --- SEARCH AND INITIALIZE BAR --- */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="Paste YouTube link here..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleInitializeVideoPipeline()
              }
              style={{
                flex: 1,
                maxWidth: "500px",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--input-bg)",
                color: "var(--text-main)",
                fontSize: "15px",
                outline: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            />

            <button
              className="home-search-btn"
              onClick={() => handleInitializeVideoPipeline()}
            >
              Initialize →
            </button>

            {currentUser && (
              <button
                onClick={() => setStatus("dashboard")}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-main)",
                  padding: "0 20px",
                  height: "52px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                📚 Library
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <button
              onClick={toggleTheme}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {theme === "light"
                ? "Switch to Dark Mode 🌙"
                : "Switch to Light Mode ☀️"}
            </button>
            {!currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--btn-primary)",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={setCurrentUser}
        />
      </div>
    );
  }

  // ACTIVE MULTI-COLUMN WORKSPACE PLATFORM VIEW
  return (
    <div className={`app-layout ${isVideoExpanded ? "video-expanded" : ""}`}>
      <Sidebar
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        onProcessVideo={() => handleInitializeVideoPipeline()}
        onNewChat={() => setStatus("idle")}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.clear();
          setCurrentUser(null);
          setStatus("idle");
        }}
        onTriggerLogin={() => setIsAuthModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDashboard={() => {
          if (!currentUser) return setIsAuthModalOpen(true);
          setStatus("dashboard");
        }}
        onLoadSession={handleLoadSession}
        refreshTrigger={refreshTrigger}
      />

      {/* Stable component tree: VideoHeader always in same position */}
      <main
        className={`main-workspace ${isVideoExpanded ? "expanded-workspace" : ""}`}
      >
        <div className={`video-pane ${isVideoExpanded ? "expanded" : ""}`}>
          <VideoHeader
            videoId={videoId}
            status={status}
            playerTime={playerTime}
            isVideoExpanded={isVideoExpanded}
            onToggleExpanded={toggleVideoExpanded}
          />
        </div>

        <div className={`chat-pane ${isVideoExpanded ? "expanded" : ""}`}>
          <ChatBox
            messages={messages}
            isTyping={isTyping}
            chatEndRef={chatEndRef}
            onTimestampClick={setPlayerTime}
          />

          <QuickActions
            status={status}
            onGenerateNotes={handleGenerateNotes}
            onGenerateQuiz={handleGenerateQuiz}
          />

          <InputFooter
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSend}
            status={status}
            isTyping={isTyping}
          />
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={setCurrentUser}
      />
    </div>
  );
}

export default App;
