// // packages/ui/ChatBubble.jsx
// import React from "react";
// import "./ChatBubble.css"; // Import standard CSS

// export const ChatBubble = ({ sender, text }) => {
//   const isAI = sender === "ai";

//   return (
//     <div className={`chat-message ${isAI ? "ai" : "user"}`}>
//       {isAI && <div className="avatar">AI</div>}
//       <div className="message-content">{text}</div>
//     </div>
//   );
// };

import React from "react";
import ReactMarkdown from "react-markdown";

export function ChatBubble({ sender, text }) {
  const isAI = sender === "ai";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAI ? "flex-start" : "flex-end",
        width: "100%",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: isAI ? "var(--bg-surface)" : "var(--bg-input)",
          color: "var(--text-main)",
          border: `1px solid ${isAI ? "transparent" : "var(--border-main)"}`,
          boxShadow: isAI ? "none" : "0 2px 4px rgba(0,0,0,0.02)",
          fontSize: "15px",
          lineHeight: "1.6",
          // CRITICAL: whiteSpace pre-wrap ensures standard newlines work for user messages
          whiteSpace: isAI ? "normal" : "pre-wrap",
        }}
      >
        {isAI ? (
          /* Render AI responses properly with Markdown styling */
          <div className="markdown-body">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          /* Render User messages as plain text */
          text
        )}
      </div>
    </div>
  );
}
