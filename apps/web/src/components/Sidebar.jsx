import React, { useState, useEffect } from "react";
import { api } from "@tutor/api";

export default function Sidebar({
  videoUrl,
  setVideoUrl,
  onProcessVideo,
  onNewChat,
  currentUser,
  onLogout,
  onTriggerLogin,
  theme,
  toggleTheme,
  onOpenDashboard,
  onLoadSession,
  refreshTrigger,
}) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (currentUser) {
      api
        .getChatSessions()
        .then((res) => setHistory(res.data))
        .catch((err) => console.error("Failed to load sidebar history"));
    } else {
      setHistory([]);
    }
  }, [currentUser, refreshTrigger]);

  // Fetch history specifically for the sidebar
  // useEffect(() => {
  //   if (currentUser) {
  //     api
  //       .getChatSessions()
  //       .then((res) => {
  //         // Implement the "1_Video, 2_Video" naming convention
  //         const groupedCounts = {};
  //         const formattedHistory = res.data.map((session) => {
  //           const vId = session.video_id;
  //           if (!groupedCounts[vId]) groupedCounts[vId] = 0;
  //           groupedCounts[vId]++;

  //           return {
  //             ...session,
  //             displayName: `${groupedCounts[vId]}_Video-${vId.substring(0, 5)}`,
  //           };
  //         });

  //         // Reverse so the newest (highest number) shows at the top
  //         setHistory(formattedHistory.reverse());
  //       })
  //       .catch((err) => console.error("Failed to load sidebar history"));
  //   } else {
  //     setHistory([]);
  //   }
  // }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      api
        .getChatSessions()
        .then((res) => setHistory(res.data)) // The backend already sorted it!
        .catch((err) => console.error("Failed to load sidebar history"));
    } else {
      setHistory([]);
    }
  }, [currentUser]);

  // NEW: Delete a specific chat session
  const handleDeleteChat = async (e, sessionId) => {
    e.stopPropagation(); // Prevent the click from also triggering onLoadSession
    if (!window.confirm("Delete this chat?")) return;

    try {
      await api.deleteChatSession(sessionId);
      // Remove it from the sidebar UI state immediately
      setHistory((prev) => prev.filter((session) => session._id !== sessionId));
    } catch (err) {
      alert("Failed to delete chat.");
    }
  };

  return (
    <aside className="sidebar">
      <button
        style={{
          background: "transparent",
          border: "1px solid var(--border-main)",
          color: "var(--text-sidebar)",
          padding: "12px",
          borderRadius: "6px",
          cursor: "pointer",
          textAlign: "left",
          marginBottom: "20px",
        }}
        onClick={onNewChat}
      >
        + New Chat
      </button>

      {/* Video Loading Controls */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Paste YouTube URL..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid var(--border-main)",
            background: "var(--input-bg)",
            color: "var(--text-main)",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={onProcessVideo}
          style={{
            width: "100%",
            padding: "10px",
            background: "var(--btn-primary)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "13px",
          }}
        >
          Process Video
        </button>
      </div>

      {/* NEW: ChatGPT Style Chat History List */}
      {/* <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontWeight: "600",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Recent Chats
        </div>
        {history.length === 0 && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            No history yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {history.map((session) => (
            <button
              key={session._id}
              onClick={() => onLoadSession(session._id, session.video_id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-main)",
                padding: "10px 8px",
                textAlign: "left",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.target.style.background = "var(--chat-bg-ai)")
              }
              onMouseOut={(e) => (e.target.style.background = "transparent")}
            >
              💬 {session.displayName}
            </button>
          ))}
        </div>
      </div> */}

      <div className="sidebar-history-container">
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontWeight: "600",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Recent Chats
        </div>
        {history.length === 0 && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            No history yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {history.map((session) => (
            <div
              key={session._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background 0.2s",
                color: "var(--text-main)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "var(--chat-bg-ai)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() => onLoadSession(session._id, session.video_id)}
            >
              {/* Uses the new pre-formatted backend field */}
              <span
                style={{
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                💬 {session.chat_name}
              </span>

              {/* Delete Button inside the hover row */}
              <button
                onClick={(e) => handleDeleteChat(e, session._id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc3545",
                  cursor: "pointer",
                  fontSize: "14px",
                  opacity: 0.7,
                }}
                title="Delete Chat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderTop: "1px solid var(--border-main)",
          paddingTop: "16px",
        }}
      >
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-main)",
            padding: "8px 0",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
            fontWeight: "500",
          }}
          onClick={onOpenDashboard}
        >
          📚 My Library →
        </button>

        <button
          onClick={toggleTheme}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-main)",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        {currentUser ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "var(--text-main)",
                fontSize: "14px",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "var(--btn-primary)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: "transparent",
                border: "1px solid var(--border-main)",
                color: "var(--text-muted)",
                padding: "6px",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={onTriggerLogin}
            style={{
              background: "transparent",
              border: "1px solid var(--btn-primary)",
              color: "var(--btn-primary)",
              padding: "8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
