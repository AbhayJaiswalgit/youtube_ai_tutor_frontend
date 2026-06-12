// import React, { useState, useEffect } from "react";
// import { api } from "@tutor/api";
// import ContentViewerModal from "./ContentViewerModal";

// export default function Dashboard({ onBackToHome, onLoadSession }) {
//   const [activeTab, setActiveTab] = useState("sessions");
//   const [data, setData] = useState({ sessions: [], notes: [], quizzes: [] });
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewerData, setViewerData] = useState(null);
//   const [viewerType, setViewerType] = useState(null);

//   // Fetch all user data concurrently using Promise.all
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const [sessionsRes, notesRes, quizzesRes] = await Promise.all([
//           api.getChatSessions().catch(() => ({ data: [] })),
//           api.getNotes().catch(() => ({ data: [] })),
//           api.getQuizzes().catch(() => ({ data: [] })),
//         ]);

//         setData({
//           sessions: sessionsRes.data || [],
//           notes: notesRes.data || [],
//           quizzes: quizzesRes.data || [],
//         });
//       } catch (error) {
//         console.error("Failed to load dashboard data", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const handleDeleteNote = async (id) => {
//     if (!window.confirm("Delete this note permanently?")) return;
//     try {
//       await api.deleteNote(id);
//       setData((prev) => ({
//         ...prev,
//         notes: prev.notes.filter((n) => n._id !== id),
//       }));
//     } catch (err) {
//       alert("Failed to delete note.");
//     }
//   };

//   const handleDeleteQuiz = async (id) => {
//     if (!window.confirm("Delete this quiz permanently?")) return;
//     try {
//       await api.deleteQuiz(id);
//       setData((prev) => ({
//         ...prev,
//         quizzes: prev.quizzes.filter((q) => q._id !== id),
//       }));
//     } catch (err) {
//       alert("Failed to delete quiz.");
//     }
//   };

//   // Helper to get YouTube thumbnail (fallback if backend doesn't have it yet)
//   const getThumbnail = (videoId) =>
//     `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

//   if (isLoading) {
//     return (
//       <div
//         className="dashboard-container"
//         style={{ alignItems: "center", justifyContent: "center" }}
//       >
//         <h3>Loading your library...</h3>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-header">
//         <h1>My Learning Library</h1>
//         <button
//           onClick={onBackToHome}
//           className="btn-primary"
//           style={{
//             padding: "8px 16px",
//             borderRadius: "8px",
//             border: "none",
//             background: "var(--btn-primary)",
//             color: "#fff",
//             cursor: "pointer",
//           }}
//         >
//           ← Back to Workspace
//         </button>
//       </div>

//       <div className="dashboard-tabs">
//         <button
//           className={`tab-btn ${activeTab === "sessions" ? "active" : ""}`}
//           onClick={() => setActiveTab("sessions")}
//         >
//           Chat History
//         </button>
//         <button
//           className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
//           onClick={() => setActiveTab("notes")}
//         >
//           Saved Notes
//         </button>
//         <button
//           className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
//           onClick={() => setActiveTab("quizzes")}
//         >
//           Saved Quizzes
//         </button>
//       </div>

//       <div className="dashboard-grid">
//         {data[activeTab].length === 0 && (
//           <p style={{ color: "var(--text-muted)" }}>
//             No {activeTab} found. Start studying to build your library!
//           </p>
//         )}

//         {/* CHAT HISTORY TAB (Uses standard flat array map) */}
//         {activeTab === "sessions" &&
//           data.sessions.map((item) => (
//             <div key={item._id} className="data-card">
//               {/* Fallback to the ID if no actual title was saved on older chats */}
//               <div
//                 className="card-title"
//                 style={{ padding: "16px 16px 0 16px" }}
//               >
//                 {item.chat_name || item.video_id}
//               </div>
//               <div className="card-actions" style={{ padding: "16px" }}>
//                 <button
//                   onClick={() => onLoadSession(item._id, item.video_id)}
//                   style={{
//                     background: "var(--btn-primary)",
//                     color: "#fff",
//                     border: "none",
//                     padding: "6px 12px",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Continue Chat
//                 </button>
//                 <button
//                   onClick={() => handleDeleteChat(item._id)}
//                   className="btn-danger"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}

//         {/* NOTES & QUIZZES TABS (Uses the NEW nested array group map) */}
//         {(activeTab === "notes" || activeTab === "quizzes") &&
//           data[activeTab].map((videoGroup) => (
//             /* We map through the video_id groups first... */
//             <React.Fragment key={videoGroup.video_id}>
//               {/* ...then we map through the specific generated items inside that group */}
//               {videoGroup.items.map((item) => (
//                 <div key={item._id} className="data-card">
//                   {/* Use the new Youtube Thumbnail from the backend Metadata! */}
//                   <img
//                     src={`https://img.youtube.com/vi/${videoGroup.video_id}/mqdefault.jpg`}
//                     alt="Video Thumbnail"
//                     className="card-thumbnail"
//                   />

//                   <div className="card-content">
//                     {/* Bind the Library card title to the new display_name payload! */}
//                     <div className="card-title">{videoGroup.display_name}</div>
//                     <div className="card-meta">
//                       Created: {new Date(item.created_at).toLocaleDateString()}
//                     </div>

//                     <div className="card-actions">
//                       <button
//                         onClick={() => {
//                           setViewerData(item);
//                           setViewerType(activeTab);
//                         }}
//                         style={{
//                           background: "transparent",
//                           border: "1px solid var(--btn-primary)",
//                           color: "var(--btn-primary)",
//                           padding: "6px 12px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                           fontSize: "12px",
//                           fontWeight: "600",
//                         }}
//                       >
//                         View
//                       </button>
//                       <button
//                         className="btn-danger"
//                         onClick={() =>
//                           activeTab === "notes"
//                             ? handleDeleteNote(item._id)
//                             : handleDeleteQuiz(item._id)
//                         }
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </React.Fragment>
//           ))}
//       </div>
//       <ContentViewerModal
//         isOpen={!!viewerData}
//         onClose={() => setViewerData(null)}
//         data={viewerData}
//         type={viewerType}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { api } from "@tutor/api";
import ContentViewerModal from "./ContentViewerModal";

export default function Dashboard({
  onBackToHome,
  onLoadSession,
  refreshTrigger,
}) {
  const [activeTab, setActiveTab] = useState("sessions");
  const [data, setData] = useState({ sessions: [], notes: [], quizzes: [] });
  const [isLoading, setIsLoading] = useState(true);

  const [viewerData, setViewerData] = useState(null);
  const [viewerType, setViewerType] = useState(null);

  // Re-fetch data whenever the component loads OR whenever refreshTrigger changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sessionsRes, notesRes, quizzesRes] = await Promise.all([
          api.getChatSessions().catch(() => ({ data: [] })),
          api.getNotes().catch(() => ({ data: [] })),
          api.getQuizzes().catch(() => ({ data: [] })),
        ]);

        setData({
          sessions: sessionsRes.data || [],
          notes: notesRes.data || [],
          quizzes: quizzesRes.data || [],
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  // DELETE HANDLERS
  const handleDeleteChat = async (id) => {
    if (!window.confirm("Delete this chat permanently?")) return;
    try {
      await api.deleteChatSession(id);
      setData((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s._id !== id),
      }));
    } catch (err) {
      alert("Failed to delete chat.");
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      await api.deleteNote(id);
      setData((prev) => ({
        ...prev,
        notes: prev.notes
          .map((group) => ({
            ...group,
            items: group.items.filter((n) => n._id !== id),
          }))
          .filter((group) => group.items.length > 0), // Remove group entirely if empty
      }));
    } catch (err) {
      alert("Failed to delete note.");
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz permanently?")) return;
    try {
      await api.deleteQuiz(id);
      setData((prev) => ({
        ...prev,
        quizzes: prev.quizzes
          .map((group) => ({
            ...group,
            items: group.items.filter((q) => q._id !== id),
          }))
          .filter((group) => group.items.length > 0),
      }));
    } catch (err) {
      alert("Failed to delete quiz.");
    }
  };

  const getThumbnail = (videoId) =>
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  if (isLoading) {
    return (
      <div
        className="dashboard-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <h3>Loading your library...</h3>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Learning Library</h1>
        <button
          onClick={onBackToHome}
          className="btn-primary"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "var(--btn-primary)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ← Back to Workspace
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "sessions" ? "active" : ""}`}
          onClick={() => setActiveTab("sessions")}
        >
          Chat History
        </button>
        <button
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Saved Notes
        </button>
        <button
          className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
          onClick={() => setActiveTab("quizzes")}
        >
          Saved Quizzes
        </button>
      </div>

      <div className="dashboard-grid">
        {data[activeTab].length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            No {activeTab} found. Start studying to build your library!
          </p>
        )}

        {/* --- CHAT HISTORY TAB --- */}
        {activeTab === "sessions" &&
          data.sessions.map((item) => (
            <div key={item._id} className="data-card">
              {/* FIX: Added missing thumbnail here! */}
              <img
                src={getThumbnail(item.video_id)}
                alt="Video Thumbnail"
                className="card-thumbnail"
              />

              <div className="card-content">
                <div className="card-title">
                  {item.chat_name || item.video_id}
                </div>
                <div className="card-meta">
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </div>

                <div
                  className="card-actions"
                  style={{ marginTop: "auto", paddingTop: "12px" }}
                >
                  <button
                    onClick={() => onLoadSession(item._id, item.video_id)}
                    style={{
                      background: "var(--btn-primary)",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Continue Chat
                  </button>
                  {/* FIX: Added working delete handler! */}
                  <button
                    onClick={() => handleDeleteChat(item._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* --- NOTES & QUIZZES TABS (CLUBBED/GROUPED UI) --- */}
        {(activeTab === "notes" || activeTab === "quizzes") &&
          data[activeTab].map((videoGroup) => (
            <div key={videoGroup.video_id} className="data-card">
              <img
                src={getThumbnail(videoGroup.video_id)}
                alt="Video Thumbnail"
                className="card-thumbnail"
              />

              <div className="card-content">
                <div className="card-title" style={{ marginBottom: "4px" }}>
                  {videoGroup.display_name}
                </div>
                <div className="card-meta" style={{ marginBottom: "16px" }}>
                  {videoGroup.items.length} saved {activeTab}
                </div>

                {/* Render the items INSIDE the single card */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {videoGroup.items.map((item, idx) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "var(--bg-main)",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "500" }}>
                        {activeTab === "notes"
                          ? `Document ${idx + 1}`
                          : `Quiz ${idx + 1}`}
                      </span>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setViewerData(item);
                            setViewerType(activeTab);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--btn-primary)",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            activeTab === "notes"
                              ? handleDeleteNote(item._id)
                              : handleDeleteQuiz(item._id)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#dc3545",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      <ContentViewerModal
        isOpen={!!viewerData}
        onClose={() => setViewerData(null)}
        data={viewerData}
        type={viewerType}
      />
    </div>
  );
}
